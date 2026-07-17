import { ResourceProvider, ResourceDefinition, ResourceReadResult } from '../types';
import { PrefabTools } from '../tools/prefab-tools';

import { editorMessages } from '../services/default-editor-message-client';
export class PrefabResources implements ResourceProvider {
    getResources(): ResourceDefinition[] {
        return [
            {
                uri: 'cocos://prefabs',
                name: 'prefab_list',
                description: 'All prefab assets in the project with name, path, uuid'
            },
            {
                uri: 'cocos://prefabs/{encoded_path}',
                name: 'prefab_info',
                description: 'Prefab metadata: name, uuid, path. The encoded_path is the URL-encoded asset path.'
            },
            {
                uri: 'cocos://prefabs/edit-state',
                name: 'prefab_edit_state',
                description: 'Whether prefab editing mode is active, which prefab is being edited'
            }
        ];
    }

    async readResource(uri: string, params: Record<string, string>): Promise<ResourceReadResult> {
        if (uri === 'cocos://prefabs') {
            return this.readPrefabList();
        }
        if (uri === 'cocos://prefabs/edit-state') {
            return this.readEditState();
        }
        if (params['encoded_path']) {
            return this.readPrefabInfo(decodeURIComponent(params['encoded_path']));
        }
        throw new Error(`Unknown resource: ${uri}`);
    }

    private async readPrefabList(): Promise<ResourceReadResult> {
        try {
            const results: any[] = await editorMessages.request('asset-db', 'query-assets', {
                pattern: 'db://assets/**/*.prefab'
            });
            const prefabs = results.map(asset => ({
                name: asset.name,
                path: asset.url,
                uuid: asset.uuid
            }));
            return { content: JSON.stringify(prefabs) };
        } catch (err: any) {
            throw new Error(`Failed to list prefabs: ${err.message}`);
        }
    }

    private async readPrefabInfo(assetPath: string): Promise<ResourceReadResult> {
        try {
            const info: any = await editorMessages.request('asset-db', 'query-asset-info', assetPath);
            if (!info) {
                throw new Error(`Prefab not found: ${assetPath}`);
            }

            const content = {
                name: info.name,
                uuid: info.uuid,
                path: info.url,
                type: info.type,
                isDirectory: info.isDirectory || false
            };

            if (info.meta) {
                (content as any).meta = {
                    ver: info.meta.ver,
                    importer: info.meta.importer
                };
            }

            return { content: JSON.stringify(content) };
        } catch (err: any) {
            throw new Error(`Failed to get prefab info: ${err.message}`);
        }
    }

    private async readEditState(): Promise<ResourceReadResult> {
        const editState = PrefabTools.getEditState();
        const editContext = PrefabTools.getEditContext();

        const content = {
            context: editContext,
            prefabStage: editState ? {
                active: true,
                prefabPath: editState.prefabPath,
                prefabUuid: editState.prefabUuid,
                rootUuid: editState.rootUuid,
                openedAt: editState.openedAt
            } : null
        };

        return { content: JSON.stringify(content) };
    }
}
