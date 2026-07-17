import { ResourceProvider, ResourceDefinition, ResourceReadResult } from '../types';

export class ProjectResources implements ResourceProvider {
    getResources(): ResourceDefinition[] {
        return [
            {
                uri: 'cocos://project/info',
                name: 'project_info',
                description: 'Project name, path, uuid, version, Cocos Creator version'
            },
            {
                uri: 'cocos://project/assets',
                name: 'project_assets',
                description: 'Asset list with name, uuid, path, type. Supports _type, _page_size, _cursor query params.'
            },
            {
                uri: 'cocos://project/settings/{category}',
                name: 'project_settings',
                description: 'Project settings by category: general, physics, render, assets'
            }
        ];
    }

    async readResource(uri: string, params: Record<string, string>): Promise<ResourceReadResult> {
        if (uri === 'cocos://project/info') {
            return this.readProjectInfo();
        }
        if (uri === 'cocos://project/assets') {
            return this.readAssets(params);
        }
        if (params['category'] && uri.startsWith('cocos://project/settings/')) {
            return this.readProjectSettings(params['category']);
        }
        throw new Error(`Unknown resource: ${uri}`);
    }

    private async readProjectInfo(): Promise<ResourceReadResult> {
        const content = {
            name: Editor.Project.name,
            path: Editor.Project.path,
            uuid: Editor.Project.uuid,
            version: (Editor.Project as any).version || '1.0.0',
            cocosVersion: (Editor as any).versions?.cocos || 'Unknown'
        };

        try {
            const config: any = await Editor.Message.request('project', 'query-config', 'project');
            if (config) {
                (content as any).config = config;
            }
        } catch { /* ignore */ }

        return { content: JSON.stringify(content) };
    }

    private async readAssets(params: Record<string, string>): Promise<ResourceReadResult> {
        const type = params._type || 'all';
        const folder = params._folder || 'db://assets';
        const pageSize = parseInt(params._page_size || '50', 10);
        const cursor = parseInt(params._cursor || '0', 10);

        let pattern = `${folder}/**/*`;
        if (type !== 'all') {
            const typeExtensions: Record<string, string> = {
                'scene': '.scene',
                'prefab': '.prefab',
                'script': '.{ts,js}',
                'texture': '.{png,jpg,jpeg,gif,tga,bmp,psd}',
                'material': '.mtl',
                'mesh': '.{fbx,obj,dae}',
                'audio': '.{mp3,ogg,wav,m4a}',
                'animation': '.{anim,clip}'
            };
            const ext = typeExtensions[type];
            if (ext) {
                pattern = `${folder}/**/*${ext}`;
            }
        }

        try {
            const results: any[] = await Editor.Message.request('asset-db', 'query-assets', { pattern });
            const assets = results.map(asset => ({
                name: asset.name,
                uuid: asset.uuid,
                path: asset.url,
                type: asset.type,
                isDirectory: asset.isDirectory || false
            }));

            const paged = assets.slice(cursor, cursor + pageSize);
            const nextCursor = cursor + paged.length < assets.length ? cursor + paged.length : null;

            return {
                content: JSON.stringify({
                    items: paged,
                    totalCount: assets.length,
                    type,
                    pageSize,
                    cursor,
                    nextCursor,
                    hasMore: nextCursor !== null
                })
            };
        } catch (err: any) {
            throw new Error(`Failed to query assets: ${err.message}`);
        }
    }

    private async readProjectSettings(category: string): Promise<ResourceReadResult> {
        const configMap: Record<string, string> = {
            general: 'project',
            physics: 'physics',
            render: 'render',
            assets: 'asset-db'
        };

        const configName = configMap[category] || 'project';

        try {
            const settings: any = await Editor.Message.request('project', 'query-config', configName);
            return { content: JSON.stringify({ category, config: settings }) };
        } catch (err: any) {
            throw new Error(`Failed to get ${category} settings: ${err.message}`);
        }
    }
}
