import test from 'node:test';
import assert from 'node:assert/strict';

import { EditorResources } from '../resources/editor-resources';
import { McpError } from '../services/error-normalizer';

// ─── Fake message client for selection tests ─────────────────────────────────

interface FakeCall {
    capability: string;
    args: any;
}

function fakeMessageClient(options: {
    selectedNodes?: string[] | null;
    globalActive?: { type: 'node'; uuid: string } | null;
    selectionFails?: boolean;
    activeFails?: boolean;
    activeUnsupported?: boolean;
}) {
    const calls: FakeCall[] = [];
    return {
        calls,
        request: async () => { throw new Error('Not available'); },
        send: async () => {},
        broadcast: async () => {},
        invokeCapability: async (cap: string, args: any) => {
            calls.push({ capability: cap, args });
            if (cap === 'selection.queryNodes') {
                if (options.selectionFails) throw new McpError('EDITOR_BUSY', 'Editor busy');
                return options.selectedNodes ?? [];
            }
            if (cap === 'selection.queryGlobalActive') {
                if (options.activeUnsupported) {
                    throw new McpError('UNSUPPORTED_CAPABILITY', 'Not supported');
                }
                if (options.activeFails) throw new McpError('EDITOR_BUSY', 'Editor busy');
                return options.globalActive ?? null;
            }
            throw new Error(`Unsupported capability: ${cap}`);
        },
        getCapabilityReport: async () => ({
            editorVersion: '3.8.8',
            supportedMessages: new Set(['selection:query-selection', 'selection:query-global-activate']),
            probeSource: 'probe',
            probedAt: new Date().toISOString(),
        }),
        clearCapabilityCache: () => {},
    };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test('readSelection returns selected UUIDs and global active', async () => {
    const client = fakeMessageClient({
        selectedNodes: ['uuid-1', 'uuid-2'],
        globalActive: { type: 'node', uuid: 'uuid-2' },
    });
    const resources = new EditorResources(client as any);
    const result = await resources.readResource('cocos://editor/selection', {});
    const data = JSON.parse(result.content!);

    assert.deepEqual(data.selected, ['uuid-1', 'uuid-2']);
    assert.deepEqual(data.active, { type: 'node', uuid: 'uuid-2' });
    assert.equal(data.source.selected, 'selection:query-selection');
    assert.equal(data.source.active, 'selection:query-global-activate');
    assert.equal(data.warnings.length, 0);
});

test('readSelection normalises { uuid, name } records to string[]', async () => {
    const client = fakeMessageClient({
        selectedNodes: [{ uuid: 'uuid-1', name: 'Node1' }, 'uuid-2'] as any,
        globalActive: null,
    });
    const resources = new EditorResources(client as any);
    const result = await resources.readResource('cocos://editor/selection', {});
    const data = JSON.parse(result.content!);

    assert.deepEqual(data.selected, ['uuid-1', 'uuid-2']);
});

test('readSelection degrades active to null when unsupported', async () => {
    const client = fakeMessageClient({
        selectedNodes: ['uuid-1'],
        activeUnsupported: true,
    });
    const resources = new EditorResources(client as any);
    const result = await resources.readResource('cocos://editor/selection', {});
    const data = JSON.parse(result.content!);

    assert.equal(data.active, null);
    assert.equal(data.source.active, 'unsupported');
    assert.ok(data.warnings.length >= 1);
    assert.ok(data.warnings[0].includes('unavailable'));
});

test('readSelection propagates node selection errors (does not swallow)', async () => {
    const client = fakeMessageClient({
        selectionFails: true,
    });
    const resources = new EditorResources(client as any);

    // The old implementation swallowed errors and returned { selected: [] }.
    // The new implementation must propagate the error.
    await assert.rejects(
        () => resources.readResource('cocos://editor/selection', {}),
        (err: any) => err.structured?.code === 'EDITOR_BUSY'
    );
});

test('readSelection propagates non-UNSUPPORTED_CAPABILITY active errors', async () => {
    const client = fakeMessageClient({
        selectedNodes: ['uuid-1'],
        activeFails: true,
    });
    const resources = new EditorResources(client as any);

    await assert.rejects(
        () => resources.readResource('cocos://editor/selection', {}),
        (err: any) => err.structured?.code === 'EDITOR_BUSY'
    );
});

test('readSelection returns empty selected when no nodes are selected', async () => {
    const client = fakeMessageClient({
        selectedNodes: [],
        globalActive: null,
    });
    const resources = new EditorResources(client as any);
    const result = await resources.readResource('cocos://editor/selection', {});
    const data = JSON.parse(result.content!);

    assert.deepEqual(data.selected, []);
    assert.equal(data.active, null);
});
