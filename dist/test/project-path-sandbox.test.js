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
const project_path_sandbox_1 = require("../services/project-path-sandbox");
// ─── Unit tests for pure path functions ──────────────────────────────────────
(0, node_test_1.default)('normalizeToDbAssetsUrl: db://assets/scripts/Foo.ts passes through', () => {
    strict_1.default.equal((0, project_path_sandbox_1.normalizeToDbAssetsUrl)('db://assets/scripts/Foo.ts'), 'db://assets/scripts/Foo.ts');
});
(0, node_test_1.default)('normalizeToDbAssetsUrl: assets/ shorthand is normalised', () => {
    strict_1.default.equal((0, project_path_sandbox_1.normalizeToDbAssetsUrl)('assets/scripts/Foo.ts'), 'db://assets/scripts/Foo.ts');
});
(0, node_test_1.default)('normalizeToDbAssetsUrl: bare path gets assets/ prefix', () => {
    strict_1.default.equal((0, project_path_sandbox_1.normalizeToDbAssetsUrl)('scripts/Foo.ts'), 'db://assets/scripts/Foo.ts');
});
(0, node_test_1.default)('normalizeToDbAssetsUrl: Windows backslashes are normalised', () => {
    strict_1.default.equal((0, project_path_sandbox_1.normalizeToDbAssetsUrl)('assets\\scripts\\Foo.ts'), 'db://assets/scripts/Foo.ts');
});
(0, node_test_1.default)('normalizeToDbAssetsUrl: rejects empty string', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.normalizeToDbAssetsUrl)(''), { code: 'INVALID_ARGUMENT' });
});
(0, node_test_1.default)('normalizeToDbAssetsUrl: rejects traversal ..', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.normalizeToDbAssetsUrl)('db://assets/../outside.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});
(0, node_test_1.default)('normalizeToDbAssetsUrl: rejects URL-encoded traversal %2e%2e', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.normalizeToDbAssetsUrl)('db://assets/%2e%2e/outside.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});
(0, node_test_1.default)('normalizeToDbAssetsUrl: rejects absolute Windows path', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.normalizeToDbAssetsUrl)('C:\\outside.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});
(0, node_test_1.default)('normalizeToDbAssetsUrl: rejects UNC path', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.normalizeToDbAssetsUrl)('\\\\server\\share\\file.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});
(0, node_test_1.default)('assertAllowedScriptExtension: .ts passes', () => {
    strict_1.default.doesNotThrow(() => (0, project_path_sandbox_1.assertAllowedScriptExtension)('db://assets/Foo.ts'));
});
(0, node_test_1.default)('assertAllowedScriptExtension: .tsx passes', () => {
    strict_1.default.doesNotThrow(() => (0, project_path_sandbox_1.assertAllowedScriptExtension)('db://assets/Foo.tsx'));
});
(0, node_test_1.default)('assertAllowedScriptExtension: .js passes', () => {
    strict_1.default.doesNotThrow(() => (0, project_path_sandbox_1.assertAllowedScriptExtension)('db://assets/Foo.js'));
});
(0, node_test_1.default)('assertAllowedScriptExtension: .jsx passes', () => {
    strict_1.default.doesNotThrow(() => (0, project_path_sandbox_1.assertAllowedScriptExtension)('db://assets/Foo.jsx'));
});
(0, node_test_1.default)('assertAllowedScriptExtension: .scene rejects', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.assertAllowedScriptExtension)('db://assets/Foo.scene'), { code: 'INVALID_ARGUMENT' });
});
(0, node_test_1.default)('assertAllowedScriptExtension: .py rejects', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.assertAllowedScriptExtension)('db://assets/Foo.py'), { code: 'INVALID_ARGUMENT' });
});
(0, node_test_1.default)('assertNoTraversal: clean path passes', () => {
    strict_1.default.doesNotThrow(() => (0, project_path_sandbox_1.assertNoTraversal)('db://assets/scripts/Foo.ts'));
});
(0, node_test_1.default)('assertNoTraversal: .. segment rejects', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.assertNoTraversal)('db://assets/../outside.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});
(0, node_test_1.default)('assertContained: child path passes', () => {
    strict_1.default.doesNotThrow(() => (0, project_path_sandbox_1.assertContained)('/project/assets/scripts/Foo.ts', '/project/assets'));
});
(0, node_test_1.default)('assertContained: sibling directory rejects (assets2 vs assets)', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.assertContained)('/project/assets2/Foo.ts', '/project/assets'), { code: 'PATH_OUTSIDE_PROJECT' });
});
(0, node_test_1.default)('assertContained: parent directory rejects', () => {
    strict_1.default.throws(() => (0, project_path_sandbox_1.assertContained)('/project/Foo.ts', '/project/assets'), { code: 'PATH_OUTSIDE_PROJECT' });
});
// ─── Integration tests with temp project directory ───────────────────────────
async function createTempProject() {
    const dir = await fs.mkdtemp(path.join(process.cwd(), 'test-sandbox-'));
    await fs.ensureDir(path.join(dir, 'assets', 'scripts'));
    // Create a real file for existing-path tests
    await fs.writeFile(path.join(dir, 'assets', 'scripts', 'Existing.ts'), '// existing\n');
    return {
        dir,
        cleanup: async () => { await fs.remove(dir); }
    };
}
function fakeMessageClient(urlToFsMap) {
    return {
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
            if (cap === 'asset.urlToFspath') {
                const url = (_a = args === null || args === void 0 ? void 0 : args.url) !== null && _a !== void 0 ? _a : args;
                if (urlToFsMap[url])
                    return urlToFsMap[url];
                throw new Error(`Unknown URL: ${url}`);
            }
            throw new Error(`Unsupported capability: ${cap}`);
        },
        getCapabilityReport: async () => ({
            editorVersion: '3.8.8',
            supportedMessages: new Set(['asset-db:url-to-fspath']),
            probeSource: 'probe',
            probedAt: new Date().toISOString(),
        }),
        clearCapabilityCache: () => { },
    };
}
(0, node_test_1.default)('resolveScriptPath existing: resolves a real file', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        const existingPath = path.join(dir, 'assets', 'scripts', 'Existing.ts');
        const client = fakeMessageClient({ 'db://assets/scripts/Existing.ts': existingPath });
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const result = await sandbox.resolveScriptPath('db://assets/scripts/Existing.ts', 'existing');
        strict_1.default.equal(result.url, 'db://assets/scripts/Existing.ts');
        strict_1.default.ok(result.fsPath.includes('Existing.ts'));
        strict_1.default.ok(result.assetsRoot.includes('assets'));
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('resolveScriptPath create: resolves a non-existent file under existing parent', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        const client = fakeMessageClient({ 'db://assets/scripts/New.ts': path.join(dir, 'assets', 'scripts', 'New.ts') });
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        const result = await sandbox.resolveScriptPath('db://assets/scripts/New.ts', 'create');
        strict_1.default.equal(result.url, 'db://assets/scripts/New.ts');
        strict_1.default.ok(result.fsPath.includes('New.ts'));
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('resolveScriptPath rejects symlink escape', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        // Create a symlink inside assets that points outside
        const outsideDir = path.join(dir, 'outside');
        await fs.ensureDir(outsideDir);
        await fs.writeFile(path.join(outsideDir, 'escape.ts'), '// escape\n');
        const symlinkPath = path.join(dir, 'assets', 'escape-link.ts');
        try {
            await fs.symlink(path.join(outsideDir, 'escape.ts'), symlinkPath);
        }
        catch (_a) {
            // On Windows, symlinks may require admin privileges; skip if unavailable
            await cleanup();
            return;
        }
        const client = fakeMessageClient({ 'db://assets/escape-link.ts': symlinkPath });
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(client, dir);
        await strict_1.default.rejects(() => sandbox.resolveScriptPath('db://assets/escape-link.ts', 'existing'), { code: 'PATH_OUTSIDE_PROJECT' });
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('resolveSearchPath: resolves relative path under assets', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox({}, dir);
        const result = await sandbox.resolveSearchPath('scripts/Existing.ts');
        strict_1.default.ok(result.url.startsWith('db://assets/'));
        strict_1.default.ok(result.fsPath.includes('Existing.ts'));
    }
    finally {
        await cleanup();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC1wYXRoLXNhbmRib3gudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS90ZXN0L3Byb2plY3QtcGF0aC1zYW5kYm94LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwREFBNkI7QUFDN0IsZ0VBQXdDO0FBQ3hDLDJDQUE2QjtBQUM3Qiw2Q0FBK0I7QUFFL0IsMkVBQWdLO0FBR2hLLGdGQUFnRjtBQUVoRixJQUFBLG1CQUFJLEVBQUMsbUVBQW1FLEVBQUUsR0FBRyxFQUFFO0lBQzNFLGdCQUFNLENBQUMsS0FBSyxDQUFDLElBQUEsNkNBQXNCLEVBQUMsNEJBQTRCLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0FBQ3JHLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBQSxtQkFBSSxFQUFDLHlEQUF5RCxFQUFFLEdBQUcsRUFBRTtJQUNqRSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxJQUFBLDZDQUFzQixFQUFDLHVCQUF1QixDQUFDLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztBQUNoRyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUEsbUJBQUksRUFBQyx1REFBdUQsRUFBRSxHQUFHLEVBQUU7SUFDL0QsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsSUFBQSw2Q0FBc0IsRUFBQyxnQkFBZ0IsQ0FBQyxFQUFFLDRCQUE0QixDQUFDLENBQUM7QUFDekYsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFBLG1CQUFJLEVBQUMsNERBQTRELEVBQUUsR0FBRyxFQUFFO0lBQ3BFLGdCQUFNLENBQUMsS0FBSyxDQUFDLElBQUEsNkNBQXNCLEVBQUMseUJBQXlCLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0FBQ2xHLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBQSxtQkFBSSxFQUFDLDhDQUE4QyxFQUFFLEdBQUcsRUFBRTtJQUN0RCxnQkFBTSxDQUFDLE1BQU0s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Q1AsTUFBTSxPQUFPLEVBQUUsQ0FBQztJQUNwQixDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFBLG1CQUFJLEVBQUMsd0RBQXdELEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDdEUsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLGlCQUFpQixFQUFFLENBQUM7SUFDbkQsSUFBSSxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSx5Q0FBa0IsQ0FBQyxFQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkQsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN0RSxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ2pELGdCQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztZQUFTLENBQUM7UUFDUCxNQUFNLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0ZXN0IGZyb20gJ25vZGU6dGVzdCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ25vZGU6YXNzZXJ0L3N0cmljdCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuXG5pbXBvcnQgeyBQcm9qZWN0UGF0aFNhbmRib3gsIG5vcm1hbGl6ZVRvRGJBc3NldHNVcmwsIGFzc2VydEFsbG93ZWRTY3JpcHRFeHRlbnNpb24sIGFzc2VydE5vVHJhdmVyc2FsLCBhc3NlcnRDb250YWluZWQgfSBmcm9tICcuLi9zZXJ2aWNlcy9wcm9qZWN0LXBhdGgtc2FuZGJveCc7XG5pbXBvcnQgeyBNY3BFcnJvciB9IGZyb20gJy4uL3NlcnZpY2VzL2Vycm9yLW5vcm1hbGl6ZXInO1xuXG4vLyDilIDilIDilIAgVW5pdCB0ZXN0cyBmb3IgcHVyZSBwYXRoIGZ1bmN0aW9ucyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxudGVzdCgnbm9ybWFsaXplVG9EYkFzc2V0c1VybDogZGI6Ly9hc3NldHMvc2NyaXB0cy9Gb28udHMgcGFzc2VzIHRocm91Z2gnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKG5vcm1hbGl6ZVRvRGJBc3NldHNVcmwoJ2RiOi8vYXNzZXRzL3NjcmlwdHMvRm9vLnRzJyksICdkYjovL2Fzc2V0cy9zY3JpcHRzL0Zvby50cycpO1xufSk7XG5cbnRlc3QoJ25vcm1hbGl6ZVRvRGJBc3NldHNVcmw6IGFzc2V0cy8gc2hvcnRoYW5kIGlzIG5vcm1hbGlzZWQnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKG5vcm1hbGl6ZVRvRGJBc3NldHNVcmwoJ2Fzc2V0cy9zY3JpcHRzL0Zvby50cycpLCAnZGI6Ly9hc3NldHMvc2NyaXB0cy9Gb28udHMnKTtcbn0pO1xuXG50ZXN0KCdub3JtYWxpemVUb0RiQXNzZXRzVXJsOiBiYXJlIHBhdGggZ2V0cyBhc3NldHMvIHByZWZpeCcsICgpID0+IHtcbiAgICBhc3NlcnQuZXF1YWwobm9ybWFsaXplVG9EYkFzc2V0c1VybCgnc2NyaXB0cy9Gb28udHMnKSwgJ2RiOi8vYXNzZXRzL3NjcmlwdHMvRm9vLnRzJyk7XG59KTtcblxudGVzdCgnbm9ybWFsaXplVG9EYkFzc2V0c1VybDogV2luZG93cyBiYWNrc2xhc2hlcyBhcmUgbm9ybWFsaXNlZCcsICgpID0+IHtcbiAgICBhc3NlcnQuZXF1YWwobm9ybWFsaXplVG9EYkFzc2V0c1VybCgnYXNzZXRzXFxcXHNjcmlwdHNcXFxcRm9vLnRzJyksICdkYjovL2Fzc2V0cy9zY3JpcHRzL0Zvby50cycpO1xufSk7XG5cbnRlc3QoJ25vcm1hbGl6ZVRvRGJBc3NldHNVcmw6IHJlamVjdHMgZW1wdHkgc3RyaW5nJywgKCkgPT4ge1xuICAgIGFzc2VydC50aHJvd3MoKCkgPT4gbm9ybWFsaXplVG9EYkFzc2V0c1VybCgnJyksIHsgY29kZTogJ0lOVkFMSURfQVJHVU1FTlQnIH0pO1xufSk7XG5cbnRlc3QoJ25vcm1hbGl6ZVRvRGJBc3NldHNVcmw6IHJlamVjdHMgdHJhdmVyc2FsIC4uJywgKCkgPT4ge1xuICAgIGFzc2VydC50aHJvd3MoKCkgPT4gbm9ybWFsaXplVG9EYkFzc2V0c1VybCgnZGI6Ly9hc3NldHMvLi4vb3V0c2lkZS50cycpLCB7IGNvZGU6ICdQQVRIX09VVFNJREVfUFJPSkVDVCcgfSk7XG59KTtcblxudGVzdCgnbm9ybWFsaXplVG9EYkFzc2V0c1VybDogcmVqZWN0cyBVUkwtZW5jb2RlZCB0cmF2ZXJzYWwgJTJlJTJlJywgKCkgPT4ge1xuICAgIGFzc2VydC50aHJvd3MoKCkgPT4gbm9ybWFsaXplVG9EYkFzc2V0c1VybCgnZGI6Ly9hc3NldHMvJTJlJTJlL291dHNpZGUudHMnKSwgeyBjb2RlOiAnUEFUSF9PVVRTSURFX1BST0pFQ1QnIH0pO1xufSk7XG5cbnRlc3QoJ25vcm1hbGl6ZVRvRGJBc3NldHNVcmw6IHJlamVjdHMgYWJzb2x1dGUgV2luZG93cyBwYXRoJywgKCkgPT4ge1xuICAgIGFzc2VydC50aHJvd3MoKCkgPT4gbm9ybWFsaXplVG9EYkFzc2V0c1VybCgnQzpcXFxcb3V0c2lkZS50cycpLCB7IGNvZGU6ICdQQVRIX09VVFNJREVfUFJPSkVDVCcgfSk7XG59KTtcblxudGVzdCgnbm9ybWFsaXplVG9EYkFzc2V0c1VybDogcmVqZWN0cyBVTkMgcGF0aCcsICgpID0+IHtcbiAgICBhc3NlcnQudGhyb3dzKCgpID0+IG5vcm1hbGl6ZVRvRGJBc3NldHNVcmwoJ1xcXFxcXFxcc2VydmVyXFxcXHNoYXJlXFxcXGZpbGUudHMnKSwgeyBjb2RlOiAnUEFUSF9PVVRTSURFX1BST0pFQ1QnIH0pO1xufSk7XG5cbnRlc3QoJ2Fzc2VydEFsbG93ZWRTY3JpcHRFeHRlbnNpb246IC50cyBwYXNzZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmRvZXNOb3RUaHJvdygoKSA9PiBhc3NlcnRBbGxvd2VkU2NyaXB0RXh0ZW5zaW9uKCdkYjovL2Fzc2V0cy9Gb28udHMnKSk7XG59KTtcblxudGVzdCgnYXNzZXJ0QWxsb3dlZFNjcmlwdEV4dGVuc2lvbjogLnRzeCBwYXNzZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmRvZXNOb3RUaHJvdygoKSA9PiBhc3NlcnRBbGxvd2VkU2NyaXB0RXh0ZW5zaW9uKCdkYjovL2Fzc2V0cy9Gb28udHN4JykpO1xufSk7XG5cbnRlc3QoJ2Fzc2VydEFsbG93ZWRTY3JpcHRFeHRlbnNpb246IC5qcyBwYXNzZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmRvZXNOb3RUaHJvdygoKSA9PiBhc3NlcnRBbGxvd2VkU2NyaXB0RXh0ZW5zaW9uKCdkYjovL2Fzc2V0cy9Gb28uanMnKSk7XG59KTtcblxudGVzdCgnYXNzZXJ0QWxsb3dlZFNjcmlwdEV4dGVuc2lvbjogLmpzeCBwYXNzZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmRvZXNOb3RUaHJvdygoKSA9PiBhc3NlcnRBbGxvd2VkU2NyaXB0RXh0ZW5zaW9uKCdkYjovL2Fzc2V0cy9Gb28uanN4JykpO1xufSk7XG5cbnRlc3QoJ2Fzc2VydEFsbG93ZWRTY3JpcHRFeHRlbnNpb246IC5zY2VuZSByZWplY3RzJywgKCkgPT4ge1xuICAgIGFzc2VydC50aHJvd3MoKCkgPT4gYXNzZXJ0QWxsb3dlZFNjcmlwdEV4dGVuc2lvbignZGI6Ly9hc3NldHMvRm9vLnNjZW5lJyksIHsgY29kZTogJ0lOVkFMSURfQVJHVU1FTlQnIH0pO1xufSk7XG5cbnRlc3QoJ2Fzc2VydEFsbG93ZWRTY3JpcHRFeHRlbnNpb246IC5weSByZWplY3RzJywgKCkgPT4ge1xuICAgIGFzc2VydC50aHJvd3MoKCkgPT4gYXNzZXJ0QWxsb3dlZFNjcmlwdEV4dGVuc2lvbignZGI6Ly9hc3NldHMvRm9vLnB5JyksIHsgY29kZTogJ0lOVkFMSURfQVJHVU1FTlQnIH0pO1xufSk7XG5cbnRlc3QoJ2Fzc2VydE5vVHJhdmVyc2FsOiBjbGVhbiBwYXRoIHBhc3NlcycsICgpID0+IHtcbiAgICBhc3NlcnQuZG9lc05vdFRocm93KCgpID0+IGFzc2VydE5vVHJhdmVyc2FsKCdkYjovL2Fzc2V0cy9zY3JpcHRzL0Zvby50cycpKTtcbn0pO1xuXG50ZXN0KCdhc3NlcnROb1RyYXZlcnNhbDogLi4gc2VnbWVudCByZWplY3RzJywgKCkgPT4ge1xuICAgIGFzc2VydC50aHJvd3MoKCkgPT4gYXNzZXJ0Tm9UcmF2ZXJzYWwoJ2RiOi8vYXNzZXRzLy4uL291dHNpZGUudHMnKSwgeyBjb2RlOiAnUEFUSF9PVVRTSURFX1BST0pFQ1QnIH0pO1xufSk7XG5cbnRlc3QoJ2Fzc2VydENvbnRhaW5lZDogY2hpbGQgcGF0aCBwYXNzZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmRvZXNOb3RUaHJvdygoKSA9PiBhc3NlcnRDb250YWluZWQoJy9wcm9qZWN0L2Fzc2V0cy9zY3JpcHRzL0Zvby50cycsICcvcHJvamVjdC9hc3NldHMnKSk7XG59KTtcblxudGVzdCgnYXNzZXJ0Q29udGFpbmVkOiBzaWJsaW5nIGRpcmVjdG9yeSByZWplY3RzIChhc3NldHMyIHZzIGFzc2V0cyknLCAoKSA9PiB7XG4gICAgYXNzZXJ0LnRocm93cygoKSA9PiBhc3NlcnRDb250YWluZWQoJy9wcm9qZWN0L2Fzc2V0czIvRm9vLnRzJywgJy9wcm9qZWN0L2Fzc2V0cycpLCB7IGNvZGU6ICdQQVRIX09VVFNJREVfUFJPSkVDVCcgfSk7XG59KTtcblxudGVzdCgnYXNzZXJ0Q29udGFpbmVkOiBwYXJlbnQgZGlyZWN0b3J5IHJlamVjdHMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LnRocm93cygoKSA9PiBhc3NlcnRDb250YWluZWQoJy9wcm9qZWN0L0Zvby50cycsICcvcHJvamVjdC9hc3NldHMnKSwgeyBjb2RlOiAnUEFUSF9PVVRTSURFX1BST0pFQ1QnIH0pO1xufSk7XG5cbi8vIOKUgOKUgOKUgCBJbnRlZ3JhdGlvbiB0ZXN0cyB3aXRoIHRlbXAgcHJvamVjdCBkaXJlY3Rvcnkg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRlbXBQcm9qZWN0KCk6IFByb21pc2U8eyBkaXI6IHN0cmluZzsgY2xlYW51cDogKCkgPT4gUHJvbWlzZTx2b2lkPiB9PiB7XG4gICAgY29uc3QgZGlyID0gYXdhaXQgZnMubWtkdGVtcChwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Rlc3Qtc2FuZGJveC0nKSk7XG4gICAgYXdhaXQgZnMuZW5zdXJlRGlyKHBhdGguam9pbihkaXIsICdhc3NldHMnLCAnc2NyaXB0cycpKTtcbiAgICAvLyBDcmVhdGUgYSByZWFsIGZpbGUgZm9yIGV4aXN0aW5nLXBhdGggdGVzdHNcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUocGF0aC5qb2luKGRpciwgJ2Fzc2V0cycsICdzY3JpcHRzJywgJ0V4aXN0aW5nLnRzJyksICcvLyBleGlzdGluZ1xcbicpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRpcixcbiAgICAgICAgY2xlYW51cDogYXN5bmMgKCkgPT4geyBhd2FpdCBmcy5yZW1vdmUoZGlyKTsgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGZha2VNZXNzYWdlQ2xpZW50KHVybFRvRnNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1ZXN0OiBhc3luYyAoX3BrZzogc3RyaW5nLCBfbXNnOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBhcmdzWzBdO1xuICAgICAgICAgICAgaWYgKHVybFRvRnNNYXBbdXJsXSkgcmV0dXJuIHVybFRvRnNNYXBbdXJsXTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBVUkw6ICR7dXJsfWApO1xuICAgICAgICB9LFxuICAgICAgICBzZW5kOiBhc3luYyAoKSA9PiB7fSxcbiAgICAgICAgYnJvYWRjYXN0OiBhc3luYyAoKSA9PiB7fSxcbiAgICAgICAgaW52b2tlQ2FwYWJpbGl0eTogYXN5bmMgKGNhcDogc3RyaW5nLCBhcmdzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChjYXAgPT09ICdhc3NldC51cmxUb0ZzcGF0aCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBhcmdzPy51cmwgPz8gYXJncztcbiAgICAgICAgICAgICAgICBpZiAodXJsVG9Gc01hcFt1cmxdKSByZXR1cm4gdXJsVG9Gc01hcFt1cmxdO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBVUkw6ICR7dXJsfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBjYXBhYmlsaXR5OiAke2NhcH1gKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Q2FwYWJpbGl0eVJlcG9ydDogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgICAgIGVkaXRvclZlcnNpb246ICczLjguOCcsXG4gICAgICAgICAgICBzdXBwb3J0ZWRNZXNzYWdlczogbmV3IFNldChbJ2Fzc2V0LWRiOnVybC10by1mc3BhdGgnXSksXG4gICAgICAgICAgICBwcm9iZVNvdXJjZTogJ3Byb2JlJyxcbiAgICAgICAgICAgIHByb2JlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH0pLFxuICAgICAgICBjbGVhckNhcGFiaWxpdHlDYWNoZTogKCkgPT4ge30sXG4gICAgfTtcbn1cblxudGVzdCgncmVzb2x2ZVNjcmlwdFBhdGggZXhpc3Rpbmc6IHJlc29sdmVzIGEgcmVhbCBmaWxlJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVUZW1wUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nUGF0aCA9IHBhdGguam9pbihkaXIsICdhc3NldHMnLCAnc2NyaXB0cycsICdFeGlzdGluZy50cycpO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBmYWtlTWVzc2FnZUNsaWVudCh7ICdkYjovL2Fzc2V0cy9zY3JpcHRzL0V4aXN0aW5nLnRzJzogZXhpc3RpbmdQYXRoIH0pO1xuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveChjbGllbnQgYXMgYW55LCBkaXIpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzYW5kYm94LnJlc29sdmVTY3JpcHRQYXRoKCdkYjovL2Fzc2V0cy9zY3JpcHRzL0V4aXN0aW5nLnRzJywgJ2V4aXN0aW5nJyk7XG4gICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQudXJsLCAnZGI6Ly9hc3NldHMvc2NyaXB0cy9FeGlzdGluZy50cycpO1xuICAgICAgICBhc3NlcnQub2socmVzdWx0LmZzUGF0aC5pbmNsdWRlcygnRXhpc3RpbmcudHMnKSk7XG4gICAgICAgIGFzc2VydC5vayhyZXN1bHQuYXNzZXRzUm9vdC5pbmNsdWRlcygnYXNzZXRzJykpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgncmVzb2x2ZVNjcmlwdFBhdGggY3JlYXRlOiByZXNvbHZlcyBhIG5vbi1leGlzdGVudCBmaWxlIHVuZGVyIGV4aXN0aW5nIHBhcmVudCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgY2xlYW51cCB9ID0gYXdhaXQgY3JlYXRlVGVtcFByb2plY3QoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBmYWtlTWVzc2FnZUNsaWVudCh7ICdkYjovL2Fzc2V0cy9zY3JpcHRzL05ldy50cyc6IHBhdGguam9pbihkaXIsICdhc3NldHMnLCAnc2NyaXB0cycsICdOZXcudHMnKSB9KTtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goY2xpZW50IGFzIGFueSwgZGlyKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2FuZGJveC5yZXNvbHZlU2NyaXB0UGF0aCgnZGI6Ly9hc3NldHMvc2NyaXB0cy9OZXcudHMnLCAnY3JlYXRlJyk7XG4gICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQudXJsLCAnZGI6Ly9hc3NldHMvc2NyaXB0cy9OZXcudHMnKTtcbiAgICAgICAgYXNzZXJ0Lm9rKHJlc3VsdC5mc1BhdGguaW5jbHVkZXMoJ05ldy50cycpKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ3Jlc29sdmVTY3JpcHRQYXRoIHJlamVjdHMgc3ltbGluayBlc2NhcGUnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyBkaXIsIGNsZWFudXAgfSA9IGF3YWl0IGNyZWF0ZVRlbXBQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgc3ltbGluayBpbnNpZGUgYXNzZXRzIHRoYXQgcG9pbnRzIG91dHNpZGVcbiAgICAgICAgY29uc3Qgb3V0c2lkZURpciA9IHBhdGguam9pbihkaXIsICdvdXRzaWRlJyk7XG4gICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihvdXRzaWRlRGlyKTtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKHBhdGguam9pbihvdXRzaWRlRGlyLCAnZXNjYXBlLnRzJyksICcvLyBlc2NhcGVcXG4nKTtcbiAgICAgICAgY29uc3Qgc3ltbGlua1BhdGggPSBwYXRoLmpvaW4oZGlyLCAnYXNzZXRzJywgJ2VzY2FwZS1saW5rLnRzJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBmcy5zeW1saW5rKHBhdGguam9pbihvdXRzaWRlRGlyLCAnZXNjYXBlLnRzJyksIHN5bWxpbmtQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBPbiBXaW5kb3dzLCBzeW1saW5rcyBtYXkgcmVxdWlyZSBhZG1pbiBwcml2aWxlZ2VzOyBza2lwIGlmIHVuYXZhaWxhYmxlXG4gICAgICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2xpZW50ID0gZmFrZU1lc3NhZ2VDbGllbnQoeyAnZGI6Ly9hc3NldHMvZXNjYXBlLWxpbmsudHMnOiBzeW1saW5rUGF0aCB9KTtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goY2xpZW50IGFzIGFueSwgZGlyKTtcbiAgICAgICAgYXdhaXQgYXNzZXJ0LnJlamVjdHMoXG4gICAgICAgICAgICAoKSA9PiBzYW5kYm94LnJlc29sdmVTY3JpcHRQYXRoKCdkYjovL2Fzc2V0cy9lc2NhcGUtbGluay50cycsICdleGlzdGluZycpLFxuICAgICAgICAgICAgeyBjb2RlOiAnUEFUSF9PVVRTSURFX1BST0pFQ1QnIH1cbiAgICAgICAgKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ3Jlc29sdmVTZWFyY2hQYXRoOiByZXNvbHZlcyByZWxhdGl2ZSBwYXRoIHVuZGVyIGFzc2V0cycsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgY2xlYW51cCB9ID0gYXdhaXQgY3JlYXRlVGVtcFByb2plY3QoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveCh7fSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNhbmRib3gucmVzb2x2ZVNlYXJjaFBhdGgoJ3NjcmlwdHMvRXhpc3RpbmcudHMnKTtcbiAgICAgICAgYXNzZXJ0Lm9rKHJlc3VsdC51cmwuc3RhcnRzV2l0aCgnZGI6Ly9hc3NldHMvJykpO1xuICAgICAgICBhc3NlcnQub2socmVzdWx0LmZzUGF0aC5pbmNsdWRlcygnRXhpc3RpbmcudHMnKSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuIl19