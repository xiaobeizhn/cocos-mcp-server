"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectResources = void 0;
const default_editor_message_client_1 = require("../services/default-editor-message-client");
class ProjectResources {
    getResources() {
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
    async readResource(uri, params) {
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
    async readProjectInfo() {
        var _a;
        const content = {
            name: Editor.Project.name,
            path: Editor.Project.path,
            uuid: Editor.Project.uuid,
            version: Editor.Project.version || '1.0.0',
            cocosVersion: ((_a = Editor.versions) === null || _a === void 0 ? void 0 : _a.cocos) || 'Unknown'
        };
        try {
            const config = await default_editor_message_client_1.editorMessages.request('project', 'query-config', 'project');
            if (config) {
                content.config = config;
            }
        }
        catch ( /* ignore */_b) { /* ignore */ }
        return { content: JSON.stringify(content) };
    }
    async readAssets(params) {
        const type = params._type || 'all';
        const folder = params._folder || 'db://assets';
        const pageSize = parseInt(params._page_size || '50', 10);
        const cursor = parseInt(params._cursor || '0', 10);
        let pattern = `${folder}/**/*`;
        if (type !== 'all') {
            const typeExtensions = {
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
            const results = await default_editor_message_client_1.editorMessages.request('asset-db', 'query-assets', { pattern });
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
        }
        catch (err) {
            throw new Error(`Failed to query assets: ${err.message}`);
        }
    }
    async readProjectSettings(category) {
        const configMap = {
            general: 'project',
            physics: 'physics',
            render: 'render',
            assets: 'asset-db'
        };
        const configName = configMap[category] || 'project';
        try {
            const settings = await default_editor_message_client_1.editorMessages.request('project', 'query-config', configName);
            return { content: JSON.stringify({ category, config: settings }) };
        }
        catch (err) {
            throw new Error(`Failed to get ${category} settings: ${err.message}`);
        }
    }
}
exports.ProjectResources = ProjectResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC1yZXNvdXJjZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvcmVzb3VyY2VzL3Byb2plY3QtcmVzb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDZGQUEyRTtBQUMzRSxNQUFhLGdCQUFnQjtJQUN6QixZQUFZO1FBQ1IsT0FBTztZQUNIO2dCQUNJLEdBQUcsRUFBRSxzQkFBc0I7Z0JBQzNCLElBQUksRUFBRSxjQUFjO2dCQUNwQixXQUFXLEVBQUUsMERBQTBEO2FBQzFFO1lBQ0Q7Z0JBQ0ksR0FBRyxFQUFFLHdCQUF3QjtnQkFDN0IsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsV0FBVyxFQUFFLDJGQUEyRjthQUMzRztZQUNEO2dCQUNJLEdBQUcsRUFBRSxxQ0FBcUM7Z0JBQzFDLElBQUksRUFBRSxrQkFBa0I7Z0JBQ3hCLFdBQVcsRUFBRSxnRUFBZ0U7YUFDaEY7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBVyxFQUFFLE1BQThCO1FBQzFELElBQUksR0FBRyxLQUFLLHNCQUFzQixFQUFFLENBQUM7WUFDakMsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbEMsQ0FBQztRQUNELElBQUksR0FBRyxLQUFLLHdCQUF3QixFQUFFLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLDJCQUEyQixDQUFDLEVBQUUsQ0FBQztZQUNwRSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sS0FB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QUNMLENBQUM7Q0FDSjtBQTNIRCw0Q0EySEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZXNvdXJjZVByb3ZpZGVyLCBSZXNvdXJjZURlZmluaXRpb24sIFJlc291cmNlUmVhZFJlc3VsdCB9IGZyb20gJy4uL3R5cGVzJztcblxuaW1wb3J0IHsgZWRpdG9yTWVzc2FnZXMgfSBmcm9tICcuLi9zZXJ2aWNlcy9kZWZhdWx0LWVkaXRvci1tZXNzYWdlLWNsaWVudCc7XG5leHBvcnQgY2xhc3MgUHJvamVjdFJlc291cmNlcyBpbXBsZW1lbnRzIFJlc291cmNlUHJvdmlkZXIge1xuICAgIGdldFJlc291cmNlcygpOiBSZXNvdXJjZURlZmluaXRpb25bXSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdXJpOiAnY29jb3M6Ly9wcm9qZWN0L2luZm8nLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdwcm9qZWN0X2luZm8nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJvamVjdCBuYW1lLCBwYXRoLCB1dWlkLCB2ZXJzaW9uLCBDb2NvcyBDcmVhdG9yIHZlcnNpb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVyaTogJ2NvY29zOi8vcHJvamVjdC9hc3NldHMnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdwcm9qZWN0X2Fzc2V0cycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBc3NldCBsaXN0IHdpdGggbmFtZSwgdXVpZCwgcGF0aCwgdHlwZS4gU3VwcG9ydHMgX3R5cGUsIF9wYWdlX3NpemUsIF9jdXJzb3IgcXVlcnkgcGFyYW1zLidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdXJpOiAnY29jb3M6Ly9wcm9qZWN0L3NldHRpbmdzL3tjYXRlZ29yeX0nLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdwcm9qZWN0X3NldHRpbmdzJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Byb2plY3Qgc2V0dGluZ3MgYnkgY2F0ZWdvcnk6IGdlbmVyYWwsIHBoeXNpY3MsIHJlbmRlciwgYXNzZXRzJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGFzeW5jIHJlYWRSZXNvdXJjZSh1cmk6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgaWYgKHVyaSA9PT0gJ2NvY29zOi8vcHJvamVjdC9pbmZvJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZFByb2plY3RJbmZvKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVyaSA9PT0gJ2NvY29zOi8vcHJvamVjdC9hc3NldHMnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkQXNzZXRzKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmFtc1snY2F0ZWdvcnknXSAmJiB1cmkuc3RhcnRzV2l0aCgnY29jb3M6Ly9wcm9qZWN0L3NldHRpbmdzLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkUHJvamVjdFNldHRpbmdzKHBhcmFtc1snY2F0ZWdvcnknXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHJlc291cmNlOiAke3VyaX1gKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlYWRQcm9qZWN0SW5mbygpOiBQcm9taXNlPFJlc291cmNlUmVhZFJlc3VsdD4ge1xuICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgbmFtZTogRWRpdG9yLlByb2plY3QubmFtZSxcbiAgICAgICAgICAgIHBhdGg6IEVkaXRvci5Qcm9qZWN0LnBhdGgsXG4gICAgICAgICAgICB1dWlkOiBFZGl0b3IuUHJvamVjdC51dWlkLFxuICAgICAgICAgICAgdmVyc2lvbjogKEVkaXRvci5Qcm9qZWN0IGFzIGFueSkudmVyc2lvbiB8fCAnMS4wLjAnLFxuICAgICAgICAgICAgY29jb3NWZXJzaW9uOiAoRWRpdG9yIGFzIGFueSkudmVyc2lvbnM/LmNvY29zIHx8ICdVbmtub3duJ1xuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWc6IGFueSA9IGF3YWl0IGVkaXRvck1lc3NhZ2VzLnJlcXVlc3QoJ3Byb2plY3QnLCAncXVlcnktY29uZmlnJywgJ3Byb2plY3QnKTtcbiAgICAgICAgICAgIGlmIChjb25maWcpIHtcbiAgICAgICAgICAgICAgICAoY29udGVudCBhcyBhbnkpLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG5cbiAgICAgICAgcmV0dXJuIHsgY29udGVudDogSlNPTi5zdHJpbmdpZnkoY29udGVudCkgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlYWRBc3NldHMocGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHBhcmFtcy5fdHlwZSB8fCAnYWxsJztcbiAgICAgICAgY29uc3QgZm9sZGVyID0gcGFyYW1zLl9mb2xkZXIgfHwgJ2RiOi8vYXNzZXRzJztcbiAgICAgICAgY29uc3QgcGFnZVNpemUgPSBwYXJzZUludChwYXJhbXMuX3BhZ2Vfc2l6ZSB8fCAnNTAnLCAxMCk7XG4gICAgICAgIGNvbnN0IGN1cnNvciA9IHBhcnNlSW50KHBhcmFtcy5fY3Vyc29yIHx8ICcwJywgMTApO1xuXG4gICAgICAgIGxldCBwYXR0ZXJuID0gYCR7Zm9sZGVyfS8qKi8qYDtcbiAgICAgICAgaWYgKHR5cGUgIT09ICdhbGwnKSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlRXh0ZW5zaW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgICAgICAnc2NlbmUnOiAnLnNjZW5lJyxcbiAgICAgICAgICAgICAgICAncHJlZmFiJzogJy5wcmVmYWInLFxuICAgICAgICAgICAgICAgICdzY3JpcHQnOiAnLnt0cyxqc30nLFxuICAgICAgICAgICAgICAgICd0ZXh0dXJlJzogJy57cG5nLGpwZyxqcGVnLGdpZix0Z2EsYm1wLHBzZH0nLFxuICAgICAgICAgICAgICAgICdtYXRlcmlhbCc6ICcubXRsJyxcbiAgICAgICAgICAgICAgICAnbWVzaCc6ICcue2ZieCxvYmosZGFlfScsXG4gICAgICAgICAgICAgICAgJ2F1ZGlvJzogJy57bXAzLG9nZyx3YXYsbTRhfScsXG4gICAgICAgICAgICAgICAgJ2FuaW1hdGlvbic6ICcue2FuaW0sY2xpcH0nXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgZXh0ID0gdHlwZUV4dGVuc2lvbnNbdHlwZV07XG4gICAgICAgICAgICBpZiAoZXh0KSB7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IGAke2ZvbGRlcn0vKiovKiR7ZXh0fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0czogYW55W10gPSBhd2FpdCBlZGl0b3JNZXNzYWdlcy5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldHMnLCB7IHBhdHRlcm4gfSk7XG4gICAgICAgICAgICBjb25zdCBhc3NldHMgPSByZXN1bHRzLm1hcChhc3NldCA9PiAoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGFzc2V0Lm5hbWUsXG4gICAgICAgICAgICAgICAgdXVpZDogYXNzZXQudXVpZCxcbiAgICAgICAgICAgICAgICBwYXRoOiBhc3NldC51cmwsXG4gICAgICAgICAgICAgICAgdHlwZTogYXNzZXQudHlwZSxcbiAgICAgICAgICAgICAgICBpc0RpcmVjdG9yeTogYXNzZXQuaXNEaXJlY3RvcnkgfHwgZmFsc2VcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgY29uc3QgcGFnZWQgPSBhc3NldHMuc2xpY2UoY3Vyc29yLCBjdXJzb3IgKyBwYWdlU2l6ZSk7XG4gICAgICAgICAgICBjb25zdCBuZXh0Q3Vyc29yID0gY3Vyc29yICsgcGFnZWQubGVuZ3RoIDwgYXNzZXRzLmxlbmd0aCA/IGN1cnNvciArIHBhZ2VkLmxlbmd0aCA6IG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29udGVudDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBpdGVtczogcGFnZWQsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQ291bnQ6IGFzc2V0cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VTaXplLFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3IsXG4gICAgICAgICAgICAgICAgICAgIG5leHRDdXJzb3IsXG4gICAgICAgICAgICAgICAgICAgIGhhc01vcmU6IG5leHRDdXJzb3IgIT09IG51bGxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHF1ZXJ5IGFzc2V0czogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZFByb2plY3RTZXR0aW5ncyhjYXRlZ29yeTogc3RyaW5nKTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgY29uc3QgY29uZmlnTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgZ2VuZXJhbDogJ3Byb2plY3QnLFxuICAgICAgICAgICAgcGh5c2ljczogJ3BoeXNpY3MnLFxuICAgICAgICAgICAgcmVuZGVyOiAncmVuZGVyJyxcbiAgICAgICAgICAgIGFzc2V0czogJ2Fzc2V0LWRiJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZ05hbWUgPSBjb25maWdNYXBbY2F0ZWdvcnldIHx8ICdwcm9qZWN0JztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3M6IGFueSA9IGF3YWl0IGVkaXRvck1lc3NhZ2VzLnJlcXVlc3QoJ3Byb2plY3QnLCAncXVlcnktY29uZmlnJywgY29uZmlnTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeSh7IGNhdGVnb3J5LCBjb25maWc6IHNldHRpbmdzIH0pIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgJHtjYXRlZ29yeX0gc2V0dGluZ3M6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=