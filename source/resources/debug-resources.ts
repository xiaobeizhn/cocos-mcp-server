import { ResourceProvider, ResourceDefinition, ResourceReadResult } from '../types';

export class DebugResources implements ResourceProvider {
    getResources(): ResourceDefinition[] {
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

    async readResource(uri: string, params: Record<string, string>): Promise<ResourceReadResult> {
        if (uri === 'cocos://debug/performance') {
            return this.readPerformance();
        }
        if (uri === 'cocos://debug/console') {
            return this.readConsole(params);
        }
        throw new Error(`Unknown resource: ${uri}`);
    }

    private async readPerformance(): Promise<ResourceReadResult> {
        try {
            const stats: any = await Editor.Message.request('scene', 'query-performance');
            const content = {
                nodeCount: stats.nodeCount || 0,
                componentCount: stats.componentCount || 0,
                drawCalls: stats.drawCalls || 0,
                triangles: stats.triangles || 0,
                memory: stats.memory || {}
            };
            return { content: JSON.stringify(content) };
        } catch {
            return { content: JSON.stringify({ message: 'Performance stats not available in edit mode' }) };
        }
    }

    private async readConsole(params: Record<string, string>): Promise<ResourceReadResult> {
        // Console messages are captured in-memory by DebugTools.
        // For the resource, we query the editor's built-in console if available.
        const limit = parseInt(params._limit || '50', 10);
        const filter = params._filter || 'all';

        try {
            const logs: any = await Editor.Message.request('console', 'query-log', { limit, level: filter });
            return { content: JSON.stringify(logs) };
        } catch {
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
