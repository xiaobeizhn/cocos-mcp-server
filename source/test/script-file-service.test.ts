import test from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'path';
import * as fs from 'fs-extra';
import { createHash } from 'crypto';

import { ScriptFileService } from '../services/script-file-service';
import { ProjectPathSandbox } from '../services/project-path-sandbox';
import { McpError } from '../services/error-normalizer';

// ─── Fake message client ─────────────────────────────────────────────────────

interface FakeCall {
    capability: string;
    args: any;
}

function fakeMessageClient(urlToFsMap: Record<string, string>) {
    const calls: FakeCall[] = [];
    const client = {
        calls,
        request: async (_pkg: string, _msg: string, ...args: any[]) => {
            const url = args[0];
            if (urlToFsMap[url]) return urlToFsMap[url];
            throw new Error(`Unknown URL: ${url}`);
        },
        send: async () => {},
        broadcast: async () => {},
        invokeCapability: async (cap: string, args: any) => {
            calls.push({ capability: cap, args });
            if (cap === 'asset.urlToFspath') {
                const url = args?.url ?? args;
                if (urlToFsMap[url]) return urlToFsMap[url];
                throw new Error(`Unknown URL: ${url}`);
            }
            if (cap === 'asset.create') {
                return { uuid: 'fake-uuid-1234', url: args?.url };
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
        clearCapabilityCache: () => {},
    };
    return client;
}

// ─── Temp project helpers ────────────────────────────────────────────────────

async function createTempProject(): Promise<{ dir: string; assetsDir: string; cleanup: () => Promise<void> }> {
    const dir = await fs.mkdtemp(path.join(process.cwd(), 'test-script-'));
    const assetsDir = path.join(dir, 'assets', 'scripts');
    await fs.ensureDir(assetsDir);
    return { dir, assetsDir, cleanup: async () => { await fs.remove(dir); } };
}

function makeUrlMap(dir: string, relativePaths: string[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const rel of relativePaths) {
        const url = 'db://assets/' + rel.replace(/\\/g, '/');
        map[url] = path.join(dir, 'assets', rel);
    }
    return map;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test('getSha: computes correct SHA-256 over raw bytes', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'const x = 1;\n';
        const filePath = path.join(assetsDir, 'ShaTest.ts');
        await fs.writeFile(filePath, content);
        const urlMap = makeUrlMap(dir, ['scripts/ShaTest.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const meta = await service.getSha('db://assets/scripts/ShaTest.ts');
        const expectedSha = 'sha256:' + createHash('sha256').update(content).digest('hex');
        assert.equal(meta.sha, expectedSha);
        assert.equal(meta.size, Buffer.byteLength(content, 'utf8'));
        assert.equal(meta.path, 'db://assets/scripts/ShaTest.ts');
    } finally {
        await cleanup();
    }
});

test('getSha: same content produces same SHA', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'identical content\n';
        await fs.writeFile(path.join(assetsDir, 'A.ts'), content);
        await fs.writeFile(path.join(assetsDir, 'B.ts'), content);
        const urlMap = makeUrlMap(dir, ['scripts/A.ts', 'scripts/B.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const shaA = await service.getSha('db://assets/scripts/A.ts');
        const shaB = await service.getSha('db://assets/scripts/B.ts');
        assert.equal(shaA.sha, shaB.sha);
    } finally {
        await cleanup();
    }
});

test('getSha: different content produces different SHA', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'A.ts'), 'content A\n');
        await fs.writeFile(path.join(assetsDir, 'B.ts'), 'content B\n');
        const urlMap = makeUrlMap(dir, ['scripts/A.ts', 'scripts/B.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const shaA = await service.getSha('db://assets/scripts/A.ts');
        const shaB = await service.getSha('db://assets/scripts/B.ts');
        assert.notEqual(shaA.sha, shaB.sha);
    } finally {
        await cleanup();
    }
});

test('read: returns content and metadata', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'line1\nline2\nline3\n';
        await fs.writeFile(path.join(assetsDir, 'ReadTest.ts'), content);
        const urlMap = makeUrlMap(dir, ['scripts/ReadTest.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const result = await service.read({ path: 'db://assets/scripts/ReadTest.ts' });
        assert.equal(result.content, content);
        // 'line1\nline2\nline3\n' splits into 4 segments (trailing empty from the final newline)
        assert.equal(result.totalLines, 4);
        assert.equal(result.startLine, 1);
        assert.equal(result.returnedLines, 4);
        assert.equal(result.truncated, false);
        assert.equal(result.encoding, 'utf8');
    } finally {
        await cleanup();
    }
});

test('read: line range works', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'line1\nline2\nline3\nline4\nline5\n';
        await fs.writeFile(path.join(assetsDir, 'RangeTest.ts'), content);
        const urlMap = makeUrlMap(dir, ['scripts/RangeTest.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const result = await service.read({ path: 'db://assets/scripts/RangeTest.ts', startLine: 2, lineCount: 2 });
        assert.equal(result.startLine, 2);
        assert.equal(result.returnedLines, 2);
        assert.equal(result.truncated, true);
    } finally {
        await cleanup();
    }
});

test('read: SHA is computed over full file even for partial reads', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = 'line1\nline2\nline3\n';
        await fs.writeFile(path.join(assetsDir, 'PartialSha.ts'), content);
        const urlMap = makeUrlMap(dir, ['scripts/PartialSha.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const full = await service.read({ path: 'db://assets/scripts/PartialSha.ts' });
        const partial = await service.read({ path: 'db://assets/scripts/PartialSha.ts', startLine: 1, lineCount: 1 });
        assert.equal(full.sha, partial.sha);
    } finally {
        await cleanup();
    }
});

test('create: creates a new file via asset-db', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const urlMap = makeUrlMap(dir, ['scripts/NewScript.ts']);
        // Pre-populate the file so waitForReadableMeta succeeds
        const newFilePath = path.join(assetsDir, 'NewScript.ts');
        const client = fakeMessageClient(urlMap);
        // Override create to actually write the file
        const origInvoke = client.invokeCapability.bind(client);
        client.invokeCapability = async (cap: string, args: any) => {
            client.calls.push({ capability: cap, args });
            if (cap === 'asset.create') {
                await fs.writeFile(newFilePath, args.content);
                return { uuid: 'new-uuid', url: args.url };
            }
            return origInvoke(cap, args);
        };

        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const result = await service.create({
            path: 'db://assets/scripts/NewScript.ts',
            content: 'export class NewScript {}\n',
        });
        assert.equal(result.created, true);
        assert.equal(result.refreshRequested, true);
        assert.ok(result.sha.startsWith('sha256:'));
    } finally {
        await cleanup();
    }
});

