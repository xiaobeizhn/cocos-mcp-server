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
    // asset-db:url-to-fspath(url) -> string | null ; query-path compat (best-effort)
    'asset.urlToFspath': [
        route('asset-db', 'url-to-fspath', false, value => { var _a; return [asString((_a = value === null || value === void 0 ? void 0 : value.url) !== null && _a !== void 0 ? _a : value)]; }, normalizeFspath),
        route('asset-db', 'query-path', false, value => { var _a; return [asString((_a = value === null || value === void 0 ? void 0 : value.url) !== null && _a !== void 0 ? _a : value)]; }, normalizeFspath)
    ],
    // asset-db:create-asset(name, content?, options?) -> asset record ; no overwrite, no rename
    'asset.create': [
        route('asset-db', 'create-asset', true, value => { var _a; return [asString(value === null || value === void 0 ? void 0 : value.url), (_a = value === null || value === void 0 ? void 0 : value.content) !== null && _a !== void 0 ? _a : '', { overwrite: false, rename: false }]; }, normalizeCreateResult)
    ],
    // asset-db:delete-asset(url) -> boolean ; single string form (@cocos/creator-types 3.8.6)
    'asset.delete': [
        route('asset-db', 'delete-asset', true, value => { var _a; return [asString((_a = value === null || value === void 0 ? void 0 : value.url) !== null && _a !== void 0 ? _a : value)]; }, identity)
    ],
    // selection:query-selection('node') -> uuid[] ; scene fallback
    'selection.queryNodes': [
        route('selection', 'query-selection', false, () => ['node'], normalizeSelection),
        route('scene', 'query-selection', false, () => ['node'], normalizeSelection)
    ],
    // selection:query-global-activate() -> node active selection
    'selection.queryGlobalActive': [
        route('selection', 'query-global-activate', false, () => [], normalizeGlobalActive)
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
/**
 * asset-db:url-to-fspath returns a filesystem path string (or null when the URL
 * has no backing file). The query-path compat fallback returns an asset record;
 * we coerce either shape to a path string when possible.
 */
function normalizeFspath(value) {
    var _a, _b, _c;
    if (value == null)
        return null;
    if (typeof value === 'string')
        return value;
    if (typeof value === 'object')
        return (_c = (_b = (_a = value === null || value === void 0 ? void 0 : value.path) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.fsPath) !== null && _b !== void 0 ? _b : value === null || value === void 0 ? void 0 : value.url) !== null && _c !== void 0 ? _c : null;
    return null;
}
/**
 * asset-db:create-asset returns the created asset record (with uuid/url) or a
 * boolean on some versions. Normalize to { uuid, url } | true.
 */
function normalizeCreateResult(value) {
    var _a, _b, _c;
    if (value === true || value === false)
        return value;
    if (value && typeof value === 'object') {
        return { uuid: (_a = value.uuid) !== null && _a !== void 0 ? _a : null, url: (_c = (_b = value.url) !== null && _b !== void 0 ? _b : value.source) !== null && _c !== void 0 ? _c : null };
    }
    return { uuid: null, url: null };
}
/**
 * selection:query-global-activate returns the active node selection. It may be
 * a uuid string, a record, or null. Normalize to { type, uuid } | null.
 */
function normalizeGlobalActive(value) {
    var _a, _b, _c;
    if (value == null)
        return null;
    if (typeof value === 'string')
        return { type: 'node', uuid: value };
    if (Array.isArray(value)) {
        const first = value.find((v) => typeof v === 'string');
        return first ? { type: 'node', uuid: first } : null;
    }
    if (typeof value === 'object') {
        const uuid = (_b = (_a = value.uuid) !== null && _a !== void 0 ? _a : value.id) !== null && _b !== void 0 ? _b : (_c = value.uuids) === null || _c === void 0 ? void 0 : _c[0];
        return uuid ? { type: 'node', uuid } : null;
    }
    return null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29jb3MtMy44LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2FkYXB0ZXJzL2NvY29zLTMuOC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUF5TEEsNEJBQTJHO0FBaEwzRzs7Ozs7Ozs7O0dBU0c7QUFDVSxRQUFBLG1CQUFtQixHQUFnRDtJQUM1RSw0Q0FBNEM7SUFDNUMsaUJBQWlCLEVBQUU7UUFDZixLQUFLLENBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBQyxPQUFBLENBQUMsUUFBUSxDQUFDLE1BQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLEdBQUcsbUNBQUksS0FBSyxDQUFDLENBQUMsQ0FBQSxFQUFBLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxJQUFJLENBQUM7S0FDM0c7SUFDRCw0Q0FBNEM7SUFDNUMsaUJBQWlCLEVBQUU7UUFDZixLQUFLLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBQyxPQUFBLENBQUMsUUFBUSxDQUFDLE1BQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLElBQUksbUNBQUksS0FBSyxDQUFDLENBQUMsQ0FBQSxFQUFBLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxJQUFJLENBQUM7S0FDM0c7SUFDRCxnRUFBZ0U7SUFDaEUsZUFBZSxFQUFFO1FBQ2IsS0FBSyxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQUMsT0FBQSxDQUFDLFFBQVEsQ0FBQyxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxHQUFHLG1DQUFJLEtBQUssQ0FBQyxDQUFDLENBQUEsRUFBQSxFQUFFLFFBQVEsQ0FBQztR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QVMsR0FBRyxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxTQUFTLG1DQUFJLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxJQUFJLENBQUM7SUFDbEQsSUFBSSxTQUFTLElBQUksSUFBSTtRQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ2xELElBQUksQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsWUFBWSxLQUFJLElBQUk7UUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDeEUsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxLQUF5QixJQUFZLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFZGl0b3JDYXBhYmlsaXR5LCBFZGl0b3JNZXNzYWdlUm91dGUgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FwYWJpbGl0eVJvdXRlIHtcbiAgICByb3V0ZTogRWRpdG9yTWVzc2FnZVJvdXRlO1xuICAgIHdyaXRlOiBib29sZWFuO1xuICAgIGVuY29kZShhcmdzOiBhbnkpOiBhbnlbXTtcbiAgICBkZWNvZGUocmVzdWx0OiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogQ29jb3MgQ3JlYXRvciAzLjgueCBlZGl0b3ItbWVzc2FnZSBjYXBhYmlsaXR5IHRhYmxlLlxuICpcbiAqIFJvdXRlIG5hbWVzIGFuZCBwYXJhbWV0ZXIgc2hhcGVzIGFyZSBzb3VyY2VkIGZyb20gQGNvY29zL2NyZWF0b3ItdHlwZXNcbiAqIChlZGl0b3IvcGFja2FnZXMve3NjZW5lLGFzc2V0LWRifS9AdHlwZXMpLiBFYWNoIGNhcGFiaWxpdHkgbGlzdHMgdGhlXG4gKiBjYW5vbmljYWwgMy44Lnggcm91dGUgZmlyc3Q7IGEgZ2VudWluZSBhbHRlcm5hdGl2ZSBpcyBrZXB0IGFzIGEgZmFsbGJhY2tcbiAqIHdoZXJlIG9uZSBleGlzdHMuIE1lc3NhZ2VzIHRha2UgYSBzaW5nbGUgb3B0aW9ucyBvYmplY3QgKHNjZW5lKSBvciBhXG4gKiBzaW5nbGUgcG9zaXRpb25hbCBzdHJpbmcgKGFzc2V0LWRiKSDigJQgbmV2ZXIgdGhlIHBsdXJhbC9wb3NpdGlvbmFsIGZvcm1zXG4gKiB0aGF0IGVhcmxpZXIgZHJhZnRzIGd1ZXNzZWQgYXQuXG4gKi9cbmV4cG9ydCBjb25zdCBjb2NvczM4Q2FwYWJpbGl0aWVzOiBSZWNvcmQ8RWRpdG9yQ2FwYWJpbGl0eSwgQ2FwYWJpbGl0eVJvdXRlW10+ID0ge1xuICAgIC8vIGFzc2V0LWRiOnF1ZXJ5LXV1aWQodXJsKSAtPiBzdHJpbmcgfCBudWxsXG4gICAgJ2Fzc2V0LnVybFRvVXVpZCc6IFtcbiAgICAgICAgcm91dGUoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXV1aWQnLCBmYWxzZSwgdmFsdWUgPT4gW2FzU3RyaW5nKHZhbHVlPy51cmwgPz8gdmFsdWUpXSwgdmFsdWUgPT4gdmFsdWUgPz8gbnVsbClcbiAgICBdLFxuICAgIC8vIGFzc2V0LWRiOnF1ZXJ5LXVybCh1dWlkKSAtPiBzdHJpbmcgfCBudWxsXG4gICAgJ2Fzc2V0LnV1aWRUb1VybCc6IFtcbiAgICAgICAgcm91dGUoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXVybCcsIGZhbHNlLCB2YWx1ZSA9PiBbYXNTdHJpbmcodmFsdWU/LnV1aWQgPz8gdmFsdWUpXSwgdmFsdWUgPT4gdmFsdWUgPz8gbnVsbClcbiAgICBdLFxuICAgIC8vIGFzc2V0LWRiOnJlZnJlc2gtYXNzZXQodXJsKSAtPiBib29sZWFuIDsgcmVpbXBvcnQgYXMgZmFsbGJhY2tcbiAgICAnYXNzZXQucmVmcmVzaCc6IFtcbiAgICAgICAgcm91dGUoJ2Fzc2V0LWRiJywgJ3JlZnJlc2gtYXNzZXQnLCB0cnVlLCB2YWx1ZSA9PiBbYXNTdHJpbmcodmFsdWU/LnVybCA/PyB2YWx1ZSldLCBpZGVudGl0eSksXG4gICAgICAgIHJvdXRlKCdhc3NldC1kYicsICdyZWltcG9ydC1hc3NldCcsIHRydWUsIHZhbHVlID0+IFthc1N0cmluZyh2YWx1ZT8udXJsID8/IHZhbHVlKV0sIGlkZW50aXR5KVxuICAgIF0sXG4gICAgLy8gYXNzZXQtZGI6dXJsLXRvLWZzcGF0aCh1cmwpIC0+IHN0cmluZyB8IG51bGwgOyBxdWVyeS1wYXRoIGNvbXBhdCAoYmVzdC1lZmZvcnQpXG4gICAgJ2Fzc2V0LnVybFRvRnNwYXRoJzogW1xuICAgICAgICByb3V0ZSgnYXNzZXQtZGInLCAndXJsLXRvLWZzcGF0aCcsIGZhbHNlLCB2YWx1ZSA9PiBbYXNTdHJpbmcodmFsdWU/LnVybCA/PyB2YWx1ZSldLCBub3JtYWxpemVGc3BhdGgpLFxuICAgICAgICByb3V0ZSgnYXNzZXQtZGInLCAncXVlcnktcGF0aCcsIGZhbHNlLCB2YWx1ZSA9PiBbYXNTdHJpbmcodmFsdWU/LnVybCA/PyB2YWx1ZSldLCBub3JtYWxpemVGc3BhdGgpXG4gICAgXSxcbiAgICAvLyBhc3NldC1kYjpjcmVhdGUtYXNzZXQobmFtZSwgY29udGVudD8sIG9wdGlvbnM/KSAtPiBhc3NldCByZWNvcmQgOyBubyBvdmVyd3JpdGUsIG5vIHJlbmFtZVxuICAgICdhc3NldC5jcmVhdGUnOiBbXG4gICAgICAgIHJvdXRlKCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCB0cnVlLCB2YWx1ZSA9PiBbYXNTdHJpbmcodmFsdWU/LnVybCksIHZhbHVlPy5jb250ZW50ID8/ICcnLCB7IG92ZXJ3cml0ZTogZmFsc2UsIHJlbmFtZTogZmFsc2UgfV0sIG5vcm1hbGl6ZUNyZWF0ZVJlc3VsdClcbiAgICBdLFxuICAgIC8vIGFzc2V0LWRiOmRlbGV0ZS1hc3NldCh1cmwpIC0+IGJvb2xlYW4gOyBzaW5nbGUgc3RyaW5nIGZvcm0gKEBjb2Nvcy9jcmVhdG9yLXR5cGVzIDMuOC42KVxuICAgICdhc3NldC5kZWxldGUnOiBbXG4gICAgICAgIHJvdXRlKCdhc3NldC1kYicsICdkZWxldGUtYXNzZXQnLCB0cnVlLCB2YWx1ZSA9PiBbYXNTdHJpbmcodmFsdWU/LnVybCA/PyB2YWx1ZSldLCBpZGVudGl0eSlcbiAgICBdLFxuICAgIC8vIHNlbGVjdGlvbjpxdWVyeS1zZWxlY3Rpb24oJ25vZGUnKSAtPiB1dWlkW10gOyBzY2VuZSBmYWxsYmFja1xuICAgICdzZWxlY3Rpb24ucXVlcnlOb2Rlcyc6IFtcbiAgICAgICAgcm91dGUoJ3NlbGVjdGlvbicsICdxdWVyeS1zZWxlY3Rpb24nLCBmYWxzZSwgKCkgPT4gWydub2RlJ10sIG5vcm1hbGl6ZVNlbGVjdGlvbiksXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdxdWVyeS1zZWxlY3Rpb24nLCBmYWxzZSwgKCkgPT4gWydub2RlJ10sIG5vcm1hbGl6ZVNlbGVjdGlvbilcbiAgICBdLFxuICAgIC8vIHNlbGVjdGlvbjpxdWVyeS1nbG9iYWwtYWN0aXZhdGUoKSAtPiBub2RlIGFjdGl2ZSBzZWxlY3Rpb25cbiAgICAnc2VsZWN0aW9uLnF1ZXJ5R2xvYmFsQWN0aXZlJzogW1xuICAgICAgICByb3V0ZSgnc2VsZWN0aW9uJywgJ3F1ZXJ5LWdsb2JhbC1hY3RpdmF0ZScsIGZhbHNlLCAoKSA9PiBbXSwgbm9ybWFsaXplR2xvYmFsQWN0aXZlKVxuICAgIF0sXG4gICAgLy8gc2NlbmU6Y3JlYXRlLW5vZGUoQ3JlYXRlTm9kZU9wdGlvbnMpIC0+IHN0cmluZ1tdIChuZXcgdXVpZHMpXG4gICAgJ3NjZW5lLmNyZWF0ZU5vZGUnOiBbXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdjcmVhdGUtbm9kZScsIHRydWUsIHZhbHVlID0+IFtjcmVhdGVOb2RlT3B0aW9ucyh2YWx1ZSldLCBub3JtYWxpemVVdWlkQXJyYXkpXG4gICAgXSxcbiAgICAvLyBzY2VuZTpjcmVhdGUtbm9kZSh7IGFzc2V0VXVpZCwgLi4ub3B0aW9ucyB9KSAtPiBzdHJpbmdbXVxuICAgICdzY2VuZS5pbnN0YW50aWF0ZUFzc2V0JzogW1xuICAgICAgICByb3V0ZSgnc2NlbmUnLCAnY3JlYXRlLW5vZGUnLCB0cnVlLCB2YWx1ZSA9PiBbaW5zdGFudGlhdGVPcHRpb25zKHZhbHVlKV0sIG5vcm1hbGl6ZVV1aWRBcnJheSlcbiAgICBdLFxuICAgIC8vIHNjZW5lOnJlbW92ZS1ub2RlKHsgdXVpZCwga2VlcFdvcmxkVHJhbnNmb3JtPyB9KSAtPiB2b2lkXG4gICAgJ3NjZW5lLmRlbGV0ZU5vZGVzJzogW1xuICAgICAgICByb3V0ZSgnc2NlbmUnLCAncmVtb3ZlLW5vZGUnLCB0cnVlLCB2YWx1ZSA9PiBbeyB1dWlkOiB2YWx1ZT8udXVpZHMgPz8gdmFsdWU/LnV1aWQgPz8gdmFsdWUsIGtlZXBXb3JsZFRyYW5zZm9ybTogdmFsdWU/LmtlZXBXb3JsZFRyYW5zZm9ybSB9XSwgaWRlbnRpdHkpXG4gICAgXSxcbiAgICAvLyBzY2VuZTpkdXBsaWNhdGUtbm9kZSh1dWlkIHwgdXVpZFtdKSAtPiBzdHJpbmdbXSA7IGNvcHktbm9kZSBmYWxsYmFja1xuICAgICdzY2VuZS5kdXBsaWNhdGVOb2Rlcyc6IFtcbiAgICAgICAgcm91dGUoJ3NjZW5lJywgJ2R1cGxpY2F0ZS1ub2RlJywgdHJ1ZSwgdmFsdWUgPT4gW3ZhbHVlPy51dWlkcyA/PyB2YWx1ZT8udXVpZCA/PyB2YWx1ZV0sIG5vcm1hbGl6ZVV1aWRBcnJheSksXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdjb3B5LW5vZGUnLCB0cnVlLCB2YWx1ZSA9PiBbdmFsdWU/LnV1aWRzID8/IHZhbHVlPy51dWlkID8/IHZhbHVlXSwgbm9ybWFsaXplVXVpZEFycmF5KVxuICAgIF0sXG4gICAgLy8gc2NlbmU6c2V0LXBhcmVudCh7IHBhcmVudCwgdXVpZHMsIGtlZXBXb3JsZFRyYW5zZm9ybT8gfSkgLT4gc3RyaW5nW11cbiAgICAnc2NlbmUubW92ZU5vZGVzJzogW1xuICAgICAgICByb3V0ZSgnc2NlbmUnLCAnc2V0LXBhcmVudCcsIHRydWUsIHZhbHVlID0+IFt7IHBhcmVudDogdmFsdWU/LnBhcmVudFV1aWQgPz8gdmFsdWU/LnBhcmVudCwgdXVpZHM6IHZhbHVlPy51dWlkcyA/PyB2YWx1ZT8udXVpZCwga2VlcFdvcmxkVHJhbnNmb3JtOiB2YWx1ZT8ua2VlcFdvcmxkVHJhbnNmb3JtIH1dLCBub3JtYWxpemVVdWlkQXJyYXkpXG4gICAgXSxcbiAgICAvLyBzY2VuZTpzYXZlLXNjZW5lKFtdIHwgW2Jvb2xlYW5dKSAtPiBib29sZWFuXG4gICAgJ3NjZW5lLnNhdmUnOiBbXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdzYXZlLXNjZW5lJywgdHJ1ZSwgdmFsdWUgPT4gKHZhbHVlID09PSB1bmRlZmluZWQgPyBbXSA6IFt2YWx1ZV0pLCBpZGVudGl0eSksXG4gICAgICAgIHJvdXRlKCdzY2VuZScsICdzdGFzaC1hbmQtc2F2ZScsIHRydWUsIHZhbHVlID0+ICh2YWx1ZSA9PT0gdW5kZWZpbmVkID8gW10gOiBbdmFsdWVdKSwgaWRlbnRpdHkpXG4gICAgXSxcbiAgICAvLyBzY2VuZTpxdWVyeS1kaXJ0eSgpIC0+IGJvb2xlYW5cbiAgICAnc2NlbmUuZGlydHlTdGF0ZSc6IFtcbiAgICAgICAgcm91dGUoJ3NjZW5lJywgJ3F1ZXJ5LWRpcnR5JywgZmFsc2UsICgpID0+IFtdLCB2YWx1ZSA9PiBCb29sZWFuKHZhbHVlKSlcbiAgICBdLFxuICAgIC8vIHNjZW5lOmNyZWF0ZS1jb21wb25lbnQoeyB1dWlkLCBjb21wb25lbnQgfSkgLT4gYm9vbGVhblxuICAgICdjb21wb25lbnQuYWRkJzogW1xuICAgICAgICByb3V0ZSgnc2NlbmUnLCAnY3JlYXRlLWNvbXBvbmVudCcsIHRydWUsIHZhbHVlID0+IFt7IHV1aWQ6IHZhbHVlPy5ub2RlVXVpZCA/PyB2YWx1ZT8udXVpZCwgY29tcG9uZW50OiB2YWx1ZT8uY29tcG9uZW50VHlwZSA/PyB2YWx1ZT8uY29tcG9uZW50IH1dLCBpZGVudGl0eSlcbiAgICBdXG59O1xuXG5mdW5jdGlvbiByb3V0ZShwYWNrYWdlTmFtZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcsIHdyaXRlOiBib29sZWFuLCBlbmNvZGU6IChhcmdzOiBhbnkpID0+IGFueVtdLCBkZWNvZGU6IChyZXN1bHQ6IGFueSkgPT4gYW55KTogQ2FwYWJpbGl0eVJvdXRlIHtcbiAgICByZXR1cm4geyByb3V0ZTogeyBwYWNrYWdlOiBwYWNrYWdlTmFtZSwgbWVzc2FnZSB9LCB3cml0ZSwgZW5jb2RlLCBkZWNvZGUgfTtcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWU6IGFueSk6IGFueSB7IHJldHVybiB2YWx1ZTsgfVxuXG5mdW5jdGlvbiBhc1N0cmluZyh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpO1xufVxuXG4vKiogY3JlYXRlLW5vZGUgLyBzZXQtcGFyZW50IC8gZHVwbGljYXRlLW5vZGUgcmV0dXJuIHN0cmluZyB8IHN0cmluZ1tdIC0+IG5vcm1hbGl6ZSB0byBzdHJpbmdbXSAqL1xuZnVuY3Rpb24gbm9ybWFsaXplVXVpZEFycmF5KHZhbHVlOiBhbnkpOiBzdHJpbmdbXSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBbXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiB2YWx1ZS5maWx0ZXIoKHYpOiB2IGlzIHN0cmluZyA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZycpO1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gW3ZhbHVlXSA6IFtdO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTZWxlY3Rpb24odmFsdWU6IGFueSk6IGFueVtdIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIHJldHVybiBbdmFsdWVdO1xufVxuXG4vKipcbiAqIGFzc2V0LWRiOnVybC10by1mc3BhdGggcmV0dXJucyBhIGZpbGVzeXN0ZW0gcGF0aCBzdHJpbmcgKG9yIG51bGwgd2hlbiB0aGUgVVJMXG4gKiBoYXMgbm8gYmFja2luZyBmaWxlKS4gVGhlIHF1ZXJ5LXBhdGggY29tcGF0IGZhbGxiYWNrIHJldHVybnMgYW4gYXNzZXQgcmVjb3JkO1xuICogd2UgY29lcmNlIGVpdGhlciBzaGFwZSB0byBhIHBhdGggc3RyaW5nIHdoZW4gcG9zc2libGUuXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZUZzcGF0aCh2YWx1ZTogYW55KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBudWxsO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHJldHVybiB2YWx1ZT8ucGF0aCA/PyB2YWx1ZT8uZnNQYXRoID8/IHZhbHVlPy51cmwgPz8gbnVsbDtcbiAgICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBhc3NldC1kYjpjcmVhdGUtYXNzZXQgcmV0dXJucyB0aGUgY3JlYXRlZCBhc3NldCByZWNvcmQgKHdpdGggdXVpZC91cmwpIG9yIGFcbiAqIGJvb2xlYW4gb24gc29tZSB2ZXJzaW9ucy4gTm9ybWFsaXplIHRvIHsgdXVpZCwgdXJsIH0gfCB0cnVlLlxuICovXG5mdW5jdGlvbiBub3JtYWxpemVDcmVhdGVSZXN1bHQodmFsdWU6IGFueSk6IHsgdXVpZDogc3RyaW5nIHwgbnVsbDsgdXJsOiBzdHJpbmcgfCBudWxsIH0gfCB0cnVlIHtcbiAgICBpZiAodmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIHsgdXVpZDogdmFsdWUudXVpZCA/PyBudWxsLCB1cmw6IHZhbHVlLnVybCA/PyB2YWx1ZS5zb3VyY2UgPz8gbnVsbCB9O1xuICAgIH1cbiAgICByZXR1cm4geyB1dWlkOiBudWxsLCB1cmw6IG51bGwgfTtcbn1cblxuLyoqXG4gKiBzZWxlY3Rpb246cXVlcnktZ2xvYmFsLWFjdGl2YXRlIHJldHVybnMgdGhlIGFjdGl2ZSBub2RlIHNlbGVjdGlvbi4gSXQgbWF5IGJlXG4gKiBhIHV1aWQgc3RyaW5nLCBhIHJlY29yZCwgb3IgbnVsbC4gTm9ybWFsaXplIHRvIHsgdHlwZSwgdXVpZCB9IHwgbnVsbC5cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplR2xvYmFsQWN0aXZlKHZhbHVlOiBhbnkpOiB7IHR5cGU6ICdub2RlJzsgdXVpZDogc3RyaW5nIH0gfCBudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHJldHVybiB7IHR5cGU6ICdub2RlJywgdXVpZDogdmFsdWUgfTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgZmlyc3QgPSB2YWx1ZS5maW5kKCh2KTogdiBpcyBzdHJpbmcgPT4gdHlwZW9mIHYgPT09ICdzdHJpbmcnKTtcbiAgICAgICAgcmV0dXJuIGZpcnN0ID8geyB0eXBlOiAnbm9kZScsIHV1aWQ6IGZpcnN0IH0gOiBudWxsO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBjb25zdCB1dWlkID0gdmFsdWUudXVpZCA/PyB2YWx1ZS5pZCA/PyB2YWx1ZS51dWlkcz8uWzBdO1xuICAgICAgICByZXR1cm4gdXVpZCA/IHsgdHlwZTogJ25vZGUnLCB1dWlkIH0gOiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTm9kZU9wdGlvbnModmFsdWU6IGFueSk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICBjb25zdCBvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgb3B0aW9ucy5uYW1lID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cbiAgICBpZiAodmFsdWUubmFtZSAhPSBudWxsKSBvcHRpb25zLm5hbWUgPSB2YWx1ZS5uYW1lO1xuICAgIGlmICh2YWx1ZS5wYXJlbnQgIT0gbnVsbCkgb3B0aW9ucy5wYXJlbnQgPSB2YWx1ZS5wYXJlbnQ7XG4gICAgaWYgKHZhbHVlLnBhcmVudFV1aWQgIT0gbnVsbCkgb3B0aW9ucy5wYXJlbnQgPSB2YWx1ZS5wYXJlbnRVdWlkO1xuICAgIGlmICh2YWx1ZS5rZWVwV29ybGRUcmFuc2Zvcm0gIT0gbnVsbCkgb3B0aW9ucy5rZWVwV29ybGRUcmFuc2Zvcm0gPSB2YWx1ZS5rZWVwV29ybGRUcmFuc2Zvcm07XG4gICAgaWYgKHZhbHVlLnVubGlua1ByZWZhYiAhPSBudWxsKSBvcHRpb25zLnVubGlua1ByZWZhYiA9IHZhbHVlLnVubGlua1ByZWZhYjtcbiAgICBpZiAodmFsdWUuY29tcG9uZW50cyAmJiBBcnJheS5pc0FycmF5KHZhbHVlLmNvbXBvbmVudHMpICYmIHZhbHVlLmNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBDcmVhdGVOb2RlT3B0aW9ucyBoYXMgbm8gYGNvbXBvbmVudHNgIGZpZWxkIGluIDMuOC54OyBrZWVwIHR5cGUgZm9yIGNhbGxlcnMgdGhhdCBzdGlsbCBwYXNzIGl0LlxuICAgICAgICBvcHRpb25zLnR5cGUgPSB2YWx1ZS5jb21wb25lbnRzWzBdO1xuICAgIH1cbiAgICBpZiAodmFsdWUudHlwZSAhPSBudWxsKSBvcHRpb25zLnR5cGUgPSB2YWx1ZS50eXBlO1xuICAgIGlmICh2YWx1ZS5wb3NpdGlvbiAhPSBudWxsKSBvcHRpb25zLnBvc2l0aW9uID0gdmFsdWUucG9zaXRpb247XG4gICAgcmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGluc3RhbnRpYXRlT3B0aW9ucyh2YWx1ZTogYW55KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgIGNvbnN0IGJhc2UgPSBjcmVhdGVOb2RlT3B0aW9ucyh2YWx1ZSk7XG4gICAgY29uc3QgYXNzZXRVdWlkID0gdmFsdWU/LmFzc2V0VXVpZCA/PyB2YWx1ZT8udXVpZDtcbiAgICBpZiAoYXNzZXRVdWlkICE9IG51bGwpIGJhc2UuYXNzZXRVdWlkID0gYXNzZXRVdWlkO1xuICAgIGlmICh2YWx1ZT8udW5saW5rUHJlZmFiICE9IG51bGwpIGJhc2UudW5saW5rUHJlZmFiID0gdmFsdWUudW5saW5rUHJlZmFiO1xuICAgIHJldHVybiBiYXNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm91dGVLZXkocm91dGU6IEVkaXRvck1lc3NhZ2VSb3V0ZSk6IHN0cmluZyB7IHJldHVybiBgJHtyb3V0ZS5wYWNrYWdlfToke3JvdXRlLm1lc3NhZ2V9YDsgfVxuIl19