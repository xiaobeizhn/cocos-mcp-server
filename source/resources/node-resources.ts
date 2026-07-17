import { ResourceProvider, ResourceDefinition, ResourceReadResult } from '../types';

export class NodeResources implements ResourceProvider {
    getResources(): ResourceDefinition[] {
        return [
            {
                uri: 'cocos://nodes',
                name: 'all_nodes',
                description: 'Flat list of all nodes in the scene with uuid, name, active, path. Supports _page_size and _cursor query params.'
            },
            {
                uri: 'cocos://nodes/{uuid}',
                name: 'node_info',
                description: 'Single node: name, active, transform (position/rotation/scale), layer, parent/children uuids, component type list'
            },
            {
                uri: 'cocos://nodes/{uuid}/components',
                name: 'node_components',
                description: 'Component list on a node with type, enabled, uuid. Supports _page_size and _cursor query params.'
            },
            {
                uri: 'cocos://nodes/{uuid}/component/{type}',
                name: 'node_component',
                description: 'Single component with full property data, identified by component type name'
            },
            {
                uri: 'cocos://nodes/{uuid}/children',
                name: 'node_children',
                description: 'Direct children of a node: uuid, name, active status'
            }
        ];
    }

    async readResource(uri: string, params: Record<string, string>): Promise<ResourceReadResult> {
        if (uri === 'cocos://nodes') {
            return this.readAllNodes(params);
        }
        if (params['uuid'] && params['type']) {
            return this.readNodeComponent(params['uuid'], params['type']);
        }
        if (params['uuid'] && uri.endsWith('/components')) {
            return this.readNodeComponents(params['uuid'], params);
        }
        if (params['uuid'] && uri.endsWith('/children')) {
            return this.readNodeChildren(params['uuid']);
        }
        if (params['uuid']) {
            return this.readNodeInfo(params['uuid']);
        }
        throw new Error(`Unknown resource: ${uri}`);
    }

    private async readAllNodes(params: Record<string, string>): Promise<ResourceReadResult> {
        const tree: any = await Editor.Message.request('scene', 'query-node-tree');
        if (!tree) {
            return { content: JSON.stringify({ items: [], totalCount: 0 }) };
        }

        const allNodes = this.flattenNodeTree(tree, '');
        const pageSize = parseInt(params._page_size || '50', 10);
        const cursor = parseInt(params._cursor || '0', 10);
        const paged = allNodes.slice(cursor, cursor + pageSize);
        const nextCursor = cursor + paged.length < allNodes.length ? cursor + paged.length : null;

        return {
            content: JSON.stringify({
                items: paged,
                totalCount: allNodes.length,
                pageSize,
                cursor,
                nextCursor,
                hasMore: nextCursor !== null
            })
        };
    }

    private async readNodeInfo(uuid: string): Promise<ResourceReadResult> {
        const nodeData: any = await Editor.Message.request('scene', 'query-node', uuid);
        if (!nodeData) {
            throw new Error(`Node not found: ${uuid}`);
        }

        const content = {
            uuid: this.val(nodeData.uuid) || uuid,
            name: this.val(nodeData.name) || 'Unknown',
            active: this.valBool(nodeData.active, true),
            layer: this.valNum(nodeData.layer),
            mobility: this.valNum(nodeData.mobility),
            position: this.valVec3(nodeData.position, { x: 0, y: 0, z: 0 }),
            rotation: this.valVec3(nodeData.rotation, { x: 0, y: 0, z: 0 }),
            scale: this.valVec3(nodeData.scale, { x: 1, y: 1, z: 1 }),
            parent: this.valObj(nodeData.parent)?.uuid || null,
            children: this.valArr(nodeData.children, []),
            componentTypes: this.extractComponentTypes(nodeData)
        };

        return { content: JSON.stringify(content) };
    }

