import { ToolDefinition, ToolExecutor, ToolResponse } from '../types';
import { toolFailure } from '../services/error-normalizer';
import { editorMessages } from '../services/default-editor-message-client';
import { ProjectPathSandbox } from '../services/project-path-sandbox';
import { CodeSearchService } from '../services/code-search-service';

/**
 * Wave 1 code search tool. Registered under the `search` category, so the public
 * tool name becomes `search_code`. Searches are scoped to the project `assets/`
 * directory and never follow symlinks or leak absolute disk paths.
 */
export class SearchTools implements ToolExecutor {
    private readonly search: CodeSearchService;

    constructor(search?: CodeSearchService) {
        this.search = search ?? new CodeSearchService(new ProjectPathSandbox(editorMessages));
    }

    getTools(): ToolDefinition[] {
        return [
            {
                name: 'code',
                description: 'Search the project assets/ for literal text or a regular expression. Returns 1-based line/column matches with context, glob filtering, result caps and cursor-based pagination. Paths are returned as db://assets/... URLs.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Search term (literal) or pattern (when regex is true). Lines and columns are 1-based; columns are UTF-16 code units.' },
                        regex: { type: 'boolean', description: 'Treat "query" as a JavaScript regular expression. Default false.', default: false },
                        caseSensitive: { type: 'boolean', description: 'Case-sensitive matching. Default true.', default: true },
                        include: { type: 'array', items: { type: 'string' }, description: 'Glob patterns to include, e.g. ["**/*.ts"]. Defaults to script + json + md files.' },
                        exclude: { type: 'array', items: { type: 'string' }, description: 'Glob patterns to exclude. library/temp/build/node_modules/dist/.git are always excluded.' },
                        contextBefore: { type: 'integer', minimum: 0, maximum: 50, description: 'Lines of context before each match. Default 2.' },
                        contextAfter: { type: 'integer', minimum: 0, maximum: 50, description: 'Lines of context after each match. Default 2.' },
                        maxResults: { type: 'integer', minimum: 1, maximum: 1000, description: 'Maximum matches to return per page. Default 100.' },
                        maxResultsPerFile: { type: 'integer', minimum: 1, description: 'Maximum matches per file. Default 20.' },
                        cursor: { type: 'string', description: 'Opaque pagination cursor returned in the previous page nextCursor. Omit for the first page.' }
                    },
                    required: ['query'],
                    additionalProperties: false
                }
            }
        ];
    }

    async execute(toolName: string, args: any): Promise<ToolResponse> {
        try {
            switch (toolName) {
                case 'code':
                    return { success: true, data: await this.search.search(args) };
                default:
                    throw new Error(`Unknown search tool: ${toolName}`);
            }
        } catch (error) {
            return toolFailure(error);
        }
    }
}
