import * as fs from 'fs-extra';
import { createHash } from 'crypto';
import fg from 'fast-glob';

import { CodeSearchInput, CodeSearchMatch, CodeSearchPage } from '../types';
import { McpError } from './error-normalizer';
import { ProjectPathSandbox } from './project-path-sandbox';

const DEFAULT_MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MiB
const DEFAULT_MAX_RESULTS = 100;
const HARD_MAX_RESULTS = 1000;
const DEFAULT_MAX_PER_FILE = 20;
const DEFAULT_CONTEXT = 2;
const MAX_PATTERN_LENGTH = 200;
const BINARY_CHECK_BYTES = 8192;
const MAX_MATCHES_PER_LINE = 1000;
const CURSOR_VERSION = 1;

const DEFAULT_INCLUDE = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.json', '**/*.md'];
const DEFAULT_EXCLUDE = ['library/**', 'temp/**', 'build/**', 'node_modules/**', 'dist/**', '.git/**'];

export interface CodeSearchServiceOptions {
    maxFileBytes?: number;
}

interface NormalizedSearch {
    query: string;
    regex: boolean;
    caseSensitive: boolean;
    include: string[];
    exclude: string[];
    contextBefore: number;
    contextAfter: number;
    maxResults: number;
    maxResultsPerFile: number;
}

interface CursorState {
    v: number;
    fp: string;
    fi: number;
    mi: number;
}

export class CodeSearchService {
    private readonly maxFileBytes: number;

    constructor(
        private readonly paths: ProjectPathSandbox,
        options: CodeSearchServiceOptions = {},
    ) {
        this.maxFileBytes = options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
    }

    async search(input: CodeSearchInput): Promise<CodeSearchPage> {
        const normalized = this.normalizeInput(input);
        const fingerprint = this.fingerprint(normalized);

        const cursor = decodeCursor(input.cursor);
        if (cursor && cursor.fp !== fingerprint) {
            throw new McpError('INVALID_ARGUMENT', 'Cursor belongs to a different query');
        }

        const warnings: string[] = [];
        const files = await fg(normalized.include, {
            cwd: this.paths.assetsDir,
            ignore: normalized.exclude,
            onlyFiles: true,
            followSymbolicLinks: false,
            unique: true,
            dot: false,
            absolute: false,
        });
        files.sort(comparePortablePath);

        const matches: CodeSearchMatch[] = [];
        let scannedFiles = 0;
        let skippedFiles = 0;
        let truncated = false;
        let nextCursor: CursorState | null = null;

        const startIndex = cursor?.fi ?? 0;
        const startSkip = cursor?.mi ?? 0;

        for (let fileIndex = startIndex; fileIndex < files.length; fileIndex++) {
            // If the page is already full from previous files, point the cursor at this
            // fresh file (mi: 0) and stop. Never advance past a partially-emitted file.
            if (matches.length >= normalized.maxResults) {
                truncated = true;
                if (!nextCursor) {
                    nextCursor = { v: CURSOR_VERSION, fp: fingerprint, fi: fileIndex, mi: 0 };
                }
                break;
            }

            const relativePath = files[fileIndex];
            const scanResult = await this.scanFile(relativePath, normalized, warnings);
            scannedFiles += scanResult.scanned ? 1 : 0;
            if (!scanResult.scanned) {
                skippedFiles += 1;
                continue;
            }

            // Apply the within-file skip on the boundary (resume) file.
            let fileMatches = scanResult.matches;
            if (fileIndex === startIndex && startSkip > 0) {
                fileMatches = fileMatches.slice(startSkip);
            }

            for (const match of fileMatches) {
                if (matches.length >= normalized.maxResults) {
                    truncated = true;
                    const emittedFromCurrent = countEmittedForFile(matches, relativePath);
                    nextCursor = { v: CURSOR_VERSION, fp: fingerprint, fi: fileIndex, mi: emittedFromCurrent };
                    break;
                }
                matches.push(match);
            }

            // If we filled the page mid-file, stop without advancing to the next file.
            if (nextCursor && matches.length >= normalized.maxResults) break;
        }

        return {
            query: normalized.query,
            matches,
            scannedFiles,
            skippedFiles,
            truncated,
            nextCursor: nextCursor ? encodeCursor(nextCursor) : null,
            warnings,
        };
    }

    private normalizeInput(input: CodeSearchInput): NormalizedSearch {
        if (typeof input.query !== 'string' || input.query.length === 0) {
            throw new McpError('INVALID_ARGUMENT', '"query" must be a non-empty string');
        }
        if (input.query.length > MAX_PATTERN_LENGTH) {
            throw new McpError('INVALID_ARGUMENT', `"query" exceeds the maximum pattern length of ${MAX_PATTERN_LENGTH}`);
        }

        const include = Array.isArray(input.include) && input.include.length > 0
            ? input.include.filter(s => typeof s === 'string' && s.length > 0)
            : [...DEFAULT_INCLUDE];

        const exclude = [...DEFAULT_EXCLUDE];
        if (Array.isArray(input.exclude)) {
            for (const e of input.exclude) {
                if (typeof e === 'string' && e.length > 0 && !exclude.includes(e)) exclude.push(e);
            }
        }

        const maxResults = clampInt(input.maxResults, 1, HARD_MAX_RESULTS, DEFAULT_MAX_RESULTS);
        const maxResultsPerFile = clampInt(input.maxResultsPerFile, 1, HARD_MAX_RESULTS, DEFAULT_MAX_PER_FILE);

        return {
            query: input.query,
            regex: input.regex === true,
            caseSensitive: input.caseSensitive !== false,
            include,
            exclude,
            contextBefore: clampInt(input.contextBefore, 0, 50, DEFAULT_CONTEXT),
            contextAfter: clampInt(input.contextAfter, 0, 50, DEFAULT_CONTEXT),
            maxResults,
            maxResultsPerFile,
        };
    }

    private fingerprint(n: NormalizedSearch): string {
        // Stable fingerprint over everything except the cursor.
        const stable = JSON.stringify({
            q: n.query,
            r: n.regex,
            c: n.caseSensitive,
            i: n.include,
            e: n.exclude,
            cb: n.contextBefore,
            ca: n.contextAfter,
            mr: n.maxResults,
            mf: n.maxResultsPerFile,
        });
        return createHash('sha256').update(stable).digest('hex');
    }

    private async scanFile(
        relativePath: string,
        n: NormalizedSearch,
        warnings: string[],
    ): Promise<{ scanned: boolean; matches: CodeSearchMatch[] }> {
        let resolved;
        try {
            resolved = await this.paths.resolveSearchPath(relativePath);
        } catch {
            return { scanned: false, matches: [] };
        }

        let stat;
        try {
            stat = await fs.stat(resolved.fsPath);
        } catch {
            return { scanned: false, matches: [] };
        }
        if (!stat.isFile()) return { scanned: false, matches: [] };
        if (stat.size > this.maxFileBytes) {
            warnings.push(`Skipped ${resolved.url}: file exceeds the ${this.maxFileBytes} byte limit.`);
            return { scanned: false, matches: [] };
        }

        const buffer = await fs.readFile(resolved.fsPath);
        if (containsBinary(buffer)) {
            warnings.push(`Skipped ${resolved.url}: appears to be a binary file.`);
            return { scanned: false, matches: [] };
        }

        let text: string;
        try {
            text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        } catch {
            warnings.push(`Skipped ${resolved.url}: not valid UTF-8.`);
            return { scanned: false, matches: [] };
        }

        const matcher = createMatcher(n);
        const lines = text.split(/\r?\n/);
        const matches: CodeSearchMatch[] = [];

        for (let i = 0; i < lines.length; i++) {
            if (matches.length >= n.maxResultsPerFile) break;
            const lineText = lines[i];
            const hits = matcher(lineText);
            for (const hit of hits) {
                if (matches.length >= n.maxResultsPerFile) break;
                matches.push(buildMatch(resolved.url, i + 1, hit.column, hit.text, lineText, lines, n));
            }
        }
        return { scanned: true, matches };
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMatcher(n: NormalizedSearch): (line: string) => Array<{ column: number; text: string }> {
    if (n.regex) {
        let re: RegExp;
        try {
            re = new RegExp(n.query, 'g' + (n.caseSensitive ? '' : 'i'));
        } catch {
            throw new McpError('INVALID_ARGUMENT', `Invalid regular expression: ${n.query}`);
        }
        return (line: string) => {
            const results: Array<{ column: number; text: string }> = [];
            re.lastIndex = 0;
            let m: RegExpExecArray | null;
            let guard = 0;
            while ((m = re.exec(line)) !== null) {
                const text = m[0];
                if (text.length === 0) {
                    re.lastIndex++;
                    continue;
                }
                results.push({ column: m.index + 1, text });
                if (++guard >= MAX_MATCHES_PER_LINE) break;
            }
            return results;
        };
    }

    const needleRaw = n.query;
    return (line: string) => {
        const results: Array<{ column: number; text: string }> = [];
        const hay = n.caseSensitive ? line : line.toLowerCase();
        const needle = n.caseSensitive ? needleRaw : needleRaw.toLowerCase();
        if (needle.length === 0) return results;
        let from = 0;
        while (results.length < MAX_MATCHES_PER_LINE) {
            const idx = hay.indexOf(needle, from);
            if (idx === -1) break;
            results.push({ column: idx + 1, text: line.substr(idx, needleRaw.length) });
            from = idx + needle.length;
        }
        return results;
    };
}

function buildMatch(
    url: string,
    lineNo: number,
    column: number,
    matchText: string,
    lineText: string,
    lines: string[],
    n: NormalizedSearch,
): CodeSearchMatch {
    const before: Array<{ line: number; text: string }> = [];
    for (let b = n.contextBefore; b > 0; b--) {
        const li = lineNo - 1 - b;
        if (li >= 0) before.push({ line: li + 1, text: lines[li] });
    }
    const after: Array<{ line: number; text: string }> = [];
    for (let a = 1; a <= n.contextAfter; a++) {
        const li = lineNo - 1 + a;
        if (li < lines.length) after.push({ line: li + 1, text: lines[li] });
    }
    return { path: url, line: lineNo, column, match: matchText, lineText, before, after };
}

function containsBinary(buffer: Buffer): boolean {
    const check = buffer.subarray(0, Math.min(buffer.length, BINARY_CHECK_BYTES));
    for (let i = 0; i < check.length; i++) {
        if (check[i] === 0) return true;
    }
    return false;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
    const n = Math.floor(value);
    if (n < min) return min;
    if (n > max) return max;
    return n;
}

function comparePortablePath(a: string, b: string): number {
    const na = a.replace(/\\/g, '/');
    const nb = b.replace(/\\/g, '/');
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
}

function countEmittedForFile(matches: CodeSearchMatch[], relativePath: string): number {
    // Count how many emitted matches belong to the given relative path.
    const prefix = 'db://assets/';
    // matches use normalised db:// urls; relativePath is relative to assets.
    const targetUrl = prefix + relativePath.replace(/\\/g, '/');
    let count = 0;
    for (const m of matches) {
        if (m.path === targetUrl) count++;
    }
    return count;
}

function encodeCursor(state: CursorState): string {
    return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
}

function decodeCursor(input: string | null | undefined): CursorState | null {
    if (input == null || input === '') return null;
    try {
        const json = Buffer.from(input as string, 'base64url').toString('utf8');
        const obj = JSON.parse(json);
        if (obj && typeof obj === 'object' && obj.v === CURSOR_VERSION
            && typeof obj.fp === 'string' && typeof obj.fi === 'number' && typeof obj.mi === 'number') {
            return { v: obj.v, fp: obj.fp, fi: obj.fi, mi: obj.mi };
        }
        throw new McpError('INVALID_ARGUMENT', 'Malformed cursor');
    } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError('INVALID_ARGUMENT', 'Malformed cursor');
    }
}
