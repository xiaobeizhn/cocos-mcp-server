import { ResourceProvider, ResourceDefinition, ResourceReadResult, SelectionActive, SelectionSnapshot, EditorMessageClient } from '../types';
import { PrefabTools } from '../tools/prefab-tools';
import { normalizeError } from '../services/error-normalizer';

import { editorMessages } from '../services/default-editor-message-client';
export class EditorResources implements ResourceProvider {
    private readonly messages: EditorMessageClient;

    constructor(messages?: EditorMessageClient) {
        this.messages = messages ?? editorMessages;
    }

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
                description: 'Currently selected node UUIDs (selection:query-selection) and the global active node (selection:query-global-activate)'
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
            const tree: any = await this.messages.request('scene', 'query-node-tree');
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
        // Node selection is the primary query — its failure must surface as a
        // structured error, never degrade to an empty array (which would mask an
        // unavailable editor as "nothing selected").
        //
        // In Cocos Creator 3.8 the selected node UUIDs are queried through the
        // synchronous Editor.Selection.getSelected('node') API — there is no
        // `selection:query-selection` IPC message. We use the direct API when
        // available and fall back to the message-based capability for other
        // versions (and for tests, where Editor.Selection is not defined).
        let selected: string[];
        const selectionApi = (globalThis as any)?.Editor?.Selection;
        if (selectionApi && typeof selectionApi.getSelected === 'function') {
            selected = normalizeSelectionUuids(selectionApi.getSelected('node'));
        } else {
            const rawSelected = await this.messages.invokeCapability<string[]>('selection.queryNodes');
            selected = normalizeSelectionUuids(rawSelected);
        }

        const warnings: string[] = [];
        let active: SelectionActive | null = null;
        let activeSource = 'selection:query-global-activate';

        try {
            active = await this.messages.invokeCapability<SelectionActive | null>('selection.queryGlobalActive');
        } catch (error) {
            const normalized = normalizeError(error);
            if (normalized.code !== 'UNSUPPORTED_CAPABILITY') throw error;
            activeSource = 'unsupported';
            active = null;
            warnings.push('Global active selection is unavailable in this Creator version.');
        }

        const snapshot: SelectionSnapshot = {
            type: 'node',
            selected,
            active,
            source: { selected: 'selection:query-selection', active: activeSource },
            warnings,
        };

        return { content: JSON.stringify(snapshot), mimeType: 'application/json' };
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

/**
 * selection:query-selection('node') may return a string[] of uuids, or an array
 * of { uuid, name } records. Normalise to a stable string[] of uuids.
 */
function normalizeSelectionUuids(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item): string | null => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object' && typeof (item as any).uuid === 'string') {
                return (item as any).uuid;
            }
            return null;
        })
        .filter((uuid): uuid is string => uuid !== null);
}
