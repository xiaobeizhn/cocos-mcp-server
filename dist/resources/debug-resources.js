"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugResources = void 0;
const default_editor_message_client_1 = require("../services/default-editor-message-client");
class DebugResources {
    getResources() {
        return [
            {
                uri: 'cocos://debug/performance',
                name: 'performance_stats',
                description: 'Performance statistics: node count, component count, draw calls, triangles, memory'
            },
            {
                uri: 'cocos://debug/console',
                name: 'console_logs',
                description: 'Recent console messages. Supports _limit and _filter query params.'
            }
        ];
    }
    async readResource(uri, params) {
        if (uri === 'cocos://debug/performance') {
            return this.readPerformance();
        }
        if (uri === 'cocos://debug/console') {
            return this.readConsole(params);
        }
        throw new Error(`Unknown resource: ${uri}`);
    }
    async readPerformance() {
        try {
            const stats = await default_editor_message_client_1.editorMessages.request('scene', 'query-performance');
            const content = {
                nodeCount: stats.nodeCount || 0,
                componentCount: stats.componentCount || 0,
                drawCalls: stats.drawCalls || 0,
                triangles: stats.triangles || 0,
                memory: stats.memory || {}
            };
            return { content: JSON.stringify(content) };
        }
        catch (_a) {
            return { content: JSON.stringify({ message: 'Performance stats not available in edit mode' }) };
        }
    }
    async readConsole(params) {
        // Console messages are captured in-memory by DebugTools.
        // For the resource, we query the editor's built-in console if available.
        const limit = parseInt(params._limit || '50', 10);
        const filter = params._filter || 'all';
        try {
            const logs = await default_editor_message_client_1.editorMessages.request('console', 'query-log', { limit, level: filter });
            return { content: JSON.stringify(logs) };
        }
        catch (_a) {
            // Fallback: return basic info if console query is not available
            return {
                content: JSON.stringify({
                    message: 'Console log query not available. Use debug_get_console_logs tool instead.',
                    limit,
                    filter
                })
            };
        }
    }
}
exports.DebugResources = DebugResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWctcmVzb3VyY2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Jlc291cmNlcy9kZWJ1Zy1yZXNvdXJjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNkZBQTJFO0FBQzNFLE1BQWEsY0FBYztJQUN2QixZQUFZO1FBQ1IsT0FBTztZQUNIO2dCQUNJLEdBQUcsRUFBRSwyQkFBMkI7Z0JBQ2hDLElBQUksRUFBRSxtQkFBbUI7Z0JBQ3pCLFdBQVcsRUFBRSxvRkFBb0Y7YUFDcEc7WUFDRDtnQkFDSSxHQUFHLEVBQUUsdUJBQXVCO2dCQUM1QixJQUFJLEVBQUUsY0FBYztnQkFDcEIsV0FBVyxFQUFFLG9FQUFvRTthQUNwRjtTQUNKLENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFXLEVBQUUsTUFBOEI7UUFDMUQsSUFBSSxHQUFHLEtBQUssMkJBQTJCLEVBQUUsQ0FBQztZQUN0QyxPQUFPLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsSUFBSSxHQUFHLEtBQUssdUJBQXVCLEVBQUUsQ0FBQztZQUNsQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVPLEtBQUssQ0FBQyxlQUFlO1FBQ3pCLElBQUksQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFRLE1BQU0sOENBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDOUUsTUFBTSxPQUFPLEdBQUc7Z0JBQ1osU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLElBQUksQ0FBQztnQkFDL0IsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQztnQkFDekMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLElBQUksQ0FBQztnQkFDL0IsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLElBQUksQ0FBQztnQkFDL0IsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRTthQUM3QixDQUFDO1lBQ0YsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUFDLFdBQU0sQ0FBQztZQUNMLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSw4Q0FBOEMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNwRyxDQUFDO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBOEI7UUFDcEQseURBQXlEO1FBQ3pELHlFQUF5RTtRQUN6RSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUM7UUFFdkMsSUFBSSxDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQVEsTUFBTSw4Q0FBYyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzdDLENBQUM7UUFBQyxXQUFNLENBQUM7WUFDTCxnRUFBZ0U7WUFDaEUsT0FBTztnQkFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDcEIsT0FBTyxFQUFFLDJFQUEyRTtvQkFDcEYsS0FBSztvQkFDTCxNQUFNO2lCQUNULENBQUM7YUFDTCxDQUFDO1FBQ04sQ0FBQztJQUNMLENBQUM7Q0FDSjtBQTlERCx3Q0E4REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZXNvdXJjZVByb3ZpZGVyLCBSZXNvdXJjZURlZmluaXRpb24sIFJlc291cmNlUmVhZFJlc3VsdCB9IGZyb20gJy4uL3R5cGVzJztcblxuaW1wb3J0IHsgZWRpdG9yTWVzc2FnZXMgfSBmcm9tICcuLi9zZXJ2aWNlcy9kZWZhdWx0LWVkaXRvci1tZXNzYWdlLWNsaWVudCc7XG5leHBvcnQgY2xhc3MgRGVidWdSZXNvdXJjZXMgaW1wbGVtZW50cyBSZXNvdXJjZVByb3ZpZGVyIHtcbiAgICBnZXRSZXNvdXJjZXMoKTogUmVzb3VyY2VEZWZpbml0aW9uW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVyaTogJ2NvY29zOi8vZGVidWcvcGVyZm9ybWFuY2UnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdwZXJmb3JtYW5jZV9zdGF0cycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQZXJmb3JtYW5jZSBzdGF0aXN0aWNzOiBub2RlIGNvdW50LCBjb21wb25lbnQgY291bnQsIGRyYXcgY2FsbHMsIHRyaWFuZ2xlcywgbWVtb3J5J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2RlYnVnL2NvbnNvbGUnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdjb25zb2xlX2xvZ3MnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVjZW50IGNvbnNvbGUgbWVzc2FnZXMuIFN1cHBvcnRzIF9saW1pdCBhbmQgX2ZpbHRlciBxdWVyeSBwYXJhbXMuJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGFzeW5jIHJlYWRSZXNvdXJjZSh1cmk6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgaWYgKHVyaSA9PT0gJ2NvY29zOi8vZGVidWcvcGVyZm9ybWFuY2UnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkUGVyZm9ybWFuY2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJpID09PSAnY29jb3M6Ly9kZWJ1Zy9jb25zb2xlJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZENvbnNvbGUocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcmVzb3VyY2U6ICR7dXJpfWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZFBlcmZvcm1hbmNlKCk6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0czogYW55ID0gYXdhaXQgZWRpdG9yTWVzc2FnZXMucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktcGVyZm9ybWFuY2UnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgICAgICAgICAgbm9kZUNvdW50OiBzdGF0cy5ub2RlQ291bnQgfHwgMCxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRDb3VudDogc3RhdHMuY29tcG9uZW50Q291bnQgfHwgMCxcbiAgICAgICAgICAgICAgICBkcmF3Q2FsbHM6IHN0YXRzLmRyYXdDYWxscyB8fCAwLFxuICAgICAgICAgICAgICAgIHRyaWFuZ2xlczogc3RhdHMudHJpYW5nbGVzIHx8IDAsXG4gICAgICAgICAgICAgICAgbWVtb3J5OiBzdGF0cy5tZW1vcnkgfHwge31cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeShjb250ZW50KSB9O1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ1BlcmZvcm1hbmNlIHN0YXRzIG5vdCBhdmFpbGFibGUgaW4gZWRpdCBtb2RlJyB9KSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkQ29uc29sZShwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPFJlc291cmNlUmVhZFJlc3VsdD4ge1xuICAgICAgICAvLyBDb25zb2xlIG1lc3NhZ2VzIGFyZSBjYXB0dXJlZCBpbi1tZW1vcnkgYnkgRGVidWdUb29scy5cbiAgICAgICAgLy8gRm9yIHRoZSByZXNvdXJjZSwgd2UgcXVlcnkgdGhlIGVkaXRvcidzIGJ1aWx0LWluIGNvbnNvbGUgaWYgYXZhaWxhYmxlLlxuICAgICAgICBjb25zdCBsaW1pdCA9IHBhcnNlSW50KHBhcmFtcy5fbGltaXQgfHwgJzUwJywgMTApO1xuICAgICAgICBjb25zdCBmaWx0ZXIgPSBwYXJhbXMuX2ZpbHRlciB8fCAnYWxsJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbG9nczogYW55ID0gYXdhaXQgZWRpdG9yTWVzc2FnZXMucmVxdWVzdCgnY29uc29sZScsICdxdWVyeS1sb2cnLCB7IGxpbWl0LCBsZXZlbDogZmlsdGVyIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogSlNPTi5zdHJpbmdpZnkobG9ncykgfTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBGYWxsYmFjazogcmV0dXJuIGJhc2ljIGluZm8gaWYgY29uc29sZSBxdWVyeSBpcyBub3QgYXZhaWxhYmxlXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0NvbnNvbGUgbG9nIHF1ZXJ5IG5vdCBhdmFpbGFibGUuIFVzZSBkZWJ1Z19nZXRfY29uc29sZV9sb2dzIHRvb2wgaW5zdGVhZC4nLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=