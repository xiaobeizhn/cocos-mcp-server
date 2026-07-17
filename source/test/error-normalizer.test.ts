import test from 'node:test';
import assert from 'node:assert/strict';
import { McpError, normalizeError, toJsonRpcError, toRestStatus, toolFailure } from '../services/error-normalizer';

test('all normalized errors include the structured contract', () => {
    const error = normalizeError(new Error('timed out'));
    assert.equal(error.code, 'TIMEOUT');
    assert.equal(typeof error.retryable, 'boolean');
    assert.deepEqual(error.details, {});
    assert.ok(Array.isArray(error.suggestions));
});

test('preserves structured MCP errors and maps protocol boundaries', () => {
    const error = normalizeError(new McpError('METHOD_NOT_FOUND', 'Unknown method'));
    assert.equal(toJsonRpcError(error).code, -32601);
    assert.equal(toRestStatus(error), 404);
});

test('failed tool responses are structured', () => {
    const response = toolFailure(new Error('Editor unavailable'));
    assert.equal(response.success, false);
    assert.equal((response.error as any)?.code, 'EDITOR_UNAVAILABLE');
});
