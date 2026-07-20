import * as path from 'path';
import * as fs from 'fs-extra';
import { createHash, timingSafeEqual } from 'crypto';

import {
    CreateScriptInput, DeleteScriptInput, EditorMessageClient, ReadScriptInput,
    ScriptCreateResult, ScriptDeleteResult, ScriptFileMeta, ScriptReadResult, ScriptTemplate,
} from '../types';
import { McpError } from './error-normalizer';
import { ProjectPathSandbox } from './project-path-sandbox';

const DEFAULT_MAX_SCRIPT_BYTES = 1024 * 1024; // 1 MiB
const SHA_PREFIX = 'sha256:';
const MAX_CLASS_NAME_LENGTH = 128;

export interface ScriptFileServiceOptions {
    maxScriptBytes?: number;
}

export class ScriptFileService {
    private readonly maxScriptBytes: number;

    constructor(
        private readonly messages: EditorMessageClient,
        private readonly paths: ProjectPathSandbox,
        options: ScriptFileServiceOptions = {},
    ) {
        this.maxScriptBytes = options.maxScriptBytes ?? DEFAULT_MAX_SCRIPT_BYTES;
    }

    /** Read raw bytes, stream-hash them, and return file metadata + SHA-256. */
    async getSha(pathInput: string): Promise<ScriptFileMeta> {
        const target = await this.paths.resolveScriptPath(pathInput, 'existing');
        const stat = await fs.stat(target.fsPath);
        assertRegularFile(stat, target.url);
        assertSize(stat.size, this.maxScriptBytes, target.url);

        const sha = await sha256File(target.fsPath);
        return { path: target.url, sha, size: stat.size, mtime: stat.mtime.toISOString() };
    }

    /** Read a script, optionally a line range. SHA is always computed over the full file. */
    async read(input: ReadScriptInput): Promise<ScriptReadResult> {
        const startLine = Math.max(1, Math.floor(input.startLine ?? 1));
        const lineCount = Math.max(1, Math.floor(input.lineCount ?? 200));

        const target = await this.paths.resolveScriptPath(input.path, 'existing');
        const stat = await fs.stat(target.fsPath);
        assertRegularFile(stat, target.url);
        assertSize(stat.size, this.maxScriptBytes, target.url);

        const buffer = await fs.readFile(target.fsPath);
        const sha = `sha256:${createHash('sha256').update(buffer).digest('hex')}`;

        const { text, bom, eol } = decodeUtf8(buffer);
        const lines = text.split(/\r?\n/);
        const totalLines = lines.length;

        const startIndex = startLine - 1;
        const slice = lines.slice(startIndex, startIndex + lineCount);
        const content = slice.join(eol === 'crlf' ? '\r\n' : '\n');
        const truncated = startIndex + slice.length < totalLines;

        return {
            path: target.url,
            content,
            sha,
            size: stat.size,
            mtime: stat.mtime.toISOString(),
            encoding: 'utf8',
            eol,
            bom,
            totalLines,
            startLine,
            returnedLines: slice.length,
            truncated,
        };
    }

    /** Create a new script file via asset-db. Never overwrites. */
    async create(input: CreateScriptInput): Promise<ScriptCreateResult> {
        const hasContent = typeof input.content === 'string' && input.content.length > 0;
        const hasTemplate = input.template !== undefined;
        if (!hasContent && !hasTemplate) {
            throw new McpError('INVALID_ARGUMENT', 'Either "content" or "template" must be provided');
        }

        const target = await this.paths.resolveScriptPath(input.path, 'create');
        if (await fs.pathExists(target.fsPath)) {
            throw new McpError('ALREADY_EXISTS', `Script already exists: ${target.url}`, {
                details: { path: target.url },
            });
        }

        let content: string;
        let warning: string | undefined;
        if (hasContent) {
            content = input.content!;
            if (hasTemplate) {
                warning = 'Both "content" and "template" were provided; using "content" and ignoring "template".';
            }
        } else {
            assertValidClassName(input.className);
            content = renderScriptTemplate(input.template!, input.className!);
        }

        assertUtf8ByteLimit(content, this.maxScriptBytes);

        const created = await this.messages.invokeCapability<any>('asset.create', {
            url: target.url,
            content,
        });
        await this.messages.invokeCapability('asset.refresh', { url: target.url });

        const meta = await this.waitForReadableMeta(target.url);
        const uuid = extractUuid(created);

        const result: ScriptCreateResult = {
            ...meta,
            uuid,
            created: true,
            refreshRequested: true,
        };
        if (warning) {
            (result as any).warning = warning;
        }
        return result;
    }

