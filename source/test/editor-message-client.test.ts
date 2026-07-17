import test from 'node:test';
import assert from 'node:assert/strict';
import { Cocos38EditorMessageClient } from '../services/editor-message-client';

interface FakeCall { pkg: string; message: string; args: any[]; }

function clientWith(messages: unknown, handler?: (call: FakeCall) => any) {
    const calls: FakeCall[] = [];
    const client = new Cocos38EditorMessageClient({
        getVersion: () => '3.8.8',
        transport: {
            request: async (pkg, message, ...args) => {
                calls.push({ pkg, message, args });
                if (pkg === 'editor' && message === 'query-ipc-events') return messages;
                return handler ? handler({ pkg, message, args }) : undefined;
            },
            send: () => undefined,
            broadcast: () => undefined
        }
    });
    return { client, calls };
}

test('asset.urlToUuid uses the documented asset-db:query-uuid route', async () => {
    const { client, calls } = clientWith(['asset-db:query-uuid'], () => 'uuid-123');
    const result = await client.invokeCapability('asset.urlToUuid', { url: 'db://assets/a.png' });
    assert.equal(result, 'uuid-123');
    assert.deepEqual(calls.at(-1), { pkg: 'asset-db', message: 'query-uuid', args: ['db://assets/a.png'] });
});

test('scene.moveNodes encodes set-parent with {parent, uuids} options object', async () => {
    const { client, calls } = clientWith(['scene:set-parent'], () => ['child-uuid']);
    const result = await client.invokeCapability('scene.moveNodes', { uuid: 'child-uuid', parentUuid: 'parent-uuid', index: -1 });
    assert.deepEqual(result, ['child-uuid']);
    const last = calls.at(-1)!;
    assert.equal(last.pkg, 'scene');
    assert.equal(last.message, 'set-parent');
    assert.deepEqual(last.args, [{ parent: 'parent-uuid', uuids: 'child-uuid', keepWorldTransform: undefined }]);
});

test('scene.duplicateNodes returns normalized uuid array from duplicate-node', async () => {
    const { client, calls } = clientWith(['scene:duplicate-node'], () => ['new-1', 'new-2']);
    const result = await client.invokeCapability('scene.duplicateNodes', { uuid: 'orig' });
    assert.deepEqual(result, ['new-1', 'new-2']);
    assert.deepEqual(calls.at(-1)!.args, ['orig']);
});

test('scene.deleteNodes encodes remove-node with {uuid} options object', async () => {
    const { client, calls } = clientWith(['scene:remove-node'], () => undefined);
    await client.invokeCapability('scene.deleteNodes', { uuid: 'to-delete' });
    assert.deepEqual(calls.at(-1)!.args, [{ uuid: 'to-delete', keepWorldTransform: undefined }]);
});

test('component.add encodes create-component with {uuid, component}', async () => {
    const { client, calls } = clientWith(['scene:create-component'], () => true);
    await client.invokeCapability('component.add', { nodeUuid: 'node-1', componentType: 'cc.Label' });
    assert.deepEqual(calls.at(-1)!.args, [{ uuid: 'node-1', component: 'cc.Label' }]);
});

test('does not retry a write operation after an ambiguous failure', async () => {
    const calls: FakeCall[] = [];
    const client = new Cocos38EditorMessageClient({
        getVersion: () => '3.8.8',
        transport: {
            request: async (pkg, message, ...args) => {
                calls.push({ pkg, message, args });
                if (pkg === 'editor') throw new Error('transport unavailable');
                throw new Error('operation timed out');
            },
            send: () => undefined,
            broadcast: () => undefined
        }
    });
    await assert.rejects(client.invokeCapability('scene.save'));
    const saveCalls = calls.filter(c => c.message === 'save-scene' || c.message === 'stash-and-save');
    assert.equal(saveCalls.length, 1);
});

test('reports unsupported capabilities with useful diagnostics', async () => {
    const { client } = clientWith([]);
    await assert.rejects(client.invokeCapability('scene.save'), (error: any) => {
        assert.equal(error.structured.code, 'UNSUPPORTED_CAPABILITY');
        assert.equal(error.structured.details.editorVersion, '3.8.8');
        assert.equal(error.structured.details.capability, 'scene.save');
        return true;
    });
});
