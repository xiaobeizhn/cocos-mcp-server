import { ResourceProvider, ResourceDefinition, ResourceReadResult } from '../types';
import { PrefabTools } from '../tools/prefab-tools';

import { editorMessages } from '../services/default-editor-message-client';
export class EditorResources implements ResourceProvider {
    getResources(): ResourceDefinition[] {
        return [
            {
                uri: 'cocos://editor/state',
                name: 'editor_state',
                description: 'Editor readiness: scene loaded status, edit context (scene vs prefab), active scene name'
            },
            {
                uri: 'cocos://editor/info',
                name: 'editor_info',
                description: 'Editor version, Cocos Creator version, platform, Node.js version, project name'
            },
            {
                uri: 'cocos://editor/selection',
                name: 'editor_selection',
                description: 'Currently selected node UUIDs in the hierarchy panel'
            },
            {
                uri: 'cocos://editor/gizmo-state',
                name: 'editor_gizmo_state',
                description: 'Current gizmo tool (position/rotation/scale), pivot mode (pivot/center), coordinate system (local/global)'
            }
        ];
    }

    async readResource(uri: string, params: Record<string, string>): Promise<ResourceReadResult> {
        switch (uri) {
            case 'cocos://editor/state':
                return this.readEditorState();
            case 'cocos://editor/info':
                return this.readEditorInfo();
            case 'cocos://editor/selection':
                return this.readSelection();
            case 'cocos://editor/gizmo-state':
                return this.readGizmoState();
            default:
                throw new Error(`Unknown resource: ${uri}`);
        }
    }

    private async readEditorState(): Promise<ResourceReadResult> {
        const editContext = PrefabTools.getEditContext();
        const editState = PrefabTools.getEditState();

        let sceneInfo: any = null;
        try {
            const tree: any = await editorMessages.request('scene', 'query-node-tree');
            if (tree && tree.uuid) {
                sceneInfo = {
                    name: tree.name || 'Untitled',
                    uuid: tree.uuid,
                    nodeCount: tree.children ? tree.children.length : 0
                };
            }
        } catch {
            // Scene not loaded
        }

        const content = {
            editContext,
            sceneLoaded: sceneInfo !== null,
            activeScene: sceneInfo,
            prefabStage: editState ? {
                active: true,
                prefabPath: editState.prefabPath,
                prefabUuid: editState.prefabUuid,
                rootUuid: editState.rootUuid
            } : null
        };

        return { content: JSON.stringify(content) };
    }

    private async readEditorInfo(): Promise<ResourceReadResult> {
        const content = {
            editor: {
                version: (Editor as any).App?.version || 'Unknown',
                cocosVersion: (Editor as any).App?.version || 'Unknown'
            },
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            project: {
                name: Editor.Project.name,
                path: Editor.Project.path,
                uuid: Editor.Project.uuid
            }
        };

        return { content: JSON.stringify(content) };
    }

    private async readSelection(): Promise<ResourceReadResult> {
        try {
            const selected: any = await editorMessages.invokeCapability('selection.queryNodes');
            const content = {
                selected: Array.isArray(selected)
                    ? selected.map((s: any) => typeof s === 'string' ? { uuid: s } : { uuid: s.uuid, name: s.name })
                    : []
            };
            return { content: JSON.stringify(content) };
        } catch {
            return { content: JSON.stringify({ selected: [] }) };
        }
    }

    private async readGizmoState(): Promise<ResourceReadResult> {
        let tool = 'unknown', pivot = 'unknown', coordinate = 'unknown';
        try {
            tool = await editorMessages.request('scene', 'query-gizmo-tool-name');
        } catch { /* ignore */ }
        try {
            pivot = await editorMessages.request('scene', 'query-gizmo-pivot');
        } catch { /* ignore */ }
        try {
            coordinate = await editorMessages.request('scene', 'query-gizmo-coordinate');
        } catch { /* ignore */ }

        return { content: JSON.stringify({ tool, pivot, coordinate }) };
    }
}
