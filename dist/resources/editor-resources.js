"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorResources = void 0;
const prefab_tools_1 = require("../tools/prefab-tools");
const error_normalizer_1 = require("../services/error-normalizer");
const default_editor_message_client_1 = require("../services/default-editor-message-client");
class EditorResources {
    constructor(messages) {
        this.messages = messages !== null && messages !== void 0 ? messages : default_editor_message_client_1.editorMessages;
    }
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
                description: 'Currently selected node UUIDs (selection:query-selection) and the global active node (selection:query-global-activate)'
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
            const tree = await this.messages.request('scene', 'query-node-tree');
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
        var _a;
        // Node selection is the primary query — its failure must surface as a
        // structured error, never degrade to an empty array (which would mask an
        // unavailable editor as "nothing selected").
        //
        // In Cocos Creator 3.8 the selected node UUIDs are queried through the
        // synchronous Editor.Selection.getSelected('node') API — there is no
        // `selection:query-selection` IPC message. We use the direct API when
        // available and fall back to the message-based capability for other
        // versions (and for tests, where Editor.Selection is not defined).
        let selected;
        const selectionApi = (_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.Editor) === null || _a === void 0 ? void 0 : _a.Selection;
        if (selectionApi && typeof selectionApi.getSelected === 'function') {
            selected = normalizeSelectionUuids(selectionApi.getSelected('node'));
        }
        else {
            const rawSelected = await this.messages.invokeCapability('selection.queryNodes');
            selected = normalizeSelectionUuids(rawSelected);
        }
        const warnings = [];
        let active = null;
        let activeSource = 'selection:query-global-activate';
        try {
            active = await this.messages.invokeCapability('selection.queryGlobalActive');
        }
        catch (error) {
            const normalized = (0, error_normalizer_1.normalizeError)(error);
            if (normalized.code !== 'UNSUPPORTED_CAPABILITY')
                throw error;
            activeSource = 'unsupported';
            active = null;
            warnings.push('Global active selection is unavailable in this Creator version.');
        }
        const snapshot = {
            type: 'node',
            selected,
            active,
            source: { selected: 'selection:query-selection', active: activeSource },
            warnings,
        };
        return { content: JSON.stringify(snapshot), mimeType: 'application/json' };
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
/**
 * selection:query-selection('node') may return a string[] of uuids, or an array
 * of { uuid, name } records. Normalise to a stable string[] of uuids.
 */
function normalizeSelectionUuids(value) {
    if (!Array.isArray(value))
        return [];
    return value
        .map((item) => {
        if (typeof item === 'string')
            return item;
        if (item && typeof item === 'object' && typeof item.uuid === 'string') {
            return item.uuid;
        }
        return null;
    })
        .filter((uuid) => uuid !== null);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLXJlc291cmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9yZXNvdXJjZXMvZWRpdG9yLXJlc291cmNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBb0Q7QUFDcEQsbUVBQThEO0FBRTlELDZGQUEyRTtBQUMzRSxNQUFhLGVBQWU7SUFHeEIsWUFBWSxRQUE4QjtRQUN0QyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsYUFBUixRQUFRLGNBQVIsUUFBUSxHQUFJLDhDQUFjLENBQUM7SUFDL0MsQ0FBQztJQUVELFlBQVk7UUFDUixPQUFPO1lBQ0g7Z0JBQ0ksR0FBRyxFQUFFLHNCQUFzQjtnQkFDM0IsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLFdBQVcsRUFBRSwwRkFBMEY7YUFDMUc7WUFDRDtnQkFDSSxHQUFHLEVBQUUscUJBQXFCO2dCQUMxQixJQUFJLEVBQUUsYUFBYTtnQkFDbkIsV0FBVyxFQUFFLGdGQUFnRjthQUNoRztZQUNEO2dCQUNJLEdBQUcsRUFBRSwwQkFBMEI7Z0JBQy9CLElBQUksRUFBRSxrQkFBa0I7Z0JBQ3hCLFdBQVcsRUFBRSx3SEFBd0g7YUFDeEk7WUFDRDtnQkFDSSxHQUFHLEVBQUUsNEJBQTRCO2dCQUNqQyxJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixXQUFXLEVBQUUsMkdBQTJHO2FBQzNIO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQVcsRUFBRSxNQUE4QjtRQUMxRCxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ1YsS0FBSyxzQkFBc0I7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ2xDLEtBQUsscUJBQXFCO2dCQUN0QixPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNqQyxLQUFLLDBCQUEwQjtnQkFDM0IsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDaEMsS0FBSyw0QkFB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QUFRLElBQVksQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDN0UsT0FBUSxJQUFZLENBQUMsSUFBSSxDQUFDO1FBQzlCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDLENBQUM7U0FDRCxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQWtCLEVBQUUsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDekQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc291cmNlUHJvdmlkZXIsIFJlc291cmNlRGVmaW5pdGlvbiwgUmVzb3VyY2VSZWFkUmVzdWx0LCBTZWxlY3Rpb25BY3RpdmUsIFNlbGVjdGlvblNuYXBzaG90LCBFZGl0b3JNZXNzYWdlQ2xpZW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgUHJlZmFiVG9vbHMgfSBmcm9tICcuLi90b29scy9wcmVmYWItdG9vbHMnO1xuaW1wb3J0IHsgbm9ybWFsaXplRXJyb3IgfSBmcm9tICcuLi9zZXJ2aWNlcy9lcnJvci1ub3JtYWxpemVyJztcblxuaW1wb3J0IHsgZWRpdG9yTWVzc2FnZXMgfSBmcm9tICcuLi9zZXJ2aWNlcy9kZWZhdWx0LWVkaXRvci1tZXNzYWdlLWNsaWVudCc7XG5leHBvcnQgY2xhc3MgRWRpdG9yUmVzb3VyY2VzIGltcGxlbWVudHMgUmVzb3VyY2VQcm92aWRlciB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBtZXNzYWdlczogRWRpdG9yTWVzc2FnZUNsaWVudDtcblxuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2VzPzogRWRpdG9yTWVzc2FnZUNsaWVudCkge1xuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXMgPz8gZWRpdG9yTWVzc2FnZXM7XG4gICAgfVxuXG4gICAgZ2V0UmVzb3VyY2VzKCk6IFJlc291cmNlRGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9zdGF0ZScsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2VkaXRvcl9zdGF0ZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdFZGl0b3IgcmVhZGluZXNzOiBzY2VuZSBsb2FkZWQgc3RhdHVzLCBlZGl0IGNvbnRleHQgKHNjZW5lIHZzIHByZWZhYiksIGFjdGl2ZSBzY2VuZSBuYW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9pbmZvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZWRpdG9yX2luZm8nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRWRpdG9yIHZlcnNpb24sIENvY29zIENyZWF0b3IgdmVyc2lvbiwgcGxhdGZvcm0sIE5vZGUuanMgdmVyc2lvbiwgcHJvamVjdCBuYW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB1cmk6ICdjb2NvczovL2VkaXRvci9zZWxlY3Rpb24nLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdlZGl0b3Jfc2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnRseSBzZWxlY3RlZCBub2RlIFVVSURzIChzZWxlY3Rpb246cXVlcnktc2VsZWN0aW9uKSBhbmQgdGhlIGdsb2JhbCBhY3RpdmUgbm9kZSAoc2VsZWN0aW9uOnF1ZXJ5LWdsb2JhbC1hY3RpdmF0ZSknXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVyaTogJ2NvY29zOi8vZWRpdG9yL2dpem1vLXN0YXRlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZWRpdG9yX2dpem1vX3N0YXRlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnQgZ2l6bW8gdG9vbCAocG9zaXRpb24vcm90YXRpb24vc2NhbGUpLCBwaXZvdCBtb2RlIChwaXZvdC9jZW50ZXIpLCBjb29yZGluYXRlIHN5c3RlbSAobG9jYWwvZ2xvYmFsKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBhc3luYyByZWFkUmVzb3VyY2UodXJpOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIHN3aXRjaCAodXJpKSB7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9zdGF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEVkaXRvclN0YXRlKCk7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9pbmZvJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkRWRpdG9ySW5mbygpO1xuICAgICAgICAgICAgY2FzZSAnY29jb3M6Ly9lZGl0b3Ivc2VsZWN0aW9uJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBjYXNlICdjb2NvczovL2VkaXRvci9naXptby1zdGF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEdpem1vU3RhdGUoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHJlc291cmNlOiAke3VyaX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZEVkaXRvclN0YXRlKCk6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIGNvbnN0IGVkaXRDb250ZXh0ID0gUHJlZmFiVG9vbHMuZ2V0RWRpdENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgZWRpdFN0YXRlID0gUHJlZmFiVG9vbHMuZ2V0RWRpdFN0YXRlKCk7XG5cbiAgICAgICAgbGV0IHNjZW5lSW5mbzogYW55ID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRyZWU6IGFueSA9IGF3YWl0IHRoaXMubWVzc2FnZXMucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZS10cmVlJyk7XG4gICAgICAgICAgICBpZiAodHJlZSAmJiB0cmVlLnV1aWQpIHtcbiAgICAgICAgICAgICAgICBzY2VuZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRyZWUubmFtZSB8fCAnVW50aXRsZWQnLFxuICAgICAgICAgICAgICAgICAgICB1dWlkOiB0cmVlLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgIG5vZGVDb3VudDogdHJlZS5jaGlsZHJlbiA/IHRyZWUuY2hpbGRyZW4ubGVuZ3RoIDogMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gU2NlbmUgbm90IGxvYWRlZFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgICAgIGVkaXRDb250ZXh0LFxuICAgICAgICAgICAgc2NlbmVMb2FkZWQ6IHNjZW5lSW5mbyAhPT0gbnVsbCxcbiAgICAgICAgICAgIGFjdGl2ZVNjZW5lOiBzY2VuZUluZm8sXG4gICAgICAgICAgICBwcmVmYWJTdGFnZTogZWRpdFN0YXRlID8ge1xuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBlZGl0U3RhdGUucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICBwcmVmYWJVdWlkOiBlZGl0U3RhdGUucHJlZmFiVXVpZCxcbiAgICAgICAgICAgICAgICByb290VXVpZDogZWRpdFN0YXRlLnJvb3RVdWlkXG4gICAgICAgICAgICB9IDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkRWRpdG9ySW5mbygpOiBQcm9taXNlPFJlc291cmNlUmVhZFJlc3VsdD4ge1xuICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgZWRpdG9yOiB7XG4gICAgICAgICAgICAgICAgdmVyc2lvbjogKEVkaXRvciBhcyBhbnkpLkFwcD8udmVyc2lvbiB8fCAnVW5rbm93bicsXG4gICAgICAgICAgICAgICAgY29jb3NWZXJzaW9uOiAoRWRpdG9yIGFzIGFueSkuQXBwPy52ZXJzaW9uIHx8ICdVbmtub3duJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBsYXRmb3JtOiBwcm9jZXNzLnBsYXRmb3JtLFxuICAgICAgICAgICAgYXJjaDogcHJvY2Vzcy5hcmNoLFxuICAgICAgICAgICAgbm9kZVZlcnNpb246IHByb2Nlc3MudmVyc2lvbixcbiAgICAgICAgICAgIHByb2plY3Q6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBFZGl0b3IuUHJvamVjdC5uYW1lLFxuICAgICAgICAgICAgICAgIHBhdGg6IEVkaXRvci5Qcm9qZWN0LnBhdGgsXG4gICAgICAgICAgICAgICAgdXVpZDogRWRpdG9yLlByb2plY3QudXVpZFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkU2VsZWN0aW9uKCk6IFByb21pc2U8UmVzb3VyY2VSZWFkUmVzdWx0PiB7XG4gICAgICAgIC8vIE5vZGUgc2VsZWN0aW9uIGlzIHRoZSBwcmltYXJ5IHF1ZXJ5IOKAlCBpdHMgZmFpbHVyZSBtdXN0IHN1cmZhY2UgYXMgYVxuICAgICAgICAvLyBzdHJ1Y3R1cmVkIGVycm9yLCBuZXZlciBkZWdyYWRlIHRvIGFuIGVtcHR5IGFycmF5ICh3aGljaCB3b3VsZCBtYXNrIGFuXG4gICAgICAgIC8vIHVuYXZhaWxhYmxlIGVkaXRvciBhcyBcIm5vdGhpbmcgc2VsZWN0ZWRcIikuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEluIENvY29zIENyZWF0b3IgMy44IHRoZSBzZWxlY3RlZCBub2RlIFVVSURzIGFyZSBxdWVyaWVkIHRocm91Z2ggdGhlXG4gICAgICAgIC8vIHN5bmNocm9ub3VzIEVkaXRvci5TZWxlY3Rpb24uZ2V0U2VsZWN0ZWQoJ25vZGUnKSBBUEkg4oCUIHRoZXJlIGlzIG5vXG4gICAgICAgIC8vIGBzZWxlY3Rpb246cXVlcnktc2VsZWN0aW9uYCBJUEMgbWVzc2FnZS4gV2UgdXNlIHRoZSBkaXJlY3QgQVBJIHdoZW5cbiAgICAgICAgLy8gYXZhaWxhYmxlIGFuZCBmYWxsIGJhY2sgdG8gdGhlIG1lc3NhZ2UtYmFzZWQgY2FwYWJpbGl0eSBmb3Igb3RoZXJcbiAgICAgICAgLy8gdmVyc2lvbnMgKGFuZCBmb3IgdGVzdHMsIHdoZXJlIEVkaXRvci5TZWxlY3Rpb24gaXMgbm90IGRlZmluZWQpLlxuICAgICAgICBsZXQgc2VsZWN0ZWQ6IHN0cmluZ1tdO1xuICAgICAgICBjb25zdCBzZWxlY3Rpb25BcGkgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpPy5FZGl0b3I/LlNlbGVjdGlvbjtcbiAgICAgICAgaWYgKHNlbGVjdGlvbkFwaSAmJiB0eXBlb2Ygc2VsZWN0aW9uQXBpLmdldFNlbGVjdGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzZWxlY3RlZCA9IG5vcm1hbGl6ZVNlbGVjdGlvblV1aWRzKHNlbGVjdGlvbkFwaS5nZXRTZWxlY3RlZCgnbm9kZScpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhd1NlbGVjdGVkID0gYXdhaXQgdGhpcy5tZXNzYWdlcy5pbnZva2VDYXBhYmlsaXR5PHN0cmluZ1tdPignc2VsZWN0aW9uLnF1ZXJ5Tm9kZXMnKTtcbiAgICAgICAgICAgIHNlbGVjdGVkID0gbm9ybWFsaXplU2VsZWN0aW9uVXVpZHMocmF3U2VsZWN0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGxldCBhY3RpdmU6IFNlbGVjdGlvbkFjdGl2ZSB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgYWN0aXZlU291cmNlID0gJ3NlbGVjdGlvbjpxdWVyeS1nbG9iYWwtYWN0aXZhdGUnO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhY3RpdmUgPSBhd2FpdCB0aGlzLm1lc3NhZ2VzLmludm9rZUNhcGFiaWxpdHk8U2VsZWN0aW9uQWN0aXZlIHwgbnVsbD4oJ3NlbGVjdGlvbi5xdWVyeUdsb2JhbEFjdGl2ZScpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkLmNvZGUgIT09ICdVTlNVUFBPUlRFRF9DQVBBQklMSVRZJykgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICBhY3RpdmVTb3VyY2UgPSAndW5zdXBwb3J0ZWQnO1xuICAgICAgICAgICAgYWN0aXZlID0gbnVsbDtcbiAgICAgICAgICAgIHdhcm5pbmdzLnB1c2goJ0dsb2JhbCBhY3RpdmUgc2VsZWN0aW9uIGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgQ3JlYXRvciB2ZXJzaW9uLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc25hcHNob3Q6IFNlbGVjdGlvblNuYXBzaG90ID0ge1xuICAgICAgICAgICAgdHlwZTogJ25vZGUnLFxuICAgICAgICAgICAgc2VsZWN0ZWQsXG4gICAgICAgICAgICBhY3RpdmUsXG4gICAgICAgICAgICBzb3VyY2U6IHsgc2VsZWN0ZWQ6ICdzZWxlY3Rpb246cXVlcnktc2VsZWN0aW9uJywgYWN0aXZlOiBhY3RpdmVTb3VyY2UgfSxcbiAgICAgICAgICAgIHdhcm5pbmdzLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHNuYXBzaG90KSwgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZEdpem1vU3RhdGUoKTogUHJvbWlzZTxSZXNvdXJjZVJlYWRSZXN1bHQ+IHtcbiAgICAgICAgbGV0IHRvb2wgPSAndW5rbm93bicsIHBpdm90ID0gJ3Vua25vd24nLCBjb29yZGluYXRlID0gJ3Vua25vd24nO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdG9vbCA9IGF3YWl0IGVkaXRvck1lc3NhZ2VzLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LWdpem1vLXRvb2wtbmFtZScpO1xuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBpdm90ID0gYXdhaXQgZWRpdG9yTWVzc2FnZXMucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktZ2l6bW8tcGl2b3QnKTtcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb29yZGluYXRlID0gYXdhaXQgZWRpdG9yTWVzc2FnZXMucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktZ2l6bW8tY29vcmRpbmF0ZScpO1xuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cblxuICAgICAgICByZXR1cm4geyBjb250ZW50OiBKU09OLnN0cmluZ2lmeSh7IHRvb2wsIHBpdm90LCBjb29yZGluYXRlIH0pIH07XG4gICAgfVxufVxuXG4vKipcbiAqIHNlbGVjdGlvbjpxdWVyeS1zZWxlY3Rpb24oJ25vZGUnKSBtYXkgcmV0dXJuIGEgc3RyaW5nW10gb2YgdXVpZHMsIG9yIGFuIGFycmF5XG4gKiBvZiB7IHV1aWQsIG5hbWUgfSByZWNvcmRzLiBOb3JtYWxpc2UgdG8gYSBzdGFibGUgc3RyaW5nW10gb2YgdXVpZHMuXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlbGVjdGlvblV1aWRzKHZhbHVlOiB1bmtub3duKTogc3RyaW5nW10ge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiBbXTtcbiAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgLm1hcCgoaXRlbSk6IHN0cmluZyB8IG51bGwgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJykgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICBpZiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIChpdGVtIGFzIGFueSkudXVpZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGl0ZW0gYXMgYW55KS51dWlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoKHV1aWQpOiB1dWlkIGlzIHN0cmluZyA9PiB1dWlkICE9PSBudWxsKTtcbn1cbiJdfQ==