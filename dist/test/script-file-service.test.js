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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const crypto_1 = require("crypto");
const script_file_service_1 = require("../services/script-file-service");
const project_path_sandbox_1 = require("../services/project-path-sandbox");
function fakeMessageClient(urlToFsMap) {
    const calls = [];
    const client = {
        calls,
        request: async (_pkg, _msg, ...args) => {
            const url = args[0];
            if (urlToFsMap[url])
                return urlToFsMap[url];
            throw new Error(`Unknown URL: ${url}`);
        },
        send: async () => { },
        broadcast: async () => { },
        invokeCapability: async (cap, args) => {
            var _a;
            calls.push({ capability: cap, args });
            if (cap === 'asset.urlToFspath') {
                const url = (_a = args === null || args === void 0 ? void 0 : args.url) !== null && _a !== void 0 ? _a : args;
                if (urlToFsMap[url])
                    return urlToFsMap[url];
                throw new Error(`Unknown URL: ${url}`);
            }
            if (cap === 'asset.create') {
                return { uuid: 'fake-uuid-1234', url: args === null || args === void 0 ? void 0 : args.url };
            }
            if (cap === 'asset.delete') {
                return true;
            }
            if (cap === 'asset.refresh') {
                return true;
            }
            throw new Error(`Unsupported capability: ${cap}`);
        },
        getCapabilityReport: async () => ({
            editorVersion: '3.8.8',
            supportedMessages: new Set(['asset-db:url-to-fspath', 'asset-db:create-asset', 'asset-db:delete-asset', 'asset-db:refresh-asset']),
            probeSource: 'probe',
            probedAt: new Date().toISOString(),
        }),
        clearCapabilityCache: () => { },
    };
    return client;
}
// ─── Temp project helpers ────────────────────────────────────────────────────
async function createTempProject() {
    const dir = await fs.mkdtemp(path.join(process.cwd(), 'test-script-'));
    const assetsDir = path.join(dir, 'assets', 'scripts');
    await fs.ensureDir(assetsDir);
    return { dir, assetsDir, cleanup: async () => { await fs.remove(dir); } };
}
function makeUrlMap(dir, relativePaths) {
    const map = {};
    for (const rel of relativePaths) {
        const url = 'db://assets/' + rel.replace(/\\/g, '/');
        map[url] = path.join(dir, 'assets', rel);
    }
    return map;
}
// ─── Tests ───────────────────────────────────────────────────────────────────
(0, node_test_1.default)('getSha: computes correct SHA-256 over raw bytes', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'const x = 1;\n';
        const filePath = path.join(assetsDir, 'ShaTest.ts');
        await fs.writeFile(filePath, content);
        const urlMap = makeUrlMap(dir, ['scripts/ShaTest.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const meta = await service.getSha('db://assets/scripts/ShaTest.ts');
        const expectedSha = 'sha256:' + (0, crypto_1.createHash)('sha256').update(content).digest('hex');
        strict_1.default.equal(meta.sha, expectedSha);
        strict_1.default.equal(meta.size, Buffer.byteLength(content, 'utf8'));
        strict_1.default.equal(meta.path, 'db://assets/scripts/ShaTest.ts');
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('getSha: same content produces same SHA', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'identical content\n';
        await fs.writeFile(path.join(assetsDir, 'A.ts'), content);
        await fs.writeFile(path.join(assetsDir, 'B.ts'), content);
        const urlMap = makeUrlMap(dir, ['scripts/A.ts', 'scripts/B.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const shaA = await service.getSha('db://assets/scripts/A.ts');
        const shaB = await service.getSha('db://assets/scripts/B.ts');
        strict_1.default.equal(shaA.sha, shaB.sha);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('getSha: different content produces different SHA', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'A.ts'), 'content A\n');
        await fs.writeFile(path.join(assetsDir, 'B.ts'), 'content B\n');
        const urlMap = makeUrlMap(dir, ['scripts/A.ts', 'scripts/B.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const shaA = await service.getSha('db://assets/scripts/A.ts');
        const shaB = await service.getSha('db://assets/scripts/B.ts');
        strict_1.default.notEqual(shaA.sha, shaB.sha);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('read: returns content and metadata', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'line1\nline2\nline3\n';
        await fs.writeFile(path.join(assetsDir, 'ReadTest.ts'), content);
        const urlMap = makeUrlMap(dir, ['scripts/ReadTest.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const result = await service.read({ path: 'db://assets/scripts/ReadTest.ts' });
        strict_1.default.equal(result.content, content);
        // 'line1\nline2\nline3\n' splits into 4 segments (trailing empty from the final newline)
        strict_1.default.equal(result.totalLines, 4);
        strict_1.default.equal(result.startLine, 1);
        strict_1.default.equal(result.returnedLines, 4);
        strict_1.default.equal(result.truncated, false);
        strict_1.default.equal(result.encoding, 'utf8');
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('read: line range works', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'line1\nline2\nline3\nline4\nline5\n';
        await fs.writeFile(path.join(assetsDir, 'RangeTest.ts'), content);
        const urlMap = makeUrlMap(dir, ['scripts/RangeTest.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const result = await service.read({ path: 'db://assets/scripts/RangeTest.ts', startLine: 2, lineCount: 2 });
        strict_1.default.equal(result.startLine, 2);
        strict_1.default.equal(result.returnedLines, 2);
        strict_1.default.equal(result.truncated, true);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('read: SHA is computed over full file even for partial reads', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'line1\nline2\nline3\n';
        await fs.writeFile(path.join(assetsDir, 'PartialSha.ts'), content);
        const urlMap = makeUrlMap(dir, ['scripts/PartialSha.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const full = await service.read({ path: 'db://assets/scripts/PartialSha.ts' });
        const partial = await service.read({ path: 'db://assets/scripts/PartialSha.ts', startLine: 1, lineCount: 1 });
        strict_1.default.equal(full.sha, partial.sha);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('create: creates a new file via asset-db', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const urlMap = makeUrlMap(dir, ['scripts/NewScript.ts']);
        // Pre-populate the file so waitForReadableMeta succeeds
        const newFilePath = path.join(assetsDir, 'NewScript.ts');
        const client = fakeMessageClient(urlMap);
        // Override create to actually write the file
        const origInvoke = client.invokeCapability.bind(client);
        client.invokeCapability = async (cap, args) => {
            client.calls.push({ capability: cap, args });
            if (cap === 'asset.create') {
                await fs.writeFile(newFilePath, args.content);
                return { uuid: 'new-uuid', url: args.url };
            }
            return origInvoke(cap, args);
        };
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const result = await service.create({
            path: 'db://assets/scripts/NewScript.ts',
            content: 'export class NewScript {}\n',
        });
        strict_1.default.equal(result.created, true);
        strict_1.default.equal(result.refreshRequested, true);
        strict_1.default.ok(result.sha.startsWith('sha256:'));
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('create: rejects duplicate with ALREADY_EXISTS', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'Dup.ts'), '// existing\n');
        const urlMap = makeUrlMap(dir, ['scripts/Dup.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        await strict_1.default.rejects(() => service.create({ path: 'db://assets/scripts/Dup.ts', content: 'new' }), (err) => { var _a; return ((_a = err.structured) === null || _a === void 0 ? void 0 : _a.code) === 'ALREADY_EXISTS'; });
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('create: requires content or template', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        const client = fakeMessageClient({});
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        await strict_1.default.rejects(() => service.create({ path: 'db://assets/scripts/NoContent.ts' }), (err) => { var _a; return ((_a = err.structured) === null || _a === void 0 ? void 0 : _a.code) === 'INVALID_ARGUMENT'; });
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('delete: requires expectedSha without force', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'DelTest.ts'), '// delete me\n');
        const urlMap = makeUrlMap(dir, ['scripts/DelTest.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        await strict_1.default.rejects(() => service.delete({ path: 'db://assets/scripts/DelTest.ts' }), (err) => { var _a; return ((_a = err.structured) === null || _a === void 0 ? void 0 : _a.code) === 'INVALID_ARGUMENT'; });
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('delete: SHA mismatch returns CONFLICT without calling delete-asset', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'Conflict.ts'), '// conflict\n');
        const urlMap = makeUrlMap(dir, ['scripts/Conflict.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        await strict_1.default.rejects(() => service.delete({ path: 'db://assets/scripts/Conflict.ts', expectedSha: 'sha256:0000000000000000000000000000000000000000000000000000000000000000' }), (err) => {
            var _a;
            strict_1.default.equal((_a = err.structured) === null || _a === void 0 ? void 0 : _a.code, 'CONFLICT');
            // Verify no delete-asset was called
            const deleteCalls = client.calls.filter(c => c.capability === 'asset.delete');
            strict_1.default.equal(deleteCalls.length, 0);
            return true;
        });
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('delete: force=true skips SHA check', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'ForceDel.ts'), '// force delete\n');
        const urlMap = makeUrlMap(dir, ['scripts/ForceDel.ts']);
        const client = fakeMessageClient(urlMap);
        // Override delete to actually remove the file
        const origInvoke = client.invokeCapability.bind(client);
        client.invokeCapability = async (cap, args) => {
            client.calls.push({ capability: cap, args });
            if (cap === 'asset.delete') {
                await fs.remove(path.join(assetsDir, 'ForceDel.ts'));
                return true;
            }
            return origInvoke(cap, args);
        };
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const result = await service.delete({ path: 'db://assets/scripts/ForceDel.ts', force: true });
        strict_1.default.equal(result.deleted, true);
        strict_1.default.ok(result.previousSha.startsWith('sha256:'));
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('delete: matching SHA succeeds', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = '// match sha\n';
        const filePath = path.join(assetsDir, 'MatchSha.ts');
        await fs.writeFile(filePath, content);
        const urlMap = makeUrlMap(dir, ['scripts/MatchSha.ts']);
        const client = fakeMessageClient(urlMap);
        // Override delete to actually remove the file
        const origInvoke = client.invokeCapability.bind(client);
        client.invokeCapability = async (cap, args) => {
            client.calls.push({ capability: cap, args });
            if (cap === 'asset.delete') {
                await fs.remove(filePath);
                return true;
            }
            return origInvoke(cap, args);
        };
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const service = new script_file_service_1.ScriptFileService(client, sandbox);
        const meta = await service.getSha('db://assets/scripts/MatchSha.ts');
        const result = await service.delete({ path: 'db://assets/scripts/MatchSha.ts', expectedSha: meta.sha });
        strict_1.default.equal(result.deleted, true);
        strict_1.default.equal(result.previousSha, meta.sha);
    }
    finally {
        await cleanup();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LWZpbGUtc2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rlc3Qvc2NyaXB0LWZpbGUtc2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMERBQTZCO0FBQzdCLGdFQUF3QztBQUN4QywyQ0FBNkI7QUFDN0IsNkNBQStCO0FBQy9CLG1DQUFvQztBQUVwQyx5RUFBb0U7QUFDcEUsMkVBQXNFO0FBVXRFLFNBQVMsaUJBQWlCLENBQUMsVUFBa0M7SUFDekQsTUFBTSxLQUFLLEdBQWUsRUFBRSxDQUFDO0lBQzdCLE1BQU0sTUFBTSxHQUFHO1FBQ1gsS0FBSztRQUNMLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBWSxFQUFFLElBQVksRUFBRSxHQUFHLElBQVcsRUFBRSxFQUFFO1lBQzFELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUM7Z0JBQUUsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQ0QsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFLEdBQUUsQ0FBQztRQUNwQixTQUFTLEVBQUUsS0FBSyxJQUFJLEVBQUUsR0FBRSxDQUFDO1FBQ3pCLGdCQUFnQixFQUFFLEtBQUssRUFBRSxHQUFXLEVBQUUsSUFBUyxFQUFFLEVBQUU7O1lBQy9DLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxHQUFHLEtBQUssbUJBQW1CLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxHQUFHLEdBQUcsTUFBQSxJQUFJLGFBQUosSUFBSSx1QkFB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akMsQ0FBQyxDQUFDO1FBRUYsTUFBTSxPQUFPLEdBQUcsSUFBSSx5Q0FBa0IsQ0FBQyxNQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSx1Q0FBaUIsQ0FBQyxNQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFOUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDckUsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLGlDQUFpQyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN4RyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25DLGdCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7WUFBUyxDQUFDO1FBQ1AsTUFBTSxPQUFPLEVBQUUsQ0FBQztJQUNwQixDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdGVzdCBmcm9tICdub2RlOnRlc3QnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdub2RlOmFzc2VydC9zdHJpY3QnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tICdjcnlwdG8nO1xuXG5pbXBvcnQgeyBTY3JpcHRGaWxlU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3NjcmlwdC1maWxlLXNlcnZpY2UnO1xuaW1wb3J0IHsgUHJvamVjdFBhdGhTYW5kYm94IH0gZnJvbSAnLi4vc2VydmljZXMvcHJvamVjdC1wYXRoLXNhbmRib3gnO1xuaW1wb3J0IHsgTWNwRXJyb3IgfSBmcm9tICcuLi9zZXJ2aWNlcy9lcnJvci1ub3JtYWxpemVyJztcblxuLy8g4pSA4pSA4pSAIEZha2UgbWVzc2FnZSBjbGllbnQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmludGVyZmFjZSBGYWtlQ2FsbCB7XG4gICAgY2FwYWJpbGl0eTogc3RyaW5nO1xuICAgIGFyZ3M6IGFueTtcbn1cblxuZnVuY3Rpb24gZmFrZU1lc3NhZ2VDbGllbnQodXJsVG9Gc01hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuICAgIGNvbnN0IGNhbGxzOiBGYWtlQ2FsbFtdID0gW107XG4gICAgY29uc3QgY2xpZW50ID0ge1xuICAgICAgICBjYWxscyxcbiAgICAgICAgcmVxdWVzdDogYXN5bmMgKF9wa2c6IHN0cmluZywgX21zZzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYXJnc1swXTtcbiAgICAgICAgICAgIGlmICh1cmxUb0ZzTWFwW3VybF0pIHJldHVybiB1cmxUb0ZzTWFwW3VybF07XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gVVJMOiAke3VybH1gKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2VuZDogYXN5bmMgKCkgPT4ge30sXG4gICAgICAgIGJyb2FkY2FzdDogYXN5bmMgKCkgPT4ge30sXG4gICAgICAgIGludm9rZUNhcGFiaWxpdHk6IGFzeW5jIChjYXA6IHN0cmluZywgYXJnczogYW55KSA9PiB7XG4gICAgICAgICAgICBjYWxscy5wdXNoKHsgY2FwYWJpbGl0eTogY2FwLCBhcmdzIH0pO1xuICAgICAgICAgICAgaWYgKGNhcCA9PT0gJ2Fzc2V0LnVybFRvRnNwYXRoJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGFyZ3M/LnVybCA/PyBhcmdzO1xuICAgICAgICAgICAgICAgIGlmICh1cmxUb0ZzTWFwW3VybF0pIHJldHVybiB1cmxUb0ZzTWFwW3VybF07XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIFVSTDogJHt1cmx9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2FwID09PSAnYXNzZXQuY3JlYXRlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHV1aWQ6ICdmYWtlLXV1aWQtMTIzNCcsIHVybDogYXJncz8udXJsIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2FwID09PSAnYXNzZXQuZGVsZXRlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNhcCA9PT0gJ2Fzc2V0LnJlZnJlc2gnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNhcGFiaWxpdHk6ICR7Y2FwfWApO1xuICAgICAgICB9LFxuICAgICAgICBnZXRDYXBhYmlsaXR5UmVwb3J0OiBhc3luYyAoKSA9PiAoe1xuICAgICAgICAgICAgZWRpdG9yVmVyc2lvbjogJzMuOC44JyxcbiAgICAgICAgICAgIHN1cHBvcnRlZE1lc3NhZ2VzOiBuZXcgU2V0KFsnYXNzZXQtZGI6dXJsLXRvLWZzcGF0aCcsICdhc3NldC1kYjpjcmVhdGUtYXNzZXQnLCAnYXNzZXQtZGI6ZGVsZXRlLWFzc2V0JywgJ2Fzc2V0LWRiOnJlZnJlc2gtYXNzZXQnXSksXG4gICAgICAgICAgICBwcm9iZVNvdXJjZTogJ3Byb2JlJyxcbiAgICAgICAgICAgIHByb2JlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH0pLFxuICAgICAgICBjbGVhckNhcGFiaWxpdHlDYWNoZTogKCkgPT4ge30sXG4gICAgfTtcbiAgICByZXR1cm4gY2xpZW50O1xufVxuXG4vLyDilIDilIDilIAgVGVtcCBwcm9qZWN0IGhlbHBlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRlbXBQcm9qZWN0KCk6IFByb21pc2U8eyBkaXI6IHN0cmluZzsgYXNzZXRzRGlyOiBzdHJpbmc7IGNsZWFudXA6ICgpID0+IFByb21pc2U8dm9pZD4gfT4ge1xuICAgIGNvbnN0IGRpciA9IGF3YWl0IGZzLm1rZHRlbXAocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICd0ZXN0LXNjcmlwdC0nKSk7XG4gICAgY29uc3QgYXNzZXRzRGlyID0gcGF0aC5qb2luKGRpciwgJ2Fzc2V0cycsICdzY3JpcHRzJyk7XG4gICAgYXdhaXQgZnMuZW5zdXJlRGlyKGFzc2V0c0Rpcik7XG4gICAgcmV0dXJuIHsgZGlyLCBhc3NldHNEaXIsIGNsZWFudXA6IGFzeW5jICgpID0+IHsgYXdhaXQgZnMucmVtb3ZlKGRpcik7IH0gfTtcbn1cblxuZnVuY3Rpb24gbWFrZVVybE1hcChkaXI6IHN0cmluZywgcmVsYXRpdmVQYXRoczogc3RyaW5nW10pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBtYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IHJlbCBvZiByZWxhdGl2ZVBhdGhzKSB7XG4gICAgICAgIGNvbnN0IHVybCA9ICdkYjovL2Fzc2V0cy8nICsgcmVsLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgICAgbWFwW3VybF0gPSBwYXRoLmpvaW4oZGlyLCAnYXNzZXRzJywgcmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cblxuLy8g4pSA4pSA4pSAIFRlc3RzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG50ZXN0KCdnZXRTaGE6IGNvbXB1dGVzIGNvcnJlY3QgU0hBLTI1NiBvdmVyIHJhdyBieXRlcycsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSAnY29uc3QgeCA9IDE7XFxuJztcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oYXNzZXRzRGlyLCAnU2hhVGVzdC50cycpO1xuICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUoZmlsZVBhdGgsIGNvbnRlbnQpO1xuICAgICAgICBjb25zdCB1cmxNYXAgPSBtYWtlVXJsTWFwKGRpciwgWydzY3JpcHRzL1NoYVRlc3QudHMnXSk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGZha2VNZXNzYWdlQ2xpZW50KHVybE1hcCk7XG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGNsaWVudCBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgU2NyaXB0RmlsZVNlcnZpY2UoY2xpZW50IGFzIGFueSwgc2FuZGJveCk7XG5cbiAgICAgICAgY29uc3QgbWV0YSA9IGF3YWl0IHNlcnZpY2UuZ2V0U2hhKCdkYjovL2Fzc2V0cy9zY3JpcHRzL1NoYVRlc3QudHMnKTtcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRTaGEgPSAnc2hhMjU2OicgKyBjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoY29udGVudCkuZGlnZXN0KCdoZXgnKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKG1ldGEuc2hhLCBleHBlY3RlZFNoYSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChtZXRhLnNpemUsIEJ1ZmZlci5ieXRlTGVuZ3RoKGNvbnRlbnQsICd1dGY4JykpO1xuICAgICAgICBhc3NlcnQuZXF1YWwobWV0YS5wYXRoLCAnZGI6Ly9hc3NldHMvc2NyaXB0cy9TaGFUZXN0LnRzJyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdnZXRTaGE6IHNhbWUgY29udGVudCBwcm9kdWNlcyBzYW1lIFNIQScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSAnaWRlbnRpY2FsIGNvbnRlbnRcXG4nO1xuICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUocGF0aC5qb2luKGFzc2V0c0RpciwgJ0EudHMnKSwgY29udGVudCk7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnQi50cycpLCBjb250ZW50KTtcbiAgICAgICAgY29uc3QgdXJsTWFwID0gbWFrZVVybE1hcChkaXIsIFsnc2NyaXB0cy9BLnRzJywgJ3NjcmlwdHMvQi50cyddKTtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gZmFrZU1lc3NhZ2VDbGllbnQodXJsTWFwKTtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goY2xpZW50IGFzIGFueSwgZGlyKTtcbiAgICAgICAgY29uc3Qgc2VydmljZSA9IG5ldyBTY3JpcHRGaWxlU2VydmljZShjbGllbnQgYXMgYW55LCBzYW5kYm94KTtcblxuICAgICAgICBjb25zdCBzaGFBID0gYXdhaXQgc2VydmljZS5nZXRTaGEoJ2RiOi8vYXNzZXRzL3NjcmlwdHMvQS50cycpO1xuICAgICAgICBjb25zdCBzaGFCID0gYXdhaXQgc2VydmljZS5nZXRTaGEoJ2RiOi8vYXNzZXRzL3NjcmlwdHMvQi50cycpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoc2hhQS5zaGEsIHNoYUIuc2hhKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ2dldFNoYTogZGlmZmVyZW50IGNvbnRlbnQgcHJvZHVjZXMgZGlmZmVyZW50IFNIQScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnQS50cycpLCAnY29udGVudCBBXFxuJyk7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnQi50cycpLCAnY29udGVudCBCXFxuJyk7XG4gICAgICAgIGNvbnN0IHVybE1hcCA9IG1ha2VVcmxNYXAoZGlyLCBbJ3NjcmlwdHMvQS50cycsICdzY3JpcHRzL0IudHMnXSk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGZha2VNZXNzYWdlQ2xpZW50KHVybE1hcCk7XG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGNsaWVudCBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgU2NyaXB0RmlsZVNlcnZpY2UoY2xpZW50IGFzIGFueSwgc2FuZGJveCk7XG5cbiAgICAgICAgY29uc3Qgc2hhQSA9IGF3YWl0IHNlcnZpY2UuZ2V0U2hhKCdkYjovL2Fzc2V0cy9zY3JpcHRzL0EudHMnKTtcbiAgICAgICAgY29uc3Qgc2hhQiA9IGF3YWl0IHNlcnZpY2UuZ2V0U2hhKCdkYjovL2Fzc2V0cy9zY3JpcHRzL0IudHMnKTtcbiAgICAgICAgYXNzZXJ0Lm5vdEVxdWFsKHNoYUEuc2hhLCBzaGFCLnNoYSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdyZWFkOiByZXR1cm5zIGNvbnRlbnQgYW5kIG1ldGFkYXRhJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBhc3NldHNEaXIsIGNsZWFudXAgfSA9IGF3YWl0IGNyZWF0ZVRlbXBQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9ICdsaW5lMVxcbmxpbmUyXFxubGluZTNcXG4nO1xuICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUocGF0aC5qb2luKGFzc2V0c0RpciwgJ1JlYWRUZXN0LnRzJyksIGNvbnRlbnQpO1xuICAgICAgICBjb25zdCB1cmxNYXAgPSBtYWtlVXJsTWFwKGRpciwgWydzY3JpcHRzL1JlYWRUZXN0LnRzJ10pO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBmYWtlTWVzc2FnZUNsaWVudCh1cmxNYXApO1xuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveChjbGllbnQgYXMgYW55LCBkaXIpO1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gbmV3IFNjcmlwdEZpbGVTZXJ2aWNlKGNsaWVudCBhcyBhbnksIHNhbmRib3gpO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2UucmVhZCh7IHBhdGg6ICdkYjovL2Fzc2V0cy9zY3JpcHRzL1JlYWRUZXN0LnRzJyB9KTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC5jb250ZW50LCBjb250ZW50KTtcbiAgICAgICAgLy8gJ2xpbmUxXFxubGluZTJcXG5saW5lM1xcbicgc3BsaXRzIGludG8gNCBzZWdtZW50cyAodHJhaWxpbmcgZW1wdHkgZnJvbSB0aGUgZmluYWwgbmV3bGluZSlcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC50b3RhbExpbmVzLCA0KTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC5zdGFydExpbmUsIDEpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnJldHVybmVkTGluZXMsIDQpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnRydW5jYXRlZCwgZmFsc2UpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LmVuY29kaW5nLCAndXRmOCcpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgncmVhZDogbGluZSByYW5nZSB3b3JrcycsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSAnbGluZTFcXG5saW5lMlxcbmxpbmUzXFxubGluZTRcXG5saW5lNVxcbic7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnUmFuZ2VUZXN0LnRzJyksIGNvbnRlbnQpO1xuICAgICAgICBjb25zdCB1cmxNYXAgPSBtYWtlVXJsTWFwKGRpciwgWydzY3JpcHRzL1JhbmdlVGVzdC50cyddKTtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gZmFrZU1lc3NhZ2VDbGllbnQodXJsTWFwKTtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goY2xpZW50IGFzIGFueSwgZGlyKTtcbiAgICAgICAgY29uc3Qgc2VydmljZSA9IG5ldyBTY3JpcHRGaWxlU2VydmljZShjbGllbnQgYXMgYW55LCBzYW5kYm94KTtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXJ2aWNlLnJlYWQoeyBwYXRoOiAnZGI6Ly9hc3NldHMvc2NyaXB0cy9SYW5nZVRlc3QudHMnLCBzdGFydExpbmU6IDIsIGxpbmVDb3VudDogMiB9KTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC5zdGFydExpbmUsIDIpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnJldHVybmVkTGluZXMsIDIpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnRydW5jYXRlZCwgdHJ1ZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdyZWFkOiBTSEEgaXMgY29tcHV0ZWQgb3ZlciBmdWxsIGZpbGUgZXZlbiBmb3IgcGFydGlhbCByZWFkcycsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSAnbGluZTFcXG5saW5lMlxcbmxpbmUzXFxuJztcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKHBhdGguam9pbihhc3NldHNEaXIsICdQYXJ0aWFsU2hhLnRzJyksIGNvbnRlbnQpO1xuICAgICAgICBjb25zdCB1cmxNYXAgPSBtYWtlVXJsTWFwKGRpciwgWydzY3JpcHRzL1BhcnRpYWxTaGEudHMnXSk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGZha2VNZXNzYWdlQ2xpZW50KHVybE1hcCk7XG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGNsaWVudCBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgU2NyaXB0RmlsZVNlcnZpY2UoY2xpZW50IGFzIGFueSwgc2FuZGJveCk7XG5cbiAgICAgICAgY29uc3QgZnVsbCA9IGF3YWl0IHNlcnZpY2UucmVhZCh7IHBhdGg6ICdkYjovL2Fzc2V0cy9zY3JpcHRzL1BhcnRpYWxTaGEudHMnIH0pO1xuICAgICAgICBjb25zdCBwYXJ0aWFsID0gYXdhaXQgc2VydmljZS5yZWFkKHsgcGF0aDogJ2RiOi8vYXNzZXRzL3NjcmlwdHMvUGFydGlhbFNoYS50cycsIHN0YXJ0TGluZTogMSwgbGluZUNvdW50OiAxIH0pO1xuICAgICAgICBhc3NlcnQuZXF1YWwoZnVsbC5zaGEsIHBhcnRpYWwuc2hhKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ2NyZWF0ZTogY3JlYXRlcyBhIG5ldyBmaWxlIHZpYSBhc3NldC1kYicsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHVybE1hcCA9IG1ha2VVcmxNYXAoZGlyLCBbJ3NjcmlwdHMvTmV3U2NyaXB0LnRzJ10pO1xuICAgICAgICAvLyBQcmUtcG9wdWxhdGUgdGhlIGZpbGUgc28gd2FpdEZvclJlYWRhYmxlTWV0YSBzdWNjZWVkc1xuICAgICAgICBjb25zdCBuZXdGaWxlUGF0aCA9IHBhdGguam9pbihhc3NldHNEaXIsICdOZXdTY3JpcHQudHMnKTtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gZmFrZU1lc3NhZ2VDbGllbnQodXJsTWFwKTtcbiAgICAgICAgLy8gT3ZlcnJpZGUgY3JlYXRlIHRvIGFjdHVhbGx5IHdyaXRlIHRoZSBmaWxlXG4gICAgICAgIGNvbnN0IG9yaWdJbnZva2UgPSBjbGllbnQuaW52b2tlQ2FwYWJpbGl0eS5iaW5kKGNsaWVudCk7XG4gICAgICAgIGNsaWVudC5pbnZva2VDYXBhYmlsaXR5ID0gYXN5bmMgKGNhcDogc3RyaW5nLCBhcmdzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNsaWVudC5jYWxscy5wdXNoKHsgY2FwYWJpbGl0eTogY2FwLCBhcmdzIH0pO1xuICAgICAgICAgICAgaWYgKGNhcCA9PT0gJ2Fzc2V0LmNyZWF0ZScpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUobmV3RmlsZVBhdGgsIGFyZ3MuY29udGVudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdXVpZDogJ25ldy11dWlkJywgdXJsOiBhcmdzLnVybCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9yaWdJbnZva2UoY2FwLCBhcmdzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveChjbGllbnQgYXMgYW55LCBkaXIpO1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gbmV3IFNjcmlwdEZpbGVTZXJ2aWNlKGNsaWVudCBhcyBhbnksIHNhbmRib3gpO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2UuY3JlYXRlKHtcbiAgICAgICAgICAgIHBhdGg6ICdkYjovL2Fzc2V0cy9zY3JpcHRzL05ld1NjcmlwdC50cycsXG4gICAgICAgICAgICBjb250ZW50OiAnZXhwb3J0IGNsYXNzIE5ld1NjcmlwdCB7fVxcbicsXG4gICAgICAgIH0pO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LmNyZWF0ZWQsIHRydWUpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnJlZnJlc2hSZXF1ZXN0ZWQsIHRydWUpO1xuICAgICAgICBhc3NlcnQub2socmVzdWx0LnNoYS5zdGFydHNXaXRoKCdzaGEyNTY6JykpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgnY3JlYXRlOiByZWplY3RzIGR1cGxpY2F0ZSB3aXRoIEFMUkVBRFlfRVhJU1RTJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBhc3NldHNEaXIsIGNsZWFudXAgfSA9IGF3YWl0IGNyZWF0ZVRlbXBQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKHBhdGguam9pbihhc3NldHNEaXIsICdEdXAudHMnKSwgJy8vIGV4aXN0aW5nXFxuJyk7XG4gICAgICAgIGNvbnN0IHVybE1hcCA9IG1ha2VVcmxNYXAoZGlyLCBbJ3NjcmlwdHMvRHVwLnRzJ10pO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBmYWtlTWVzc2FnZUNsaWVudCh1cmxNYXApO1xuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveChjbGllbnQgYXMgYW55LCBkaXIpO1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gbmV3IFNjcmlwdEZpbGVTZXJ2aWNlKGNsaWVudCBhcyBhbnksIHNhbmRib3gpO1xuXG4gICAgICAgIGF3YWl0IGFzc2VydC5yZWplY3RzKFxuICAgICAgICAgICAgKCkgPT4gc2VydmljZS5jcmVhdGUoeyBwYXRoOiAnZGI6Ly9hc3NldHMvc2NyaXB0cy9EdXAudHMnLCBjb250ZW50OiAnbmV3JyB9KSxcbiAgICAgICAgICAgIChlcnI6IGFueSkgPT4gZXJyLnN0cnVjdHVyZWQ/LmNvZGUgPT09ICdBTFJFQURZX0VYSVNUUydcbiAgICAgICAgKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ2NyZWF0ZTogcmVxdWlyZXMgY29udGVudCBvciB0ZW1wbGF0ZScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgY2xlYW51cCB9ID0gYXdhaXQgY3JlYXRlVGVtcFByb2plY3QoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBmYWtlTWVzc2FnZUNsaWVudCh7fSk7XG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGNsaWVudCBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgU2NyaXB0RmlsZVNlcnZpY2UoY2xpZW50IGFzIGFueSwgc2FuZGJveCk7XG5cbiAgICAgICAgYXdhaXQgYXNzZXJ0LnJlamVjdHMoXG4gICAgICAgICAgICAoKSA9PiBzZXJ2aWNlLmNyZWF0ZSh7IHBhdGg6ICdkYjovL2Fzc2V0cy9zY3JpcHRzL05vQ29udGVudC50cycgfSksXG4gICAgICAgICAgICAoZXJyOiBhbnkpID0+IGVyci5zdHJ1Y3R1cmVkPy5jb2RlID09PSAnSU5WQUxJRF9BUkdVTUVOVCdcbiAgICAgICAgKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ2RlbGV0ZTogcmVxdWlyZXMgZXhwZWN0ZWRTaGEgd2l0aG91dCBmb3JjZScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnRGVsVGVzdC50cycpLCAnLy8gZGVsZXRlIG1lXFxuJyk7XG4gICAgICAgIGNvbnN0IHVybE1hcCA9IG1ha2VVcmxNYXAoZGlyLCBbJ3NjcmlwdHMvRGVsVGVzdC50cyddKTtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gZmFrZU1lc3NhZ2VDbGllbnQodXJsTWFwKTtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goY2xpZW50IGFzIGFueSwgZGlyKTtcbiAgICAgICAgY29uc3Qgc2VydmljZSA9IG5ldyBTY3JpcHRGaWxlU2VydmljZShjbGllbnQgYXMgYW55LCBzYW5kYm94KTtcblxuICAgICAgICBhd2FpdCBhc3NlcnQucmVqZWN0cyhcbiAgICAgICAgICAgICgpID0+IHNlcnZpY2UuZGVsZXRlKHsgcGF0aDogJ2RiOi8vYXNzZXRzL3NjcmlwdHMvRGVsVGVzdC50cycgfSksXG4gICAgICAgICAgICAoZXJyOiBhbnkpID0+IGVyci5zdHJ1Y3R1cmVkPy5jb2RlID09PSAnSU5WQUxJRF9BUkdVTUVOVCdcbiAgICAgICAgKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ2RlbGV0ZTogU0hBIG1pc21hdGNoIHJldHVybnMgQ09ORkxJQ1Qgd2l0aG91dCBjYWxsaW5nIGRlbGV0ZS1hc3NldCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnQ29uZmxpY3QudHMnKSwgJy8vIGNvbmZsaWN0XFxuJyk7XG4gICAgICAgIGNvbnN0IHVybE1hcCA9IG1ha2VVcmxNYXAoZGlyLCBbJ3NjcmlwdHMvQ29uZmxpY3QudHMnXSk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGZha2VNZXNzYWdlQ2xpZW50KHVybE1hcCk7XG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGNsaWVudCBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgU2NyaXB0RmlsZVNlcnZpY2UoY2xpZW50IGFzIGFueSwgc2FuZGJveCk7XG5cbiAgICAgICAgYXdhaXQgYXNzZXJ0LnJlamVjdHMoXG4gICAgICAgICAgICAoKSA9PiBzZXJ2aWNlLmRlbGV0ZSh7IHBhdGg6ICdkYjovL2Fzc2V0cy9zY3JpcHRzL0NvbmZsaWN0LnRzJywgZXhwZWN0ZWRTaGE6ICdzaGEyNTY6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCcgfSksXG4gICAgICAgICAgICAoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoZXJyLnN0cnVjdHVyZWQ/LmNvZGUsICdDT05GTElDVCcpO1xuICAgICAgICAgICAgICAgIC8vIFZlcmlmeSBubyBkZWxldGUtYXNzZXQgd2FzIGNhbGxlZFxuICAgICAgICAgICAgICAgIGNvbnN0IGRlbGV0ZUNhbGxzID0gY2xpZW50LmNhbGxzLmZpbHRlcihjID0+IGMuY2FwYWJpbGl0eSA9PT0gJ2Fzc2V0LmRlbGV0ZScpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChkZWxldGVDYWxscy5sZW5ndGgsIDApO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgnZGVsZXRlOiBmb3JjZT10cnVlIHNraXBzIFNIQSBjaGVjaycsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgYXNzZXRzRGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnRm9yY2VEZWwudHMnKSwgJy8vIGZvcmNlIGRlbGV0ZVxcbicpO1xuICAgICAgICBjb25zdCB1cmxNYXAgPSBtYWtlVXJsTWFwKGRpciwgWydzY3JpcHRzL0ZvcmNlRGVsLnRzJ10pO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBmYWtlTWVzc2FnZUNsaWVudCh1cmxNYXApO1xuICAgICAgICAvLyBPdmVycmlkZSBkZWxldGUgdG8gYWN0dWFsbHkgcmVtb3ZlIHRoZSBmaWxlXG4gICAgICAgIGNvbnN0IG9yaWdJbnZva2UgPSBjbGllbnQuaW52b2tlQ2FwYWJpbGl0eS5iaW5kKGNsaWVudCk7XG4gICAgICAgIGNsaWVudC5pbnZva2VDYXBhYmlsaXR5ID0gYXN5bmMgKGNhcDogc3RyaW5nLCBhcmdzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNsaWVudC5jYWxscy5wdXNoKHsgY2FwYWJpbGl0eTogY2FwLCBhcmdzIH0pO1xuICAgICAgICAgICAgaWYgKGNhcCA9PT0gJ2Fzc2V0LmRlbGV0ZScpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBmcy5yZW1vdmUocGF0aC5qb2luKGFzc2V0c0RpciwgJ0ZvcmNlRGVsLnRzJykpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9yaWdJbnZva2UoY2FwLCBhcmdzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveChjbGllbnQgYXMgYW55LCBkaXIpO1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gbmV3IFNjcmlwdEZpbGVTZXJ2aWNlKGNsaWVudCBhcyBhbnksIHNhbmRib3gpO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2UuZGVsZXRlKHsgcGF0aDogJ2RiOi8vYXNzZXRzL3NjcmlwdHMvRm9yY2VEZWwudHMnLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC5kZWxldGVkLCB0cnVlKTtcbiAgICAgICAgYXNzZXJ0Lm9rKHJlc3VsdC5wcmV2aW91c1NoYS5zdGFydHNXaXRoKCdzaGEyNTY6JykpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgnZGVsZXRlOiBtYXRjaGluZyBTSEEgc3VjY2VlZHMnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyBkaXIsIGFzc2V0c0RpciwgY2xlYW51cCB9ID0gYXdhaXQgY3JlYXRlVGVtcFByb2plY3QoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gJy8vIG1hdGNoIHNoYVxcbic7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGFzc2V0c0RpciwgJ01hdGNoU2hhLnRzJyk7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShmaWxlUGF0aCwgY29udGVudCk7XG4gICAgICAgIGNvbnN0IHVybE1hcCA9IG1ha2VVcmxNYXAoZGlyLCBbJ3NjcmlwdHMvTWF0Y2hTaGEudHMnXSk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGZha2VNZXNzYWdlQ2xpZW50KHVybE1hcCk7XG4gICAgICAgIC8vIE92ZXJyaWRlIGRlbGV0ZSB0byBhY3R1YWxseSByZW1vdmUgdGhlIGZpbGVcbiAgICAgICAgY29uc3Qgb3JpZ0ludm9rZSA9IGNsaWVudC5pbnZva2VDYXBhYmlsaXR5LmJpbmQoY2xpZW50KTtcbiAgICAgICAgY2xpZW50Lmludm9rZUNhcGFiaWxpdHkgPSBhc3luYyAoY2FwOiBzdHJpbmcsIGFyZ3M6IGFueSkgPT4ge1xuICAgICAgICAgICAgY2xpZW50LmNhbGxzLnB1c2goeyBjYXBhYmlsaXR5OiBjYXAsIGFyZ3MgfSk7XG4gICAgICAgICAgICBpZiAoY2FwID09PSAnYXNzZXQuZGVsZXRlJykge1xuICAgICAgICAgICAgICAgIGF3YWl0IGZzLnJlbW92ZShmaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3JpZ0ludm9rZShjYXAsIGFyZ3MpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGNsaWVudCBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgU2NyaXB0RmlsZVNlcnZpY2UoY2xpZW50IGFzIGFueSwgc2FuZGJveCk7XG5cbiAgICAgICAgY29uc3QgbWV0YSA9IGF3YWl0IHNlcnZpY2UuZ2V0U2hhKCdkYjovL2Fzc2V0cy9zY3JpcHRzL01hdGNoU2hhLnRzJyk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2UuZGVsZXRlKHsgcGF0aDogJ2RiOi8vYXNzZXRzL3NjcmlwdHMvTWF0Y2hTaGEudHMnLCBleHBlY3RlZFNoYTogbWV0YS5zaGEgfSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQuZGVsZXRlZCwgdHJ1ZSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQucHJldmlvdXNTaGEsIG1ldGEuc2hhKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG4iXX0=