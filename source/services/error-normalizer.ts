import { ErrorCode, StructuredError, ToolResponse } from '../types';

const retryableCodes = new Set<ErrorCode>(['EDITOR_BUSY', 'EDITOR_UNAVAILABLE', 'TIMEOUT']);

const suggestions: Record<ErrorCode, string[]> = {
    INVALID_ARGUMENT: ['Check the request arguments against the tool schema.'],
    NOT_FOUND: ['Verify the UUID or path and refresh the editor state.'],
    AMBIGUOUS_TARGET: ['Use a UUID or a more specific selector.'],
    INVALID_PROPERTY: ['Check the component property path and value type.'],
    EDITOR_BUSY: ['Wait for the editor to become ready, then retry.'],
    EDITOR_UNAVAILABLE: ['Confirm Cocos Creator and the extension are running.'],
    COMPILE_ERROR: ['Resolve script compilation errors before retrying.'],
    UNSUPPORTED_CAPABILITY: ['Use a supported Cocos Creator 3.8.6–3.8.8 editor capability.'],
    TOOL_NOT_FOUND: ['Use tools/list to inspect available tool names.'],
    RESOURCE_NOT_FOUND: ['Use resources/list to inspect available resource URIs.'],
    METHOD_NOT_FOUND: ['Use the MCP protocol methods advertised during initialize.'],
    TIMEOUT: ['Wait for the editor operation to complete, then retry.'],
    INTERNAL_ERROR: ['Inspect the extension and Creator logs for diagnostic details.'],
    ALREADY_EXISTS: ['Choose a different script path, or delete the existing asset first.'],
    CONFLICT: ['Re-read the script to obtain the current SHA, then retry the operation.'],
    PATH_OUTSIDE_PROJECT: ['Use a path under db://assets/ and avoid traversal or absolute paths.'],
    FILE_TOO_LARGE: ['Reduce the file size, or narrow the search/read scope to a smaller range.']
};

export class McpError extends Error {
    public readonly structured: StructuredError;

    constructor(code: ErrorCode, message?: string, options: Partial<Omit<StructuredError, 'code' | 'message'>> = {}) {
        const resolvedMessage = message || code.replace(/_/g, ' ').toLowerCase();
        super(resolvedMessage);
        this.name = 'McpError';
        this.structured = createStructuredError(code, resolvedMessage, options);
    }

    /** Convenience accessor mirroring structured.code, so error-shape matching works. */
    get code(): ErrorCode { return this.structured.code; }
}

export function createStructuredError(
    code: ErrorCode,
    message: string,
    options: Partial<Omit<StructuredError, 'code' | 'message'>> = {}
): StructuredError {
    return {
        code,
        message,
        retryable: options.retryable ?? retryableCodes.has(code),
        details: options.details ?? {},
        suggestions: options.suggestions ?? suggestions[code]
    };
}

export function normalizeError(error: unknown, fallbackCode: ErrorCode = 'INTERNAL_ERROR', details: Record<string, unknown> = {}): StructuredError {
    if (error instanceof McpError) {
        return { ...error.structured, details: { ...error.structured.details, ...details } };
    }

    if (isStructuredError(error)) {
        return {
            ...createStructuredError(error.code, error.message, error),
            details: { ...error.details, ...details }
        };
    }

    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unexpected internal error';
    const lower = message.toLowerCase();
    let code = fallbackCode;
    if (/timeout|timed out/.test(lower)) code = 'TIMEOUT';
    else if (/not ready|busy|importing/.test(lower)) code = 'EDITOR_BUSY';
    else if (/channel.*unavailable|editor.*unavailable|connection.*refused/.test(lower)) code = 'EDITOR_UNAVAILABLE';

    return createStructuredError(code, message, { details });
}

export function toolFailure<T = never>(error: unknown, fallbackCode: ErrorCode = 'INTERNAL_ERROR', details: Record<string, unknown> = {}): ToolResponse<T> {
    return { success: false, error: normalizeError(error, fallbackCode, details) };
}

export function normalizeToolResponse<T>(response: ToolResponse<T> | any, details: Record<string, unknown> = {}): ToolResponse<T> {
    if (response && response.success === false) {
        return { ...response, error: normalizeError(response.error, 'INTERNAL_ERROR', details) };
    }
    return response;
}

export function toJsonRpcError(error: StructuredError): { code: number; message: string; data: StructuredError } {
    const codes: Partial<Record<ErrorCode, number>> = {
        METHOD_NOT_FOUND: -32601,
        INVALID_ARGUMENT: -32602,
        INTERNAL_ERROR: -32603,
        TOOL_NOT_FOUND: -32001,
        RESOURCE_NOT_FOUND: -32002,
        NOT_FOUND: -32003,
        AMBIGUOUS_TARGET: -32004,
        INVALID_PROPERTY: -32005,
        EDITOR_BUSY: -32006,
        EDITOR_UNAVAILABLE: -32007,
        COMPILE_ERROR: -32008,
        UNSUPPORTED_CAPABILITY: -32009,
        TIMEOUT: -32010,
        ALREADY_EXISTS: -32011,
        CONFLICT: -32012,
        PATH_OUTSIDE_PROJECT: -32013,
        FILE_TOO_LARGE: -32014
    };
    return { code: codes[error.code] ?? -32603, message: error.message, data: error };
}

export function toRestStatus(error: StructuredError): number {
    switch (error.code) {
        case 'INVALID_ARGUMENT': case 'AMBIGUOUS_TARGET': case 'PATH_OUTSIDE_PROJECT': return 400;
        case 'TOOL_NOT_FOUND': case 'RESOURCE_NOT_FOUND': case 'NOT_FOUND': case 'METHOD_NOT_FOUND': return 404;
        case 'INVALID_PROPERTY': case 'COMPILE_ERROR': return 422;
        case 'ALREADY_EXISTS': case 'CONFLICT': case 'EDITOR_BUSY': return 409;
        case 'FILE_TOO_LARGE': return 413;
        case 'UNSUPPORTED_CAPABILITY': return 501;
        case 'EDITOR_UNAVAILABLE': return 503;
        case 'TIMEOUT': return 504;
        default: return 500;
    }
}

function isStructuredError(value: any): value is StructuredError {
    return value && typeof value === 'object' && typeof value.code === 'string' && typeof value.message === 'string';
}
