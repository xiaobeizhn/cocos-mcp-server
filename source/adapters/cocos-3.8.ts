import { EditorCapability, EditorMessageRoute } from '../types';

export interface CapabilityRoute {
    route: EditorMessageRoute;
    write: boolean;
    encode(args: any): any[];
    decode(result: any): any;
}

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
export const cocos38Capabilities: Record<EditorCapability, CapabilityRoute[]> = {
    // asset-db:query-uuid(url) -> string | null
    'asset.urlToUuid': [
        route('asset-db', 'query-uuid', false, value => [asString(value?.url ?? value)], value => value ?? null)
    ],
    // asset-db:query-url(uuid) -> string | null
    'asset.uuidToUrl': [
        route('asset-db', 'query-url', false, value => [asString(value?.uuid ?? value)], value => value ?? null)
    ],
    // asset-db:refresh-asset(url) -> boolean ; reimport as fallback
    'asset.refresh': [
        route('asset-db', 'refresh-asset', true, value => [asString(value?.url ?? value)], identity),
        route('asset-db', 'reimport-asset', true, value => [asString(value?.url ?? value)], identity)
    ],
    // asset-db:url-to-fspath(url) -> string | null ; query-path compat (best-effort)
    'asset.urlToFspath': [
        route('asset-db', 'url-to-fspath', false, value => [asString(value?.url ?? value)], normalizeFspath),
        route('asset-db', 'query-path', false, value => [asString(value?.url ?? value)], normalizeFspath)
    ],
    // asset-db:create-asset(name, content?, options?) -> asset record ; no overwrite, no rename
    'asset.create': [
        route('asset-db', 'create-asset', true, value => [asString(value?.url), value?.content ?? '', { overwrite: false, rename: false }], normalizeCreateResult)
    ],
    // asset-db:delete-asset(url) -> boolean ; single string form (@cocos/creator-types 3.8.6)
    'asset.delete': [
        route('asset-db', 'delete-asset', true, value => [asString(value?.url ?? value)], identity)
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
        route('scene', 'remove-node', true, value => [{ uuid: value?.uuids ?? value?.uuid ?? value, keepWorldTransform: value?.keepWorldTransform }], identity)
    ],
    // scene:duplicate-node(uuid | uuid[]) -> string[] ; copy-node fallback
    'scene.duplicateNodes': [
        route('scene', 'duplicate-node', true, value => [value?.uuids ?? value?.uuid ?? value], normalizeUuidArray),
        route('scene', 'copy-node', true, value => [value?.uuids ?? value?.uuid ?? value], normalizeUuidArray)
    ],
    // scene:set-parent({ parent, uuids, keepWorldTransform? }) -> string[]
    'scene.moveNodes': [
        route('scene', 'set-parent', true, value => [{ parent: value?.parentUuid ?? value?.parent, uuids: value?.uuids ?? value?.uuid, keepWorldTransform: value?.keepWorldTransform }], normalizeUuidArray)
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
        route('scene', 'create-component', true, value => [{ uuid: value?.nodeUuid ?? value?.uuid, component: value?.componentType ?? value?.component }], identity)
    ]
};

function route(packageName: string, message: string, write: boolean, encode: (args: any) => any[], decode: (result: any) => any): CapabilityRoute {
    return { route: { package: packageName, message }, write, encode, decode };
}

function identity(value: any): any { return value; }

function asString(value: any): string {
    if (value == null) return '';
    return typeof value === 'string' ? value : String(value);
}

/** create-node / set-parent / duplicate-node return string | string[] -> normalize to string[] */
function normalizeUuidArray(value: any): string[] {
    if (value == null) return [];
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
    return typeof value === 'string' ? [value] : [];
}

function normalizeSelection(value: any): any[] {
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    return [value];
}

/**
 * asset-db:url-to-fspath returns a filesystem path string (or null when the URL
 * has no backing file). The query-path compat fallback returns an asset record;
 * we coerce either shape to a path string when possible.
 */
function normalizeFspath(value: any): string | null {
    if (value == null) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value?.path ?? value?.fsPath ?? value?.url ?? null;
    return null;
}

/**
 * asset-db:create-asset returns the created asset record (with uuid/url) or a
 * boolean on some versions. Normalize to { uuid, url } | true.
 */
function normalizeCreateResult(value: any): { uuid: string | null; url: string | null } | true {
    if (value === true || value === false) return value;
    if (value && typeof value === 'object') {
        return { uuid: value.uuid ?? null, url: value.url ?? value.source ?? null };
    }
    return { uuid: null, url: null };
}

/**
 * selection:query-global-activate returns the active node selection. It may be
 * a uuid string, a record, or null. Normalize to { type, uuid } | null.
 */
function normalizeGlobalActive(value: any): { type: 'node'; uuid: string } | null {
    if (value == null) return null;
    if (typeof value === 'string') return { type: 'node', uuid: value };
    if (Array.isArray(value)) {
        const first = value.find((v): v is string => typeof v === 'string');
        return first ? { type: 'node', uuid: first } : null;
    }
    if (typeof value === 'object') {
        const uuid = value.uuid ?? value.id ?? value.uuids?.[0];
        return uuid ? { type: 'node', uuid } : null;
    }
    return null;
}

function createNodeOptions(value: any): Record<string, unknown> {
    const options: Record<string, unknown> = {};
    if (!value || typeof value !== 'object') {
        if (typeof value === 'string') options.name = value;
        return options;
    }
    if (value.name != null) options.name = value.name;
    if (value.parent != null) options.parent = value.parent;
    if (value.parentUuid != null) options.parent = value.parentUuid;
    if (value.keepWorldTransform != null) options.keepWorldTransform = value.keepWorldTransform;
    if (value.unlinkPrefab != null) options.unlinkPrefab = value.unlinkPrefab;
    if (value.components && Array.isArray(value.components) && value.components.length > 0) {
        // CreateNodeOptions has no `components` field in 3.8.x; keep type for callers that still pass it.
        options.type = value.components[0];
    }
    if (value.type != null) options.type = value.type;
    if (value.position != null) options.position = value.position;
    return options;
}

function instantiateOptions(value: any): Record<string, unknown> {
    const base = createNodeOptions(value);
    const assetUuid = value?.assetUuid ?? value?.uuid;
    if (assetUuid != null) base.assetUuid = assetUuid;
    if (value?.unlinkPrefab != null) base.unlinkPrefab = value.unlinkPrefab;
    return base;
}

export function routeKey(route: EditorMessageRoute): string { return `${route.package}:${route.message}`; }