    /** Delete a script. Requires expectedSha unless force=true. */
    async delete(input: DeleteScriptInput): Promise<ScriptDeleteResult> {
        // Resolve path first so we have fsPath for post-delete verification
        const target = await this.paths.resolveScriptPath(input.path, 'existing');
        const before = await this.getSha(input.path);

        if (!input.force && !input.expectedSha) {
            throw new McpError('INVALID_ARGUMENT', '"expectedSha" is required unless "force" is true');
        }

        if (!input.force && input.expectedSha && !shaEqual(before.sha, input.expectedSha)) {
            throw new McpError('CONFLICT', 'Script changed since it was read', {
                details: { path: before.path, expectedSha: input.expectedSha, actualSha: before.sha },
            });
        }

        await this.messages.invokeCapability('asset.delete', { url: before.path });

        // Verify the file is actually gone
        if (await fs.pathExists(target.fsPath)) {
            throw new McpError('INTERNAL_ERROR', `Asset-db reported success but file still exists: ${before.path}`, {
                details: { path: before.path, suggestion: 'Refresh the asset database and retry.' },
            });
        }

        return { path: before.path, deleted: true, previousSha: before.sha };
    }

    /** Poll until a freshly created file is readable, then return its meta. */
    private async waitForReadableMeta(url: string): Promise<ScriptFileMeta> {
        const attempts = 20;
        const delayMs = 50;
        for (let i = 0; i < attempts; i++) {
            try {
                return await this.getSha(url);
            } catch (error) {
                if (error instanceof McpError && (error.structured.code === 'FILE_TOO_LARGE')) throw error;
                // file not ready yet — wait and retry
                await sleep(delayMs);
            }
        }
        throw new McpError('INTERNAL_ERROR', `Created script was not readable after refresh: ${url}`, {
            details: { path: url, suggestion: 'Refresh the asset database.' },
        });
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function assertRegularFile(stat: fs.Stats, url: string): void {
    if (!stat.isFile()) {
        throw new McpError('NOT_FOUND', `Script is not a regular file: ${url}`);
    }
}

function assertSize(size: number, max: number, url: string): void {
    if (size > max) {
        throw new McpError('FILE_TOO_LARGE', `Script ${url} is ${size} bytes, exceeds limit of ${max} bytes`, {
            details: { size, limit: max },
        });
    }
}

function assertUtf8ByteLimit(content: string, max: number): void {
    const bytes = Buffer.byteLength(content, 'utf8');
    if (bytes > max) {
        throw new McpError('FILE_TOO_LARGE', `Script content is ${bytes} bytes, exceeds limit of ${max} bytes`, {
            details: { size: bytes, limit: max },
        });
    }
}

function assertValidClassName(className: string | undefined): void {
    if (typeof className !== 'string' || className.length === 0) {
        throw new McpError('INVALID_ARGUMENT', 'A className is required when using a template');
    }
    if (className.length > MAX_CLASS_NAME_LENGTH) {
        throw new McpError('INVALID_ARGUMENT', `className is too long (max ${MAX_CLASS_NAME_LENGTH} characters)`);
    }
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(className)) {
        throw new McpError('INVALID_ARGUMENT', `className "${className}" is not a valid TypeScript identifier`);
    }
}

async function sha256File(fsPath: string): Promise<string> {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(fsPath);
    try {
        for await (const chunk of stream) {
            hash.update(chunk as Buffer);
        }
    } finally {
        stream.destroy();
    }
    return `${SHA_PREFIX}${hash.digest('hex')}`;
}

function decodeUtf8(buffer: Buffer): { text: string; bom: boolean; eol: 'lf' | 'crlf' } {
    let working = buffer;
    let bom = false;
    if (working.length >= 3 && working[0] === 0xef && working[1] === 0xbb && working[2] === 0xbf) {
        working = working.subarray(3);
        bom = true;
    }
    try {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        const text = decoder.decode(working);
        const eol: 'lf' | 'crlf' = text.includes('\r\n') ? 'crlf' : 'lf';
        return { text, bom, eol };
    } catch {
        throw new McpError('INVALID_ARGUMENT', 'Script content is not valid UTF-8');
    }
}

function shaEqual(a: string, b: string): boolean {
    if (!a.startsWith(SHA_PREFIX) || !b.startsWith(SHA_PREFIX)) return false;
    const ha = Buffer.from(a.slice(SHA_PREFIX.length), 'hex');
    const hb = Buffer.from(b.slice(SHA_PREFIX.length), 'hex');
    if (ha.length !== hb.length || ha.length === 0) return false;
    return timingSafeEqual(ha, hb);
}

function extractUuid(created: any): string | null {
    if (!created) return null;
    if (typeof created === 'string') return created || null;
    return created.uuid ?? created.id ?? null;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Templates ───────────────────────────────────────────────────────────────

export function renderScriptTemplate(template: ScriptTemplate, className: string): string {
    switch (template) {
        case 'component':
            return [
                `import { _decorator, Component } from 'cc';`,
                `const { ccclass, property } = _decorator;`,
                ``,
                `@ccclass('${className}')`,
                `export class ${className} extends Component {`,
                `}`,
                ``,
            ].join('\n');
        case 'data-model':
            return [
                `/**`,
                ` * ${className} data model.`,
                ` */`,
                `export interface ${className} {`,
                `}`,
                ``,
            ].join('\n');
        case 'module':
            return [
                `/**`,
                ` * ${className} module.`,
                ` */`,
                `export const ${className} = {`,
                `};`,
                ``,
            ].join('\n');
        default:
            throw new McpError('INVALID_ARGUMENT', `Unknown template: ${template as string}`);
    }
}
