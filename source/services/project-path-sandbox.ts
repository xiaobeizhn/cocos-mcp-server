import * as path from 'path';
import * as fs from 'fs-extra';
import { EditorMessageClient, ResolvedProjectPath } from '../types';
import { McpError } from './error-normalizer';

const ALLOWED_SCRIPT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/**
 * Sandbox for resolving and validating script paths inside the project `assets/` root.
 *
 * All public script paths use the `db://assets/...` URL format. This class:
 * - normalises `assets/...` shorthand to `db://assets/...`
 * - rejects traversal, absolute paths, UNC paths, drive letters, and URL-encoded escapes
 * - resolves `db://` URLs to real filesystem paths via the editor message client
 * - verifies the resolved path is contained within the real `assets/` root
 * - for create targets, validates the nearest existing parent to prevent junction/symlink escapes
 */
export class ProjectPathSandbox {
    constructor(
        private readonly messages: EditorMessageClient,
        private readonly projectPath: string = (globalThis as any).Editor?.Project?.path ?? '',
    ) {}

    /**
     * Resolve a script path to a verified filesystem location.
     *
     * @param input  User-supplied path: `db://assets/...`, `assets/...`, or bare relative.
     * @param mode   `'existing'` — the file must already exist (read/sha/delete).
     *               `'create'`   — the file may not exist yet; we validate the parent instead.
     */
    async resolveScriptPath(input: string, mode: 'existing' | 'create'): Promise<ResolvedProjectPath> {
        const url = normalizeToDbAssetsUrl(input);
        assertAllowedScriptExtension(url);
        assertNoTraversal(url);

        const assetsRoot = await fs.realpath(this.assetsDir);

        if (mode === 'existing') {
            const candidate = await this.urlToFsPath(url);
            let real: string;
            try {
                real = await fs.realpath(candidate);
            } catch (error) {
                if (isENOENT(error)) {
                    throw new McpError('NOT_FOUND', `Script does not exist: ${url}`, { details: { path: url } });
                }
                throw error;
            }
            assertContained(real, assetsRoot);
            return { url, fsPath: real, assetsRoot };
        }

        // create mode: file may not exist yet — validate nearest existing parent
        const candidate = await this.urlToFsPath(url);
        const parentDir = path.dirname(candidate);
        const existingParent = await findNearestExistingParent(parentDir);
        const realParent = await fs.realpath(existingParent);
        assertContained(realParent, assetsRoot);
        // Also verify the resolved candidate itself would not escape
        assertContained(path.resolve(candidate), assetsRoot);
        return { url, fsPath: path.resolve(candidate), assetsRoot };
    }

    /**
     * Resolve a relative path (from fast-glob output) under `assets/` to a real
     * filesystem path, verifying containment. Used by code search.
     */
    async resolveSearchPath(relativePath: string): Promise<ResolvedProjectPath> {
        const assetsRoot = await fs.realpath(this.assetsDir);
        const candidate = path.resolve(assetsRoot, relativePath);
        // For search we only read existing files; missing ones are silently skipped
        let real: string;
        try {
            real = await fs.realpath(candidate);
        } catch {
            throw new McpError('NOT_FOUND', `File not found: ${relativePath}`);
        }
        assertContained(real, assetsRoot);
        const url = 'db://assets/' + pathToRelativeAssets(real, assetsRoot);
        return { url, fsPath: real, assetsRoot };
    }

    /** The project `assets/` directory (not yet realpath-resolved). */
    get assetsDir(): string {
        return path.join(this.projectPath, 'assets');
    }

    private async urlToFsPath(url: string): Promise<string> {
        try {
            const result = await this.messages.invokeCapability<string | null>('asset.urlToFspath', { url });
            if (typeof result === 'string' && result.length > 0) return result;
        } catch {
            // fallback: manual resolution
        }
        // Manual fallback: strip db:// and join with project path
        const relative = url.replace(/^db:\/\//, '');
        return path.resolve(this.projectPath, relative);
    }
}

// ─── Path normalisation ──────────────────────────────────────────────────────

/**
 * Normalise user input to a `db://assets/...` URL.
 * Accepts `db://assets/...`, `assets/...`, or bare paths under assets.
 */
export function normalizeToDbAssetsUrl(input: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
        throw new McpError('INVALID_ARGUMENT', 'Path must be a non-empty string');
    }

