"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptTools = void 0;
const error_normalizer_1 = require("../services/error-normalizer");
const default_editor_message_client_1 = require("../services/default-editor-message-client");
const project_path_sandbox_1 = require("../services/project-path-sandbox");
const script_file_service_1 = require("../services/script-file-service");
/**
 * Wave 1 script lifecycle tools: create / read / delete / get_sha.
 *
 * Registered under the `script` category, so the public tool names become
 * `script_create`, `script_read`, `script_delete`, `script_get_sha`.
 */
class ScriptTools {
    constructor(scripts) {
        this.scripts = scripts !== null && scripts !== void 0 ? scripts : new script_file_service_1.ScriptFileService(default_editor_message_client_1.editorMessages, new project_path_sandbox_1.ProjectPathSandbox(default_editor_message_client_1.editorMessages));
    }
    getTools() {
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
    async execute(toolName, args) {
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
        }
        catch (error) {
            return (0, error_normalizer_1.toolFailure)(error);
        }
    }
}
exports.ScriptTools = ScriptTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LXRvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rvb2xzL3NjcmlwdC10b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtRUFBMkQ7QUFDM0QsNkZBQTJFO0FBQzNFLDJFQUFzRTtBQUN0RSx5RUFBb0U7QUFFcEU7Ozs7O0dBS0c7QUFDSCxNQUFhLFdBQVc7SUFHcEIsWUFBWSxPQUEyQjtRQUNuQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sYUFBUCxPQUFPLGNBQVAsT0FBTyxHQUFJLElBQUksdUNBQWlCLENBQUMsOENBQWMsRUFBRSxJQUFJLHlDQUFrQixDQUFDLDhDQUFjLENBQUMsQ0FBQyxDQUFDO0lBQzVHLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTztZQUNIO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLFdBQVcsRUFBRSxxS0FBcUs7Z0JBQ2xMLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUseURBQXlELEVBQUU7d0JBQ2hHLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLHNEQUFzRCxFQUFFO3dCQUNoRyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQUUsV0FBVyxFQUFFLDZEQUE2RCxFQUFFO3dCQUNySixTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSwwRkFBMEYsRUFBRTtxQkFDekk7b0JBQ0QsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO29CQUNsQixvQkFBb0IsRUFBRSxLQUFLO2lCQUM5QjthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLE1BQU07Z0JBQ1osV0FBVyxF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RGVmaW5pdGlvbiwgVG9vbEV4ZWN1dG9yLCBUb29sUmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyB0b29sRmFpbHVyZSB9IGZyb20gJy4uL3NlcnZpY2VzL2Vycm9yLW5vcm1hbGl6ZXInO1xuaW1wb3J0IHsgZWRpdG9yTWVzc2FnZXMgfSBmcm9tICcuLi9zZXJ2aWNlcy9kZWZhdWx0LWVkaXRvci1tZXNzYWdlLWNsaWVudCc7XG5pbXBvcnQgeyBQcm9qZWN0UGF0aFNhbmRib3ggfSBmcm9tICcuLi9zZXJ2aWNlcy9wcm9qZWN0LXBhdGgtc2FuZGJveCc7XG5pbXBvcnQgeyBTY3JpcHRGaWxlU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3NjcmlwdC1maWxlLXNlcnZpY2UnO1xuXG4vKipcbiAqIFdhdmUgMSBzY3JpcHQgbGlmZWN5Y2xlIHRvb2xzOiBjcmVhdGUgLyByZWFkIC8gZGVsZXRlIC8gZ2V0X3NoYS5cbiAqXG4gKiBSZWdpc3RlcmVkIHVuZGVyIHRoZSBgc2NyaXB0YCBjYXRlZ29yeSwgc28gdGhlIHB1YmxpYyB0b29sIG5hbWVzIGJlY29tZVxuICogYHNjcmlwdF9jcmVhdGVgLCBgc2NyaXB0X3JlYWRgLCBgc2NyaXB0X2RlbGV0ZWAsIGBzY3JpcHRfZ2V0X3NoYWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBTY3JpcHRUb29scyBpbXBsZW1lbnRzIFRvb2xFeGVjdXRvciB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzY3JpcHRzOiBTY3JpcHRGaWxlU2VydmljZTtcblxuICAgIGNvbnN0cnVjdG9yKHNjcmlwdHM/OiBTY3JpcHRGaWxlU2VydmljZSkge1xuICAgICAgICB0aGlzLnNjcmlwdHMgPSBzY3JpcHRzID8/IG5ldyBTY3JpcHRGaWxlU2VydmljZShlZGl0b3JNZXNzYWdlcywgbmV3IFByb2plY3RQYXRoU2FuZGJveChlZGl0b3JNZXNzYWdlcykpO1xuICAgIH1cblxuICAgIGdldFRvb2xzKCk6IFRvb2xEZWZpbml0aW9uW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgbmV3IFR5cGVTY3JpcHQvSmF2YVNjcmlwdCBzY3JpcHQgdW5kZXIgZGI6Ly9hc3NldHMvLiBOZXZlciBvdmVyd3JpdGVzIGFuIGV4aXN0aW5nIGZpbGUuIFByb3ZpZGUgXCJjb250ZW50XCIgb3IgXCJ0ZW1wbGF0ZVwiIChjb21wb25lbnQgfCBkYXRhLW1vZGVsIHwgbW9kdWxlKS4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7IHR5cGU6ICdzdHJpbmcnLCBkZXNjcmlwdGlvbjogJ1RhcmdldCBzY3JpcHQgVVJMLCBlLmcuIGRiOi8vYXNzZXRzL3NjcmlwdHMvTWFpbk1lbnUudHMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB7IHR5cGU6ICdzdHJpbmcnLCBkZXNjcmlwdGlvbjogJ0Z1bGwgZmlsZSBjb250ZW50LiBUYWtlcyBwcmVjZWRlbmNlIG92ZXIgXCJ0ZW1wbGF0ZVwiLicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7IHR5cGU6ICdzdHJpbmcnLCBlbnVtOiBbJ2NvbXBvbmVudCcsICdkYXRhLW1vZGVsJywgJ21vZHVsZSddLCBkZXNjcmlwdGlvbjogJ0J1aWx0LWluIHRlbXBsYXRlIHRvIHJlbmRlciB3aGVuIFwiY29udGVudFwiIGlzIG5vdCBwcm92aWRlZC4nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHsgdHlwZTogJ3N0cmluZycsIGRlc2NyaXB0aW9uOiAnQ2xhc3MvaW50ZXJmYWNlL21vZHVsZSBuYW1lIHVzZWQgYnkgdGhlIHRlbXBsYXRlLiBNdXN0IGJlIGEgdmFsaWQgVHlwZVNjcmlwdCBpZGVudGlmaWVyLicgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydwYXRoJ10sXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3JlYWQnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVhZCBhIHNjcmlwdCB1bmRlciBkYjovL2Fzc2V0cy8uIFJldHVybnMgYSBsaW5lIHJhbmdlIHBsdXMgdGhlIFNIQS0yNTYgb2YgdGhlIGZ1bGwgb3JpZ2luYWwgZmlsZSAoc2FmZSB0byB1c2UgYXMgYSBsYXRlciBlZGl0IHByZWNvbmRpdGlvbikuJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB0eXBlOiAnc3RyaW5nJywgZGVzY3JpcHRpb246ICdTY3JpcHQgVVJMLCBlLmcuIGRiOi8vYXNzZXRzL3NjcmlwdHMvTWFpbk1lbnUudHMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydExpbmU6IHsgdHlwZTogJ2ludGVnZXInLCBtaW5pbXVtOiAxLCBkZXNjcmlwdGlvbjogJzEtYmFzZWQgZmlyc3QgbGluZSB0byByZXR1cm4uIERlZmF1bHRzIHRvIDEuJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUNvdW50OiB7IHR5cGU6ICdpbnRlZ2VyJywgbWluaW11bTogMSwgZGVzY3JpcHRpb246ICdNYXhpbXVtIG51bWJlciBvZiBsaW5lcyB0byByZXR1cm4uIERlZmF1bHRzIHRvIDIwMC4nIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsncGF0aCddLFxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdnZXRfc2hhJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybiB0aGUgU0hBLTI1Niwgc2l6ZSwgYW5kIG10aW1lIG9mIGEgc2NyaXB0IHdpdGhvdXQgcmVhZGluZyBpdHMgc291cmNlIGNvbnRlbnQuJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB0eXBlOiAnc3RyaW5nJywgZGVzY3JpcHRpb246ICdTY3JpcHQgVVJMLCBlLmcuIGRiOi8vYXNzZXRzL3NjcmlwdHMvTWFpbk1lbnUudHMnIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsncGF0aCddLFxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdkZWxldGUnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRGVsZXRlIGEgc2NyaXB0IHVuZGVyIGRiOi8vYXNzZXRzLy4gUmVxdWlyZXMgXCJleHBlY3RlZFNoYVwiICh0aGUgY3VycmVudCBzaGEyNTY6Li4uKSB1bmxlc3MgXCJmb3JjZVwiIGlzIHRydWUuIERlc3RydWN0aXZlOiByZWZ1c2luZyB0aGUgU0hBIHByZWNvbmRpdGlvbiBndWFyZHMgYWdhaW5zdCBjbG9iYmVyaW5nIGNvbmN1cnJlbnQgZWRpdHMuJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB0eXBlOiAnc3RyaW5nJywgZGVzY3JpcHRpb246ICdTY3JpcHQgVVJMLCBlLmcuIGRiOi8vYXNzZXRzL3NjcmlwdHMvTWFpbk1lbnUudHMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZFNoYTogeyB0eXBlOiAnc3RyaW5nJywgZGVzY3JpcHRpb246ICdDdXJyZW50IFNIQS0yNTYgb2YgdGhlIGZpbGUgKHNoYTI1Njo8aGV4PikuIFJlcXVpcmVkIHVubGVzcyBmb3JjZSBpcyB0cnVlLicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlOiB7IHR5cGU6ICdib29sZWFuJywgZGVzY3JpcHRpb246ICdEZXN0cnVjdGl2ZTogd2hlbiB0cnVlLCBza2lwIHRoZSBTSEEgcHJlY29uZGl0aW9uIGNoZWNrLicsIGRlZmF1bHQ6IGZhbHNlIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsncGF0aCddLFxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgYXN5bmMgZXhlY3V0ZSh0b29sTmFtZTogc3RyaW5nLCBhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3dpdGNoICh0b29sTmFtZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGF3YWl0IHRoaXMuc2NyaXB0cy5jcmVhdGUoYXJncykgfTtcbiAgICAgICAgICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogYXdhaXQgdGhpcy5zY3JpcHRzLnJlYWQoYXJncykgfTtcbiAgICAgICAgICAgICAgICBjYXNlICdnZXRfc2hhJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogYXdhaXQgdGhpcy5zY3JpcHRzLmdldFNoYShhcmdzLnBhdGgpIH07XG4gICAgICAgICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogYXdhaXQgdGhpcy5zY3JpcHRzLmRlbGV0ZShhcmdzKSB9O1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzY3JpcHQgdG9vbDogJHt0b29sTmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB0b29sRmFpbHVyZShlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=