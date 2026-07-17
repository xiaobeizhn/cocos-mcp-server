import { ResourceProvider, ResourceDefinition, ResourceReadResult } from '../types';

import { editorMessages } from '../services/default-editor-message-client';
export class SceneResources implements ResourceProvider {
    getResources(): ResourceDefinition[] {
        return [
            {
                uri: 'cocos://scene/current',
                name: 'current_scene',
                description: 'Current scene: name, uuid, path, root node count'
            },
            {
                uri: 'cocos://scene/list',
                name: 'scene_list',
                description: 'All scene assets in the project with name, path, uuid'
            },
            {
                uri: 'cocos://scene/hierarchy',
                name: 'scene_hierarchy',
                description: 'Scene hierarchy tree with node names, uuids, active flags. Supports _depth query param (default: 10)'
            }
        ];
    }

    async readResource(uri: string, params: Record<string, string>): Promise<ResourceReadResult> {
        switch (uri) {
            case 'cocos://scene/current':
                return this.readCurrentScene();
            case 'cocos://scene/list':
                return this.readSceneList();
            case 'cocos://scene/hierarchy':
                return this.readHierarchy();
            default:
                throw new Error(`Unknown resource: ${uri}`);
        }
    }

    private async readCurrentScene(): Promise<ResourceReadResult> {
        try {
            const tree: any = await editorMessages.request('scene', 'query-node-tree');
            if (tree && tree.uuid) {
                const content = {
                    name: tree.name || 'Untitled',
                    uuid: tree.uuid,
                    type: tree.type || 'cc.Scene',
                    active: tree.active !== undefined ? tree.active : true,
                    nodeCount: tree.children ? tree.children.length : 0
                };
                return { content: JSON.stringify(content) };
            }
        } catch { /* fallback */ }

        try {
            const result: any = await editorMessages.request('scene', 'execute-scene-script', {
                name: 'cocos-mcp-server',
                method: 'getCurrentSceneInfo',
                args: []
            });
            return { content: JSON.stringify(result) };
        } catch (err: any) {
            throw new Error(`Failed to get current scene: ${err.message}`);
        }
    }

    private async readSceneList(): Promise<ResourceReadResult> {
        try {
            const results: any[] = await editorMessages.request('asset-db', 'query-assets', {
                pattern: 'db://assets/**/*.scene'
            });
            const scenes = results.map(asset => ({
                name: asset.name,
                path: asset.url,
                uuid: asset.uuid
            }));
            return { content: JSON.stringify(scenes) };
        } catch (err: any) {
            throw new Error(`Failed to list scenes: ${err.message}`);
        }
    }

    private async readHierarchy(): Promise<ResourceReadResult> {
        try {
            const tree: any = await editorMessages.request('scene', 'query-node-tree');
            if (tree) {
                const hierarchy = this.buildHierarchy(tree, 10);
                return { content: JSON.stringify(hierarchy) };
            }
        } catch { /* fallback */ }

        try {
            const result: any = await editorMessages.request('scene', 'execute-scene-script', {
                name: 'cocos-mcp-server',
                method: 'getSceneHierarchy',
                args: [false]
            });
            return { content: JSON.stringify(result) };
        } catch (err: any) {
            throw new Error(`Failed to get hierarchy: ${err.message}`);
        }
    }

    private buildHierarchy(node: any, maxDepth: number, depth: number = 0): any {
        if (depth >= maxDepth) {
            return { uuid: node.uuid, name: node.name, truncated: true };
        }

        const info: any = {
            uuid: node.uuid,
            name: node.name,
            type: node.type,
            active: node.active
        };

        if (node.children && node.children.length > 0) {
            info.children = node.children.map((child: any) =>
                this.buildHierarchy(child, maxDepth, depth + 1)
            );
        }

        return info;
    }
}
