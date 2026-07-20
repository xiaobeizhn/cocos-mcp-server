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
const code_search_service_1 = require("../services/code-search-service");
const project_path_sandbox_1 = require("../services/project-path-sandbox");
// ─── Fake message client (minimal, for sandbox) ─────────────────────────────
function fakeMessageClient() {
    return {
        request: async () => { throw new Error('Not available'); },
        send: async () => { },
        broadcast: async () => { },
        invokeCapability: async (cap, _args) => {
            if (cap === 'asset.urlToFspath')
                throw new Error('Not available');
            throw new Error(`Unsupported: ${cap}`);
        },
        getCapabilityReport: async () => ({
            editorVersion: '3.8.8',
            supportedMessages: new Set(),
            probeSource: 'probe',
            probedAt: new Date().toISOString(),
        }),
        clearCapabilityCache: () => { },
    };
}
// ─── Temp project helpers ────────────────────────────────────────────────────
async function createSearchProject() {
    const dir = await fs.mkdtemp(path.join(process.cwd(), 'test-search-'));
    const assetsDir = path.join(dir, 'assets');
    await fs.ensureDir(path.join(assetsDir, 'scripts'));
    await fs.ensureDir(path.join(assetsDir, 'library')); // should be excluded by default
    await fs.writeFile(path.join(assetsDir, 'scripts', 'App.ts'), 'import { Component } from "cc";\nexport class App extends Component {\n    onStartClicked() {\n        console.log("started");\n    }\n}\n');
    await fs.writeFile(path.join(assetsDir, 'scripts', 'Util.ts'), 'export function onStartClicked() {\n    return true;\n}\n');
    await fs.writeFile(path.join(assetsDir, 'scripts', 'Data.json'), '{"key": "onStartClicked"}\n');
    // library should be excluded
    await fs.writeFile(path.join(assetsDir, 'library', 'cache.ts'), 'onStartClicked\n');
    return { dir, cleanup: async () => { await fs.remove(dir); } };
}
// ─── Tests ───────────────────────────────────────────────────────────────────
(0, node_test_1.default)('literal search finds matches', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked' });
        strict_1.default.ok(result.matches.length >= 2, `Expected at least 2 matches, got ${result.matches.length}`);
        strict_1.default.equal(result.truncated, false);
        strict_1.default.equal(result.warnings.length, 0);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('literal search is case-sensitive by default', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onstartclicked' });
        strict_1.default.equal(result.matches.length, 0);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('case-insensitive search', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onstartclicked', caseSensitive: false });
        strict_1.default.ok(result.matches.length >= 2);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('regex search', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStart.*?\\(\\)', regex: true });
        strict_1.default.ok(result.matches.length >= 1);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('invalid regex returns INVALID_ARGUMENT', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        await strict_1.default.rejects(() => service.search({ query: '[invalid', regex: true }), (err) => { var _a; return ((_a = err.structured) === null || _a === void 0 ? void 0 : _a.code) === 'INVALID_ARGUMENT'; });
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('include glob filters files', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked', include: ['**/*.ts'] });
        // Should not include Data.json
        const jsonMatches = result.matches.filter(m => m.path.endsWith('.json'));
        strict_1.default.equal(jsonMatches.length, 0);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('default exclude skips library/', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked' });
        const libMatches = result.matches.filter(m => m.path.includes('library'));
        strict_1.default.equal(libMatches.length, 0);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('context lines are returned', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked', contextBefore: 1, contextAfter: 1 });
        const match = result.matches.find(m => m.path.includes('App.ts'));
        strict_1.default.ok(match, 'Expected a match in App.ts');
        strict_1.default.ok(match.before.length >= 0);
        strict_1.default.ok(match.after.length >= 0);
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('maxResults limits total matches', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked', maxResults: 1 });
        strict_1.default.ok(result.matches.length <= 1);
        if (result.matches.length === 1) {
            strict_1.default.equal(result.truncated, true);
            strict_1.default.ok(result.nextCursor, 'Expected a nextCursor when truncated');
        }
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('cursor pagination continues from where it left off', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        // Use the same maxResults on both pages (changing it would alter the query fingerprint).
        const page1 = await service.search({ query: 'onStartClicked', maxResults: 1 });
        if (!page1.nextCursor) {
            // Not enough results to paginate; skip
            return;
        }
        const page2 = await service.search({ query: 'onStartClicked', maxResults: 1, cursor: page1.nextCursor });
        // Page 2 should not repeat page 1 matches
        const page1Lines = new Set(page1.matches.map(m => `${m.path}:${m.line}`));
        for (const m of page2.matches) {
            strict_1.default.ok(!page1Lines.has(`${m.path}:${m.line}`), `Duplicate match: ${m.path}:${m.line}`);
        }
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('cursor from different query is rejected', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const page1 = await service.search({ query: 'onStartClicked', maxResults: 1 });
        if (!page1.nextCursor)
            return;
        await strict_1.default.rejects(() => service.search({ query: 'differentQuery', cursor: page1.nextCursor }), (err) => { var _a; return ((_a = err.structured) === null || _a === void 0 ? void 0 : _a.code) === 'INVALID_ARGUMENT'; });
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('binary files are skipped with warning', async () => {
    const dir = await fs.mkdtemp(path.join(process.cwd(), 'test-binary-'));
    try {
        const assetsDir = path.join(dir, 'assets', 'scripts');
        await fs.ensureDir(assetsDir);
        await fs.writeFile(path.join(assetsDir, 'Binary.ts'), Buffer.from([0x00, 0x01, 0x02, 0x03]));
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'anything' });
        strict_1.default.ok(result.warnings.length >= 1, 'Expected a warning for binary file');
        strict_1.default.ok(result.warnings[0].includes('binary'), `Warning should mention binary: ${result.warnings[0]}`);
    }
    finally {
        await fs.remove(dir);
    }
});
(0, node_test_1.default)('results use db://assets/ URLs, not absolute paths', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked' });
        for (const m of result.matches) {
            strict_1.default.ok(m.path.startsWith('db://assets/'), `Path should be db:// URL: ${m.path}`);
            strict_1.default.ok(!m.path.includes(dir), `Path should not contain absolute dir: ${m.path}`);
        }
    }
    finally {
        await cleanup();
    }
});
(0, node_test_1.default)('line and column are 1-based', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new project_path_sandbox_1.ProjectPathSandbox(fakeMessageClient(), dir);
        const service = new code_search_service_1.CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked' });
        for (const m of result.matches) {
            strict_1.default.ok(m.line >= 1, `Line should be >= 1: ${m.line}`);
            strict_1.default.ok(m.column >= 1, `Column should be >= 1: ${m.column}`);
        }
    }
    finally {
        await cleanup();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1zZWFyY2gtc2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rlc3QvY29kZS1zZWFyY2gtc2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMERBQTZCO0FBQzdCLGdFQUF3QztBQUN4QywyQ0FBNkI7QUFDN0IsNkNBQStCO0FBRS9CLHlFQUFvRTtBQUNwRSwyRUFBc0U7QUFFdEUsK0VBQStFO0FBRS9FLFNBQVMsaUJBQWlCO0lBQ3RCLE9BQU87UUFDSCxPQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUUsR0FBRSxDQUFDO1FBQ3BCLFNBQVMsRUFBRSxLQUFLLElBQUksRUFBRSxHQUFFLENBQUM7UUFDekIsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLEdBQVcsRUFBRSxLQUFVLEVBQUUsRUFBRTtZQUNoRCxJQUFJLEdBQUcsS0FBSyxtQkFBbUI7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsRSxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFDRCxtQkFBbUIsRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLENBQUM7WUFDOUIsYUFBYSxFQUFFLE9BQU87WUFDdEIsaUJBQWlCLEVBQUUsSUFBSSxHQUFHLEVBQUU7WUFDNUIsV0FBVyxFQUFFLE9BQU87WUFDcEIsUUFBUSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3JDLENBQUM7UUFDRixvQkFBb0IsRUFBRSxHQUFHLEVBQUUsR0FBRSxDQUFDO0tBQ2pDLENBQUM7QUFDTixDQUFDO0FBRUQsZ0ZBQWdGO0FB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LEdBQUcsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sT0FBTyxHQUFHLElBQUksdUNBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUNqRSxLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM3QixnQkFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDekQsZ0JBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7SUFDTCxDQUFDO1lBQVMsQ0FBQztRQUNQLE1BQU0sT0FBTyxFQUFFLENBQUM7SUFDcEIsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHRlc3QgZnJvbSAnbm9kZTp0ZXN0JztcbmltcG9ydCBhc3NlcnQgZnJvbSAnbm9kZTphc3NlcnQvc3RyaWN0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5cbmltcG9ydCB7IENvZGVTZWFyY2hTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvY29kZS1zZWFyY2gtc2VydmljZSc7XG5pbXBvcnQgeyBQcm9qZWN0UGF0aFNhbmRib3ggfSBmcm9tICcuLi9zZXJ2aWNlcy9wcm9qZWN0LXBhdGgtc2FuZGJveCc7XG5cbi8vIOKUgOKUgOKUgCBGYWtlIG1lc3NhZ2UgY2xpZW50IChtaW5pbWFsLCBmb3Igc2FuZGJveCkg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmZ1bmN0aW9uIGZha2VNZXNzYWdlQ2xpZW50KCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVlc3Q6IGFzeW5jICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKCdOb3QgYXZhaWxhYmxlJyk7IH0sXG4gICAgICAgIHNlbmQ6IGFzeW5jICgpID0+IHt9LFxuICAgICAgICBicm9hZGNhc3Q6IGFzeW5jICgpID0+IHt9LFxuICAgICAgICBpbnZva2VDYXBhYmlsaXR5OiBhc3luYyAoY2FwOiBzdHJpbmcsIF9hcmdzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChjYXAgPT09ICdhc3NldC51cmxUb0ZzcGF0aCcpIHRocm93IG5ldyBFcnJvcignTm90IGF2YWlsYWJsZScpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZDogJHtjYXB9YCk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldENhcGFiaWxpdHlSZXBvcnQ6IGFzeW5jICgpID0+ICh7XG4gICAgICAgICAgICBlZGl0b3JWZXJzaW9uOiAnMy44LjgnLFxuICAgICAgICAgICAgc3VwcG9ydGVkTWVzc2FnZXM6IG5ldyBTZXQoKSxcbiAgICAgICAgICAgIHByb2JlU291cmNlOiAncHJvYmUnLFxuICAgICAgICAgICAgcHJvYmVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfSksXG4gICAgICAgIGNsZWFyQ2FwYWJpbGl0eUNhY2hlOiAoKSA9PiB7fSxcbiAgICB9O1xufVxuXG4vLyDilIDilIDilIAgVGVtcCBwcm9qZWN0IGhlbHBlcnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNlYXJjaFByb2plY3QoKTogUHJvbWlzZTx7IGRpcjogc3RyaW5nOyBjbGVhbnVwOiAoKSA9PiBQcm9taXNlPHZvaWQ+IH0+IHtcbiAgICBjb25zdCBkaXIgPSBhd2FpdCBmcy5ta2R0ZW1wKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAndGVzdC1zZWFyY2gtJykpO1xuICAgIGNvbnN0IGFzc2V0c0RpciA9IHBhdGguam9pbihkaXIsICdhc3NldHMnKTtcbiAgICBhd2FpdCBmcy5lbnN1cmVEaXIocGF0aC5qb2luKGFzc2V0c0RpciwgJ3NjcmlwdHMnKSk7XG4gICAgYXdhaXQgZnMuZW5zdXJlRGlyKHBhdGguam9pbihhc3NldHNEaXIsICdsaWJyYXJ5JykpOyAvLyBzaG91bGQgYmUgZXhjbHVkZWQgYnkgZGVmYXVsdFxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnc2NyaXB0cycsICdBcHAudHMnKSxcbiAgICAgICAgJ2ltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCJjY1wiO1xcbmV4cG9ydCBjbGFzcyBBcHAgZXh0ZW5kcyBDb21wb25lbnQge1xcbiAgICBvblN0YXJ0Q2xpY2tlZCgpIHtcXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnRlZFwiKTtcXG4gICAgfVxcbn1cXG4nKTtcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUocGF0aC5qb2luKGFzc2V0c0RpciwgJ3NjcmlwdHMnLCAnVXRpbC50cycpLFxuICAgICAgICAnZXhwb3J0IGZ1bmN0aW9uIG9uU3RhcnRDbGlja2VkKCkge1xcbiAgICByZXR1cm4gdHJ1ZTtcXG59XFxuJyk7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHBhdGguam9pbihhc3NldHNEaXIsICdzY3JpcHRzJywgJ0RhdGEuanNvbicpLFxuICAgICAgICAne1wia2V5XCI6IFwib25TdGFydENsaWNrZWRcIn1cXG4nKTtcbiAgICAvLyBsaWJyYXJ5IHNob3VsZCBiZSBleGNsdWRlZFxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnbGlicmFyeScsICdjYWNoZS50cycpLCAnb25TdGFydENsaWNrZWRcXG4nKTtcbiAgICByZXR1cm4geyBkaXIsIGNsZWFudXA6IGFzeW5jICgpID0+IHsgYXdhaXQgZnMucmVtb3ZlKGRpcik7IH0gfTtcbn1cblxuLy8g4pSA4pSA4pSAIFRlc3RzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG50ZXN0KCdsaXRlcmFsIHNlYXJjaCBmaW5kcyBtYXRjaGVzJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVTZWFyY2hQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goZmFrZU1lc3NhZ2VDbGllbnQoKSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgQ29kZVNlYXJjaFNlcnZpY2Uoc2FuZGJveCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2Uuc2VhcmNoKHsgcXVlcnk6ICdvblN0YXJ0Q2xpY2tlZCcgfSk7XG4gICAgICAgIGFzc2VydC5vayhyZXN1bHQubWF0Y2hlcy5sZW5ndGggPj0gMiwgYEV4cGVjdGVkIGF0IGxlYXN0IDIgbWF0Y2hlcywgZ290ICR7cmVzdWx0Lm1hdGNoZXMubGVuZ3RofWApO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnRydW5jYXRlZCwgZmFsc2UpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0Lndhcm5pbmdzLmxlbmd0aCwgMCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdsaXRlcmFsIHNlYXJjaCBpcyBjYXNlLXNlbnNpdGl2ZSBieSBkZWZhdWx0JywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVTZWFyY2hQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goZmFrZU1lc3NhZ2VDbGllbnQoKSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgQ29kZVNlYXJjaFNlcnZpY2Uoc2FuZGJveCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2Uuc2VhcmNoKHsgcXVlcnk6ICdvbnN0YXJ0Y2xpY2tlZCcgfSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQubWF0Y2hlcy5sZW5ndGgsIDApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgnY2FzZS1pbnNlbnNpdGl2ZSBzZWFyY2gnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyBkaXIsIGNsZWFudXAgfSA9IGF3YWl0IGNyZWF0ZVNlYXJjaFByb2plY3QoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveChmYWtlTWVzc2FnZUNsaWVudCgpIGFzIGFueSwgZGlyKTtcbiAgICAgICAgY29uc3Qgc2VydmljZSA9IG5ldyBDb2RlU2VhcmNoU2VydmljZShzYW5kYm94KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2VydmljZS5zZWFyY2goeyBxdWVyeTogJ29uc3RhcnRjbGlja2VkJywgY2FzZVNlbnNpdGl2ZTogZmFsc2UgfSk7XG4gICAgICAgIGFzc2VydC5vayhyZXN1bHQubWF0Y2hlcy5sZW5ndGggPj0gMik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdyZWdleCBzZWFyY2gnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyBkaXIsIGNsZWFudXAgfSA9IGF3YWl0IGNyZWF0ZVNlYXJjaFByb2plY3QoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveChmYWtlTWVzc2FnZUNsaWVudCgpIGFzIGFueSwgZGlyKTtcbiAgICAgICAgY29uc3Qgc2VydmljZSA9IG5ldyBDb2RlU2VhcmNoU2VydmljZShzYW5kYm94KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2VydmljZS5zZWFyY2goeyBxdWVyeTogJ29uU3RhcnQuKj9cXFxcKFxcXFwpJywgcmVnZXg6IHRydWUgfSk7XG4gICAgICAgIGFzc2VydC5vayhyZXN1bHQubWF0Y2hlcy5sZW5ndGggPj0gMSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdpbnZhbGlkIHJlZ2V4IHJldHVybnMgSU5WQUxJRF9BUkdVTUVOVCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgY2xlYW51cCB9ID0gYXdhaXQgY3JlYXRlU2VhcmNoUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGZha2VNZXNzYWdlQ2xpZW50KCkgYXMgYW55LCBkaXIpO1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gbmV3IENvZGVTZWFyY2hTZXJ2aWNlKHNhbmRib3gpO1xuICAgICAgICBhd2FpdCBhc3NlcnQucmVqZWN0cyhcbiAgICAgICAgICAgICgpID0+IHNlcnZpY2Uuc2VhcmNoKHsgcXVlcnk6ICdbaW52YWxpZCcsIHJlZ2V4OiB0cnVlIH0pLFxuICAgICAgICAgICAgKGVycjogYW55KSA9PiBlcnIuc3RydWN0dXJlZD8uY29kZSA9PT0gJ0lOVkFMSURfQVJHVU1FTlQnXG4gICAgICAgICk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdpbmNsdWRlIGdsb2IgZmlsdGVycyBmaWxlcycsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgY2xlYW51cCB9ID0gYXdhaXQgY3JlYXRlU2VhcmNoUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGZha2VNZXNzYWdlQ2xpZW50KCkgYXMgYW55LCBkaXIpO1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gbmV3IENvZGVTZWFyY2hTZXJ2aWNlKHNhbmRib3gpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXJ2aWNlLnNlYXJjaCh7IHF1ZXJ5OiAnb25TdGFydENsaWNrZWQnLCBpbmNsdWRlOiBbJyoqLyoudHMnXSB9KTtcbiAgICAgICAgLy8gU2hvdWxkIG5vdCBpbmNsdWRlIERhdGEuanNvblxuICAgICAgICBjb25zdCBqc29uTWF0Y2hlcyA9IHJlc3VsdC5tYXRjaGVzLmZpbHRlcihtID0+IG0ucGF0aC5lbmRzV2l0aCgnLmpzb24nKSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChqc29uTWF0Y2hlcy5sZW5ndGgsIDApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgnZGVmYXVsdCBleGNsdWRlIHNraXBzIGxpYnJhcnkvJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVTZWFyY2hQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goZmFrZU1lc3NhZ2VDbGllbnQoKSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgQ29kZVNlYXJjaFNlcnZpY2Uoc2FuZGJveCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2Uuc2VhcmNoKHsgcXVlcnk6ICdvblN0YXJ0Q2xpY2tlZCcgfSk7XG4gICAgICAgIGNvbnN0IGxpYk1hdGNoZXMgPSByZXN1bHQubWF0Y2hlcy5maWx0ZXIobSA9PiBtLnBhdGguaW5jbHVkZXMoJ2xpYnJhcnknKSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChsaWJNYXRjaGVzLmxlbmd0aCwgMCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdjb250ZXh0IGxpbmVzIGFyZSByZXR1cm5lZCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRpciwgY2xlYW51cCB9ID0gYXdhaXQgY3JlYXRlU2VhcmNoUHJvamVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNhbmRib3ggPSBuZXcgUHJvamVjdFBhdGhTYW5kYm94KGZha2VNZXNzYWdlQ2xpZW50KCkgYXMgYW55LCBkaXIpO1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gbmV3IENvZGVTZWFyY2hTZXJ2aWNlKHNhbmRib3gpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXJ2aWNlLnNlYXJjaCh7IHF1ZXJ5OiAnb25TdGFydENsaWNrZWQnLCBjb250ZXh0QmVmb3JlOiAxLCBjb250ZXh0QWZ0ZXI6IDEgfSk7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gcmVzdWx0Lm1hdGNoZXMuZmluZChtID0+IG0ucGF0aC5pbmNsdWRlcygnQXBwLnRzJykpO1xuICAgICAgICBhc3NlcnQub2sobWF0Y2gsICdFeHBlY3RlZCBhIG1hdGNoIGluIEFwcC50cycpO1xuICAgICAgICBhc3NlcnQub2sobWF0Y2guYmVmb3JlLmxlbmd0aCA+PSAwKTtcbiAgICAgICAgYXNzZXJ0Lm9rKG1hdGNoLmFmdGVyLmxlbmd0aCA+PSAwKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ21heFJlc3VsdHMgbGltaXRzIHRvdGFsIG1hdGNoZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyBkaXIsIGNsZWFudXAgfSA9IGF3YWl0IGNyZWF0ZVNlYXJjaFByb2plY3QoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzYW5kYm94ID0gbmV3IFByb2plY3RQYXRoU2FuZGJveChmYWtlTWVzc2FnZUNsaWVudCgpIGFzIGFueSwgZGlyKTtcbiAgICAgICAgY29uc3Qgc2VydmljZSA9IG5ldyBDb2RlU2VhcmNoU2VydmljZShzYW5kYm94KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2VydmljZS5zZWFyY2goeyBxdWVyeTogJ29uU3RhcnRDbGlja2VkJywgbWF4UmVzdWx0czogMSB9KTtcbiAgICAgICAgYXNzZXJ0Lm9rKHJlc3VsdC5tYXRjaGVzLmxlbmd0aCA8PSAxKTtcbiAgICAgICAgaWYgKHJlc3VsdC5tYXRjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC50cnVuY2F0ZWQsIHRydWUpO1xuICAgICAgICAgICAgYXNzZXJ0Lm9rKHJlc3VsdC5uZXh0Q3Vyc29yLCAnRXhwZWN0ZWQgYSBuZXh0Q3Vyc29yIHdoZW4gdHJ1bmNhdGVkJyk7XG4gICAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhd2FpdCBjbGVhbnVwKCk7XG4gICAgfVxufSk7XG5cbnRlc3QoJ2N1cnNvciBwYWdpbmF0aW9uIGNvbnRpbnVlcyBmcm9tIHdoZXJlIGl0IGxlZnQgb2ZmJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVTZWFyY2hQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goZmFrZU1lc3NhZ2VDbGllbnQoKSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgQ29kZVNlYXJjaFNlcnZpY2Uoc2FuZGJveCk7XG4gICAgICAgIC8vIFVzZSB0aGUgc2FtZSBtYXhSZXN1bHRzIG9uIGJvdGggcGFnZXMgKGNoYW5naW5nIGl0IHdvdWxkIGFsdGVyIHRoZSBxdWVyeSBmaW5nZXJwcmludCkuXG4gICAgICAgIGNvbnN0IHBhZ2UxID0gYXdhaXQgc2VydmljZS5zZWFyY2goeyBxdWVyeTogJ29uU3RhcnRDbGlja2VkJywgbWF4UmVzdWx0czogMSB9KTtcbiAgICAgICAgaWYgKCFwYWdlMS5uZXh0Q3Vyc29yKSB7XG4gICAgICAgICAgICAvLyBOb3QgZW5vdWdoIHJlc3VsdHMgdG8gcGFnaW5hdGU7IHNraXBcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYWdlMiA9IGF3YWl0IHNlcnZpY2Uuc2VhcmNoKHsgcXVlcnk6ICdvblN0YXJ0Q2xpY2tlZCcsIG1heFJlc3VsdHM6IDEsIGN1cnNvcjogcGFnZTEubmV4dEN1cnNvciB9KTtcbiAgICAgICAgLy8gUGFnZSAyIHNob3VsZCBub3QgcmVwZWF0IHBhZ2UgMSBtYXRjaGVzXG4gICAgICAgIGNvbnN0IHBhZ2UxTGluZXMgPSBuZXcgU2V0KHBhZ2UxLm1hdGNoZXMubWFwKG0gPT4gYCR7bS5wYXRofToke20ubGluZX1gKSk7XG4gICAgICAgIGZvciAoY29uc3QgbSBvZiBwYWdlMi5tYXRjaGVzKSB7XG4gICAgICAgICAgICBhc3NlcnQub2soIXBhZ2UxTGluZXMuaGFzKGAke20ucGF0aH06JHttLmxpbmV9YCksIGBEdXBsaWNhdGUgbWF0Y2g6ICR7bS5wYXRofToke20ubGluZX1gKTtcbiAgICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgnY3Vyc29yIGZyb20gZGlmZmVyZW50IHF1ZXJ5IGlzIHJlamVjdGVkJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVTZWFyY2hQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goZmFrZU1lc3NhZ2VDbGllbnQoKSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgQ29kZVNlYXJjaFNlcnZpY2Uoc2FuZGJveCk7XG4gICAgICAgIGNvbnN0IHBhZ2UxID0gYXdhaXQgc2VydmljZS5zZWFyY2goeyBxdWVyeTogJ29uU3RhcnRDbGlja2VkJywgbWF4UmVzdWx0czogMSB9KTtcbiAgICAgICAgaWYgKCFwYWdlMS5uZXh0Q3Vyc29yKSByZXR1cm47XG4gICAgICAgIGF3YWl0IGFzc2VydC5yZWplY3RzKFxuICAgICAgICAgICAgKCkgPT4gc2VydmljZS5zZWFyY2goeyBxdWVyeTogJ2RpZmZlcmVudFF1ZXJ5JywgY3Vyc29yOiBwYWdlMS5uZXh0Q3Vyc29yIH0pLFxuICAgICAgICAgICAgKGVycjogYW55KSA9PiBlcnIuc3RydWN0dXJlZD8uY29kZSA9PT0gJ0lOVkFMSURfQVJHVU1FTlQnXG4gICAgICAgICk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXdhaXQgY2xlYW51cCgpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdiaW5hcnkgZmlsZXMgYXJlIHNraXBwZWQgd2l0aCB3YXJuaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGRpciA9IGF3YWl0IGZzLm1rZHRlbXAocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICd0ZXN0LWJpbmFyeS0nKSk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYXNzZXRzRGlyID0gcGF0aC5qb2luKGRpciwgJ2Fzc2V0cycsICdzY3JpcHRzJyk7XG4gICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihhc3NldHNEaXIpO1xuICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUocGF0aC5qb2luKGFzc2V0c0RpciwgJ0JpbmFyeS50cycpLCBCdWZmZXIuZnJvbShbMHgwMCwgMHgwMSwgMHgwMiwgMHgwM10pKTtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goZmFrZU1lc3NhZ2VDbGllbnQoKSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgQ29kZVNlYXJjaFNlcnZpY2Uoc2FuZGJveCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2Uuc2VhcmNoKHsgcXVlcnk6ICdhbnl0aGluZycgfSk7XG4gICAgICAgIGFzc2VydC5vayhyZXN1bHQud2FybmluZ3MubGVuZ3RoID49IDEsICdFeHBlY3RlZCBhIHdhcm5pbmcgZm9yIGJpbmFyeSBmaWxlJyk7XG4gICAgICAgIGFzc2VydC5vayhyZXN1bHQud2FybmluZ3NbMF0uaW5jbHVkZXMoJ2JpbmFyeScpLCBgV2FybmluZyBzaG91bGQgbWVudGlvbiBiaW5hcnk6ICR7cmVzdWx0Lndhcm5pbmdzWzBdfWApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGZzLnJlbW92ZShkaXIpO1xuICAgIH1cbn0pO1xuXG50ZXN0KCdyZXN1bHRzIHVzZSBkYjovL2Fzc2V0cy8gVVJMcywgbm90IGFic29sdXRlIHBhdGhzJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVTZWFyY2hQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goZmFrZU1lc3NhZ2VDbGllbnQoKSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgQ29kZVNlYXJjaFNlcnZpY2Uoc2FuZGJveCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2Uuc2VhcmNoKHsgcXVlcnk6ICdvblN0YXJ0Q2xpY2tlZCcgfSk7XG4gICAgICAgIGZvciAoY29uc3QgbSBvZiByZXN1bHQubWF0Y2hlcykge1xuICAgICAgICAgICAgYXNzZXJ0Lm9rKG0ucGF0aC5zdGFydHNXaXRoKCdkYjovL2Fzc2V0cy8nKSwgYFBhdGggc2hvdWxkIGJlIGRiOi8vIFVSTDogJHttLnBhdGh9YCk7XG4gICAgICAgICAgICBhc3NlcnQub2soIW0ucGF0aC5pbmNsdWRlcyhkaXIpLCBgUGF0aCBzaG91bGQgbm90IGNvbnRhaW4gYWJzb2x1dGUgZGlyOiAke20ucGF0aH1gKTtcbiAgICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcblxudGVzdCgnbGluZSBhbmQgY29sdW1uIGFyZSAxLWJhc2VkJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlyLCBjbGVhbnVwIH0gPSBhd2FpdCBjcmVhdGVTZWFyY2hQcm9qZWN0KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2FuZGJveCA9IG5ldyBQcm9qZWN0UGF0aFNhbmRib3goZmFrZU1lc3NhZ2VDbGllbnQoKSBhcyBhbnksIGRpcik7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSBuZXcgQ29kZVNlYXJjaFNlcnZpY2Uoc2FuZGJveCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlcnZpY2Uuc2VhcmNoKHsgcXVlcnk6ICdvblN0YXJ0Q2xpY2tlZCcgfSk7XG4gICAgICAgIGZvciAoY29uc3QgbSBvZiByZXN1bHQubWF0Y2hlcykge1xuICAgICAgICAgICAgYXNzZXJ0Lm9rKG0ubGluZSA+PSAxLCBgTGluZSBzaG91bGQgYmUgPj0gMTogJHttLmxpbmV9YCk7XG4gICAgICAgICAgICBhc3NlcnQub2sobS5jb2x1bW4gPj0gMSwgYENvbHVtbiBzaG91bGQgYmUgPj0gMTogJHttLmNvbHVtbn1gKTtcbiAgICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IGNsZWFudXAoKTtcbiAgICB9XG59KTtcbiJdfQ==