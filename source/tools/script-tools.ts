import { ToolDefinition, ToolExecutor, ToolResponse } from '../types';
import { toolFailure } from '../services/error-normalizer';
import { editorMessages } from '../services/default-editor-message-client';
import { ProjectPathSandbox } from '../services/project-path-sandbox';
import { ScriptFileService } from '../services/script-file-service';

/**
 * Wave 1 script lifecycle tools: create / read / delete / get_sha.
 *
 * Registered under the `script` category, so the public tool names become
 * `script_create`, `script_read`, `script_delete`, `script_get_sha`.
 */
export class ScriptTools implements ToolExecutor {
    private readonly scripts: ScriptFileService;

    constructor(scripts?: ScriptFileService) {
        this.scripts = scripts ?? new ScriptFileService(editorMessages, new ProjectPathSandbox(editorMessages));
    }

    getTools(): ToolDefinition[] {
        return [
            {
                name: 'create',
                description: 'Create a new TypeScript/JavaScript script under db://assets/. Never overwrites an existing file. Provide "content" or "template" (component | data-model | module).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: { type: 'string', description: 'Target script URL, e.g. db://assets/scripts/MainMenu.ts' },
                        content: { type: 'string', description: 'Full file content. Takes precedence over "template".' },
                        template: { type: 'string', enum: ['component', 'data-model', 'module'], description: 'Built-in template to render when "content" is not provided.' },
                        className: { type: 'string', description: 'Class/interface/module name used by the template. Must be a valid TypeScript identifier.' }
                    },
                    required: ['path'],
                    additionalProperties: false
                }
            },
            {
                name: 'read',
                description: 'Read a script under db://assets/. Returns a line range plus the SHA-256 of the full original file (safe to use as a later edit precondition).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: { type: 'string', description: 'Script URL, e.g. db://assets/scripts/MainMenu.ts' },
                        startLine: { type: 'integer', minimum: 1, description: '1-based first line to return. Defaults to 1.' },
                        lineCount: { type: 'integer', minimum: 1, description: 'Maximum number of lines to return. Defaults to 200.' }
                    },
                    required: ['path'],
                    additionalProperties: false
                }
            },
            {
                name: 'get_sha',
                description: 'Return the SHA-256, size, and mtime of a script without reading its source content.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: { type: 'string', description: 'Script URL, e.g. db://assets/scripts/MainMenu.ts' }
                    },
                    required: ['path'],
                    additionalProperties: false
                }
            },
            {
                name: 'delete',
                description: 'Delete a script under db://assets/. Requires "expectedSha" (the current sha256:...) unless "force" is true. Destructive: refusing the SHA precondition guards against clobbering concurrent edits.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: { type: 'string', description: 'Script URL, e.g. db://assets/scripts/MainMenu.ts' },
                        expectedSha: { type: 'string', description: 'Current SHA-256 of the file (sha256:<hex>). Required unless force is true.' },
                        force: { type: 'boolean', description: 'Destructive: when true, skip the SHA precondition check.', default: false }
                    },
                    required: ['path'],
                    additionalProperties: false
                }
            }
        ];
    }

    async execute(toolName: string, args: any): Promise<ToolResponse> {
        try {
            switch (toolName) {
                case 'create':
                    return { success: true, data: await this.scripts.create(args) };
                case 'read':
                    return { success: true, data: await this.scripts.read(args) };
                case 'get_sha':
                    return { success: true, data: await this.scripts.getSha(args.path) };
                case 'delete':
                    return { success: true, data: await this.scripts.delete(args) };
                default:
                    throw new Error(`Unknown script tool: ${toolName}`);
            }
        } catch (error) {
            return toolFailure(error);
        }
    }
}
