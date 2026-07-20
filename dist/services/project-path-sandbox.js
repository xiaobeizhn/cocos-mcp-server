"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectPathSandbox = void 0;
exports.normalizeToDbAssetsUrl = normalizeToDbAssetsUrl;
exports.assertAllowedScriptExtension = assertAllowedScriptExtension;
exports.assertNoTraversal = assertNoTraversal;
exports.assertContained = assertContained;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const error_normalizer_1 = require("./error-normalizer");
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
class ProjectPathSandbox {
    constructor(messages, projectPath) {
        var _a, _b, _c;
        if (projectPath === void 0) { projectPath = (_c = (_b = (_a = globalThis.Editor) === null || _a === void 0 ? void 0 : _a.Project) === null || _b === void 0 ? void 0 : _b.path) !== null && _c !== void 0 ? _c : ''; }
        this.messages = messages;
        this.projectPath = projectPath;
    }
    /**
     * Resolve a script path to a verified filesystem location.
     *
     * @param input  User-supplied path: `db://assets/...`, `assets/...`, or bare relative.
     * @param mode   `'existing'` — the file must already exist (read/sha/delete).
     *               `'create'`   — the file may not exist yet; we validate the parent instead.
     */
    async resolveScriptPath(input, mode) {
        const url = normalizeToDbAssetsUrl(input);
        assertAllowedScriptExtension(url);
        assertNoTraversal(url);
        const assetsRoot = await fs.realpath(this.assetsDir);
        if (mode === 'existing') {
            const candidate = await this.urlToFsPath(url);
            let real;
            try {
                real = await fs.realpath(candidate);
            }
            catch (error) {
                if (isENOENT(error)) {
                    throw new error_normalizer_1.McpError('NOT_FOUND', `Script does not exist: ${url}`, { details: { path: url } });
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
    async resolveSearchPath(relativePath) {
        const assetsRoot = await fs.realpath(this.assetsDir);
        const candidate = path.resolve(assetsRoot, relativePath);
        // For search we only read existing files; missing ones are silently skipped
        let real;
        try {
            real = await fs.realpath(candidate);
        }
        catch (_a) {
            throw new error_normalizer_1.McpError('NOT_FOUND', `File not found: ${relativePath}`);
        }
        assertContained(real, assetsRoot);
        const url = 'db://assets/' + pathToRelativeAssets(real, assetsRoot);
        return { url, fsPath: real, assetsRoot };
    }
    /** The project `assets/` directory (not yet realpath-resolved). */
    get assetsDir() {
        return path.join(this.projectPath, 'assets');
    }
    async urlToFsPath(url) {
        try {
            const result = await this.messages.invokeCapability('asset.urlToFspath', { url });
            if (typeof result === 'string' && result.length > 0)
                return result;
        }
        catch (_a) {
            // fallback: manual resolution
        }
        // Manual fallback: strip db:// and join with project path
        const relative = url.replace(/^db:\/\//, '');
        return path.resolve(this.projectPath, relative);
    }
}
exports.ProjectPathSandbox = ProjectPathSandbox;
// ─── Path normalisation ──────────────────────────────────────────────────────
/**
 * Normalise user input to a `db://assets/...` URL.
 * Accepts `db://assets/...`, `assets/...`, or bare paths under assets.
 */
function normalizeToDbAssetsUrl(input) {
    if (typeof input !== 'string' || input.trim().length === 0) {
        throw new error_normalizer_1.McpError('INVALID_ARGUMENT', 'Path must be a non-empty string');
    }
    // Decode percent-encoded characters before checking for traversal
    let decoded;
    try {
        decoded = decodeURIComponent(input);
    }
    catch (_a) {
        throw new error_normalizer_1.McpError('INVALID_ARGUMENT', 'Path contains invalid percent-encoding');
    }
    // Reject absolute paths, UNC paths, drive letters
    if (/^[A-Za-z]:/.test(decoded) || /^\/\//.test(decoded) || /^\\\\/.test(decoded)) {
        throw new error_normalizer_1.McpError('PATH_OUTSIDE_PROJECT', 'Absolute paths and UNC paths are not allowed');
    }
    // Normalise backslashes to forward slashes
    const normalised = decoded.replace(/\\/g, '/');
    // Reject traversal segments before any prefixing
    for (const seg of normalised.split('/')) {
        if (seg === '..') {
            throw new error_normalizer_1.McpError('PATH_OUTSIDE_PROJECT', 'Path traversal (..) is not allowed');
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
        }
        else {
            throw new error_normalizer_1.McpError('PATH_OUTSIDE_PROJECT', `Path must be under db://assets/: ${input}`);
        }
    }
    return 'db://' + relative;
}
/**
 * Assert the path has an allowed script extension (.ts, .tsx, .js, .jsx).
 */
function assertAllowedScriptExtension(url) {
    const ext = path.extname(url).toLowerCase();
    if (!ALLOWED_SCRIPT_EXTENSIONS.has(ext)) {
        throw new error_normalizer_1.McpError('INVALID_ARGUMENT', `Script extension "${ext}" is not allowed. Allowed: ${[...ALLOWED_SCRIPT_EXTENSIONS].join(', ')}`);
    }
}
/**
 * Reject traversal patterns (`..` segments) in the already-decoded URL.
 * This is a secondary check — normalizeToDbAssetsUrl already rejects `..` during
 * normalisation, but we keep this guard for any code path that bypasses it.
 */
function assertNoTraversal(url) {
    const stripped = url.replace(/^db:\/\//, '');
    if (stripped.split('/').includes('..')) {
        throw new error_normalizer_1.McpError('PATH_OUTSIDE_PROJECT', 'Path traversal (..) is not allowed');
    }
}
/**
 * Assert that `candidate` is contained within `root` using `path.relative`.
 * This avoids the `startsWith` pitfall (e.g. `assets2` matching `assets`).
 *
 * On Windows (case-insensitive FS), we normalise both paths to lower case.
 * On POSIX we compare as-is.
 */
function assertContained(candidate, root) {
    const rel = path.relative(root, candidate);
    // If relative path starts with '..' or is absolute, candidate is outside root
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
        throw new error_normalizer_1.McpError('PATH_OUTSIDE_PROJECT', `Path escapes the project assets directory: ${candidate}`);
    }
    // On Windows, also check case-insensitively
    if (process.platform === 'win32') {
        const relLower = path.relative(root.toLowerCase(), candidate.toLowerCase());
        if (relLower.startsWith('..') || path.isAbsolute(relLower)) {
            throw new error_normalizer_1.McpError('PATH_OUTSIDE_PROJECT', `Path escapes the project assets directory: ${candidate}`);
        }
    }
}
/**
 * Walk upward from `dir` to find the nearest directory that exists on disk.
 */
async function findNearestExistingParent(dir) {
    let current = dir;
    const root = path.parse(current).root;
    while (current !== root) {
        try {
            const stat = await fs.stat(current);
            if (stat.isDirectory())
                return current;
        }
        catch (_a) {
            // doesn't exist, walk up
        }
        const parent = path.dirname(current);
        if (parent === current)
            break; // reached root
        current = parent;
    }
    throw new error_normalizer_1.McpError('PATH_OUTSIDE_PROJECT', `No existing parent directory found for: ${dir}`);
}
function isENOENT(error) {
    return !!error && typeof error === 'object' && (error === null || error === void 0 ? void 0 : error.code) === 'ENOENT';
}
/**
 * Convert an absolute filesystem path to a relative path under assets root,
 * using forward slashes (for db:// URL construction).
 */
function pathToRelativeAssets(fsPath, assetsRoot) {
    const rel = path.relative(assetsRoot, fsPath);
    return rel.replace(/\\/g, '/');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC1wYXRoLXNhbmRib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2Uvc2VydmljZXMvcHJvamVjdC1wYXRoLXNhbmRib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEdBLHdEQTZDQztBQUtELG9FQUtDO0FBT0QsOENBS0M7QUFTRCwwQ0FhQztBQW5NRCwyQ0FBNkI7QUFDN0IsNkNBQStCO0FBRS9CLHlEQUE4QztBQUU5QyxNQUFNLHlCQUF5QixHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUUxRTs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFhLGtCQUFrQjtJQUMzQixZQUNxQixRQUE2QixFQUM3QixXQUFxRTs7b0NBQXJFLEVBQUEsb0JBQXNCLE1BQUEsTUFBQyxVQUFrQixDQUFDLE1BQU0sMENBQUUsT0FBTywwQ0FBRSxJQUFJLG1DQUFJLEVBQUU7UUFEckUsYUFBUSxHQUFSLFFBQVEsQ0FBcUI7UUFDN0IsZ0JBQVcsR0FBWCxXQUFXLENBQTBEO0lBQ3ZGLENBQUM7SUFFSjs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBYSxFQUFFLElBQTJCO1FBQzlELE1BQU0sR0FBRyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLE1BQU0sVUFBVSxHQUFHLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFckQsSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDdEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcs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QUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBFZGl0b3JNZXNzYWdlQ2xpZW50LCBSZXNvbHZlZFByb2plY3RQYXRoIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgTWNwRXJyb3IgfSBmcm9tICcuL2Vycm9yLW5vcm1hbGl6ZXInO1xuXG5jb25zdCBBTExPV0VEX1NDUklQVF9FWFRFTlNJT05TID0gbmV3IFNldChbJy50cycsICcudHN4JywgJy5qcycsICcuanN4J10pO1xuXG4vKipcbiAqIFNhbmRib3ggZm9yIHJlc29sdmluZyBhbmQgdmFsaWRhdGluZyBzY3JpcHQgcGF0aHMgaW5zaWRlIHRoZSBwcm9qZWN0IGBhc3NldHMvYCByb290LlxuICpcbiAqIEFsbCBwdWJsaWMgc2NyaXB0IHBhdGhzIHVzZSB0aGUgYGRiOi8vYXNzZXRzLy4uLmAgVVJMIGZvcm1hdC4gVGhpcyBjbGFzczpcbiAqIC0gbm9ybWFsaXNlcyBgYXNzZXRzLy4uLmAgc2hvcnRoYW5kIHRvIGBkYjovL2Fzc2V0cy8uLi5gXG4gKiAtIHJlamVjdHMgdHJhdmVyc2FsLCBhYnNvbHV0ZSBwYXRocywgVU5DIHBhdGhzLCBkcml2ZSBsZXR0ZXJzLCBhbmQgVVJMLWVuY29kZWQgZXNjYXBlc1xuICogLSByZXNvbHZlcyBgZGI6Ly9gIFVSTHMgdG8gcmVhbCBmaWxlc3lzdGVtIHBhdGhzIHZpYSB0aGUgZWRpdG9yIG1lc3NhZ2UgY2xpZW50XG4gKiAtIHZlcmlmaWVzIHRoZSByZXNvbHZlZCBwYXRoIGlzIGNvbnRhaW5lZCB3aXRoaW4gdGhlIHJlYWwgYGFzc2V0cy9gIHJvb3RcbiAqIC0gZm9yIGNyZWF0ZSB0YXJnZXRzLCB2YWxpZGF0ZXMgdGhlIG5lYXJlc3QgZXhpc3RpbmcgcGFyZW50IHRvIHByZXZlbnQganVuY3Rpb24vc3ltbGluayBlc2NhcGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9qZWN0UGF0aFNhbmRib3gge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IG1lc3NhZ2VzOiBFZGl0b3JNZXNzYWdlQ2xpZW50LFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHByb2plY3RQYXRoOiBzdHJpbmcgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLkVkaXRvcj8uUHJvamVjdD8ucGF0aCA/PyAnJyxcbiAgICApIHt9XG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIGEgc2NyaXB0IHBhdGggdG8gYSB2ZXJpZmllZCBmaWxlc3lzdGVtIGxvY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGlucHV0ICBVc2VyLXN1cHBsaWVkIHBhdGg6IGBkYjovL2Fzc2V0cy8uLi5gLCBgYXNzZXRzLy4uLmAsIG9yIGJhcmUgcmVsYXRpdmUuXG4gICAgICogQHBhcmFtIG1vZGUgICBgJ2V4aXN0aW5nJ2Ag4oCUIHRoZSBmaWxlIG11c3QgYWxyZWFkeSBleGlzdCAocmVhZC9zaGEvZGVsZXRlKS5cbiAgICAgKiAgICAgICAgICAgICAgIGAnY3JlYXRlJ2AgICDigJQgdGhlIGZpbGUgbWF5IG5vdCBleGlzdCB5ZXQ7IHdlIHZhbGlkYXRlIHRoZSBwYXJlbnQgaW5zdGVhZC5cbiAgICAgKi9cbiAgICBhc3luYyByZXNvbHZlU2NyaXB0UGF0aChpbnB1dDogc3RyaW5nLCBtb2RlOiAnZXhpc3RpbmcnIHwgJ2NyZWF0ZScpOiBQcm9taXNlPFJlc29sdmVkUHJvamVjdFBhdGg+IHtcbiAgICAgICAgY29uc3QgdXJsID0gbm9ybWFsaXplVG9EYkFzc2V0c1VybChpbnB1dCk7XG4gICAgICAgIGFzc2VydEFsbG93ZWRTY3JpcHRFeHRlbnNpb24odXJsKTtcbiAgICAgICAgYXNzZXJ0Tm9UcmF2ZXJzYWwodXJsKTtcblxuICAgICAgICBjb25zdCBhc3NldHNSb290ID0gYXdhaXQgZnMucmVhbHBhdGgodGhpcy5hc3NldHNEaXIpO1xuXG4gICAgICAgIGlmIChtb2RlID09PSAnZXhpc3RpbmcnKSB7XG4gICAgICAgICAgICBjb25zdCBjYW5kaWRhdGUgPSBhd2FpdCB0aGlzLnVybFRvRnNQYXRoKHVybCk7XG4gICAgICAgICAgICBsZXQgcmVhbDogc3RyaW5nO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZWFsID0gYXdhaXQgZnMucmVhbHBhdGgoY2FuZGlkYXRlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRU5PRU5UKGVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWNwRXJyb3IoJ05PVF9GT1VORCcsIGBTY3JpcHQgZG9lcyBub3QgZXhpc3Q6ICR7dXJsfWAsIHsgZGV0YWlsczogeyBwYXRoOiB1cmwgfSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhc3NlcnRDb250YWluZWQocmVhbCwgYXNzZXRzUm9vdCk7XG4gICAgICAgICAgICByZXR1cm4geyB1cmwsIGZzUGF0aDogcmVhbCwgYXNzZXRzUm9vdCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3JlYXRlIG1vZGU6IGZpbGUgbWF5IG5vdCBleGlzdCB5ZXQg4oCUIHZhbGlkYXRlIG5lYXJlc3QgZXhpc3RpbmcgcGFyZW50XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IGF3YWl0IHRoaXMudXJsVG9Gc1BhdGgodXJsKTtcbiAgICAgICAgY29uc3QgcGFyZW50RGlyID0gcGF0aC5kaXJuYW1lKGNhbmRpZGF0ZSk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nUGFyZW50ID0gYXdhaXQgZmluZE5lYXJlc3RFeGlzdGluZ1BhcmVudChwYXJlbnREaXIpO1xuICAgICAgICBjb25zdCByZWFsUGFyZW50ID0gYXdhaXQgZnMucmVhbHBhdGgoZXhpc3RpbmdQYXJlbnQpO1xuICAgICAgICBhc3NlcnRDb250YWluZWQocmVhbFBhcmVudCwgYXNzZXRzUm9vdCk7XG4gICAgICAgIC8vIEFsc28gdmVyaWZ5IHRoZSByZXNvbHZlZCBjYW5kaWRhdGUgaXRzZWxmIHdvdWxkIG5vdCBlc2NhcGVcbiAgICAgICAgYXNzZXJ0Q29udGFpbmVkKHBhdGgucmVzb2x2ZShjYW5kaWRhdGUpLCBhc3NldHNSb290KTtcbiAgICAgICAgcmV0dXJuIHsgdXJsLCBmc1BhdGg6IHBhdGgucmVzb2x2ZShjYW5kaWRhdGUpLCBhc3NldHNSb290IH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZSBhIHJlbGF0aXZlIHBhdGggKGZyb20gZmFzdC1nbG9iIG91dHB1dCkgdW5kZXIgYGFzc2V0cy9gIHRvIGEgcmVhbFxuICAgICAqIGZpbGVzeXN0ZW0gcGF0aCwgdmVyaWZ5aW5nIGNvbnRhaW5tZW50LiBVc2VkIGJ5IGNvZGUgc2VhcmNoLlxuICAgICAqL1xuICAgIGFzeW5jIHJlc29sdmVTZWFyY2hQYXRoKHJlbGF0aXZlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxSZXNvbHZlZFByb2plY3RQYXRoPiB7XG4gICAgICAgIGNvbnN0IGFzc2V0c1Jvb3QgPSBhd2FpdCBmcy5yZWFscGF0aCh0aGlzLmFzc2V0c0Rpcik7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IHBhdGgucmVzb2x2ZShhc3NldHNSb290LCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICAvLyBGb3Igc2VhcmNoIHdlIG9ubHkgcmVhZCBleGlzdGluZyBmaWxlczsgbWlzc2luZyBvbmVzIGFyZSBzaWxlbnRseSBza2lwcGVkXG4gICAgICAgIGxldCByZWFsOiBzdHJpbmc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZWFsID0gYXdhaXQgZnMucmVhbHBhdGgoY2FuZGlkYXRlKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWNwRXJyb3IoJ05PVF9GT1VORCcsIGBGaWxlIG5vdCBmb3VuZDogJHtyZWxhdGl2ZVBhdGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXJ0Q29udGFpbmVkKHJlYWwsIGFzc2V0c1Jvb3QpO1xuICAgICAgICBjb25zdCB1cmwgPSAnZGI6Ly9hc3NldHMvJyArIHBhdGhUb1JlbGF0aXZlQXNzZXRzKHJlYWwsIGFzc2V0c1Jvb3QpO1xuICAgICAgICByZXR1cm4geyB1cmwsIGZzUGF0aDogcmVhbCwgYXNzZXRzUm9vdCB9O1xuICAgIH1cblxuICAgIC8qKiBUaGUgcHJvamVjdCBgYXNzZXRzL2AgZGlyZWN0b3J5IChub3QgeWV0IHJlYWxwYXRoLXJlc29sdmVkKS4gKi9cbiAgICBnZXQgYXNzZXRzRGlyKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5wcm9qZWN0UGF0aCwgJ2Fzc2V0cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdXJsVG9Gc1BhdGgodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5tZXNzYWdlcy5pbnZva2VDYXBhYmlsaXR5PHN0cmluZyB8IG51bGw+KCdhc3NldC51cmxUb0ZzcGF0aCcsIHsgdXJsIH0pO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnICYmIHJlc3VsdC5sZW5ndGggPiAwKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIGZhbGxiYWNrOiBtYW51YWwgcmVzb2x1dGlvblxuICAgICAgICB9XG4gICAgICAgIC8vIE1hbnVhbCBmYWxsYmFjazogc3RyaXAgZGI6Ly8gYW5kIGpvaW4gd2l0aCBwcm9qZWN0IHBhdGhcbiAgICAgICAgY29uc3QgcmVsYXRpdmUgPSB1cmwucmVwbGFjZSgvXmRiOlxcL1xcLy8sICcnKTtcbiAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZSh0aGlzLnByb2plY3RQYXRoLCByZWxhdGl2ZSk7XG4gICAgfVxufVxuXG4vLyDilIDilIDilIAgUGF0aCBub3JtYWxpc2F0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vKipcbiAqIE5vcm1hbGlzZSB1c2VyIGlucHV0IHRvIGEgYGRiOi8vYXNzZXRzLy4uLmAgVVJMLlxuICogQWNjZXB0cyBgZGI6Ly9hc3NldHMvLi4uYCwgYGFzc2V0cy8uLi5gLCBvciBiYXJlIHBhdGhzIHVuZGVyIGFzc2V0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVRvRGJBc3NldHNVcmwoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycgfHwgaW5wdXQudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgTWNwRXJyb3IoJ0lOVkFMSURfQVJHVU1FTlQnLCAnUGF0aCBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZycpO1xuICAgIH1cblxuICAgIC8vIERlY29kZSBwZXJjZW50LWVuY29kZWQgY2hhcmFjdGVycyBiZWZvcmUgY2hlY2tpbmcgZm9yIHRyYXZlcnNhbFxuICAgIGxldCBkZWNvZGVkOiBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgICAgZGVjb2RlZCA9IGRlY29kZVVSSUNvbXBvbmVudChpbnB1dCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHRocm93IG5ldyBNY3BFcnJvcignSU5WQUxJRF9BUkdVTUVOVCcsICdQYXRoIGNvbnRhaW5zIGludmFsaWQgcGVyY2VudC1lbmNvZGluZycpO1xuICAgIH1cblxuICAgIC8vIFJlamVjdCBhYnNvbHV0ZSBwYXRocywgVU5DIHBhdGhzLCBkcml2ZSBsZXR0ZXJzXG4gICAgaWYgKC9eW0EtWmEtel06Ly50ZXN0KGRlY29kZWQpIHx8IC9eXFwvXFwvLy50ZXN0KGRlY29kZWQpIHx8IC9eXFxcXFxcXFwvLnRlc3QoZGVjb2RlZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdQQVRIX09VVFNJREVfUFJPSkVDVCcsICdBYnNvbHV0ZSBwYXRocyBhbmQgVU5DIHBhdGhzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgIH1cblxuICAgIC8vIE5vcm1hbGlzZSBiYWNrc2xhc2hlcyB0byBmb3J3YXJkIHNsYXNoZXNcbiAgICBjb25zdCBub3JtYWxpc2VkID0gZGVjb2RlZC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbiAgICAvLyBSZWplY3QgdHJhdmVyc2FsIHNlZ21lbnRzIGJlZm9yZSBhbnkgcHJlZml4aW5nXG4gICAgZm9yIChjb25zdCBzZWcgb2Ygbm9ybWFsaXNlZC5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzZWcgPT09ICcuLicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNY3BFcnJvcignUEFUSF9PVVRTSURFX1BST0pFQ1QnLCAnUGF0aCB0cmF2ZXJzYWwgKC4uKSBpcyBub3QgYWxsb3dlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RyaXAgZGI6Ly8gcHJlZml4IGlmIHByZXNlbnRcbiAgICBsZXQgcmVsYXRpdmUgPSBub3JtYWxpc2VkO1xuICAgIGlmIChyZWxhdGl2ZS5zdGFydHNXaXRoKCdkYjovLycpKSB7XG4gICAgICAgIHJlbGF0aXZlID0gcmVsYXRpdmUuc2xpY2UoJ2RiOi8vJy5sZW5ndGgpO1xuICAgIH1cblxuICAgIC8vIE11c3Qgc3RhcnQgd2l0aCBhc3NldHMvXG4gICAgaWYgKCFyZWxhdGl2ZS5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgLy8gQWxsb3cgYmFyZSBwYXRocyBsaWtlIFwic2NyaXB0cy9Gb28udHNcIiDihpIgXCJhc3NldHMvc2NyaXB0cy9Gb28udHNcIlxuICAgICAgICBpZiAoIXJlbGF0aXZlLmluY2x1ZGVzKCc6JykgJiYgIXJlbGF0aXZlLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICAgICAgcmVsYXRpdmUgPSAnYXNzZXRzLycgKyByZWxhdGl2ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNY3BFcnJvcignUEFUSF9PVVRTSURFX1BST0pFQ1QnLCBgUGF0aCBtdXN0IGJlIHVuZGVyIGRiOi8vYXNzZXRzLzogJHtpbnB1dH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnZGI6Ly8nICsgcmVsYXRpdmU7XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwYXRoIGhhcyBhbiBhbGxvd2VkIHNjcmlwdCBleHRlbnNpb24gKC50cywgLnRzeCwgLmpzLCAuanN4KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEFsbG93ZWRTY3JpcHRFeHRlbnNpb24odXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUodXJsKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICghQUxMT1dFRF9TQ1JJUFRfRVhURU5TSU9OUy5oYXMoZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgTWNwRXJyb3IoJ0lOVkFMSURfQVJHVU1FTlQnLCBgU2NyaXB0IGV4dGVuc2lvbiBcIiR7ZXh0fVwiIGlzIG5vdCBhbGxvd2VkLiBBbGxvd2VkOiAke1suLi5BTExPV0VEX1NDUklQVF9FWFRFTlNJT05TXS5qb2luKCcsICcpfWApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZWplY3QgdHJhdmVyc2FsIHBhdHRlcm5zIChgLi5gIHNlZ21lbnRzKSBpbiB0aGUgYWxyZWFkeS1kZWNvZGVkIFVSTC5cbiAqIFRoaXMgaXMgYSBzZWNvbmRhcnkgY2hlY2sg4oCUIG5vcm1hbGl6ZVRvRGJBc3NldHNVcmwgYWxyZWFkeSByZWplY3RzIGAuLmAgZHVyaW5nXG4gKiBub3JtYWxpc2F0aW9uLCBidXQgd2Uga2VlcCB0aGlzIGd1YXJkIGZvciBhbnkgY29kZSBwYXRoIHRoYXQgYnlwYXNzZXMgaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb1RyYXZlcnNhbCh1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHN0cmlwcGVkID0gdXJsLnJlcGxhY2UoL15kYjpcXC9cXC8vLCAnJyk7XG4gICAgaWYgKHN0cmlwcGVkLnNwbGl0KCcvJykuaW5jbHVkZXMoJy4uJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdQQVRIX09VVFNJREVfUFJPSkVDVCcsICdQYXRoIHRyYXZlcnNhbCAoLi4pIGlzIG5vdCBhbGxvd2VkJyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGF0IGBjYW5kaWRhdGVgIGlzIGNvbnRhaW5lZCB3aXRoaW4gYHJvb3RgIHVzaW5nIGBwYXRoLnJlbGF0aXZlYC5cbiAqIFRoaXMgYXZvaWRzIHRoZSBgc3RhcnRzV2l0aGAgcGl0ZmFsbCAoZS5nLiBgYXNzZXRzMmAgbWF0Y2hpbmcgYGFzc2V0c2ApLlxuICpcbiAqIE9uIFdpbmRvd3MgKGNhc2UtaW5zZW5zaXRpdmUgRlMpLCB3ZSBub3JtYWxpc2UgYm90aCBwYXRocyB0byBsb3dlciBjYXNlLlxuICogT24gUE9TSVggd2UgY29tcGFyZSBhcy1pcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENvbnRhaW5lZChjYW5kaWRhdGU6IHN0cmluZywgcm9vdDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcmVsID0gcGF0aC5yZWxhdGl2ZShyb290LCBjYW5kaWRhdGUpO1xuICAgIC8vIElmIHJlbGF0aXZlIHBhdGggc3RhcnRzIHdpdGggJy4uJyBvciBpcyBhYnNvbHV0ZSwgY2FuZGlkYXRlIGlzIG91dHNpZGUgcm9vdFxuICAgIGlmIChyZWwuc3RhcnRzV2l0aCgnLi4nKSB8fCBwYXRoLmlzQWJzb2x1dGUocmVsKSkge1xuICAgICAgICB0aHJvdyBuZXcgTWNwRXJyb3IoJ1BBVEhfT1VUU0lERV9QUk9KRUNUJywgYFBhdGggZXNjYXBlcyB0aGUgcHJvamVjdCBhc3NldHMgZGlyZWN0b3J5OiAke2NhbmRpZGF0ZX1gKTtcbiAgICB9XG4gICAgLy8gT24gV2luZG93cywgYWxzbyBjaGVjayBjYXNlLWluc2Vuc2l0aXZlbHlcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuICAgICAgICBjb25zdCByZWxMb3dlciA9IHBhdGgucmVsYXRpdmUocm9vdC50b0xvd2VyQ2FzZSgpLCBjYW5kaWRhdGUudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIGlmIChyZWxMb3dlci5zdGFydHNXaXRoKCcuLicpIHx8IHBhdGguaXNBYnNvbHV0ZShyZWxMb3dlcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNY3BFcnJvcignUEFUSF9PVVRTSURFX1BST0pFQ1QnLCBgUGF0aCBlc2NhcGVzIHRoZSBwcm9qZWN0IGFzc2V0cyBkaXJlY3Rvcnk6ICR7Y2FuZGlkYXRlfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFdhbGsgdXB3YXJkIGZyb20gYGRpcmAgdG8gZmluZCB0aGUgbmVhcmVzdCBkaXJlY3RvcnkgdGhhdCBleGlzdHMgb24gZGlzay5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZE5lYXJlc3RFeGlzdGluZ1BhcmVudChkaXI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGN1cnJlbnQgPSBkaXI7XG4gICAgY29uc3Qgcm9vdCA9IHBhdGgucGFyc2UoY3VycmVudCkucm9vdDtcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gcm9vdCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGZzLnN0YXQoY3VycmVudCk7XG4gICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSByZXR1cm4gY3VycmVudDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBkb2Vzbid0IGV4aXN0LCB3YWxrIHVwXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyZW50ID0gcGF0aC5kaXJuYW1lKGN1cnJlbnQpO1xuICAgICAgICBpZiAocGFyZW50ID09PSBjdXJyZW50KSBicmVhazsgLy8gcmVhY2hlZCByb290XG4gICAgICAgIGN1cnJlbnQgPSBwYXJlbnQ7XG4gICAgfVxuICAgIHRocm93IG5ldyBNY3BFcnJvcignUEFUSF9PVVRTSURFX1BST0pFQ1QnLCBgTm8gZXhpc3RpbmcgcGFyZW50IGRpcmVjdG9yeSBmb3VuZCBmb3I6ICR7ZGlyfWApO1xufVxuXG5mdW5jdGlvbiBpc0VOT0VOVChlcnJvcjogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIWVycm9yICYmIHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgKGVycm9yIGFzIGFueSk/LmNvZGUgPT09ICdFTk9FTlQnO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYW4gYWJzb2x1dGUgZmlsZXN5c3RlbSBwYXRoIHRvIGEgcmVsYXRpdmUgcGF0aCB1bmRlciBhc3NldHMgcm9vdCxcbiAqIHVzaW5nIGZvcndhcmQgc2xhc2hlcyAoZm9yIGRiOi8vIFVSTCBjb25zdHJ1Y3Rpb24pLlxuICovXG5mdW5jdGlvbiBwYXRoVG9SZWxhdGl2ZUFzc2V0cyhmc1BhdGg6IHN0cmluZywgYXNzZXRzUm9vdDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCByZWwgPSBwYXRoLnJlbGF0aXZlKGFzc2V0c1Jvb3QsIGZzUGF0aCk7XG4gICAgcmV0dXJuIHJlbC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG59XG4iXX0=