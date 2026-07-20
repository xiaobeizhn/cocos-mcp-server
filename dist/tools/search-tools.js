"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchTools = void 0;
const error_normalizer_1 = require("../services/error-normalizer");
const default_editor_message_client_1 = require("../services/default-editor-message-client");
const project_path_sandbox_1 = require("../services/project-path-sandbox");
const code_search_service_1 = require("../services/code-search-service");
/**
 * Wave 1 code search tool. Registered under the `search` category, so the public
 * tool name becomes `search_code`. Searches are scoped to the project `assets/`
 * directory and never follow symlinks or leak absolute disk paths.
 */
class SearchTools {
    constructor(search) {
        this.search = search !== null && search !== void 0 ? search : new code_search_service_1.CodeSearchService(new project_path_sandbox_1.ProjectPathSandbox(default_editor_message_client_1.editorMessages));
    }
    getTools() {
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
    async execute(toolName, args) {
        try {
            switch (toolName) {
                case 'code':
                    return { success: true, data: await this.search.search(args) };
                default:
                    throw new Error(`Unknown search tool: ${toolName}`);
            }
        }
        catch (error) {
            return (0, error_normalizer_1.toolFailure)(error);
        }
    }
}
exports.SearchTools = SearchTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLXRvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rvb2xzL3NlYXJjaC10b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtRUFBMkQ7QUFDM0QsNkZBQTJFO0FBQzNFLDJFQUFzRTtBQUN0RSx5RUFBb0U7QUFFcEU7Ozs7R0FJRztBQUNILE1BQWEsV0FBVztJQUdwQixZQUFZLE1BQTBCO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSx1Q0FBaUIsQ0FBQyxJQUFJLHlDQUFrQixDQUFDLDhDQUFjLENBQUMsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTztZQUNIO2dCQUNJLElBQUksRUFBRSxNQUFNO2dCQUNaLFdBQVcsRUFBRSw2TkFBNk47Z0JBQzFPLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsc0hBQXNILEVBQUU7d0JBQzlKLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGtFQUFrRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7d0JBQzNILGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLHdDQUF3QyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7d0JBQ3hHLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLFdBQVcsRUFBRSxtRkFBbUYsRUFBRTt3QkFDdkosT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsV0FBVyxFQUFFLDBGQUEwRixFQUFFO3dCQUM5SixhQUFhLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsZ0RBQWdELEVBQUU7d0JBQzFILFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSwrQ0FBK0MsRUFBRTt3QkFDeEgsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGtEQUFrRCxFQUFFO3dCQUMzSCxpQkFBaUIsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsdUNBQXVDLEVBQUU7d0JBQ3hHLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLDZGQUE2RixFQUFFO3FCQUN6STtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUM7b0JBQ25CLG9CQUFvQixFQUFFLEtBQUs7aUJBQzlCO2FBQ0o7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBZ0IsRUFBRSxJQUFTO1FBQ3JDLElBQUksQ0FBQztZQUNELFFBQVEsUUFBUSxFQUFFLENBQUM7Z0JBQ2YsS0FBSyxNQUFNO29CQUNQLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ25FO29CQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDNUQsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTyxJQUFBLDhCQUFXLEVBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQTdDRCxrQ0E2Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUb29sRGVmaW5pdGlvbiwgVG9vbEV4ZWN1dG9yLCBUb29sUmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyB0b29sRmFpbHVyZSB9IGZyb20gJy4uL3NlcnZpY2VzL2Vycm9yLW5vcm1hbGl6ZXInO1xuaW1wb3J0IHsgZWRpdG9yTWVzc2FnZXMgfSBmcm9tICcuLi9zZXJ2aWNlcy9kZWZhdWx0LWVkaXRvci1tZXNzYWdlLWNsaWVudCc7XG5pbXBvcnQgeyBQcm9qZWN0UGF0aFNhbmRib3ggfSBmcm9tICcuLi9zZXJ2aWNlcy9wcm9qZWN0LXBhdGgtc2FuZGJveCc7XG5pbXBvcnQgeyBDb2RlU2VhcmNoU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2NvZGUtc2VhcmNoLXNlcnZpY2UnO1xuXG4vKipcbiAqIFdhdmUgMSBjb2RlIHNlYXJjaCB0b29sLiBSZWdpc3RlcmVkIHVuZGVyIHRoZSBgc2VhcmNoYCBjYXRlZ29yeSwgc28gdGhlIHB1YmxpY1xuICogdG9vbCBuYW1lIGJlY29tZXMgYHNlYXJjaF9jb2RlYC4gU2VhcmNoZXMgYXJlIHNjb3BlZCB0byB0aGUgcHJvamVjdCBgYXNzZXRzL2BcbiAqIGRpcmVjdG9yeSBhbmQgbmV2ZXIgZm9sbG93IHN5bWxpbmtzIG9yIGxlYWsgYWJzb2x1dGUgZGlzayBwYXRocy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlYXJjaFRvb2xzIGltcGxlbWVudHMgVG9vbEV4ZWN1dG9yIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlYXJjaDogQ29kZVNlYXJjaFNlcnZpY2U7XG5cbiAgICBjb25zdHJ1Y3RvcihzZWFyY2g/OiBDb2RlU2VhcmNoU2VydmljZSkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IHNlYXJjaCA/PyBuZXcgQ29kZVNlYXJjaFNlcnZpY2UobmV3IFByb2plY3RQYXRoU2FuZGJveChlZGl0b3JNZXNzYWdlcykpO1xuICAgIH1cblxuICAgIGdldFRvb2xzKCk6IFRvb2xEZWZpbml0aW9uW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdjb2RlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCB0aGUgcHJvamVjdCBhc3NldHMvIGZvciBsaXRlcmFsIHRleHQgb3IgYSByZWd1bGFyIGV4cHJlc3Npb24uIFJldHVybnMgMS1iYXNlZCBsaW5lL2NvbHVtbiBtYXRjaGVzIHdpdGggY29udGV4dCwgZ2xvYiBmaWx0ZXJpbmcsIHJlc3VsdCBjYXBzIGFuZCBjdXJzb3ItYmFzZWQgcGFnaW5hdGlvbi4gUGF0aHMgYXJlIHJldHVybmVkIGFzIGRiOi8vYXNzZXRzLy4uLiBVUkxzLicsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7IHR5cGU6ICdzdHJpbmcnLCBkZXNjcmlwdGlvbjogJ1NlYXJjaCB0ZXJtIChsaXRlcmFsKSBvciBwYXR0ZXJuICh3aGVuIHJlZ2V4IGlzIHRydWUpLiBMaW5lcyBhbmQgY29sdW1ucyBhcmUgMS1iYXNlZDsgY29sdW1ucyBhcmUgVVRGLTE2IGNvZGUgdW5pdHMuJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnZXg6IHsgdHlwZTogJ2Jvb2xlYW4nLCBkZXNjcmlwdGlvbjogJ1RyZWF0IFwicXVlcnlcIiBhcyBhIEphdmFTY3JpcHQgcmVndWxhciBleHByZXNzaW9uLiBEZWZhdWx0IGZhbHNlLicsIGRlZmF1bHQ6IGZhbHNlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlU2Vuc2l0aXZlOiB7IHR5cGU6ICdib29sZWFuJywgZGVzY3JpcHRpb246ICdDYXNlLXNlbnNpdGl2ZSBtYXRjaGluZy4gRGVmYXVsdCB0cnVlLicsIGRlZmF1bHQ6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1ZGU6IHsgdHlwZTogJ2FycmF5JywgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSwgZGVzY3JpcHRpb246ICdHbG9iIHBhdHRlcm5zIHRvIGluY2x1ZGUsIGUuZy4gW1wiKiovKi50c1wiXS4gRGVmYXVsdHMgdG8gc2NyaXB0ICsganNvbiArIG1kIGZpbGVzLicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IHsgdHlwZTogJ2FycmF5JywgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSwgZGVzY3JpcHRpb246ICdHbG9iIHBhdHRlcm5zIHRvIGV4Y2x1ZGUuIGxpYnJhcnkvdGVtcC9idWlsZC9ub2RlX21vZHVsZXMvZGlzdC8uZ2l0IGFyZSBhbHdheXMgZXhjbHVkZWQuJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dEJlZm9yZTogeyB0eXBlOiAnaW50ZWdlcicsIG1pbmltdW06IDAsIG1heGltdW06IDUwLCBkZXNjcmlwdGlvbjogJ0xpbmVzIG9mIGNvbnRleHQgYmVmb3JlIGVhY2ggbWF0Y2guIERlZmF1bHQgMi4nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0QWZ0ZXI6IHsgdHlwZTogJ2ludGVnZXInLCBtaW5pbXVtOiAwLCBtYXhpbXVtOiA1MCwgZGVzY3JpcHRpb246ICdMaW5lcyBvZiBjb250ZXh0IGFmdGVyIGVhY2ggbWF0Y2guIERlZmF1bHQgMi4nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhSZXN1bHRzOiB7IHR5cGU6ICdpbnRlZ2VyJywgbWluaW11bTogMSwgbWF4aW11bTogMTAwMCwgZGVzY3JpcHRpb246ICdNYXhpbXVtIG1hdGNoZXMgdG8gcmV0dXJuIHBlciBwYWdlLiBEZWZhdWx0IDEwMC4nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhSZXN1bHRzUGVyRmlsZTogeyB0eXBlOiAnaW50ZWdlcicsIG1pbmltdW06IDEsIGRlc2NyaXB0aW9uOiAnTWF4aW11bSBtYXRjaGVzIHBlciBmaWxlLiBEZWZhdWx0IDIwLicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogeyB0eXBlOiAnc3RyaW5nJywgZGVzY3JpcHRpb246ICdPcGFxdWUgcGFnaW5hdGlvbiBjdXJzb3IgcmV0dXJuZWQgaW4gdGhlIHByZXZpb3VzIHBhZ2UgbmV4dEN1cnNvci4gT21pdCBmb3IgdGhlIGZpcnN0IHBhZ2UuJyB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3F1ZXJ5J10sXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlKHRvb2xOYW1lOiBzdHJpbmcsIGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRvb2xOYW1lKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29kZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGF3YWl0IHRoaXMuc2VhcmNoLnNlYXJjaChhcmdzKSB9O1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzZWFyY2ggdG9vbDogJHt0b29sTmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB0b29sRmFpbHVyZShlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=