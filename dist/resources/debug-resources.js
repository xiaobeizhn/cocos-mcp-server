"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugResources = void 0;
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
            const stats = await Editor.Message.request('scene', 'query-performance');
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
            const logs = await Editor.Message.request('console', 'query-log', { limit, level: filter });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWctcmVzb3VyY2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Jlc291cmNlcy9kZWJ1Zy1yZXNvdXJjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxjQUFjO0lBQ3ZCLFlBQVk7UUFDUixPQUFPO1lBQ0g7Z0JBQ0ksR0FBRyxFQUFFLDJCQUEyQjtnQkFDaEMsSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsV0FBVyxFQUFFLG9GQUFvRjthQUNwRztZQUNEO2dCQUNJLEdBQUcsRUFBRSx1QkFBdUI7Z0JBQzVCLElBQUksRUFBRSxjQUFjO2dCQUNwQixXQUFXLEVBQUUsb0VBQW9FO2FBQ3BGO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQVcsRUFBRSxNQUE4QjtRQUMxRCxJQUFJLEdBQUcsS0FBSywyQkFBMkIsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFDRCxJQUFJLEdBQUcsS0FBSyx1QkFBdUIsRUFBRSxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sS0FBSyxDQUFDLGVBQWU7UUFDekIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQVEsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUM5RSxNQUFNLE9BQU8sR0FBRztnQkFDWixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDO2dCQUMvQixjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDO2dCQUN6QyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDO2dCQUMvQixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDO2dCQUMvQixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sSUFBSSxFQUFFO2FBQzdCLENBQUM7WUFDRixPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBQUMsV0FBTSxDQUFDO1lBQ0wsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLDhDQUE4QyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3BHLENBQUM7SUFDTCxDQUFDO0lBRU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUE4QjtRQUNwRCx5REFBeUQ7UUFDekQseUVBQXlFO1FBQ3pFLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQztRQUV2QyxJQUFJLENBQUM7WUFDRCxNQUFNLElBQUksR0FBUSxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDakcsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUFDLFdBQU0sQ0FBQztZQUNMLGdFQUFnRTtZQUNoRSxPQUFPO2dCQUNILE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNwQixPQUFPLEVBQUUsMkVBQTJFO29CQUNwRixLQUFLO29CQUNMLE1BQU07aUJBQ1QsQ0FBQzthQUNMLENBQUM7UUFDTixDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBOURELHdDQThEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc291cmNlUHJvdmlkZXIsIFJlc291cmNlRGVmaW5pdGlvbiwgUmVzb3VyY2VSZWFkUmVzdWx0IH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgRGVidWdSZXNvdXJjZXMgaW1wbGVtZW50cyBSZXNvdXJjZVByb3ZpZGVyIHtcbiAgICBnZXRSZXNvdXJjZXMoKTogUmVzb3VyY2VEZWZpbml0aW9uW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVyaTogJ2NvY29zOi8vZGVidWcvcGVyZm9ybWFuY2UnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdwZXJmb3JtYW5jZV9zdGF0cycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQZXJmb3JtYW5jZSBzdGF0aXN0aWNzOiBub2RlIGNvdW50LCBjb21wb25lbnQgY291bnQsIGRyYXcgY2FsbHMsIHRyaWFuZ2xlcywgbWVtb3J5J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2RlYnVnL2NvbnNvbGUnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdjb25zb2xlX2xvZ3MnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVjZW50IGNvbnNvbGUgbWVzc2FnZXMuIFN1cHBvcnRzIF9saW1pdCBhbmQgX2ZpbHRlciBxdWVyeSBwYXJhbXMuJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGFzeW5jIHJlYWRSZXNvdXJjZSh1cmk6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgaWYgKHVyaSA9PT0gJ2NvY29zOi8vZGVidWcvcGVyZm9ybWFuY2UnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkUGVyZm9ybWFuY2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJpID09PSAnY29jb3M6Ly9kZWJ1Zy9jb25zb2xlJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZENvbnNvbGUocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcmVzb3VyY2U6ICR7dXJpfWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZFBlcmZvcm1hbmNlKCk6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0czogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktcGVyZm9ybWFuY2UnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgICAgICAgICAgbm9kZUNvdW50OiBzdGF0cy5ub2RlQ291bnQgfHwgMCxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRDb3VudDogc3RhdHMuY29tcG9uZW50Q291bnQgfHwgMCxcbiAgICAgICAgICAgICAgICBkcmF3Q2FsbHM6IHN0YXRzLmRyYXdDYWxscyB8fCAwLFxuICAgICAgICAgICAgICAgIHRyaWFuZ2xlczogc3RhdHMudHJpYW5nbGVzIHx8IDAsXG4gICAgICAgICAgICAgICAgbWVtb3J5OiBzdGF0cy5tZW1vcnkgfHwge31cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeShjb250ZW50KSB9O1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ1BlcmZvcm1hbmNlIHN0YXRzIG5vdCBhdmFpbGFibGUgaW4gZWRpdCBtb2RlJyB9KSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkQ29uc29sZShwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPFJlc291cmNlUmVhZFJlc3VsdD4ge1xuICAgICAgICAvLyBDb25zb2xlIG1lc3NhZ2VzIGFyZSBjYXB0dXJlZCBpbi1tZW1vcnkgYnkgRGVidWdUb29scy5cbiAgICAgICAgLy8gRm9yIHRoZSByZXNvdXJjZSwgd2UgcXVlcnkgdGhlIGVkaXRvcidzIGJ1aWx0LWluIGNvbnNvbGUgaWYgYXZhaWxhYmxlLlxuICAgICAgICBjb25zdCBsaW1pdCA9IHBhcnNlSW50KHBhcmFtcy5fbGltaXQgfHwgJzUwJywgMTApO1xuICAgICAgICBjb25zdCBmaWx0ZXIgPSBwYXJhbXMuX2ZpbHRlciB8fCAnYWxsJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbG9nczogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29uc29sZScsICdxdWVyeS1sb2cnLCB7IGxpbWl0LCBsZXZlbDogZmlsdGVyIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogSlNPTi5zdHJpbmdpZnkobG9ncykgfTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBGYWxsYmFjazogcmV0dXJuIGJhc2ljIGluZm8gaWYgY29uc29sZSBxdWVyeSBpcyBub3QgYXZhaWxhYmxlXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0NvbnNvbGUgbG9nIHF1ZXJ5IG5vdCBhdmFpbGFibGUuIFVzZSBkZWJ1Z19nZXRfY29uc29sZV9sb2dzIHRvb2wgaW5zdGVhZC4nLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=