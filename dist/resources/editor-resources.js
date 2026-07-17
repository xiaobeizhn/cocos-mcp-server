"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorResources = void 0;
const prefab_tools_1 = require("../tools/prefab-tools");
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
            const tree = await Editor.Message.request('scene', 'query-node-tree');
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
                version: ((_a = Editor.versions) === null || _a === void 0 ? void 0 : _a.editor) || 'Unknown',
                cocosVersion: ((_b = Editor.versions) === null || _b === void 0 ? void 0 : _b.cocos) || 'Unknown'
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
            const selected = await Editor.Message.request('scene', 'query-selection');
            const content = {
                selected: Array.isArray(selected)
                    ? selected.map((s) => ({ uuid: s.uuid, name: s.name }))
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
            tool = await Editor.Message.request('scene', 'query-gizmo-tool-name');
        }
        catch ( /* ignore */_a) { /* ignore */ }
        try {
            pivot = await Editor.Message.request('scene', 'query-gizmo-pivot');
        }
        catch ( /* ignore */_b) { /* ignore */ }
        try {
            coordinate = await Editor.Message.request('scene', 'query-gizmo-coordinate');
        }
        catch ( /* ignore */_c) { /* ignore */ }
        return { content: JSON.stringify({ tool, pivot, coordinate }) };
    }
}
exports.EditorResources = EditorResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLXJlc291cmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9yZXNvdXJjZXMvZWRpdG9yLXJlc291cmNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBb0Q7QUFFcEQsTUFBYSxlQUFlO0lBQ3hCLFlBQVk7UUFDUixPQUFPO1lBQ0g7Z0JBQ0ksR0FBRyxFQUFFLHNCQUFzQjtnQkFDM0IsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLFdBQVcsRUFBRSwwRkFBMEY7YUFDMUc7WUFDRDtnQkFDSSxHQUFHLEVBQUUscUJBQXFCO2dCQUMxQixJQUFJLEVBQUUsYUFBYTtnQkFDbkIsV0FBVyxFQUFFLGdGQUFnRjthQUNoRztZQUNEO2dCQUNJLEdBQUcsRUFBRSwwQkFBMEI7Z0JBQy9CLElBQUksRUFBRSxrQkFBa0I7Z0JBQ3hCLFdBQVcsRUFBRSxzREFBc0Q7YUFDdEU7WUFDRDtnQkFDSSxHQUFHLEVBQUUsNEJBQTRCO2dCQUNqQyxJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixXQUFXLEVBQUUsMkdBQTJHO2FBQzNIO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQVcsRUFBRSxNQUE4QjtRQUMxRCxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ1YsS0FBSyxzQkFBc0I7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ2xDLEtBQUsscUJBQXFCO2dCQUN0QixPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNqQyxLQUFLLDBCQUEwQjtnQkFDM0IsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDaEMsS0FBSyw0QkFBNEI7Z0JBQzdCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2pDO2dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQztJQUNMLENBQUM7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QUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBQUMsV0FBTSxDQUFDO1lBQ0wsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6RCxDQUFDO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxjQUFjO1FBQ3hCLElBQUksSUFBSSxHQUFHLFNBQVMsRUFBRSxLQUFLLEdBQUcsU0FBUyxFQUFFLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDaEUsSUFBSSxDQUFDO1lBQ0QsSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUFDLFFBQVEsWUFBWSxJQUFkLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUM7WUFDRCxLQUFLLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQUMsUUFBUSxZQUFZLElBQWQsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQztZQUNELFVBQVUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFBQyxRQUFRLFlBQVksSUFBZCxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFeEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDcEUsQ0FBQztDQUNKO0FBekhELDBDQXlIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc291cmNlUHJvdmlkZXIsIFJlc291cmNlRGVmaW5pdGlvbiwgUmVzb3VyY2VSZWFkUmVzdWx0IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgUHJlZmFiVG9vbHMgfSBmcm9tICcuLi90b29scy9wcmVmYWItdG9vbHMnO1xuXG5leHBvcnQgY2xhc3MgRWRpdG9yUmVzb3VyY2VzIGltcGxlbWVudHMgUmVzb3VyY2VQcm92aWRlciB7XG4gICAgZ2V0UmVzb3VyY2VzKCk6IFJlc291cmNlRGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9zdGF0ZScsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2VkaXRvcl9zdGF0ZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdFZGl0b3IgcmVhZGluZXNzOiBzY2VuZSBsb2FkZWQgc3RhdHVzLCBlZGl0IGNvbnRleHQgKHNjZW5lIHZzIHByZWZhYiksIGFjdGl2ZSBzY2VuZSBuYW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9pbmZvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZWRpdG9yX2luZm8nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRWRpdG9yIHZlcnNpb24sIENvY29zIENyZWF0b3IgdmVyc2lvbiwgcGxhdGZvcm0sIE5vZGUuanMgdmVyc2lvbiwgcHJvamVjdCBuYW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9zZWxlY3Rpb24nLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdlZGl0b3Jfc2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnRseSBzZWxlY3RlZCBub2RlIFVVSURzIGluIHRoZSBoaWVyYXJjaHkgcGFuZWwnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVyaTogJ2NvY29zOi8vZWRpdG9yL2dpem1vLXN0YXRlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZWRpdG9yX2dpem1vX3N0YXRlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnQgZ2l6bW8gdG9vbCAocG9zaXRpb24vcm90YXRpb24vc2NhbGUpLCBwaXZvdCBtb2RlIChwaXZvdC9jZW50ZXIpLCBjb29yZGluYXRlIHN5c3RlbSAobG9jYWwvZ2xvYmFsKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBhc3luYyByZWFkUmVzb3VyY2UodXJpOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIHN3aXRjaCAodXJpKSB7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9zdGF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEVkaXRvclN0YXRlKCk7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9pbmZvJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkRWRpdG9ySW5mbygpO1xuICAgICAgICAgICAgY2FzZSAnY29jb3M6Ly9lZGl0b3Ivc2VsZWN0aW9uJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9naXptby1zdGF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEdpem1vU3RhdGUoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHJlc291cmNlOiAke3VyaX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZEVkaXRvclN0YXRlKCk6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIGNvbnN0IGVkaXRDb250ZXh0ID0gUHJlZmFiVG9vbHMuZ2V0RWRpdENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgZWRpdFN0YXRlID0gUHJlZmFiVG9vbHMuZ2V0RWRpdFN0YXRlKCk7XG5cbiAgICAgICAgbGV0IHNjZW5lSW5mbzogYW55ID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRyZWU6IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUtdHJlZScpO1xuICAgICAgICAgICAgaWYgKHRyZWUgJiYgdHJlZS51dWlkKSB7XG4gICAgICAgICAgICAgICAgc2NlbmVJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0cmVlLm5hbWUgfHwgJ1VudGl0bGVkJyxcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogdHJlZS51dWlkLFxuICAgICAgICAgICAgICAgICAgICBub2RlQ291bnQ6IHRyZWUuY2hpbGRyZW4gPyB0cmVlLmNoaWxkcmVuLmxlbmd0aCA6IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIFNjZW5lIG5vdCBsb2FkZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgICAgICBlZGl0Q29udGV4dCxcbiAgICAgICAgICAgIHNjZW5lTG9hZGVkOiBzY2VuZUluZm8gIT09IG51bGwsXG4gICAgICAgICAgICBhY3RpdmVTY2VuZTogc2NlbmVJbmZvLFxuICAgICAgICAgICAgcHJlZmFiU3RhZ2U6IGVkaXRTdGF0ZSA/IHtcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogZWRpdFN0YXRlLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgcHJlZmFiVXVpZDogZWRpdFN0YXRlLnByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgcm9vdFV1aWQ6IGVkaXRTdGF0ZS5yb290VXVpZFxuICAgICAgICAgICAgfSA6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeShjb250ZW50KSB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZEVkaXRvckluZm8oKTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgICAgIGVkaXRvcjoge1xuICAgICAgICAgICAgICAgIHZlcnNpb246IChFZGl0b3IgYXMgYW55KS52ZXJzaW9ucz8uZWRpdG9yIHx8ICdVbmtub3duJyxcbiAgICAgICAgICAgICAgICBjb2Nvc1ZlcnNpb246IChFZGl0b3IgYXMgYW55KS52ZXJzaW9ucz8uY29jb3MgfHwgJ1Vua25vd24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGxhdGZvcm06IHByb2Nlc3MucGxhdGZvcm0sXG4gICAgICAgICAgICBhcmNoOiBwcm9jZXNzLmFyY2gsXG4gICAgICAgICAgICBub2RlVmVyc2lvbjogcHJvY2Vzcy52ZXJzaW9uLFxuICAgICAgICAgICAgcHJvamVjdDoge1xuICAgICAgICAgICAgICAgIG5hbWU6IEVkaXRvci5Qcm9qZWN0Lm5hbWUsXG4gICAgICAgICAgICAgICAgcGF0aDogRWRpdG9yLlByb2plY3QucGF0aCxcbiAgICAgICAgICAgICAgICB1dWlkOiBFZGl0b3IuUHJvamVjdC51dWlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHsgY29udGVudDogSlNPTi5zdHJpbmdpZnkoY29udGVudCkgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlYWRTZWxlY3Rpb24oKTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkOiBhbnkgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1zZWxlY3Rpb24nKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IEFycmF5LmlzQXJyYXkoc2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgICAgID8gc2VsZWN0ZWQubWFwKChzOiBhbnkpID0+ICh7IHV1aWQ6IHMudXVpZCwgbmFtZTogcy5uYW1lIH0pKVxuICAgICAgICAgICAgICAgICAgICA6IFtdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogSlNPTi5zdHJpbmdpZnkoY29udGVudCkgfTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeSh7IHNlbGVjdGVkOiBbXSB9KSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkR2l6bW9TdGF0ZSgpOiBQcm9taXNlPFJlc291cmNlUmVhZFJlc3VsdD4ge1xuICAgICAgICBsZXQgdG9vbCA9ICd1bmtub3duJywgcGl2b3QgPSAndW5rbm93bicsIGNvb3JkaW5hdGUgPSAndW5rbm93bic7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0b29sID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktZ2l6bW8tdG9vbC1uYW1lJyk7XG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGl2b3QgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1naXptby1waXZvdCcpO1xuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvb3JkaW5hdGUgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1naXptby1jb29yZGluYXRlJyk7XG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuXG4gICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHsgdG9vbCwgcGl2b3QsIGNvb3JkaW5hdGUgfSkgfTtcbiAgICB9XG59XG4iXX0=