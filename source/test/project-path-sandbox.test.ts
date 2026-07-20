import test from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'path';
import * as fs from 'fs-extra';

import { ProjectPathSandbox, normalizeToDbAssetsUrl, assertAllowedScriptExtension, assertNoTraversal, assertContained } from '../services/project-path-sandbox';
import { McpError } from '../services/error-normalizer';

// ─── Unit tests for pure path functions ──────────────────────────────────────

test('normalizeToDbAssetsUrl: db://assets/scripts/Foo.ts passes through', () => {
    assert.equal(normalizeToDbAssetsUrl('db://assets/scripts/Foo.ts'), 'db://assets/scripts/Foo.ts');
});

test('normalizeToDbAssetsUrl: assets/ shorthand is normalised', () => {
    assert.equal(normalizeToDbAssetsUrl('assets/scripts/Foo.ts'), 'db://assets/scripts/Foo.ts');
});

test('normalizeToDbAssetsUrl: bare path gets assets/ prefix', () => {
    assert.equal(normalizeToDbAssetsUrl('scripts/Foo.ts'), 'db://assets/scripts/Foo.ts');
});

test('normalizeToDbAssetsUrl: Windows backslashes are normalised', () => {
    assert.equal(normalizeToDbAssetsUrl('assets\\scripts\\Foo.ts'), 'db://assets/scripts/Foo.ts');
});

test('normalizeToDbAssetsUrl: rejects empty string', () => {
    assert.throws(() => normalizeToDbAssetsUrl(''), { code: 'INVALID_ARGUMENT' });
});

