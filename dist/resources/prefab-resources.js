"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabResources = void 0;
const prefab_tools_1 = require("../tools/prefab-tools");
const default_editor_message_client_1 = require("../services/default-editor-message-client");
class PrefabResources {
    getResources() {
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
    async readResource(uri, params) {
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
    async readPrefabList() {
        try {
            const results = await default_editor_message_client_1.editorMessages.request('asset-db', 'query-assets', {
                pattern: 'db://assets/**/*.prefab'
            });
            const prefabs = results.map(asset => ({
                name: asset.name,
                path: asset.url,
                uuid: asset.uuid
            }));
            return { content: JSON.stringify(prefabs) };
        }
        catch (err) {
            throw new Error(`Failed to list prefabs: ${err.message}`);
        }
    }
    async readPrefabInfo(assetPath) {
        try {
            const info = await default_editor_message_client_1.editorMessages.request('asset-db', 'query-asset-info', assetPath);
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
                content.meta = {
                    ver: info.meta.ver,
                    importer: info.meta.importer
                };
            }
            return { content: JSON.stringify(content) };
        }
        catch (err) {
            throw new Error(`Failed to get prefab info: ${err.message}`);
        }
    }
    async readEditState() {
        const editState = prefab_tools_1.PrefabTools.getEditState();
        const editContext = prefab_tools_1.PrefabTools.getEditContext();
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
exports.PrefabResources = PrefabResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLXJlc291cmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9yZXNvdXJjZXMvcHJlZmFiLXJlc291cmNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBb0Q7QUFFcEQsNkZBQTJFO0FBQzNFLE1BQWEsZUFBZTtJQUN4QixZQUFZO1FBQ1IsT0FBTztZQUNIO2dCQUNJLEdBQUcsRUFBRSxpQkFBaUI7Z0JBQ3RCLElBQUksRUFBRSxhQUFhO2dCQUNuQixXQUFXLEVBQUUsd0RBQXdEO2FBQ3hFO1lBQ0Q7Z0JBQ0ksR0FBRyxFQUFFLGdDQUFnQztnQkFDckMsSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLFdBQVcsRUFBRSxvRkFBb0Y7YUFDcEc7WUFDRDtnQkFDSSxHQUFHLEVBQUUsNEJBQTRCO2dCQUNqQyxJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixXQUFXLEVBQUUscUVBQXFFO2FBQ3JGO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQVcsRUFBRSxNQUE4QjtRQUMxRCxJQUFJLEdBQUcsS0FBSyxpQkFBaUIsRUFBRSxDQUFDO1lBQzVCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFDRCxJQUFJLEdBQUcsS0FBSyw0QkFBNEIsRUFBRSxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTyxLQUFLLENBQUMsY0FBYztRQUN4QixJQUFJLENBQUM7WUFDRCxNQUFNLE9BQU8sR0FBVSxNQUFNLDhDQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUU7Z0JBQzVFLE9BQU8sRUFBRSx5QkFBeUI7YUFDckMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtnQkFDaEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHO2dCQUNmLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTthQUNuQixDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlELENBQUM7SUFDTCxDQUFDO0lBRU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFpQjtRQUMxQyxJQUFJLENBQUM7WUFDRCxNQUFNLElBQUksR0FBUSxNQUFNLDhDQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMxRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUN0RCxDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQUc7Z0JBQ1osSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxJQUFJLEtBQUs7YUFDekMsQ0FBQztZQUVGLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNYLE9BQWUsQ0FBQyxJQUFJLEdBQUc7b0JBQ3BCLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7b0JBQ2xCLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7aUJBQy9CLENBQUM7WUFDTixDQUFDO1lBRUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDakUsQ0FBQztJQUNMLENBQUM7SUFFTyxLQUFLLENBQUMsYUFBYTtRQUN2QixNQUFNLFNBQVMsR0FBRywwQkFBVyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzdDLE1BQU0sV0FBVyxHQUFHLDBCQUFXLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFakQsTUFBTSxPQUFPLEdBQUc7WUFDWixPQUFPLEVBQUUsV0FBVztZQUNwQixXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDckIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVO2dCQUNoQyxVQUFVLEVBQUUsU0FBUyxDQUFDLFVBQVU7Z0JBQ2hDLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtnQkFDNUIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO2FBQy9CLENBQUMsQ0FBQyxDQUFDLElBQUk7U0FDWCxDQUFDO1FBRUYsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDaEQsQ0FBQztDQUNKO0FBL0ZELDBDQStGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc291cmNlUHJvdmlkZXIsIFJlc291cmNlRGVmaW5pdGlvbiwgUmVzb3VyY2VSZWFkUmVzdWx0IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgUHJlZmFiVG9vbHMgfSBmcm9tICcuLi90b29scy9wcmVmYWItdG9vbHMnO1xuXG5pbXBvcnQgeyBlZGl0b3JNZXNzYWdlcyB9IGZyb20gJy4uL3NlcnZpY2VzL2RlZmF1bHQtZWRpdG9yLW1lc3NhZ2UtY2xpZW50JztcbmV4cG9ydCBjbGFzcyBQcmVmYWJSZXNvdXJjZXMgaW1wbGVtZW50cyBSZXNvdXJjZVByb3ZpZGVyIHtcbiAgICBnZXRSZXNvdXJjZXMoKTogUmVzb3VyY2VEZWZpbml0aW9uW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVyaTogJ2NvY29zOi8vcHJlZmFicycsXG4gICAgICAgICAgICAgICAgbmFtZTogJ3ByZWZhYl9saXN0JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FsbCBwcmVmYWIgYXNzZXRzIGluIHRoZSBwcm9qZWN0IHdpdGggbmFtZSwgcGF0aCwgdXVpZCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdXJpOiAnY29jb3M6Ly9wcmVmYWJzL3tlbmNvZGVkX3BhdGh9JyxcbiAgICAgICAgICAgICAgICBuYW1lOiAncHJlZmFiX2luZm8nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIG1ldGFkYXRhOiBuYW1lLCB1dWlkLCBwYXRoLiBUaGUgZW5jb2RlZF9wYXRoIGlzIHRoZSBVUkwtZW5jb2RlZCBhc3NldCBwYXRoLidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdXJpOiAnY29jb3M6Ly9wcmVmYWJzL2VkaXQtc3RhdGUnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdwcmVmYWJfZWRpdF9zdGF0ZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHByZWZhYiBlZGl0aW5nIG1vZGUgaXMgYWN0aXZlLCB3aGljaCBwcmVmYWIgaXMgYmVpbmcgZWRpdGVkJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGFzeW5jIHJlYWRSZXNvdXJjZSh1cmk6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgaWYgKHVyaSA9PT0gJ2NvY29zOi8vcHJlZmFicycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlYWRQcmVmYWJMaXN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVyaSA9PT0gJ2NvY29zOi8vcHJlZmFicy9lZGl0LXN0YXRlJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEVkaXRTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbXNbJ2VuY29kZWRfcGF0aCddKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkUHJlZmFiSW5mbyhkZWNvZGVVUklDb21wb25lbnQocGFyYW1zWydlbmNvZGVkX3BhdGgnXSkpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biByZXNvdXJjZTogJHt1cml9YCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkUHJlZmFiTGlzdCgpOiBQcm9taXNlPFJlc291cmNlUmVhZFJlc3VsdD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0czogYW55W10gPSBhd2FpdCBlZGl0b3JNZXNzYWdlcy5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldHMnLCB7XG4gICAgICAgICAgICAgICAgcGF0dGVybjogJ2RiOi8vYXNzZXRzLyoqLyoucHJlZmFiJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBwcmVmYWJzID0gcmVzdWx0cy5tYXAoYXNzZXQgPT4gKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBhc3NldC5uYW1lLFxuICAgICAgICAgICAgICAgIHBhdGg6IGFzc2V0LnVybCxcbiAgICAgICAgICAgICAgICB1dWlkOiBhc3NldC51dWlkXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeShwcmVmYWJzKSB9O1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gbGlzdCBwcmVmYWJzOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkUHJlZmFiSW5mbyhhc3NldFBhdGg6IHN0cmluZyk6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBpbmZvOiBhbnkgPSBhd2FpdCBlZGl0b3JNZXNzYWdlcy5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgYXNzZXRQYXRoKTtcbiAgICAgICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJlZmFiIG5vdCBmb3VuZDogJHthc3NldFBhdGh9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogaW5mby5uYW1lLFxuICAgICAgICAgICAgICAgIHV1aWQ6IGluZm8udXVpZCxcbiAgICAgICAgICAgICAgICBwYXRoOiBpbmZvLnVybCxcbiAgICAgICAgICAgICAgICB0eXBlOiBpbmZvLnR5cGUsXG4gICAgICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IGluZm8uaXNEaXJlY3RvcnkgfHwgZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChpbmZvLm1ldGEpIHtcbiAgICAgICAgICAgICAgICAoY29udGVudCBhcyBhbnkpLm1ldGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcjogaW5mby5tZXRhLnZlcixcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0ZXI6IGluZm8ubWV0YS5pbXBvcnRlclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgcHJlZmFiIGluZm86ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlYWRFZGl0U3RhdGUoKTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgY29uc3QgZWRpdFN0YXRlID0gUHJlZmFiVG9vbHMuZ2V0RWRpdFN0YXRlKCk7XG4gICAgICAgIGNvbnN0IGVkaXRDb250ZXh0ID0gUHJlZmFiVG9vbHMuZ2V0RWRpdENvbnRleHQoKTtcblxuICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgY29udGV4dDogZWRpdENvbnRleHQsXG4gICAgICAgICAgICBwcmVmYWJTdGFnZTogZWRpdFN0YXRlID8ge1xuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBlZGl0U3RhdGUucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICBwcmVmYWJVdWlkOiBlZGl0U3RhdGUucHJlZmFiVXVpZCxcbiAgICAgICAgICAgICAgICByb290VXVpZDogZWRpdFN0YXRlLnJvb3RVdWlkLFxuICAgICAgICAgICAgICAgIG9wZW5lZEF0OiBlZGl0U3RhdGUub3BlbmVkQXRcbiAgICAgICAgICAgIH0gOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHsgY29udGVudDogSlNPTi5zdHJpbmdpZnkoY29udGVudCkgfTtcbiAgICB9XG59XG4iXX0=