test('create: rejects duplicate with ALREADY_EXISTS', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'Dup.ts'), '// existing\n');
        const urlMap = makeUrlMap(dir, ['scripts/Dup.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        await assert.rejects(
            () => service.create({ path: 'db://assets/scripts/Dup.ts', content: 'new' }),
            (err: any) => err.structured?.code === 'ALREADY_EXISTS'
        );
    } finally {
        await cleanup();
    }
});

test('create: requires content or template', async () => {
    const { dir, cleanup } = await createTempProject();
    try {
        const client = fakeMessageClient({});
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        await assert.rejects(
            () => service.create({ path: 'db://assets/scripts/NoContent.ts' }),
            (err: any) => err.structured?.code === 'INVALID_ARGUMENT'
        );
    } finally {
        await cleanup();
    }
});

test('delete: requires expectedSha without force', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'DelTest.ts'), '// delete me\n');
        const urlMap = makeUrlMap(dir, ['scripts/DelTest.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        await assert.rejects(
            () => service.delete({ path: 'db://assets/scripts/DelTest.ts' }),
            (err: any) => err.structured?.code === 'INVALID_ARGUMENT'
        );
    } finally {
        await cleanup();
    }
});

test('delete: SHA mismatch returns CONFLICT without calling delete-asset', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'Conflict.ts'), '// conflict\n');
        const urlMap = makeUrlMap(dir, ['scripts/Conflict.ts']);
        const client = fakeMessageClient(urlMap);
        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        await assert.rejects(
            () => service.delete({ path: 'db://assets/scripts/Conflict.ts', expectedSha: 'sha256:0000000000000000000000000000000000000000000000000000000000000000' }),
            (err: any) => {
                assert.equal(err.structured?.code, 'CONFLICT');
                // Verify no delete-asset was called
                const deleteCalls = client.calls.filter(c => c.capability === 'asset.delete');
                assert.equal(deleteCalls.length, 0);
                return true;
            }
        );
    } finally {
        await cleanup();
    }
});

test('delete: force=true skips SHA check', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        await fs.writeFile(path.join(assetsDir, 'ForceDel.ts'), '// force delete\n');
        const urlMap = makeUrlMap(dir, ['scripts/ForceDel.ts']);
        const client = fakeMessageClient(urlMap);
        // Override delete to actually remove the file
        const origInvoke = client.invokeCapability.bind(client);
        client.invokeCapability = async (cap: string, args: any) => {
            client.calls.push({ capability: cap, args });
            if (cap === 'asset.delete') {
                await fs.remove(path.join(assetsDir, 'ForceDel.ts'));
                return true;
            }
            return origInvoke(cap, args);
        };

        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const result = await service.delete({ path: 'db://assets/scripts/ForceDel.ts', force: true });
        assert.equal(result.deleted, true);
        assert.ok(result.previousSha.startsWith('sha256:'));
    } finally {
        await cleanup();
    }
});

test('delete: matching SHA succeeds', async () => {
    const { dir, assetsDir, cleanup } = await createTempProject();
    try {
        const content = '// match sha\n';
        const filePath = path.join(assetsDir, 'MatchSha.ts');
        await fs.writeFile(filePath, content);
        const urlMap = makeUrlMap(dir, ['scripts/MatchSha.ts']);
        const client = fakeMessageClient(urlMap);
        // Override delete to actually remove the file
        const origInvoke = client.invokeCapability.bind(client);
        client.invokeCapability = async (cap: string, args: any) => {
            client.calls.push({ capability: cap, args });
            if (cap === 'asset.delete') {
                await fs.remove(filePath);
                return true;
            }
            return origInvoke(cap, args);
        };

        const sandbox = new ProjectPathSandbox(client as any, dir);
        const service = new ScriptFileService(client as any, sandbox);

        const meta = await service.getSha('db://assets/scripts/MatchSha.ts');
        const result = await service.delete({ path: 'db://assets/scripts/MatchSha.ts', expectedSha: meta.sha });
        assert.equal(result.deleted, true);
        assert.equal(result.previousSha, meta.sha);
    } finally {
        await cleanup();
    }
});