test('normalizeToDbAssetsUrl: rejects traversal ..', () => {
    assert.throws(() => normalizeToDbAssetsUrl('db://assets/../outside.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});

test('normalizeToDbAssetsUrl: rejects URL-encoded traversal %2e%2e', () => {
    assert.throws(() => normalizeToDbAssetsUrl('db://assets/%2e%2e/outside.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});

test('normalizeToDbAssetsUrl: rejects absolute Windows path', () => {
    assert.throws(() => normalizeToDbAssetsUrl('C:\\outside.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});

test('normalizeToDbAssetsUrl: rejects UNC path', () => {
    assert.throws(() => normalizeToDbAssetsUrl('\\\\server\\share\\file.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});

test('assertAllowedScriptExtension: .ts passes', () => {
    assert.doesNotThrow(() => assertAllowedScriptExtension('db://assets/Foo.ts'));
});

test('assertAllowedScriptExtension: .tsx passes', () => {
    assert.doesNotThrow(() => assertAllowedScriptExtension('db://assets/Foo.tsx'));
});

test('assertAllowedScriptExtension: .js passes', () => {
    assert.doesNotThrow(() => assertAllowedScriptExtension('db://assets/Foo.js'));
});

test('assertAllowedScriptExtension: .jsx passes', () => {
    assert.doesNotThrow(() => assertAllowedScriptExtension('db://assets/Foo.jsx'));
});

test('assertAllowedScriptExtension: .scene rejects', () => {
    assert.throws(() => assertAllowedScriptExtension('db://assets/Foo.scene'), { code: 'INVALID_ARGUMENT' });
});

test('assertAllowedScriptExtension: .py rejects', () => {
    assert.throws(() => assertAllowedScriptExtension('db://assets/Foo.py'), { code: 'INVALID_ARGUMENT' });
});

test('assertNoTraversal: clean path passes', () => {
    assert.doesNotThrow(() => assertNoTraversal('db://assets/scripts/Foo.ts'));
});

test('assertNoTraversal: .. segment rejects', () => {
    assert.throws(() => assertNoTraversal('db://assets/../outside.ts'), { code: 'PATH_OUTSIDE_PROJECT' });
});

test('assertContained: child path passes', () => {
    assert.doesNotThrow(() => assertContained('/project/assets/scripts/Foo.ts', '/project/assets'));
});

test('assertContained: sibling directory rejects (assets2 vs assets)', () => {
    assert.throws(() => assertContained('/project/assets2/Foo.ts', '/project/assets'), { code: 'PATH_OUTSIDE_PROJECT' });
});

test('assertContained: parent directory rejects', () => {
    assert.throws(() => assertContained('/project/Foo.ts', '/project/assets'), { code: 'PATH_OUTSIDE_PROJECT' });
});

// ─── Integration tests with temp project directory ───────────────────────────

async function createTempProject(): Promise<{ dir: string; cleanup: () => Promise<void> }> {
    const dir = await fs.mkdtemp(path.join(process.cwd(), 'test-sandbox-'));
    await fs.ensureDir(path.join(dir, 'assets', 'scripts'));
    // Create a real file for existing-path tests
    await fs.writeFile(path.join(dir, 'assets', 'scripts', 'Existing.ts'), '// existing\n');
    return {
        dir,
        cleanup: async () => { await fs.remove(dir); }
    };
}

function fakeMessageClient(urlToFsMap: Record<string, string>) {
    return {
        request: async (_pkg: string, _msg: string, ...args: any[]) => {
            const url = args[0];
            if (urlToFsMap[url]) return urlToFsMap[url];
            throw new Error(`Unknown URL: ${url}`);
        },
        send: async () => {},
        broadcast: async () => {},
        invokeCapability: async (cap: string, args: any) => {
            if (cap === 'asset.urlToFspath') {
                const url = args?.url ?? args;
                if (urlToFsMap[url]) return urlToFsMap[url];
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
        clearCapabilityCache: () => {},
    };
}

test('resolveScriptPath existing: resolves a real file', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        const existingPath = path.join(dir, 'assets', 'scripts', 'Existing.ts');
        const client = fakeMessageClient({ 'db://assets/scripts/Existing.ts': existingPath });
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const result = await sandbox.resolveScriptPath('db://assets/scripts/Existing.ts', 'existing');
        assert.equal(result.url, 'db://assets/scripts/Existing.ts');
        assert.ok(result.fsPath.includes('Existing.ts'));
        assert.ok(result.assetsRoot.includes('assets'));
    } finally {
        await cleanup();
    }
});

test('resolveScriptPath create: resolves a non-existent file under existing parent', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        const client = fakeMessageClient({ 'db://assets/scripts/New.ts': path.join(dir, 'assets', 'scripts', 'New.ts') });
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const result = await sandbox.resolveScriptPath('db://assets/scripts/New.ts', 'create');
        assert.equal(result.url, 'db://assets/scripts/New.ts');
        assert.ok(result.fsPath.includes('New.ts'));
    } finally {
        await cleanup();
    }
});

test('resolveScriptPath rejects symlink escape', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        // Create a symlink inside assets that points outside
        const outsideDir = path.join(dir, 'outside');
        await fs.ensureDir(outsideDir);
        await fs.writeFile(path.join(outsideDir, 'escape.ts'), '// escape\n');
        const symlinkPath = path.join(dir, 'assets', 'escape-link.ts');
        try {
            await fs.symlink(path.join(outsideDir, 'escape.ts'), symlinkPath);
        } catch {
            // On Windows, symlinks may require admin privileges; skip if unavailable
            await cleanup();
            return;
        }
        const client = fakeMessageClient({ 'db://assets/escape-link.ts': symlinkPath });
        const sandbox = new ProjectPathSandbox(client as any, dir);
        await assert.rejects(
            () => sandbox.resolveScriptPath('db://assets/escape-link.ts', 'existing'),
            { code: 'PATH_OUTSIDE_PROJECT' }
        );
    } finally {
        await cleanup();
    }
});

test('resolveSearchPath: resolves relative path under assets', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        const sandbox = new ProjectPathSandbox({} as any, dir);
        const result = await sandbox.resolveSearchPath('scripts/Existing.ts');
        assert.ok(result.url.startsWith('db://assets/'));
        assert.ok(result.fsPath.includes('Existing.ts'));
    } finally {
        await cleanup();
    }
});
