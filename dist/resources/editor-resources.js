"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorResources = void 0;
const prefab_tools_1 = require("../tools/prefab-tools");
const default_editor_message_client_1 = require("../services/default-editor-message-client");
class EditorResources {
    getResources() {
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
    async readResource(uri, params) {
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
    async readEditorState() {
        const editContext = prefab_tools_1.PrefabTools.getEditContext();
        const editState = prefab_tools_1.PrefabTools.getEditState();
        let sceneInfo = null;
        try {
            const tree = await default_editor_message_client_1.editorMessages.request('scene', 'query-node-tree');
            if (tree && tree.uuid) {
                sceneInfo = {
                    name: tree.name || 'Untitled',
                    uuid: tree.uuid,
                    nodeCount: tree.children ? tree.children.length : 0
                };
            }
        }
        catch (_a) {
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
    async readEditorInfo() {
        var _a, _b;
        const content = {
            editor: {
                version: ((_a = Editor.App) === null || _a === void 0 ? void 0 : _a.version) || 'Unknown',
                cocosVersion: ((_b = Editor.App) === null || _b === void 0 ? void 0 : _b.version) || 'Unknown'
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
    async readSelection() {
        try {
            const selected = await default_editor_message_client_1.editorMessages.invokeCapability('selection.queryNodes');
            const content = {
                selected: Array.isArray(selected)
                    ? selected.map((s) => typeof s === 'string' ? { uuid: s } : { uuid: s.uuid, name: s.name })
                    : []
            };
            return { content: JSON.stringify(content) };
        }
        catch (_a) {
            return { content: JSON.stringify({ selected: [] }) };
        }
    }
    async readGizmoState() {
        let tool = 'unknown', pivot = 'unknown', coordinate = 'unknown';
        try {
            tool = await default_editor_message_client_1.editorMessages.request('scene', 'query-gizmo-tool-name');
        }
        catch ( /* ignore */_a) { /* ignore */ }
        try {
            pivot = await default_editor_message_client_1.editorMessages.request('scene', 'query-gizmo-pivot');
        }
        catch ( /* ignore */_b) { /* ignore */ }
        try {
            coordinate = await default_editor_message_client_1.editorMessages.request('scene', 'query-gizmo-coordinate');
        }
        catch ( /* ignore */_c) { /* ignore */ }
        return { content: JSON.stringify({ tool, pivot, coordinate }) };
    }
}
exports.EditorResources = EditorResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLXJlc291cmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9yZXNvdXJjZXMvZWRpdG9yLXJlc291cmNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBb0Q7QUFFcEQsNkZBQTJFO0FBQzNFLE1BQWEsZUFBZTtJQUN4QixZQUFZO1FBQ1IsT0FBTztZQUNIO2dCQUNJLEdBQUcsRUFBRSxzQkFBc0I7Z0JBQzNCLElBQUksRUFBRSxjQUFjO2dCQUNwQixXQUFXLEVBQUUsMEZBQTBGO2FBQzFHO1lBQ0Q7Z0JBQ0ksR0FBRyxFQUFFLHFCQUFxQjtnQkFDMUIsSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLFdBQVcsRUFBRSxnRkFBZ0Y7YUFDaEc7WUFDRDtnQkFDSSxHQUFHLEVBQUUsMEJBQTBCO2dCQUMvQixJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixXQUFXLEVBQUUsc0RBQXNEO2FBQ3RFO1lBQ0Q7Z0JBQ0ksR0FBRyxFQUFFLDRCQUE0QjtnQkFDakMsSUFBSSxFQUFFLG9CQUFvQjtnQkFDMUIsV0FBVyxFQUFFLDJHQUEyRzthQUMzSDtTQUNKLENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFXLEVBQUUsTUFBOEI7UUFDMUQsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNWLEtBQUssc0JBQXNCO2dCQUN2QixPQUFPLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNsQyxLQUFLLHFCQUFxQjtnQkFDdEIsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDakMsS0FBSywwQkFBMEI7Z0JBQzNCLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2hDLEtBQUssNEJBQTRCO2dCQUM3QixPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNqQztnQkFDSSxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELENB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ZmluaXRpb24sIFJlc291cmNlUmVhZFJlc3VsdCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IFByZWZhYlRvb2xzIH0gZnJvbSAnLi4vdG9vbHMvcHJlZmFiLXRvb2xzJztcblxuaW1wb3J0IHsgZWRpdG9yTWVzc2FnZXMgfSBmcm9tICcuLi9zZXJ2aWNlcy9kZWZhdWx0LWVkaXRvci1tZXNzYWdlLWNsaWVudCc7XG5leHBvcnQgY2xhc3MgRWRpdG9yUmVzb3VyY2VzIGltcGxlbWVudHMgUmVzb3VyY2VQcm92aWRlciB7XG4gICAgZ2V0UmVzb3VyY2VzKCk6IFJlc291cmNlRGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9zdGF0ZScsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2VkaXRvcl9zdGF0ZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdFZGl0b3IgcmVhZGluZXNzOiBzY2VuZSBsb2FkZWQgc3RhdHVzLCBlZGl0IGNvbnRleHQgKHNjZW5lIHZzIHByZWZhYiksIGFjdGl2ZSBzY2VuZSBuYW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9pbmZvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZWRpdG9yX2luZm8nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRWRpdG9yIHZlcnNpb24sIENvY29zIENyZWF0b3IgdmVyc2lvbiwgcGxhdGZvcm0sIE5vZGUuanMgdmVyc2lvbiwgcHJvamVjdCBuYW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9zZWxlY3Rpb24nLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdlZGl0b3Jfc2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnRseSBzZWxlY3RlZCBub2RlIFVVSURzIGluIHRoZSBoaWVyYXJjaHkgcGFuZWwnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVyaTogJ2NvY29zOi8vZWRpdG9yL2dpem1vLXN0YXRlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZWRpdG9yX2dpem1vX3N0YXRlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnQgZ2l6bW8gdG9vbCAocG9zaXRpb24vcm90YXRpb24vc2NhbGUpLCBwaXZvdCBtb2RlIChwaXZvdC9jZW50ZXIpLCBjb29yZGluYXRlIHN5c3RlbSAobG9jYWwvZ2xvYmFsKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBhc3luYyByZWFkUmVzb3VyY2UodXJpOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIHN3aXRjaCAodXJpKSB7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9zdGF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEVkaXRvclN0YXRlKCk7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9pbmZvJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkRWRpdG9ySW5mbygpO1xuICAgICAgICAgICAgY2FzZSAnY29jb3M6Ly9lZGl0b3Ivc2VsZWN0aW9uJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9naXptby1zdGF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEdpem1vU3RhdGUoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHJlc291cmNlOiAke3VyaX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZEVkaXRvclN0YXRlKCk6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIGNvbnN0IGVkaXRDb250ZXh0ID0gUHJlZmFiVG9vbHMuZ2V0RWRpdENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgZWRpdFN0YXRlID0gUHJlZmFiVG9vbHMuZ2V0RWRpdFN0YXRlKCk7XG5cbiAgICAgICAgbGV0IHNjZW5lSW5mbzogYW55ID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRyZWU6IGFueSA9IGF3YWl0IGVkaXRvck1lc3NhZ2VzLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUtdHJlZScpO1xuICAgICAgICAgICAgaWYgKHRyZWUgJiYgdHJlZS51dWlkKSB7XG4gICAgICAgICAgICAgICAgc2NlbmVJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0cmVlLm5hbWUgfHwgJ1VudGl0bGVkJyxcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogdHJlZS51dWlkLFxuICAgICAgICAgICAgICAgICAgICBub2RlQ291bnQ6IHRyZWUuY2hpbGRyZW4gPyB0cmVlLmNoaWxkcmVuLmxlbmd0aCA6IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIFNjZW5lIG5vdCBsb2FkZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgICAgICBlZGl0Q29udGV4dCxcbiAgICAgICAgICAgIHNjZW5lTG9hZGVkOiBzY2VuZUluZm8gIT09IG51bGwsXG4gICAgICAgICAgICBhY3RpdmVTY2VuZTogc2NlbmVJbmZvLFxuICAgICAgICAgICAgcHJlZmFiU3RhZ2U6IGVkaXRTdGF0ZSA/IHtcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogZWRpdFN0YXRlLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgcHJlZmFiVXVpZDogZWRpdFN0YXRlLnByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgcm9vdFV1aWQ6IGVkaXRTdGF0ZS5yb290VXVpZFxuICAgICAgICAgICAgfSA6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeShjb250ZW50KSB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZEVkaXRvckluZm8oKTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgICAgIGVkaXRvcjoge1xuICAgICAgICAgICAgICAgIHZlcnNpb246IChFZGl0b3IgYXMgYW55KS5BcHA/LnZlcnNpb24gfHwgJ1Vua25vd24nLFxuICAgICAgICAgICAgICAgIGNvY29zVmVyc2lvbjogKEVkaXRvciBhcyBhbnkpLkFwcD8udmVyc2lvbiB8fCAnVW5rbm93bidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICAgICAgICAgIGFyY2g6IHByb2Nlc3MuYXJjaCxcbiAgICAgICAgICAgIG5vZGVWZXJzaW9uOiBwcm9jZXNzLnZlcnNpb24sXG4gICAgICAgICAgICBwcm9qZWN0OiB7XG4gICAgICAgICAgICAgICAgbmFtZTogRWRpdG9yLlByb2plY3QubmFtZSxcbiAgICAgICAgICAgICAgICBwYXRoOiBFZGl0b3IuUHJvamVjdC5wYXRoLFxuICAgICAgICAgICAgICAgIHV1aWQ6IEVkaXRvci5Qcm9qZWN0LnV1aWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeShjb250ZW50KSB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZFNlbGVjdGlvbigpOiBQcm9taXNlPFJlc291cmNlUmVhZFJlc3VsdD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQ6IGFueSA9IGF3YWl0IGVkaXRvck1lc3NhZ2VzLmludm9rZUNhcGFiaWxpdHkoJ3NlbGVjdGlvbi5xdWVyeU5vZGVzJyk7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBBcnJheS5pc0FycmF5KHNlbGVjdGVkKVxuICAgICAgICAgICAgICAgICAgICA/IHNlbGVjdGVkLm1hcCgoczogYW55KSA9PiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgPyB7IHV1aWQ6IHMgfSA6IHsgdXVpZDogcy51dWlkLCBuYW1lOiBzLm5hbWUgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpIH07XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogSlNPTi5zdHJpbmdpZnkoeyBzZWxlY3RlZDogW10gfSkgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZEdpem1vU3RhdGUoKTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgbGV0IHRvb2wgPSAndW5rbm93bicsIHBpdm90ID0gJ3Vua25vd24nLCBjb29yZGluYXRlID0gJ3Vua25vd24nO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdG9vbCA9IGF3YWl0IGVkaXRvck1lc3NhZ2VzLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LWdpem1vLXRvb2wtbmFtZScpO1xuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBpdm90ID0gYXdhaXQgZWRpdG9yTWVzc2FnZXMucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktZ2l6bW8tcGl2b3QnKTtcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb29yZGluYXRlID0gYXdhaXQgZWRpdG9yTWVzc2FnZXMucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktZ2l6bW8tY29vcmRpbmF0ZScpO1xuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cblxuICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeSh7IHRvb2wsIHBpdm90LCBjb29yZGluYXRlIH0pIH07XG4gICAgfVxufVxuIl19