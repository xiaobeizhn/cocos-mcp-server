import test from 'node:test';
import assert from 'node:assert/strict';

import { ScriptTools } from '../tools/script-tools';
import { ScriptFileService } from '../services/script-file-service';
import { renderScriptTemplate } from '../services/script-file-service';

// ─── Tool registration tests ─────────────────────────────────────────────────

test('ScriptTools exposes four tools', () => {
    const tools = new ScriptTools().getTools();
    assert.equal(tools.length, 4);
    const names = tools.map(t => t.name);
    assert.ok(names.includes('create'));
    assert.ok(names.includes('read'));
    assert.ok(names.includes('get_sha'));
    assert.ok(names.includes('delete'));
});

test('script_create inputSchema requires path', () => {
    const tools = new ScriptTools().getTools();
    const create = tools.find(t => t.name === 'create')!;
    assert.ok(create.inputSchema.required?.includes('path'));
    assert.equal(create.inputSchema.additionalProperties, false);
});

test('script_delete inputSchema has force with default false', () => {
    const tools = new ScriptTools().getTools();
    const del = tools.find(t => t.name === 'delete')!;
    assert.equal(del.inputSchema.properties.force.default, false);
});

test('script_read inputSchema has startLine and lineCount', () => {
    const tools = new ScriptTools().getTools();
    const read = tools.find(t => t.name === 'read')!;
    assert.ok('startLine' in read.inputSchema.properties);
    assert.ok('lineCount' in read.inputSchema.properties);
});

test('script_get_sha inputSchema only requires path', () => {
    const tools = new ScriptTools().getTools();
    const sha = tools.find(t => t.name === 'get_sha')!;
    assert.deepEqual(sha.inputSchema.required, ['path']);
});

// ─── Template rendering tests ────────────────────────────────────────────────

test('component template generates @ccclass and Component import', () => {
    const code = renderScriptTemplate('component', 'MyComp');
    assert.ok(code.includes("@ccclass('MyComp')"));
    assert.ok(code.includes('extends Component'));
    assert.ok(code.includes("import { _decorator, Component } from 'cc'"));
});

test('data-model template generates interface', () => {
    const code = renderScriptTemplate('data-model', 'MyData');
    assert.ok(code.includes('export interface MyData'));
});

test('module template generates const export', () => {
    const code = renderScriptTemplate('module', 'MyModule');
    assert.ok(code.includes('export const MyModule'));
});

test('invalid template throws INVALID_ARGUMENT', () => {
    assert.throws(
        () => renderScriptTemplate('nonexistent' as any, 'Foo'),
        (err: any) => err.structured?.code === 'INVALID_ARGUMENT'
    );
});

// ─── Execute error handling ──────────────────────────────────────────────────

test('execute unknown tool returns failure', async () => {
    const tools = new ScriptTools();
    const result = await tools.execute('nonexistent', {});
    assert.equal(result.success, false);
});