    // Decode percent-encoded characters before checking for traversal
    let decoded: string;
    try {
        decoded = decodeURIComponent(input);
    } catch {
        throw new McpError('INVALID_ARGUMENT', 'Path contains invalid percent-encoding');
    }

    // Reject absolute paths, UNC paths, drive letters
    if (/^[A-Za-z]:/.test(decoded) || /^\/\//.test(decoded) || /^\\\\/.test(decoded)) {
        throw new McpError('PATH_OUTSIDE_PROJECT', 'Absolute paths and UNC paths are not allowed');
    }

    // Normalise backslashes to forward slashes
    const normalised = decoded.replace(/\\/g, '/');

    // Reject traversal segments before any prefixing
    for (const seg of normalised.split('/')) {
        if (seg === '..') {
            throw new McpError('PATH_OUTSIDE_PROJECT', 'Path traversal (..) is not allowed');
        }
    }

    // Strip db:// prefix if present
    let relative = normalised;
    if (relative.startsWith('db://')) {
        relative = relative.slice('db://'.length);
    }

    // Must start with assets/
    if (!relative.startsWith('assets/')) {
        // Allow bare paths like "scripts/Foo.ts" → "assets/scripts/Foo.ts"
        if (!relative.includes(':') && !relative.startsWith('/')) {
            relative = 'assets/' + relative;
        } else {
            throw new McpError('PATH_OUTSIDE_PROJECT', `Path must be under db://assets/: ${input}`);
        }
    }

    return 'db://' + relative;
}

/**
 * Assert the path has an allowed script extension (.ts, .tsx, .js, .jsx).
 */
export function assertAllowedScriptExtension(url: string): void {
    const ext = path.extname(url).toLowerCase();
    if (!ALLOWED_SCRIPT_EXTENSIONS.has(ext)) {
        throw new McpError('INVALID_ARGUMENT', `Script extension "${ext}" is not allowed. Allowed: ${[...ALLOWED_SCRIPT_EXTENSIONS].join(', ')}`);
    }
}

/**
 * Reject traversal patterns (`..` segments) in the already-decoded URL.
 * This is a secondary check — normalizeToDbAssetsUrl already rejects `..` during
 * normalisation, but we keep this guard for any code path that bypasses it.
 */
export function assertNoTraversal(url: string): void {
    const stripped = url.replace(/^db:\/\//, '');
    if (stripped.split('/').includes('..')) {
        throw new McpError('PATH_OUTSIDE_PROJECT', 'Path traversal (..) is not allowed');
    }
}

/**
 * Assert that `candidate` is contained within `root` using `path.relative`.
 * This avoids the `startsWith` pitfall (e.g. `assets2` matching `assets`).
 *
 * On Windows (case-insensitive FS), we normalise both paths to lower case.
 * On POSIX we compare as-is.
 */
export function assertContained(candidate: string, root: string): void {
    const rel = path.relative(root, candidate);
    // If relative path starts with '..' or is absolute, candidate is outside root
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
        throw new McpError('PATH_OUTSIDE_PROJECT', `Path escapes the project assets directory: ${candidate}`);
    }
    // On Windows, also check case-insensitively
    if (process.platform === 'win32') {
        const relLower = path.relative(root.toLowerCase(), candidate.toLowerCase());
        if (relLower.startsWith('..') || path.isAbsolute(relLower)) {
            throw new McpError('PATH_OUTSIDE_PROJECT', `Path escapes the project assets directory: ${candidate}`);
        }
    }
}

/**
 * Walk upward from `dir` to find the nearest directory that exists on disk.
 */
async function findNearestExistingParent(dir: string): Promise<string> {
    let current = dir;
    const root = path.parse(current).root;
    while (current !== root) {
        try {
            const stat = await fs.stat(current);
            if (stat.isDirectory()) return current;
        } catch {
            // doesn't exist, walk up
        }
        const parent = path.dirname(current);
        if (parent === current) break; // reached root
        current = parent;
    }
    throw new McpError('PATH_OUTSIDE_PROJECT', `No existing parent directory found for: ${dir}`);
}

function isENOENT(error: unknown): boolean {
    return !!error && typeof error === 'object' && (error as any)?.code === 'ENOENT';
}

/**
 * Convert an absolute filesystem path to a relative path under assets root,
 * using forward slashes (for db:// URL construction).
 */
function pathToRelativeAssets(fsPath: string, assetsRoot: string): string {
    const rel = path.relative(assetsRoot, fsPath);
    return rel.replace(/\\/g, '/');
}
