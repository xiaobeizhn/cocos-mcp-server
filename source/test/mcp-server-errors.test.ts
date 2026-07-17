import test from 'node:test';
import assert from 'node:assert/strict';
import { MCPServer } from '../mcp-server';

const settings = { port: 0, autoStart: false, enableDebugLog: false, allowedOrigins: [], maxConnections: 1 };

test('tool failures are represented as MCP isError results', async () => {
    const server = new MCPServer(settings);
    const response = await (server as any).handleMessage({
        jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'missing_tool', arguments: {} }
    });
    assert.equal(response.result.isError, true);
    const payload = JSON.parse(response.result.content[0].text);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'TOOL_NOT_FOUND');
});

test('unknown JSON-RPC methods return structured method errors', async () => {
    const server = new MCPServer(settings);
    const response = await (server as any).handleMessage({ jsonrpc: '2.0', id: 2, method: 'unknown/method' });
    assert.equal(response.error.code, -32601);
    assert.equal(response.error.data.code, 'METHOD_NOT_FOUND');
    assert.equal(response.error.data.retryable, false);
});

test('unknown resources return structured resource errors', async () => {
    const server = new MCPServer(settings);
    const response = await (server as any).handleMessage({
        jsonrpc: '2.0', id: 3, method: 'resources/read', params: { uri: 'cocos://missing/resource' }
    });
    assert.equal(response.error.data.code, 'RESOURCE_NOT_FOUND');
});
