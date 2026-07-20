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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptFileService = void 0;
exports.renderScriptTemplate = renderScriptTemplate;
const fs = __importStar(require("fs-extra"));
const crypto_1 = require("crypto");
const error_normalizer_1 = require("./error-normalizer");
const DEFAULT_MAX_SCRIPT_BYTES = 1024 * 1024; // 1 MiB
const SHA_PREFIX = 'sha256:';
const MAX_CLASS_NAME_LENGTH = 128;
class ScriptFileService {
    constructor(messages, paths, options = {}) {
        var _a;
        this.messages = messages;
        this.paths = paths;
        this.maxScriptBytes = (_a = options.maxScriptBytes) !== null && _a !== void 0 ? _a : DEFAULT_MAX_SCRIPT_BYTES;
    }
    /** Read raw bytes, stream-hash them, and return file metadata + SHA-256. */
    async getSha(pathInput) {
        const target = await this.paths.resolveScriptPath(pathInput, 'existing');
        const stat = await fs.stat(target.fsPath);
        assertRegularFile(stat, target.url);
        assertSize(stat.size, this.maxScriptBytes, target.url);
        const sha = await sha256File(target.fsPath);
        return { path: target.url, sha, size: stat.size, mtime: stat.mtime.toISOString() };
    }
    /** Read a script, optionally a line range. SHA is always computed over the full file. */
    async read(input) {
        var _a, _b;
        const startLine = Math.max(1, Math.floor((_a = input.startLine) !== null && _a !== void 0 ? _a : 1));
        const lineCount = Math.max(1, Math.floor((_b = input.lineCount) !== null && _b !== void 0 ? _b : 200));
        const target = await this.paths.resolveScriptPath(input.path, 'existing');
        const stat = await fs.stat(target.fsPath);
        assertRegularFile(stat, target.url);
        assertSize(stat.size, this.maxScriptBytes, target.url);
        const buffer = await fs.readFile(target.fsPath);
        const sha = `sha256:${(0, crypto_1.createHash)('sha256').update(buffer).digest('hex')}`;
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
    async create(input) {
        const hasContent = typeof input.content === 'string' && input.content.length > 0;
        const hasTemplate = input.template !== undefined;
        if (!hasContent && !hasTemplate) {
            throw new error_normalizer_1.McpError('INVALID_ARGUMENT', 'Either "content" or "template" must be provided');
        }
        const target = await this.paths.resolveScriptPath(input.path, 'create');
        if (await fs.pathExists(target.fsPath)) {
            throw new error_normalizer_1.McpError('ALREADY_EXISTS', `Script already exists: ${target.url}`, {
                details: { path: target.url },
            });
        }
        let content;
        let warning;
        if (hasContent) {
            content = input.content;
            if (hasTemplate) {
                warning = 'Both "content" and "template" were provided; using "content" and ignoring "template".';
            }
        }
        else {
            assertValidClassName(input.className);
            content = renderScriptTemplate(input.template, input.className);
        }
        assertUtf8ByteLimit(content, this.maxScriptBytes);
        const created = await this.messages.invokeCapability('asset.create', {
            url: target.url,
            content,
        });
        await this.messages.invokeCapability('asset.refresh', { url: target.url });
        const meta = await this.waitForReadableMeta(target.url);
        const uuid = extractUuid(created);
        const result = Object.assign(Object.assign({}, meta), { uuid, created: true, refreshRequested: true });
        if (warning) {
            result.warning = warning;
        }
        return result;
    }
    /** Delete a script. Requires expectedSha unless force=true. */
    async delete(input) {
        // Resolve path first so we have fsPath for post-delete verification
        const target = await this.paths.resolveScriptPath(input.path, 'existing');
        const before = await this.getSha(input.path);
        if (!input.force && !input.expectedSha) {
            throw new error_normalizer_1.McpError('INVALID_ARGUMENT', '"expectedSha" is required unless "force" is true');
        }
        if (!input.force && input.expectedSha && !shaEqual(before.sha, input.expectedSha)) {
            throw new error_normalizer_1.McpError('CONFLICT', 'Script changed since it was read', {
                details: { path: before.path, expectedSha: input.expectedSha, actualSha: before.sha },
            });
        }
        await this.messages.invokeCapability('asset.delete', { url: before.path });
        // Verify the file is actually gone
        if (await fs.pathExists(target.fsPath)) {
            throw new error_normalizer_1.McpError('INTERNAL_ERROR', `Asset-db reported success but file still exists: ${before.path}`, {
                details: { path: before.path, suggestion: 'Refresh the asset database and retry.' },
            });
        }
        return { path: before.path, deleted: true, previousSha: before.sha };
    }
    /** Poll until a freshly created file is readable, then return its meta. */
    async waitForReadableMeta(url) {
        const attempts = 20;
        const delayMs = 50;
        for (let i = 0; i < attempts; i++) {
            try {
                return await this.getSha(url);
            }
            catch (error) {
                if (error instanceof error_normalizer_1.McpError && (error.structured.code === 'FILE_TOO_LARGE'))
                    throw error;
                // file not ready yet — wait and retry
                await sleep(delayMs);
            }
        }
        throw new error_normalizer_1.McpError('INTERNAL_ERROR', `Created script was not readable after refresh: ${url}`, {
            details: { path: url, suggestion: 'Refresh the asset database.' },
        });
    }
}
exports.ScriptFileService = ScriptFileService;
// ─── Helpers ─────────────────────────────────────────────────────────────────
function assertRegularFile(stat, url) {
    if (!stat.isFile()) {
        throw new error_normalizer_1.McpError('NOT_FOUND', `Script is not a regular file: ${url}`);
    }
}
function assertSize(size, max, url) {
    if (size > max) {
        throw new error_normalizer_1.McpError('FILE_TOO_LARGE', `Script ${url} is ${size} bytes, exceeds limit of ${max} bytes`, {
            details: { size, limit: max },
        });
    }
}
function assertUtf8ByteLimit(content, max) {
    const bytes = Buffer.byteLength(content, 'utf8');
    if (bytes > max) {
        throw new error_normalizer_1.McpError('FILE_TOO_LARGE', `Script content is ${bytes} bytes, exceeds limit of ${max} bytes`, {
            details: { size: bytes, limit: max },
        });
    }
}
function assertValidClassName(className) {
    if (typeof className !== 'string' || className.length === 0) {
        throw new error_normalizer_1.McpError('INVALID_ARGUMENT', 'A className is required when using a template');
    }
    if (className.length > MAX_CLASS_NAME_LENGTH) {
        throw new error_normalizer_1.McpError('INVALID_ARGUMENT', `className is too long (max ${MAX_CLASS_NAME_LENGTH} characters)`);
    }
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(className)) {
        throw new error_normalizer_1.McpError('INVALID_ARGUMENT', `className "${className}" is not a valid TypeScript identifier`);
    }
}
async function sha256File(fsPath) {
    var _a, e_1, _b, _c;
    const hash = (0, crypto_1.createHash)('sha256');
    const stream = fs.createReadStream(fsPath);
    try {
        try {
            for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                _c = stream_1_1.value;
                _d = false;
                const chunk = _c;
                hash.update(chunk);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    finally {
        stream.destroy();
    }
    return `${SHA_PREFIX}${hash.digest('hex')}`;
}
function decodeUtf8(buffer) {
    let working = buffer;
    let bom = false;
    if (working.length >= 3 && working[0] === 0xef && working[1] === 0xbb && working[2] === 0xbf) {
        working = working.subarray(3);
        bom = true;
    }
    try {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        const text = decoder.decode(working);
        const eol = text.includes('\r\n') ? 'crlf' : 'lf';
        return { text, bom, eol };
    }
    catch (_a) {
        throw new error_normalizer_1.McpError('INVALID_ARGUMENT', 'Script content is not valid UTF-8');
    }
}
function shaEqual(a, b) {
    if (!a.startsWith(SHA_PREFIX) || !b.startsWith(SHA_PREFIX))
        return false;
    const ha = Buffer.from(a.slice(SHA_PREFIX.length), 'hex');
    const hb = Buffer.from(b.slice(SHA_PREFIX.length), 'hex');
    if (ha.length !== hb.length || ha.length === 0)
        return false;
    return (0, crypto_1.timingSafeEqual)(ha, hb);
}
function extractUuid(created) {
    var _a, _b;
    if (!created)
        return null;
    if (typeof created === 'string')
        return created || null;
    return (_b = (_a = created.uuid) !== null && _a !== void 0 ? _a : created.id) !== null && _b !== void 0 ? _b : null;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// ─── Templates ───────────────────────────────────────────────────────────────
function renderScriptTemplate(template, className) {
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
            throw new error_normalizer_1.McpError('INVALID_ARGUMENT', `Unknown template: ${template}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LWZpbGUtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9zZXJ2aWNlcy9zY3JpcHQtZmlsZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1UUEsb0RBaUNDO0FBdlNELDZDQUErQjtBQUMvQixtQ0FBcUQ7QUFNckQseURBQThDO0FBRzlDLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLFFBQVE7QUFDdEQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzdCLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxDQUFDO0FBTWxDLE1BQWEsaUJBQWlCO0lBRzFCLFlBQ3FCLFFBQTZCLEVBQzdCLEtBQXlCLEVBQzFDLFVBQW9DLEVBQUU7O1FBRnJCLGFBQVEsR0FBUixRQUFRLENBQXFCO1FBQzdCLFVBQUssR0FBTCxLQUFLLENBQW9CO1FBRzFDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBQSxPQUFPLENBQUMsY0FBYyxtQ0FBSSx3QkFBd0IsQ0FBQztJQUM3RSxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBaUI7UUFDMUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN6RSxNQUFNLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkQsTUFBTSxHQUFHLEdB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QztBQUMzRCxDQUFDO0FBRUQsZ0ZBQWdGO0FBRWhGLFNBQWdCLG9CQUFvQixDQUFDLFFBQXdCLEVBQUUsU0FBaUI7SUFDNUUsUUFBUSxRQUFRLEVBQUUsQ0FBQztRQUNmLEtBQUssV0FBVztZQUNaLE9BQU87Z0JBQ0gsNkNBQTZDO2dCQUM3QywyQ0FBMkM7Z0JBQzNDLEVBQUU7Z0JBQ0YsYUFBYSxTQUFTLElBQUk7Z0JBQzFCLGdCQUFnQixTQUFTLHNCQUFzQjtnQkFDL0MsR0FBRztnQkFDSCxFQUFFO2FBQ0wsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsS0FBSyxZQUFZO1lBQ2IsT0FBTztnQkFDSCxLQUFLO2dCQUNMLE1BQU0sU0FBUyxjQUFjO2dCQUM3QixLQUFLO2dCQUNMLG9CQUFvQixTQUFTLElBQUk7Z0JBQ2pDLEdBQUc7Z0JBQ0gsRUFBRTthQUNMLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pCLEtBQUssUUFBUTtZQUNULE9BQU87Z0JBQ0gsS0FBSztnQkFDTCxNQUFNLFNBQVMsVUFBVTtnQkFDekIsS0FBSztnQkFDTCxnQkFBZ0IsU0FBUyxNQUFNO2dCQUMvQixJQUFJO2dCQUNKLEVBQUU7YUFDTCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQjtZQUNJLE1BQU0sSUFBSSwyQkFBUSxDQUFDLGtCQUFrQixFQUFFLHFCQUFxQixRQUFrQixFQUFFLENBQUMsQ0FBQztJQUMxRixDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBjcmVhdGVIYXNoLCB0aW1pbmdTYWZlRXF1YWwgfSBmcm9tICdjcnlwdG8nO1xuXG5pbXBvcnQge1xuICAgIENyZWF0ZVNjcmlwdElucHV0LCBEZWxldGVTY3JpcHRJbnB1dCwgRWRpdG9yTWVzc2FnZUNsaWVudCwgUmVhZFNjcmlwdElucHV0LFxuICAgIFNjcmlwdENyZWF0ZVJlc3VsdCwgU2NyaXB0RGVsZXRlUmVzdWx0LCBTY3JpcHRGaWxlTWV0YSwgU2NyaXB0UmVhZFJlc3VsdCwgU2NyaXB0VGVtcGxhdGUsXG59IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IE1jcEVycm9yIH0gZnJvbSAnLi9lcnJvci1ub3JtYWxpemVyJztcbmltcG9ydCB7IFByb2plY3RQYXRoU2FuZGJveCB9IGZyb20gJy4vcHJvamVjdC1wYXRoLXNhbmRib3gnO1xuXG5jb25zdCBERUZBVUxUX01BWF9TQ1JJUFRfQllURVMgPSAxMDI0ICogMTAyNDsgLy8gMSBNaUJcbmNvbnN0IFNIQV9QUkVGSVggPSAnc2hhMjU2Oic7XG5jb25zdCBNQVhfQ0xBU1NfTkFNRV9MRU5HVEggPSAxMjg7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NyaXB0RmlsZVNlcnZpY2VPcHRpb25zIHtcbiAgICBtYXhTY3JpcHRCeXRlcz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFNjcmlwdEZpbGVTZXJ2aWNlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1heFNjcmlwdEJ5dGVzOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBtZXNzYWdlczogRWRpdG9yTWVzc2FnZUNsaWVudCxcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBwYXRoczogUHJvamVjdFBhdGhTYW5kYm94LFxuICAgICAgICBvcHRpb25zOiBTY3JpcHRGaWxlU2VydmljZU9wdGlvbnMgPSB7fSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5tYXhTY3JpcHRCeXRlcyA9IG9wdGlvbnMubWF4U2NyaXB0Qnl0ZXMgPz8gREVGQVVMVF9NQVhfU0NSSVBUX0JZVEVTO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIHJhdyBieXRlcywgc3RyZWFtLWhhc2ggdGhlbSwgYW5kIHJldHVybiBmaWxlIG1ldGFkYXRhICsgU0hBLTI1Ni4gKi9cbiAgICBhc3luYyBnZXRTaGEocGF0aElucHV0OiBzdHJpbmcpOiBQcm9taXNlPFNjcmlwdEZpbGVNZXRhPiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGF3YWl0IHRoaXMucGF0aHMucmVzb2x2ZVNjcmlwdFBhdGgocGF0aElucHV0LCAnZXhpc3RpbmcnKTtcbiAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGZzLnN0YXQodGFyZ2V0LmZzUGF0aCk7XG4gICAgICAgIGFzc2VydFJlZ3VsYXJGaWxlKHN0YXQsIHRhcmdldC51cmwpO1xuICAgICAgICBhc3NlcnRTaXplKHN0YXQuc2l6ZSwgdGhpcy5tYXhTY3JpcHRCeXRlcywgdGFyZ2V0LnVybCk7XG5cbiAgICAgICAgY29uc3Qgc2hhID0gYXdhaXQgc2hhMjU2RmlsZSh0YXJnZXQuZnNQYXRoKTtcbiAgICAgICAgcmV0dXJuIHsgcGF0aDogdGFyZ2V0LnVybCwgc2hhLCBzaXplOiBzdGF0LnNpemUsIG10aW1lOiBzdGF0Lm10aW1lLnRvSVNPU3RyaW5nKCkgfTtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhIHNjcmlwdCwgb3B0aW9uYWxseSBhIGxpbmUgcmFuZ2UuIFNIQSBpcyBhbHdheXMgY29tcHV0ZWQgb3ZlciB0aGUgZnVsbCBmaWxlLiAqL1xuICAgIGFzeW5jIHJlYWQoaW5wdXQ6IFJlYWRTY3JpcHRJbnB1dCk6IFByb21pc2U8U2NyaXB0UmVhZFJlc3VsdD4ge1xuICAgICAgICBjb25zdCBzdGFydExpbmUgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGlucHV0LnN0YXJ0TGluZSA/PyAxKSk7XG4gICAgICAgIGNvbnN0IGxpbmVDb3VudCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoaW5wdXQubGluZUNvdW50ID8/IDIwMCkpO1xuXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGF3YWl0IHRoaXMucGF0aHMucmVzb2x2ZVNjcmlwdFBhdGgoaW5wdXQucGF0aCwgJ2V4aXN0aW5nJyk7XG4gICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5zdGF0KHRhcmdldC5mc1BhdGgpO1xuICAgICAgICBhc3NlcnRSZWd1bGFyRmlsZShzdGF0LCB0YXJnZXQudXJsKTtcbiAgICAgICAgYXNzZXJ0U2l6ZShzdGF0LnNpemUsIHRoaXMubWF4U2NyaXB0Qnl0ZXMsIHRhcmdldC51cmwpO1xuXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGZzLnJlYWRGaWxlKHRhcmdldC5mc1BhdGgpO1xuICAgICAgICBjb25zdCBzaGEgPSBgc2hhMjU2OiR7Y3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGJ1ZmZlcikuZGlnZXN0KCdoZXgnKX1gO1xuXG4gICAgICAgIGNvbnN0IHsgdGV4dCwgYm9tLCBlb2wgfSA9IGRlY29kZVV0ZjgoYnVmZmVyKTtcbiAgICAgICAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KC9cXHI/XFxuLyk7XG4gICAgICAgIGNvbnN0IHRvdGFsTGluZXMgPSBsaW5lcy5sZW5ndGg7XG5cbiAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IHN0YXJ0TGluZSAtIDE7XG4gICAgICAgIGNvbnN0IHNsaWNlID0gbGluZXMuc2xpY2Uoc3RhcnRJbmRleCwgc3RhcnRJbmRleCArIGxpbmVDb3VudCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBzbGljZS5qb2luKGVvbCA9PT0gJ2NybGYnID8gJ1xcclxcbicgOiAnXFxuJyk7XG4gICAgICAgIGNvbnN0IHRydW5jYXRlZCA9IHN0YXJ0SW5kZXggKyBzbGljZS5sZW5ndGggPCB0b3RhbExpbmVzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXRoOiB0YXJnZXQudXJsLFxuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHNoYSxcbiAgICAgICAgICAgIHNpemU6IHN0YXQuc2l6ZSxcbiAgICAgICAgICAgIG10aW1lOiBzdGF0Lm10aW1lLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgICAgICAgZW9sLFxuICAgICAgICAgICAgYm9tLFxuICAgICAgICAgICAgdG90YWxMaW5lcyxcbiAgICAgICAgICAgIHN0YXJ0TGluZSxcbiAgICAgICAgICAgIHJldHVybmVkTGluZXM6IHNsaWNlLmxlbmd0aCxcbiAgICAgICAgICAgIHRydW5jYXRlZCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHNjcmlwdCBmaWxlIHZpYSBhc3NldC1kYi4gTmV2ZXIgb3ZlcndyaXRlcy4gKi9cbiAgICBhc3luYyBjcmVhdGUoaW5wdXQ6IENyZWF0ZVNjcmlwdElucHV0KTogUHJvbWlzZTxTY3JpcHRDcmVhdGVSZXN1bHQ+IHtcbiAgICAgICAgY29uc3QgaGFzQ29udGVudCA9IHR5cGVvZiBpbnB1dC5jb250ZW50ID09PSAnc3RyaW5nJyAmJiBpbnB1dC5jb250ZW50Lmxlbmd0aCA+IDA7XG4gICAgICAgIGNvbnN0IGhhc1RlbXBsYXRlID0gaW5wdXQudGVtcGxhdGUgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKCFoYXNDb250ZW50ICYmICFoYXNUZW1wbGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdJTlZBTElEX0FSR1VNRU5UJywgJ0VpdGhlciBcImNvbnRlbnRcIiBvciBcInRlbXBsYXRlXCIgbXVzdCBiZSBwcm92aWRlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXdhaXQgdGhpcy5wYXRocy5yZXNvbHZlU2NyaXB0UGF0aChpbnB1dC5wYXRoLCAnY3JlYXRlJyk7XG4gICAgICAgIGlmIChhd2FpdCBmcy5wYXRoRXhpc3RzKHRhcmdldC5mc1BhdGgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWNwRXJyb3IoJ0FMUkVBRFlfRVhJU1RTJywgYFNjcmlwdCBhbHJlYWR5IGV4aXN0czogJHt0YXJnZXQudXJsfWAsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiB7IHBhdGg6IHRhcmdldC51cmwgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ6IHN0cmluZztcbiAgICAgICAgbGV0IHdhcm5pbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGhhc0NvbnRlbnQpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBpbnB1dC5jb250ZW50ITtcbiAgICAgICAgICAgIGlmIChoYXNUZW1wbGF0ZSkge1xuICAgICAgICAgICAgICAgIHdhcm5pbmcgPSAnQm90aCBcImNvbnRlbnRcIiBhbmQgXCJ0ZW1wbGF0ZVwiIHdlcmUgcHJvdmlkZWQ7IHVzaW5nIFwiY29udGVudFwiIGFuZCBpZ25vcmluZyBcInRlbXBsYXRlXCIuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFzc2VydFZhbGlkQ2xhc3NOYW1lKGlucHV0LmNsYXNzTmFtZSk7XG4gICAgICAgICAgICBjb250ZW50ID0gcmVuZGVyU2NyaXB0VGVtcGxhdGUoaW5wdXQudGVtcGxhdGUhLCBpbnB1dC5jbGFzc05hbWUhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydFV0ZjhCeXRlTGltaXQoY29udGVudCwgdGhpcy5tYXhTY3JpcHRCeXRlcyk7XG5cbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IHRoaXMubWVzc2FnZXMuaW52b2tlQ2FwYWJpbGl0eTxhbnk+KCdhc3NldC5jcmVhdGUnLCB7XG4gICAgICAgICAgICB1cmw6IHRhcmdldC51cmwsXG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgdGhpcy5tZXNzYWdlcy5pbnZva2VDYXBhYmlsaXR5KCdhc3NldC5yZWZyZXNoJywgeyB1cmw6IHRhcmdldC51cmwgfSk7XG5cbiAgICAgICAgY29uc3QgbWV0YSA9IGF3YWl0IHRoaXMud2FpdEZvclJlYWRhYmxlTWV0YSh0YXJnZXQudXJsKTtcbiAgICAgICAgY29uc3QgdXVpZCA9IGV4dHJhY3RVdWlkKGNyZWF0ZWQpO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdDogU2NyaXB0Q3JlYXRlUmVzdWx0ID0ge1xuICAgICAgICAgICAgLi4ubWV0YSxcbiAgICAgICAgICAgIHV1aWQsXG4gICAgICAgICAgICBjcmVhdGVkOiB0cnVlLFxuICAgICAgICAgICAgcmVmcmVzaFJlcXVlc3RlZDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHdhcm5pbmcpIHtcbiAgICAgICAgICAgIChyZXN1bHQgYXMgYW55KS53YXJuaW5nID0gd2FybmluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBEZWxldGUgYSBzY3JpcHQuIFJlcXVpcmVzIGV4cGVjdGVkU2hhIHVubGVzcyBmb3JjZT10cnVlLiAqL1xuICAgIGFzeW5jIGRlbGV0ZShpbnB1dDogRGVsZXRlU2NyaXB0SW5wdXQpOiBQcm9taXNlPFNjcmlwdERlbGV0ZVJlc3VsdD4ge1xuICAgICAgICAvLyBSZXNvbHZlIHBhdGggZmlyc3Qgc28gd2UgaGF2ZSBmc1BhdGggZm9yIHBvc3QtZGVsZXRlIHZlcmlmaWNhdGlvblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBhd2FpdCB0aGlzLnBhdGhzLnJlc29sdmVTY3JpcHRQYXRoKGlucHV0LnBhdGgsICdleGlzdGluZycpO1xuICAgICAgICBjb25zdCBiZWZvcmUgPSBhd2FpdCB0aGlzLmdldFNoYShpbnB1dC5wYXRoKTtcblxuICAgICAgICBpZiAoIWlucHV0LmZvcmNlICYmICFpbnB1dC5leHBlY3RlZFNoYSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdJTlZBTElEX0FSR1VNRU5UJywgJ1wiZXhwZWN0ZWRTaGFcIiBpcyByZXF1aXJlZCB1bmxlc3MgXCJmb3JjZVwiIGlzIHRydWUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaW5wdXQuZm9yY2UgJiYgaW5wdXQuZXhwZWN0ZWRTaGEgJiYgIXNoYUVxdWFsKGJlZm9yZS5zaGEsIGlucHV0LmV4cGVjdGVkU2hhKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdDT05GTElDVCcsICdTY3JpcHQgY2hhbmdlZCBzaW5jZSBpdCB3YXMgcmVhZCcsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiB7IHBhdGg6IGJlZm9yZS5wYXRoLCBleHBlY3RlZFNoYTogaW5wdXQuZXhwZWN0ZWRTaGEsIGFjdHVhbFNoYTogYmVmb3JlLnNoYSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB0aGlzLm1lc3NhZ2VzLmludm9rZUNhcGFiaWxpdHkoJ2Fzc2V0LmRlbGV0ZScsIHsgdXJsOiBiZWZvcmUucGF0aCB9KTtcblxuICAgICAgICAvLyBWZXJpZnkgdGhlIGZpbGUgaXMgYWN0dWFsbHkgZ29uZVxuICAgICAgICBpZiAoYXdhaXQgZnMucGF0aEV4aXN0cyh0YXJnZXQuZnNQYXRoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdJTlRFUk5BTF9FUlJPUicsIGBBc3NldC1kYiByZXBvcnRlZCBzdWNjZXNzIGJ1dCBmaWxlIHN0aWxsIGV4aXN0czogJHtiZWZvcmUucGF0aH1gLCB7XG4gICAgICAgICAgICAgICAgZGV0YWlsczogeyBwYXRoOiBiZWZvcmUucGF0aCwgc3VnZ2VzdGlvbjogJ1JlZnJlc2ggdGhlIGFzc2V0IGRhdGFiYXNlIGFuZCByZXRyeS4nIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHBhdGg6IGJlZm9yZS5wYXRoLCBkZWxldGVkOiB0cnVlLCBwcmV2aW91c1NoYTogYmVmb3JlLnNoYSB9O1xuICAgIH1cblxuICAgIC8qKiBQb2xsIHVudGlsIGEgZnJlc2hseSBjcmVhdGVkIGZpbGUgaXMgcmVhZGFibGUsIHRoZW4gcmV0dXJuIGl0cyBtZXRhLiAqL1xuICAgIHByaXZhdGUgYXN5bmMgd2FpdEZvclJlYWRhYmxlTWV0YSh1cmw6IHN0cmluZyk6IFByb21pc2U8U2NyaXB0RmlsZU1ldGE+IHtcbiAgICAgICAgY29uc3QgYXR0ZW1wdHMgPSAyMDtcbiAgICAgICAgY29uc3QgZGVsYXlNcyA9IDUwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dGVtcHRzOyBpKyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2hhKHVybCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIE1jcEVycm9yICYmIChlcnJvci5zdHJ1Y3R1cmVkLmNvZGUgPT09ICdGSUxFX1RPT19MQVJHRScpKSB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAvLyBmaWxlIG5vdCByZWFkeSB5ZXQg4oCUIHdhaXQgYW5kIHJldHJ5XG4gICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoZGVsYXlNcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdJTlRFUk5BTF9FUlJPUicsIGBDcmVhdGVkIHNjcmlwdCB3YXMgbm90IHJlYWRhYmxlIGFmdGVyIHJlZnJlc2g6ICR7dXJsfWAsIHtcbiAgICAgICAgICAgIGRldGFpbHM6IHsgcGF0aDogdXJsLCBzdWdnZXN0aW9uOiAnUmVmcmVzaCB0aGUgYXNzZXQgZGF0YWJhc2UuJyB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8vIOKUgOKUgOKUgCBIZWxwZXJzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBhc3NlcnRSZWd1bGFyRmlsZShzdGF0OiBmcy5TdGF0cywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXN0YXQuaXNGaWxlKCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdOT1RfRk9VTkQnLCBgU2NyaXB0IGlzIG5vdCBhIHJlZ3VsYXIgZmlsZTogJHt1cmx9YCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplKHNpemU6IG51bWJlciwgbWF4OiBudW1iZXIsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHNpemUgPiBtYXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdGSUxFX1RPT19MQVJHRScsIGBTY3JpcHQgJHt1cmx9IGlzICR7c2l6ZX0gYnl0ZXMsIGV4Y2VlZHMgbGltaXQgb2YgJHttYXh9IGJ5dGVzYCwge1xuICAgICAgICAgICAgZGV0YWlsczogeyBzaXplLCBsaW1pdDogbWF4IH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0VXRmOEJ5dGVMaW1pdChjb250ZW50OiBzdHJpbmcsIG1heDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgYnl0ZXMgPSBCdWZmZXIuYnl0ZUxlbmd0aChjb250ZW50LCAndXRmOCcpO1xuICAgIGlmIChieXRlcyA+IG1heCkge1xuICAgICAgICB0aHJvdyBuZXcgTWNwRXJyb3IoJ0ZJTEVfVE9PX0xBUkdFJywgYFNjcmlwdCBjb250ZW50IGlzICR7Ynl0ZXN9IGJ5dGVzLCBleGNlZWRzIGxpbWl0IG9mICR7bWF4fSBieXRlc2AsIHtcbiAgICAgICAgICAgIGRldGFpbHM6IHsgc2l6ZTogYnl0ZXMsIGxpbWl0OiBtYXggfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRWYWxpZENsYXNzTmFtZShjbGFzc05hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgY2xhc3NOYW1lICE9PSAnc3RyaW5nJyB8fCBjbGFzc05hbWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBNY3BFcnJvcignSU5WQUxJRF9BUkdVTUVOVCcsICdBIGNsYXNzTmFtZSBpcyByZXF1aXJlZCB3aGVuIHVzaW5nIGEgdGVtcGxhdGUnKTtcbiAgICB9XG4gICAgaWYgKGNsYXNzTmFtZS5sZW5ndGggPiBNQVhfQ0xBU1NfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdJTlZBTElEX0FSR1VNRU5UJywgYGNsYXNzTmFtZSBpcyB0b28gbG9uZyAobWF4ICR7TUFYX0NMQVNTX05BTUVfTEVOR1RIfSBjaGFyYWN0ZXJzKWApO1xuICAgIH1cbiAgICBpZiAoIS9eW0EtWmEtel8kXVtBLVphLXowLTlfJF0qJC8udGVzdChjbGFzc05hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBNY3BFcnJvcignSU5WQUxJRF9BUkdVTUVOVCcsIGBjbGFzc05hbWUgXCIke2NsYXNzTmFtZX1cIiBpcyBub3QgYSB2YWxpZCBUeXBlU2NyaXB0IGlkZW50aWZpZXJgKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNoYTI1NkZpbGUoZnNQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGhhc2ggPSBjcmVhdGVIYXNoKCdzaGEyNTYnKTtcbiAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZzUGF0aCk7XG4gICAgdHJ5IHtcbiAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzdHJlYW0pIHtcbiAgICAgICAgICAgIGhhc2gudXBkYXRlKGNodW5rIGFzIEJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBzdHJlYW0uZGVzdHJveSgpO1xuICAgIH1cbiAgICByZXR1cm4gYCR7U0hBX1BSRUZJWH0ke2hhc2guZGlnZXN0KCdoZXgnKX1gO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4KGJ1ZmZlcjogQnVmZmVyKTogeyB0ZXh0OiBzdHJpbmc7IGJvbTogYm9vbGVhbjsgZW9sOiAnbGYnIHwgJ2NybGYnIH0ge1xuICAgIGxldCB3b3JraW5nID0gYnVmZmVyO1xuICAgIGxldCBib20gPSBmYWxzZTtcbiAgICBpZiAod29ya2luZy5sZW5ndGggPj0gMyAmJiB3b3JraW5nWzBdID09PSAweGVmICYmIHdvcmtpbmdbMV0gPT09IDB4YmIgJiYgd29ya2luZ1syXSA9PT0gMHhiZikge1xuICAgICAgICB3b3JraW5nID0gd29ya2luZy5zdWJhcnJheSgzKTtcbiAgICAgICAgYm9tID0gdHJ1ZTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnLCB7IGZhdGFsOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCB0ZXh0ID0gZGVjb2Rlci5kZWNvZGUod29ya2luZyk7XG4gICAgICAgIGNvbnN0IGVvbDogJ2xmJyB8ICdjcmxmJyA9IHRleHQuaW5jbHVkZXMoJ1xcclxcbicpID8gJ2NybGYnIDogJ2xmJztcbiAgICAgICAgcmV0dXJuIHsgdGV4dCwgYm9tLCBlb2wgfTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdJTlZBTElEX0FSR1VNRU5UJywgJ1NjcmlwdCBjb250ZW50IGlzIG5vdCB2YWxpZCBVVEYtOCcpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2hhRXF1YWwoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIWEuc3RhcnRzV2l0aChTSEFfUFJFRklYKSB8fCAhYi5zdGFydHNXaXRoKFNIQV9QUkVGSVgpKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaGEgPSBCdWZmZXIuZnJvbShhLnNsaWNlKFNIQV9QUkVGSVgubGVuZ3RoKSwgJ2hleCcpO1xuICAgIGNvbnN0IGhiID0gQnVmZmVyLmZyb20oYi5zbGljZShTSEFfUFJFRklYLmxlbmd0aCksICdoZXgnKTtcbiAgICBpZiAoaGEubGVuZ3RoICE9PSBoYi5sZW5ndGggfHwgaGEubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRpbWluZ1NhZmVFcXVhbChoYSwgaGIpO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0VXVpZChjcmVhdGVkOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIWNyZWF0ZWQpIHJldHVybiBudWxsO1xuICAgIGlmICh0eXBlb2YgY3JlYXRlZCA9PT0gJ3N0cmluZycpIHJldHVybiBjcmVhdGVkIHx8IG51bGw7XG4gICAgcmV0dXJuIGNyZWF0ZWQudXVpZCA/PyBjcmVhdGVkLmlkID8/IG51bGw7XG59XG5cbmZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG5cbi8vIOKUgOKUgOKUgCBUZW1wbGF0ZXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTY3JpcHRUZW1wbGF0ZSh0ZW1wbGF0ZTogU2NyaXB0VGVtcGxhdGUsIGNsYXNzTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHRlbXBsYXRlKSB7XG4gICAgICAgIGNhc2UgJ2NvbXBvbmVudCc6XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIGBpbXBvcnQgeyBfZGVjb3JhdG9yLCBDb21wb25lbnQgfSBmcm9tICdjYyc7YCxcbiAgICAgICAgICAgICAgICBgY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gX2RlY29yYXRvcjtgLFxuICAgICAgICAgICAgICAgIGBgLFxuICAgICAgICAgICAgICAgIGBAY2NjbGFzcygnJHtjbGFzc05hbWV9JylgLFxuICAgICAgICAgICAgICAgIGBleHBvcnQgY2xhc3MgJHtjbGFzc05hbWV9IGV4dGVuZHMgQ29tcG9uZW50IHtgLFxuICAgICAgICAgICAgICAgIGB9YCxcbiAgICAgICAgICAgICAgICBgYCxcbiAgICAgICAgICAgIF0uam9pbignXFxuJyk7XG4gICAgICAgIGNhc2UgJ2RhdGEtbW9kZWwnOlxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBgLyoqYCxcbiAgICAgICAgICAgICAgICBgICogJHtjbGFzc05hbWV9IGRhdGEgbW9kZWwuYCxcbiAgICAgICAgICAgICAgICBgICovYCxcbiAgICAgICAgICAgICAgICBgZXhwb3J0IGludGVyZmFjZSAke2NsYXNzTmFtZX0ge2AsXG4gICAgICAgICAgICAgICAgYH1gLFxuICAgICAgICAgICAgICAgIGBgLFxuICAgICAgICAgICAgXS5qb2luKCdcXG4nKTtcbiAgICAgICAgY2FzZSAnbW9kdWxlJzpcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgYC8qKmAsXG4gICAgICAgICAgICAgICAgYCAqICR7Y2xhc3NOYW1lfSBtb2R1bGUuYCxcbiAgICAgICAgICAgICAgICBgICovYCxcbiAgICAgICAgICAgICAgICBgZXhwb3J0IGNvbnN0ICR7Y2xhc3NOYW1lfSA9IHtgLFxuICAgICAgICAgICAgICAgIGB9O2AsXG4gICAgICAgICAgICAgICAgYGAsXG4gICAgICAgICAgICBdLmpvaW4oJ1xcbicpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IE1jcEVycm9yKCdJTlZBTElEX0FSR1VNRU5UJywgYFVua25vd24gdGVtcGxhdGU6ICR7dGVtcGxhdGUgYXMgc3RyaW5nfWApO1xuICAgIH1cbn1cbiJdfQ==