    private async readNodeComponents(uuid: string, params: Record<string, string>): Promise<ResourceReadResult> {
        const nodeData: any = await Editor.Message.request('scene', 'query-node', uuid);
        if (!nodeData) {
            throw new Error(`Node not found: ${uuid}`);
        }

        const allComps = this.extractComponents(nodeData);
        const nodeName = this.val(nodeData.name) || 'Unknown';
        const pageSize = parseInt(params._page_size || '25', 10);
        const cursor = parseInt(params._cursor || '0', 10);
        const paged = allComps.slice(cursor, cursor + pageSize);
        const nextCursor = cursor + paged.length < allComps.length ? cursor + paged.length : null;

        return {
            content: JSON.stringify({
                nodeUuid: uuid,
                nodeName,
                items: paged,
                totalCount: allComps.length,
                pageSize,
                cursor,
                nextCursor,
                hasMore: nextCursor !== null
            })
        };
    }

    private async readNodeComponent(uuid: string, type: string): Promise<ResourceReadResult> {
        const nodeData: any = await Editor.Message.request('scene', 'query-node', uuid);
        if (!nodeData) {
            throw new Error(`Node not found: ${uuid}`);
        }

        const comps = this.valArr(nodeData.__comps__, []);
        const comp = comps.find((c: any) => {
            const compType = c.__type__ || c.type || '';
            return compType.toLowerCase().includes(type.toLowerCase());
        });

        if (!comp) {
            throw new Error(`Component '${type}' not found on node '${this.val(nodeData.name)}'`);
        }

        return {
            content: JSON.stringify({
                nodeUuid: uuid,
                nodeName: this.val(nodeData.name) || 'Unknown',
                component: comp
            })
        };
    }

    private async readNodeChildren(uuid: string): Promise<ResourceReadResult> {
        const nodeData: any = await Editor.Message.request('scene', 'query-node', uuid);
        if (!nodeData) {
            throw new Error(`Node not found: ${uuid}`);
        }

        const childUuids = this.valArr(nodeData.children, []);
        const children: any[] = [];
        for (const childUuid of childUuids) {
            try {
                const child: any = await Editor.Message.request('scene', 'query-node', childUuid);
                if (child) {
                    children.push({
                        uuid: this.val(child.uuid) || childUuid,
                        name: this.val(child.name) || 'Unknown',
                        active: this.valBool(child.active, true)
                    });
                }
            } catch {
                children.push({ uuid: childUuid, name: 'Unknown', active: true });
            }
        }

        return { content: JSON.stringify(children) };
    }

    // --- Cocos Creator property value unwrapping ---
    // query-node returns wrapped properties like {value: X, type: "String", ...}
    // These helpers extract the raw value.

    private val(prop: any): any {
        if (prop == null) return null;
        return prop.value !== undefined ? prop.value : prop;
    }

    private valBool(prop: any, defaultVal: boolean): boolean {
        const v = this.val(prop);
        return v !== null && v !== undefined ? !!v : defaultVal;
    }

    private valNum(prop: any): number | null {
        const v = this.val(prop);
        return typeof v === 'number' ? v : null;
    }

    private valVec3(prop: any, defaultVal: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
        const v = this.val(prop);
        if (!v || typeof v !== 'object') return defaultVal;
        return { x: v.x ?? defaultVal.x, y: v.y ?? defaultVal.y, z: v.z ?? defaultVal.z };
    }

    private valObj(prop: any): any {
        const v = this.val(prop);
        return v && typeof v === 'object' ? v : null;
    }

    private valArr(prop: any, defaultVal: any[]): any[] {
        const v = this.val(prop);
        return Array.isArray(v) ? v : defaultVal;
    }

    private flattenNodeTree(node: any, parentPath: string): any[] {
        const currentPath = parentPath ? `${parentPath}/${node.name}` : `/${node.name}`;
        const result: any[] = [{
            uuid: node.uuid,
            name: node.name,
            active: node.active,
            path: currentPath
        }];

        if (node.children) {
            for (const child of node.children) {
                result.push(...this.flattenNodeTree(child, currentPath));
            }
        }

        return result;
    }

    private extractComponentTypes(nodeData: any): string[] {
        const comps = this.valArr(nodeData.__comps__, this.valArr(nodeData.components, []));
        return comps.map((c: any) => c.__type__ || c.type || 'Unknown');
    }

    private extractComponents(nodeData: any): any[] {
        const comps = this.valArr(nodeData.__comps__, []);
        return comps.map((c: any) => ({
            type: c.__type__ || 'Unknown',
            enabled: c.enabled !== undefined ? c.enabled : true,
            uuid: c.uuid || null
        }));
    }
}
