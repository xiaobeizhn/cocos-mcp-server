"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cocos38Capabilities = void 0;
exports.routeKey = routeKey;
/**
 * Cocos Creator 3.8.x editor-message capability table.
 *
 * Route names and parameter shapes are sourced from @cocos/creator-types
 * (editor/packages/{scene,asset-db}/@types). Each capability lists the
 * canonical 3.8.x route first; a genuine alternative is kept as a fallback
 * where one exists. Messages take a single options object (scene) or a
 * single positional string (asset-db) — never the plural/positional forms
 * that earlier drafts guessed at.
 */
exports.cocos38Capabilities = {
    // asset-db:query-uuid(url) -> string | null
    'asset.urlToUuid': [
        route('asset-db', 'query-uuid', false, value => { var _a; return [asString((_a = value === null || value === void 0 ? void 0 : value.url) !== null && _a !== void 0 ? _a : value)]; }, value => value !== null && value !== void 0 ? value : null)
    ],
    // asset-db:query-url(uuid) -> string | null
    'asset.uuidToUrl': [
        route('asset-db', 'query-url', false, value => { var _a; return [asString((_a = value === null || value === void 0 ? void 0 : value.uuid) !== null && _a !== void 0 ? _a : value)]; }, value => value !== null && value !== void 0 ? value : null)
    ],
    // asset-db:refresh-asset(url) -> boolean ; reimport as fallback
    'asset.refresh': [
        route('asset-db', 'refresh-asset', true, value => { var _a; return [asString((_a = value === null || value === void 0 ? void 0 : value.url) !== null && _a !== void 0 ? _a : value)]; }, identity),
        route('asset-db', 'reimport-asset', true, value => { var _a; return [asString((_a = value === null || value === void 0 ? void 0 : value.url) !== null && _a !== void 0 ? _a : value)]; }, identity)
    ],
    // selection:query-selection('node') -> uuid[] ; scene fallback
    'selection.queryNodes': [
        route('selection', 'query-selection', false, () => ['node'], normalizeSelection),
        route('scene', 'query-selection', false, () => ['node'], normalizeSelection)
    ],
    // scene:create-node(CreateNodeOptions) -> string[] (new uuids)
    'scene.createNode': [
        route('scene', 'create-node', true, value => [createNodeOptions(value)], normalizeUuidArray)
    ],
    // scene:create-node({ assetUuid, ...options }) -> string[]
    'scene.instantiateAsset': [
        route('scene', 'create-node', true, value => [instantiateOptions(value)], normalizeUuidArray)
    ],
    // scene:remove-node({ uuid, keepWorldTransform? }) -> void
    'scene.deleteNodes': [
        route('scene', 'remove-node', true, value => { var _a, _b; return [{ uuid: (_b = (_a = value === null || value === void 0 ? void 0 : value.uuids) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.uuid) !== null && _b !== void 0 ? _b : value, keepWorldTransform: value === null || value === void 0 ? void 0 : value.keepWorldTransform }]; }, identity)
    ],
    // scene:duplicate-node(uuid | uuid[]) -> string[] ; copy-node fallback
    'scene.duplicateNodes': [
        route('scene', 'duplicate-node', true, value => { var _a, _b; return [(_b = (_a = value === null || value === void 0 ? void 0 : value.uuids) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.uuid) !== null && _b !== void 0 ? _b : value]; }, normalizeUuidArray),
        route('scene', 'copy-node', true, value => { var _a, _b; return [(_b = (_a = value === null || value === void 0 ? void 0 : value.uuids) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.uuid) !== null && _b !== void 0 ? _b : value]; }, normalizeUuidArray)
    ],
    // scene:set-parent({ parent, uuids, keepWorldTransform? }) -> string[]
    'scene.moveNodes': [
        route('scene', 'set-parent', true, value => { var _a, _b; return [{ parent: (_a = value === null || value === void 0 ? void 0 : value.parentUuid) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.parent, uuids: (_b = value === null || value === void 0 ? void 0 : value.uuids) !== null && _b !== void 0 ? _b : value === null || value === void 0 ? void 0 : value.uuid, keepWorldTransform: value === null || value === void 0 ? void 0 : value.keepWorldTransform }]; }, normalizeUuidArray)
    ],
    // scene:save-scene([] | [boolean]) -> boolean
    'scene.save': [
        route('scene', 'save-scene', true, value => (value === undefined ? [] : [value]), identity),
        route('scene', 'stash-and-save', true, value => (value === undefined ? [] : [value]), identity)
    ],
    // scene:query-dirty() -> boolean
    'scene.dirtyState': [
        route('scene', 'query-dirty', false, () => [], value => Boolean(value))
    ],
    // scene:create-component({ uuid, component }) -> boolean
    'component.add': [
        route('scene', 'create-component', true, value => { var _a, _b; return [{ uuid: (_a = value === null || value === void 0 ? void 0 : value.nodeUuid) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.uuid, component: (_b = value === null || value === void 0 ? void 0 : value.componentType) !== null && _b !== void 0 ? _b : value === null || value === void 0 ? void 0 : value.component }]; }, identity)
    ]
};
function route(packageName, message, write, encode, decode) {
    return { route: { package: packageName, message }, write, encode, decode };
}
function identity(value) { return value; }
function asString(value) {
    if (value == null)
        return '';
    return typeof value === 'string' ? value : String(value);
}
/** create-node / set-parent / duplicate-node return string | string[] -> normalize to string[] */
function normalizeUuidArray(value) {
    if (value == null)
        return [];
    if (Array.isArray(value))
        return value.filter((v) => typeof v === 'string');
    return typeof value === 'string' ? [value] : [];
}
function normalizeSelection(value) {
    if (value == null)
        return [];
    if (Array.isArray(value))
        return value;
    return [value];
}
function createNodeOptions(value) {
    const options = {};
    if (!value || typeof value !== 'object') {
        if (typeof value === 'string')
            options.name = value;
        return options;
    }
    if (value.name != null)
        options.name = value.name;
    if (value.parent != null)
        options.parent = value.parent;
    if (value.parentUuid != null)
        options.parent = value.parentUuid;
    if (value.keepWorldTransform != null)
        options.keepWorldTransform = value.keepWorldTransform;
    if (value.unlinkPrefab != null)
        options.unlinkPrefab = value.unlinkPrefab;
    if (value.components && Array.isArray(value.components) && value.components.length > 0) {
        // CreateNodeOptions has no `components` field in 3.8.x; keep type for callers that still pass it.
        options.type = value.components[0];
    }
    if (value.type != null)
        options.type = value.type;
    if (value.position != null)
        options.position = value.position;
    return options;
}
function instantiateOptions(value) {
    var _a;
    const base = createNodeOptions(value);
    const assetUuid = (_a = value === null || value === void 0 ? void 0 : value.assetUuid) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.uuid;
    if (assetUuid != null)
        base.assetUuid = assetUuid;
    if ((value === null || value === void 0 ? void 0 : value.unlinkPrefab) != null)
        base.unlinkPrefab = value.unlinkPrefab;
    return base;
}
function routeKey(route) { return `${route.package}:${route.message}`; }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29jb3MtMy44LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2FkYXB0ZXJzL2NvY29zLTMuOC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUE4SEEsNEJBQTJHO0FBckgzRzs7Ozs7Ozs7O0dBU0c7QUFDVSxRQUFBLG1CQUFtQixHQUFnRDtJQUM1RSw0Q0FBNEM7SUFDNUMsaUJBQWlCLEVBQUU7UUFDZixLQUFLLENBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBQyxPQUFBLENBQUMsUUFBUSxDQUFDLE1BQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEdBQUcsbUNBQUksS0FBSyxDQUFDLENBQUMsQ0FBQSxFQUFBLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxJQUFJLENBQUM7S0FDM0c7SUFDRCw0Q0FBNEM7SUFDNUMsaUJBQWlCLEVBQUU7UUFDZixLQUFLLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBQyxPQUFBLENBQUMsUUFBUSxDQUFDLE1BQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLElBQUksbUNBQUksS0FBSyxDQUFDLENBQUMsQ0FBQSxFQUFBLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxJQUFJLENBQUM7S0FDM0c7SUFDRCxnRUFBZ0U7SUFDaEUsZUFBZSxFQUFFO1FBQ2IsS0FBSyxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQUMsT0FBQSxDQUFDLFFBQVEsQ0FBQyxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxHQUFHLG1DQUFJLEtBQUssQ0FBQyxDQUFDLENBQUEsRUFBQSxFQUFFLFFBQVEsQ0FBQztR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QUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUNsRCxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSTtRQUFFLE9BQU8sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUM5RCxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxLQUFVOztJQUNsQyxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0QyxNQUFNLFNBQVMsR0FBRyxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxTQUFTLG1DQUFJLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxJQUFJLENBQUM7SUFDbEQsSUFBSSxTQUFTLElBQUksSUFBSTtRQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ2xELElBQUksQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsWUFBWSxLQUFJLElBQUk7UUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDeEUsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxLQUF5QixJQUFZLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFZGl0b3JDYXBhYmlsaXR5LCBFZGl0b3JNZXNzYWdlUm91dGUgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FwYWJpbGl0eVJvdXRlIHtcbiAgICByb3V0ZTogRWRpdG9yTWVzc2FnZVJvdXRlO1xuICAgIHdyaXRlOiBib29sZWFuO1xuICAgIGVuY29kZShhcmdzOiBhbnkpOiBhbnlbXTtcbiAgICBkZWNvZGUocmVzdWx0OiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogQ29jb3MgQ3JlYXRvciAzLjgueCBlZGl0b3ItbWVzc2FnZSBjYXBhYmlsaXR5IHRhYmxlLlxuICpcbiAqIFJvdXRlIG5hbWVzIGFuZCBwYXJhbWV0ZXIgc2hhcGVzIGFyZSBzb3VyY2VkIGZyb20gQGNvY29zL2NyZWF0b3ItdHlwZXNcbiAqIChlZGl0b3IvcGFja2FnZXMve3NjZW5lLGFzc2V0LWRifS9AdHlwZXMpLiBFYWNoIGNhcGFiaWxpdHkgbGlzdHMgdGhlXG4gKiBjYW5vbmljYWwgMy44Lnggcm91dGUgZmlyc3Q7IGEgZ2VudWluZSBhbHRlcm5hdGl2ZSBpcyBrZXB0IGFzIGEgZmFsbGJhY2tcbiAqIHdoZXJlIG9uZSBleGlzdHMuIE1lc3NhZ2VzIHRha2UgYSBzaW5nbGUgb3B0aW9ucyBvYmplY3QgKHNjZW5lKSBvciBhXG4gKiBzaW5nbGUgcG9zaXRpb25hbCBzdHJpbmcgKGFzc2V0LWRiKSDigJQgbmV2ZXIgdGhlIHBsdXJhbC9wb3NpdGlvbmFsIGZvcm1zXG4gKiB0aGF0IGVhcmxpZXIgZHJhZnRzIGd1ZXNzZWQgYXQuXG4gKi9cbmV4cG9ydCBjb25zdCBjb2NvczM4Q2FwYWJpbGl0aWVzOiBSZWNvcmQ8RWRpdG9yQ2FwYWJpbGl0eSwgQ2FwYWJpbGl0eVJvdXRlW10+ID0ge1xuICAgIC8vIGFzc2V0LWRiOnF1ZXJ5LXV1aWQodXJsKSAtPiBzdHJpbmcgfCBudWxsXG4gICAgJ2Fzc2V0LnVybFRvVXVpZCc6IFtcbiAgICAgICAgcm91dGUoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXV1aWQnLCBmYWxzZSwgdmFsdWUgPT4gW2FzU3RyaW5nKHZhbHVlPy51cmwgPz8gdmFsdWUpXSwgdmFsdWUgPT4gdmFsdWUgPz8gbnVsbClcbiAgICBdLFxuICAgIC8vIGFzc2V0LWRiOnF1ZXJ5LXVybCh1dWlkKSAtPiBzdHJpbmcgfCBudWxsXG4gICAgJ2Fzc2V0LnV1aWRUb1VybCc6IFtcbiAgICAgICAgcm91dGUoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXVybCcsIGZhbHNlLCB2YWx1ZSA9PiBbYXNTdHJpbmcodmFsdWU/LnV1aWQgPz8gdmFsdWUpXSwgdmFsdWUgPT4gdmFsdWUgPz8gbnVsbClcbiAgICBdLFxuICAgIC8vIGFzc2V0LWRiOnJlZnJlc2gtYXNzZXQodXJsKSAtPiBib29sZWFuIDsgcmVpbXBvcnQgYXMgZmFsbGJhY2tcbiAgICAnYXNzZXQucmVmcmVzaCc6IFtcbiAgICAgICAgcm91dGUoJ2Fzc2V0LWRiJywgJ3JlZnJlc2gtYXNzZXQnLCB0cnVlLCB2YWx1ZSA9PiBbYXNTdHJpbmcodmFsdWU/LnVybCA/PyB2YWx1ZSldLCBpZGVudGl0eSksXG4gICAgICAgIHJvdXRlKCdhc3NldC1kYicsICdyZWltcG9ydC1hc3NldCcsIHRydWUsIHZhbHVlID0+IFthc1N0cmluZyh2YWx1ZT8udXJsID8/IHZhbHVlKV0sIGlkZW50aXR5KVxuICAgIF0sXG4gICAgLy8gc2VsZWN0aW9uOnF1ZXJ5LXNlbGVjdGlvbignbm9kZScpIC0+IHV1aWRbXSA7IHNjZW5lIGZhbGxiYWNrXG4gICAgJ3NlbGVjdGlvbi5xdWVyeU5vZGVzJzogW1xuICAgICAgICByb3V0ZSgnc2VsZWN0aW9uJywgJ3F1ZXJ5LXNlbGVjdGlvbicsIGZhbHNlLCAoKSA9PiBbJ25vZGUnXSwgbm9ybWFsaXplU2VsZWN0aW9uKSxcbiAgICAgICAgcm91dGUoJ3NjZW5lJywgJ3F1ZXJ5LXNlbGVjdGlvbicsIGZhbHNlLCAoKSA9PiBbJ25vZGUnXSwgbm9ybWFsaXplU2VsZWN0aW9uKVxuICAgIF0sXG4gICAgLy8gc2NlbmU6Y3JlYXRlLW5vZGUoQ3JlYXRlTm9kZU9wdGlvbnMpIC0+IHN0cmluZ1tdIChuZXcgdXVpZHMpXG4gICAgJ3NjZW5lLmNyZWF0ZU5vZGUnOiBbXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdjcmVhdGUtbm9kZScsIHRydWUsIHZhbHVlID0+IFtjcmVhdGVOb2RlT3B0aW9ucyh2YWx1ZSldLCBub3JtYWxpemVVdWlkQXJyYXkpXG4gICAgXSxcbiAgICAvLyBzY2VuZTpjcmVhdGUtbm9kZSh7IGFzc2V0VXVpZCwgLi4ub3B0aW9ucyB9KSAtPiBzdHJpbmdbXVxuICAgICdzY2VuZS5pbnN0YW50aWF0ZUFzc2V0JzogW1xuICAgICAgICByb3V0ZSgnc2NlbmUnLCAnY3JlYXRlLW5vZGUnLCB0cnVlLCB2YWx1ZSA9PiBbaW5zdGFudGlhdGVPcHRpb25zKHZhbHVlKV0sIG5vcm1hbGl6ZVV1aWRBcnJheSlcbiAgICBdLFxuICAgIC8vIHNjZW5lOnJlbW92ZS1ub2RlKHsgdXVpZCwga2VlcFdvcmxkVHJhbnNmb3JtPyB9KSAtPiB2b2lkXG4gICAgJ3NjZW5lLmRlbGV0ZU5vZGVzJzogW1xuICAgICAgICByb3V0ZSgnc2NlbmUnLCAncmVtb3ZlLW5vZGUnLCB0cnVlLCB2YWx1ZSA9PiBbeyB1dWlkOiB2YWx1ZT8udXVpZHMgPz8gdmFsdWU/LnV1aWQgPz8gdmFsdWUsIGtlZXBXb3JsZFRyYW5zZm9ybTogdmFsdWU/LmtlZXBXb3JsZFRyYW5zZm9ybSB9XSwgaWRlbnRpdHkpXG4gICAgXSxcbiAgICAvLyBzY2VuZTpkdXBsaWNhdGUtbm9kZSh1dWlkIHwgdXVpZFtdKSAtPiBzdHJpbmdbXSA7IGNvcHktbm9kZSBmYWxsYmFja1xuICAgICdzY2VuZS5kdXBsaWNhdGVOb2Rlcyc6IFtcbiAgICAgICAgcm91dGUoJ3NjZW5lJywgJ2R1cGxpY2F0ZS1ub2RlJywgdHJ1ZSwgdmFsdWUgPT4gW3ZhbHVlPy51dWlkcyA/PyB2YWx1ZT8udXVpZCA/PyB2YWx1ZV0sIG5vcm1hbGl6ZVV1aWRBcnJheSksXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdjb3B5LW5vZGUnLCB0cnVlLCB2YWx1ZSA9PiBbdmFsdWU/LnV1aWRzID8/IHZhbHVlPy51dWlkID8/IHZhbHVlXSwgbm9ybWFsaXplVXVpZEFycmF5KVxuICAgIF0sXG4gICAgLy8gc2NlbmU6c2V0LXBhcmVudCh7IHBhcmVudCwgdXVpZHMsIGtlZXBXb3JsZFRyYW5zZm9ybT8gfSkgLT4gc3RyaW5nW11cbiAgICAnc2NlbmUubW92ZU5vZGVzJzogW1xuICAgICAgICByb3V0ZSgnc2NlbmUnLCAnc2V0LXBhcmVudCcsIHRydWUsIHZhbHVlID0+IFt7IHBhcmVudDogdmFsdWU/LnBhcmVudFV1aWQgPz8gdmFsdWU/LnBhcmVudCwgdXVpZHM6IHZhbHVlPy51dWlkcyA/PyB2YWx1ZT8udXVpZCwga2VlcFdvcmxkVHJhbnNmb3JtOiB2YWx1ZT8ua2VlcFdvcmxkVHJhbnNmb3JtIH1dLCBub3JtYWxpemVVdWlkQXJyYXkpXG4gICAgXSxcbiAgICAvLyBzY2VuZTpzYXZlLXNjZW5lKFtdIHwgW2Jvb2xlYW5dKSAtPiBib29sZWFuXG4gICAgJ3NjZW5lLnNhdmUnOiBbXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdzYXZlLXNjZW5lJywgdHJ1ZSwgdmFsdWUgPT4gKHZhbHVlID09PSB1bmRlZmluZWQgPyBbXSA6IFt2YWx1ZV0pLCBpZGVudGl0eSksXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdzdGFzaC1hbmQtc2F2ZScsIHRydWUsIHZhbHVlID0+ICh2YWx1ZSA9PT0gdW5kZWZpbmVkID8gW10gOiBbdmFsdWVdKSwgaWRlbnRpdHkpXG4gICAgXSxcbiAgICAvLyBzY2VuZTpxdWVyeS1kaXJ0eSgpIC0+IGJvb2xlYW5cbiAgICAnc2NlbmUuZGlydHlTdGF0ZSc6IFtcbiAgICAgICAgcm91dGUoJ3NjZW5lJywgJ3F1ZXJ5LWRpcnR5JywgZmFsc2UsICgpID0+IFtdLCB2YWx1ZSA9PiBCb29sZWFuKHZhbHVlKSlcbiAgICBdLFxuICAgIC8vIHNjZW5lOmNyZWF0ZS1jb21wb25lbnQoeyB1dWlkLCBjb21wb25lbnQgfSkgLT4gYm9vbGVhblxuICAgICdjb21wb25lbnQuYWRkJzogW1xuICAgICAgICByb3V0ZSgnc2NlbmUnLCAnY3JlYXRlLWNvbXBvbmVudCcsIHRydWUsIHZhbHVlID0+IFt7IHV1aWQ6IHZhbHVlPy5ub2RlVXVpZCA/PyB2YWx1ZT8udXVpZCwgY29tcG9uZW50OiB2YWx1ZT8uY29tcG9uZW50VHlwZSA/PyB2YWx1ZT8uY29tcG9uZW50IH1dLCBpZGVudGl0eSlcbiAgICBdXG59O1xuXG5mdW5jdGlvbiByb3V0ZShwYWNrYWdlTmFtZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcsIHdyaXRlOiBib29sZWFuLCBlbmNvZGU6IChhcmdzOiBhbnkpID0+IGFueVtdLCBkZWNvZGU6IChyZXN1bHQ6IGFueSkgPT4gYW55KTogQ2FwYWJpbGl0eVJvdXRlIHtcbiAgICByZXR1cm4geyByb3V0ZTogeyBwYWNrYWdlOiBwYWNrYWdlTmFtZSwgbWVzc2FnZSB9LCB3cml0ZSwgZW5jb2RlLCBkZWNvZGUgfTtcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWU6IGFueSk6IGFueSB7IHJldHVybiB2YWx1ZTsgfVxuXG5mdW5jdGlvbiBhc1N0cmluZyh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpO1xufVxuXG4vKiogY3JlYXRlLW5vZGUgLyBzZXQtcGFyZW50IC8gZHVwbGljYXRlLW5vZGUgcmV0dXJuIHN0cmluZyB8IHN0cmluZ1tdIC0+IG5vcm1hbGl6ZSB0byBzdHJpbmdbXSAqL1xuZnVuY3Rpb24gbm9ybWFsaXplVXVpZEFycmF5KHZhbHVlOiBhbnkpOiBzdHJpbmdbXSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBbXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiB2YWx1ZS5maWx0ZXIoKHYpOiB2IGlzIHN0cmluZyA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZycpO1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gW3ZhbHVlXSA6IFtdO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTZWxlY3Rpb24odmFsdWU6IGFueSk6IGFueVtdIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIHJldHVybiBbdmFsdWVdO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOb2RlT3B0aW9ucyh2YWx1ZTogYW55KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSBvcHRpb25zLm5hbWUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfVxuICAgIGlmICh2YWx1ZS5uYW1lICE9IG51bGwpIG9wdGlvbnMubmFtZSA9IHZhbHVlLm5hbWU7XG4gICAgaWYgKHZhbHVlLnBhcmVudCAhPSBudWxsKSBvcHRpb25zLnBhcmVudCA9IHZhbHVlLnBhcmVudDtcbiAgICBpZiAodmFsdWUucGFyZW50VXVpZCAhPSBudWxsKSBvcHRpb25zLnBhcmVudCA9IHZhbHVlLnBhcmVudFV1aWQ7XG4gICAgaWYgKHZhbHVlLmtlZXBXb3JsZFRyYW5zZm9ybSAhPSBudWxsKSBvcHRpb25zLmtlZXBXb3JsZFRyYW5zZm9ybSA9IHZhbHVlLmtlZXBXb3JsZFRyYW5zZm9ybTtcbiAgICBpZiAodmFsdWUudW5saW5rUHJlZmFiICE9IG51bGwpIG9wdGlvbnMudW5saW5rUHJlZmFiID0gdmFsdWUudW5saW5rUHJlZmFiO1xuICAgIGlmICh2YWx1ZS5jb21wb25lbnRzICYmIEFycmF5LmlzQXJyYXkodmFsdWUuY29tcG9uZW50cykgJiYgdmFsdWUuY29tcG9uZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIENyZWF0ZU5vZGVPcHRpb25zIGhhcyBubyBgY29tcG9uZW50c2AgZmllbGQgaW4gMy44Lng7IGtlZXAgdHlwZSBmb3IgY2FsbGVycyB0aGF0IHN0aWxsIHBhc3MgaXQuXG4gICAgICAgIG9wdGlvbnMudHlwZSA9IHZhbHVlLmNvbXBvbmVudHNbMF07XG4gICAgfVxuICAgIGlmICh2YWx1ZS50eXBlICE9IG51bGwpIG9wdGlvbnMudHlwZSA9IHZhbHVlLnR5cGU7XG4gICAgaWYgKHZhbHVlLnBvc2l0aW9uICE9IG51bGwpIG9wdGlvbnMucG9zaXRpb24gPSB2YWx1ZS5wb3NpdGlvbjtcbiAgICByZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gaW5zdGFudGlhdGVPcHRpb25zKHZhbHVlOiBhbnkpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgY29uc3QgYmFzZSA9IGNyZWF0ZU5vZGVPcHRpb25zKHZhbHVlKTtcbiAgICBjb25zdCBhc3NldFV1aWQgPSB2YWx1ZT8uYXNzZXRVdWlkID8/IHZhbHVlPy51dWlkO1xuICAgIGlmIChhc3NldFV1aWQgIT0gbnVsbCkgYmFzZS5hc3NldFV1aWQgPSBhc3NldFV1aWQ7XG4gICAgaWYgKHZhbHVlPy51bmxpbmtQcmVmYWIgIT0gbnVsbCkgYmFzZS51bmxpbmtQcmVmYWIgPSB2YWx1ZS51bmxpbmtQcmVmYWI7XG4gICAgcmV0dXJuIGJhc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3V0ZUtleShyb3V0ZTogRWRpdG9yTWVzc2FnZVJvdXRlKTogc3RyaW5nIHsgcmV0dXJuIGAke3JvdXRlLnBhY2thZ2V9OiR7cm91dGUubWVzc2FnZX1gOyB9XG4iXX0=