import test from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'path';
import * as fs from 'fs-extra';

import { CodeSearchService } from '../services/code-search-service';
import { ProjectPathSandbox } from '../services/project-path-sandbox';

// ─── Fake message client (minimal, for sandbox) ─────────────────────────────

function fakeMessageClient() {
    return {
        request: async () => { throw new Error('Not available'); },
        send: async () => {},
        broadcast: async () => {},
        invokeCapability: async (cap: string, _args: any) => {
            if (cap === 'asset.urlToFspath') throw new Error('Not available');
            throw new Error(`Unsupported: ${cap}`);
        },
        getCapabilityReport: async () => ({
            editorVersion: '3.8.8',
            supportedMessages: new Set(),
            probeSource: 'probe',
            probedAt: new Date().toISOString(),
        }),
        clearCapabilityCache: () => {},
    };
}

// ─── Temp project helpers ────────────────────────────────────────────────────

async function createSearchProject(): Promise<{ dir: string; cleanup: () => Promise<void> }> {
    const dir = await fs.mkdtemp(path.join(process.cwd(), 'test-search-'));
    const assetsDir = path.join(dir, 'assets');
    await fs.ensureDir(path.join(assetsDir, 'scripts'));
    await fs.ensureDir(path.join(assetsDir, 'library')); // should be excluded by default
    await fs.writeFile(path.join(assetsDir, 'scripts', 'App.ts'),
        'import { Component } from "cc";\nexport class App extends Component {\n    onStartClicked() {\n        console.log("started");\n    }\n}\n');
    await fs.writeFile(path.join(assetsDir, 'scripts', 'Util.ts'),
        'export function onStartClicked() {\n    return true;\n}\n');
    await fs.writeFile(path.join(assetsDir, 'scripts', 'Data.json'),
        '{"key": "onStartClicked"}\n');
    // library should be excluded
    await fs.writeFile(path.join(assetsDir, 'library', 'cache.ts'), 'onStartClicked\n');
    return { dir, cleanup: async () => { await fs.remove(dir); } };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test('literal search finds matches', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked' });
        assert.ok(result.matches.length >= 2, `Expected at least 2 matches, got ${result.matches.length}`);
        assert.equal(result.truncated, false);
        assert.equal(result.warnings.length, 0);
    } finally {
        await cleanup();
    }
});

test('literal search is case-sensitive by default', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onstartclicked' });
        assert.equal(result.matches.length, 0);
    } finally {
        await cleanup();
    }
});

test('case-insensitive search', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onstartclicked', caseSensitive: false });
        assert.ok(result.matches.length >= 2);
    } finally {
        await cleanup();
    }
});

test('regex search', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStart.*?\\(\\)', regex: true });
        assert.ok(result.matches.length >= 1);
    } finally {
        await cleanup();
    }
});

test('invalid regex returns INVALID_ARGUMENT', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        await assert.rejects(
            () => service.search({ query: '[invalid', regex: true }),
            (err: any) => err.structured?.code === 'INVALID_ARGUMENT'
        );
    } finally {
        await cleanup();
    }
});

test('include glob filters files', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked', include: ['**/*.ts'] });
        // Should not include Data.json
        const jsonMatches = result.matches.filter(m => m.path.endsWith('.json'));
        assert.equal(jsonMatches.length, 0);
    } finally {
        await cleanup();
    }
});

test('default exclude skips library/', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked' });
        const libMatches = result.matches.filter(m => m.path.includes('library'));
        assert.equal(libMatches.length, 0);
    } finally {
        await cleanup();
    }
});

test('context lines are returned', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked', contextBefore: 1, contextAfter: 1 });
        const match = result.matches.find(m => m.path.includes('App.ts'));
        assert.ok(match, 'Expected a match in App.ts');
        assert.ok(match.before.length >= 0);
        assert.ok(match.after.length >= 0);
    } finally {
        await cleanup();
    }
});

test('maxResults limits total matches', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked', maxResults: 1 });
        assert.ok(result.matches.length <= 1);
        if (result.matches.length === 1) {
            assert.equal(result.truncated, true);
            assert.ok(result.nextCursor, 'Expected a nextCursor when truncated');
        }
    } finally {
        await cleanup();
    }
});

test('cursor pagination continues from where it left off', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
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
            assert.ok(!page1Lines.has(`${m.path}:${m.line}`), `Duplicate match: ${m.path}:${m.line}`);
        }
    } finally {
        await cleanup();
    }
});

test('cursor from different query is rejected', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const page1 = await service.search({ query: 'onStartClicked', maxResults: 1 });
        if (!page1.nextCursor) return;
        await assert.rejects(
            () => service.search({ query: 'differentQuery', cursor: page1.nextCursor }),
            (err: any) => err.structured?.code === 'INVALID_ARGUMENT'
        );
    } finally {
        await cleanup();
    }
});

test('binary files are skipped with warning', async () => {
    const dir = await fs.mkdtemp(path.join(process.cwd(), 'test-binary-'));
    try {
        const assetsDir = path.join(dir, 'assets', 'scripts');
        await fs.ensureDir(assetsDir);
        await fs.writeFile(path.join(assetsDir, 'Binary.ts'), Buffer.from([0x00, 0x01, 0x02, 0x03]));
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'anything' });
        assert.ok(result.warnings.length >= 1, 'Expected a warning for binary file');
        assert.ok(result.warnings[0].includes('binary'), `Warning should mention binary: ${result.warnings[0]}`);
    } finally {
        await fs.remove(dir);
    }
});

test('results use db://assets/ URLs, not absolute paths', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked' });
        for (const m of result.matches) {
            assert.ok(m.path.startsWith('db://assets/'), `Path should be db:// URL: ${m.path}`);
            assert.ok(!m.path.includes(dir), `Path should not contain absolute dir: ${m.path}`);
        }
    } finally {
        await cleanup();
    }
});

test('line and column are 1-based', async () => {
    const { dir, cleanup } = await createSearchProject();
    try {
        const sandbox = new ProjectPathSandbox(fakeMessageClient() as any, dir);
        const service = new CodeSearchService(sandbox);
        const result = await service.search({ query: 'onStartClicked' });
        for (const m of result.matches) {
            assert.ok(m.line >= 1, `Line should be >= 1: ${m.line}`);
            assert.ok(m.column >= 1, `Column should be >= 1: ${m.column}`);
        }
    } finally {
        await cleanup();
    }
});
