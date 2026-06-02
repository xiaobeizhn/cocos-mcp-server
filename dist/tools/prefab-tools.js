"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabTools = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PrefabTools {
    getTools() {
        return [
            {
                name: 'get_prefab_list',
                description: 'Get all prefabs in the project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        folder: {
                            type: 'string',
                            description: 'Folder path to search (optional)',
                            default: 'db://assets'
                        }
                    }
                }
            },
            {
                name: 'load_prefab',
                description: 'Load a prefab by path',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'instantiate_prefab',
                description: 'Instantiate a prefab in the scene',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        },
                        parentUuid: {
                            type: 'string',
                            description: 'Parent node UUID (optional)'
                        },
                        position: {
                            type: 'object',
                            description: 'Initial position',
                            properties: {
                                x: { type: 'number' },
                                y: { type: 'number' },
                                z: { type: 'number' }
                            }
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'create_prefab',
                description: 'Create a prefab from a node with all children and components',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: 'Source node UUID'
                        },
                        savePath: {
                            type: 'string',
                            description: 'Path to save the prefab (e.g., db://assets/prefabs/MyPrefab.prefab)'
                        },
                        prefabName: {
                            type: 'string',
                            description: 'Prefab name'
                        }
                    },
                    required: ['nodeUuid', 'savePath', 'prefabName']
                }
            },
            {
                name: 'update_prefab',
                description: 'Update an existing prefab',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        },
                        nodeUuid: {
                            type: 'string',
                            description: 'Node UUID with changes'
                        }
                    },
                    required: ['prefabPath', 'nodeUuid']
                }
            },
            {
                name: 'revert_prefab',
                description: 'Revert prefab instance to original',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: 'Prefab instance node UUID'
                        }
                    },
                    required: ['nodeUuid']
                }
            },
            {
                name: 'get_prefab_info',
                description: 'Get detailed prefab information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'validate_prefab',
                description: 'Validate a prefab file format',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'duplicate_prefab',
                description: 'Duplicate an existing prefab',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourcePrefabPath: {
                            type: 'string',
                            description: 'Source prefab path'
                        },
                        targetPrefabPath: {
                            type: 'string',
                            description: 'Target prefab path'
                        },
                        newPrefabName: {
                            type: 'string',
                            description: 'New prefab name'
                        }
                    },
                    required: ['sourcePrefabPath', 'targetPrefabPath']
                }
            },
            {
                name: 'restore_prefab_node',
                description: 'Restore prefab node using prefab asset (built-in undo record)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: 'Prefab instance node UUID'
                        },
                        assetUuid: {
                            type: 'string',
                            description: 'Prefab asset UUID'
                        }
                    },
                    required: ['nodeUuid', 'assetUuid']
                }
            }
        ];
    }
    async execute(toolName, args) {
        switch (toolName) {
            case 'get_prefab_list':
                return await this.getPrefabList(args.folder);
            case 'load_prefab':
                return await this.loadPrefab(args.prefabPath);
            case 'instantiate_prefab':
                return await this.instantiatePrefab(args);
            case 'create_prefab':
                return await this.createPrefab(args);
            case 'update_prefab':
                return await this.updatePrefab(args.prefabPath, args.nodeUuid);
            case 'revert_prefab':
                return await this.revertPrefab(args.nodeUuid);
            case 'get_prefab_info':
                return await this.getPrefabInfo(args.prefabPath);
            case 'validate_prefab':
                return await this.validatePrefab(args.prefabPath);
            case 'duplicate_prefab':
                return await this.duplicatePrefab(args);
            case 'restore_prefab_node':
                return await this.restorePrefabNode(args.nodeUuid, args.assetUuid);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    async getPrefabList(folder = 'db://assets') {
        return new Promise((resolve) => {
            const pattern = folder.endsWith('/') ?
                `${folder}**/*.prefab` : `${folder}/**/*.prefab`;
            Editor.Message.request('asset-db', 'query-assets', {
                pattern: pattern
            }).then((results) => {
                const prefabs = results.map(asset => ({
                    name: asset.name,
                    path: asset.url,
                    uuid: asset.uuid,
                    folder: asset.url.substring(0, asset.url.lastIndexOf('/'))
                }));
                resolve({ success: true, data: prefabs });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async loadPrefab(prefabPath) {
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
            if (!assetInfo) {
                return { success: false, error: 'Prefab not found' };
            }
            const prefabData = await this.readPrefabFile(prefabPath);
            const validationResult = this.validatePrefabFormat(prefabData);
            return {
                success: true,
                data: {
                    uuid: assetInfo.uuid,
                    name: assetInfo.name,
                    path: prefabPath,
                    nodeCount: validationResult.nodeCount,
                    componentCount: validationResult.componentCount,
                    message: 'Prefab loaded successfully',
                },
            };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    }
    async instantiatePrefab(args) {
        return new Promise(async (resolve) => {
            try {
                // 获取预制体资源信息
                const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', args.prefabPath);
                if (!assetInfo) {
                    throw new Error('预制体未找到');
                }
                // 使用正确的 create-node API 从预制体资源实例化
                const createNodeOptions = {
                    assetUuid: assetInfo.uuid
                };
                // 设置父节点
                if (args.parentUuid) {
                    createNodeOptions.parent = args.parentUuid;
                }
                // 设置节点名称
                if (args.name) {
                    createNodeOptions.name = args.name;
                }
                else if (assetInfo.name) {
                    createNodeOptions.name = assetInfo.name;
                }
                // 设置初始属性（如位置）
                if (args.position) {
                    createNodeOptions.dump = {
                        position: {
                            value: args.position
                        }
                    };
                }
                // 创建节点
                const nodeUuid = await Editor.Message.request('scene', 'create-node', createNodeOptions);
                const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
                // 注意：create-node API从预制体资源创建时应该自动建立预制体关联
                console.log('预制体节点创建成功:', {
                    nodeUuid: uuid,
                    prefabUuid: assetInfo.uuid,
                    prefabPath: args.prefabPath
                });
                resolve({
                    success: true,
                    data: {
                        nodeUuid: uuid,
                        prefabPath: args.prefabPath,
                        parentUuid: args.parentUuid,
                        position: args.position,
                        message: '预制体实例化成功，已建立预制体关联'
                    }
                });
            }
            catch (err) {
                resolve({
                    success: false,
                    error: `预制体实例化失败: ${err.message}`,
                    instruction: '请检查预制体路径是否正确，确保预制体文件格式正确'
                });
            }
        });
    }
    /**
     * 建立节点与预制体的关联关系
     * 这个方法创建必要的PrefabInfo和PrefabInstance结构
     */
    async establishPrefabConnection(nodeUuid, prefabUuid, prefabPath) {
        var _a;
        try {
            // 读取预制体文件获取根节点的fileId
            const prefabContent = await this.readPrefabFile(prefabPath);
            if (!Array.isArray(prefabContent) || prefabContent.length === 0) {
                throw new Error('无法读取预制体文件内容');
            }
            // 找到预制体根节点的fileId (通常是第二个对象，即索引1)
            const rootNode = prefabContent.find((item) => {
                const node = item;
                return node.__type__ === 'cc.Node' && node._parent === null;
            });
            if (!rootNode || !rootNode._prefab) {
                throw new Error('无法找到预制体根节点或其预制体信息');
            }
            // 获取根节点的PrefabInfo
            const rootPrefabInfo = prefabContent[(_a = rootNode._prefab.__id__) !== null && _a !== void 0 ? _a : -1];
            if (!rootPrefabInfo || rootPrefabInfo.__type__ !== 'cc.PrefabInfo') {
                throw new Error('无法找到预制体根节点的PrefabInfo');
            }
            const rootFileId = rootPrefabInfo.fileId;
            if (!rootFileId) {
                throw new Error('无法找到预制体根节点的 fileId');
            }
            // 使用scene API建立预制体连接
            const prefabConnectionData = {
                node: nodeUuid,
                prefab: prefabUuid,
                fileId: rootFileId
            };
            // 尝试使用多种API方法建立预制体连接
            const connectionMethods = [
                () => Editor.Message.request('scene', 'connect-prefab-instance', prefabConnectionData),
                () => Editor.Message.request('scene', 'set-prefab-connection', prefabConnectionData),
                () => Editor.Message.request('scene', 'apply-prefab-link', prefabConnectionData)
            ];
            let connected = false;
            for (const method of connectionMethods) {
                try {
                    await method();
                    connected = true;
                    break;
                }
                catch (error) {
                    console.warn('预制体连接方法失败，尝试下一个方法:', error);
                }
            }
            if (!connected) {
                // 如果所有API方法都失败，尝试手动修改场景数据
                console.warn('所有预制体连接API都失败，尝试手动建立连接');
                await this.manuallyEstablishPrefabConnection(nodeUuid, prefabUuid, rootFileId);
            }
        }
        catch (error) {
            console.error('建立预制体连接失败:', error);
            throw error;
        }
    }
    /**
     * 手动建立预制体连接（当API方法失败时的备用方案）
     */
    async manuallyEstablishPrefabConnection(nodeUuid, prefabUuid, rootFileId) {
        try {
            // 尝试使用dump API修改节点的_prefab属性
            const prefabConnectionData = {
                [nodeUuid]: {
                    '_prefab': {
                        '__uuid__': prefabUuid,
                        '__expectedType__': 'cc.Prefab',
                        'fileId': rootFileId
                    }
                }
            };
            await Editor.Message.request('scene', 'set-property', {
                uuid: nodeUuid,
                path: '_prefab',
                dump: {
                    value: {
                        '__uuid__': prefabUuid,
                        '__expectedType__': 'cc.Prefab'
                    }
                }
            });
        }
        catch (error) {
            console.error('手动建立预制体连接也失败:', error);
            // 不抛出错误，因为基本的节点创建已经成功
        }
    }
    /**
     * 解析 prefab 的磁盘路径（Creator 3.8 无 read-asset 消息，需通过 query-asset-info + fs 读取）
     */
    async resolvePrefabDiskPath(prefabPath) {
        var _a;
        const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
        const candidatePaths = [];
        if (assetInfo === null || assetInfo === void 0 ? void 0 : assetInfo.source) {
            candidatePaths.push(path.resolve(assetInfo.source));
        }
        if (assetInfo === null || assetInfo === void 0 ? void 0 : assetInfo.path) {
            candidatePaths.push(path.resolve(assetInfo.path));
        }
        const relativePath = prefabPath
            .replace(/^db:\/\/assets\/?/, 'assets/')
            .replace(/^db:\/\//, '');
        const projectPath = (_a = Editor.Project) === null || _a === void 0 ? void 0 : _a.path;
        if (projectPath) {
            candidatePaths.push(path.join(projectPath, relativePath));
        }
        for (const diskPath of candidatePaths) {
            if (fs.existsSync(diskPath)) {
                return diskPath;
            }
        }
        throw new Error(`无法找到预制体文件: ${prefabPath}`);
    }
    /**
     * 读取预制体 JSON 数组内容
     */
    async readPrefabFile(prefabPath) {
        const diskPath = await this.resolvePrefabDiskPath(prefabPath);
        const fileContent = fs.readFileSync(diskPath, 'utf8');
        const prefabData = JSON.parse(fileContent);
        if (!Array.isArray(prefabData)) {
            throw new Error('预制体文件格式错误，根节点必须是数组');
        }
        return prefabData;
    }
    async tryCreateNodeWithPrefab(args) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', args.prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('预制体未找到');
                }
                // 方法2: 使用 create-node 指定预制体资源
                const createNodeOptions = {
                    assetUuid: assetInfo.uuid
                };
                // 设置父节点
                if (args.parentUuid) {
                    createNodeOptions.parent = args.parentUuid;
                }
                return Editor.Message.request('scene', 'create-node', createNodeOptions);
            }).then((nodeUuid) => {
                const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
                // 如果指定了位置，设置节点位置
                if (args.position && uuid) {
                    Editor.Message.request('scene', 'set-property', {
                        uuid: uuid,
                        path: 'position',
                        dump: { value: args.position }
                    }).then(() => {
                        resolve({
                            success: true,
                            data: {
                                nodeUuid: uuid,
                                prefabPath: args.prefabPath,
                                position: args.position,
                                message: '预制体实例化成功（备用方法）并设置了位置'
                            }
                        });
                    }).catch(() => {
                        resolve({
                            success: true,
                            data: {
                                nodeUuid: uuid,
                                prefabPath: args.prefabPath,
                                message: '预制体实例化成功（备用方法）但位置设置失败'
                            }
                        });
                    });
                }
                else {
                    resolve({
                        success: true,
                        data: {
                            nodeUuid: uuid,
                            prefabPath: args.prefabPath,
                            message: '预制体实例化成功（备用方法）'
                        }
                    });
                }
            }).catch((err) => {
                resolve({
                    success: false,
                    error: `备用预制体实例化方法也失败: ${err.message}`
                });
            });
        });
    }
    async tryAlternativeInstantiateMethods(args) {
        return new Promise(async (resolve) => {
            try {
                // 方法1: 尝试使用 create-node 然后设置预制体
                const assetInfo = await this.getAssetInfo(args.prefabPath);
                if (!assetInfo) {
                    resolve({ success: false, error: '无法获取预制体信息' });
                    return;
                }
                // 创建空节点
                const createResult = await this.createNode(args.parentUuid, args.position);
                if (!createResult.success) {
                    resolve(createResult);
                    return;
                }
                // 尝试将预制体应用到节点
                const applyResult = await this.applyPrefabToNode(createResult.data.nodeUuid, assetInfo.uuid);
                if (applyResult.success) {
                    resolve({
                        success: true,
                        data: {
                            nodeUuid: createResult.data.nodeUuid,
                            name: createResult.data.name,
                            message: '预制体实例化成功（使用备选方法）'
                        }
                    });
                }
                else {
                    resolve({
                        success: false,
                        error: '无法将预制体应用到节点',
                        data: {
                            nodeUuid: createResult.data.nodeUuid,
                            message: '已创建节点，但无法应用预制体数据'
                        }
                    });
                }
            }
            catch (error) {
                resolve({ success: false, error: `备选实例化方法失败: ${error}` });
            }
        });
    }
    async getAssetInfo(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                resolve(assetInfo);
            }).catch(() => {
                resolve(null);
            });
        });
    }
    async createNode(parentUuid, position) {
        return new Promise((resolve) => {
            const createNodeOptions = {
                name: 'PrefabInstance'
            };
            // 设置父节点
            if (parentUuid) {
                createNodeOptions.parent = parentUuid;
            }
            // 设置位置
            if (position) {
                createNodeOptions.dump = {
                    position: position
                };
            }
            Editor.Message.request('scene', 'create-node', createNodeOptions).then((nodeUuid) => {
                const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
                resolve({
                    success: true,
                    data: {
                        nodeUuid: uuid,
                        name: 'PrefabInstance'
                    }
                });
            }).catch((error) => {
                resolve({ success: false, error: error.message || '创建节点失败' });
            });
        });
    }
    async applyPrefabToNode(nodeUuid, prefabUuid) {
        return new Promise((resolve) => {
            // 尝试多种方法来应用预制体数据
            const methods = [
                () => Editor.Message.request('scene', 'apply-prefab', { node: nodeUuid, prefab: prefabUuid }),
                () => Editor.Message.request('scene', 'set-prefab', { node: nodeUuid, prefab: prefabUuid }),
                () => Editor.Message.request('scene', 'load-prefab-to-node', { node: nodeUuid, prefab: prefabUuid })
            ];
            const tryMethod = (index) => {
                if (index >= methods.length) {
                    resolve({ success: false, error: '无法应用预制体数据' });
                    return;
                }
                methods[index]().then(() => {
                    resolve({ success: true });
                }).catch(() => {
                    tryMethod(index + 1);
                });
            };
            tryMethod(0);
        });
    }
    /**
     * 使用 asset-db API 创建预制体的新方法
     * 深度整合引擎的资源管理系统，实现完整的预制体创建流程
     */
    async createPrefabWithAssetDB(nodeUuid, savePath, prefabName, includeChildren, includeComponents) {
        return new Promise(async (resolve) => {
            var _a;
            try {
                console.log('=== 使用 Asset-DB API 创建预制体 ===');
                console.log(`节点UUID: ${nodeUuid}`);
                console.log(`保存路径: ${savePath}`);
                console.log(`预制体名称: ${prefabName}`);
                // 第一步：获取节点数据（包括变换属性）
                const nodeData = await this.getNodeData(nodeUuid);
                if (!nodeData) {
                    resolve({
                        success: false,
                        error: '无法获取节点数据'
                    });
                    return;
                }
                console.log('获取到节点数据，子节点数量:', nodeData.children ? nodeData.children.length : 0);
                // 第二步：先创建资源文件以获取引擎分配的UUID
                console.log('创建预制体资源文件...');
                const tempPrefabContent = JSON.stringify([{ "__type__": "cc.Prefab", "_name": prefabName }], null, 2);
                const createResult = await this.createAssetWithAssetDB(savePath, tempPrefabContent);
                if (!createResult.success) {
                    resolve(createResult);
                    return;
                }
                // 获取引擎分配的实际UUID
                const actualPrefabUuid = (_a = createResult.data) === null || _a === void 0 ? void 0 : _a.uuid;
                if (!actualPrefabUuid) {
                    resolve({
                        success: false,
                        error: '无法获取引擎分配的预制体UUID'
                    });
                    return;
                }
                console.log('引擎分配的UUID:', actualPrefabUuid);
                // 第三步：使用实际UUID重新生成预制体内容
                const prefabContent = await this.createStandardPrefabContent(nodeData, prefabName, actualPrefabUuid, includeChildren, includeComponents);
                const prefabContentString = JSON.stringify(prefabContent, null, 2);
                // 第四步：更新预制体文件内容
                console.log('更新预制体文件内容...');
                const updateResult = await this.updateAssetWithAssetDB(savePath, prefabContentString);
                // 第五步：创建对应的meta文件（使用实际UUID）
                console.log('创建预制体meta文件...');
                const metaContent = this.createStandardMetaContent(prefabName, actualPrefabUuid);
                const metaResult = await this.createMetaWithAssetDB(savePath, metaContent);
                // 第六步：重新导入资源以更新引用
                console.log('重新导入预制体资源...');
                const reimportResult = await this.reimportAssetWithAssetDB(savePath);
                // 第七步：尝试将原始节点转换为预制体实例
                console.log('尝试将原始节点转换为预制体实例...');
                const convertResult = await this.convertNodeToPrefabInstance(nodeUuid, actualPrefabUuid, savePath);
                resolve({
                    success: true,
                    data: {
                        prefabUuid: actualPrefabUuid,
                        prefabPath: savePath,
                        nodeUuid: nodeUuid,
                        prefabName: prefabName,
                        convertedToPrefabInstance: convertResult.success,
                        createAssetResult: createResult,
                        updateResult: updateResult,
                        metaResult: metaResult,
                        reimportResult: reimportResult,
                        convertResult: convertResult,
                        message: convertResult.success ? '预制体创建并成功转换原始节点' : '预制体创建成功，但节点转换失败'
                    }
                });
            }
            catch (error) {
                console.error('创建预制体时发生错误:', error);
                resolve({
                    success: false,
                    error: `创建预制体失败: ${error}`
                });
            }
        });
    }
    async createPrefab(args) {
        return new Promise(async (resolve) => {
            try {
                // 支持 prefabPath 和 savePath 两种参数名
                const pathParam = args.prefabPath || args.savePath;
                if (!pathParam) {
                    resolve({
                        success: false,
                        error: '缺少预制体路径参数。请提供 prefabPath 或 savePath。'
                    });
                    return;
                }
                const prefabName = args.prefabName || 'NewPrefab';
                const fullPath = pathParam.endsWith('.prefab') ?
                    pathParam : `${pathParam}/${prefabName}.prefab`;
                const includeChildren = args.includeChildren !== false; // 默认为 true
                const includeComponents = args.includeComponents !== false; // 默认为 true
                // 优先使用新的 asset-db 方法创建预制体
                console.log('使用新的 asset-db 方法创建预制体...');
                const assetDbResult = await this.createPrefabWithAssetDB(args.nodeUuid, fullPath, prefabName, includeChildren, includeComponents);
                if (assetDbResult.success) {
                    resolve(assetDbResult);
                    return;
                }
                // 如果 asset-db 方法失败，尝试使用Cocos Creator的原生预制体创建API
                console.log('asset-db 方法失败，尝试原生API...');
                const nativeResult = await this.createPrefabNative(args.nodeUuid, fullPath);
                if (nativeResult.success) {
                    resolve(nativeResult);
                    return;
                }
                // 如果原生API失败，使用自定义实现
                console.log('原生API失败，使用自定义实现...');
                const customResult = await this.createPrefabCustom(args.nodeUuid, fullPath, prefabName);
                resolve(customResult);
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `创建预制体时发生错误: ${error}`
                });
            }
        });
    }
    async createPrefabNative(nodeUuid, prefabPath) {
        return new Promise((resolve) => {
            // 根据官方API文档，不存在直接的预制体创建API
            // 预制体创建需要手动在编辑器中完成
            resolve({
                success: false,
                error: '原生预制体创建API不存在',
                instruction: '根据Cocos Creator官方API文档，预制体创建需要手动操作：\n1. 在场景中选择节点\n2. 将节点拖拽到资源管理器中\n3. 或右键节点选择"生成预制体"'
            });
        });
    }
    async createPrefabCustom(nodeUuid, prefabPath, prefabName) {
        return new Promise(async (resolve) => {
            var _a, _b;
            try {
                // 1. 获取源节点的完整数据
                const nodeData = await this.getNodeData(nodeUuid);
                if (!nodeData) {
                    resolve({
                        success: false,
                        error: `无法找到节点: ${nodeUuid}`
                    });
                    return;
                }
                // 2. 生成预制体UUID
                const prefabUuid = this.generateUUID();
                // 3. 创建预制体数据结构
                const prefabData = this.createPrefabData(nodeData, prefabName, prefabUuid);
                // 4. 基于官方格式创建预制体数据结构
                console.log('=== 开始创建预制体 ===');
                console.log('节点名称:', ((_a = nodeData.name) === null || _a === void 0 ? void 0 : _a.value) || '未知');
                console.log('节点UUID:', ((_b = nodeData.uuid) === null || _b === void 0 ? void 0 : _b.value) || '未知');
                console.log('预制体保存路径:', prefabPath);
                console.log(`开始创建预制体，节点数据:`, nodeData);
                const prefabJsonData = await this.createStandardPrefabContent(nodeData, prefabName, prefabUuid, true, true);
                // 5. 创建标准meta文件数据
                const standardMetaData = this.createStandardMetaData(prefabName, prefabUuid);
                // 6. 保存预制体和meta文件
                const saveResult = await this.savePrefabWithMeta(prefabPath, prefabJsonData, standardMetaData);
                if (saveResult.success) {
                    // 保存成功后，将原始节点转换为预制体实例
                    const convertResult = await this.convertNodeToPrefabInstance(nodeUuid, prefabPath, prefabUuid);
                    resolve({
                        success: true,
                        data: {
                            prefabUuid: prefabUuid,
                            prefabPath: prefabPath,
                            nodeUuid: nodeUuid,
                            prefabName: prefabName,
                            convertedToPrefabInstance: convertResult.success,
                            message: convertResult.success ?
                                '自定义预制体创建成功，原始节点已转换为预制体实例' :
                                '预制体创建成功，但节点转换失败'
                        }
                    });
                }
                else {
                    resolve({
                        success: false,
                        error: saveResult.error || '保存预制体文件失败'
                    });
                }
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `创建预制体时发生错误: ${error}`
                });
            }
        });
    }
    async getNodeData(nodeUuid) {
        return new Promise(async (resolve) => {
            try {
                // 首先获取基本节点信息
                const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
                if (!nodeInfo) {
                    resolve(null);
                    return;
                }
                console.log(`获取节点 ${nodeUuid} 的基本信息成功`);
                // 使用query-node-tree获取包含子节点的完整结构
                const nodeTree = await this.getNodeWithChildren(nodeUuid);
                if (nodeTree) {
                    console.log(`获取节点 ${nodeUuid} 的完整树结构成功`);
                    resolve(nodeTree);
                }
                else {
                    console.log(`使用基本节点信息`);
                    resolve(nodeInfo);
                }
            }
            catch (error) {
                console.warn(`获取节点数据失败 ${nodeUuid}:`, error);
                resolve(null);
            }
        });
    }
    // 使用query-node-tree获取包含子节点的完整节点结构
    async getNodeWithChildren(nodeUuid) {
        try {
            // 获取整个场景树
            const tree = await Editor.Message.request('scene', 'query-node-tree');
            if (!tree) {
                return null;
            }
            // 在树中查找指定的节点
            const targetNode = this.findNodeInTree(tree, nodeUuid);
            if (targetNode) {
                console.log(`在场景树中找到节点 ${nodeUuid}，子节点数量: ${targetNode.children ? targetNode.children.length : 0}`);
                // 增强节点树，获取每个节点的正确组件信息
                const enhancedTree = await this.enhanceTreeWithMCPComponents(targetNode);
                return enhancedTree;
            }
            return null;
        }
        catch (error) {
            console.warn(`获取节点树结构失败 ${nodeUuid}:`, error);
            return null;
        }
    }
    // 在节点树中递归查找指定UUID的节点
    findNodeInTree(node, targetUuid) {
        var _a;
        if (!node)
            return null;
        // 检查当前节点
        if (node.uuid === targetUuid || ((_a = node.value) === null || _a === void 0 ? void 0 : _a.uuid) === targetUuid) {
            return node;
        }
        // 递归检查子节点
        if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                const found = this.findNodeInTree(child, targetUuid);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
    /**
     * 使用 Editor API 增强节点树，获取正确的组件信息（cid 而非类名）。
     * 替代之前的 HTTP 自调用方案（端口硬编码 8585 不可靠）。
     */
    async enhanceTreeWithMCPComponents(node) {
        if (!node || !node.uuid) {
            return node;
        }
        try {
            const nodeData = await Editor.Message.request('scene', 'query-node', node.uuid);
            if (nodeData && nodeData.__comps__ && nodeData.__comps__.length > 0) {
                // 将 __comps__ 转换为简化的 components 结构（与 component-tools.getComponents 一致）
                const components = nodeData.__comps__.map((comp) => {
                    var _a, _b;
                    const props = {};
                    // 提取组件属性（覆盖常见字段）
                    if (comp.value && typeof comp.value === 'object') {
                        for (const [k, v] of Object.entries(comp.value)) {
                            props[k] = v;
                        }
                    }
                    // 兼容：如果 comp 是 flat object（已经包含属性）
                    for (const [k, v] of Object.entries(comp)) {
                        if (k === '__type__' || k === 'cid' || k === 'uuid' || k === 'enabled')
                            continue;
                        if (k.startsWith('_'))
                            continue; // 跳过内部字段
                        if (!props[k])
                            props[k] = comp[k];
                    }
                    const propUuid = (_a = props === null || props === void 0 ? void 0 : props.uuid) === null || _a === void 0 ? void 0 : _a.value;
                    return {
                        type: comp.__type__ || comp.cid || 'Unknown',
                        uuid: propUuid || ((_b = comp.uuid) === null || _b === void 0 ? void 0 : _b.value) || null,
                        enabled: comp.enabled !== undefined ? comp.enabled : true,
                        properties: props
                    };
                });
                node.components = components;
                console.log(`节点 ${node.uuid} 获取到 ${components.length} 个组件（含正确 cid）`);
            }
        }
        catch (error) {
            console.warn(`获取节点 ${node.uuid} 的组件信息失败:`, error);
        }
        // 递归处理子节点
        if (node.children && Array.isArray(node.children)) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i] = await this.enhanceTreeWithMCPComponents(node.children[i]);
            }
        }
        return node;
    }
    async buildBasicNodeInfo(nodeUuid) {
        return new Promise((resolve) => {
            // 构建基本的节点信息
            Editor.Message.request('scene', 'query-node', nodeUuid).then((nodeInfo) => {
                if (!nodeInfo) {
                    resolve(null);
                    return;
                }
                // 简化版本：只返回基本节点信息，不获取子节点和组件
                // 这些信息将在后续的预制体处理中根据需要添加
                const basicInfo = Object.assign(Object.assign({}, nodeInfo), { children: [], components: [] });
                resolve(basicInfo);
            }).catch(() => {
                resolve(null);
            });
        });
    }
    // 验证节点数据是否有效
    isValidNodeData(nodeData) {
        if (!nodeData)
            return false;
        if (typeof nodeData !== 'object')
            return false;
        // 检查基本属性 - 适配query-node-tree的数据格式
        return nodeData.hasOwnProperty('uuid') ||
            nodeData.hasOwnProperty('name') ||
            nodeData.hasOwnProperty('__type__') ||
            (nodeData.value && (nodeData.value.hasOwnProperty('uuid') ||
                nodeData.value.hasOwnProperty('name') ||
                nodeData.value.hasOwnProperty('__type__')));
    }
    // 提取子节点UUID的统一方法
    extractChildUuid(childRef) {
        if (!childRef)
            return null;
        // 方法1: 直接字符串
        if (typeof childRef === 'string') {
            return childRef;
        }
        // 方法2: value属性包含字符串
        if (childRef.value && typeof childRef.value === 'string') {
            return childRef.value;
        }
        // 方法3: value.uuid属性
        if (childRef.value && childRef.value.uuid) {
            return childRef.value.uuid;
        }
        // 方法4: 直接uuid属性
        if (childRef.uuid) {
            return childRef.uuid;
        }
        // 方法5: __id__引用 - 这种情况需要特殊处理
        if (childRef.__id__ !== undefined) {
            console.log(`发现__id__引用: ${childRef.__id__}，可能需要从数据结构中查找`);
            return null; // 暂时返回null，后续可以添加引用解析逻辑
        }
        console.warn('无法提取子节点UUID:', JSON.stringify(childRef));
        return null;
    }
    // 获取需要处理的子节点数据
    getChildrenToProcess(nodeData) {
        var _a;
        const children = [];
        // 方法1: 直接从children数组获取（从query-node-tree返回的数据）
        if (nodeData.children && Array.isArray(nodeData.children)) {
            console.log(`从children数组获取子节点，数量: ${nodeData.children.length}`);
            for (const child of nodeData.children) {
                // query-node-tree返回的子节点通常已经是完整的数据结构
                if (this.isValidNodeData(child)) {
                    children.push(child);
                    console.log(`添加子节点: ${child.name || ((_a = child.value) === null || _a === void 0 ? void 0 : _a.name) || '未知'}`);
                }
                else {
                    console.log('子节点数据无效:', JSON.stringify(child, null, 2));
                }
            }
        }
        else {
            console.log('节点没有子节点或children数组为空');
        }
        return children;
    }
    generateUUID() {
        // 生成符合Cocos Creator格式的UUID
        const chars = '0123456789abcdef';
        let uuid = '';
        for (let i = 0; i < 32; i++) {
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += chars[Math.floor(Math.random() * chars.length)];
        }
        return uuid;
    }
    createPrefabData(nodeData, prefabName, prefabUuid) {
        // 创建标准的预制体数据结构
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        // 处理节点数据，确保符合预制体格式
        const processedNodeData = this.processNodeForPrefab(nodeData, prefabUuid);
        return [prefabAsset, ...processedNodeData];
    }
    processNodeForPrefab(nodeData, prefabUuid) {
        // 处理节点数据以符合预制体格式
        const processedData = [];
        let idCounter = 1;
        // 递归处理节点和组件
        const processNode = (node, parentId = 0) => {
            const nodeId = idCounter++;
            // 创建节点对象
            const processedNode = {
                "__type__": "cc.Node",
                "_name": node.name || "Node",
                "_objFlags": 0,
                "__editorExtras__": {},
                "_parent": parentId > 0 ? { "__id__": parentId } : null,
                "_children": node.children ? node.children.map(() => ({ "__id__": idCounter++ })) : [],
                "_active": node.active !== false,
                "_components": node.components ? node.components.map(() => ({ "__id__": idCounter++ })) : [],
                "_prefab": {
                    "__id__": idCounter++
                },
                "_lpos": {
                    "__type__": "cc.Vec3",
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "_lrot": {
                    "__type__": "cc.Quat",
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "_lscale": {
                    "__type__": "cc.Vec3",
                    "x": 1,
                    "y": 1,
                    "z": 1
                },
                "_mobility": 0,
                "_layer": 1073741824,
                "_euler": {
                    "__type__": "cc.Vec3",
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "_id": ""
            };
            processedData.push(processedNode);
            // 处理组件
            if (node.components) {
                node.components.forEach((component) => {
                    const componentId = idCounter++;
                    const processedComponents = this.processComponentForPrefab(component, componentId);
                    processedData.push(...processedComponents);
                });
            }
            // 处理子节点
            if (node.children) {
                node.children.forEach((child) => {
                    processNode(child, nodeId);
                });
            }
            return nodeId;
        };
        processNode(nodeData);
        return processedData;
    }
    processComponentForPrefab(component, componentId) {
        // 处理组件数据以符合预制体格式
        const processedComponent = Object.assign({ "__type__": component.type || "cc.Component", "_name": "", "_objFlags": 0, "__editorExtras__": {}, "node": {
                "__id__": componentId - 1
            }, "_enabled": component.enabled !== false, "__prefab": {
                "__id__": componentId + 1
            } }, component.properties);
        // 添加组件特定的预制体信息
        const compPrefabInfo = {
            "__type__": "cc.CompPrefabInfo",
            "fileId": this.generateFileId()
        };
        return [processedComponent, compPrefabInfo];
    }
    generateFileId() {
        // 生成文件ID（简化版本）
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
        let fileId = '';
        for (let i = 0; i < 22; i++) {
            fileId += chars[Math.floor(Math.random() * chars.length)];
        }
        return fileId;
    }
    createMetaData(prefabName, prefabUuid) {
        return {
            "ver": "1.1.50",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName
            }
        };
    }
    async savePrefabFiles(prefabPath, prefabData, metaData) {
        return new Promise((resolve) => {
            try {
                // 使用Editor API保存预制体文件
                const prefabContent = JSON.stringify(prefabData, null, 2);
                const metaContent = JSON.stringify(metaData, null, 2);
                // 尝试使用更可靠的保存方法
                this.saveAssetFile(prefabPath, prefabContent).then(() => {
                    // 再创建meta文件
                    const metaPath = `${prefabPath}.meta`;
                    return this.saveAssetFile(metaPath, metaContent);
                }).then(() => {
                    resolve({ success: true });
                }).catch((error) => {
                    resolve({ success: false, error: error.message || '保存预制体文件失败' });
                });
            }
            catch (error) {
                resolve({ success: false, error: `保存文件时发生错误: ${error}` });
            }
        });
    }
    async saveAssetFile(filePath, content) {
        return new Promise((resolve, reject) => {
            // 尝试多种保存方法
            const saveMethods = [
                () => Editor.Message.request('asset-db', 'create-asset', filePath, content),
                () => Editor.Message.request('asset-db', 'save-asset', filePath, content),
                () => Editor.Message.request('asset-db', 'write-asset', filePath, content)
            ];
            const trySave = (index) => {
                if (index >= saveMethods.length) {
                    reject(new Error('所有保存方法都失败了'));
                    return;
                }
                saveMethods[index]().then(() => {
                    resolve();
                }).catch(() => {
                    trySave(index + 1);
                });
            };
            trySave(0);
        });
    }
    async updatePrefab(prefabPath, nodeUuid) {
        return new Promise(async (resolve) => {
            try {
                const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
                if (!assetInfo) {
                    resolve({ success: false, error: `Prefab not found: ${prefabPath}` });
                    return;
                }
                // 1. 校验节点是否为 prefab 实例（必须是 instantiate 出来的）
                const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
                if (!nodeInfo) {
                    resolve({ success: false, error: `Node not found: ${nodeUuid}` });
                    return;
                }
                const prefabRef = nodeInfo.__prefab__ || nodeInfo.prefab || (nodeInfo.value && (nodeInfo.value.__prefab__ || nodeInfo.value.prefab));
                if (!prefabRef) {
                    resolve({
                        success: false,
                        error: `节点 ${nodeUuid} 不是预制体实例。update_prefab 仅对已实例化的 prefab 根节点生效。请先用 instantiate_prefab 创建实例，修改后再次调用。`
                    });
                    return;
                }
                // 2. 读取更新前的文件内容（用于 diff）
                let beforeSize = 0;
                let beforeHash = '';
                try {
                    const diskPath = await Editor.Message.request('asset-db', 'query-path', assetInfo.url || prefabPath);
                    const fs = require('fs');
                    const filePath = (diskPath === null || diskPath === void 0 ? void 0 : diskPath.file) || (diskPath === null || diskPath === void 0 ? void 0 : diskPath.path);
                    if (filePath && fs.existsSync(filePath)) {
                        const content = fs.readFileSync(filePath);
                        beforeSize = content.length;
                        const crypto = require('crypto');
                        beforeHash = crypto.createHash('sha1').update(content).digest('hex').slice(0, 8);
                    }
                }
                catch ( /* ignore */_a) { /* ignore */ }
                // 3. 执行 apply-prefab
                await Editor.Message.request('scene', 'apply-prefab', {
                    node: nodeUuid,
                    prefab: assetInfo.uuid
                });
                // 等待 asset-db 完成写入
                await new Promise(r => setTimeout(r, 200));
                // 4. 读取更新后的文件内容，计算 diff 摘要
                let afterSize = 0;
                let afterHash = '';
                let sizeDiff = 0;
                let changed = false;
                try {
                    const diskPath = await Editor.Message.request('asset-db', 'query-path', assetInfo.url || prefabPath);
                    const fs = require('fs');
                    const filePath = (diskPath === null || diskPath === void 0 ? void 0 : diskPath.file) || (diskPath === null || diskPath === void 0 ? void 0 : diskPath.path);
                    if (filePath && fs.existsSync(filePath)) {
                        const content = fs.readFileSync(path);
                        afterSize = content.length;
                        const crypto = require('crypto');
                        afterHash = crypto.createHash('sha1').update(content).digest('hex').slice(0, 8);
                        sizeDiff = afterSize - beforeSize;
                        changed = beforeHash !== afterHash;
                    }
                }
                catch ( /* ignore */_b) { /* ignore */ }
                // 5. 重新读取 prefab 内容，统计节点/组件数
                let stats = null;
                try {
                    const afterData = await this.readPrefabFile(prefabPath);
                    let nc = 0, cc = 0, sc = 0;
                    for (const item of afterData || []) {
                        const t = (item === null || item === void 0 ? void 0 : item.__type__) || '';
                        if (t === 'cc.Node')
                            nc++;
                        else if (t === 'cc.MissingScript') {
                            cc++;
                            sc++;
                        }
                        else if (t && !t.startsWith('cc.')) {
                            cc++;
                            sc++;
                        }
                        else if (t)
                            cc++;
                    }
                    stats = { nodes: nc, components: cc, customScripts: sc };
                }
                catch ( /* ignore */_c) { /* ignore */ }
                resolve({
                    success: true,
                    message: changed ? 'Prefab updated successfully' : 'apply-prefab 已执行但 prefab 文件无变化（可能场景没有实质修改）',
                    data: {
                        changed,
                        before: { size: beforeSize, hash: beforeHash },
                        after: { size: afterSize, hash: afterHash },
                        sizeDiff,
                        stats
                    }
                });
            }
            catch (err) {
                resolve({ success: false, error: err.message || String(err) });
            }
        });
    }
    async revertPrefab(nodeUuid) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'revert-prefab', {
                node: nodeUuid
            }).then(() => {
                resolve({
                    success: true,
                    message: 'Prefab instance reverted successfully'
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async getPrefabInfo(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('Prefab not found');
                }
                return Editor.Message.request('asset-db', 'query-asset-meta', assetInfo.uuid);
            }).then((metaInfo) => {
                const info = {
                    name: metaInfo.name,
                    uuid: metaInfo.uuid,
                    path: prefabPath,
                    folder: prefabPath.substring(0, prefabPath.lastIndexOf('/')),
                    createTime: metaInfo.createTime,
                    modifyTime: metaInfo.modifyTime,
                    dependencies: metaInfo.depends || []
                };
                resolve({ success: true, data: info });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async createPrefabFromNode(args) {
        var _a;
        // 从 prefabPath 提取名称
        const prefabPath = args.prefabPath;
        const prefabName = ((_a = prefabPath.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.prefab', '')) || 'NewPrefab';
        // 调用原来的 createPrefab 方法
        return await this.createPrefab({
            nodeUuid: args.nodeUuid,
            savePath: prefabPath,
            prefabName: prefabName
        });
    }
    async validatePrefab(prefabPath) {
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
            if (!assetInfo) {
                return { success: false, error: '预制体文件不存在' };
            }
            const prefabData = await this.readPrefabFile(prefabPath);
            const validationResult = this.validatePrefabFormat(prefabData);
            return {
                success: true,
                data: {
                    isValid: validationResult.isValid,
                    issues: validationResult.issues,
                    nodeCount: validationResult.nodeCount,
                    componentCount: validationResult.componentCount,
                    details: validationResult.details,
                    message: validationResult.isValid ? '预制体格式有效' : '预制体格式存在问题',
                },
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { success: false, error: message };
        }
    }
    validatePrefabFormat(prefabData) {
        const issues = [];
        const warnings = [];
        let nodeCount = 0;
        let componentCount = 0;
        const customScriptComps = [];
        const cidPattern = /^[A-Za-z0-9+/_=]{20,}$/; // 压缩 UUID 形式的 cid（base64 类字符，长度通常 22~23
        // 检查基本结构
        if (!Array.isArray(prefabData)) {
            issues.push('预制体数据必须是数组格式');
            return { isValid: false, issues, nodeCount, componentCount };
        }
        if (prefabData.length === 0) {
            issues.push('预制体数据为空');
            return { isValid: false, issues, nodeCount, componentCount };
        }
        // 检查第一个元素是否为预制体资产
        const firstElement = prefabData[0];
        if (!firstElement || firstElement.__type__ !== 'cc.Prefab') {
            issues.push('第一个元素必须是cc.Prefab类型');
        }
        // 收集所有节点的 @property 绑定信息（用于空绑定检查）
        // key: 节点索引；value: 节点名称 + 已绑定的属性集
        const nodeBindings = new Map();
        // 统计节点和组件 + 详细检查
        prefabData.forEach((item, index) => {
            var _a, _b;
            if (!item || typeof item !== 'object')
                return;
            const t = item.__type__ || '';
            if (t === 'cc.Node') {
                nodeCount++;
                const nodeName = item._name || `Node#${index}`;
                nodeBindings.set(index, { name: nodeName, emptyBindings: [] });
            }
            else if (t) {
                componentCount++;
                if (t === 'cc.MissingScript') {
                    issues.push(`[MissingScript] 索引 ${index}（节点 ${(_b = (_a = item.node) === null || _a === void 0 ? void 0 : _a.__id__) !== null && _b !== void 0 ? _b : '?'}）存在 MissingScript 组件，脚本可能已删除或未编译`);
                }
                else if (!t.startsWith('cc.')) {
                    // 自定义脚本组件
                    customScriptComps.push({ index, type: t, item });
                    // 校验 __type__ 是不是 cid（压缩 UUID）而非类名
                    if (!cidPattern.test(t)) {
                        issues.push(`[ScriptCid] 索引 ${index} 自定义脚本 __type__="${t}" 看起来是类名而非 cid（压缩UUID）。prefab 加载时会出现 MissingScript。`);
                    }
                    // 检查空 @property 绑定：仅当属性值表现为空（null/[]/无 __id__ 引用）
                    const knownMetaKeys = new Set(['__type__', '_name', '_objFlags', '__editorExtras__', 'node', '_enabled', '__prefab', '__scriptAsset', '_id']);
                    const emptyKeys = [];
                    for (const [k, v] of Object.entries(item)) {
                        if (knownMetaKeys.has(k))
                            continue;
                        if (v === null)
                            emptyKeys.push(k);
                        else if (Array.isArray(v) && v.length === 0)
                            emptyKeys.push(`${k}(empty array)`);
                        else if (typeof v === 'object' && v && !('__id__' in v) && !('__uuid__' in v)) {
                            // 对象但既不是 __id__ 也不是 __uuid__，可能是空引用
                            // 仅警告，不视为错误
                        }
                    }
                    if (emptyKeys.length > 0) {
                        warnings.push(`[EmptyBinding] 索引 ${index}(${t.slice(0, 12)}…) 存在空绑定: ${emptyKeys.join(', ')}`);
                    }
                }
            }
        });
        // 检查必要的字段
        if (nodeCount === 0) {
            issues.push('预制体必须包含至少一个节点');
        }
        return {
            isValid: issues.length === 0,
            issues: [...issues, ...warnings],
            nodeCount,
            componentCount,
            details: {
                customScriptCount: customScriptComps.length,
                missingScriptCount: issues.filter(s => s.includes('MissingScript')).length,
                scriptCidIssues: issues.filter(s => s.includes('ScriptCid')).length,
                emptyBindingWarnings: warnings.length
            }
        };
    }
    async duplicatePrefab(args) {
        return new Promise(async (resolve) => {
            var _a;
            try {
                const { sourcePrefabPath, targetPrefabPath, newPrefabName } = args;
                // 读取源预制体
                const sourceInfo = await this.getPrefabInfo(sourcePrefabPath);
                if (!sourceInfo.success) {
                    resolve({
                        success: false,
                        error: `无法读取源预制体: ${sourceInfo.error}`
                    });
                    return;
                }
                // 读取源预制体内容
                const sourceContent = await this.readPrefabContent(sourcePrefabPath);
                if (!sourceContent.success || !sourceContent.data) {
                    resolve({
                        success: false,
                        error: `无法读取源预制体内容: ${(_a = sourceContent.error) !== null && _a !== void 0 ? _a : '未知错误'}`,
                    });
                    return;
                }
                // 生成新的UUID
                const newUuid = this.generateUUID();
                // 修改预制体数据
                const modifiedData = this.modifyPrefabForDuplication(sourceContent.data, newPrefabName, newUuid);
                // 创建新的meta数据
                const newMetaData = this.createMetaData(newPrefabName || 'DuplicatedPrefab', newUuid);
                // 预制体复制功能暂时禁用，因为涉及复杂的序列化格式
                resolve({
                    success: false,
                    error: '预制体复制功能暂时不可用',
                    instruction: '请在 Cocos Creator 编辑器中手动复制预制体：\n1. 在资源管理器中选择要复制的预制体\n2. 右键选择复制\n3. 在目标位置粘贴'
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `复制预制体时发生错误: ${error}`
                });
            }
        });
    }
    async readPrefabContent(prefabPath) {
        try {
            const prefabData = await this.readPrefabFile(prefabPath);
            return { success: true, data: prefabData };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { success: false, error: message || '读取预制体文件失败' };
        }
    }
    modifyPrefabForDuplication(prefabData, newName, newUuid) {
        // 修改预制体数据以创建副本
        const modifiedData = [...prefabData];
        // 修改第一个元素（预制体资产）
        if (modifiedData[0] && modifiedData[0].__type__ === 'cc.Prefab') {
            modifiedData[0]._name = newName || 'DuplicatedPrefab';
        }
        // 更新所有UUID引用（简化版本）
        // 在实际应用中，可能需要更复杂的UUID映射处理
        return modifiedData;
    }
    /**
     * 使用 asset-db API 创建资源文件
     */
    async createAssetWithAssetDB(assetPath, content) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'create-asset', assetPath, content, {
                overwrite: true,
                rename: false
            }).then((assetInfo) => {
                console.log('创建资源文件成功:', assetInfo);
                resolve({ success: true, data: assetInfo });
            }).catch((error) => {
                console.error('创建资源文件失败:', error);
                resolve({ success: false, error: error.message || '创建资源文件失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 创建 meta 文件
     */
    async createMetaWithAssetDB(assetPath, metaContent) {
        return new Promise((resolve) => {
            const metaContentString = JSON.stringify(metaContent, null, 2);
            Editor.Message.request('asset-db', 'save-asset-meta', assetPath, metaContentString).then((assetInfo) => {
                console.log('创建meta文件成功:', assetInfo);
                resolve({ success: true, data: assetInfo });
            }).catch((error) => {
                console.error('创建meta文件失败:', error);
                resolve({ success: false, error: error.message || '创建meta文件失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 重新导入资源
     */
    async reimportAssetWithAssetDB(assetPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'reimport-asset', assetPath).then((result) => {
                console.log('重新导入资源成功:', result);
                resolve({ success: true, data: result });
            }).catch((error) => {
                console.error('重新导入资源失败:', error);
                resolve({ success: false, error: error.message || '重新导入资源失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 更新资源文件内容
     */
    async updateAssetWithAssetDB(assetPath, content) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'save-asset', assetPath, content).then((result) => {
                console.log('更新资源文件成功:', result);
                resolve({ success: true, data: result });
            }).catch((error) => {
                console.error('更新资源文件失败:', error);
                resolve({ success: false, error: error.message || '更新资源文件失败' });
            });
        });
    }
    /**
     * 创建符合 Cocos Creator 标准的预制体内容
     * 完整实现递归节点树处理，匹配引擎标准格式
     */
    async createStandardPrefabContent(nodeData, prefabName, prefabUuid, includeChildren, includeComponents) {
        console.log('开始创建引擎标准预制体内容...');
        const prefabData = [];
        let currentId = 0;
        // 1. 创建预制体资产对象 (index 0)
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName || "", // 确保预制体名称不为空
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        prefabData.push(prefabAsset);
        currentId++;
        // 2. 递归创建完整的节点树结构
        const context = {
            prefabData,
            currentId: currentId + 1, // 根节点占用索引1，子节点从索引2开始
            prefabAssetIndex: 0,
            nodeFileIds: new Map(), // 存储节点ID到fileId的映射
            nodeUuidToIndex: new Map(), // 存储节点UUID到索引的映射
            componentUuidToIndex: new Map() // 存储组件UUID到索引的映射
        };
        // 创建根节点和整个节点树 - 注意：根节点的父节点应该是null，不是预制体对象
        await this.createCompleteNodeTree(nodeData, null, 1, context, includeChildren, includeComponents, prefabName);
        console.log(`预制体内容创建完成，总共 ${prefabData.length} 个对象`);
        console.log('节点fileId映射:', Array.from(context.nodeFileIds.entries()));
        return prefabData;
    }
    /**
     * 递归创建完整的节点树，包括所有子节点和对应的PrefabInfo
     */
    async createCompleteNodeTree(nodeData, parentNodeIndex, nodeIndex, context, includeChildren, includeComponents, nodeName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const { prefabData } = context;
        // 创建节点对象
        const node = this.createEngineStandardNode(nodeData, parentNodeIndex, nodeName);
        // 确保节点在指定的索引位置
        while (prefabData.length <= nodeIndex) {
            prefabData.push(null);
        }
        console.log(`设置节点到索引 ${nodeIndex}: ${node._name}, _parent:`, node._parent, `_children count: ${node._children.length}`);
        prefabData[nodeIndex] = node;
        // 为当前节点生成fileId并记录UUID到索引的映射
        const nodeUuid = this.extractNodeUuid(nodeData);
        const fileId = nodeUuid || this.generateFileId();
        context.nodeFileIds.set(nodeIndex.toString(), fileId);
        // 记录节点UUID到索引的映射
        if (nodeUuid) {
            context.nodeUuidToIndex.set(nodeUuid, nodeIndex);
            console.log(`记录节点UUID映射: ${nodeUuid} -> ${nodeIndex}`);
        }
        // 先处理子节点（保持与手动创建的索引顺序一致）
        const childrenToProcess = this.getChildrenToProcess(nodeData);
        if (includeChildren && childrenToProcess.length > 0) {
            console.log(`处理节点 ${node._name} 的 ${childrenToProcess.length} 个子节点`);
            // 为每个子节点分配索引
            const childIndices = [];
            console.log(`准备为 ${childrenToProcess.length} 个子节点分配索引，当前ID: ${context.currentId}`);
            for (let i = 0; i < childrenToProcess.length; i++) {
                console.log(`处理第 ${i + 1} 个子节点，当前currentId: ${context.currentId}`);
                const childIndex = context.currentId++;
                childIndices.push(childIndex);
                node._children.push({ "__id__": childIndex });
                console.log(`✅ 添加子节点引用到 ${node._name}: {__id__: ${childIndex}}`);
            }
            console.log(`✅ 节点 ${node._name} 最终的子节点数组:`, node._children);
            // 递归创建子节点
            for (let i = 0; i < childrenToProcess.length; i++) {
                const childData = childrenToProcess[i];
                const childIndex = childIndices[i];
                await this.createCompleteNodeTree(childData, nodeIndex, childIndex, context, includeChildren, includeComponents, childData.name || `Child${i + 1}`);
            }
        }
        // 然后处理组件
        if (includeComponents && nodeData.components && Array.isArray(nodeData.components)) {
            console.log(`处理节点 ${node._name} 的 ${nodeData.components.length} 个组件`);
            const componentIndices = [];
            for (const component of nodeData.components) {
                const componentIndex = context.currentId++;
                componentIndices.push(componentIndex);
                node._components.push({ "__id__": componentIndex });
                // 记录组件UUID到索引的映射（关键：MCP 简化结构下 UUID 在 properties.uuid.value）
                let componentUuid = null;
                if (component.uuid) {
                    componentUuid = component.uuid;
                }
                else if (component.value && component.value.uuid) {
                    componentUuid = component.value.uuid;
                }
                else if ((_b = (_a = component.properties) === null || _a === void 0 ? void 0 : _a.uuid) === null || _b === void 0 ? void 0 : _b.value) {
                    componentUuid = component.properties.uuid.value;
                }
                else if ((_f = (_e = (_d = (_c = component.properties) === null || _c === void 0 ? void 0 : _c.__prefab) === null || _d === void 0 ? void 0 : _d.value) === null || _e === void 0 ? void 0 : _e.fileId) === null || _f === void 0 ? void 0 : _f.value) {
                    // 兜底：使用 fileId（CompPrefabInfo 中的）作为内部引用 key
                    componentUuid = component.properties.__prefab.value.fileId.value;
                }
                if (componentUuid) {
                    context.componentUuidToIndex.set(componentUuid, componentIndex);
                    console.log(`记录组件UUID映射: ${componentUuid} -> ${componentIndex}`);
                }
                // 创建组件对象，传入context以处理引用
                const componentObj = this.createComponentObject(component, nodeIndex, context);
                prefabData[componentIndex] = componentObj;
                // 为组件创建 CompPrefabInfo
                const compPrefabInfoIndex = context.currentId++;
                // 优先复用源 prefab 中的 fileId（保持引用稳定）
                const compFileId = ((_k = (_j = (_h = (_g = component.properties) === null || _g === void 0 ? void 0 : _g.__prefab) === null || _h === void 0 ? void 0 : _h.value) === null || _j === void 0 ? void 0 : _j.fileId) === null || _k === void 0 ? void 0 : _k.value) || this.generateFileId();
                prefabData[compPrefabInfoIndex] = {
                    "__type__": "cc.CompPrefabInfo",
                    "fileId": compFileId
                };
                // 如果组件对象有 __prefab 属性，设置引用
                if (componentObj && typeof componentObj === 'object') {
                    componentObj.__prefab = { "__id__": compPrefabInfoIndex };
                }
            }
            console.log(`✅ 节点 ${node._name} 添加了 ${componentIndices.length} 个组件`);
        }
        // 为当前节点创建PrefabInfo
        const prefabInfoIndex = context.currentId++;
        node._prefab = { "__id__": prefabInfoIndex };
        const prefabInfo = {
            "__type__": "cc.PrefabInfo",
            "root": { "__id__": 1 },
            "asset": { "__id__": context.prefabAssetIndex },
            "fileId": fileId,
            "targetOverrides": null,
            "nestedPrefabInstanceRoots": null
        };
        // 根节点的特殊处理
        if (nodeIndex === 1) {
            // 根节点没有instance，但可能有targetOverrides
            prefabInfo.instance = null;
        }
        else {
            // 子节点通常有instance为null
            prefabInfo.instance = null;
        }
        prefabData[prefabInfoIndex] = prefabInfo;
        context.currentId = prefabInfoIndex + 1;
    }
    /**
     * 将UUID转换为Cocos Creator的压缩格式
     * 基于真实Cocos Creator编辑器的压缩算法实现
     * 前5个hex字符保持不变，剩余27个字符压缩成18个字符
     */
    uuidToCompressedId(uuid) {
        const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        // 移除连字符并转为小写
        const cleanUuid = uuid.replace(/-/g, '').toLowerCase();
        // 确保UUID有效
        if (cleanUuid.length !== 32) {
            return uuid; // 如果不是有效的UUID，返回原始值
        }
        // Cocos Creator的压缩算法：前5个字符保持不变，剩余27个字符压缩成18个字符
        let result = cleanUuid.substring(0, 5);
        // 剩余27个字符需要压缩成18个字符
        const remainder = cleanUuid.substring(5);
        // 每3个hex字符压缩成2个字符
        for (let i = 0; i < remainder.length; i += 3) {
            const hex1 = remainder[i] || '0';
            const hex2 = remainder[i + 1] || '0';
            const hex3 = remainder[i + 2] || '0';
            // 将3个hex字符(12位)转换为2个base64字符
            const value = parseInt(hex1 + hex2 + hex3, 16);
            // 12位分成两个6位
            const high6 = (value >> 6) & 63;
            const low6 = value & 63;
            result += BASE64_KEYS[high6] + BASE64_KEYS[low6];
        }
        return result;
    }
    /**
     * 创建组件对象
     */
    createComponentObject(componentData, nodeIndex, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
        let componentType = componentData.type || componentData.__type__ || 'cc.Component';
        const enabled = componentData.enabled !== undefined ? componentData.enabled : true;
        // console.log(`创建组件对象 - 原始类型: ${componentType}`);
        // console.log('组件完整数据:', JSON.stringify(componentData, null, 2));
        // 处理脚本组件 - MCP接口已经返回正确的压缩UUID格式
        if (componentType && !componentType.startsWith('cc.')) {
            console.log(`使用脚本组件压缩UUID类型: ${componentType}`);
        }
        // 基础组件结构
        const component = {
            "__type__": componentType,
            "_name": "",
            "_objFlags": 0,
            "__editorExtras__": {},
            "node": { "__id__": nodeIndex },
            "_enabled": enabled
        };
        // 提前设置 __prefab 属性占位符，后续会被正确设置
        component.__prefab = null;
        // 根据组件类型添加特定属性
        if (componentType === 'cc.UITransform') {
            const contentSize = ((_b = (_a = componentData.properties) === null || _a === void 0 ? void 0 : _a.contentSize) === null || _b === void 0 ? void 0 : _b.value) || { width: 100, height: 100 };
            const anchorPoint = ((_d = (_c = componentData.properties) === null || _c === void 0 ? void 0 : _c.anchorPoint) === null || _d === void 0 ? void 0 : _d.value) || { x: 0.5, y: 0.5 };
            component._contentSize = {
                "__type__": "cc.Size",
                "width": contentSize.width,
                "height": contentSize.height
            };
            component._anchorPoint = {
                "__type__": "cc.Vec2",
                "x": anchorPoint.x,
                "y": anchorPoint.y
            };
        }
        else if (componentType === 'cc.Sprite') {
            // 处理Sprite组件的spriteFrame引用
            const spriteFrameProp = ((_e = componentData.properties) === null || _e === void 0 ? void 0 : _e._spriteFrame) || ((_f = componentData.properties) === null || _f === void 0 ? void 0 : _f.spriteFrame);
            if (spriteFrameProp) {
                component._spriteFrame = this.processComponentProperty(spriteFrameProp, context);
            }
            else {
                component._spriteFrame = null;
            }
            component._type = (_j = (_h = (_g = componentData.properties) === null || _g === void 0 ? void 0 : _g._type) === null || _h === void 0 ? void 0 : _h.value) !== null && _j !== void 0 ? _j : 0;
            component._fillType = (_m = (_l = (_k = componentData.properties) === null || _k === void 0 ? void 0 : _k._fillType) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : 0;
            component._sizeMode = (_q = (_p = (_o = componentData.properties) === null || _o === void 0 ? void 0 : _o._sizeMode) === null || _p === void 0 ? void 0 : _p.value) !== null && _q !== void 0 ? _q : 1;
            component._fillCenter = { "__type__": "cc.Vec2", "x": 0, "y": 0 };
            component._fillStart = (_t = (_s = (_r = componentData.properties) === null || _r === void 0 ? void 0 : _r._fillStart) === null || _s === void 0 ? void 0 : _s.value) !== null && _t !== void 0 ? _t : 0;
            component._fillRange = (_w = (_v = (_u = componentData.properties) === null || _u === void 0 ? void 0 : _u._fillRange) === null || _v === void 0 ? void 0 : _v.value) !== null && _w !== void 0 ? _w : 0;
            component._isTrimmedMode = (_z = (_y = (_x = componentData.properties) === null || _x === void 0 ? void 0 : _x._isTrimmedMode) === null || _y === void 0 ? void 0 : _y.value) !== null && _z !== void 0 ? _z : true;
            component._useGrayscale = (_2 = (_1 = (_0 = componentData.properties) === null || _0 === void 0 ? void 0 : _0._useGrayscale) === null || _1 === void 0 ? void 0 : _1.value) !== null && _2 !== void 0 ? _2 : false;
            // 调试：打印Sprite组件的所有属性（已注释）
            // console.log('Sprite组件属性:', JSON.stringify(componentData.properties, null, 2));
            component._atlas = null;
            component._id = "";
        }
        else if (componentType === 'cc.Button') {
            component._interactable = true;
            component._transition = 3;
            component._normalColor = { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 };
            component._hoverColor = { "__type__": "cc.Color", "r": 211, "g": 211, "b": 211, "a": 255 };
            component._pressedColor = { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 };
            component._disabledColor = { "__type__": "cc.Color", "r": 124, "g": 124, "b": 124, "a": 255 };
            component._normalSprite = null;
            component._hoverSprite = null;
            component._pressedSprite = null;
            component._disabledSprite = null;
            component._duration = 0.1;
            component._zoomScale = 1.2;
            // 处理Button的target引用
            const targetProp = ((_3 = componentData.properties) === null || _3 === void 0 ? void 0 : _3._target) || ((_4 = componentData.properties) === null || _4 === void 0 ? void 0 : _4.target);
            if (targetProp) {
                component._target = this.processComponentProperty(targetProp, context);
            }
            else {
                component._target = { "__id__": nodeIndex }; // 默认指向自身节点
            }
            component._clickEvents = [];
            component._id = "";
        }
        else if (componentType === 'cc.Label') {
            component._string = ((_6 = (_5 = componentData.properties) === null || _5 === void 0 ? void 0 : _5._string) === null || _6 === void 0 ? void 0 : _6.value) || "Label";
            component._horizontalAlign = 1;
            component._verticalAlign = 1;
            component._actualFontSize = 20;
            component._fontSize = 20;
            component._fontFamily = "Arial";
            component._lineHeight = 25;
            component._overflow = 0;
            component._enableWrapText = true;
            component._font = null;
            component._isSystemFontUsed = true;
            component._spacingX = 0;
            component._isItalic = false;
            component._isBold = false;
            component._isUnderline = false;
            component._underlineHeight = 2;
            component._cacheMode = 0;
            component._id = "";
        }
        else if (componentData.properties) {
            // 处理所有组件的属性（包括内置组件和自定义脚本组件）
            for (const [key, value] of Object.entries(componentData.properties)) {
                if (key === 'node' || key === 'enabled' || key === '__type__' ||
                    key === 'uuid' || key === 'name' || key === '__scriptAsset' ||
                    key === '_objFlags' || key === '__prefab') {
                    continue; // 跳过这些特殊属性
                }
                // 对于以下划线开头的属性，需要特殊处理
                if (key.startsWith('_')) {
                    // 确保属性名保持原样（包括下划线）
                    const propValue = this.processComponentProperty(value, context);
                    if (propValue !== undefined) {
                        component[key] = propValue;
                    }
                }
                else {
                    // 非下划线开头的属性正常处理
                    const propValue = this.processComponentProperty(value, context);
                    if (propValue !== undefined) {
                        component[key] = propValue;
                    }
                }
            }
        }
        // 确保 _id 在最后位置
        const _id = component._id || "";
        delete component._id;
        component._id = _id;
        return component;
    }
    /**
     * 处理组件属性值，确保格式与手动创建的预制体一致
     */
    processComponentProperty(propData, context) {
        var _a, _b;
        if (!propData || typeof propData !== 'object') {
            return propData;
        }
        const value = propData.value;
        const type = propData.type;
        // 处理null值
        if (value === null || value === undefined) {
            return null;
        }
        // 处理空UUID对象，转换为null
        if (value && typeof value === 'object' && value.uuid === '') {
            return null;
        }
        // 处理节点引用
        if (type === 'cc.Node' && (value === null || value === void 0 ? void 0 : value.uuid)) {
            // 在预制体中，节点引用需要转换为 __id__ 形式
            if ((context === null || context === void 0 ? void 0 : context.nodeUuidToIndex) && context.nodeUuidToIndex.has(value.uuid)) {
                // 内部引用：转换为__id__格式
                return {
                    "__id__": context.nodeUuidToIndex.get(value.uuid)
                };
            }
            // 外部引用：设置为null，因为外部节点不属于预制体结构
            console.warn(`Node reference UUID ${value.uuid} not found in prefab context, setting to null (external reference)`);
            return null;
        }
        // 处理资源引用（预制体、纹理、精灵帧等）
        if ((value === null || value === void 0 ? void 0 : value.uuid) && (type === 'cc.Prefab' ||
            type === 'cc.Texture2D' ||
            type === 'cc.SpriteFrame' ||
            type === 'cc.Material' ||
            type === 'cc.AnimationClip' ||
            type === 'cc.AudioClip' ||
            type === 'cc.Font' ||
            type === 'cc.Asset')) {
            // 对于预制体引用，保持原始UUID格式
            const uuidToUse = type === 'cc.Prefab' ? value.uuid : this.uuidToCompressedId(value.uuid);
            return {
                "__uuid__": uuidToUse,
                "__expectedType__": type
            };
        }
        // 处理组件引用（包括具体的组件类型如cc.Label, cc.Button等）
        if ((value === null || value === void 0 ? void 0 : value.uuid) && (type === 'cc.Component' ||
            type === 'cc.Label' || type === 'cc.Button' || type === 'cc.Sprite' ||
            type === 'cc.UITransform' || type === 'cc.RigidBody2D' ||
            type === 'cc.BoxCollider2D' || type === 'cc.Animation' ||
            type === 'cc.AudioSource' || ((type === null || type === void 0 ? void 0 : type.startsWith('cc.')) && !type.includes('@')))) {
            // 在预制体中，组件引用也需要转换为 __id__ 形式
            if ((context === null || context === void 0 ? void 0 : context.componentUuidToIndex) && context.componentUuidToIndex.has(value.uuid)) {
                // 内部引用：转换为__id__格式
                console.log(`Component reference ${type} UUID ${value.uuid} found in prefab context, converting to __id__`);
                return {
                    "__id__": context.componentUuidToIndex.get(value.uuid)
                };
            }
            // 外部引用：设置为null，因为外部组件不属于预制体结构
            console.warn(`Component reference ${type} UUID ${value.uuid} not found in prefab context, setting to null (external reference)`);
            return null;
        }
        // 处理复杂类型，添加__type__标记
        if (value && typeof value === 'object') {
            if (type === 'cc.Color') {
                return {
                    "__type__": "cc.Color",
                    "r": Math.min(255, Math.max(0, Number(value.r) || 0)),
                    "g": Math.min(255, Math.max(0, Number(value.g) || 0)),
                    "b": Math.min(255, Math.max(0, Number(value.b) || 0)),
                    "a": value.a !== undefined ? Math.min(255, Math.max(0, Number(value.a))) : 255
                };
            }
            else if (type === 'cc.Vec3') {
                return {
                    "__type__": "cc.Vec3",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0,
                    "z": Number(value.z) || 0
                };
            }
            else if (type === 'cc.Vec2') {
                return {
                    "__type__": "cc.Vec2",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0
                };
            }
            else if (type === 'cc.Size') {
                return {
                    "__type__": "cc.Size",
                    "width": Number(value.width) || 0,
                    "height": Number(value.height) || 0
                };
            }
            else if (type === 'cc.Quat') {
                return {
                    "__type__": "cc.Quat",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0,
                    "z": Number(value.z) || 0,
                    "w": value.w !== undefined ? Number(value.w) : 1
                };
            }
        }
        // 处理数组类型
        if (Array.isArray(value)) {
            // 节点数组
            if (((_a = propData.elementTypeData) === null || _a === void 0 ? void 0 : _a.type) === 'cc.Node') {
                return value.map(item => {
                    var _a;
                    if ((item === null || item === void 0 ? void 0 : item.uuid) && ((_a = context === null || context === void 0 ? void 0 : context.nodeUuidToIndex) === null || _a === void 0 ? void 0 : _a.has(item.uuid))) {
                        return { "__id__": context.nodeUuidToIndex.get(item.uuid) };
                    }
                    return null;
                }).filter(item => item !== null);
            }
            // 资源数组
            if (((_b = propData.elementTypeData) === null || _b === void 0 ? void 0 : _b.type) && propData.elementTypeData.type.startsWith('cc.')) {
                return value.map(item => {
                    if (item === null || item === void 0 ? void 0 : item.uuid) {
                        return {
                            "__uuid__": this.uuidToCompressedId(item.uuid),
                            "__expectedType__": propData.elementTypeData.type
                        };
                    }
                    return null;
                }).filter(item => item !== null);
            }
            // 基础类型数组
            return value.map(item => (item === null || item === void 0 ? void 0 : item.value) !== undefined ? item.value : item);
        }
        // 其他复杂对象类型，保持原样但确保有__type__标记
        if (value && typeof value === 'object' && type && type.startsWith('cc.')) {
            return Object.assign({ "__type__": type }, value);
        }
        return value;
    }
    /**
     * 创建符合引擎标准的节点对象
     */
    createEngineStandardNode(nodeData, parentNodeIndex, nodeName) {
        // 调试：打印原始节点数据（已注释）
        // console.log('原始节点数据:', JSON.stringify(nodeData, null, 2));
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // 提取节点的基本属性
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = nodeName || getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 1073741824;
        // 调试输出
        console.log(`创建节点: ${name}, parentNodeIndex: ${parentNodeIndex}`);
        const parentRef = parentNodeIndex !== null ? { "__id__": parentNodeIndex } : null;
        console.log(`节点 ${name} 的父节点引用:`, parentRef);
        return {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_parent": parentRef,
            "_children": [], // 子节点引用将在递归过程中动态添加
            "_active": active,
            "_components": [], // 组件引用将在处理组件时动态添加
            "_prefab": { "__id__": 0 }, // 临时值，后续会被正确设置
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_mobility": 0,
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
    }
    /**
     * 从节点数据中提取UUID
     */
    extractNodeUuid(nodeData) {
        var _a, _b, _c;
        if (!nodeData)
            return null;
        // 尝试多种方式获取UUID
        const sources = [
            nodeData.uuid,
            (_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.uuid,
            nodeData.__uuid__,
            (_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.__uuid__,
            nodeData.id,
            (_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.id
        ];
        for (const source of sources) {
            if (typeof source === 'string' && source.length > 0) {
                return source;
            }
        }
        return null;
    }
    /**
     * 创建最小化的节点对象，不包含任何组件以避免依赖问题
     */
    createMinimalNode(nodeData, nodeName) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // 提取节点的基本属性
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = nodeName || getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 33554432;
        return {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "_parent": null,
            "_children": [],
            "_active": active,
            "_components": [], // 空的组件数组，避免组件依赖问题
            "_prefab": {
                "__id__": 2
            },
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
    }
    /**
     * 创建标准的 meta 文件内容
     */
    createStandardMetaContent(prefabName, prefabUuid) {
        return {
            "ver": "2.0.3",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName,
                "hasIcon": false
            }
        };
    }
    /**
     * 尝试将原始节点转换为预制体实例
     */
    async convertNodeToPrefabInstance(nodeUuid, prefabUuid, prefabPath) {
        return new Promise((resolve) => {
            // 这个功能需要深入的场景编辑器集成，暂时返回失败
            // 在实际的引擎中，这涉及到复杂的预制体实例化和节点替换逻辑
            console.log('节点转换为预制体实例的功能需要更深入的引擎集成');
            resolve({
                success: false,
                error: '节点转换为预制体实例需要更深入的引擎集成支持'
            });
        });
    }
    async restorePrefabNode(nodeUuid, assetUuid) {
        return new Promise((resolve) => {
            // 使用官方API restore-prefab 还原预制体节点
            Editor.Message.request('scene', 'restore-prefab', nodeUuid, assetUuid).then(() => {
                resolve({
                    success: true,
                    data: {
                        nodeUuid: nodeUuid,
                        assetUuid: assetUuid,
                        message: '预制体节点还原成功'
                    }
                });
            }).catch((error) => {
                resolve({
                    success: false,
                    error: `预制体节点还原失败: ${error.message}`
                });
            });
        });
    }
    // 基于官方预制体格式的新实现方法
    async getNodeDataForPrefab(nodeUuid) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-node', nodeUuid).then((nodeData) => {
                if (!nodeData) {
                    resolve({ success: false, error: '节点不存在' });
                    return;
                }
                resolve({ success: true, data: nodeData });
            }).catch((error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    async createStandardPrefabData(nodeData, prefabName, prefabUuid) {
        // 基于官方Canvas.prefab格式创建预制体数据结构
        const prefabData = [];
        let currentId = 0;
        // 第一个元素：cc.Prefab 资源对象
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        prefabData.push(prefabAsset);
        currentId++;
        // 第二个元素：根节点
        const rootNode = await this.createNodeObject(nodeData, null, prefabData, currentId);
        prefabData.push(rootNode.node);
        currentId = rootNode.nextId;
        // 添加根节点的 PrefabInfo - 修复asset引用使用UUID
        const rootPrefabInfo = {
            "__type__": "cc.PrefabInfo",
            "root": {
                "__id__": 1
            },
            "asset": {
                "__uuid__": prefabUuid
            },
            "fileId": this.generateFileId(),
            "instance": null,
            "targetOverrides": [],
            "nestedPrefabInstanceRoots": []
        };
        prefabData.push(rootPrefabInfo);
        return prefabData;
    }
    async createNodeObject(nodeData, parentId, prefabData, currentId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const nodeId = currentId++;
        // 提取节点的基本属性 - 适配query-node-tree的数据格式
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 33554432;
        const node = {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_parent": parentId !== null ? { "__id__": parentId } : null,
            "_children": [],
            "_active": active,
            "_components": [],
            "_prefab": parentId === null ? {
                "__id__": currentId++
            } : null,
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_mobility": 0,
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
        // 暂时跳过UITransform组件以避免_getDependComponent错误
        // 后续通过Engine API动态添加
        console.log(`节点 ${name} 暂时跳过UITransform组件，避免引擎依赖错误`);
        // 处理其他组件（暂时跳过，专注于修复UITransform问题）
        const components = this.extractComponentsFromNode(nodeData);
        if (components.length > 0) {
            console.log(`节点 ${name} 包含 ${components.length} 个其他组件，暂时跳过以专注于UITransform修复`);
        }
        // 处理子节点 - 使用query-node-tree获取的完整结构
        const childrenToProcess = this.getChildrenToProcess(nodeData);
        if (childrenToProcess.length > 0) {
            console.log(`=== 处理子节点 ===`);
            console.log(`节点 ${name} 包含 ${childrenToProcess.length} 个子节点`);
            for (let i = 0; i < childrenToProcess.length; i++) {
                const childData = childrenToProcess[i];
                const childName = childData.name || ((_j = childData.value) === null || _j === void 0 ? void 0 : _j.name) || '未知';
                console.log(`处理第${i + 1}个子节点: ${childName}`);
                try {
                    const childId = currentId;
                    node._children.push({ "__id__": childId });
                    // 递归创建子节点
                    const childResult = await this.createNodeObject(childData, nodeId, prefabData, currentId);
                    prefabData.push(childResult.node);
                    currentId = childResult.nextId;
                    // 子节点不需要PrefabInfo，只有根节点需要
                    // 子节点的_prefab应该设置为null
                    childResult.node._prefab = null;
                    console.log(`✅ 成功添加子节点: ${childName}`);
                }
                catch (error) {
                    console.error(`处理子节点 ${childName} 时出错:`, error);
                }
            }
        }
        return { node, nextId: currentId };
    }
    // 从节点数据中提取组件信息
    extractComponentsFromNode(nodeData) {
        var _a, _b;
        const components = [];
        // 从不同位置尝试获取组件数据
        const componentSources = [
            nodeData.__comps__,
            nodeData.components,
            (_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.__comps__,
            (_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.components
        ];
        for (const source of componentSources) {
            if (Array.isArray(source)) {
                components.push(...source.filter(comp => comp && (comp.__type__ || comp.type)));
                break; // 找到有效的组件数组就退出
            }
        }
        return components;
    }
    // 创建标准的组件对象
    createStandardComponentObject(componentData, nodeId, prefabInfoId) {
        const componentType = componentData.__type__ || componentData.type;
        if (!componentType) {
            console.warn('组件缺少类型信息:', componentData);
            return null;
        }
        // 基础组件结构 - 基于官方预制体格式
        const component = {
            "__type__": componentType,
            "_name": "",
            "_objFlags": 0,
            "node": {
                "__id__": nodeId
            },
            "_enabled": this.getComponentPropertyValue(componentData, 'enabled', true),
            "__prefab": {
                "__id__": prefabInfoId
            }
        };
        // 根据组件类型添加特定属性
        this.addComponentSpecificProperties(component, componentData, componentType);
        // 添加_id属性
        component._id = "";
        return component;
    }
    // 添加组件特定的属性
    addComponentSpecificProperties(component, componentData, componentType) {
        switch (componentType) {
            case 'cc.UITransform':
                this.addUITransformProperties(component, componentData);
                break;
            case 'cc.Sprite':
                this.addSpriteProperties(component, componentData);
                break;
            case 'cc.Label':
                this.addLabelProperties(component, componentData);
                break;
            case 'cc.Button':
                this.addButtonProperties(component, componentData);
                break;
            default:
                // 对于未知类型的组件，复制所有安全的属性
                this.addGenericProperties(component, componentData);
                break;
        }
    }
    // UITransform组件属性
    addUITransformProperties(component, componentData) {
        component._contentSize = this.createSizeObject(this.getComponentPropertyValue(componentData, 'contentSize', { width: 100, height: 100 }));
        component._anchorPoint = this.createVec2Object(this.getComponentPropertyValue(componentData, 'anchorPoint', { x: 0.5, y: 0.5 }));
    }
    // Sprite组件属性
    addSpriteProperties(component, componentData) {
        component._visFlags = 0;
        component._customMaterial = null;
        component._srcBlendFactor = 2;
        component._dstBlendFactor = 4;
        component._color = this.createColorObject(this.getComponentPropertyValue(componentData, 'color', { r: 255, g: 255, b: 255, a: 255 }));
        component._spriteFrame = this.getComponentPropertyValue(componentData, 'spriteFrame', null);
        component._type = this.getComponentPropertyValue(componentData, 'type', 0);
        component._fillType = 0;
        component._sizeMode = this.getComponentPropertyValue(componentData, 'sizeMode', 1);
        component._fillCenter = this.createVec2Object({ x: 0, y: 0 });
        component._fillStart = 0;
        component._fillRange = 0;
        component._isTrimmedMode = true;
        component._useGrayscale = false;
        component._atlas = null;
    }
    // Label组件属性
    addLabelProperties(component, componentData) {
        component._visFlags = 0;
        component._customMaterial = null;
        component._srcBlendFactor = 2;
        component._dstBlendFactor = 4;
        component._color = this.createColorObject(this.getComponentPropertyValue(componentData, 'color', { r: 0, g: 0, b: 0, a: 255 }));
        component._string = this.getComponentPropertyValue(componentData, 'string', 'Label');
        component._horizontalAlign = 1;
        component._verticalAlign = 1;
        component._actualFontSize = 20;
        component._fontSize = this.getComponentPropertyValue(componentData, 'fontSize', 20);
        component._fontFamily = 'Arial';
        component._lineHeight = 40;
        component._overflow = 1;
        component._enableWrapText = false;
        component._font = null;
        component._isSystemFontUsed = true;
        component._isItalic = false;
        component._isBold = false;
        component._isUnderline = false;
        component._underlineHeight = 2;
        component._cacheMode = 0;
    }
    // Button组件属性
    addButtonProperties(component, componentData) {
        component.clickEvents = [];
        component._interactable = true;
        component._transition = 2;
        component._normalColor = this.createColorObject({ r: 214, g: 214, b: 214, a: 255 });
        component._hoverColor = this.createColorObject({ r: 211, g: 211, b: 211, a: 255 });
        component._pressedColor = this.createColorObject({ r: 255, g: 255, b: 255, a: 255 });
        component._disabledColor = this.createColorObject({ r: 124, g: 124, b: 124, a: 255 });
        component._duration = 0.1;
        component._zoomScale = 1.2;
    }
    // 添加通用属性
    addGenericProperties(component, componentData) {
        // 只复制安全的、已知的属性
        const safeProperties = ['enabled', 'color', 'string', 'fontSize', 'spriteFrame', 'type', 'sizeMode'];
        for (const prop of safeProperties) {
            if (componentData.hasOwnProperty(prop)) {
                const value = this.getComponentPropertyValue(componentData, prop);
                if (value !== undefined) {
                    component[`_${prop}`] = value;
                }
            }
        }
    }
    // 创建Vec2对象
    createVec2Object(data) {
        return {
            "__type__": "cc.Vec2",
            "x": (data === null || data === void 0 ? void 0 : data.x) || 0,
            "y": (data === null || data === void 0 ? void 0 : data.y) || 0
        };
    }
    // 创建Vec3对象
    createVec3Object(data) {
        return {
            "__type__": "cc.Vec3",
            "x": (data === null || data === void 0 ? void 0 : data.x) || 0,
            "y": (data === null || data === void 0 ? void 0 : data.y) || 0,
            "z": (data === null || data === void 0 ? void 0 : data.z) || 0
        };
    }
    // 创建Size对象
    createSizeObject(data) {
        return {
            "__type__": "cc.Size",
            "width": (data === null || data === void 0 ? void 0 : data.width) || 100,
            "height": (data === null || data === void 0 ? void 0 : data.height) || 100
        };
    }
    // 创建Color对象
    createColorObject(data) {
        var _a, _b, _c, _d;
        return {
            "__type__": "cc.Color",
            "r": (_a = data === null || data === void 0 ? void 0 : data.r) !== null && _a !== void 0 ? _a : 255,
            "g": (_b = data === null || data === void 0 ? void 0 : data.g) !== null && _b !== void 0 ? _b : 255,
            "b": (_c = data === null || data === void 0 ? void 0 : data.b) !== null && _c !== void 0 ? _c : 255,
            "a": (_d = data === null || data === void 0 ? void 0 : data.a) !== null && _d !== void 0 ? _d : 255
        };
    }
    // 判断是否应该复制组件属性
    shouldCopyComponentProperty(key, value) {
        // 跳过内部属性和已处理的属性
        if (key.startsWith('__') || key === '_enabled' || key === 'node' || key === 'enabled') {
            return false;
        }
        // 跳过函数和undefined值
        if (typeof value === 'function' || value === undefined) {
            return false;
        }
        return true;
    }
    // 获取组件属性值 - 重命名以避免冲突
    getComponentPropertyValue(componentData, propertyName, defaultValue) {
        // 尝试直接获取属性
        if (componentData[propertyName] !== undefined) {
            return this.extractValue(componentData[propertyName]);
        }
        // 尝试从value属性中获取
        if (componentData.value && componentData.value[propertyName] !== undefined) {
            return this.extractValue(componentData.value[propertyName]);
        }
        // 尝试带下划线前缀的属性名
        const prefixedName = `_${propertyName}`;
        if (componentData[prefixedName] !== undefined) {
            return this.extractValue(componentData[prefixedName]);
        }
        return defaultValue;
    }
    // 提取属性值
    extractValue(data) {
        if (data === null || data === undefined) {
            return data;
        }
        // 如果有value属性，优先使用value
        if (typeof data === 'object' && data.hasOwnProperty('value')) {
            return data.value;
        }
        // 如果是引用对象，保持原样
        if (typeof data === 'object' && (data.__id__ !== undefined || data.__uuid__ !== undefined)) {
            return data;
        }
        return data;
    }
    createStandardMetaData(prefabName, prefabUuid) {
        return {
            "ver": "1.1.50",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName
            }
        };
    }
    async savePrefabWithMeta(prefabPath, prefabData, metaData) {
        try {
            const prefabContent = JSON.stringify(prefabData, null, 2);
            const metaContent = JSON.stringify(metaData, null, 2);
            // 确保路径以.prefab结尾
            const finalPrefabPath = prefabPath.endsWith('.prefab') ? prefabPath : `${prefabPath}.prefab`;
            const metaPath = `${finalPrefabPath}.meta`;
            // 使用asset-db API创建预制体文件
            await new Promise((resolve, reject) => {
                Editor.Message.request('asset-db', 'create-asset', finalPrefabPath, prefabContent).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            });
            // 创建meta文件
            await new Promise((resolve, reject) => {
                Editor.Message.request('asset-db', 'create-asset', metaPath, metaContent).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            });
            console.log(`=== 预制体保存完成 ===`);
            console.log(`预制体文件已保存: ${finalPrefabPath}`);
            console.log(`Meta文件已保存: ${metaPath}`);
            console.log(`预制体数组总长度: ${prefabData.length}`);
            console.log(`预制体根节点索引: ${prefabData.length - 1}`);
            return { success: true };
        }
        catch (error) {
            console.error('保存预制体文件时出错:', error);
            return { success: false, error: error.message };
        }
    }
}
exports.PrefabTools = PrefabTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLXRvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rvb2xzL3ByZWZhYi10b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBSTdCLE1BQWEsV0FBVztJQUNwQixRQUFRO1FBQ0osT0FBTztZQUNIO2dCQUNJLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLFdBQVcsRUFBRSxnQ0FBZ0M7Z0JBQzdDLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsTUFBTSxFQUFFOzRCQUNKLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxrQ0FBa0M7NEJBQy9DLE9BQU8sRUFBRSxhQUFhO3lCQUN6QjtxQkFDSjtpQkFDSjthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLFdBQVcsRUFBRSx1QkFBdUI7Z0JBQ3BDLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsVUFBVSxFQUFFOzRCQUNSLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxtQkFBbUI7eUJBQ25DO3FCQUNKO29CQUNELFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQztpQkFDM0I7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxvQkFBb0I7Z0JBQzFCLFdBQVcsRUFBRSxtQ0FBbUM7Z0JBQ2hELFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsVUFBVSxFQUFFOzRCQUNSLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxtQkFBbUI7eUJBQ25DO3dCQUNELFVBQVUsRUFBRTs0QkFDUixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsNkJBQTZCO3lCQUM3Qzt3QkFDRCxRQUFRLEVBQUU7NEJBQ04sSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLGtCQUFrQjs0QkFDL0IsVUFBVSxFQUFFO2dDQUNSLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7Z0NBQ3JCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7Z0NBQ3JCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7NkJBQ3hCO3lCQUNKO3FCQUNKO29CQUNELFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQztpQkFDM0I7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxlQUFlO2dCQUNyQixXQUFXLEVBQUUsOERBQThEO2dCQUMzRSxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFFBQVEsRUFBRTs0QkFDTixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsa0JBQWtCO3lCQUNsQzt3QkFDRCxRQUFRLEVBQUU7NEJBQ04sSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLHFFQUFxRTt5QkFDckY7d0JBQ0QsVUFBVSxFQUFFOzRCQUNSLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxhQUFhO3lCQUM3QjtxQkFDSjtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQztpQkFDbkQ7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxlQUFlO2dCQUNyQixXQUFXLEVBQUUsMkJBQTJCO2dCQUN4QyxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRTs0QkFDUixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsbUJBQW1CO3lCQUNuQzt3QkFDRCxRQUFRLEVBQUU7NEJBQ04sSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLHdCQUF3Qjt5QkFDeEM7cUJBQ0o7b0JBQ0QsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQztpQkFDdkM7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxlQUFlO2dCQUNyQixXQUFXLEVBQUUsb0NBQW9DO2dCQUNqRCxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFFBQVEsRUFBRTs0QkFDTixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsMkJBQTJCO3lCQUMzQztxQkFDSjtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUM7aUJBQ3pCO2FBQ0o7WUFDRDtnQkFDSSxJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixXQUFXLEVBQUUsaUNBQWlDO2dCQUM5QyxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRTs0QkFDUixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsbUJBQW1CO3lCQUNuQztxQkFDSjtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7aUJBQzNCO2FBQ0o7WUFDRDtnQkFDSSxJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixXQUFXLEVBQUUsK0JBQStCO2dCQUM1QyxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRTs0QkFDUixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsbUJBQW1CO3lCQUNuQztxQkFDSjtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7aUJBQzNCO2FBQ0o7WUFDRDtnQkFDSSxJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixXQUFXLEVBQUUsOEJBQThCO2dCQUMzQyxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFOzRCQUNkLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxvQkFBb0I7eUJBQ3BDO3dCQUNELGdCQUFnQixFQUFFOzRCQUNkLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxvQkFBb0I7eUJBQ3BDO3dCQUNELGFBQWEsRUFBRTs0QkFDWCxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsaUJBQWlCO3lCQUNqQztxQkFDSjtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQztpQkFDckQ7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxxQkFBcUI7Z0JBQzNCLFdBQVcsRUFBRSwrREFBK0Q7Z0JBQzVFLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsUUFBUSxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSwyQkFBMkI7eUJBQzNDO3dCQUNELFNBQVMsRUFBRTs0QkFDUCxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsbUJBQW1CO3lCQUNuQztxQkFDSjtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO2lCQUN0QzthQUNKO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQWdCLEVBQUUsSUFBUztRQUNyQyxRQUFRLFFBQVEsRUFBRSxDQUFDO1lBQ2YsS0FBSyxpQkFBaUI7Z0JBQ2xCLE9BQU8sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRCxLQUFLLGFBQWE7Z0JBQ2QsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xELEtBQUssb0JBQW9CO2dCQUNyQixPQUFPLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLEtBQUssZUFBZTtnQkFDaEIsT0FBTyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsS0FBSyxlQUFlO2dCQUNoQixPQUFPLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuRSxLQUFLLGVBQWU7Z0JBQ2hCLE9BQU8sTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRCxLQUFLLGlCQUFpQjtnQkFDbEIsT0FBTyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JELEtBQUssaUJBQWlCO2dCQUNsQixPQUFPLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEQsS0FBSyxrQkFBa0I7Z0JBQ25CLE9BQU8sTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLEtBQUsscUJBQXFCO2dCQUN0QixPQUFPLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZFO2dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDckQsQ0FBQztJQUNMLENBQUM7SUFFTyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQWlCLGFBQWE7UUFDdEQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLGNBQWMsQ0FBQztZQUVyRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFO2dCQUMvQyxPQUFPLEVBQUUsT0FBTzthQUNuQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBYyxFQUFFLEVBQUU7Z0JBQ3ZCLE1BQU0sT0FBTyxHQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDaEQsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO29CQUNoQixJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUc7b0JBQ2YsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO29CQUNoQixNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUM3RCxDQUFDLENBQUMsQ0FBQztnQkFDSixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQVUsRUFBRSxFQUFFO2dCQUNwQixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBa0I7UUFDdkMsSUFBSSxDQUFDO1lBQ0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNiLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3pELENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFL0QsT0FBTztnQkFDSCxPQUFPLEVBQUUsSUFBSTtnQkFDYixJQUFJLEVBQUU7b0JBQ0YsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO29CQUNwQixJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7b0JBQ3BCLElBQUksRUFBRSxVQUFVO29CQUNoQixTQUFTLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztvQkFDckMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLGNBQWM7b0JBQy9DLE9BQU8sRUFBRSw0QkFBNEI7aUJBQ3hDO2FBQ0osQ0FBQztRQUNOLENBQUM7UUFBQyxPQUFPLEdBQVksRUFBRSxDQUFDO1lBQ3BCLE1BQU0sT0FBTyxHQUFHLEdBQUcsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDOUMsQ0FBQztJQUNMLENBQUM7SUFFTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBUztRQUNyQyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNqQyxJQUFJLENBQUM7Z0JBQ0QsWUFBWTtnQkFDWixNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDYixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2dCQUVELGtDQUFrQztnQkFDbEMsTUFBTSxpQkFBaUIsR0FBUTtvQkFDM0IsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJO2lCQUM1QixDQUFDO2dCQUVGLFFBQVE7Z0JBQ1IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ2xCLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUMvQyxDQUFDO2dCQUVELFNBQVM7Z0JBQ1QsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ1osaUJBQWlCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZDLENBQUM7cUJBQU0sSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3hCLGlCQUFpQixDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO2dCQUM1QyxDQUFDO2dCQUVELGNBQWM7Z0JBQ2QsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2hCLGlCQUFpQixDQUFDLElBQUksR0FBRzt3QkFDckIsUUFBUSxFQUFFOzRCQUNOLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUTt5QkFDdkI7cUJBQ0osQ0FBQztnQkFDTixDQUFDO2dCQUVELE9BQU87Z0JBQ1AsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3pGLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO2dCQUU5RCx5Q0FBeUM7Z0JBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFO29CQUN0QixRQUFRLEVBQUUsSUFBSTtvQkFDZCxVQUFVLEVBQUUsU0FBUyxDQUFDLElBQUk7b0JBQzFCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtpQkFDOUIsQ0FBQyxDQUFDO2dCQUVILE9BQU8sQ0FBQztvQkFDSixPQUFPLEVBQUUsSUFBSTtvQkFDYixJQUFJLEVBQUU7d0JBQ0YsUUFBUSxFQUFFLElBQUk7d0JBQ2QsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO3dCQUMzQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7d0JBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTt3QkFDdkIsT0FBTyxFQUFFLG1CQUFtQjtxQkFDL0I7aUJBQ0osQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQztvQkFDSixPQUFPLEVBQUUsS0FBSztvQkFDZCxLQUFLLEVBQUUsYUFBYSxHQUFHLENBQUMsT0FBTyxFQUFFO29CQUNqQyxXQUFXLEVBQUUsMEJBQTBCO2lCQUMxQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssS0FBSyxDQUFDLHlCQUF5QixDQUFDLFFBQWdCLEVBQUUsVUFBa0IsRUFBRSxVQUFrQjs7UUFDNUYsSUFBSSxDQUFDO1lBQ0Qsc0JBQXNCO1lBQ3RCLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUM5RCxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ25DLENBQUM7WUFFRCxrQ0FBa0M7WUFDbEMsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FDL0IsQ0FBQyxJQUFhLEVBQUUsRUFBRTtnQkFDZCxNQUFNLElBQUksR0FBRyxJQUErRSxDQUFDO2dCQUM3RixPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDO1lBQ2hFLENBQUMsQ0FDNkMsQ0FBQztZQUNuRCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDekMsQ0FBQztZQUVELG1CQUFtQjtZQUNuQixNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsTUFBQSxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sbUNBQUksQ0FBQyxDQUFDLENBRW5ELENBQUM7WUFDaEIsSUFBSSxDQUFDLGNBQWMsSUFBSSxjQUFjLENBQUMsUUFBUSxLQUFLLGVBQWUsRUFBRSxDQUFDO2dCQUNqRSxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDekMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBRUQscUJBQXFCO1lBQ3JCLE1BQU0sb0JBQW9CLEdBQUc7Z0JBQ3pCLElBQUksRUFBRSxRQUFRO2dCQUNkLE1BQU0sRUFBRSxVQUFVO2dCQUNsQixNQUFNLEVBQUUsVUFBVTthQUNyQixDQUFDO1lBRUYscUJBQXFCO1lBQ3JCLE1BQU0saUJBQWlCLEdBQUc7Z0JBQ3RCLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxvQkFBb0IsQ0FBQztnQkFDdEYsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLG9CQUFvQixDQUFDO2dCQUNwRixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUM7YUFDbkYsQ0FBQztZQUVGLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN0QixLQUFLLE1BQU0sTUFBTSxJQUFJLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQztvQkFDRCxNQUFNLE1BQU0sRUFBRSxDQUFDO29CQUNmLFNBQVMsR0FBRyxJQUFJLENBQUM7b0JBQ2pCLE1BQU07Z0JBQ1YsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzlDLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNiLDBCQUEwQjtnQkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ25GLENBQUM7UUFFTCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25DLE1BQU0sS0FBSyxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLLENBQUMsaUNBQWlDLENBQUMsUUFBZ0IsRUFBRSxVQUFrQixFQUFFLFVBQWtCO1FBQ3BHLElBQUksQ0FBQztZQUNELDZCQUE2QjtZQUM3QixNQUFNLG9CQUFvQixHQUFHO2dCQUN6QixDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNSLFNBQVMsRUFBRTt3QkFDUCxVQUFVLEVBQUUsVUFBVTt3QkFDdEIsa0JBQWtCLEVBQUUsV0FBVzt3QkFDL0IsUUFBUSxFQUFFLFVBQVU7cUJBQ3ZCO2lCQUNKO2FBQ0osQ0FBQztZQUVGLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRTtnQkFDbEQsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFO29CQUNGLEtBQUssRUFBRTt3QkFDSCxVQUFVLEVBQUUsVUFBVTt3QkFDdEIsa0JBQWtCLEVBQUUsV0FBVztxQkFDbEM7aUJBQ0o7YUFDSixDQUFDLENBQUM7UUFFUCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLHNCQUFzQjtRQUMxQixDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLHFCQUFxQixDQUFDLFVBQWtCOztRQUNsRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMzRixNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUM7UUFFcEMsSUFBSSxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsTUFBTSxFQUFFLENBQUM7WUFDcEIsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFDRCxJQUFJLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxJQUFJLEVBQUUsQ0FBQztZQUNsQixjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLFVBQVU7YUFDMUIsT0FBTyxDQUFDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQzthQUN2QyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sV0FBVyxHQUFHLE1BQUEsTUFBTSxDQUFDLE9BQU8sMENBQUUsSUFBSSxDQUFDO1FBQ3pDLElBQUksV0FBVyxFQUFFLENBQUM7WUFDZCxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELEtBQUssTUFBTSxRQUFRLElBQUksY0FBYyxFQUFFLENBQUM7WUFDcEMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLE9BQU8sUUFBUSxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFrQjtRQUMzQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RCxNQUFNLFVBQVUsR0FBWSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXBELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRU8sS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQVM7UUFDM0MsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBYyxFQUFFLEVBQUU7Z0JBQzVGLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDYixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2dCQUVELDhCQUE4QjtnQkFDOUIsTUFBTSxpQkFBaUIsR0FBUTtvQkFDM0IsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJO2lCQUM1QixDQUFDO2dCQUVGLFFBQVE7Z0JBQ1IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ2xCLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUMvQyxDQUFDO2dCQUVELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzdFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQTJCLEVBQUUsRUFBRTtnQkFDcEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBRTlELGlCQUFpQjtnQkFDakIsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRSxDQUFDO29CQUN4QixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFO3dCQUM1QyxJQUFJLEVBQUUsSUFBSTt3QkFDVixJQUFJLEVBQUUsVUFBVTt3QkFDaEIsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7cUJBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNULE9BQU8sQ0FBQzs0QkFDSixPQUFPLEVBQUUsSUFBSTs0QkFDYixJQUFJLEVBQUU7Z0NBQ0YsUUFBUSxFQUFFLElBQUk7Z0NBQ2QsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dDQUMzQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0NBQ3ZCLE9BQU8sRUFBRSxzQkFBc0I7NkJBQ2xDO3lCQUNKLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUNWLE9BQU8sQ0FBQzs0QkFDSixPQUFPLEVBQUUsSUFBSTs0QkFDYixJQUFJLEVBQUU7Z0NBQ0YsUUFBUSxFQUFFLElBQUk7Z0NBQ2QsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dDQUMzQixPQUFPLEVBQUUsdUJBQXVCOzZCQUNuQzt5QkFDSixDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE9BQU8sQ0FBQzt3QkFDSixPQUFPLEVBQUUsSUFBSTt3QkFDYixJQUFJLEVBQUU7NEJBQ0YsUUFBUSxFQUFFLElBQUk7NEJBQ2QsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVOzRCQUMzQixPQUFPLEVBQUUsZ0JBQWdCO3lCQUM1QjtxQkFDSixDQUFDLENBQUM7Z0JBQ1AsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQVUsRUFBRSxFQUFFO2dCQUNwQixPQUFPLENBQUM7b0JBQ0osT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLGtCQUFrQixHQUFHLENBQUMsT0FBTyxFQUFFO2lCQUN6QyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFTO1FBQ3BELE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ2pDLElBQUksQ0FBQztnQkFDRCxnQ0FBZ0M7Z0JBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDYixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUNoRCxPQUFPO2dCQUNYLENBQUM7Z0JBRUQsUUFBUTtnQkFDUixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzNFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3hCLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDdEIsT0FBTztnQkFDWCxDQUFDO2dCQUVELGNBQWM7Z0JBQ2QsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RixJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDdEIsT0FBTyxDQUFDO3dCQUNKLE9BQU8sRUFBRSxJQUFJO3dCQUNiLElBQUksRUFBRTs0QkFDRixRQUFRLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFROzRCQUNwQyxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJOzRCQUM1QixPQUFPLEVBQUUsa0JBQWtCO3lCQUM5QjtxQkFDSixDQUFDLENBQUM7Z0JBQ1AsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE9BQU8sQ0FBQzt3QkFDSixPQUFPLEVBQUUsS0FBSzt3QkFDZCxLQUFLLEVBQUUsYUFBYTt3QkFDcEIsSUFBSSxFQUFFOzRCQUNGLFFBQVEsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVE7NEJBQ3BDLE9BQU8sRUFBRSxrQkFBa0I7eUJBQzlCO3FCQUNKLENBQUMsQ0FBQztnQkFDUCxDQUFDO1lBRUwsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsY0FBYyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUQsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBa0I7UUFDekMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFjLEVBQUUsRUFBRTtnQkFDdkYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFtQixFQUFFLFFBQWM7UUFDeEQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLE1BQU0saUJBQWlCLEdBQVE7Z0JBQzNCLElBQUksRUFBRSxnQkFBZ0I7YUFDekIsQ0FBQztZQUVGLFFBQVE7WUFDUixJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNiLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7WUFDMUMsQ0FBQztZQUVELE9BQU87WUFDUCxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNYLGlCQUFpQixDQUFDLElBQUksR0FBRztvQkFDckIsUUFBUSxFQUFFLFFBQVE7aUJBQ3JCLENBQUM7WUFDTixDQUFDO1lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQTJCLEVBQUUsRUFBRTtnQkFDbkcsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQzlELE9BQU8sQ0FBQztvQkFDSixPQUFPLEVBQUUsSUFBSTtvQkFDYixJQUFJLEVBQUU7d0JBQ0YsUUFBUSxFQUFFLElBQUk7d0JBQ2QsSUFBSSxFQUFFLGdCQUFnQjtxQkFDekI7aUJBQ0osQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLFVBQWtCO1FBQ2hFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixpQkFBaUI7WUFDakIsTUFBTSxPQUFPLEdBQUc7Z0JBQ1osR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDO2dCQUM3RixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUM7Z0JBQzNGLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDO2FBQ3ZHLENBQUM7WUFFRixNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUNoQyxJQUFJLEtBQUssSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzFCLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7b0JBQ2hELE9BQU87Z0JBQ1gsQ0FBQztnQkFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUN2QixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDL0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtvQkFDVixTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQztZQUVGLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSyxLQUFLLENBQUMsdUJBQXVCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLFVBQWtCLEVBQUUsZUFBd0IsRUFBRSxpQkFBMEI7UUFDOUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7O1lBQ2pDLElBQUksQ0FBQztnQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7Z0JBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLFVBQVUsRUFBRSxDQUFDLENBQUM7Z0JBRXBDLHFCQUFxQjtnQkFDckIsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ1osT0FBTyxDQUFDO3dCQUNKLE9BQU8sRUFBRSxLQUFLO3dCQUNkLEtBQUssRUFBRSxVQUFVO3FCQUNwQixDQUFDLENBQUM7b0JBQ0gsT0FBTztnQkFDWCxDQUFDO2dCQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVoRiwwQkFBMEI7Z0JBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BHLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNwRixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN4QixPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3RCLE9BQU87Z0JBQ1gsQ0FBQztnQkFFRCxnQkFBZ0I7Z0JBQ2hCLE1BQU0sZ0JBQWdCLEdBQUcsTUFBQSxZQUFZLENBQUMsSUFBSSwwQ0FBRSxJQUFJLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUNwQixPQUFPLENBQUM7d0JBQ0osT0FBTyxFQUFFLEtBQUs7d0JBQ2QsS0FBSyxFQUFFLGtCQUFrQjtxQkFDNUIsQ0FBQyxDQUFDO29CQUNILE9BQU87Z0JBQ1gsQ0FBQztnQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUU1Qyx3QkFBd0I7Z0JBQ3hCLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3pJLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVuRSxnQkFBZ0I7Z0JBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUV0Riw0QkFBNEI7Z0JBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNqRixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBRTNFLGtCQUFrQjtnQkFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRXJFLHNCQUFzQjtnQkFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBRW5HLE9BQU8sQ0FBQztvQkFDSixPQUFPLEVBQUUsSUFBSTtvQkFDYixJQUFJLEVBQUU7d0JBQ0YsVUFBVSxFQUFFLGdCQUFnQjt3QkFDNUIsVUFBVSxFQUFFLFFBQVE7d0JBQ3BCLFFBQVEsRUFBRSxRQUFRO3dCQUNsQixVQUFVLEVBQUUsVUFBVTt3QkFDdEIseUJBQXlCLEVBQUUsYUFBYSxDQUFDLE9BQU87d0JBQ2hELGlCQUFpQixFQUFFLFlBQVk7d0JBQy9CLFlBQVksRUFBRSxZQUFZO3dCQUMxQixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsY0FBYyxFQUFFLGNBQWM7d0JBQzlCLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtxQkFDeEU7aUJBQ0osQ0FBQyxDQUFDO1lBRVAsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU8sQ0FBQztvQkFDSixPQUFPLEVBQUUsS0FBSztvQkFDZCxLQUFLLEVBQUUsWUFBWSxLQUFLLEVBQUU7aUJBQzdCLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQVM7UUFDaEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDakMsSUFBSSxDQUFDO2dCQUNELGlDQUFpQztnQkFDakMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNuRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2IsT0FBTyxDQUFDO3dCQUNKLE9BQU8sRUFBRSxLQUFLO3dCQUNkLEtBQUssRUFBRSxzQ0FBc0M7cUJBQ2hELENBQUMsQ0FBQztvQkFDSCxPQUFPO2dCQUNYLENBQUM7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxXQUFXLENBQUM7Z0JBQ2xELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDNUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsSUFBSSxVQUFVLFNBQVMsQ0FBQztnQkFFcEQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsS0FBSyxLQUFLLENBQUMsQ0FBQyxXQUFXO2dCQUNuRSxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxLQUFLLENBQUMsQ0FBQyxXQUFXO2dCQUV2RSwwQkFBMEI7Z0JBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQ3BELElBQUksQ0FBQyxRQUFRLEVBQ2IsUUFBUSxFQUNSLFVBQVUsRUFDVixlQUFlLEVBQ2YsaUJBQWlCLENBQ3BCLENBQUM7Z0JBRUYsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3hCLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDdkIsT0FBTztnQkFDWCxDQUFDO2dCQUVELGdEQUFnRDtnQkFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM1RSxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDdkIsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUN0QixPQUFPO2dCQUNYLENBQUM7Z0JBRUQsb0JBQW9CO2dCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ2xDLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUN4RixPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDO29CQUNKLE9BQU8sRUFBRSxLQUFLO29CQUNkLEtBQUssRUFBRSxlQUFlLEtBQUssRUFBRTtpQkFDaEMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFnQixFQUFFLFVBQWtCO1FBQ2pFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQiwyQkFBMkI7WUFDM0IsbUJBQW1CO1lBQ25CLE9BQU8sQ0FBQztnQkFDSixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsZUFBZTtnQkFDdEIsV0FBVyxFQUFFLHNGQUFzRjthQUN0RyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxVQUFrQixFQUFFLFVBQWtCO1FBQ3JGLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFOztZQUNqQyxJQUFJLENBQUM7Z0JBQ0QsZ0JBQWdCO2dCQUNoQixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDWixPQUFPLENBQUM7d0JBQ0osT0FBTyxFQUFFLEtBQUs7d0JBQ2QsS0FBSyxFQUFFLFdBQVcsUUFBUSxFQUFFO3FCQUMvQixDQUFDLENBQUM7b0JBQ0gsT0FBTztnQkFDWCxDQUFDO2dCQUVELGVBQWU7Z0JBQ2YsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUV2QyxlQUFlO2dCQUNmLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUUzRSxxQkFBcUI7Z0JBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQSxNQUFBLFFBQVEsQ0FBQyxJQUFJLDBDQUFFLEtBQUssS0FBSSxJQUFJLENBQUMsQ0FBQztnQkFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQSxNQUFBLFFBQVEsQ0FBQyxJQUFJLDBDQUFFLEtBQUssS0FBSSxJQUFJLENBQUMsQ0FBQztnQkFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRTVHLGtCQUFrQjtnQkFDbEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUU3RSxrQkFBa0I7Z0JBQ2xCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFFL0YsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3JCLHNCQUFzQjtvQkFDdEIsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsMkJBQTJCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFFL0YsT0FBTyxDQUFDO3dCQUNKLE9BQU8sRUFBRSxJQUFJO3dCQUNiLElBQUksRUFBRTs0QkFDRixVQUFVLEVBQUUsVUFBVTs0QkFDdEIsVUFBVSxFQUFFLFVBQVU7NEJBQ3RCLFFBQVEsRUFBRSxRQUFROzRCQUNsQixVQUFVLEVBQUUsVUFBVTs0QkFDdEIseUJBQXlCLEVBQUUsYUFBYSxDQUFDLE9BQU87NEJBQ2hELE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7Z0NBQzVCLDBCQUEwQixDQUFDLENBQUM7Z0NBQzVCLGlCQUFpQjt5QkFDeEI7cUJBQ0osQ0FBQyxDQUFDO2dCQUNQLENBQUM7cUJBQU0sQ0FBQztvQkFDSixPQUFPLENBQUM7d0JBQ0osT0FBTyxFQUFFLEtBQUs7d0JBQ2QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLElBQUksV0FBVztxQkFDekMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7WUFFTCxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUM7b0JBQ0osT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLGVBQWUsS0FBSyxFQUFFO2lCQUNoQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFnQjtRQUN0QyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNqQyxJQUFJLENBQUM7Z0JBQ0QsYUFBYTtnQkFDYixNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2QsT0FBTztnQkFDWCxDQUFDO2dCQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxRQUFRLFVBQVUsQ0FBQyxDQUFDO2dCQUV4QyxnQ0FBZ0M7Z0JBQ2hDLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxRQUFRLFdBQVcsQ0FBQyxDQUFDO29CQUN6QyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RCLENBQUM7cUJBQU0sQ0FBQztvQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN4QixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RCLENBQUM7WUFDTCxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksUUFBUSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsa0NBQWtDO0lBQzFCLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFnQjtRQUM5QyxJQUFJLENBQUM7WUFDRCxVQUFVO1lBQ1YsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1IsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUVELGFBQWE7WUFDYixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RCxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxRQUFRLFdBQVcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXBHLHNCQUFzQjtnQkFDdEIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pFLE9BQU8sWUFBWSxDQUFDO1lBQ3hCLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxRQUFRLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5QyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVELHFCQUFxQjtJQUNiLGNBQWMsQ0FBQyxJQUFTLEVBQUUsVUFBa0I7O1FBQ2hELElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFdkIsU0FBUztRQUNULElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksQ0FBQSxNQUFBLElBQUksQ0FBQyxLQUFLLDBDQUFFLElBQUksTUFBSyxVQUFVLEVBQUUsQ0FBQztZQUM5RCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsVUFBVTtRQUNWLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ2hELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDckQsSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDUixPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7T0FHRztJQUNLLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxJQUFTO1FBQ2hELElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELElBQUksQ0FBQztZQUNELE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEYsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDbEUsdUVBQXVFO2dCQUN2RSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFOztvQkFDcEQsTUFBTSxLQUFLLEdBQVEsRUFBRSxDQUFDO29CQUN0QixpQkFBaUI7b0JBQ2pCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7d0JBQy9DLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDOzRCQUM5QyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNqQixDQUFDO29CQUNMLENBQUM7b0JBQ0QsbUNBQW1DO29CQUNuQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUN4QyxJQUFJLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxTQUFTOzRCQUFFLFNBQVM7d0JBQ2pGLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7NEJBQUUsU0FBUyxDQUFDLFNBQVM7d0JBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RDLENBQUM7b0JBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsSUFBSSwwQ0FBRSxLQUFLLENBQUM7b0JBQ3BDLE9BQU87d0JBQ0gsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxTQUFTO3dCQUM1QyxJQUFJLEVBQUUsUUFBUSxLQUFJLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsS0FBSyxDQUFBLElBQUksSUFBSTt3QkFDMUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJO3dCQUN6RCxVQUFVLEVBQUUsS0FBSztxQkFDcEIsQ0FBQztnQkFDTixDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztnQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFFBQVEsVUFBVSxDQUFDLE1BQU0sZUFBZSxDQUFDLENBQUM7WUFDekUsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsVUFBVTtRQUNWLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBZ0I7UUFDN0MsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLFlBQVk7WUFDWixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQWEsRUFBRSxFQUFFO2dCQUMzRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNkLE9BQU87Z0JBQ1gsQ0FBQztnQkFFRCwyQkFBMkI7Z0JBQzNCLHdCQUF3QjtnQkFDeEIsTUFBTSxTQUFTLG1DQUNSLFFBQVEsS0FDWCxRQUFRLEVBQUUsRUFBRSxFQUNaLFVBQVUsRUFBRSxFQUFFLEdBQ2pCLENBQUM7Z0JBQ0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsYUFBYTtJQUNMLGVBQWUsQ0FBQyxRQUFhO1FBQ2pDLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDNUIsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFL0Msa0NBQWtDO1FBQ2xDLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDL0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDL0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7WUFDbkMsQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQ2YsUUFBUSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUNyQyxRQUFRLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3JDLFFBQVEsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUM1QyxDQUFDLENBQUM7SUFDZCxDQUFDO0lBRUQsaUJBQWlCO0lBQ1QsZ0JBQWdCLENBQUMsUUFBYTtRQUNsQyxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRTNCLGFBQWE7UUFDYixJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQy9CLE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxvQkFBb0I7UUFDcEIsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLE9BQU8sUUFBUSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUN2RCxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQUVELG9CQUFvQjtRQUNwQixJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQy9CLENBQUM7UUFFRCxnQkFBZ0I7UUFDaEIsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFFRCw2QkFBNkI7UUFDN0IsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxRQUFRLENBQUMsTUFBTSxlQUFlLENBQUMsQ0FBQztZQUMzRCxPQUFPLElBQUksQ0FBQyxDQUFDLHdCQUF3QjtRQUN6QyxDQUFDO1FBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxlQUFlO0lBQ1Asb0JBQW9CLENBQUMsUUFBYTs7UUFDdEMsTUFBTSxRQUFRLEdBQVUsRUFBRSxDQUFDO1FBRTNCLDhDQUE4QztRQUM5QyxJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDaEUsS0FBSyxNQUFNLEtBQUssSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3BDLG9DQUFvQztnQkFDcEMsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQzlCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLENBQUMsSUFBSSxLQUFJLE1BQUEsS0FBSyxDQUFDLEtBQUssMENBQUUsSUFBSSxDQUFBLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDckUsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRU8sWUFBWTtRQUNoQiwyQkFBMkI7UUFDM0IsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUM7UUFDakMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLElBQUksR0FBRyxDQUFDO1lBQ2hCLENBQUM7WUFDRCxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sZ0JBQWdCLENBQUMsUUFBYSxFQUFFLFVBQWtCLEVBQUUsVUFBa0I7UUFDMUUsZUFBZTtRQUNmLE1BQU0sV0FBVyxHQUFHO1lBQ2hCLFVBQVUsRUFBRSxXQUFXO1lBQ3ZCLE9BQU8sRUFBRSxVQUFVO1lBQ25CLFdBQVcsRUFBRSxDQUFDO1lBQ2Qsa0JBQWtCLEVBQUUsRUFBRTtZQUN0QixTQUFTLEVBQUUsRUFBRTtZQUNiLE1BQU0sRUFBRTtnQkFDSixRQUFRLEVBQUUsQ0FBQzthQUNkO1lBQ0Qsb0JBQW9CLEVBQUUsQ0FBQztZQUN2QixZQUFZLEVBQUUsS0FBSztTQUN0QixDQUFDO1FBRUYsbUJBQW1CO1FBQ25CLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUUxRSxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRU8sb0JBQW9CLENBQUMsUUFBYSxFQUFFLFVBQWtCO1FBQzFELGlCQUFpQjtRQUNqQixNQUFNLGFBQWEsR0FBVSxFQUFFLENBQUM7UUFDaEMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLFlBQVk7UUFDWixNQUFNLFdBQVcsR0FBRyxDQUFDLElBQVMsRUFBRSxXQUFtQixDQUFDLEVBQVUsRUFBRTtZQUM1RCxNQUFNLE1BQU0sR0FBRyxTQUFTLEVBQUUsQ0FBQztZQUUzQixTQUFTO1lBQ1QsTUFBTSxhQUFhLEdBQUc7Z0JBQ2xCLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNO2dCQUM1QixXQUFXLEVBQUUsQ0FBQztnQkFDZCxrQkFBa0IsRUFBRSxFQUFFO2dCQUN0QixTQUFTLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZELFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN0RixTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLO2dCQUNoQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDNUYsU0FBUyxFQUFFO29CQUNQLFFBQVEsRUFBRSxTQUFTLEVBQUU7aUJBQ3hCO2dCQUNELE9BQU8sRUFBRTtvQkFDTCxVQUFVLEVBQUUsU0FBUztvQkFDckIsR0FBRyxFQUFFLENBQUM7b0JBQ04sR0FBRyxFQUFFLENBQUM7b0JBQ04sR0FBRyxFQUFFLENBQUM7aUJBQ1Q7Z0JBQ0QsT0FBTyxFQUFFO29CQUNMLFVBQVUsRUFBRSxTQUFTO29CQUNyQixHQUFHLEVBQUUsQ0FBQztvQkFDTixHQUFHLEVBQUUsQ0FBQztvQkFDTixHQUFHLEVBQUUsQ0FBQztvQkFDTixHQUFHLEVBQUUsQ0FBQztpQkFDVDtnQkFDRCxTQUFTLEVBQUU7b0JBQ1AsVUFBVSxFQUFFLFNBQVM7b0JBQ3JCLEdBQUcsRUFBRSxDQUFDO29CQUNOLEdBQUcsRUFBRSxDQUFDO29CQUNOLEdBQUcsRUFBRSxDQUFDO2lCQUNUO2dCQUNELFdBQVcsRUFBRSxDQUFDO2dCQUNkLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixRQUFRLEVBQUU7b0JBQ04sVUFBVSxFQUFFLFNBQVM7b0JBQ3JCLEdBQUcsRUFBRSxDQUFDO29CQUNOLEdBQUcsRUFBRSxDQUFDO29CQUNOLEdBQUcsRUFBRSxDQUFDO2lCQUNUO2dCQUNELEtBQUssRUFBRSxFQUFFO2FBQ1osQ0FBQztZQUVGLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFbEMsT0FBTztZQUNQLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQWMsRUFBRSxFQUFFO29CQUN2QyxNQUFNLFdBQVcsR0FBRyxTQUFTLEVBQUUsQ0FBQztvQkFDaEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUNuRixhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsQ0FBQztnQkFDL0MsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBRUQsUUFBUTtZQUNSLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO29CQUNqQyxXQUFXLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvQixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUM7UUFFRixXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsT0FBTyxhQUFhLENBQUM7SUFDekIsQ0FBQztJQUVPLHlCQUF5QixDQUFDLFNBQWMsRUFBRSxXQUFtQjtRQUNqRSxpQkFBaUI7UUFDakIsTUFBTSxrQkFBa0IsbUJBQ3BCLFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxJQUFJLGNBQWMsRUFDNUMsT0FBTyxFQUFFLEVBQUUsRUFDWCxXQUFXLEVBQUUsQ0FBQyxFQUNkLGtCQUFrQixFQUFFLEVBQUUsRUFDdEIsTUFBTSxFQUFFO2dCQUNKLFFBQVEsRUFBRSxXQUFXLEdBQUcsQ0FBQzthQUM1QixFQUNELFVBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxLQUFLLEtBQUssRUFDdkMsVUFBVSxFQUFFO2dCQUNSLFFBQVEsRUFBRSxXQUFXLEdBQUcsQ0FBQzthQUM1QixJQUNFLFNBQVMsQ0FBQyxVQUFVLENBQzFCLENBQUM7UUFFRixlQUFlO1FBQ2YsTUFBTSxjQUFjLEdBQUc7WUFDbkIsVUFBVSxFQUFFLG1CQUFtQjtZQUMvQixRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtTQUNsQyxDQUFDO1FBRUYsT0FBTyxDQUFDLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTyxjQUFjO1FBQ2xCLGVBQWU7UUFDZixNQUFNLEtBQUssR0FBRyxrRUFBa0UsQ0FBQztRQUNqRixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxjQUFjLENBQUMsVUFBa0IsRUFBRSxVQUFrQjtRQUN6RCxPQUFPO1lBQ0gsS0FBSyxFQUFFLFFBQVE7WUFDZixVQUFVLEVBQUUsUUFBUTtZQUNwQixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsVUFBVTtZQUNsQixPQUFPLEVBQUU7Z0JBQ0wsT0FBTzthQUNWO1lBQ0QsVUFBVSxFQUFFLEVBQUU7WUFDZCxVQUFVLEVBQUU7Z0JBQ1IsY0FBYyxFQUFFLFVBQVU7YUFDN0I7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVPLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBa0IsRUFBRSxVQUFpQixFQUFFLFFBQWE7UUFDOUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLElBQUksQ0FBQztnQkFDRCxzQkFBc0I7Z0JBQ3RCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUV0RCxlQUFlO2dCQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3BELFlBQVk7b0JBQ1osTUFBTSxRQUFRLEdBQUcsR0FBRyxVQUFVLE9BQU8sQ0FBQztvQkFDdEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDckQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDVCxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDL0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7b0JBQ3BCLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDckUsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxjQUFjLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5RCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFnQixFQUFFLE9BQWU7UUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxXQUFXO1lBQ1gsTUFBTSxXQUFXLEdBQUc7Z0JBQ2hCLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQztnQkFDM0UsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDO2dCQUN6RSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUM7YUFDN0UsQ0FBQztZQUVGLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7Z0JBQzlCLElBQUksS0FBSyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDOUIsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLE9BQU87Z0JBQ1gsQ0FBQztnQkFFRCxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUMzQixPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDO1lBRUYsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFrQixFQUFFLFFBQWdCO1FBQzNELE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ2pDLElBQUksQ0FBQztnQkFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDM0YsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNiLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3RFLE9BQU87Z0JBQ1gsQ0FBQztnQkFFRCw0Q0FBNEM7Z0JBQzVDLE1BQU0sUUFBUSxHQUFRLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDcEYsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNaLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ2xFLE9BQU87Z0JBQ1gsQ0FBQztnQkFDRCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNySSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2IsT0FBTyxDQUFDO3dCQUNKLE9BQU8sRUFBRSxLQUFLO3dCQUNkLEtBQUssRUFBRSxNQUFNLFFBQVEsa0ZBQWtGO3FCQUMxRyxDQUFDLENBQUM7b0JBQ0gsT0FBTztnQkFDWCxDQUFDO2dCQUVELHlCQUF5QjtnQkFDekIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQztvQkFDRCxNQUFNLFFBQVEsR0FBUSxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQztvQkFDMUcsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6QixNQUFNLFFBQVEsR0FBRyxDQUFBLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxJQUFJLE1BQUksUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLElBQUksQ0FBQSxDQUFDO29CQUNsRCxJQUFJLFFBQVEsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7d0JBQ3RDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzFDLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUM1QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ2pDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDckYsQ0FBQztnQkFDTCxDQUFDO2dCQUFDLFFBQVEsWUFBWSxJQUFkLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFeEIscUJBQXFCO2dCQUNyQixNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUU7b0JBQ2xELElBQUksRUFBRSxRQUFRO29CQUNkLE1BQU0sRUFBRSxTQUFTLENBQUMsSUFBSTtpQkFDekIsQ0FBQyxDQUFDO2dCQUVILG1CQUFtQjtnQkFDbkIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFM0MsMkJBQTJCO2dCQUMzQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ3BCLElBQUksQ0FBQztvQkFDRCxNQUFNLFFBQVEsR0FBUSxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQztvQkFDMUcsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6QixNQUFNLFFBQVEsR0FBRyxDQUFBLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxJQUFJLE1BQUksUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLElBQUksQ0FBQSxDQUFDO29CQUNsRCxJQUFJLFFBQVEsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7d0JBQ3RDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3RDLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUMzQixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ2pDLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDaEYsUUFBUSxHQUFHLFNBQVMsR0FBRyxVQUFVLENBQUM7d0JBQ2xDLE9BQU8sR0FBRyxVQUFVLEtBQUssU0FBUyxDQUFDO29CQUN2QyxDQUFDO2dCQUNMLENBQUM7Z0JBQUMsUUFBUSxZQUFZLElBQWQsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUV4Qiw2QkFBNkI7Z0JBQzdCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDakIsSUFBSSxDQUFDO29CQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDM0IsS0FBSyxNQUFNLElBQUksSUFBSyxTQUFtQixJQUFJLEVBQUUsRUFBRSxDQUFDO3dCQUM1QyxNQUFNLENBQUMsR0FBRyxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxRQUFRLEtBQUksRUFBRSxDQUFDO3dCQUMvQixJQUFJLENBQUMsS0FBSyxTQUFTOzRCQUFFLEVBQUUsRUFBRSxDQUFDOzZCQUNyQixJQUFJLENBQUMsS0FBSyxrQkFBa0IsRUFBRSxDQUFDOzRCQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUFDLENBQUM7NkJBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDOzRCQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUFDLENBQUM7NkJBQzlDLElBQUksQ0FBQzs0QkFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDckIsQ0FBQztvQkFDRCxLQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dCQUM3RCxDQUFDO2dCQUFDLFFBQVEsWUFBWSxJQUFkLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFeEIsT0FBTyxDQUFDO29CQUNKLE9BQU8sRUFBRSxJQUFJO29CQUNiLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyw0Q0FBNEM7b0JBQy9GLElBQUksRUFBRTt3QkFDRixPQUFPO3dCQUNQLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTt3QkFDOUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO3dCQUMzQyxRQUFRO3dCQUNSLEtBQUs7cUJBQ1I7aUJBQ0osQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuRSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFnQjtRQUN2QyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRTtnQkFDN0MsSUFBSSxFQUFFLFFBQVE7YUFDakIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1QsT0FBTyxDQUFDO29CQUNKLE9BQU8sRUFBRSxJQUFJO29CQUNiLE9BQU8sRUFBRSx1Q0FBdUM7aUJBQ25ELENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQVUsRUFBRSxFQUFFO2dCQUNwQixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBa0I7UUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFjLEVBQUUsRUFBRTtnQkFDdkYsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztnQkFFRCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEYsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUU7Z0JBQ3RCLE1BQU0sSUFBSSxHQUFlO29CQUNyQixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7b0JBQ25CLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtvQkFDbkIsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLE1BQU0sRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM1RCxVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7b0JBQy9CLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVTtvQkFDL0IsWUFBWSxFQUFFLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRTtpQkFDdkMsQ0FBQztnQkFDRixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQVUsRUFBRSxFQUFFO2dCQUNwQixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFTOztRQUN4QyxvQkFBb0I7UUFDcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxNQUFNLFVBQVUsR0FBRyxDQUFBLE1BQUEsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsMENBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsS0FBSSxXQUFXLENBQUM7UUFFdEYsd0JBQXdCO1FBQ3hCLE9BQU8sTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixRQUFRLEVBQUUsVUFBVTtZQUNwQixVQUFVLEVBQUUsVUFBVTtTQUN6QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFrQjtRQUMzQyxJQUFJLENBQUM7WUFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDO1lBQ2pELENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFL0QsT0FBTztnQkFDSCxPQUFPLEVBQUUsSUFBSTtnQkFDYixJQUFJLEVBQUU7b0JBQ0YsT0FBTyxFQUFFLGdCQUFnQixDQUFDLE9BQU87b0JBQ2pDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNO29CQUMvQixTQUFTLEVBQUUsZ0JBQWdCLENBQUMsU0FBUztvQkFDckMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLGNBQWM7b0JBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPO29CQUNqQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVc7aUJBQzlEO2FBQ0osQ0FBQztRQUNOLENBQUM7UUFBQyxPQUFPLEtBQWMsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sT0FBTyxHQUFHLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2RSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDOUMsQ0FBQztJQUNMLENBQUM7SUFFTyxvQkFBb0IsQ0FBQyxVQUFlO1FBQ3hDLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDOUIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN2QixNQUFNLGlCQUFpQixHQUFVLEVBQUUsQ0FBQztRQUNwQyxNQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxDQUFDLHdDQUF3QztRQUVyRixTQUFTO1FBQ1QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLENBQUM7UUFDakUsQ0FBQztRQUVELGtCQUFrQjtRQUNsQixNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsa0NBQWtDO1FBQ2xDLGtDQUFrQztRQUNsQyxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBcUQsQ0FBQztRQUVsRixpQkFBaUI7UUFDakIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVMsRUFBRSxLQUFhLEVBQUUsRUFBRTs7WUFDNUMsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRO2dCQUFFLE9BQU87WUFDOUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7WUFFOUIsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2xCLFNBQVMsRUFBRSxDQUFDO2dCQUNaLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksUUFBUSxLQUFLLEVBQUUsQ0FBQztnQkFDL0MsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25FLENBQUM7aUJBQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDWCxjQUFjLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLEtBQUssa0JBQWtCLEVBQUUsQ0FBQztvQkFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxPQUFPLE1BQUEsTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxNQUFNLG1DQUFJLEdBQUcsa0NBQWtDLENBQUMsQ0FBQztnQkFDOUcsQ0FBQztxQkFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUM5QixVQUFVO29CQUNWLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ2pELG1DQUFtQztvQkFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxvQkFBb0IsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO29CQUNuSCxDQUFDO29CQUNELGtEQUFrRDtvQkFDbEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDOUksTUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO29CQUMvQixLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUN4QyxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUFFLFNBQVM7d0JBQ25DLElBQUksQ0FBQyxLQUFLLElBQUk7NEJBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDN0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQzs0QkFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQzs2QkFDNUUsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDOzRCQUM1RSxvQ0FBb0M7NEJBQ3BDLFlBQVk7d0JBQ2hCLENBQUM7b0JBQ0wsQ0FBQztvQkFDRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ3ZCLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsYUFBYSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDbkcsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsVUFBVTtRQUNWLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELE9BQU87WUFDSCxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQzVCLE1BQU0sRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO1lBQ2hDLFNBQVM7WUFDVCxjQUFjO1lBQ2QsT0FBTyxFQUFFO2dCQUNMLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07Z0JBQzNDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTTtnQkFDMUUsZUFBZSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTTtnQkFDbkUsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLE1BQU07YUFDeEM7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVPLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBUztRQUNuQyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTs7WUFDakMsSUFBSSxDQUFDO2dCQUNELE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUM7Z0JBRW5FLFNBQVM7Z0JBQ1QsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3RCLE9BQU8sQ0FBQzt3QkFDSixPQUFPLEVBQUUsS0FBSzt3QkFDZCxLQUFLLEVBQUUsYUFBYSxVQUFVLENBQUMsS0FBSyxFQUFFO3FCQUN6QyxDQUFDLENBQUM7b0JBQ0gsT0FBTztnQkFDWCxDQUFDO2dCQUVELFdBQVc7Z0JBQ1gsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDckUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hELE9BQU8sQ0FBQzt3QkFDSixPQUFPLEVBQUUsS0FBSzt3QkFDZCxLQUFLLEVBQUUsZUFBZSxNQUFBLGFBQWEsQ0FBQyxLQUFLLG1DQUFJLE1BQU0sRUFBRTtxQkFDeEQsQ0FBQyxDQUFDO29CQUNILE9BQU87Z0JBQ1gsQ0FBQztnQkFFRCxXQUFXO2dCQUNYLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFFcEMsVUFBVTtnQkFDVixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRWpHLGFBQWE7Z0JBQ2IsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLElBQUksa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRXRGLDJCQUEyQjtnQkFDM0IsT0FBTyxDQUFDO29CQUNKLE9BQU8sRUFBRSxLQUFLO29CQUNkLEtBQUssRUFBRSxjQUFjO29CQUNyQixXQUFXLEVBQUUsMkVBQTJFO2lCQUMzRixDQUFDLENBQUM7WUFFUCxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUM7b0JBQ0osT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLGVBQWUsS0FBSyxFQUFFO2lCQUNoQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBQWtCO1FBQzlDLElBQUksQ0FBQztZQUNELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6RCxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUM7UUFDL0MsQ0FBQztRQUFDLE9BQU8sS0FBYyxFQUFFLENBQUM7WUFDdEIsTUFBTSxPQUFPLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLElBQUksV0FBVyxFQUFFLENBQUM7UUFDN0QsQ0FBQztJQUNMLENBQUM7SUFFTywwQkFBMEIsQ0FBQyxVQUFpQixFQUFFLE9BQWUsRUFBRSxPQUFlO1FBQ2xGLGVBQWU7UUFDZixNQUFNLFlBQVksR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFFckMsaUJBQWlCO1FBQ2pCLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxPQUFPLElBQUksa0JBQWtCLENBQUM7UUFDMUQsQ0FBQztRQUVELG1CQUFtQjtRQUNuQiwwQkFBMEI7UUFFMUIsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLHNCQUFzQixDQUFDLFNBQWlCLEVBQUUsT0FBZTtRQUNuRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFO2dCQUNuRSxTQUFTLEVBQUUsSUFBSTtnQkFDZixNQUFNLEVBQUUsS0FBSzthQUNoQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBYyxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO2dCQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLLENBQUMscUJBQXFCLENBQUMsU0FBaUIsRUFBRSxXQUFnQjtRQUNuRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQWMsRUFBRSxFQUFFO2dCQUN4RyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRTtnQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQztZQUN0RSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLHdCQUF3QixDQUFDLFNBQWlCO1FBQ3BELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7Z0JBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO2dCQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLLENBQUMsc0JBQXNCLENBQUMsU0FBaUIsRUFBRSxPQUFlO1FBQ25FLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtnQkFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDN0MsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNsQyxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSyxLQUFLLENBQUMsMkJBQTJCLENBQUMsUUFBYSxFQUFFLFVBQWtCLEVBQUUsVUFBa0IsRUFBRSxlQUF3QixFQUFFLGlCQUEwQjtRQUNqSixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFaEMsTUFBTSxVQUFVLEdBQVUsRUFBRSxDQUFDO1FBQzdCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUVsQix5QkFBeUI7UUFDekIsTUFBTSxXQUFXLEdBQUc7WUFDaEIsVUFBVSxFQUFFLFdBQVc7WUFDdkIsT0FBTyxFQUFFLFVBQVUsSUFBSSxFQUFFLEVBQUUsYUFBYTtZQUN4QyxXQUFXLEVBQUUsQ0FBQztZQUNkLGtCQUFrQixFQUFFLEVBQUU7WUFDdEIsU0FBUyxFQUFFLEVBQUU7WUFDYixNQUFNLEVBQUU7Z0JBQ0osUUFBUSxFQUFFLENBQUM7YUFDZDtZQUNELG9CQUFvQixFQUFFLENBQUM7WUFDdkIsWUFBWSxFQUFFLEtBQUs7U0FDdEIsQ0FBQztRQUNGLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0IsU0FBUyxFQUFFLENBQUM7UUFFWixrQkFBa0I7UUFDbEIsTUFBTSxPQUFPLEdBQUc7WUFDWixVQUFVO1lBQ1YsU0FBUyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUscUJBQXFCO1lBQy9DLGdCQUFnQixFQUFFLENBQUM7WUFDbkIsV0FBVyxFQUFFLElBQUksR0FBRyxFQUFrQixFQUFFLG1CQUFtQjtZQUMzRCxlQUFlLEVBQUUsSUFBSSxHQUFHLEVBQWtCLEVBQUUsaUJBQWlCO1lBQzdELG9CQUFvQixFQUFFLElBQUksR0FBRyxFQUFrQixDQUFDLGlCQUFpQjtTQUNwRSxDQUFDO1FBRUYsMENBQTBDO1FBQzFDLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFOUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsVUFBVSxDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV0RSxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLLENBQUMsc0JBQXNCLENBQ2hDLFFBQWEsRUFDYixlQUE4QixFQUM5QixTQUFpQixFQUNqQixPQU9DLEVBQ0QsZUFBd0IsRUFDeEIsaUJBQTBCLEVBQzFCLFFBQWlCOztRQUVqQixNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRS9CLFNBQVM7UUFDVCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVoRixlQUFlO1FBQ2YsT0FBTyxVQUFVLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ3BDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxTQUFTLEtBQUssSUFBSSxDQUFDLEtBQUssWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN4SCxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRTdCLDZCQUE2QjtRQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sTUFBTSxHQUFHLFFBQVEsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDakQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXRELGlCQUFpQjtRQUNqQixJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ1gsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxRQUFRLE9BQU8sU0FBUyxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQseUJBQXlCO1FBQ3pCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlELElBQUksZUFBZSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLEtBQUssTUFBTSxpQkFBaUIsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxDQUFDO1lBRXJFLGFBQWE7WUFDYixNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7WUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLGlCQUFpQixDQUFDLE1BQU0sbUJBQW1CLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ25GLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBQyxDQUFDLHNCQUFzQixPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDakUsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN2QyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxDQUFDLEtBQUssY0FBYyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLEtBQUssWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU1RCxVQUFVO1lBQ1YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNoRCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FDN0IsU0FBUyxFQUNULFNBQVMsRUFDVCxVQUFVLEVBQ1YsT0FBTyxFQUNQLGVBQWUsRUFDZixpQkFBaUIsRUFDakIsU0FBUyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FDbEMsQ0FBQztZQUNOLENBQUM7UUFDTCxDQUFDO1FBRUQsU0FBUztRQUNULElBQUksaUJBQWlCLElBQUksUUFBUSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxNQUFNLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxNQUFNLENBQUMsQ0FBQztZQUV0RSxNQUFNLGdCQUFnQixHQUFhLEVBQUUsQ0FBQztZQUN0QyxLQUFLLE1BQU0sU0FBUyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUMzQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7Z0JBRXBELDREQUE0RDtnQkFDNUQsSUFBSSxhQUFhLEdBQWtCLElBQUksQ0FBQztnQkFDeEMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2pCLGFBQWEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO2dCQUNuQyxDQUFDO3FCQUFNLElBQUksU0FBUyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqRCxhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ3pDLENBQUM7cUJBQU0sSUFBSSxNQUFBLE1BQUEsU0FBUyxDQUFDLFVBQVUsMENBQUUsSUFBSSwwQ0FBRSxLQUFLLEVBQUUsQ0FBQztvQkFDM0MsYUFBYSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDcEQsQ0FBQztxQkFBTSxJQUFJLE1BQUEsTUFBQSxNQUFBLE1BQUEsU0FBUyxDQUFDLFVBQVUsMENBQUUsUUFBUSwwQ0FBRSxLQUFLLDBDQUFFLE1BQU0sMENBQUUsS0FBSyxFQUFFLENBQUM7b0JBQzlELDRDQUE0QztvQkFDNUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNyRSxDQUFDO2dCQUNELElBQUksYUFBYSxFQUFFLENBQUM7b0JBQ2hCLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsYUFBYSxPQUFPLGNBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JFLENBQUM7Z0JBRUQsd0JBQXdCO2dCQUN4QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDL0UsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLFlBQVksQ0FBQztnQkFFMUMsdUJBQXVCO2dCQUN2QixNQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDaEQsaUNBQWlDO2dCQUNqQyxNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQUEsTUFBQSxNQUFBLE1BQUEsU0FBUyxDQUFDLFVBQVUsMENBQUUsUUFBUSwwQ0FBRSxLQUFLLDBDQUFFLE1BQU0sMENBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNuRyxVQUFVLENBQUMsbUJBQW1CLENBQUMsR0FBRztvQkFDOUIsVUFBVSxFQUFFLG1CQUFtQjtvQkFDL0IsUUFBUSxFQUFFLFVBQVU7aUJBQ3ZCLENBQUM7Z0JBRUYsMkJBQTJCO2dCQUMzQixJQUFJLFlBQVksSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDbkQsWUFBWSxDQUFDLFFBQVEsR0FBRyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxDQUFDO2dCQUM5RCxDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxRQUFRLGdCQUFnQixDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUdELG9CQUFvQjtRQUNwQixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsQ0FBQztRQUU3QyxNQUFNLFVBQVUsR0FBUTtZQUNwQixVQUFVLEVBQUUsZUFBZTtZQUMzQixNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7WUFDL0MsUUFBUSxFQUFFLE1BQU07WUFDaEIsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QiwyQkFBMkIsRUFBRSxJQUFJO1NBQ3BDLENBQUM7UUFFRixXQUFXO1FBQ1gsSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbEIsb0NBQW9DO1lBQ3BDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQy9CLENBQUM7YUFBTSxDQUFDO1lBQ0osc0JBQXNCO1lBQ3RCLFVBQVUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQy9CLENBQUM7UUFFRCxVQUFVLENBQUMsZUFBZSxDQUFDLEdBQUcsVUFBVSxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsZUFBZSxHQUFHLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLGtCQUFrQixDQUFDLElBQVk7UUFDbkMsTUFBTSxXQUFXLEdBQUcsbUVBQW1FLENBQUM7UUFFeEYsYUFBYTtRQUNiLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXZELFdBQVc7UUFDWCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDMUIsT0FBTyxJQUFJLENBQUMsQ0FBQyxvQkFBb0I7UUFDckMsQ0FBQztRQUVELCtDQUErQztRQUMvQyxJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV2QyxvQkFBb0I7UUFDcEIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV6QyxrQkFBa0I7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNDLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7WUFDakMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7WUFDckMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7WUFFckMsNkJBQTZCO1lBQzdCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUvQyxZQUFZO1lBQ1osTUFBTSxLQUFLLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7WUFFeEIsTUFBTSxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7T0FFRztJQUNLLHFCQUFxQixDQUFDLGFBQWtCLEVBQUUsU0FBaUIsRUFBRSxPQUdwRTs7UUFDRyxJQUFJLGFBQWEsR0FBRyxhQUFhLENBQUMsSUFBSSxJQUFJLGFBQWEsQ0FBQyxRQUFRLElBQUksY0FBYyxDQUFDO1FBQ25GLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFbkYsa0RBQWtEO1FBQ2xELGtFQUFrRTtRQUVsRSxnQ0FBZ0M7UUFDaEMsSUFBSSxhQUFhLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsU0FBUztRQUNULE1BQU0sU0FBUyxHQUFRO1lBQ25CLFVBQVUsRUFBRSxhQUFhO1lBQ3pCLE9BQU8sRUFBRSxFQUFFO1lBQ1gsV0FBVyxFQUFFLENBQUM7WUFDZCxrQkFBa0IsRUFBRSxFQUFFO1lBQ3RCLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7WUFDL0IsVUFBVSxFQUFFLE9BQU87U0FDdEIsQ0FBQztRQUVGLCtCQUErQjtRQUMvQixTQUFTLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUUxQixlQUFlO1FBQ2YsSUFBSSxhQUFhLEtBQUssZ0JBQWdCLEVBQUUsQ0FBQztZQUNyQyxNQUFNLFdBQVcsR0FBRyxDQUFBLE1BQUEsTUFBQSxhQUFhLENBQUMsVUFBVSwwQ0FBRSxXQUFXLDBDQUFFLEtBQUssS0FBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ2hHLE1BQU0sV0FBVyxHQUFHLENBQUEsTUFBQSxNQUFBLGFBQWEsQ0FBQyxVQUFVLDBDQUFFLFdBQVcsMENBQUUsS0FBSyxLQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFFdkYsU0FBUyxDQUFDLFlBQVksR0FBRztnQkFDckIsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLE9BQU8sRUFBRSxXQUFXLENBQUMsS0FBSztnQkFDMUIsUUFBUSxFQUFFLFdBQVcsQ0FBQyxNQUFNO2FBQy9CLENBQUM7WUFDRixTQUFTLENBQUMsWUFBWSxHQUFHO2dCQUNyQixVQUFVLEVBQUUsU0FBUztnQkFDckIsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNsQixHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDckIsQ0FBQztRQUNOLENBQUM7YUFBTSxJQUFJLGFBQWEsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN2QywyQkFBMkI7WUFDM0IsTUFBTSxlQUFlLEdBQUcsQ0FBQSxNQUFBLGFBQWEsQ0FBQyxVQUFVLDBDQUFFLFlBQVksTUFBSSxNQUFBLGFBQWEsQ0FBQyxVQUFVLDBDQUFFLFdBQVcsQ0FBQSxDQUFDO1lBQ3hHLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLFNBQVMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNyRixDQUFDO2lCQUFNLENBQUM7Z0JBQ0osU0FBUyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDbEMsQ0FBQztZQUVELFNBQVMsQ0FBQyxLQUFLLEdBQUcsTUFBQSxNQUFBLE1BQUEsYUFBYSxDQUFDLFVBQVUsMENBQUUsS0FBSywwQ0FBRSxLQUFLLG1DQUFJLENBQUMsQ0FBQztZQUM5RCxTQUFTLENBQUMsU0FBUyxHQUFHLE1BQUEsTUFBQSxNQUFBLGFBQWEsQ0FBQyxVQUFVLDBDQUFFLFNBQVMsMENBQUUsS0FBSyxtQ0FBSSxDQUFDLENBQUM7WUFDdEUsU0FBUyxDQUFDLFNBQVMsR0FBRyxNQUFBLE1BQUEsTUFBQSxhQUFhLENBQUMsVUFBVSwwQ0FBRSxTQUFTLDBDQUFFLEtBQUssbUNBQUksQ0FBQyxDQUFDO1lBQ3RFLFNBQVMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ2xFLFNBQVMsQ0FBQyxVQUFVLEdBQUcsTUFBQSxNQUFBLE1BQUEsYUFBYSxDQUFDLFVBQVUsMENBQUUsVUFBVSwwQ0FBRSxLQUFLLG1DQUFJLENBQUMsQ0FBQztZQUN4RSxTQUFTLENBQUMsVUFBVSxHQUFHLE1BQUEsTUFBQSxNQUFBLGFBQWEsQ0FBQyxVQUFVLDBDQUFFLFVBQVUsMENBQUUsS0FBSyxtQ0FBSSxDQUFDLENBQUM7WUFDeEUsU0FBUyxDQUFDLGNBQWMsR0FBRyxNQUFBLE1BQUEsTUFBQSxhQUFhLENBQUMsVUFBVSwwQ0FBRSxjQUFjLDBDQUFFLEtBQUssbUNBQUksSUFBSSxDQUFDO1lBQ25GLFNBQVMsQ0FBQyxhQUFhLEdBQUcsTUFBQSxNQUFBLE1BQUEsYUFBYSxDQUFDLFVBQVUsMENBQUUsYUFBYSwwQ0FBRSxLQUFLLG1DQUFJLEtBQUssQ0FBQztZQUVsRiwwQkFBMEI7WUFDMUIsaUZBQWlGO1lBQ2pGLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLFNBQVMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7YUFBTSxJQUFJLGFBQWEsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxTQUFTLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUMvQixTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUMxQixTQUFTLENBQUMsWUFBWSxHQUFHLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDNUYsU0FBUyxDQUFDLFdBQVcsR0FBRyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQzNGLFNBQVMsQ0FBQyxhQUFhLEdBQUcsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUM3RixTQUFTLENBQUMsY0FBYyxHQUFHLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDOUYsU0FBUyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDL0IsU0FBUyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDOUIsU0FBUyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDaEMsU0FBUyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDakMsU0FBUyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7WUFDMUIsU0FBUyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7WUFDM0Isb0JBQW9CO1lBQ3BCLE1BQU0sVUFBVSxHQUFHLENBQUEsTUFBQSxhQUFhLENBQUMsVUFBVSwwQ0FBRSxPQUFPLE1BQUksTUFBQSxhQUFhLENBQUMsVUFBVSwwQ0FBRSxNQUFNLENBQUEsQ0FBQztZQUN6RixJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNiLFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRSxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osU0FBUyxDQUFDLE9BQU8sR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLFdBQVc7WUFDNUQsQ0FBQztZQUNELFNBQVMsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQzVCLFNBQVMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7YUFBTSxJQUFJLGFBQWEsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUN0QyxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUEsTUFBQSxNQUFBLGFBQWEsQ0FBQyxVQUFVLDBDQUFFLE9BQU8sMENBQUUsS0FBSyxLQUFJLE9BQU8sQ0FBQztZQUN4RSxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLFNBQVMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLFNBQVMsQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBQy9CLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLFNBQVMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQzNCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLFNBQVMsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQ2pDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDbkMsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDeEIsU0FBUyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDNUIsU0FBUyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDMUIsU0FBUyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDL0IsU0FBUyxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztZQUMvQixTQUFTLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztZQUN6QixTQUFTLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUN2QixDQUFDO2FBQU0sSUFBSSxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEMsNEJBQTRCO1lBQzVCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUNsRSxJQUFJLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxHQUFHLEtBQUssVUFBVTtvQkFDekQsR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssTUFBTSxJQUFJLEdBQUcsS0FBSyxlQUFlO29CQUMzRCxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxVQUFVLEVBQUUsQ0FBQztvQkFDNUMsU0FBUyxDQUFDLFdBQVc7Z0JBQ3pCLENBQUM7Z0JBRUQscUJBQXFCO2dCQUNyQixJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDdEIsbUJBQW1CO29CQUNuQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNoRSxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDMUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztvQkFDL0IsQ0FBQztnQkFDTCxDQUFDO3FCQUFNLENBQUM7b0JBQ0osZ0JBQWdCO29CQUNoQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNoRSxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDMUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztvQkFDL0IsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFRCxlQUFlO1FBQ2YsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDaEMsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDO1FBQ3JCLFNBQVMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRXBCLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNLLHdCQUF3QixDQUFDLFFBQWEsRUFBRSxPQUcvQzs7UUFDRyxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzVDLE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQzdCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFFM0IsVUFBVTtRQUNWLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELG9CQUFvQjtRQUNwQixJQUFJLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUMxRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsU0FBUztRQUNULElBQUksSUFBSSxLQUFLLFNBQVMsS0FBSSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsSUFBSSxDQUFBLEVBQUUsQ0FBQztZQUNwQyw0QkFBNEI7WUFDNUIsSUFBSSxDQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxlQUFlLEtBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3RFLG1CQUFtQjtnQkFDbkIsT0FBTztvQkFDSCxRQUFRLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztpQkFDcEQsQ0FBQztZQUNOLENBQUM7WUFDRCw4QkFBOEI7WUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsS0FBSyxDQUFDLElBQUksb0VBQW9FLENBQUMsQ0FBQztZQUNwSCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsSUFBSSxLQUFJLENBQ2YsSUFBSSxLQUFLLFdBQVc7WUFDcEIsSUFBSSxLQUFLLGNBQWM7WUFDdkIsSUFBSSxLQUFLLGdCQUFnQjtZQUN6QixJQUFJLEtBQUssYUFBYTtZQUN0QixJQUFJLEtBQUssa0JBQWtCO1lBQzNCLElBQUksS0FBSyxjQUFjO1lBQ3ZCLElBQUksS0FBSyxTQUFTO1lBQ2xCLElBQUksS0FBSyxVQUFVLENBQ3RCLEVBQUUsQ0FBQztZQUNBLHFCQUFxQjtZQUNyQixNQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFGLE9BQU87Z0JBQ0gsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLGtCQUFrQixFQUFFLElBQUk7YUFDM0IsQ0FBQztRQUNOLENBQUM7UUFFRCx5Q0FBeUM7UUFDekMsSUFBSSxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxJQUFJLEtBQUksQ0FBQyxJQUFJLEtBQUssY0FBYztZQUN2QyxJQUFJLEtBQUssVUFBVSxJQUFJLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxLQUFLLFdBQVc7WUFDbkUsSUFBSSxLQUFLLGdCQUFnQixJQUFJLElBQUksS0FBSyxnQkFBZ0I7WUFDdEQsSUFBSSxLQUFLLGtCQUFrQixJQUFJLElBQUksS0FBSyxjQUFjO1lBQ3RELElBQUksS0FBSyxnQkFBZ0IsSUFBSSxDQUFDLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDakYsNkJBQTZCO1lBQzdCLElBQUksQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsb0JBQW9CLEtBQUksT0FBTyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDaEYsbUJBQW1CO2dCQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixJQUFJLFNBQVMsS0FBSyxDQUFDLElBQUksZ0RBQWdELENBQUMsQ0FBQztnQkFDNUcsT0FBTztvQkFDSCxRQUFRLEVBQUUsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2lCQUN6RCxDQUFDO1lBQ04sQ0FBQztZQUNELDhCQUE4QjtZQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixJQUFJLFNBQVMsS0FBSyxDQUFDLElBQUksb0VBQW9FLENBQUMsQ0FBQztZQUNqSSxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsc0JBQXNCO1FBQ3RCLElBQUksS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUN0QixPQUFPO29CQUNILFVBQVUsRUFBRSxVQUFVO29CQUN0QixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDckQsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ3JELEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNyRCxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO2lCQUNqRixDQUFDO1lBQ04sQ0FBQztpQkFBTSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDNUIsT0FBTztvQkFDSCxVQUFVLEVBQUUsU0FBUztvQkFDckIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDekIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDekIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztpQkFDNUIsQ0FBQztZQUNOLENBQUM7aUJBQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzVCLE9BQU87b0JBQ0gsVUFBVSxFQUFFLFNBQVM7b0JBQ3JCLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ3pCLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7aUJBQzVCLENBQUM7WUFDTixDQUFDO2lCQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUM1QixPQUFPO29CQUNILFVBQVUsRUFBRSxTQUFTO29CQUNyQixPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNqQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2lCQUN0QyxDQUFDO1lBQ04sQ0FBQztpQkFBTSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDNUIsT0FBTztvQkFDSCxVQUFVLEVBQUUsU0FBUztvQkFDckIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDekIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDekIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDekIsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNuRCxDQUFDO1lBQ04sQ0FBQztRQUNMLENBQUM7UUFFRCxTQUFTO1FBQ1QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkIsT0FBTztZQUNQLElBQUksQ0FBQSxNQUFBLFFBQVEsQ0FBQyxlQUFlLDBDQUFFLElBQUksTUFBSyxTQUFTLEVBQUUsQ0FBQztnQkFDL0MsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFOztvQkFDcEIsSUFBSSxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxJQUFJLE1BQUksTUFBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsZUFBZSwwQ0FBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBLEVBQUUsQ0FBQzt3QkFDekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDaEUsQ0FBQztvQkFDRCxPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFFRCxPQUFPO1lBQ1AsSUFBSSxDQUFBLE1BQUEsUUFBUSxDQUFDLGVBQWUsMENBQUUsSUFBSSxLQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNwRixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3BCLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLElBQUksRUFBRSxDQUFDO3dCQUNiLE9BQU87NEJBQ0gsVUFBVSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzRCQUM5QyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUk7eUJBQ3BELENBQUM7b0JBQ04sQ0FBQztvQkFDRCxPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFFRCxTQUFTO1lBQ1QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsS0FBSyxNQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUVELDhCQUE4QjtRQUM5QixJQUFJLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2RSx1QkFDSSxVQUFVLEVBQUUsSUFBSSxJQUNiLEtBQUssRUFDVjtRQUNOLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQ7O09BRUc7SUFDSyx3QkFBd0IsQ0FBQyxRQUFhLEVBQUUsZUFBOEIsRUFBRSxRQUFpQjtRQUM3RixtQkFBbUI7UUFDbkIsNkRBQTZEOztRQUU3RCxZQUFZO1FBQ1osTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtZQUMzQixJQUFJLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEtBQUssTUFBSyxTQUFTO2dCQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNqRCxJQUFJLElBQUksS0FBSyxTQUFTO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzNHLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDakgsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEcsTUFBTSxNQUFNLEdBQUcsTUFBQSxNQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLG1DQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLE1BQU0sQ0FBQyxtQ0FBSSxJQUFJLENBQUM7UUFDckYsTUFBTSxJQUFJLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDO1FBQzdGLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDO1FBRXhGLE9BQU87UUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxzQkFBc0IsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUVsRSxNQUFNLFNBQVMsR0FBRyxlQUFlLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUU3QyxPQUFPO1lBQ0gsVUFBVSxFQUFFLFNBQVM7WUFDckIsT0FBTyxFQUFFLElBQUk7WUFDYixXQUFXLEVBQUUsQ0FBQztZQUNkLGtCQUFrQixFQUFFLEVBQUU7WUFDdEIsU0FBUyxFQUFFLFNBQVM7WUFDcEIsV0FBVyxFQUFFLEVBQUUsRUFBRSxtQkFBbUI7WUFDcEMsU0FBUyxFQUFFLE1BQU07WUFDakIsYUFBYSxFQUFFLEVBQUUsRUFBRSxrQkFBa0I7WUFDckMsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLGVBQWU7WUFDM0MsT0FBTyxFQUFFO2dCQUNMLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2YsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNmLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNsQjtZQUNELE9BQU8sRUFBRTtnQkFDTCxVQUFVLEVBQUUsU0FBUztnQkFDckIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNmLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDZixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2YsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ2xCO1lBQ0QsU0FBUyxFQUFFO2dCQUNQLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ1osR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNaLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNmO1lBQ0QsV0FBVyxFQUFFLENBQUM7WUFDZCxRQUFRLEVBQUUsS0FBSztZQUNmLFFBQVEsRUFBRTtnQkFDTixVQUFVLEVBQUUsU0FBUztnQkFDckIsR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7YUFDVDtZQUNELEtBQUssRUFBRSxFQUFFO1NBQ1osQ0FBQztJQUNOLENBQUM7SUFFRDs7T0FFRztJQUNLLGVBQWUsQ0FBQyxRQUFhOztRQUNqQyxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRTNCLGVBQWU7UUFDZixNQUFNLE9BQU8sR0FBRztZQUNaLFFBQVEsQ0FBQyxJQUFJO1lBQ2IsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxJQUFJO1lBQ3BCLFFBQVEsQ0FBQyxRQUFRO1lBQ2pCLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsUUFBUTtZQUN4QixRQUFRLENBQUMsRUFBRTtZQUNYLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsRUFBRTtTQUNyQixDQUFDO1FBRUYsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUMzQixJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNsRCxPQUFPLE1BQU0sQ0FBQztZQUNsQixDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNLLGlCQUFpQixDQUFDLFFBQWEsRUFBRSxRQUFpQjs7UUFDdEQsWUFBWTtRQUNaLE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBUyxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxLQUFLLE1BQUssU0FBUztnQkFBRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDakQsSUFBSSxJQUFJLEtBQUssU0FBUztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNwQyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFRixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMzRyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2pILE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xHLE1BQU0sTUFBTSxHQUFHLE1BQUEsTUFBQSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxtQ0FBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxNQUFNLENBQUMsbUNBQUksSUFBSSxDQUFDO1FBQ3JGLE1BQU0sSUFBSSxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUM3RixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQztRQUV0RixPQUFPO1lBQ0gsVUFBVSxFQUFFLFNBQVM7WUFDckIsT0FBTyxFQUFFLElBQUk7WUFDYixXQUFXLEVBQUUsQ0FBQztZQUNkLFNBQVMsRUFBRSxJQUFJO1lBQ2YsV0FBVyxFQUFFLEVBQUU7WUFDZixTQUFTLEVBQUUsTUFBTTtZQUNqQixhQUFhLEVBQUUsRUFBRSxFQUFFLGtCQUFrQjtZQUNyQyxTQUFTLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLENBQUM7YUFDZDtZQUNELE9BQU8sRUFBRTtnQkFDTCxVQUFVLEVBQUUsU0FBUztnQkFDckIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNmLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDZixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDbEI7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDZixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2YsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNmLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNsQjtZQUNELFNBQVMsRUFBRTtnQkFDUCxVQUFVLEVBQUUsU0FBUztnQkFDckIsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNaLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDWixHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDZjtZQUNELFFBQVEsRUFBRSxLQUFLO1lBQ2YsUUFBUSxFQUFFO2dCQUNOLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQzthQUNUO1lBQ0QsS0FBSyxFQUFFLEVBQUU7U0FDWixDQUFDO0lBQ04sQ0FBQztJQUVEOztPQUVHO0lBQ0sseUJBQXlCLENBQUMsVUFBa0IsRUFBRSxVQUFrQjtRQUNwRSxPQUFPO1lBQ0gsS0FBSyxFQUFFLE9BQU87WUFDZCxVQUFVLEVBQUUsUUFBUTtZQUNwQixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsVUFBVTtZQUNsQixPQUFPLEVBQUU7Z0JBQ0wsT0FBTzthQUNWO1lBQ0QsVUFBVSxFQUFFLEVBQUU7WUFDZCxVQUFVLEVBQUU7Z0JBQ1IsY0FBYyxFQUFFLFVBQVU7Z0JBQzFCLFNBQVMsRUFBRSxLQUFLO2FBQ25CO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFRDs7T0FFRztJQUNLLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxRQUFnQixFQUFFLFVBQWtCLEVBQUUsVUFBa0I7UUFDOUYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLDBCQUEwQjtZQUMxQiwrQkFBK0I7WUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sQ0FBQztnQkFDSixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsd0JBQXdCO2FBQ2xDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLFNBQWlCO1FBQy9ELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixpQ0FBaUM7WUFDaEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFlLENBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUN0RixPQUFPLENBQUM7b0JBQ0osT0FBTyxFQUFFLElBQUk7b0JBQ2IsSUFBSSxFQUFFO3dCQUNGLFFBQVEsRUFBRSxRQUFRO3dCQUNsQixTQUFTLEVBQUUsU0FBUzt3QkFDcEIsT0FBTyxFQUFFLFdBQVc7cUJBQ3ZCO2lCQUNKLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO2dCQUNwQixPQUFPLENBQUM7b0JBQ0osT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLGNBQWMsS0FBSyxDQUFDLE9BQU8sRUFBRTtpQkFDdkMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxrQkFBa0I7SUFDVixLQUFLLENBQUMsb0JBQW9CLENBQUMsUUFBZ0I7UUFDL0MsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUU7Z0JBQzNFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDWixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO29CQUM1QyxPQUFPO2dCQUNYLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRTtnQkFDcEIsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxLQUFLLENBQUMsd0JBQXdCLENBQUMsUUFBYSxFQUFFLFVBQWtCLEVBQUUsVUFBa0I7UUFDeEYsK0JBQStCO1FBQy9CLE1BQU0sVUFBVSxHQUFVLEVBQUUsQ0FBQztRQUM3QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFFbEIsdUJBQXVCO1FBQ3ZCLE1BQU0sV0FBVyxHQUFHO1lBQ2hCLFVBQVUsRUFBRSxXQUFXO1lBQ3ZCLE9BQU8sRUFBRSxVQUFVO1lBQ25CLFdBQVcsRUFBRSxDQUFDO1lBQ2Qsa0JBQWtCLEVBQUUsRUFBRTtZQUN0QixTQUFTLEVBQUUsRUFBRTtZQUNiLE1BQU0sRUFBRTtnQkFDSixRQUFRLEVBQUUsQ0FBQzthQUNkO1lBQ0Qsb0JBQW9CLEVBQUUsQ0FBQztZQUN2QixZQUFZLEVBQUUsS0FBSztTQUN0QixDQUFDO1FBQ0YsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QixTQUFTLEVBQUUsQ0FBQztRQUVaLFlBQVk7UUFDWixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRixVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUU1QixzQ0FBc0M7UUFDdEMsTUFBTSxjQUFjLEdBQUc7WUFDbkIsVUFBVSxFQUFFLGVBQWU7WUFDM0IsTUFBTSxFQUFFO2dCQUNKLFFBQVEsRUFBRSxDQUFDO2FBQ2Q7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsVUFBVSxFQUFFLFVBQVU7YUFDekI7WUFDRCxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUMvQixVQUFVLEVBQUUsSUFBSTtZQUNoQixpQkFBaUIsRUFBRSxFQUFFO1lBQ3JCLDJCQUEyQixFQUFFLEVBQUU7U0FDbEMsQ0FBQztRQUNGLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFaEMsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUdPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFhLEVBQUUsUUFBdUIsRUFBRSxVQUFpQixFQUFFLFNBQWlCOztRQUN2RyxNQUFNLE1BQU0sR0FBRyxTQUFTLEVBQUUsQ0FBQztRQUUzQixxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtZQUMzQixJQUFJLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEtBQUssTUFBSyxTQUFTO2dCQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNqRCxJQUFJLElBQUksS0FBSyxTQUFTO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzNHLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDakgsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEcsTUFBTSxNQUFNLEdBQUcsTUFBQSxNQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLG1DQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLE1BQU0sQ0FBQyxtQ0FBSSxJQUFJLENBQUM7UUFDckYsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDakYsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUM7UUFFdEYsTUFBTSxJQUFJLEdBQVE7WUFDZCxVQUFVLEVBQUUsU0FBUztZQUNyQixPQUFPLEVBQUUsSUFBSTtZQUNiLFdBQVcsRUFBRSxDQUFDO1lBQ2Qsa0JBQWtCLEVBQUUsRUFBRTtZQUN0QixTQUFTLEVBQUUsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDNUQsV0FBVyxFQUFFLEVBQUU7WUFDZixTQUFTLEVBQUUsTUFBTTtZQUNqQixhQUFhLEVBQUUsRUFBRTtZQUNqQixTQUFTLEVBQUUsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFFBQVEsRUFBRSxTQUFTLEVBQUU7YUFDeEIsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNSLE9BQU8sRUFBRTtnQkFDTCxVQUFVLEVBQUUsU0FBUztnQkFDckIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNmLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDZixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDbEI7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDZixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2YsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNmLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNsQjtZQUNELFNBQVMsRUFBRTtnQkFDUCxVQUFVLEVBQUUsU0FBUztnQkFDckIsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNaLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDWixHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDZjtZQUNELFdBQVcsRUFBRSxDQUFDO1lBQ2QsUUFBUSxFQUFFLEtBQUs7WUFDZixRQUFRLEVBQUU7Z0JBQ04sVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEdBQUcsRUFBRSxDQUFDO2FBQ1Q7WUFDRCxLQUFLLEVBQUUsRUFBRTtTQUNaLENBQUM7UUFFRiw0Q0FBNEM7UUFDNUMscUJBQXFCO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLDZCQUE2QixDQUFDLENBQUM7UUFFckQsa0NBQWtDO1FBQ2xDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1RCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksT0FBTyxVQUFVLENBQUMsTUFBTSw4QkFBOEIsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFRCxtQ0FBbUM7UUFDbkMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUQsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxPQUFPLGlCQUFpQixDQUFDLE1BQU0sT0FBTyxDQUFDLENBQUM7WUFFOUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNoRCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksS0FBSSxNQUFBLFNBQVMsQ0FBQyxLQUFLLDBDQUFFLElBQUksQ0FBQSxJQUFJLElBQUksQ0FBQztnQkFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFFN0MsSUFBSSxDQUFDO29CQUNELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztvQkFDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFFM0MsVUFBVTtvQkFDVixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDMUYsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xDLFNBQVMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO29CQUUvQiwyQkFBMkI7b0JBQzNCLHVCQUF1QjtvQkFDdkIsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO29CQUVoQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxTQUFTLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEQsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELGVBQWU7SUFDUCx5QkFBeUIsQ0FBQyxRQUFhOztRQUMzQyxNQUFNLFVBQVUsR0FBVSxFQUFFLENBQUM7UUFFN0IsZ0JBQWdCO1FBQ2hCLE1BQU0sZ0JBQWdCLEdBQUc7WUFDckIsUUFBUSxDQUFDLFNBQVM7WUFDbEIsUUFBUSxDQUFDLFVBQVU7WUFDbkIsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxTQUFTO1lBQ3pCLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsVUFBVTtTQUM3QixDQUFDO1FBRUYsS0FBSyxNQUFNLE1BQU0sSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3BDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUN4QixVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEYsTUFBTSxDQUFDLGVBQWU7WUFDMUIsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRUQsWUFBWTtJQUNKLDZCQUE2QixDQUFDLGFBQWtCLEVBQUUsTUFBYyxFQUFFLFlBQW9CO1FBQzFGLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxRQUFRLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQztRQUVuRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDekMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELHFCQUFxQjtRQUNyQixNQUFNLFNBQVMsR0FBUTtZQUNuQixVQUFVLEVBQUUsYUFBYTtZQUN6QixPQUFPLEVBQUUsRUFBRTtZQUNYLFdBQVcsRUFBRSxDQUFDO1lBQ2QsTUFBTSxFQUFFO2dCQUNKLFFBQVEsRUFBRSxNQUFNO2FBQ25CO1lBQ0QsVUFBVSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQztZQUMxRSxVQUFVLEVBQUU7Z0JBQ1IsUUFBUSxFQUFFLFlBQVk7YUFDekI7U0FDSixDQUFDO1FBRUYsZUFBZTtRQUNmLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRTdFLFVBQVU7UUFDVixTQUFTLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUVuQixPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRUQsWUFBWTtJQUNKLDhCQUE4QixDQUFDLFNBQWMsRUFBRSxhQUFrQixFQUFFLGFBQXFCO1FBQzVGLFFBQVEsYUFBYSxFQUFFLENBQUM7WUFDcEIsS0FBSyxnQkFBZ0I7Z0JBQ2pCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3hELE1BQU07WUFDVixLQUFLLFdBQVc7Z0JBQ1osSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDbkQsTUFBTTtZQUNWLEtBQUssVUFBVTtnQkFDWCxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNO1lBQ1YsS0FBSyxXQUFXO2dCQUNaLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ25ELE1BQU07WUFDVjtnQkFDSSxzQkFBc0I7Z0JBQ3RCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3BELE1BQU07UUFDZCxDQUFDO0lBQ0wsQ0FBQztJQUVELGtCQUFrQjtJQUNWLHdCQUF3QixDQUFDLFNBQWMsRUFBRSxhQUFrQjtRQUMvRCxTQUFTLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FDMUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUM1RixDQUFDO1FBQ0YsU0FBUyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQzFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FDbkYsQ0FBQztJQUNOLENBQUM7SUFFRCxhQUFhO0lBQ0wsbUJBQW1CLENBQUMsU0FBYyxFQUFFLGFBQWtCO1FBQzFELFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLFNBQVMsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLFNBQVMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUNyQyxJQUFJLENBQUMseUJBQXlCLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUM3RixDQUFDO1FBQ0YsU0FBUyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RixTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNFLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkYsU0FBUyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFFRCxZQUFZO0lBQ0osa0JBQWtCLENBQUMsU0FBYyxFQUFFLGFBQWtCO1FBQ3pELFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLFNBQVMsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLFNBQVMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUNyQyxJQUFJLENBQUMseUJBQXlCLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUN2RixDQUFDO1FBQ0YsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRixTQUFTLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLFNBQVMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLFNBQVMsQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQy9CLFNBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEYsU0FBUyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDaEMsU0FBUyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDM0IsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDeEIsU0FBUyxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDbEMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdkIsU0FBUyxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztRQUNuQyxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUM1QixTQUFTLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUMxQixTQUFTLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMvQixTQUFTLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxhQUFhO0lBQ0wsbUJBQW1CLENBQUMsU0FBYyxFQUFFLGFBQWtCO1FBQzFELFNBQVMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQzNCLFNBQVMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQy9CLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLFNBQVMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDcEYsU0FBUyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNuRixTQUFTLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3JGLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDdEYsU0FBUyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7UUFDMUIsU0FBUyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7SUFDL0IsQ0FBQztJQUVELFNBQVM7SUFDRCxvQkFBb0IsQ0FBQyxTQUFjLEVBQUUsYUFBa0I7UUFDM0QsZUFBZTtRQUNmLE1BQU0sY0FBYyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFckcsS0FBSyxNQUFNLElBQUksSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNoQyxJQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7b0JBQ3RCLFNBQVMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUNsQyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVztJQUNILGdCQUFnQixDQUFDLElBQVM7UUFDOUIsT0FBTztZQUNILFVBQVUsRUFBRSxTQUFTO1lBQ3JCLEdBQUcsRUFBRSxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxDQUFDLEtBQUksQ0FBQztZQUNqQixHQUFHLEVBQUUsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsQ0FBQyxLQUFJLENBQUM7U0FDcEIsQ0FBQztJQUNOLENBQUM7SUFFRCxXQUFXO0lBQ0gsZ0JBQWdCLENBQUMsSUFBUztRQUM5QixPQUFPO1lBQ0gsVUFBVSxFQUFFLFNBQVM7WUFDckIsR0FBRyxFQUFFLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLENBQUMsS0FBSSxDQUFDO1lBQ2pCLEdBQUcsRUFBRSxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxDQUFDLEtBQUksQ0FBQztZQUNqQixHQUFHLEVBQUUsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsQ0FBQyxLQUFJLENBQUM7U0FDcEIsQ0FBQztJQUNOLENBQUM7SUFFRCxXQUFXO0lBQ0gsZ0JBQWdCLENBQUMsSUFBUztRQUM5QixPQUFPO1lBQ0gsVUFBVSxFQUFFLFNBQVM7WUFDckIsT0FBTyxFQUFFLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEtBQUssS0FBSSxHQUFHO1lBQzNCLFFBQVEsRUFBRSxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxNQUFNLEtBQUksR0FBRztTQUNoQyxDQUFDO0lBQ04sQ0FBQztJQUVELFlBQVk7SUFDSixpQkFBaUIsQ0FBQyxJQUFTOztRQUMvQixPQUFPO1lBQ0gsVUFBVSxFQUFFLFVBQVU7WUFDdEIsR0FBRyxFQUFFLE1BQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLENBQUMsbUNBQUksR0FBRztZQUNuQixHQUFHLEVBQUUsTUFBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsQ0FBQyxtQ0FBSSxHQUFHO1lBQ25CLEdBQUcsRUFBRSxNQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxDQUFDLG1DQUFJLEdBQUc7WUFDbkIsR0FBRyxFQUFFLE1BQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLENBQUMsbUNBQUksR0FBRztTQUN0QixDQUFDO0lBQ04sQ0FBQztJQUVELGVBQWU7SUFDUCwyQkFBMkIsQ0FBQyxHQUFXLEVBQUUsS0FBVTtRQUN2RCxnQkFBZ0I7UUFDaEIsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDcEYsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELGtCQUFrQjtRQUNsQixJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDckQsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFHRCxxQkFBcUI7SUFDYix5QkFBeUIsQ0FBQyxhQUFrQixFQUFFLFlBQW9CLEVBQUUsWUFBa0I7UUFDMUYsV0FBVztRQUNYLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzVDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsZ0JBQWdCO1FBQ2hCLElBQUksYUFBYSxDQUFDLEtBQUssSUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3pFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELGVBQWU7UUFDZixNQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3hDLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzVDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUVELFFBQVE7SUFDQSxZQUFZLENBQUMsSUFBUztRQUMxQixJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCx1QkFBdUI7UUFDdkIsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO1FBRUQsZUFBZTtRQUNmLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ3pGLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sc0JBQXNCLENBQUMsVUFBa0IsRUFBRSxVQUFrQjtRQUNqRSxPQUFPO1lBQ0gsS0FBSyxFQUFFLFFBQVE7WUFDZixVQUFVLEVBQUUsUUFBUTtZQUNwQixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsVUFBVTtZQUNsQixPQUFPLEVBQUU7Z0JBQ0wsT0FBTzthQUNWO1lBQ0QsVUFBVSxFQUFFLEVBQUU7WUFDZCxVQUFVLEVBQUU7Z0JBQ1IsY0FBYyxFQUFFLFVBQVU7YUFDN0I7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxVQUFrQixFQUFFLFVBQWlCLEVBQUUsUUFBYTtRQUNqRixJQUFJLENBQUM7WUFDRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXRELGlCQUFpQjtZQUNqQixNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxTQUFTLENBQUM7WUFDN0YsTUFBTSxRQUFRLEdBQUcsR0FBRyxlQUFlLE9BQU8sQ0FBQztZQUUzQyx3QkFBd0I7WUFDeEIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDekYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRTtvQkFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsV0FBVztZQUNYLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ2hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7b0JBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsZUFBZSxFQUFFLENBQUMsQ0FBQztZQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVsRCxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1lBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEQsQ0FBQztJQUNMLENBQUM7Q0FFSjtBQWo0RkQsa0NBaTRGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IFRvb2xEZWZpbml0aW9uLCBUb29sUmVzcG9uc2UsIFRvb2xFeGVjdXRvciwgUHJlZmFiSW5mbyB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIFByZWZhYlRvb2xzIGltcGxlbWVudHMgVG9vbEV4ZWN1dG9yIHtcbiAgICBnZXRUb29scygpOiBUb29sRGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZ2V0X3ByZWZhYl9saXN0JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dldCBhbGwgcHJlZmFicyBpbiB0aGUgcHJvamVjdCcsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRm9sZGVyIHBhdGggdG8gc2VhcmNoIChvcHRpb25hbCknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6ICdkYjovL2Fzc2V0cydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2xvYWRfcHJlZmFiJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0xvYWQgYSBwcmVmYWIgYnkgcGF0aCcsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ByZWZhYiBhc3NldCBwYXRoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydwcmVmYWJQYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpbnN0YW50aWF0ZV9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW5zdGFudGlhdGUgYSBwcmVmYWIgaW4gdGhlIHNjZW5lJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGFzc2V0IHBhdGgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50VXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUGFyZW50IG5vZGUgVVVJRCAob3B0aW9uYWwpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJbml0aWFsIHBvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHsgdHlwZTogJ251bWJlcicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogeyB0eXBlOiAnbnVtYmVyJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6OiB7IHR5cGU6ICdudW1iZXInIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3ByZWZhYlBhdGgnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2NyZWF0ZV9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlIGEgcHJlZmFiIGZyb20gYSBub2RlIHdpdGggYWxsIGNoaWxkcmVuIGFuZCBjb21wb25lbnRzJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NvdXJjZSBub2RlIFVVSUQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZVBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1BhdGggdG8gc2F2ZSB0aGUgcHJlZmFiIChlLmcuLCBkYjovL2Fzc2V0cy9wcmVmYWJzL015UHJlZmFiLnByZWZhYiknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIG5hbWUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ25vZGVVdWlkJywgJ3NhdmVQYXRoJywgJ3ByZWZhYk5hbWUnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3VwZGF0ZV9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVXBkYXRlIGFuIGV4aXN0aW5nIHByZWZhYicsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ByZWZhYiBhc3NldCBwYXRoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdOb2RlIFVVSUQgd2l0aCBjaGFuZ2VzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydwcmVmYWJQYXRoJywgJ25vZGVVdWlkJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdyZXZlcnRfcHJlZmFiJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JldmVydCBwcmVmYWIgaW5zdGFuY2UgdG8gb3JpZ2luYWwnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGluc3RhbmNlIG5vZGUgVVVJRCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnbm9kZVV1aWQnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2dldF9wcmVmYWJfaW5mbycsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdHZXQgZGV0YWlsZWQgcHJlZmFiIGluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGFzc2V0IHBhdGgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3ByZWZhYlBhdGgnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3ZhbGlkYXRlX3ByZWZhYicsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdWYWxpZGF0ZSBhIHByZWZhYiBmaWxlIGZvcm1hdCcsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ByZWZhYiBhc3NldCBwYXRoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydwcmVmYWJQYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdkdXBsaWNhdGVfcHJlZmFiJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0R1cGxpY2F0ZSBhbiBleGlzdGluZyBwcmVmYWInLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VQcmVmYWJQYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTb3VyY2UgcHJlZmFiIHBhdGgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGFyZ2V0IHByZWZhYiBwYXRoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ByZWZhYk5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05ldyBwcmVmYWIgbmFtZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnc291cmNlUHJlZmFiUGF0aCcsICd0YXJnZXRQcmVmYWJQYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdyZXN0b3JlX3ByZWZhYl9ub2RlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Jlc3RvcmUgcHJlZmFiIG5vZGUgdXNpbmcgcHJlZmFiIGFzc2V0IChidWlsdC1pbiB1bmRvIHJlY29yZCknLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGluc3RhbmNlIG5vZGUgVVVJRCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ByZWZhYiBhc3NldCBVVUlEJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydub2RlVXVpZCcsICdhc3NldFV1aWQnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlKHRvb2xOYW1lOiBzdHJpbmcsIGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHN3aXRjaCAodG9vbE5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2dldF9wcmVmYWJfbGlzdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0UHJlZmFiTGlzdChhcmdzLmZvbGRlcik7XG4gICAgICAgICAgICBjYXNlICdsb2FkX3ByZWZhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMubG9hZFByZWZhYihhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgY2FzZSAnaW5zdGFudGlhdGVfcHJlZmFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5pbnN0YW50aWF0ZVByZWZhYihhcmdzKTtcbiAgICAgICAgICAgIGNhc2UgJ2NyZWF0ZV9wcmVmYWInOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmNyZWF0ZVByZWZhYihhcmdzKTtcbiAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZV9wcmVmYWInOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZVByZWZhYihhcmdzLnByZWZhYlBhdGgsIGFyZ3Mubm9kZVV1aWQpO1xuICAgICAgICAgICAgY2FzZSAncmV2ZXJ0X3ByZWZhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmV2ZXJ0UHJlZmFiKGFyZ3Mubm9kZVV1aWQpO1xuICAgICAgICAgICAgY2FzZSAnZ2V0X3ByZWZhYl9pbmZvJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRQcmVmYWJJbmZvKGFyZ3MucHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBjYXNlICd2YWxpZGF0ZV9wcmVmYWInOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnZhbGlkYXRlUHJlZmFiKGFyZ3MucHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBjYXNlICdkdXBsaWNhdGVfcHJlZmFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5kdXBsaWNhdGVQcmVmYWIoYXJncyk7XG4gICAgICAgICAgICBjYXNlICdyZXN0b3JlX3ByZWZhYl9ub2RlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZXN0b3JlUHJlZmFiTm9kZShhcmdzLm5vZGVVdWlkLCBhcmdzLmFzc2V0VXVpZCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0b29sOiAke3Rvb2xOYW1lfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRQcmVmYWJMaXN0KGZvbGRlcjogc3RyaW5nID0gJ2RiOi8vYXNzZXRzJyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGF0dGVybiA9IGZvbGRlci5lbmRzV2l0aCgnLycpID8gXG4gICAgICAgICAgICAgICAgYCR7Zm9sZGVyfSoqLyoucHJlZmFiYCA6IGAke2ZvbGRlcn0vKiovKi5wcmVmYWJgO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldHMnLCB7XG4gICAgICAgICAgICAgICAgcGF0dGVybjogcGF0dGVyblxuICAgICAgICAgICAgfSkudGhlbigocmVzdWx0czogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJzOiBQcmVmYWJJbmZvW10gPSByZXN1bHRzLm1hcChhc3NldCA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBhc3NldC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBhc3NldC51cmwsXG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IGFzc2V0LnV1aWQsXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlcjogYXNzZXQudXJsLnN1YnN0cmluZygwLCBhc3NldC51cmwubGFzdEluZGV4T2YoJy8nKSlcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHByZWZhYnMgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgbG9hZFByZWZhYihwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQcmVmYWIgbm90IGZvdW5kJyB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJEYXRhID0gYXdhaXQgdGhpcy5yZWFkUHJlZmFiRmlsZShwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB0aGlzLnZhbGlkYXRlUHJlZmFiRm9ybWF0KHByZWZhYkRhdGEpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICB1dWlkOiBhc3NldEluZm8udXVpZCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYXNzZXRJbmZvLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgIG5vZGVDb3VudDogdmFsaWRhdGlvblJlc3VsdC5ub2RlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudENvdW50OiB2YWxpZGF0aW9uUmVzdWx0LmNvbXBvbmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUHJlZmFiIGxvYWRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaW5zdGFudGlhdGVQcmVmYWIoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIOiOt+WPlumihOWItuS9k+i1hOa6kOS/oeaBr1xuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICghYXNzZXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign6aKE5Yi25L2T5pyq5om+5YiwJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g5L2/55So5q2j56Gu55qEIGNyZWF0ZS1ub2RlIEFQSSDku47pooTliLbkvZPotYTmupDlrp7kvovljJZcbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVOb2RlT3B0aW9uczogYW55ID0ge1xuICAgICAgICAgICAgICAgICAgICBhc3NldFV1aWQ6IGFzc2V0SW5mby51dWlkXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIOiuvue9rueItuiKgueCuVxuICAgICAgICAgICAgICAgIGlmIChhcmdzLnBhcmVudFV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMucGFyZW50ID0gYXJncy5wYXJlbnRVdWlkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOiuvue9ruiKgueCueWQjeensFxuICAgICAgICAgICAgICAgIGlmIChhcmdzLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMubmFtZSA9IGFyZ3MubmFtZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFzc2V0SW5mby5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLm5hbWUgPSBhc3NldEluZm8ubmFtZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDorr7nva7liJ3lp4vlsZ7mgKfvvIjlpoLkvY3nva7vvIlcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5wb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5kdW1wID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOWIm+W7uuiKgueCuVxuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVVdWlkID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnY3JlYXRlLW5vZGUnLCBjcmVhdGVOb2RlT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXVpZCA9IEFycmF5LmlzQXJyYXkobm9kZVV1aWQpID8gbm9kZVV1aWRbMF0gOiBub2RlVXVpZDtcblxuICAgICAgICAgICAgICAgIC8vIOazqOaEj++8mmNyZWF0ZS1ub2RlIEFQSeS7jumihOWItuS9k+i1hOa6kOWIm+W7uuaXtuW6lOivpeiHquWKqOW7uueri+mihOWItuS9k+WFs+iBlFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfpooTliLbkvZPoioLngrnliJvlu7rmiJDlip86Jywge1xuICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogdXVpZCxcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiVXVpZDogYXNzZXRJbmZvLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IGFyZ3MucHJlZmFiUGF0aFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogdXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IGFyZ3MucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFV1aWQ6IGFyZ3MucGFyZW50VXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhcmdzLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+WunuS+i+WMluaIkOWKn++8jOW3suW7uueri+mihOWItuS9k+WFs+iBlCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDpooTliLbkvZPlrp7kvovljJblpLHotKU6ICR7ZXJyLm1lc3NhZ2V9YCxcbiAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb246ICfor7fmo4Dmn6XpooTliLbkvZPot6/lvoTmmK/lkKbmraPnoa7vvIznoa7kv53pooTliLbkvZPmlofku7bmoLzlvI/mraPnoa4nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOW7uueri+iKgueCueS4jumihOWItuS9k+eahOWFs+iBlOWFs+ezu1xuICAgICAqIOi/meS4quaWueazleWIm+W7uuW/heimgeeahFByZWZhYkluZm/lkoxQcmVmYWJJbnN0YW5jZee7k+aehFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgZXN0YWJsaXNoUHJlZmFiQ29ubmVjdGlvbihub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcsIHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g6K+75Y+W6aKE5Yi25L2T5paH5Lu26I635Y+W5qC56IqC54K555qEZmlsZUlkXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJDb250ZW50ID0gYXdhaXQgdGhpcy5yZWFkUHJlZmFiRmlsZShwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShwcmVmYWJDb250ZW50KSB8fCBwcmVmYWJDb250ZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV6K+75Y+W6aKE5Yi25L2T5paH5Lu25YaF5a65Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOaJvuWIsOmihOWItuS9k+agueiKgueCueeahGZpbGVJZCAo6YCa5bi45piv56ys5LqM5Liq5a+56LGh77yM5Y2z57Si5byVMSlcbiAgICAgICAgICAgIGNvbnN0IHJvb3ROb2RlID0gcHJlZmFiQ29udGVudC5maW5kKFxuICAgICAgICAgICAgICAgIChpdGVtOiB1bmtub3duKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBpdGVtIGFzIHsgX190eXBlX18/OiBzdHJpbmc7IF9wYXJlbnQ/OiB1bmtub3duOyBfcHJlZmFiPzogeyBfX2lkX18/OiBudW1iZXIgfSB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5fX3R5cGVfXyA9PT0gJ2NjLk5vZGUnICYmIG5vZGUuX3BhcmVudCA9PT0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKSBhcyB7IF9wcmVmYWI/OiB7IF9faWRfXz86IG51bWJlciB9IH0gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoIXJvb3ROb2RlIHx8ICFyb290Tm9kZS5fcHJlZmFiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfml6Dms5Xmib7liLDpooTliLbkvZPmoLnoioLngrnmiJblhbbpooTliLbkvZPkv6Hmga8nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6I635Y+W5qC56IqC54K555qEUHJlZmFiSW5mb1xuICAgICAgICAgICAgY29uc3Qgcm9vdFByZWZhYkluZm8gPSBwcmVmYWJDb250ZW50W3Jvb3ROb2RlLl9wcmVmYWIuX19pZF9fID8/IC0xXSBhc1xuICAgICAgICAgICAgICAgIHwgeyBfX3R5cGVfXz86IHN0cmluZzsgZmlsZUlkPzogc3RyaW5nIH1cbiAgICAgICAgICAgICAgICB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICghcm9vdFByZWZhYkluZm8gfHwgcm9vdFByZWZhYkluZm8uX190eXBlX18gIT09ICdjYy5QcmVmYWJJbmZvJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV5om+5Yiw6aKE5Yi25L2T5qC56IqC54K555qEUHJlZmFiSW5mbycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByb290RmlsZUlkID0gcm9vdFByZWZhYkluZm8uZmlsZUlkO1xuICAgICAgICAgICAgaWYgKCFyb290RmlsZUlkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfml6Dms5Xmib7liLDpooTliLbkvZPmoLnoioLngrnnmoQgZmlsZUlkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOS9v+eUqHNjZW5lIEFQSeW7uueri+mihOWItuS9k+i/nuaOpVxuICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29ubmVjdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgcHJlZmFiOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgICAgIGZpbGVJZDogcm9vdEZpbGVJZFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8g5bCd6K+V5L2/55So5aSa56eNQVBJ5pa55rOV5bu656uL6aKE5Yi25L2T6L+e5o6lXG4gICAgICAgICAgICBjb25zdCBjb25uZWN0aW9uTWV0aG9kcyA9IFtcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjb25uZWN0LXByZWZhYi1pbnN0YW5jZScsIHByZWZhYkNvbm5lY3Rpb25EYXRhKSxcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJlZmFiLWNvbm5lY3Rpb24nLCBwcmVmYWJDb25uZWN0aW9uRGF0YSksXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnYXBwbHktcHJlZmFiLWxpbmsnLCBwcmVmYWJDb25uZWN0aW9uRGF0YSlcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGxldCBjb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbWV0aG9kIG9mIGNvbm5lY3Rpb25NZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbWV0aG9kKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybign6aKE5Yi25L2T6L+e5o6l5pa55rOV5aSx6LSl77yM5bCd6K+V5LiL5LiA5Liq5pa55rOVOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghY29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5omA5pyJQVBJ5pa55rOV6YO95aSx6LSl77yM5bCd6K+V5omL5Yqo5L+u5pS55Zy65pmv5pWw5o2uXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCfmiYDmnInpooTliLbkvZPov57mjqVBUEnpg73lpLHotKXvvIzlsJ3or5XmiYvliqjlu7rnq4vov57mjqUnKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1hbnVhbGx5RXN0YWJsaXNoUHJlZmFiQ29ubmVjdGlvbihub2RlVXVpZCwgcHJlZmFiVXVpZCwgcm9vdEZpbGVJZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+W7uueri+mihOWItuS9k+i/nuaOpeWksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOaJi+WKqOW7uueri+mihOWItuS9k+i/nuaOpe+8iOW9k0FQSeaWueazleWksei0peaXtueahOWkh+eUqOaWueahiO+8iVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgbWFudWFsbHlFc3RhYmxpc2hQcmVmYWJDb25uZWN0aW9uKG5vZGVVdWlkOiBzdHJpbmcsIHByZWZhYlV1aWQ6IHN0cmluZywgcm9vdEZpbGVJZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDlsJ3or5Xkvb/nlKhkdW1wIEFQSeS/ruaUueiKgueCueeahF9wcmVmYWLlsZ7mgKdcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkNvbm5lY3Rpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgIFtub2RlVXVpZF06IHtcbiAgICAgICAgICAgICAgICAgICAgJ19wcmVmYWInOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnX191dWlkX18nOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ19fZXhwZWN0ZWRUeXBlX18nOiAnY2MuUHJlZmFiJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdmaWxlSWQnOiByb290RmlsZUlkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgdXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgcGF0aDogJ19wcmVmYWInLFxuICAgICAgICAgICAgICAgIGR1bXA6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdfX3V1aWRfXyc6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnX19leHBlY3RlZFR5cGVfXyc6ICdjYy5QcmVmYWInXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5omL5Yqo5bu656uL6aKE5Yi25L2T6L+e5o6l5Lmf5aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgIC8vIOS4jeaKm+WHuumUmeivr++8jOWboOS4uuWfuuacrOeahOiKgueCueWIm+W7uuW3sue7j+aIkOWKn1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6Kej5p6QIHByZWZhYiDnmoTno4Hnm5jot6/lvoTvvIhDcmVhdG9yIDMuOCDml6AgcmVhZC1hc3NldCDmtojmga/vvIzpnIDpgJrov4cgcXVlcnktYXNzZXQtaW5mbyArIGZzIOivu+WPlu+8iVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgcmVzb2x2ZVByZWZhYkRpc2tQYXRoKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBwcmVmYWJQYXRoKTtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlUGF0aHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgaWYgKGFzc2V0SW5mbz8uc291cmNlKSB7XG4gICAgICAgICAgICBjYW5kaWRhdGVQYXRocy5wdXNoKHBhdGgucmVzb2x2ZShhc3NldEluZm8uc291cmNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFzc2V0SW5mbz8ucGF0aCkge1xuICAgICAgICAgICAgY2FuZGlkYXRlUGF0aHMucHVzaChwYXRoLnJlc29sdmUoYXNzZXRJbmZvLnBhdGgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHByZWZhYlBhdGhcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eZGI6XFwvXFwvYXNzZXRzXFwvPy8sICdhc3NldHMvJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eZGI6XFwvXFwvLywgJycpO1xuICAgICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IEVkaXRvci5Qcm9qZWN0Py5wYXRoO1xuICAgICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZVBhdGhzLnB1c2gocGF0aC5qb2luKHByb2plY3RQYXRoLCByZWxhdGl2ZVBhdGgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgZGlza1BhdGggb2YgY2FuZGlkYXRlUGF0aHMpIHtcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGRpc2tQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXNrUGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihg5peg5rOV5om+5Yiw6aKE5Yi25L2T5paH5Lu2OiAke3ByZWZhYlBhdGh9YCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6K+75Y+W6aKE5Yi25L2TIEpTT04g5pWw57uE5YaF5a65XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkUHJlZmFiRmlsZShwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd25bXT4ge1xuICAgICAgICBjb25zdCBkaXNrUGF0aCA9IGF3YWl0IHRoaXMucmVzb2x2ZVByZWZhYkRpc2tQYXRoKHByZWZhYlBhdGgpO1xuICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhkaXNrUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgY29uc3QgcHJlZmFiRGF0YTogdW5rbm93biA9IEpTT04ucGFyc2UoZmlsZUNvbnRlbnQpO1xuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShwcmVmYWJEYXRhKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfpooTliLbkvZPmlofku7bmoLzlvI/plJnor6/vvIzmoLnoioLngrnlv4XpobvmmK/mlbDnu4QnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcmVmYWJEYXRhO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdHJ5Q3JlYXRlTm9kZVdpdGhQcmVmYWIoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgYXJncy5wcmVmYWJQYXRoKS50aGVuKChhc3NldEluZm86IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghYXNzZXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign6aKE5Yi25L2T5pyq5om+5YiwJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g5pa55rOVMjog5L2/55SoIGNyZWF0ZS1ub2RlIOaMh+WumumihOWItuS9k+i1hOa6kFxuICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU5vZGVPcHRpb25zOiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0VXVpZDogYXNzZXRJbmZvLnV1aWRcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8g6K6+572u54i26IqC54K5XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MucGFyZW50VXVpZCkge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5wYXJlbnQgPSBhcmdzLnBhcmVudFV1aWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2NyZWF0ZS1ub2RlJywgY3JlYXRlTm9kZU9wdGlvbnMpO1xuICAgICAgICAgICAgfSkudGhlbigobm9kZVV1aWQ6IHN0cmluZyB8IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXVpZCA9IEFycmF5LmlzQXJyYXkobm9kZVV1aWQpID8gbm9kZVV1aWRbMF0gOiBub2RlVXVpZDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmjIflrprkuobkvY3nva7vvIzorr7nva7oioLngrnkvY3nva5cbiAgICAgICAgICAgICAgICBpZiAoYXJncy5wb3NpdGlvbiAmJiB1dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAncG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVtcDogeyB2YWx1ZTogYXJncy5wb3NpdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhcmdzLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yI5aSH55So5pa55rOV77yJ5bm26K6+572u5LqG5L2N572uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IGFyZ3MucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+WunuS+i+WMluaIkOWKn++8iOWkh+eUqOaWueazle+8ieS9huS9jee9ruiuvue9ruWksei0pSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IGFyZ3MucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yI5aSH55So5pa55rOV77yJJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDlpIfnlKjpooTliLbkvZPlrp7kvovljJbmlrnms5XkuZ/lpLHotKU6ICR7ZXJyLm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdHJ5QWx0ZXJuYXRpdmVJbnN0YW50aWF0ZU1ldGhvZHMoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIOaWueazlTE6IOWwneivleS9v+eUqCBjcmVhdGUtbm9kZSDnhLblkI7orr7nva7pooTliLbkvZNcbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhd2FpdCB0aGlzLmdldEFzc2V0SW5mbyhhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICghYXNzZXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICfml6Dms5Xojrflj5bpooTliLbkvZPkv6Hmga8nIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g5Yib5bu656m66IqC54K5XG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVOb2RlKGFyZ3MucGFyZW50VXVpZCwgYXJncy5wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKCFjcmVhdGVSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNyZWF0ZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDlsJ3or5XlsIbpooTliLbkvZPlupTnlKjliLDoioLngrlcbiAgICAgICAgICAgICAgICBjb25zdCBhcHBseVJlc3VsdCA9IGF3YWl0IHRoaXMuYXBwbHlQcmVmYWJUb05vZGUoY3JlYXRlUmVzdWx0LmRhdGEubm9kZVV1aWQsIGFzc2V0SW5mby51dWlkKTtcbiAgICAgICAgICAgICAgICBpZiAoYXBwbHlSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IGNyZWF0ZVJlc3VsdC5kYXRhLm5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNyZWF0ZVJlc3VsdC5kYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+WunuS+i+WMluaIkOWKn++8iOS9v+eUqOWkh+mAieaWueazle+8iSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiAn5peg5rOV5bCG6aKE5Yi25L2T5bqU55So5Yiw6IqC54K5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogY3JlYXRlUmVzdWx0LmRhdGEubm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+W3suWIm+W7uuiKgueCue+8jOS9huaXoOazleW6lOeUqOmihOWItuS9k+aVsOaNridcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGDlpIfpgInlrp7kvovljJbmlrnms5XlpLHotKU6ICR7ZXJyb3J9YCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRBc3NldEluZm8ocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCkudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGFzc2V0SW5mbyk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZU5vZGUocGFyZW50VXVpZD86IHN0cmluZywgcG9zaXRpb24/OiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU5vZGVPcHRpb25zOiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ1ByZWZhYkluc3RhbmNlJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8g6K6+572u54i26IqC54K5XG4gICAgICAgICAgICBpZiAocGFyZW50VXVpZCkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLnBhcmVudCA9IHBhcmVudFV1aWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOiuvue9ruS9jee9rlxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMuZHVtcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnY3JlYXRlLW5vZGUnLCBjcmVhdGVOb2RlT3B0aW9ucykudGhlbigobm9kZVV1aWQ6IHN0cmluZyB8IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXVpZCA9IEFycmF5LmlzQXJyYXkobm9kZVV1aWQpID8gbm9kZVV1aWRbMF0gOiBub2RlVXVpZDtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnUHJlZmFiSW5zdGFuY2UnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAn5Yib5bu66IqC54K55aSx6LSlJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGFwcGx5UHJlZmFiVG9Ob2RlKG5vZGVVdWlkOiBzdHJpbmcsIHByZWZhYlV1aWQ6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8g5bCd6K+V5aSa56eN5pa55rOV5p2l5bqU55So6aKE5Yi25L2T5pWw5o2uXG4gICAgICAgICAgICBjb25zdCBtZXRob2RzID0gW1xuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2FwcGx5LXByZWZhYicsIHsgbm9kZTogbm9kZVV1aWQsIHByZWZhYjogcHJlZmFiVXVpZCB9KSxcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJlZmFiJywgeyBub2RlOiBub2RlVXVpZCwgcHJlZmFiOiBwcmVmYWJVdWlkIH0pLFxuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2xvYWQtcHJlZmFiLXRvLW5vZGUnLCB7IG5vZGU6IG5vZGVVdWlkLCBwcmVmYWI6IHByZWZhYlV1aWQgfSlcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGNvbnN0IHRyeU1ldGhvZCA9IChpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IG1ldGhvZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICfml6Dms5XlupTnlKjpooTliLbkvZPmlbDmja4nIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbWV0aG9kc1tpbmRleF0oKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnlNZXRob2QoaW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRyeU1ldGhvZCgwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDliJvlu7rpooTliLbkvZPnmoTmlrDmlrnms5VcbiAgICAgKiDmt7HluqbmlbTlkIjlvJXmk47nmoTotYTmupDnrqHnkIbns7vnu5/vvIzlrp7njrDlrozmlbTnmoTpooTliLbkvZPliJvlu7rmtYHnqItcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYldpdGhBc3NldERCKG5vZGVVdWlkOiBzdHJpbmcsIHNhdmVQYXRoOiBzdHJpbmcsIHByZWZhYk5hbWU6IHN0cmluZywgaW5jbHVkZUNoaWxkcmVuOiBib29sZWFuLCBpbmNsdWRlQ29tcG9uZW50czogYm9vbGVhbik6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPT09IOS9v+eUqCBBc3NldC1EQiBBUEkg5Yib5bu66aKE5Yi25L2TID09PScpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDoioLngrlVVUlEOiAke25vZGVVdWlkfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDkv53lrZjot6/lvoQ6ICR7c2F2ZVBhdGh9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOmihOWItuS9k+WQjeensDogJHtwcmVmYWJOYW1lfWApO1xuXG4gICAgICAgICAgICAgICAgLy8g56ys5LiA5q2l77ya6I635Y+W6IqC54K55pWw5o2u77yI5YyF5ous5Y+Y5o2i5bGe5oCn77yJXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBhd2FpdCB0aGlzLmdldE5vZGVEYXRhKG5vZGVVdWlkKTtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+aXoOazleiOt+WPluiKgueCueaVsOaNridcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6I635Y+W5Yiw6IqC54K55pWw5o2u77yM5a2Q6IqC54K55pWw6YePOicsIG5vZGVEYXRhLmNoaWxkcmVuID8gbm9kZURhdGEuY2hpbGRyZW4ubGVuZ3RoIDogMCk7XG5cbiAgICAgICAgICAgICAgICAvLyDnrKzkuozmraXvvJrlhYjliJvlu7rotYTmupDmlofku7bku6Xojrflj5blvJXmk47liIbphY3nmoRVVUlEXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WIm+W7uumihOWItuS9k+i1hOa6kOaWh+S7ti4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBQcmVmYWJDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkoW3tcIl9fdHlwZV9fXCI6IFwiY2MuUHJlZmFiXCIsIFwiX25hbWVcIjogcHJlZmFiTmFtZX1dLCBudWxsLCAyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZUFzc2V0V2l0aEFzc2V0REIoc2F2ZVBhdGgsIHRlbXBQcmVmYWJDb250ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoIWNyZWF0ZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3JlYXRlUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOiOt+WPluW8leaTjuWIhumFjeeahOWunumZhVVVSURcbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxQcmVmYWJVdWlkID0gY3JlYXRlUmVzdWx0LmRhdGE/LnV1aWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFhY3R1YWxQcmVmYWJVdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+aXoOazleiOt+WPluW8leaTjuWIhumFjeeahOmihOWItuS9k1VVSUQnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflvJXmk47liIbphY3nmoRVVUlEOicsIGFjdHVhbFByZWZhYlV1aWQpO1xuXG4gICAgICAgICAgICAgICAgLy8g56ys5LiJ5q2l77ya5L2/55So5a6e6ZmFVVVJROmHjeaWsOeUn+aIkOmihOWItuS9k+WGheWuuVxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkNvbnRlbnQgPSBhd2FpdCB0aGlzLmNyZWF0ZVN0YW5kYXJkUHJlZmFiQ29udGVudChub2RlRGF0YSwgcHJlZmFiTmFtZSwgYWN0dWFsUHJlZmFiVXVpZCwgaW5jbHVkZUNoaWxkcmVuLCBpbmNsdWRlQ29tcG9uZW50cyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29udGVudFN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHByZWZhYkNvbnRlbnQsIG51bGwsIDIpO1xuXG4gICAgICAgICAgICAgICAgLy8g56ys5Zub5q2l77ya5pu05paw6aKE5Yi25L2T5paH5Lu25YaF5a65XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+abtOaWsOmihOWItuS9k+aWh+S7tuWGheWuuS4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZVJlc3VsdCA9IGF3YWl0IHRoaXMudXBkYXRlQXNzZXRXaXRoQXNzZXREQihzYXZlUGF0aCwgcHJlZmFiQ29udGVudFN0cmluZyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g56ys5LqU5q2l77ya5Yib5bu65a+55bqU55qEbWV0YeaWh+S7tu+8iOS9v+eUqOWunumZhVVVSUTvvIlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu66aKE5Yi25L2TbWV0YeaWh+S7ti4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50ID0gdGhpcy5jcmVhdGVTdGFuZGFyZE1ldGFDb250ZW50KHByZWZhYk5hbWUsIGFjdHVhbFByZWZhYlV1aWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZU1ldGFXaXRoQXNzZXREQihzYXZlUGF0aCwgbWV0YUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOesrOWFreatpe+8mumHjeaWsOWvvOWFpei1hOa6kOS7peabtOaWsOW8leeUqFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfph43mlrDlr7zlhaXpooTliLbkvZPotYTmupAuLi4nKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWltcG9ydFJlc3VsdCA9IGF3YWl0IHRoaXMucmVpbXBvcnRBc3NldFdpdGhBc3NldERCKHNhdmVQYXRoKTtcblxuICAgICAgICAgICAgICAgIC8vIOesrOS4g+atpe+8muWwneivleWwhuWOn+Wni+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+i1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflsJ3or5XlsIbljp/lp4voioLngrnovazmjaLkuLrpooTliLbkvZPlrp7kvosuLi4nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0UmVzdWx0ID0gYXdhaXQgdGhpcy5jb252ZXJ0Tm9kZVRvUHJlZmFiSW5zdGFuY2Uobm9kZVV1aWQsIGFjdHVhbFByZWZhYlV1aWQsIHNhdmVQYXRoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiVXVpZDogYWN0dWFsUHJlZmFiVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IHNhdmVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiTmFtZTogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnZlcnRlZFRvUHJlZmFiSW5zdGFuY2U6IGNvbnZlcnRSZXN1bHQuc3VjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUFzc2V0UmVzdWx0OiBjcmVhdGVSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVSZXN1bHQ6IHVwZGF0ZVJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFSZXN1bHQ6IG1ldGFSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWltcG9ydFJlc3VsdDogcmVpbXBvcnRSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb252ZXJ0UmVzdWx0OiBjb252ZXJ0UmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY29udmVydFJlc3VsdC5zdWNjZXNzID8gJ+mihOWItuS9k+WIm+W7uuW5tuaIkOWKn+i9rOaNouWOn+Wni+iKgueCuScgOiAn6aKE5Yi25L2T5Yib5bu65oiQ5Yqf77yM5L2G6IqC54K56L2s5o2i5aSx6LSlJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yib5bu66aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg5Yib5bu66aKE5Yi25L2T5aSx6LSlOiAke2Vycm9yfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVQcmVmYWIoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIOaUr+aMgSBwcmVmYWJQYXRoIOWSjCBzYXZlUGF0aCDkuKTnp43lj4LmlbDlkI1cbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoUGFyYW0gPSBhcmdzLnByZWZhYlBhdGggfHwgYXJncy5zYXZlUGF0aDtcbiAgICAgICAgICAgICAgICBpZiAoIXBhdGhQYXJhbSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfnvLrlsJHpooTliLbkvZPot6/lvoTlj4LmlbDjgILor7fmj5DkvpsgcHJlZmFiUGF0aCDmiJYgc2F2ZVBhdGjjgIInXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiTmFtZSA9IGFyZ3MucHJlZmFiTmFtZSB8fCAnTmV3UHJlZmFiJztcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGhQYXJhbS5lbmRzV2l0aCgnLnByZWZhYicpID8gXG4gICAgICAgICAgICAgICAgICAgIHBhdGhQYXJhbSA6IGAke3BhdGhQYXJhbX0vJHtwcmVmYWJOYW1lfS5wcmVmYWJgO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaW5jbHVkZUNoaWxkcmVuID0gYXJncy5pbmNsdWRlQ2hpbGRyZW4gIT09IGZhbHNlOyAvLyDpu5jorqTkuLogdHJ1ZVxuICAgICAgICAgICAgICAgIGNvbnN0IGluY2x1ZGVDb21wb25lbnRzID0gYXJncy5pbmNsdWRlQ29tcG9uZW50cyAhPT0gZmFsc2U7IC8vIOm7mOiupOS4uiB0cnVlXG5cbiAgICAgICAgICAgICAgICAvLyDkvJjlhYjkvb/nlKjmlrDnmoQgYXNzZXQtZGIg5pa55rOV5Yib5bu66aKE5Yi25L2TXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+S9v+eUqOaWsOeahCBhc3NldC1kYiDmlrnms5XliJvlu7rpooTliLbkvZMuLi4nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldERiUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWJXaXRoQXNzZXREQihcbiAgICAgICAgICAgICAgICAgICAgYXJncy5ub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYk5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVDaGlsZHJlbixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0RGJSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGFzc2V0RGJSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6cIGFzc2V0LWRiIOaWueazleWksei0pe+8jOWwneivleS9v+eUqENvY29zIENyZWF0b3LnmoTljp/nlJ/pooTliLbkvZPliJvlu7pBUElcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXNzZXQtZGIg5pa55rOV5aSx6LSl77yM5bCd6K+V5Y6f55SfQVBJLi4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmF0aXZlUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWJOYXRpdmUoYXJncy5ub2RlVXVpZCwgZnVsbFBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChuYXRpdmVSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5hdGl2ZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzljp/nlJ9BUEnlpLHotKXvvIzkvb/nlKjoh6rlrprkuYnlrp7njrBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Y6f55SfQVBJ5aSx6LSl77yM5L2/55So6Ieq5a6a5LmJ5a6e546wLi4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWJDdXN0b20oYXJncy5ub2RlVXVpZCwgZnVsbFBhdGgsIHByZWZhYk5hbWUpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoY3VzdG9tUmVzdWx0KTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg5Yib5bu66aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVQcmVmYWJOYXRpdmUobm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyDmoLnmja7lrpjmlrlBUEnmlofmoaPvvIzkuI3lrZjlnKjnm7TmjqXnmoTpooTliLbkvZPliJvlu7pBUElcbiAgICAgICAgICAgIC8vIOmihOWItuS9k+WIm+W7uumcgOimgeaJi+WKqOWcqOe8lui+keWZqOS4reWujOaIkFxuICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6ICfljp/nlJ/pooTliLbkvZPliJvlu7pBUEnkuI3lrZjlnKgnLFxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiAn5qC55o2uQ29jb3MgQ3JlYXRvcuWumOaWuUFQSeaWh+aho++8jOmihOWItuS9k+WIm+W7uumcgOimgeaJi+WKqOaTjeS9nO+8mlxcbjEuIOWcqOWcuuaZr+S4remAieaLqeiKgueCuVxcbjIuIOWwhuiKgueCueaLluaLveWIsOi1hOa6kOeuoeeQhuWZqOS4rVxcbjMuIOaIluWPs+mUruiKgueCuemAieaLqVwi55Sf5oiQ6aKE5Yi25L2TXCInXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVQcmVmYWJDdXN0b20obm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiUGF0aDogc3RyaW5nLCBwcmVmYWJOYW1lOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gMS4g6I635Y+W5rqQ6IqC54K555qE5a6M5pW05pWw5o2uXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBhd2FpdCB0aGlzLmdldE5vZGVEYXRhKG5vZGVVdWlkKTtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOaXoOazleaJvuWIsOiKgueCuTogJHtub2RlVXVpZH1gXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gMi4g55Sf5oiQ6aKE5Yi25L2TVVVJRFxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYlV1aWQgPSB0aGlzLmdlbmVyYXRlVVVJRCgpO1xuXG4gICAgICAgICAgICAgICAgLy8gMy4g5Yib5bu66aKE5Yi25L2T5pWw5o2u57uT5p6EXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiRGF0YSA9IHRoaXMuY3JlYXRlUHJlZmFiRGF0YShub2RlRGF0YSwgcHJlZmFiTmFtZSwgcHJlZmFiVXVpZCk7XG5cbiAgICAgICAgICAgICAgICAvLyA0LiDln7rkuo7lrpjmlrnmoLzlvI/liJvlu7rpooTliLbkvZPmlbDmja7nu5PmnoRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPT09IOW8gOWni+WIm+W7uumihOWItuS9kyA9PT0nKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6IqC54K55ZCN56ewOicsIG5vZGVEYXRhLm5hbWU/LnZhbHVlIHx8ICfmnKrnn6UnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6IqC54K5VVVJRDonLCBub2RlRGF0YS51dWlkPy52YWx1ZSB8fCAn5pyq55+lJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+mihOWItuS9k+S/neWtmOi3r+W+hDonLCBwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL5Yib5bu66aKE5Yi25L2T77yM6IqC54K55pWw5o2uOmAsIG5vZGVEYXRhKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJKc29uRGF0YSA9IGF3YWl0IHRoaXMuY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhLCBwcmVmYWJOYW1lLCBwcmVmYWJVdWlkLCB0cnVlLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIC8vIDUuIOWIm+W7uuagh+WHhm1ldGHmlofku7bmlbDmja5cbiAgICAgICAgICAgICAgICBjb25zdCBzdGFuZGFyZE1ldGFEYXRhID0gdGhpcy5jcmVhdGVTdGFuZGFyZE1ldGFEYXRhKHByZWZhYk5hbWUsIHByZWZhYlV1aWQpO1xuXG4gICAgICAgICAgICAgICAgLy8gNi4g5L+d5a2Y6aKE5Yi25L2T5ZKMbWV0YeaWh+S7tlxuICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVSZXN1bHQgPSBhd2FpdCB0aGlzLnNhdmVQcmVmYWJXaXRoTWV0YShwcmVmYWJQYXRoLCBwcmVmYWJKc29uRGF0YSwgc3RhbmRhcmRNZXRhRGF0YSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2F2ZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOS/neWtmOaIkOWKn+WQju+8jOWwhuWOn+Wni+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+i1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0UmVzdWx0ID0gYXdhaXQgdGhpcy5jb252ZXJ0Tm9kZVRvUHJlZmFiSW5zdGFuY2Uobm9kZVV1aWQsIHByZWZhYlBhdGgsIHByZWZhYlV1aWQpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlV1aWQ6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiTmFtZTogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZWRUb1ByZWZhYkluc3RhbmNlOiBjb252ZXJ0UmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY29udmVydFJlc3VsdC5zdWNjZXNzID8gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfoh6rlrprkuYnpooTliLbkvZPliJvlu7rmiJDlip/vvIzljp/lp4voioLngrnlt7LovazmjaLkuLrpooTliLbkvZPlrp7kvosnIDogXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfpooTliLbkvZPliJvlu7rmiJDlip/vvIzkvYboioLngrnovazmjaLlpLHotKUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogc2F2ZVJlc3VsdC5lcnJvciB8fCAn5L+d5a2Y6aKE5Yi25L2T5paH5Lu25aSx6LSlJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOWIm+W7uumihOWItuS9k+aXtuWPkeeUn+mUmeivrzogJHtlcnJvcn1gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2V0Tm9kZURhdGEobm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyDpppblhYjojrflj5bln7rmnKzoioLngrnkv6Hmga9cbiAgICAgICAgICAgICAgICBjb25zdCBub2RlSW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBub2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlSW5mbykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiOt+WPluiKgueCuSAke25vZGVVdWlkfSDnmoTln7rmnKzkv6Hmga/miJDlip9gKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDkvb/nlKhxdWVyeS1ub2RlLXRyZWXojrflj5bljIXlkKvlrZDoioLngrnnmoTlrozmlbTnu5PmnoRcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlVHJlZSA9IGF3YWl0IHRoaXMuZ2V0Tm9kZVdpdGhDaGlsZHJlbihub2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVUcmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDojrflj5boioLngrkgJHtub2RlVXVpZH0g55qE5a6M5pW05qCR57uT5p6E5oiQ5YqfYCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobm9kZVRyZWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDkvb/nlKjln7rmnKzoioLngrnkv6Hmga9gKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShub2RlSW5mbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYOiOt+WPluiKgueCueaVsOaNruWksei0pSAke25vZGVVdWlkfTpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5L2/55SocXVlcnktbm9kZS10cmVl6I635Y+W5YyF5ZCr5a2Q6IqC54K555qE5a6M5pW06IqC54K557uT5p6EXG4gICAgcHJpdmF0ZSBhc3luYyBnZXROb2RlV2l0aENoaWxkcmVuKG5vZGVVdWlkOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g6I635Y+W5pW05Liq5Zy65pmv5qCRXG4gICAgICAgICAgICBjb25zdCB0cmVlID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZS10cmVlJyk7XG4gICAgICAgICAgICBpZiAoIXRyZWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5Zyo5qCR5Lit5p+l5om+5oyH5a6a55qE6IqC54K5XG4gICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlID0gdGhpcy5maW5kTm9kZUluVHJlZSh0cmVlLCBub2RlVXVpZCk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0Tm9kZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlnKjlnLrmma/moJHkuK3mib7liLDoioLngrkgJHtub2RlVXVpZH3vvIzlrZDoioLngrnmlbDph486ICR7dGFyZ2V0Tm9kZS5jaGlsZHJlbiA/IHRhcmdldE5vZGUuY2hpbGRyZW4ubGVuZ3RoIDogMH1gKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlop7lvLroioLngrnmoJHvvIzojrflj5bmr4/kuKroioLngrnnmoTmraPnoa7nu4Tku7bkv6Hmga9cbiAgICAgICAgICAgICAgICBjb25zdCBlbmhhbmNlZFRyZWUgPSBhd2FpdCB0aGlzLmVuaGFuY2VUcmVlV2l0aE1DUENvbXBvbmVudHModGFyZ2V0Tm9kZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuaGFuY2VkVHJlZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYOiOt+WPluiKgueCueagkee7k+aehOWksei0pSAke25vZGVVdWlkfTpgLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWcqOiKgueCueagkeS4remAkuW9kuafpeaJvuaMh+WumlVVSUTnmoToioLngrlcbiAgICBwcml2YXRlIGZpbmROb2RlSW5UcmVlKG5vZGU6IGFueSwgdGFyZ2V0VXVpZDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeW9k+WJjeiKgueCuVxuICAgICAgICBpZiAobm9kZS51dWlkID09PSB0YXJnZXRVdWlkIHx8IG5vZGUudmFsdWU/LnV1aWQgPT09IHRhcmdldFV1aWQpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6YCS5b2S5qOA5p+l5a2Q6IqC54K5XG4gICAgICAgIGlmIChub2RlLmNoaWxkcmVuICYmIEFycmF5LmlzQXJyYXkobm9kZS5jaGlsZHJlbikpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvdW5kID0gdGhpcy5maW5kTm9kZUluVHJlZShjaGlsZCwgdGFyZ2V0VXVpZCk7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDkvb/nlKggRWRpdG9yIEFQSSDlop7lvLroioLngrnmoJHvvIzojrflj5bmraPnoa7nmoTnu4Tku7bkv6Hmga/vvIhjaWQg6ICM6Z2e57G75ZCN77yJ44CCXG4gICAgICog5pu/5Luj5LmL5YmN55qEIEhUVFAg6Ieq6LCD55So5pa55qGI77yI56uv5Y+j56Gs57yW56CBIDg1ODUg5LiN5Y+v6Z2g77yJ44CCXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBlbmhhbmNlVHJlZVdpdGhNQ1BDb21wb25lbnRzKG5vZGU6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS51dWlkKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBub2RlLnV1aWQpO1xuICAgICAgICAgICAgaWYgKG5vZGVEYXRhICYmIG5vZGVEYXRhLl9fY29tcHNfXyAmJiBub2RlRGF0YS5fX2NvbXBzX18ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIOWwhiBfX2NvbXBzX18g6L2s5o2i5Li6566A5YyW55qEIGNvbXBvbmVudHMg57uT5p6E77yI5LiOIGNvbXBvbmVudC10b29scy5nZXRDb21wb25lbnRzIOS4gOiHtO+8iVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBub2RlRGF0YS5fX2NvbXBzX18ubWFwKChjb21wOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcHM6IGFueSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAvLyDmj5Dlj5bnu4Tku7blsZ7mgKfvvIjopobnm5bluLjop4HlrZfmrrXvvIlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXAudmFsdWUgJiYgdHlwZW9mIGNvbXAudmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhjb21wLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDlhbzlrrnvvJrlpoLmnpwgY29tcCDmmK8gZmxhdCBvYmplY3TvvIjlt7Lnu4/ljIXlkKvlsZ7mgKfvvIlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoY29tcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrID09PSAnX190eXBlX18nIHx8IGsgPT09ICdjaWQnIHx8IGsgPT09ICd1dWlkJyB8fCBrID09PSAnZW5hYmxlZCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGsuc3RhcnRzV2l0aCgnXycpKSBjb250aW51ZTsgLy8g6Lez6L+H5YaF6YOo5a2X5q61XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXByb3BzW2tdKSBwcm9wc1trXSA9IGNvbXBba107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcFV1aWQgPSBwcm9wcz8udXVpZD8udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjb21wLl9fdHlwZV9fIHx8IGNvbXAuY2lkIHx8ICdVbmtub3duJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHByb3BVdWlkIHx8IGNvbXAudXVpZD8udmFsdWUgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGNvbXAuZW5hYmxlZCAhPT0gdW5kZWZpbmVkID8gY29tcC5lbmFibGVkIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BzXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbm9kZS5jb21wb25lbnRzID0gY29tcG9uZW50cztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6IqC54K5ICR7bm9kZS51dWlkfSDojrflj5bliLAgJHtjb21wb25lbnRzLmxlbmd0aH0g5Liq57uE5Lu277yI5ZCr5q2j56GuIGNpZO+8iWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGDojrflj5boioLngrkgJHtub2RlLnV1aWR9IOeahOe7hOS7tuS/oeaBr+Wksei0pTpgLCBlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpgJLlvZLlpITnkIblrZDoioLngrlcbiAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgQXJyYXkuaXNBcnJheShub2RlLmNoaWxkcmVuKSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbltpXSA9IGF3YWl0IHRoaXMuZW5oYW5jZVRyZWVXaXRoTUNQQ29tcG9uZW50cyhub2RlLmNoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgYnVpbGRCYXNpY05vZGVJbmZvKG5vZGVVdWlkOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIC8vIOaehOW7uuWfuuacrOeahOiKgueCueS/oeaBr1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKS50aGVuKChub2RlSW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlSW5mbykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g566A5YyW54mI5pys77ya5Y+q6L+U5Zue5Z+65pys6IqC54K55L+h5oGv77yM5LiN6I635Y+W5a2Q6IqC54K55ZKM57uE5Lu2XG4gICAgICAgICAgICAgICAgLy8g6L+Z5Lqb5L+h5oGv5bCG5Zyo5ZCO57ut55qE6aKE5Yi25L2T5aSE55CG5Lit5qC55o2u6ZyA6KaB5re75YqgXG4gICAgICAgICAgICAgICAgY29uc3QgYmFzaWNJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5ub2RlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShiYXNpY0luZm8pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g6aqM6K+B6IqC54K55pWw5o2u5piv5ZCm5pyJ5pWIXG4gICAgcHJpdmF0ZSBpc1ZhbGlkTm9kZURhdGEobm9kZURhdGE6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIW5vZGVEYXRhKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZURhdGEgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6Xln7rmnKzlsZ7mgKcgLSDpgILphY1xdWVyeS1ub2RlLXRyZWXnmoTmlbDmja7moLzlvI9cbiAgICAgICAgcmV0dXJuIG5vZGVEYXRhLmhhc093blByb3BlcnR5KCd1dWlkJykgfHwgXG4gICAgICAgICAgICAgICBub2RlRGF0YS5oYXNPd25Qcm9wZXJ0eSgnbmFtZScpIHx8IFxuICAgICAgICAgICAgICAgbm9kZURhdGEuaGFzT3duUHJvcGVydHkoJ19fdHlwZV9fJykgfHxcbiAgICAgICAgICAgICAgIChub2RlRGF0YS52YWx1ZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgbm9kZURhdGEudmFsdWUuaGFzT3duUHJvcGVydHkoJ3V1aWQnKSB8fFxuICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlLmhhc093blByb3BlcnR5KCduYW1lJykgfHxcbiAgICAgICAgICAgICAgICAgICBub2RlRGF0YS52YWx1ZS5oYXNPd25Qcm9wZXJ0eSgnX190eXBlX18nKVxuICAgICAgICAgICAgICAgKSk7XG4gICAgfVxuXG4gICAgLy8g5o+Q5Y+W5a2Q6IqC54K5VVVJROeahOe7n+S4gOaWueazlVxuICAgIHByaXZhdGUgZXh0cmFjdENoaWxkVXVpZChjaGlsZFJlZjogYW55KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGlmICghY2hpbGRSZWYpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8g5pa55rOVMTog55u05o6l5a2X56ym5LiyXG4gICAgICAgIGlmICh0eXBlb2YgY2hpbGRSZWYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRSZWY7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaWueazlTI6IHZhbHVl5bGe5oCn5YyF5ZCr5a2X56ym5LiyXG4gICAgICAgIGlmIChjaGlsZFJlZi52YWx1ZSAmJiB0eXBlb2YgY2hpbGRSZWYudmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRSZWYudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaWueazlTM6IHZhbHVlLnV1aWTlsZ7mgKdcbiAgICAgICAgaWYgKGNoaWxkUmVmLnZhbHVlICYmIGNoaWxkUmVmLnZhbHVlLnV1aWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZi52YWx1ZS51dWlkO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnms5U0OiDnm7TmjqV1dWlk5bGe5oCnXG4gICAgICAgIGlmIChjaGlsZFJlZi51dWlkKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRSZWYudXVpZDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pa55rOVNTogX19pZF9f5byV55SoIC0g6L+Z56eN5oOF5Ya16ZyA6KaB54m55q6K5aSE55CGXG4gICAgICAgIGlmIChjaGlsZFJlZi5fX2lkX18gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWPkeeOsF9faWRfX+W8leeUqDogJHtjaGlsZFJlZi5fX2lkX19977yM5Y+v6IO96ZyA6KaB5LuO5pWw5o2u57uT5p6E5Lit5p+l5om+YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8g5pqC5pe26L+U5ZuebnVsbO+8jOWQjue7reWPr+S7pea3u+WKoOW8leeUqOino+aekOmAu+i+kVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLndhcm4oJ+aXoOazleaPkOWPluWtkOiKgueCuVVVSUQ6JywgSlNPTi5zdHJpbmdpZnkoY2hpbGRSZWYpKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8g6I635Y+W6ZyA6KaB5aSE55CG55qE5a2Q6IqC54K55pWw5o2uXG4gICAgcHJpdmF0ZSBnZXRDaGlsZHJlblRvUHJvY2Vzcyhub2RlRGF0YTogYW55KTogYW55W10ge1xuICAgICAgICBjb25zdCBjaGlsZHJlbjogYW55W10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaWueazlTE6IOebtOaOpeS7jmNoaWxkcmVu5pWw57uE6I635Y+W77yI5LuOcXVlcnktbm9kZS10cmVl6L+U5Zue55qE5pWw5o2u77yJXG4gICAgICAgIGlmIChub2RlRGF0YS5jaGlsZHJlbiAmJiBBcnJheS5pc0FycmF5KG5vZGVEYXRhLmNoaWxkcmVuKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOS7jmNoaWxkcmVu5pWw57uE6I635Y+W5a2Q6IqC54K577yM5pWw6YePOiAke25vZGVEYXRhLmNoaWxkcmVuLmxlbmd0aH1gKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZURhdGEuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAvLyBxdWVyeS1ub2RlLXRyZWXov5Tlm57nmoTlrZDoioLngrnpgJrluLjlt7Lnu4/mmK/lrozmlbTnmoTmlbDmja7nu5PmnoRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1ZhbGlkTm9kZURhdGEoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5re75Yqg5a2Q6IqC54K5OiAke2NoaWxkLm5hbWUgfHwgY2hpbGQudmFsdWU/Lm5hbWUgfHwgJ+acquefpSd9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WtkOiKgueCueaVsOaNruaXoOaViDonLCBKU09OLnN0cmluZ2lmeShjaGlsZCwgbnVsbCwgMikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfoioLngrnmsqHmnInlrZDoioLngrnmiJZjaGlsZHJlbuaVsOe7hOS4uuepuicpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVVVSUQoKTogc3RyaW5nIHtcbiAgICAgICAgLy8g55Sf5oiQ56ym5ZCIQ29jb3MgQ3JlYXRvcuagvOW8j+eahFVVSURcbiAgICAgICAgY29uc3QgY2hhcnMgPSAnMDEyMzQ1Njc4OWFiY2RlZic7XG4gICAgICAgIGxldCB1dWlkID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzI7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPT09IDggfHwgaSA9PT0gMTIgfHwgaSA9PT0gMTYgfHwgaSA9PT0gMjApIHtcbiAgICAgICAgICAgICAgICB1dWlkICs9ICctJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHV1aWQgKz0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcnMubGVuZ3RoKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHV1aWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVQcmVmYWJEYXRhKG5vZGVEYXRhOiBhbnksIHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogYW55W10ge1xuICAgICAgICAvLyDliJvlu7rmoIflh4bnmoTpooTliLbkvZPmlbDmja7nu5PmnoRcbiAgICAgICAgY29uc3QgcHJlZmFiQXNzZXQgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUHJlZmFiXCIsXG4gICAgICAgICAgICBcIl9uYW1lXCI6IHByZWZhYk5hbWUsXG4gICAgICAgICAgICBcIl9vYmpGbGFnc1wiOiAwLFxuICAgICAgICAgICAgXCJfX2VkaXRvckV4dHJhc19fXCI6IHt9LFxuICAgICAgICAgICAgXCJfbmF0aXZlXCI6IFwiXCIsXG4gICAgICAgICAgICBcImRhdGFcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIm9wdGltaXphdGlvblBvbGljeVwiOiAwLFxuICAgICAgICAgICAgXCJwZXJzaXN0ZW50XCI6IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8g5aSE55CG6IqC54K55pWw5o2u77yM56Gu5L+d56ym5ZCI6aKE5Yi25L2T5qC85byPXG4gICAgICAgIGNvbnN0IHByb2Nlc3NlZE5vZGVEYXRhID0gdGhpcy5wcm9jZXNzTm9kZUZvclByZWZhYihub2RlRGF0YSwgcHJlZmFiVXVpZCk7XG5cbiAgICAgICAgcmV0dXJuIFtwcmVmYWJBc3NldCwgLi4ucHJvY2Vzc2VkTm9kZURhdGFdO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHJvY2Vzc05vZGVGb3JQcmVmYWIobm9kZURhdGE6IGFueSwgcHJlZmFiVXVpZDogc3RyaW5nKTogYW55W10ge1xuICAgICAgICAvLyDlpITnkIboioLngrnmlbDmja7ku6XnrKblkIjpooTliLbkvZPmoLzlvI9cbiAgICAgICAgY29uc3QgcHJvY2Vzc2VkRGF0YTogYW55W10gPSBbXTtcbiAgICAgICAgbGV0IGlkQ291bnRlciA9IDE7XG5cbiAgICAgICAgLy8g6YCS5b2S5aSE55CG6IqC54K55ZKM57uE5Lu2XG4gICAgICAgIGNvbnN0IHByb2Nlc3NOb2RlID0gKG5vZGU6IGFueSwgcGFyZW50SWQ6IG51bWJlciA9IDApOiBudW1iZXIgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gaWRDb3VudGVyKys7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWIm+W7uuiKgueCueWvueixoVxuICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkTm9kZSA9IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuTm9kZVwiLFxuICAgICAgICAgICAgICAgIFwiX25hbWVcIjogbm9kZS5uYW1lIHx8IFwiTm9kZVwiLFxuICAgICAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICAgICAgXCJfX2VkaXRvckV4dHJhc19fXCI6IHt9LFxuICAgICAgICAgICAgICAgIFwiX3BhcmVudFwiOiBwYXJlbnRJZCA+IDAgPyB7IFwiX19pZF9fXCI6IHBhcmVudElkIH0gOiBudWxsLFxuICAgICAgICAgICAgICAgIFwiX2NoaWxkcmVuXCI6IG5vZGUuY2hpbGRyZW4gPyBub2RlLmNoaWxkcmVuLm1hcCgoKSA9PiAoeyBcIl9faWRfX1wiOiBpZENvdW50ZXIrKyB9KSkgOiBbXSxcbiAgICAgICAgICAgICAgICBcIl9hY3RpdmVcIjogbm9kZS5hY3RpdmUgIT09IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwiX2NvbXBvbmVudHNcIjogbm9kZS5jb21wb25lbnRzID8gbm9kZS5jb21wb25lbnRzLm1hcCgoKSA9PiAoeyBcIl9faWRfX1wiOiBpZENvdW50ZXIrKyB9KSkgOiBbXSxcbiAgICAgICAgICAgICAgICBcIl9wcmVmYWJcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBpZENvdW50ZXIrK1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJfbHBvc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ6XCI6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiX2xyb3RcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUXVhdFwiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcIndcIjogMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJfbHNjYWxlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDEsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxLFxuICAgICAgICAgICAgICAgICAgICBcInpcIjogMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJfbW9iaWxpdHlcIjogMCxcbiAgICAgICAgICAgICAgICBcIl9sYXllclwiOiAxMDczNzQxODI0LFxuICAgICAgICAgICAgICAgIFwiX2V1bGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcInpcIjogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJfaWRcIjogXCJcIlxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcHJvY2Vzc2VkRGF0YS5wdXNoKHByb2Nlc3NlZE5vZGUpO1xuXG4gICAgICAgICAgICAvLyDlpITnkIbnu4Tku7ZcbiAgICAgICAgICAgIGlmIChub2RlLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICBub2RlLmNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50SWQgPSBpZENvdW50ZXIrKztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkQ29tcG9uZW50cyA9IHRoaXMucHJvY2Vzc0NvbXBvbmVudEZvclByZWZhYihjb21wb25lbnQsIGNvbXBvbmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkRGF0YS5wdXNoKC4uLnByb2Nlc3NlZENvbXBvbmVudHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlpITnkIblrZDoioLngrlcbiAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NOb2RlKGNoaWxkLCBub2RlSWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbm9kZUlkO1xuICAgICAgICB9O1xuXG4gICAgICAgIHByb2Nlc3NOb2RlKG5vZGVEYXRhKTtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NlZERhdGE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzQ29tcG9uZW50Rm9yUHJlZmFiKGNvbXBvbmVudDogYW55LCBjb21wb25lbnRJZDogbnVtYmVyKTogYW55W10ge1xuICAgICAgICAvLyDlpITnkIbnu4Tku7bmlbDmja7ku6XnrKblkIjpooTliLbkvZPmoLzlvI9cbiAgICAgICAgY29uc3QgcHJvY2Vzc2VkQ29tcG9uZW50ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBjb21wb25lbnQudHlwZSB8fCBcImNjLkNvbXBvbmVudFwiLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwibm9kZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogY29tcG9uZW50SWQgLSAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfZW5hYmxlZFwiOiBjb21wb25lbnQuZW5hYmxlZCAhPT0gZmFsc2UsXG4gICAgICAgICAgICBcIl9fcHJlZmFiXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjb21wb25lbnRJZCArIDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAuLi5jb21wb25lbnQucHJvcGVydGllc1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOa3u+WKoOe7hOS7tueJueWumueahOmihOWItuS9k+S/oeaBr1xuICAgICAgICBjb25zdCBjb21wUHJlZmFiSW5mbyA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5Db21wUHJlZmFiSW5mb1wiLFxuICAgICAgICAgICAgXCJmaWxlSWRcIjogdGhpcy5nZW5lcmF0ZUZpbGVJZCgpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIFtwcm9jZXNzZWRDb21wb25lbnQsIGNvbXBQcmVmYWJJbmZvXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlRmlsZUlkKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIOeUn+aIkOaWh+S7tklE77yI566A5YyW54mI5pys77yJXG4gICAgICAgIGNvbnN0IGNoYXJzID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVowMTIzNDU2Nzg5Ky8nO1xuICAgICAgICBsZXQgZmlsZUlkID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjI7IGkrKykge1xuICAgICAgICAgICAgZmlsZUlkICs9IGNoYXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNoYXJzLmxlbmd0aCldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlSWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVNZXRhRGF0YShwcmVmYWJOYW1lOiBzdHJpbmcsIHByZWZhYlV1aWQ6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcInZlclwiOiBcIjEuMS41MFwiLFxuICAgICAgICAgICAgXCJpbXBvcnRlclwiOiBcInByZWZhYlwiLFxuICAgICAgICAgICAgXCJpbXBvcnRlZFwiOiB0cnVlLFxuICAgICAgICAgICAgXCJ1dWlkXCI6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICBcImZpbGVzXCI6IFtcbiAgICAgICAgICAgICAgICBcIi5qc29uXCJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcInN1Yk1ldGFzXCI6IHt9LFxuICAgICAgICAgICAgXCJ1c2VyRGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJzeW5jTm9kZU5hbWVcIjogcHJlZmFiTmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc2F2ZVByZWZhYkZpbGVzKHByZWZhYlBhdGg6IHN0cmluZywgcHJlZmFiRGF0YTogYW55W10sIG1ldGFEYXRhOiBhbnkpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8g5L2/55SoRWRpdG9yIEFQSeS/neWtmOmihOWItuS9k+aWh+S7tlxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShwcmVmYWJEYXRhLCBudWxsLCAyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KG1ldGFEYXRhLCBudWxsLCAyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlsJ3or5Xkvb/nlKjmm7Tlj6/pnaDnmoTkv53lrZjmlrnms5VcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVBc3NldEZpbGUocHJlZmFiUGF0aCwgcHJlZmFiQ29udGVudCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOWGjeWIm+W7um1ldGHmlofku7ZcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWV0YVBhdGggPSBgJHtwcmVmYWJQYXRofS5tZXRhYDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2F2ZUFzc2V0RmlsZShtZXRhUGF0aCwgbWV0YUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfkv53lrZjpooTliLbkvZPmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBg5L+d5a2Y5paH5Lu25pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yfWAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc2F2ZUFzc2V0RmlsZShmaWxlUGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIC8vIOWwneivleWkmuenjeS/neWtmOaWueazlVxuICAgICAgICAgICAgY29uc3Qgc2F2ZU1ldGhvZHMgPSBbXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnY3JlYXRlLWFzc2V0JywgZmlsZVBhdGgsIGNvbnRlbnQpLFxuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3NhdmUtYXNzZXQnLCBmaWxlUGF0aCwgY29udGVudCksXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnd3JpdGUtYXNzZXQnLCBmaWxlUGF0aCwgY29udGVudClcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGNvbnN0IHRyeVNhdmUgPSAoaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBzYXZlTWV0aG9kcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcign5omA5pyJ5L+d5a2Y5pa55rOV6YO95aSx6LSl5LqGJykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2F2ZU1ldGhvZHNbaW5kZXhdKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeVNhdmUoaW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRyeVNhdmUoMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlUHJlZmFiKHByZWZhYlBhdGg6IHN0cmluZywgbm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFByZWZhYiBub3QgZm91bmQ6ICR7cHJlZmFiUGF0aH1gIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gMS4g5qCh6aqM6IqC54K55piv5ZCm5Li6IHByZWZhYiDlrp7kvovvvIjlv4XpobvmmK8gaW5zdGFudGlhdGUg5Ye65p2l55qE77yJXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZUluZm86IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBub2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlSW5mbykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgTm9kZSBub3QgZm91bmQ6ICR7bm9kZVV1aWR9YCB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJSZWYgPSBub2RlSW5mby5fX3ByZWZhYl9fIHx8IG5vZGVJbmZvLnByZWZhYiB8fCAobm9kZUluZm8udmFsdWUgJiYgKG5vZGVJbmZvLnZhbHVlLl9fcHJlZmFiX18gfHwgbm9kZUluZm8udmFsdWUucHJlZmFiKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwcmVmYWJSZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBg6IqC54K5ICR7bm9kZVV1aWR9IOS4jeaYr+mihOWItuS9k+WunuS+i+OAgnVwZGF0ZV9wcmVmYWIg5LuF5a+55bey5a6e5L6L5YyW55qEIHByZWZhYiDmoLnoioLngrnnlJ/mlYjjgILor7flhYjnlKggaW5zdGFudGlhdGVfcHJlZmFiIOWIm+W7uuWunuS+i++8jOS/ruaUueWQjuWGjeasoeiwg+eUqOOAgmBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyAyLiDor7vlj5bmm7TmlrDliY3nmoTmlofku7blhoXlrrnvvIjnlKjkuo4gZGlmZu+8iVxuICAgICAgICAgICAgICAgIGxldCBiZWZvcmVTaXplID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgYmVmb3JlSGFzaCA9ICcnO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc2tQYXRoOiBhbnkgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1wYXRoJywgYXNzZXRJbmZvLnVybCB8fCBwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGRpc2tQYXRoPy5maWxlIHx8IGRpc2tQYXRoPy5wYXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGggJiYgZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVmb3JlU2l6ZSA9IGNvbnRlbnQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmVIYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTEnKS51cGRhdGUoY29udGVudCkuZGlnZXN0KCdoZXgnKS5zbGljZSgwLCA4KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuXG4gICAgICAgICAgICAgICAgLy8gMy4g5omn6KGMIGFwcGx5LXByZWZhYlxuICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2FwcGx5LXByZWZhYicsIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZTogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYjogYXNzZXRJbmZvLnV1aWRcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIOetieW+hSBhc3NldC1kYiDlrozmiJDlhpnlhaVcbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMjAwKSk7XG5cbiAgICAgICAgICAgICAgICAvLyA0LiDor7vlj5bmm7TmlrDlkI7nmoTmlofku7blhoXlrrnvvIzorqHnrpcgZGlmZiDmkZjopoFcbiAgICAgICAgICAgICAgICBsZXQgYWZ0ZXJTaXplID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgYWZ0ZXJIYXNoID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IHNpemVEaWZmID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc2tQYXRoOiBhbnkgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1wYXRoJywgYXNzZXRJbmZvLnVybCB8fCBwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGRpc2tQYXRoPy5maWxlIHx8IGRpc2tQYXRoPy5wYXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGggJiYgZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZnRlclNpemUgPSBjb250ZW50Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXJIYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTEnKS51cGRhdGUoY29udGVudCkuZGlnZXN0KCdoZXgnKS5zbGljZSgwLCA4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVEaWZmID0gYWZ0ZXJTaXplIC0gYmVmb3JlU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSBiZWZvcmVIYXNoICE9PSBhZnRlckhhc2g7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cblxuICAgICAgICAgICAgICAgIC8vIDUuIOmHjeaWsOivu+WPliBwcmVmYWIg5YaF5a6577yM57uf6K6h6IqC54K5L+e7hOS7tuaVsFxuICAgICAgICAgICAgICAgIGxldCBzdGF0cyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWZ0ZXJEYXRhID0gYXdhaXQgdGhpcy5yZWFkUHJlZmFiRmlsZShwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5jID0gMCwgY2MgPSAwLCBzYyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiAoYWZ0ZXJEYXRhIGFzIGFueVtdKSB8fCBbXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGl0ZW0/Ll9fdHlwZV9fIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHQgPT09ICdjYy5Ob2RlJykgbmMrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHQgPT09ICdjYy5NaXNzaW5nU2NyaXB0JykgeyBjYysrOyBzYysrOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0ICYmICF0LnN0YXJ0c1dpdGgoJ2NjLicpKSB7IGNjKys7IHNjKys7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHQpIGNjKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdHMgPSB7IG5vZGVzOiBuYywgY29tcG9uZW50czogY2MsIGN1c3RvbVNjcmlwdHM6IHNjIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hhbmdlZCA/ICdQcmVmYWIgdXBkYXRlZCBzdWNjZXNzZnVsbHknIDogJ2FwcGx5LXByZWZhYiDlt7LmiafooYzkvYYgcHJlZmFiIOaWh+S7tuaXoOWPmOWMlu+8iOWPr+iDveWcuuaZr+ayoeacieWunui0qOS/ruaUue+8iScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmU6IHsgc2l6ZTogYmVmb3JlU2l6ZSwgaGFzaDogYmVmb3JlSGFzaCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXI6IHsgc2l6ZTogYWZ0ZXJTaXplLCBoYXNoOiBhZnRlckhhc2ggfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVEaWZmLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB8fCBTdHJpbmcoZXJyKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZXZlcnRQcmVmYWIobm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncmV2ZXJ0LXByZWZhYicsIHtcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlVXVpZFxuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmYWIgaW5zdGFuY2UgcmV2ZXJ0ZWQgc3VjY2Vzc2Z1bGx5J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGdldFByZWZhYkluZm8ocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCkudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ByZWZhYiBub3QgZm91bmQnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtbWV0YScsIGFzc2V0SW5mby51dWlkKTtcbiAgICAgICAgICAgIH0pLnRoZW4oKG1ldGFJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZvOiBQcmVmYWJJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBtZXRhSW5mby5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB1dWlkOiBtZXRhSW5mby51dWlkLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICBmb2xkZXI6IHByZWZhYlBhdGguc3Vic3RyaW5nKDAsIHByZWZhYlBhdGgubGFzdEluZGV4T2YoJy8nKSksXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRpbWU6IG1ldGFJbmZvLmNyZWF0ZVRpbWUsXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmeVRpbWU6IG1ldGFJbmZvLm1vZGlmeVRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogbWV0YUluZm8uZGVwZW5kcyB8fCBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGluZm8gfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlUHJlZmFiRnJvbU5vZGUoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgLy8g5LuOIHByZWZhYlBhdGgg5o+Q5Y+W5ZCN56ewXG4gICAgICAgIGNvbnN0IHByZWZhYlBhdGggPSBhcmdzLnByZWZhYlBhdGg7XG4gICAgICAgIGNvbnN0IHByZWZhYk5hbWUgPSBwcmVmYWJQYXRoLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5wcmVmYWInLCAnJykgfHwgJ05ld1ByZWZhYic7XG4gICAgICAgIFxuICAgICAgICAvLyDosIPnlKjljp/mnaXnmoQgY3JlYXRlUHJlZmFiIOaWueazlVxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWIoe1xuICAgICAgICAgICAgbm9kZVV1aWQ6IGFyZ3Mubm9kZVV1aWQsXG4gICAgICAgICAgICBzYXZlUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgIHByZWZhYk5hbWU6IHByZWZhYk5hbWVcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB2YWxpZGF0ZVByZWZhYihwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICfpooTliLbkvZPmlofku7bkuI3lrZjlnKgnIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkRhdGEgPSBhd2FpdCB0aGlzLnJlYWRQcmVmYWJGaWxlKHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHRoaXMudmFsaWRhdGVQcmVmYWJGb3JtYXQocHJlZmFiRGF0YSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGlzVmFsaWQ6IHZhbGlkYXRpb25SZXN1bHQuaXNWYWxpZCxcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiB2YWxpZGF0aW9uUmVzdWx0Lmlzc3VlcyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZUNvdW50OiB2YWxpZGF0aW9uUmVzdWx0Lm5vZGVDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Q291bnQ6IHZhbGlkYXRpb25SZXN1bHQuY29tcG9uZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHM6IHZhbGlkYXRpb25SZXN1bHQuZGV0YWlscyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdmFsaWRhdGlvblJlc3VsdC5pc1ZhbGlkID8gJ+mihOWItuS9k+agvOW8j+acieaViCcgOiAn6aKE5Yi25L2T5qC85byP5a2Y5Zyo6Zeu6aKYJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmFsaWRhdGVQcmVmYWJGb3JtYXQocHJlZmFiRGF0YTogYW55KTogeyBpc1ZhbGlkOiBib29sZWFuOyBpc3N1ZXM6IHN0cmluZ1tdOyBub2RlQ291bnQ6IG51bWJlcjsgY29tcG9uZW50Q291bnQ6IG51bWJlcjsgZGV0YWlscz86IGFueSB9IHtcbiAgICAgICAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgbGV0IG5vZGVDb3VudCA9IDA7XG4gICAgICAgIGxldCBjb21wb25lbnRDb3VudCA9IDA7XG4gICAgICAgIGNvbnN0IGN1c3RvbVNjcmlwdENvbXBzOiBhbnlbXSA9IFtdO1xuICAgICAgICBjb25zdCBjaWRQYXR0ZXJuID0gL15bQS1aYS16MC05Ky9fPV17MjAsfSQvOyAvLyDljovnvKkgVVVJRCDlvaLlvI/nmoQgY2lk77yIYmFzZTY0IOexu+Wtl+espu+8jOmVv+W6pumAmuW4uCAyMn4yM1xuXG4gICAgICAgIC8vIOajgOafpeWfuuacrOe7k+aehFxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJlZmFiRGF0YSkpIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfpooTliLbkvZPmlbDmja7lv4XpobvmmK/mlbDnu4TmoLzlvI8nKTtcbiAgICAgICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBpc3N1ZXMsIG5vZGVDb3VudCwgY29tcG9uZW50Q291bnQgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmVmYWJEYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgaXNzdWVzLnB1c2goJ+mihOWItuS9k+aVsOaNruS4uuepuicpO1xuICAgICAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGlzc3Vlcywgbm9kZUNvdW50LCBjb21wb25lbnRDb3VudCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qOA5p+l56ys5LiA5Liq5YWD57Sg5piv5ZCm5Li66aKE5Yi25L2T6LWE5LqnXG4gICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IHByZWZhYkRhdGFbMF07XG4gICAgICAgIGlmICghZmlyc3RFbGVtZW50IHx8IGZpcnN0RWxlbWVudC5fX3R5cGVfXyAhPT0gJ2NjLlByZWZhYicpIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfnrKzkuIDkuKrlhYPntKDlv4XpobvmmK9jYy5QcmVmYWLnsbvlnosnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaUtumbhuaJgOacieiKgueCueeahCBAcHJvcGVydHkg57uR5a6a5L+h5oGv77yI55So5LqO56m657uR5a6a5qOA5p+l77yJXG4gICAgICAgIC8vIGtleTog6IqC54K557Si5byV77ybdmFsdWU6IOiKgueCueWQjeensCArIOW3sue7keWumueahOWxnuaAp+mbhlxuICAgICAgICBjb25zdCBub2RlQmluZGluZ3MgPSBuZXcgTWFwPG51bWJlciwgeyBuYW1lOiBzdHJpbmc7IGVtcHR5QmluZGluZ3M6IHN0cmluZ1tdIH0+KCk7XG5cbiAgICAgICAgLy8g57uf6K6h6IqC54K55ZKM57uE5Lu2ICsg6K+m57uG5qOA5p+lXG4gICAgICAgIHByZWZhYkRhdGEuZm9yRWFjaCgoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWl0ZW0gfHwgdHlwZW9mIGl0ZW0gIT09ICdvYmplY3QnKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCB0ID0gaXRlbS5fX3R5cGVfXyB8fCAnJztcblxuICAgICAgICAgICAgaWYgKHQgPT09ICdjYy5Ob2RlJykge1xuICAgICAgICAgICAgICAgIG5vZGVDb3VudCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVOYW1lID0gaXRlbS5fbmFtZSB8fCBgTm9kZSMke2luZGV4fWA7XG4gICAgICAgICAgICAgICAgbm9kZUJpbmRpbmdzLnNldChpbmRleCwgeyBuYW1lOiBub2RlTmFtZSwgZW1wdHlCaW5kaW5nczogW10gfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRDb3VudCsrO1xuICAgICAgICAgICAgICAgIGlmICh0ID09PSAnY2MuTWlzc2luZ1NjcmlwdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzLnB1c2goYFtNaXNzaW5nU2NyaXB0XSDntKLlvJUgJHtpbmRleH3vvIjoioLngrkgJHtpdGVtLm5vZGU/Ll9faWRfXyA/PyAnPyd977yJ5a2Y5ZyoIE1pc3NpbmdTY3JpcHQg57uE5Lu277yM6ISa5pys5Y+v6IO95bey5Yig6Zmk5oiW5pyq57yW6K+RYCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdC5zdGFydHNXaXRoKCdjYy4nKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDoh6rlrprkuYnohJrmnKznu4Tku7ZcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tU2NyaXB0Q29tcHMucHVzaCh7IGluZGV4LCB0eXBlOiB0LCBpdGVtIH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyDmoKHpqowgX190eXBlX18g5piv5LiN5pivIGNpZO+8iOWOi+e8qSBVVUlE77yJ6ICM6Z2e57G75ZCNXG4gICAgICAgICAgICAgICAgICAgIGlmICghY2lkUGF0dGVybi50ZXN0KHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXMucHVzaChgW1NjcmlwdENpZF0g57Si5byVICR7aW5kZXh9IOiHquWumuS5ieiEmuacrCBfX3R5cGVfXz1cIiR7dH1cIiDnnIvotbfmnaXmmK/nsbvlkI3ogIzpnZ4gY2lk77yI5Y6L57ypVVVJRO+8ieOAgnByZWZhYiDliqDovb3ml7bkvJrlh7rnjrAgTWlzc2luZ1NjcmlwdOOAgmApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIOajgOafpeepuiBAcHJvcGVydHkg57uR5a6a77ya5LuF5b2T5bGe5oCn5YC86KGo546w5Li656m677yIbnVsbC9bXS/ml6AgX19pZF9fIOW8leeUqO+8iVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBrbm93bk1ldGFLZXlzID0gbmV3IFNldChbJ19fdHlwZV9fJywgJ19uYW1lJywgJ19vYmpGbGFncycsICdfX2VkaXRvckV4dHJhc19fJywgJ25vZGUnLCAnX2VuYWJsZWQnLCAnX19wcmVmYWInLCAnX19zY3JpcHRBc3NldCcsICdfaWQnXSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVtcHR5S2V5czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrbm93bk1ldGFLZXlzLmhhcyhrKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodiA9PT0gbnVsbCkgZW1wdHlLZXlzLnB1c2goayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHYpICYmIHYubGVuZ3RoID09PSAwKSBlbXB0eUtleXMucHVzaChgJHtrfShlbXB0eSBhcnJheSlgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2ICYmICEoJ19faWRfXycgaW4gdikgJiYgISgnX191dWlkX18nIGluIHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5a+56LGh5L2G5pei5LiN5pivIF9faWRfXyDkuZ/kuI3mmK8gX191dWlkX1/vvIzlj6/og73mmK/nqbrlvJXnlKhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDku4XorablkYrvvIzkuI3op4bkuLrplJnor69cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZW1wdHlLZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhcm5pbmdzLnB1c2goYFtFbXB0eUJpbmRpbmddIOe0ouW8lSAke2luZGV4fSgke3Quc2xpY2UoMCwgMTIpfeKApikg5a2Y5Zyo56m657uR5a6aOiAke2VtcHR5S2V5cy5qb2luKCcsICcpfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyDmo4Dmn6Xlv4XopoHnmoTlrZfmrrVcbiAgICAgICAgaWYgKG5vZGVDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgaXNzdWVzLnB1c2goJ+mihOWItuS9k+W/hemhu+WMheWQq+iHs+WwkeS4gOS4quiKgueCuScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzVmFsaWQ6IGlzc3Vlcy5sZW5ndGggPT09IDAsXG4gICAgICAgICAgICBpc3N1ZXM6IFsuLi5pc3N1ZXMsIC4uLndhcm5pbmdzXSxcbiAgICAgICAgICAgIG5vZGVDb3VudCxcbiAgICAgICAgICAgIGNvbXBvbmVudENvdW50LFxuICAgICAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgICAgICAgIGN1c3RvbVNjcmlwdENvdW50OiBjdXN0b21TY3JpcHRDb21wcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbWlzc2luZ1NjcmlwdENvdW50OiBpc3N1ZXMuZmlsdGVyKHMgPT4gcy5pbmNsdWRlcygnTWlzc2luZ1NjcmlwdCcpKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgc2NyaXB0Q2lkSXNzdWVzOiBpc3N1ZXMuZmlsdGVyKHMgPT4gcy5pbmNsdWRlcygnU2NyaXB0Q2lkJykpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBlbXB0eUJpbmRpbmdXYXJuaW5nczogd2FybmluZ3MubGVuZ3RoXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBkdXBsaWNhdGVQcmVmYWIoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgc291cmNlUHJlZmFiUGF0aCwgdGFyZ2V0UHJlZmFiUGF0aCwgbmV3UHJlZmFiTmFtZSB9ID0gYXJncztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDor7vlj5bmupDpooTliLbkvZNcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VJbmZvID0gYXdhaXQgdGhpcy5nZXRQcmVmYWJJbmZvKHNvdXJjZVByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICghc291cmNlSW5mby5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOaXoOazleivu+WPlua6kOmihOWItuS9kzogJHtzb3VyY2VJbmZvLmVycm9yfWBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDor7vlj5bmupDpooTliLbkvZPlhoXlrrlcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VDb250ZW50ID0gYXdhaXQgdGhpcy5yZWFkUHJlZmFiQ29udGVudChzb3VyY2VQcmVmYWJQYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNvdXJjZUNvbnRlbnQuc3VjY2VzcyB8fCAhc291cmNlQ29udGVudC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOaXoOazleivu+WPlua6kOmihOWItuS9k+WGheWuuTogJHtzb3VyY2VDb250ZW50LmVycm9yID8/ICfmnKrnn6XplJnor68nfWAsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g55Sf5oiQ5paw55qEVVVJRFxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1V1aWQgPSB0aGlzLmdlbmVyYXRlVVVJRCgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOS/ruaUuemihOWItuS9k+aVsOaNrlxuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVkRGF0YSA9IHRoaXMubW9kaWZ5UHJlZmFiRm9yRHVwbGljYXRpb24oc291cmNlQ29udGVudC5kYXRhLCBuZXdQcmVmYWJOYW1lLCBuZXdVdWlkKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDliJvlu7rmlrDnmoRtZXRh5pWw5o2uXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3TWV0YURhdGEgPSB0aGlzLmNyZWF0ZU1ldGFEYXRhKG5ld1ByZWZhYk5hbWUgfHwgJ0R1cGxpY2F0ZWRQcmVmYWInLCBuZXdVdWlkKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDpooTliLbkvZPlpI3liLblip/og73mmoLml7bnpoHnlKjvvIzlm6DkuLrmtonlj4rlpI3mnYLnmoTluo/liJfljJbmoLzlvI9cbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAn6aKE5Yi25L2T5aSN5Yi25Yqf6IO95pqC5pe25LiN5Y+v55SoJyxcbiAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb246ICfor7flnKggQ29jb3MgQ3JlYXRvciDnvJbovpHlmajkuK3miYvliqjlpI3liLbpooTliLbkvZPvvJpcXG4xLiDlnKjotYTmupDnrqHnkIblmajkuK3pgInmi6nopoHlpI3liLbnmoTpooTliLbkvZNcXG4yLiDlj7PplK7pgInmi6nlpI3liLZcXG4zLiDlnKjnm67moIfkvY3nva7nspjotLQnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOWkjeWItumihOWItuS9k+aXtuWPkeeUn+mUmeivrzogJHtlcnJvcn1gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZFByZWZhYkNvbnRlbnQocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiB1bmtub3duW107IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkRhdGEgPSBhd2FpdCB0aGlzLnJlYWRQcmVmYWJGaWxlKHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcHJlZmFiRGF0YSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB8fCAn6K+75Y+W6aKE5Yi25L2T5paH5Lu25aSx6LSlJyB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb2RpZnlQcmVmYWJGb3JEdXBsaWNhdGlvbihwcmVmYWJEYXRhOiBhbnlbXSwgbmV3TmFtZTogc3RyaW5nLCBuZXdVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOS/ruaUuemihOWItuS9k+aVsOaNruS7peWIm+W7uuWJr+acrFxuICAgICAgICBjb25zdCBtb2RpZmllZERhdGEgPSBbLi4ucHJlZmFiRGF0YV07XG4gICAgICAgIFxuICAgICAgICAvLyDkv67mlLnnrKzkuIDkuKrlhYPntKDvvIjpooTliLbkvZPotYTkuqfvvIlcbiAgICAgICAgaWYgKG1vZGlmaWVkRGF0YVswXSAmJiBtb2RpZmllZERhdGFbMF0uX190eXBlX18gPT09ICdjYy5QcmVmYWInKSB7XG4gICAgICAgICAgICBtb2RpZmllZERhdGFbMF0uX25hbWUgPSBuZXdOYW1lIHx8ICdEdXBsaWNhdGVkUHJlZmFiJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOaJgOaciVVVSUTlvJXnlKjvvIjnroDljJbniYjmnKzvvIlcbiAgICAgICAgLy8g5Zyo5a6e6ZmF5bqU55So5Lit77yM5Y+v6IO96ZyA6KaB5pu05aSN5p2C55qEVVVJROaYoOWwhOWkhOeQhlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVkRGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDkvb/nlKggYXNzZXQtZGIgQVBJIOWIm+W7uui1hOa6kOaWh+S7tlxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlQXNzZXRXaXRoQXNzZXREQihhc3NldFBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBhbnk7IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBhc3NldFBhdGgsIGNvbnRlbnQsIHtcbiAgICAgICAgICAgICAgICBvdmVyd3JpdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVuYW1lOiBmYWxzZVxuICAgICAgICAgICAgfSkudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu66LWE5rqQ5paH5Lu25oiQ5YqfOicsIGFzc2V0SW5mbyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGFzc2V0SW5mbyB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yib5bu66LWE5rqQ5paH5Lu25aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfliJvlu7rotYTmupDmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg5Yib5bu6IG1ldGEg5paH5Lu2XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVNZXRhV2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcsIG1ldGFDb250ZW50OiBhbnkpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50U3RyaW5nID0gSlNPTi5zdHJpbmdpZnkobWV0YUNvbnRlbnQsIG51bGwsIDIpO1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldC1tZXRhJywgYXNzZXRQYXRoLCBtZXRhQ29udGVudFN0cmluZykudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu6bWV0YeaWh+S7tuaIkOWKnzonLCBhc3NldEluZm8pO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBhc3NldEluZm8gfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WIm+W7um1ldGHmlofku7blpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+WIm+W7um1ldGHmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg6YeN5paw5a+85YWl6LWE5rqQXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyByZWltcG9ydEFzc2V0V2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlaW1wb3J0LWFzc2V0JywgYXNzZXRQYXRoKS50aGVuKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfph43mlrDlr7zlhaXotYTmupDmiJDlip86JywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfph43mlrDlr7zlhaXotYTmupDlpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+mHjeaWsOWvvOWFpei1hOa6kOWksei0pScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDmm7TmlrDotYTmupDmlofku7blhoXlrrlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZUFzc2V0V2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldCcsIGFzc2V0UGF0aCwgY29udGVudCkudGhlbigocmVzdWx0OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pu05paw6LWE5rqQ5paH5Lu25oiQ5YqfOicsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5pu05paw6LWE5rqQ5paH5Lu25aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfmm7TmlrDotYTmupDmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuespuWQiCBDb2NvcyBDcmVhdG9yIOagh+WHhueahOmihOWItuS9k+WGheWuuVxuICAgICAqIOWujOaVtOWunueOsOmAkuW9kuiKgueCueagkeWkhOeQhu+8jOWMuemFjeW8leaTjuagh+WHhuagvOW8j1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhOiBhbnksIHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgICAgICBjb25zb2xlLmxvZygn5byA5aeL5Yib5bu65byV5pOO5qCH5YeG6aKE5Yi25L2T5YaF5a65Li4uJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcmVmYWJEYXRhOiBhbnlbXSA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudElkID0gMDtcblxuICAgICAgICAvLyAxLiDliJvlu7rpooTliLbkvZPotYTkuqflr7nosaEgKGluZGV4IDApXG4gICAgICAgIGNvbnN0IHByZWZhYkFzc2V0ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlByZWZhYlwiLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBwcmVmYWJOYW1lIHx8IFwiXCIsIC8vIOehruS/nemihOWItuS9k+WQjeensOS4jeS4uuepulxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwiX25hdGl2ZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJkYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJvcHRpbWl6YXRpb25Qb2xpY3lcIjogMCxcbiAgICAgICAgICAgIFwicGVyc2lzdGVudFwiOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBwcmVmYWJEYXRhLnB1c2gocHJlZmFiQXNzZXQpO1xuICAgICAgICBjdXJyZW50SWQrKztcblxuICAgICAgICAvLyAyLiDpgJLlvZLliJvlu7rlrozmlbTnmoToioLngrnmoJHnu5PmnoRcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgIHByZWZhYkRhdGEsXG4gICAgICAgICAgICBjdXJyZW50SWQ6IGN1cnJlbnRJZCArIDEsIC8vIOagueiKgueCueWNoOeUqOe0ouW8lTHvvIzlrZDoioLngrnku47ntKLlvJUy5byA5aeLXG4gICAgICAgICAgICBwcmVmYWJBc3NldEluZGV4OiAwLFxuICAgICAgICAgICAgbm9kZUZpbGVJZHM6IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCksIC8vIOWtmOWCqOiKgueCuUlE5YiwZmlsZUlk55qE5pig5bCEXG4gICAgICAgICAgICBub2RlVXVpZFRvSW5kZXg6IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCksIC8vIOWtmOWCqOiKgueCuVVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgICAgIGNvbXBvbmVudFV1aWRUb0luZGV4OiBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpIC8vIOWtmOWCqOe7hOS7tlVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgfTtcblxuICAgICAgICAvLyDliJvlu7rmoLnoioLngrnlkozmlbTkuKroioLngrnmoJEgLSDms6jmhI/vvJrmoLnoioLngrnnmoTniLboioLngrnlupTor6XmmK9udWxs77yM5LiN5piv6aKE5Yi25L2T5a+56LGhXG4gICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tcGxldGVOb2RlVHJlZShub2RlRGF0YSwgbnVsbCwgMSwgY29udGV4dCwgaW5jbHVkZUNoaWxkcmVuLCBpbmNsdWRlQ29tcG9uZW50cywgcHJlZmFiTmFtZSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYOmihOWItuS9k+WGheWuueWIm+W7uuWujOaIkO+8jOaAu+WFsSAke3ByZWZhYkRhdGEubGVuZ3RofSDkuKrlr7nosaFgKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+iKgueCuWZpbGVJZOaYoOWwhDonLCBBcnJheS5mcm9tKGNvbnRleHQubm9kZUZpbGVJZHMuZW50cmllcygpKSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcHJlZmFiRGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpgJLlvZLliJvlu7rlrozmlbTnmoToioLngrnmoJHvvIzljIXmi6zmiYDmnInlrZDoioLngrnlkozlr7nlupTnmoRQcmVmYWJJbmZvXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVDb21wbGV0ZU5vZGVUcmVlKFxuICAgICAgICBub2RlRGF0YTogYW55LCBcbiAgICAgICAgcGFyZW50Tm9kZUluZGV4OiBudW1iZXIgfCBudWxsLCBcbiAgICAgICAgbm9kZUluZGV4OiBudW1iZXIsXG4gICAgICAgIGNvbnRleHQ6IHsgXG4gICAgICAgICAgICBwcmVmYWJEYXRhOiBhbnlbXSwgXG4gICAgICAgICAgICBjdXJyZW50SWQ6IG51bWJlciwgXG4gICAgICAgICAgICBwcmVmYWJBc3NldEluZGV4OiBudW1iZXIsIFxuICAgICAgICAgICAgbm9kZUZpbGVJZHM6IE1hcDxzdHJpbmcsIHN0cmluZz4sXG4gICAgICAgICAgICBub2RlVXVpZFRvSW5kZXg6IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgICAgICBjb21wb25lbnRVdWlkVG9JbmRleDogTWFwPHN0cmluZywgbnVtYmVyPlxuICAgICAgICB9LFxuICAgICAgICBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sXG4gICAgICAgIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuLFxuICAgICAgICBub2RlTmFtZT86IHN0cmluZ1xuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB7IHByZWZhYkRhdGEgfSA9IGNvbnRleHQ7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7roioLngrnlr7nosaFcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuY3JlYXRlRW5naW5lU3RhbmRhcmROb2RlKG5vZGVEYXRhLCBwYXJlbnROb2RlSW5kZXgsIG5vZGVOYW1lKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOehruS/neiKgueCueWcqOaMh+WumueahOe0ouW8leS9jee9rlxuICAgICAgICB3aGlsZSAocHJlZmFiRGF0YS5sZW5ndGggPD0gbm9kZUluZGV4KSB7XG4gICAgICAgICAgICBwcmVmYWJEYXRhLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYOiuvue9ruiKgueCueWIsOe0ouW8lSAke25vZGVJbmRleH06ICR7bm9kZS5fbmFtZX0sIF9wYXJlbnQ6YCwgbm9kZS5fcGFyZW50LCBgX2NoaWxkcmVuIGNvdW50OiAke25vZGUuX2NoaWxkcmVuLmxlbmd0aH1gKTtcbiAgICAgICAgcHJlZmFiRGF0YVtub2RlSW5kZXhdID0gbm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS4uuW9k+WJjeiKgueCueeUn+aIkGZpbGVJZOW5tuiusOW9lVVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgY29uc3Qgbm9kZVV1aWQgPSB0aGlzLmV4dHJhY3ROb2RlVXVpZChub2RlRGF0YSk7XG4gICAgICAgIGNvbnN0IGZpbGVJZCA9IG5vZGVVdWlkIHx8IHRoaXMuZ2VuZXJhdGVGaWxlSWQoKTtcbiAgICAgICAgY29udGV4dC5ub2RlRmlsZUlkcy5zZXQobm9kZUluZGV4LnRvU3RyaW5nKCksIGZpbGVJZCk7XG4gICAgICAgIFxuICAgICAgICAvLyDorrDlvZXoioLngrlVVUlE5Yiw57Si5byV55qE5pig5bCEXG4gICAgICAgIGlmIChub2RlVXVpZCkge1xuICAgICAgICAgICAgY29udGV4dC5ub2RlVXVpZFRvSW5kZXguc2V0KG5vZGVVdWlkLCBub2RlSW5kZXgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOiusOW9leiKgueCuVVVSUTmmKDlsIQ6ICR7bm9kZVV1aWR9IC0+ICR7bm9kZUluZGV4fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5YWI5aSE55CG5a2Q6IqC54K577yI5L+d5oyB5LiO5omL5Yqo5Yib5bu655qE57Si5byV6aG65bqP5LiA6Ie077yJXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuVG9Qcm9jZXNzID0gdGhpcy5nZXRDaGlsZHJlblRvUHJvY2Vzcyhub2RlRGF0YSk7XG4gICAgICAgIGlmIChpbmNsdWRlQ2hpbGRyZW4gJiYgY2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuiKgueCuSAke25vZGUuX25hbWV9IOeahCAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K5YCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOS4uuavj+S4quWtkOiKgueCueWIhumFjee0ouW8lVxuICAgICAgICAgICAgY29uc3QgY2hpbGRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWHhuWkh+S4uiAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K55YiG6YWN57Si5byV77yM5b2T5YmNSUQ6ICR7Y29udGV4dC5jdXJyZW50SWR9YCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuesrCAke2krMX0g5Liq5a2Q6IqC54K577yM5b2T5YmNY3VycmVudElkOiAke2NvbnRleHQuY3VycmVudElkfWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5kZXggPSBjb250ZXh0LmN1cnJlbnRJZCsrO1xuICAgICAgICAgICAgICAgIGNoaWxkSW5kaWNlcy5wdXNoKGNoaWxkSW5kZXgpO1xuICAgICAgICAgICAgICAgIG5vZGUuX2NoaWxkcmVuLnB1c2goeyBcIl9faWRfX1wiOiBjaGlsZEluZGV4IH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg5re75Yqg5a2Q6IqC54K55byV55So5YiwICR7bm9kZS5fbmFtZX06IHtfX2lkX186ICR7Y2hpbGRJbmRleH19YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg4pyFIOiKgueCuSAke25vZGUuX25hbWV9IOacgOe7iOeahOWtkOiKgueCueaVsOe7hDpgLCBub2RlLl9jaGlsZHJlbik7XG5cbiAgICAgICAgICAgIC8vIOmAkuW9kuWIm+W7uuWtkOiKgueCuVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlblRvUHJvY2Vzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRGF0YSA9IGNoaWxkcmVuVG9Qcm9jZXNzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5kZXggPSBjaGlsZEluZGljZXNbaV07XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVDb21wbGV0ZU5vZGVUcmVlKFxuICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEsIFxuICAgICAgICAgICAgICAgICAgICBub2RlSW5kZXgsIFxuICAgICAgICAgICAgICAgICAgICBjaGlsZEluZGV4LCBcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlQ29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhLm5hbWUgfHwgYENoaWxkJHtpKzF9YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnhLblkI7lpITnkIbnu4Tku7ZcbiAgICAgICAgaWYgKGluY2x1ZGVDb21wb25lbnRzICYmIG5vZGVEYXRhLmNvbXBvbmVudHMgJiYgQXJyYXkuaXNBcnJheShub2RlRGF0YS5jb21wb25lbnRzKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuiKgueCuSAke25vZGUuX25hbWV9IOeahCAke25vZGVEYXRhLmNvbXBvbmVudHMubGVuZ3RofSDkuKrnu4Tku7ZgKTtcblxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29tcG9uZW50IG9mIG5vZGVEYXRhLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRJbmRleCA9IGNvbnRleHQuY3VycmVudElkKys7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50SW5kaWNlcy5wdXNoKGNvbXBvbmVudEluZGV4KTtcbiAgICAgICAgICAgICAgICBub2RlLl9jb21wb25lbnRzLnB1c2goeyBcIl9faWRfX1wiOiBjb21wb25lbnRJbmRleCB9KTtcblxuICAgICAgICAgICAgICAgIC8vIOiusOW9lee7hOS7tlVVSUTliLDntKLlvJXnmoTmmKDlsITvvIjlhbPplK7vvJpNQ1Ag566A5YyW57uT5p6E5LiLIFVVSUQg5ZyoIHByb3BlcnRpZXMudXVpZC52YWx1Ze+8iVxuICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnRVdWlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LnV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VXVpZCA9IGNvbXBvbmVudC51dWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50LnZhbHVlICYmIGNvbXBvbmVudC52YWx1ZS51dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFV1aWQgPSBjb21wb25lbnQudmFsdWUudXVpZDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudC5wcm9wZXJ0aWVzPy51dWlkPy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRVdWlkID0gY29tcG9uZW50LnByb3BlcnRpZXMudXVpZC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudC5wcm9wZXJ0aWVzPy5fX3ByZWZhYj8udmFsdWU/LmZpbGVJZD8udmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5YWc5bqV77ya5L2/55SoIGZpbGVJZO+8iENvbXBQcmVmYWJJbmZvIOS4reeahO+8ieS9nOS4uuWGhemDqOW8leeUqCBrZXlcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VXVpZCA9IGNvbXBvbmVudC5wcm9wZXJ0aWVzLl9fcHJlZmFiLnZhbHVlLmZpbGVJZC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudFV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jb21wb25lbnRVdWlkVG9JbmRleC5zZXQoY29tcG9uZW50VXVpZCwgY29tcG9uZW50SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6K6w5b2V57uE5Lu2VVVJROaYoOWwhDogJHtjb21wb25lbnRVdWlkfSAtPiAke2NvbXBvbmVudEluZGV4fWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOWIm+W7uue7hOS7tuWvueixoe+8jOS8oOWFpWNvbnRleHTku6XlpITnkIblvJXnlKhcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRPYmogPSB0aGlzLmNyZWF0ZUNvbXBvbmVudE9iamVjdChjb21wb25lbnQsIG5vZGVJbmRleCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgcHJlZmFiRGF0YVtjb21wb25lbnRJbmRleF0gPSBjb21wb25lbnRPYmo7XG5cbiAgICAgICAgICAgICAgICAvLyDkuLrnu4Tku7bliJvlu7ogQ29tcFByZWZhYkluZm9cbiAgICAgICAgICAgICAgICBjb25zdCBjb21wUHJlZmFiSW5mb0luZGV4ID0gY29udGV4dC5jdXJyZW50SWQrKztcbiAgICAgICAgICAgICAgICAvLyDkvJjlhYjlpI3nlKjmupAgcHJlZmFiIOS4reeahCBmaWxlSWTvvIjkv53mjIHlvJXnlKjnqLPlrprvvIlcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wRmlsZUlkID0gKGNvbXBvbmVudC5wcm9wZXJ0aWVzPy5fX3ByZWZhYj8udmFsdWU/LmZpbGVJZD8udmFsdWUpIHx8IHRoaXMuZ2VuZXJhdGVGaWxlSWQoKTtcbiAgICAgICAgICAgICAgICBwcmVmYWJEYXRhW2NvbXBQcmVmYWJJbmZvSW5kZXhdID0ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuQ29tcFByZWZhYkluZm9cIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWxlSWRcIjogY29tcEZpbGVJZFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyDlpoLmnpznu4Tku7blr7nosaHmnIkgX19wcmVmYWIg5bGe5oCn77yM6K6+572u5byV55SoXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudE9iaiAmJiB0eXBlb2YgY29tcG9uZW50T2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRPYmouX19wcmVmYWIgPSB7IFwiX19pZF9fXCI6IGNvbXBQcmVmYWJJbmZvSW5kZXggfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg6IqC54K5ICR7bm9kZS5fbmFtZX0g5re75Yqg5LqGICR7Y29tcG9uZW50SW5kaWNlcy5sZW5ndGh9IOS4que7hOS7tmApO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyDkuLrlvZPliY3oioLngrnliJvlu7pQcmVmYWJJbmZvXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm9JbmRleCA9IGNvbnRleHQuY3VycmVudElkKys7XG4gICAgICAgIG5vZGUuX3ByZWZhYiA9IHsgXCJfX2lkX19cIjogcHJlZmFiSW5mb0luZGV4IH07XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcmVmYWJJbmZvOiBhbnkgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUHJlZmFiSW5mb1wiLFxuICAgICAgICAgICAgXCJyb290XCI6IHsgXCJfX2lkX19cIjogMSB9LFxuICAgICAgICAgICAgXCJhc3NldFwiOiB7IFwiX19pZF9fXCI6IGNvbnRleHQucHJlZmFiQXNzZXRJbmRleCB9LFxuICAgICAgICAgICAgXCJmaWxlSWRcIjogZmlsZUlkLFxuICAgICAgICAgICAgXCJ0YXJnZXRPdmVycmlkZXNcIjogbnVsbCxcbiAgICAgICAgICAgIFwibmVzdGVkUHJlZmFiSW5zdGFuY2VSb290c1wiOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnoioLngrnnmoTnibnmrorlpITnkIZcbiAgICAgICAgaWYgKG5vZGVJbmRleCA9PT0gMSkge1xuICAgICAgICAgICAgLy8g5qC56IqC54K55rKh5pyJaW5zdGFuY2XvvIzkvYblj6/og73mnIl0YXJnZXRPdmVycmlkZXNcbiAgICAgICAgICAgIHByZWZhYkluZm8uaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5a2Q6IqC54K56YCa5bi45pyJaW5zdGFuY2XkuLpudWxsXG4gICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJlZmFiRGF0YVtwcmVmYWJJbmZvSW5kZXhdID0gcHJlZmFiSW5mbztcbiAgICAgICAgY29udGV4dC5jdXJyZW50SWQgPSBwcmVmYWJJbmZvSW5kZXggKyAxO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWwhlVVSUTovazmjaLkuLpDb2NvcyBDcmVhdG9y55qE5Y6L57yp5qC85byPXG4gICAgICog5Z+65LqO55yf5a6eQ29jb3MgQ3JlYXRvcue8lui+keWZqOeahOWOi+e8qeeul+azleWunueOsFxuICAgICAqIOWJjTXkuKpoZXjlrZfnrKbkv53mjIHkuI3lj5jvvIzliankvZkyN+S4quWtl+espuWOi+e8qeaIkDE45Liq5a2X56ymXG4gICAgICovXG4gICAgcHJpdmF0ZSB1dWlkVG9Db21wcmVzc2VkSWQodXVpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgQkFTRTY0X0tFWVMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk6L+e5a2X56ym5bm26L2s5Li65bCP5YaZXG4gICAgICAgIGNvbnN0IGNsZWFuVXVpZCA9IHV1aWQucmVwbGFjZSgvLS9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOehruS/nVVVSUTmnInmlYhcbiAgICAgICAgaWYgKGNsZWFuVXVpZC5sZW5ndGggIT09IDMyKSB7XG4gICAgICAgICAgICByZXR1cm4gdXVpZDsgLy8g5aaC5p6c5LiN5piv5pyJ5pWI55qEVVVJRO+8jOi/lOWbnuWOn+Wni+WAvFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDb2NvcyBDcmVhdG9y55qE5Y6L57yp566X5rOV77ya5YmNNeS4quWtl+espuS/neaMgeS4jeWPmO+8jOWJqeS9mTI35Liq5a2X56ym5Y6L57yp5oiQMTjkuKrlrZfnrKZcbiAgICAgICAgbGV0IHJlc3VsdCA9IGNsZWFuVXVpZC5zdWJzdHJpbmcoMCwgNSk7XG4gICAgICAgIFxuICAgICAgICAvLyDliankvZkyN+S4quWtl+espumcgOimgeWOi+e8qeaIkDE45Liq5a2X56ymXG4gICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IGNsZWFuVXVpZC5zdWJzdHJpbmcoNSk7XG4gICAgICAgIFxuICAgICAgICAvLyDmr48z5LiqaGV45a2X56ym5Y6L57yp5oiQMuS4quWtl+esplxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbWFpbmRlci5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgY29uc3QgaGV4MSA9IHJlbWFpbmRlcltpXSB8fCAnMCc7XG4gICAgICAgICAgICBjb25zdCBoZXgyID0gcmVtYWluZGVyW2kgKyAxXSB8fCAnMCc7XG4gICAgICAgICAgICBjb25zdCBoZXgzID0gcmVtYWluZGVyW2kgKyAyXSB8fCAnMCc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWwhjPkuKpoZXjlrZfnrKYoMTLkvY0p6L2s5o2i5Li6MuS4qmJhc2U2NOWtl+esplxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUludChoZXgxICsgaGV4MiArIGhleDMsIDE2KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gMTLkvY3liIbmiJDkuKTkuKo25L2NXG4gICAgICAgICAgICBjb25zdCBoaWdoNiA9ICh2YWx1ZSA+PiA2KSAmIDYzO1xuICAgICAgICAgICAgY29uc3QgbG93NiA9IHZhbHVlICYgNjM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlc3VsdCArPSBCQVNFNjRfS0VZU1toaWdoNl0gKyBCQVNFNjRfS0VZU1tsb3c2XTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rnu4Tku7blr7nosaFcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUNvbXBvbmVudE9iamVjdChjb21wb25lbnREYXRhOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBjb250ZXh0PzogeyBcbiAgICAgICAgbm9kZVV1aWRUb0luZGV4PzogTWFwPHN0cmluZywgbnVtYmVyPixcbiAgICAgICAgY29tcG9uZW50VXVpZFRvSW5kZXg/OiBNYXA8c3RyaW5nLCBudW1iZXI+XG4gICAgfSk6IGFueSB7XG4gICAgICAgIGxldCBjb21wb25lbnRUeXBlID0gY29tcG9uZW50RGF0YS50eXBlIHx8IGNvbXBvbmVudERhdGEuX190eXBlX18gfHwgJ2NjLkNvbXBvbmVudCc7XG4gICAgICAgIGNvbnN0IGVuYWJsZWQgPSBjb21wb25lbnREYXRhLmVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IGNvbXBvbmVudERhdGEuZW5hYmxlZCA6IHRydWU7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zb2xlLmxvZyhg5Yib5bu657uE5Lu25a+56LGhIC0g5Y6f5aeL57G75Z6LOiAke2NvbXBvbmVudFR5cGV9YCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCfnu4Tku7blrozmlbTmlbDmja46JywgSlNPTi5zdHJpbmdpZnkoY29tcG9uZW50RGF0YSwgbnVsbCwgMikpO1xuICAgICAgICBcbiAgICAgICAgLy8g5aSE55CG6ISa5pys57uE5Lu2IC0gTUNQ5o6l5Y+j5bey57uP6L+U5Zue5q2j56Gu55qE5Y6L57ypVVVJROagvOW8j1xuICAgICAgICBpZiAoY29tcG9uZW50VHlwZSAmJiAhY29tcG9uZW50VHlwZS5zdGFydHNXaXRoKCdjYy4nKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOS9v+eUqOiEmuacrOe7hOS7tuWOi+e8qVVVSUTnsbvlnos6ICR7Y29tcG9uZW50VHlwZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Z+656GA57uE5Lu257uT5p6EXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudDogYW55ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBjb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwibm9kZVwiOiB7IFwiX19pZF9fXCI6IG5vZGVJbmRleCB9LFxuICAgICAgICAgICAgXCJfZW5hYmxlZFwiOiBlbmFibGVkXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmj5DliY3orr7nva4gX19wcmVmYWIg5bGe5oCn5Y2g5L2N56ym77yM5ZCO57ut5Lya6KKr5q2j56Gu6K6+572uXG4gICAgICAgIGNvbXBvbmVudC5fX3ByZWZhYiA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnmja7nu4Tku7bnsbvlnovmt7vliqDnibnlrprlsZ7mgKdcbiAgICAgICAgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5VSVRyYW5zZm9ybScpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRTaXplID0gY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy5jb250ZW50U2l6ZT8udmFsdWUgfHwgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9O1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yUG9pbnQgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/LmFuY2hvclBvaW50Py52YWx1ZSB8fCB7IHg6IDAuNSwgeTogMC41IH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvbmVudC5fY29udGVudFNpemUgPSB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlNpemVcIixcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IGNvbnRlbnRTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IGNvbnRlbnRTaXplLmhlaWdodFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fYW5jaG9yUG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzJcIixcbiAgICAgICAgICAgICAgICBcInhcIjogYW5jaG9yUG9pbnQueCxcbiAgICAgICAgICAgICAgICBcInlcIjogYW5jaG9yUG9pbnQueVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuU3ByaXRlJykge1xuICAgICAgICAgICAgLy8g5aSE55CGU3ByaXRl57uE5Lu255qEc3ByaXRlRnJhbWXlvJXnlKhcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZUZyYW1lUHJvcCA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3Nwcml0ZUZyYW1lIHx8IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICBpZiAoc3ByaXRlRnJhbWVQcm9wKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50Ll9zcHJpdGVGcmFtZSA9IHRoaXMucHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHNwcml0ZUZyYW1lUHJvcCwgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fc3ByaXRlRnJhbWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb21wb25lbnQuX3R5cGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll90eXBlPy52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsVHlwZSA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX2ZpbGxUeXBlPy52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9zaXplTW9kZSA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3NpemVNb2RlPy52YWx1ZSA/PyAxO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsQ2VudGVyID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjMlwiLCBcInhcIjogMCwgXCJ5XCI6IDAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZmlsbFN0YXJ0ID0gY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy5fZmlsbFN0YXJ0Py52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsUmFuZ2UgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9maWxsUmFuZ2U/LnZhbHVlID8/IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzVHJpbW1lZE1vZGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9pc1RyaW1tZWRNb2RlPy52YWx1ZSA/PyB0cnVlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll91c2VHcmF5c2NhbGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll91c2VHcmF5c2NhbGU/LnZhbHVlID8/IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDosIPor5XvvJrmiZPljbBTcHJpdGXnu4Tku7bnmoTmiYDmnInlsZ7mgKfvvIjlt7Lms6jph4rvvIlcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdTcHJpdGXnu4Tku7blsZ7mgKc6JywgSlNPTi5zdHJpbmdpZnkoY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzLCBudWxsLCAyKSk7XG4gICAgICAgICAgICBjb21wb25lbnQuX2F0bGFzID0gbnVsbDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5faWQgPSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5CdXR0b24nKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX2ludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICBjb21wb25lbnQuX3RyYW5zaXRpb24gPSAzO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxDb2xvciA9IHsgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsIFwiclwiOiAyNTUsIFwiZ1wiOiAyNTUsIFwiYlwiOiAyNTUsIFwiYVwiOiAyNTUgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5faG92ZXJDb2xvciA9IHsgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsIFwiclwiOiAyMTEsIFwiZ1wiOiAyMTEsIFwiYlwiOiAyMTEsIFwiYVwiOiAyNTUgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fcHJlc3NlZENvbG9yID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIiwgXCJyXCI6IDI1NSwgXCJnXCI6IDI1NSwgXCJiXCI6IDI1NSwgXCJhXCI6IDI1NSB9O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZENvbG9yID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIiwgXCJyXCI6IDEyNCwgXCJnXCI6IDEyNCwgXCJiXCI6IDEyNCwgXCJhXCI6IDI1NSB9O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ob3ZlclNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX3ByZXNzZWRTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZFNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX2R1cmF0aW9uID0gMC4xO1xuICAgICAgICAgICAgY29tcG9uZW50Ll96b29tU2NhbGUgPSAxLjI7XG4gICAgICAgICAgICAvLyDlpITnkIZCdXR0b27nmoR0YXJnZXTlvJXnlKhcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFByb3AgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll90YXJnZXQgfHwgY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy50YXJnZXQ7XG4gICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fdGFyZ2V0ID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50UHJvcGVydHkodGFyZ2V0UHJvcCwgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fdGFyZ2V0ID0geyBcIl9faWRfX1wiOiBub2RlSW5kZXggfTsgLy8g6buY6K6k5oyH5ZCR6Ieq6Lqr6IqC54K5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX2NsaWNrRXZlbnRzID0gW107XG4gICAgICAgICAgICBjb21wb25lbnQuX2lkID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuTGFiZWwnKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX3N0cmluZyA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3N0cmluZz8udmFsdWUgfHwgXCJMYWJlbFwiO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ob3Jpem9udGFsQWxpZ24gPSAxO1xuICAgICAgICAgICAgY29tcG9uZW50Ll92ZXJ0aWNhbEFsaWduID0gMTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fYWN0dWFsRm9udFNpemUgPSAyMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udFNpemUgPSAyMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udEZhbWlseSA9IFwiQXJpYWxcIjtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fbGluZUhlaWdodCA9IDI1O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9vdmVyZmxvdyA9IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2VuYWJsZVdyYXBUZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udCA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzU3lzdGVtRm9udFVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9zcGFjaW5nWCA9IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzSXRhbGljID0gZmFsc2U7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzQm9sZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9pc1VuZGVybGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll91bmRlcmxpbmVIZWlnaHQgPSAyO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9jYWNoZU1vZGUgPSAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9pZCA9IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAvLyDlpITnkIbmiYDmnInnu4Tku7bnmoTlsZ7mgKfvvIjljIXmi6zlhoXnva7nu4Tku7blkozoh6rlrprkuYnohJrmnKznu4Tku7bvvIlcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGNvbXBvbmVudERhdGEucHJvcGVydGllcykpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbm9kZScgfHwga2V5ID09PSAnZW5hYmxlZCcgfHwga2V5ID09PSAnX190eXBlX18nIHx8XG4gICAgICAgICAgICAgICAgICAgIGtleSA9PT0gJ3V1aWQnIHx8IGtleSA9PT0gJ25hbWUnIHx8IGtleSA9PT0gJ19fc2NyaXB0QXNzZXQnIHx8XG4gICAgICAgICAgICAgICAgICAgIGtleSA9PT0gJ19vYmpGbGFncycgfHwga2V5ID09PSAnX19wcmVmYWInKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyDot7Pov4fov5nkupvnibnmrorlsZ7mgKdcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDlr7nkuo7ku6XkuIvliJLnur/lvIDlpLTnmoTlsZ7mgKfvvIzpnIDopoHnibnmrorlpITnkIZcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ18nKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDnoa7kv53lsZ7mgKflkI3kv53mjIHljp/moLfvvIjljIXmi6zkuIvliJLnur/vvIlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcFZhbHVlID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50UHJvcGVydHkodmFsdWUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFtrZXldID0gcHJvcFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g6Z2e5LiL5YiS57q/5byA5aS055qE5bGe5oCn5q2j5bi45aSE55CGXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BWYWx1ZSA9IHRoaXMucHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHZhbHVlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRba2V5XSA9IHByb3BWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g56Gu5L+dIF9pZCDlnKjmnIDlkI7kvY3nva5cbiAgICAgICAgY29uc3QgX2lkID0gY29tcG9uZW50Ll9pZCB8fCBcIlwiO1xuICAgICAgICBkZWxldGUgY29tcG9uZW50Ll9pZDtcbiAgICAgICAgY29tcG9uZW50Ll9pZCA9IF9pZDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5aSE55CG57uE5Lu25bGe5oCn5YC877yM56Gu5L+d5qC85byP5LiO5omL5Yqo5Yib5bu655qE6aKE5Yi25L2T5LiA6Ie0XG4gICAgICovXG4gICAgcHJpdmF0ZSBwcm9jZXNzQ29tcG9uZW50UHJvcGVydHkocHJvcERhdGE6IGFueSwgY29udGV4dD86IHsgXG4gICAgICAgIG5vZGVVdWlkVG9JbmRleD86IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgIGNvbXBvbmVudFV1aWRUb0luZGV4PzogTWFwPHN0cmluZywgbnVtYmVyPlxuICAgIH0pOiBhbnkge1xuICAgICAgICBpZiAoIXByb3BEYXRhIHx8IHR5cGVvZiBwcm9wRGF0YSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wRGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZhbHVlID0gcHJvcERhdGEudmFsdWU7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBwcm9wRGF0YS50eXBlO1xuXG4gICAgICAgIC8vIOWkhOeQhm51bGzlgLxcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG56m6VVVJROWvueixoe+8jOi9rOaNouS4um51bGxcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUudXVpZCA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG6IqC54K55byV55SoXG4gICAgICAgIGlmICh0eXBlID09PSAnY2MuTm9kZScgJiYgdmFsdWU/LnV1aWQpIHtcbiAgICAgICAgICAgIC8vIOWcqOmihOWItuS9k+S4re+8jOiKgueCueW8leeUqOmcgOimgei9rOaNouS4uiBfX2lkX18g5b2i5byPXG4gICAgICAgICAgICBpZiAoY29udGV4dD8ubm9kZVV1aWRUb0luZGV4ICYmIGNvbnRleHQubm9kZVV1aWRUb0luZGV4Lmhhcyh2YWx1ZS51dWlkKSkge1xuICAgICAgICAgICAgICAgIC8vIOWGhemDqOW8leeUqO+8mui9rOaNouS4ul9faWRfX+agvOW8j1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGNvbnRleHQubm9kZVV1aWRUb0luZGV4LmdldCh2YWx1ZS51dWlkKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlpJbpg6jlvJXnlKjvvJrorr7nva7kuLpudWxs77yM5Zug5Li65aSW6YOo6IqC54K55LiN5bGe5LqO6aKE5Yi25L2T57uT5p6EXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vZGUgcmVmZXJlbmNlIFVVSUQgJHt2YWx1ZS51dWlkfSBub3QgZm91bmQgaW4gcHJlZmFiIGNvbnRleHQsIHNldHRpbmcgdG8gbnVsbCAoZXh0ZXJuYWwgcmVmZXJlbmNlKWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpITnkIbotYTmupDlvJXnlKjvvIjpooTliLbkvZPjgIHnurnnkIbjgIHnsr7ngbXluKfnrYnvvIlcbiAgICAgICAgaWYgKHZhbHVlPy51dWlkICYmIChcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5QcmVmYWInIHx8IFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLlRleHR1cmUyRCcgfHwgXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuU3ByaXRlRnJhbWUnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuTWF0ZXJpYWwnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQW5pbWF0aW9uQ2xpcCcgfHxcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5BdWRpb0NsaXAnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuRm9udCcgfHxcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5Bc3NldCdcbiAgICAgICAgKSkge1xuICAgICAgICAgICAgLy8g5a+55LqO6aKE5Yi25L2T5byV55So77yM5L+d5oyB5Y6f5aeLVVVJROagvOW8j1xuICAgICAgICAgICAgY29uc3QgdXVpZFRvVXNlID0gdHlwZSA9PT0gJ2NjLlByZWZhYicgPyB2YWx1ZS51dWlkIDogdGhpcy51dWlkVG9Db21wcmVzc2VkSWQodmFsdWUudXVpZCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwiX191dWlkX19cIjogdXVpZFRvVXNlLFxuICAgICAgICAgICAgICAgIFwiX19leHBlY3RlZFR5cGVfX1wiOiB0eXBlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG57uE5Lu25byV55So77yI5YyF5ous5YW35L2T55qE57uE5Lu257G75Z6L5aaCY2MuTGFiZWwsIGNjLkJ1dHRvbuetie+8iVxuICAgICAgICBpZiAodmFsdWU/LnV1aWQgJiYgKHR5cGUgPT09ICdjYy5Db21wb25lbnQnIHx8IFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLkxhYmVsJyB8fCB0eXBlID09PSAnY2MuQnV0dG9uJyB8fCB0eXBlID09PSAnY2MuU3ByaXRlJyB8fCBcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5VSVRyYW5zZm9ybScgfHwgdHlwZSA9PT0gJ2NjLlJpZ2lkQm9keTJEJyB8fCBcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5Cb3hDb2xsaWRlcjJEJyB8fCB0eXBlID09PSAnY2MuQW5pbWF0aW9uJyB8fCBcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5BdWRpb1NvdXJjZScgfHwgKHR5cGU/LnN0YXJ0c1dpdGgoJ2NjLicpICYmICF0eXBlLmluY2x1ZGVzKCdAJykpKSkge1xuICAgICAgICAgICAgLy8g5Zyo6aKE5Yi25L2T5Lit77yM57uE5Lu25byV55So5Lmf6ZyA6KaB6L2s5o2i5Li6IF9faWRfXyDlvaLlvI9cbiAgICAgICAgICAgIGlmIChjb250ZXh0Py5jb21wb25lbnRVdWlkVG9JbmRleCAmJiBjb250ZXh0LmNvbXBvbmVudFV1aWRUb0luZGV4Lmhhcyh2YWx1ZS51dWlkKSkge1xuICAgICAgICAgICAgICAgIC8vIOWGhemDqOW8leeUqO+8mui9rOaNouS4ul9faWRfX+agvOW8j1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb21wb25lbnQgcmVmZXJlbmNlICR7dHlwZX0gVVVJRCAke3ZhbHVlLnV1aWR9IGZvdW5kIGluIHByZWZhYiBjb250ZXh0LCBjb252ZXJ0aW5nIHRvIF9faWRfX2ApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGNvbnRleHQuY29tcG9uZW50VXVpZFRvSW5kZXguZ2V0KHZhbHVlLnV1aWQpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWklumDqOW8leeUqO+8muiuvue9ruS4um51bGzvvIzlm6DkuLrlpJbpg6jnu4Tku7bkuI3lsZ7kuo7pooTliLbkvZPnu5PmnoRcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29tcG9uZW50IHJlZmVyZW5jZSAke3R5cGV9IFVVSUQgJHt2YWx1ZS51dWlkfSBub3QgZm91bmQgaW4gcHJlZmFiIGNvbnRleHQsIHNldHRpbmcgdG8gbnVsbCAoZXh0ZXJuYWwgcmVmZXJlbmNlKWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpITnkIblpI3mnYLnsbvlnovvvIzmt7vliqBfX3R5cGVfX+agh+iusFxuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjYy5Db2xvcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIixcbiAgICAgICAgICAgICAgICAgICAgXCJyXCI6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLnIpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgXCJnXCI6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLmcpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgXCJiXCI6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLmIpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgXCJhXCI6IHZhbHVlLmEgIT09IHVuZGVmaW5lZCA/IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLmEpKSkgOiAyNTVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2MuVmVjMycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogTnVtYmVyKHZhbHVlLngpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiBOdW1iZXIodmFsdWUueSkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ6XCI6IE51bWJlcih2YWx1ZS56KSB8fCAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NjLlZlYzInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzJcIiwgXG4gICAgICAgICAgICAgICAgICAgIFwieFwiOiBOdW1iZXIodmFsdWUueCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IE51bWJlcih2YWx1ZS55KSB8fCAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NjLlNpemUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlNpemVcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aFwiOiBOdW1iZXIodmFsdWUud2lkdGgpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IE51bWJlcih2YWx1ZS5oZWlnaHQpIHx8IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2MuUXVhdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUXVhdFwiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogTnVtYmVyKHZhbHVlLngpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiBOdW1iZXIodmFsdWUueSkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ6XCI6IE51bWJlcih2YWx1ZS56KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcIndcIjogdmFsdWUudyAhPT0gdW5kZWZpbmVkID8gTnVtYmVyKHZhbHVlLncpIDogMVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpITnkIbmlbDnu4TnsbvlnotcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAvLyDoioLngrnmlbDnu4RcbiAgICAgICAgICAgIGlmIChwcm9wRGF0YS5lbGVtZW50VHlwZURhdGE/LnR5cGUgPT09ICdjYy5Ob2RlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtPy51dWlkICYmIGNvbnRleHQ/Lm5vZGVVdWlkVG9JbmRleD8uaGFzKGl0ZW0udXVpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IFwiX19pZF9fXCI6IGNvbnRleHQubm9kZVV1aWRUb0luZGV4LmdldChpdGVtLnV1aWQpIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSkuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOi1hOa6kOaVsOe7hFxuICAgICAgICAgICAgaWYgKHByb3BEYXRhLmVsZW1lbnRUeXBlRGF0YT8udHlwZSAmJiBwcm9wRGF0YS5lbGVtZW50VHlwZURhdGEudHlwZS5zdGFydHNXaXRoKCdjYy4nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtPy51dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiX191dWlkX19cIjogdGhpcy51dWlkVG9Db21wcmVzc2VkSWQoaXRlbS51dWlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIl9fZXhwZWN0ZWRUeXBlX19cIjogcHJvcERhdGEuZWxlbWVudFR5cGVEYXRhLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSkuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gbnVsbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWfuuehgOexu+Wei+aVsOe7hFxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm1hcChpdGVtID0+IGl0ZW0/LnZhbHVlICE9PSB1bmRlZmluZWQgPyBpdGVtLnZhbHVlIDogaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlhbbku5blpI3mnYLlr7nosaHnsbvlnovvvIzkv53mjIHljp/moLfkvYbnoa7kv53mnIlfX3R5cGVfX+agh+iusFxuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlICYmIHR5cGUuc3RhcnRzV2l0aCgnY2MuJykpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiB0eXBlLFxuICAgICAgICAgICAgICAgIC4uLnZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuespuWQiOW8leaTjuagh+WHhueahOiKgueCueWvueixoVxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlRW5naW5lU3RhbmRhcmROb2RlKG5vZGVEYXRhOiBhbnksIHBhcmVudE5vZGVJbmRleDogbnVtYmVyIHwgbnVsbCwgbm9kZU5hbWU/OiBzdHJpbmcpOiBhbnkge1xuICAgICAgICAvLyDosIPor5XvvJrmiZPljbDljp/lp4voioLngrnmlbDmja7vvIjlt7Lms6jph4rvvIlcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ+WOn+Wni+iKgueCueaVsOaNrjonLCBKU09OLnN0cmluZ2lmeShub2RlRGF0YSwgbnVsbCwgMikpO1xuICAgICAgICBcbiAgICAgICAgLy8g5o+Q5Y+W6IqC54K555qE5Z+65pys5bGe5oCnXG4gICAgICAgIGNvbnN0IGdldFZhbHVlID0gKHByb3A6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3A/LnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3A7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucG9zaXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5wb3NpdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucm90YXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5yb3RhdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwLCB3OiAxIH07XG4gICAgICAgIGNvbnN0IHNjYWxlID0gZ2V0VmFsdWUobm9kZURhdGEuc2NhbGUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5zY2FsZSkgfHwgeyB4OiAxLCB5OiAxLCB6OiAxIH07XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGdldFZhbHVlKG5vZGVEYXRhLmFjdGl2ZSkgPz8gZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LmFjdGl2ZSkgPz8gdHJ1ZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IG5vZGVOYW1lIHx8IGdldFZhbHVlKG5vZGVEYXRhLm5hbWUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5uYW1lKSB8fCAnTm9kZSc7XG4gICAgICAgIGNvbnN0IGxheWVyID0gZ2V0VmFsdWUobm9kZURhdGEubGF5ZXIpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5sYXllcikgfHwgMTA3Mzc0MTgyNDtcblxuICAgICAgICAvLyDosIPor5XovpPlh7pcbiAgICAgICAgY29uc29sZS5sb2coYOWIm+W7uuiKgueCuTogJHtuYW1lfSwgcGFyZW50Tm9kZUluZGV4OiAke3BhcmVudE5vZGVJbmRleH1gKTtcblxuICAgICAgICBjb25zdCBwYXJlbnRSZWYgPSBwYXJlbnROb2RlSW5kZXggIT09IG51bGwgPyB7IFwiX19pZF9fXCI6IHBhcmVudE5vZGVJbmRleCB9IDogbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coYOiKgueCuSAke25hbWV9IOeahOeItuiKgueCueW8leeUqDpgLCBwYXJlbnRSZWYpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuTm9kZVwiLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBuYW1lLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwiX3BhcmVudFwiOiBwYXJlbnRSZWYsXG4gICAgICAgICAgICBcIl9jaGlsZHJlblwiOiBbXSwgLy8g5a2Q6IqC54K55byV55So5bCG5Zyo6YCS5b2S6L+H56iL5Lit5Yqo5oCB5re75YqgXG4gICAgICAgICAgICBcIl9hY3RpdmVcIjogYWN0aXZlLFxuICAgICAgICAgICAgXCJfY29tcG9uZW50c1wiOiBbXSwgLy8g57uE5Lu25byV55So5bCG5Zyo5aSE55CG57uE5Lu25pe25Yqo5oCB5re75YqgXG4gICAgICAgICAgICBcIl9wcmVmYWJcIjogeyBcIl9faWRfX1wiOiAwIH0sIC8vIOS4tOaXtuWAvO+8jOWQjue7reS8muiiq+ato+ehruiuvue9rlxuICAgICAgICAgICAgXCJfbHBvc1wiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogcG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICBcInlcIjogcG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICBcInpcIjogcG9zaXRpb24uelxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xyb3RcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5RdWF0XCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHJvdGF0aW9uLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHJvdGF0aW9uLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHJvdGF0aW9uLnosXG4gICAgICAgICAgICAgICAgXCJ3XCI6IHJvdGF0aW9uLndcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9sc2NhbGVcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHNjYWxlLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHNjYWxlLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHNjYWxlLnpcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9tb2JpbGl0eVwiOiAwLFxuICAgICAgICAgICAgXCJfbGF5ZXJcIjogbGF5ZXIsXG4gICAgICAgICAgICBcIl9ldWxlclwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICBcInpcIjogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2lkXCI6IFwiXCJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDku47oioLngrnmlbDmja7kuK3mj5Dlj5ZVVUlEXG4gICAgICovXG4gICAgcHJpdmF0ZSBleHRyYWN0Tm9kZVV1aWQobm9kZURhdGE6IGFueSk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBpZiAoIW5vZGVEYXRhKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWwneivleWkmuenjeaWueW8j+iOt+WPllVVSURcbiAgICAgICAgY29uc3Qgc291cmNlcyA9IFtcbiAgICAgICAgICAgIG5vZGVEYXRhLnV1aWQsXG4gICAgICAgICAgICBub2RlRGF0YS52YWx1ZT8udXVpZCxcbiAgICAgICAgICAgIG5vZGVEYXRhLl9fdXVpZF9fLFxuICAgICAgICAgICAgbm9kZURhdGEudmFsdWU/Ll9fdXVpZF9fLFxuICAgICAgICAgICAgbm9kZURhdGEuaWQsXG4gICAgICAgICAgICBub2RlRGF0YS52YWx1ZT8uaWRcbiAgICAgICAgXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyAmJiBzb3VyY2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuacgOWwj+WMlueahOiKgueCueWvueixoe+8jOS4jeWMheWQq+S7u+S9lee7hOS7tuS7pemBv+WFjeS+nei1lumXrumimFxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlTWluaW1hbE5vZGUobm9kZURhdGE6IGFueSwgbm9kZU5hbWU/OiBzdHJpbmcpOiBhbnkge1xuICAgICAgICAvLyDmj5Dlj5boioLngrnnmoTln7rmnKzlsZ7mgKdcbiAgICAgICAgY29uc3QgZ2V0VmFsdWUgPSAocHJvcDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvcD8udmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3AudmFsdWU7XG4gICAgICAgICAgICBpZiAocHJvcCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcDtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBnZXRWYWx1ZShub2RlRGF0YS5wb3NpdGlvbikgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LnBvc2l0aW9uKSB8fCB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcbiAgICAgICAgY29uc3Qgcm90YXRpb24gPSBnZXRWYWx1ZShub2RlRGF0YS5yb3RhdGlvbikgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LnJvdGF0aW9uKSB8fCB7IHg6IDAsIHk6IDAsIHo6IDAsIHc6IDEgfTtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSBnZXRWYWx1ZShub2RlRGF0YS5zY2FsZSkgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LnNjYWxlKSB8fCB7IHg6IDEsIHk6IDEsIHo6IDEgfTtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gZ2V0VmFsdWUobm9kZURhdGEuYWN0aXZlKSA/PyBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8uYWN0aXZlKSA/PyB0cnVlO1xuICAgICAgICBjb25zdCBuYW1lID0gbm9kZU5hbWUgfHwgZ2V0VmFsdWUobm9kZURhdGEubmFtZSkgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/Lm5hbWUpIHx8ICdOb2RlJztcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBnZXRWYWx1ZShub2RlRGF0YS5sYXllcikgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LmxheWVyKSB8fCAzMzU1NDQzMjtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLk5vZGVcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogbmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9wYXJlbnRcIjogbnVsbCxcbiAgICAgICAgICAgIFwiX2NoaWxkcmVuXCI6IFtdLFxuICAgICAgICAgICAgXCJfYWN0aXZlXCI6IGFjdGl2ZSxcbiAgICAgICAgICAgIFwiX2NvbXBvbmVudHNcIjogW10sIC8vIOepuueahOe7hOS7tuaVsOe7hO+8jOmBv+WFjee7hOS7tuS+nei1lumXrumimFxuICAgICAgICAgICAgXCJfcHJlZmFiXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHBvc1wiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogcG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICBcInlcIjogcG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICBcInpcIjogcG9zaXRpb24uelxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xyb3RcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5RdWF0XCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHJvdGF0aW9uLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHJvdGF0aW9uLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHJvdGF0aW9uLnosXG4gICAgICAgICAgICAgICAgXCJ3XCI6IHJvdGF0aW9uLndcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9sc2NhbGVcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHNjYWxlLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHNjYWxlLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHNjYWxlLnpcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9sYXllclwiOiBsYXllcixcbiAgICAgICAgICAgIFwiX2V1bGVyXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgIFwielwiOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfaWRcIjogXCJcIlxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuagh+WHhueahCBtZXRhIOaWh+S7tuWGheWuuVxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlU3RhbmRhcmRNZXRhQ29udGVudChwcmVmYWJOYW1lOiBzdHJpbmcsIHByZWZhYlV1aWQ6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcInZlclwiOiBcIjIuMC4zXCIsXG4gICAgICAgICAgICBcImltcG9ydGVyXCI6IFwicHJlZmFiXCIsXG4gICAgICAgICAgICBcImltcG9ydGVkXCI6IHRydWUsXG4gICAgICAgICAgICBcInV1aWRcIjogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgIFwiZmlsZXNcIjogW1xuICAgICAgICAgICAgICAgIFwiLmpzb25cIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwic3ViTWV0YXNcIjoge30sXG4gICAgICAgICAgICBcInVzZXJEYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcInN5bmNOb2RlTmFtZVwiOiBwcmVmYWJOYW1lLFxuICAgICAgICAgICAgICAgIFwiaGFzSWNvblwiOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWwneivleWwhuWOn+Wni+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+i1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY29udmVydE5vZGVUb1ByZWZhYkluc3RhbmNlKG5vZGVVdWlkOiBzdHJpbmcsIHByZWZhYlV1aWQ6IHN0cmluZywgcHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyDov5nkuKrlip/og73pnIDopoHmt7HlhaXnmoTlnLrmma/nvJbovpHlmajpm4bmiJDvvIzmmoLml7bov5Tlm57lpLHotKVcbiAgICAgICAgICAgIC8vIOWcqOWunumZheeahOW8leaTjuS4re+8jOi/mea2ieWPiuWIsOWkjeadgueahOmihOWItuS9k+WunuS+i+WMluWSjOiKgueCueabv+aNoumAu+i+kVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+i+eahOWKn+iDvemcgOimgeabtOa3seWFpeeahOW8leaTjumbhuaIkCcpO1xuICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6ICfoioLngrnovazmjaLkuLrpooTliLbkvZPlrp7kvovpnIDopoHmm7Tmt7HlhaXnmoTlvJXmk47pm4bmiJDmlK/mjIEnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZXN0b3JlUHJlZmFiTm9kZShub2RlVXVpZDogc3RyaW5nLCBhc3NldFV1aWQ6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8g5L2/55So5a6Y5pa5QVBJIHJlc3RvcmUtcHJlZmFiIOi/mOWOn+mihOWItuS9k+iKgueCuVxuICAgICAgICAgICAgKEVkaXRvci5NZXNzYWdlLnJlcXVlc3QgYXMgYW55KSgnc2NlbmUnLCAncmVzdG9yZS1wcmVmYWInLCBub2RlVXVpZCwgYXNzZXRVdWlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRVdWlkOiBhc3NldFV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T6IqC54K56L+Y5Y6f5oiQ5YqfJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDpooTliLbkvZPoioLngrnov5jljp/lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5Z+65LqO5a6Y5pa56aKE5Yi25L2T5qC85byP55qE5paw5a6e546w5pa55rOVXG4gICAgcHJpdmF0ZSBhc3luYyBnZXROb2RlRGF0YUZvclByZWZhYihub2RlVXVpZDogc3RyaW5nKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBhbnk7IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlJywgbm9kZVV1aWQpLnRoZW4oKG5vZGVEYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICfoioLngrnkuI3lrZjlnKgnIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBub2RlRGF0YSB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVN0YW5kYXJkUHJlZmFiRGF0YShub2RlRGF0YTogYW55LCBwcmVmYWJOYW1lOiBzdHJpbmcsIHByZWZhYlV1aWQ6IHN0cmluZyk6IFByb21pc2U8YW55W10+IHtcbiAgICAgICAgLy8g5Z+65LqO5a6Y5pa5Q2FudmFzLnByZWZhYuagvOW8j+WIm+W7uumihOWItuS9k+aVsOaNrue7k+aehFxuICAgICAgICBjb25zdCBwcmVmYWJEYXRhOiBhbnlbXSA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudElkID0gMDtcblxuICAgICAgICAvLyDnrKzkuIDkuKrlhYPntKDvvJpjYy5QcmVmYWIg6LWE5rqQ5a+56LGhXG4gICAgICAgIGNvbnN0IHByZWZhYkFzc2V0ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlByZWZhYlwiLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBwcmVmYWJOYW1lLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwiX25hdGl2ZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJkYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJvcHRpbWl6YXRpb25Qb2xpY3lcIjogMCxcbiAgICAgICAgICAgIFwicGVyc2lzdGVudFwiOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBwcmVmYWJEYXRhLnB1c2gocHJlZmFiQXNzZXQpO1xuICAgICAgICBjdXJyZW50SWQrKztcblxuICAgICAgICAvLyDnrKzkuozkuKrlhYPntKDvvJrmoLnoioLngrlcbiAgICAgICAgY29uc3Qgcm9vdE5vZGUgPSBhd2FpdCB0aGlzLmNyZWF0ZU5vZGVPYmplY3Qobm9kZURhdGEsIG51bGwsIHByZWZhYkRhdGEsIGN1cnJlbnRJZCk7XG4gICAgICAgIHByZWZhYkRhdGEucHVzaChyb290Tm9kZS5ub2RlKTtcbiAgICAgICAgY3VycmVudElkID0gcm9vdE5vZGUubmV4dElkO1xuXG4gICAgICAgIC8vIOa3u+WKoOagueiKgueCueeahCBQcmVmYWJJbmZvIC0g5L+u5aSNYXNzZXTlvJXnlKjkvb/nlKhVVUlEXG4gICAgICAgIGNvbnN0IHJvb3RQcmVmYWJJbmZvID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlByZWZhYkluZm9cIixcbiAgICAgICAgICAgIFwicm9vdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiYXNzZXRcIjoge1xuICAgICAgICAgICAgICAgIFwiX191dWlkX19cIjogcHJlZmFiVXVpZFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZmlsZUlkXCI6IHRoaXMuZ2VuZXJhdGVGaWxlSWQoKSxcbiAgICAgICAgICAgIFwiaW5zdGFuY2VcIjogbnVsbCxcbiAgICAgICAgICAgIFwidGFyZ2V0T3ZlcnJpZGVzXCI6IFtdLFxuICAgICAgICAgICAgXCJuZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3RzXCI6IFtdXG4gICAgICAgIH07XG4gICAgICAgIHByZWZhYkRhdGEucHVzaChyb290UHJlZmFiSW5mbyk7XG5cbiAgICAgICAgcmV0dXJuIHByZWZhYkRhdGE7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZU5vZGVPYmplY3Qobm9kZURhdGE6IGFueSwgcGFyZW50SWQ6IG51bWJlciB8IG51bGwsIHByZWZhYkRhdGE6IGFueVtdLCBjdXJyZW50SWQ6IG51bWJlcik6IFByb21pc2U8eyBub2RlOiBhbnk7IG5leHRJZDogbnVtYmVyIH0+IHtcbiAgICAgICAgY29uc3Qgbm9kZUlkID0gY3VycmVudElkKys7XG4gICAgICAgIFxuICAgICAgICAvLyDmj5Dlj5boioLngrnnmoTln7rmnKzlsZ7mgKcgLSDpgILphY1xdWVyeS1ub2RlLXRyZWXnmoTmlbDmja7moLzlvI9cbiAgICAgICAgY29uc3QgZ2V0VmFsdWUgPSAocHJvcDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvcD8udmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3AudmFsdWU7XG4gICAgICAgICAgICBpZiAocHJvcCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcDtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBnZXRWYWx1ZShub2RlRGF0YS5wb3NpdGlvbikgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LnBvc2l0aW9uKSB8fCB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcbiAgICAgICAgY29uc3Qgcm90YXRpb24gPSBnZXRWYWx1ZShub2RlRGF0YS5yb3RhdGlvbikgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LnJvdGF0aW9uKSB8fCB7IHg6IDAsIHk6IDAsIHo6IDAsIHc6IDEgfTtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSBnZXRWYWx1ZShub2RlRGF0YS5zY2FsZSkgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LnNjYWxlKSB8fCB7IHg6IDEsIHk6IDEsIHo6IDEgfTtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gZ2V0VmFsdWUobm9kZURhdGEuYWN0aXZlKSA/PyBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8uYWN0aXZlKSA/PyB0cnVlO1xuICAgICAgICBjb25zdCBuYW1lID0gZ2V0VmFsdWUobm9kZURhdGEubmFtZSkgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/Lm5hbWUpIHx8ICdOb2RlJztcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBnZXRWYWx1ZShub2RlRGF0YS5sYXllcikgfHwgZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LmxheWVyKSB8fCAzMzU1NDQzMjtcblxuICAgICAgICBjb25zdCBub2RlOiBhbnkgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuTm9kZVwiLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBuYW1lLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwiX3BhcmVudFwiOiBwYXJlbnRJZCAhPT0gbnVsbCA/IHsgXCJfX2lkX19cIjogcGFyZW50SWQgfSA6IG51bGwsXG4gICAgICAgICAgICBcIl9jaGlsZHJlblwiOiBbXSxcbiAgICAgICAgICAgIFwiX2FjdGl2ZVwiOiBhY3RpdmUsXG4gICAgICAgICAgICBcIl9jb21wb25lbnRzXCI6IFtdLFxuICAgICAgICAgICAgXCJfcHJlZmFiXCI6IHBhcmVudElkID09PSBudWxsID8ge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGN1cnJlbnRJZCsrXG4gICAgICAgICAgICB9IDogbnVsbCxcbiAgICAgICAgICAgIFwiX2xwb3NcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHBvc2l0aW9uLnpcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9scm90XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUXVhdFwiLFxuICAgICAgICAgICAgICAgIFwieFwiOiByb3RhdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiByb3RhdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiByb3RhdGlvbi56LFxuICAgICAgICAgICAgICAgIFwid1wiOiByb3RhdGlvbi53XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHNjYWxlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBzY2FsZS54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBzY2FsZS55LFxuICAgICAgICAgICAgICAgIFwielwiOiBzY2FsZS56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbW9iaWxpdHlcIjogMCxcbiAgICAgICAgICAgIFwiX2xheWVyXCI6IGxheWVyLFxuICAgICAgICAgICAgXCJfZXVsZXJcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ6XCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9pZFwiOiBcIlwiXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8g5pqC5pe26Lez6L+HVUlUcmFuc2Zvcm3nu4Tku7bku6Xpgb/lhY1fZ2V0RGVwZW5kQ29tcG9uZW506ZSZ6K+vXG4gICAgICAgIC8vIOWQjue7remAmui/h0VuZ2luZSBBUEnliqjmgIHmt7vliqBcbiAgICAgICAgY29uc29sZS5sb2coYOiKgueCuSAke25hbWV9IOaaguaXtui3s+i/h1VJVHJhbnNmb3Jt57uE5Lu277yM6YG/5YWN5byV5pOO5L6d6LWW6ZSZ6K+vYCk7XG4gICAgICAgIFxuICAgICAgICAvLyDlpITnkIblhbbku5bnu4Tku7bvvIjmmoLml7bot7Pov4fvvIzkuJPms6jkuo7kv67lpI1VSVRyYW5zZm9ybemXrumimO+8iVxuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gdGhpcy5leHRyYWN0Q29tcG9uZW50c0Zyb21Ob2RlKG5vZGVEYXRhKTtcbiAgICAgICAgaWYgKGNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOiKgueCuSAke25hbWV9IOWMheWQqyAke2NvbXBvbmVudHMubGVuZ3RofSDkuKrlhbbku5bnu4Tku7bvvIzmmoLml7bot7Pov4fku6XkuJPms6jkuo5VSVRyYW5zZm9ybeS/ruWkjWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG5a2Q6IqC54K5IC0g5L2/55SocXVlcnktbm9kZS10cmVl6I635Y+W55qE5a6M5pW057uT5p6EXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuVG9Qcm9jZXNzID0gdGhpcy5nZXRDaGlsZHJlblRvUHJvY2Vzcyhub2RlRGF0YSk7XG4gICAgICAgIGlmIChjaGlsZHJlblRvUHJvY2Vzcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgPT09IOWkhOeQhuWtkOiKgueCuSA9PT1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDljIXlkKsgJHtjaGlsZHJlblRvUHJvY2Vzcy5sZW5ndGh9IOS4quWtkOiKgueCuWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGREYXRhID0gY2hpbGRyZW5Ub1Byb2Nlc3NbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGROYW1lID0gY2hpbGREYXRhLm5hbWUgfHwgY2hpbGREYXRhLnZhbHVlPy5uYW1lIHx8ICfmnKrnn6UnO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlpITnkIbnrKwke2kgKyAxfeS4quWtkOiKgueCuTogJHtjaGlsZE5hbWV9YCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRJZCA9IGN1cnJlbnRJZDtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5fY2hpbGRyZW4ucHVzaCh7IFwiX19pZF9fXCI6IGNoaWxkSWQgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDpgJLlvZLliJvlu7rlrZDoioLngrlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZU5vZGVPYmplY3QoY2hpbGREYXRhLCBub2RlSWQsIHByZWZhYkRhdGEsIGN1cnJlbnRJZCk7XG4gICAgICAgICAgICAgICAgICAgIHByZWZhYkRhdGEucHVzaChjaGlsZFJlc3VsdC5ub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudElkID0gY2hpbGRSZXN1bHQubmV4dElkO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g5a2Q6IqC54K55LiN6ZyA6KaBUHJlZmFiSW5mb++8jOWPquacieagueiKgueCuemcgOimgVxuICAgICAgICAgICAgICAgICAgICAvLyDlrZDoioLngrnnmoRfcHJlZmFi5bqU6K+l6K6+572u5Li6bnVsbFxuICAgICAgICAgICAgICAgICAgICBjaGlsZFJlc3VsdC5ub2RlLl9wcmVmYWIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOKchSDmiJDlip/mt7vliqDlrZDoioLngrk6ICR7Y2hpbGROYW1lfWApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOWkhOeQhuWtkOiKgueCuSAke2NoaWxkTmFtZX0g5pe25Ye66ZSZOmAsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBub2RlLCBuZXh0SWQ6IGN1cnJlbnRJZCB9O1xuICAgIH1cblxuICAgIC8vIOS7juiKgueCueaVsOaNruS4reaPkOWPlue7hOS7tuS/oeaBr1xuICAgIHByaXZhdGUgZXh0cmFjdENvbXBvbmVudHNGcm9tTm9kZShub2RlRGF0YTogYW55KTogYW55W10ge1xuICAgICAgICBjb25zdCBjb21wb25lbnRzOiBhbnlbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8g5LuO5LiN5ZCM5L2N572u5bCd6K+V6I635Y+W57uE5Lu25pWw5o2uXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudFNvdXJjZXMgPSBbXG4gICAgICAgICAgICBub2RlRGF0YS5fX2NvbXBzX18sXG4gICAgICAgICAgICBub2RlRGF0YS5jb21wb25lbnRzLFxuICAgICAgICAgICAgbm9kZURhdGEudmFsdWU/Ll9fY29tcHNfXyxcbiAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlPy5jb21wb25lbnRzXG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBjb21wb25lbnRTb3VyY2VzKSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKC4uLnNvdXJjZS5maWx0ZXIoY29tcCA9PiBjb21wICYmIChjb21wLl9fdHlwZV9fIHx8IGNvbXAudHlwZSkpKTtcbiAgICAgICAgICAgICAgICBicmVhazsgLy8g5om+5Yiw5pyJ5pWI55qE57uE5Lu25pWw57uE5bCx6YCA5Ye6XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgIH1cbiAgICBcbiAgICAvLyDliJvlu7rmoIflh4bnmoTnu4Tku7blr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZVN0YW5kYXJkQ29tcG9uZW50T2JqZWN0KGNvbXBvbmVudERhdGE6IGFueSwgbm9kZUlkOiBudW1iZXIsIHByZWZhYkluZm9JZDogbnVtYmVyKTogYW55IHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudERhdGEuX190eXBlX18gfHwgY29tcG9uZW50RGF0YS50eXBlO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFjb21wb25lbnRUeXBlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ+e7hOS7tue8uuWwkeexu+Wei+S/oeaBrzonLCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDln7rnoYDnu4Tku7bnu5PmnoQgLSDln7rkuo7lrpjmlrnpooTliLbkvZPmoLzlvI9cbiAgICAgICAgY29uc3QgY29tcG9uZW50OiBhbnkgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IGNvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICBcIl9uYW1lXCI6IFwiXCIsXG4gICAgICAgICAgICBcIl9vYmpGbGFnc1wiOiAwLFxuICAgICAgICAgICAgXCJub2RlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBub2RlSWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9lbmFibGVkXCI6IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnZW5hYmxlZCcsIHRydWUpLFxuICAgICAgICAgICAgXCJfX3ByZWZhYlwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogcHJlZmFiSW5mb0lkXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnmja7nu4Tku7bnsbvlnovmt7vliqDnibnlrprlsZ7mgKdcbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnRTcGVjaWZpY1Byb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhLCBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoF9pZOWxnuaAp1xuICAgICAgICBjb21wb25lbnQuX2lkID0gXCJcIjtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIFxuICAgIC8vIOa3u+WKoOe7hOS7tueJueWumueahOWxnuaAp1xuICAgIHByaXZhdGUgYWRkQ29tcG9uZW50U3BlY2lmaWNQcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55LCBjb21wb25lbnREYXRhOiBhbnksIGNvbXBvbmVudFR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBzd2l0Y2ggKGNvbXBvbmVudFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NjLlVJVHJhbnNmb3JtJzpcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFVJVHJhbnNmb3JtUHJvcGVydGllcyhjb21wb25lbnQsIGNvbXBvbmVudERhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2MuU3ByaXRlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFNwcml0ZVByb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NjLkxhYmVsJzpcbiAgICAgICAgICAgICAgICB0aGlzLmFkZExhYmVsUHJvcGVydGllcyhjb21wb25lbnQsIGNvbXBvbmVudERhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2MuQnV0dG9uJzpcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1dHRvblByb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8g5a+55LqO5pyq55+l57G75Z6L55qE57uE5Lu277yM5aSN5Yi25omA5pyJ5a6J5YWo55qE5bGe5oCnXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRHZW5lcmljUHJvcGVydGllcyhjb21wb25lbnQsIGNvbXBvbmVudERhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFVJVHJhbnNmb3Jt57uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRVSVRyYW5zZm9ybVByb3BlcnRpZXMoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBjb21wb25lbnQuX2NvbnRlbnRTaXplID0gdGhpcy5jcmVhdGVTaXplT2JqZWN0KFxuICAgICAgICAgICAgdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICdjb250ZW50U2l6ZScsIHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgY29tcG9uZW50Ll9hbmNob3JQb2ludCA9IHRoaXMuY3JlYXRlVmVjMk9iamVjdChcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnYW5jaG9yUG9pbnQnLCB7IHg6IDAuNSwgeTogMC41IH0pXG4gICAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIC8vIFNwcml0Zee7hOS7tuWxnuaAp1xuICAgIHByaXZhdGUgYWRkU3ByaXRlUHJvcGVydGllcyhjb21wb25lbnQ6IGFueSwgY29tcG9uZW50RGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbXBvbmVudC5fdmlzRmxhZ3MgPSAwO1xuICAgICAgICBjb21wb25lbnQuX2N1c3RvbU1hdGVyaWFsID0gbnVsbDtcbiAgICAgICAgY29tcG9uZW50Ll9zcmNCbGVuZEZhY3RvciA9IDI7XG4gICAgICAgIGNvbXBvbmVudC5fZHN0QmxlbmRGYWN0b3IgPSA0O1xuICAgICAgICBjb21wb25lbnQuX2NvbG9yID0gdGhpcy5jcmVhdGVDb2xvck9iamVjdChcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnY29sb3InLCB7IHI6IDI1NSwgZzogMjU1LCBiOiAyNTUsIGE6IDI1NSB9KVxuICAgICAgICApO1xuICAgICAgICBjb21wb25lbnQuX3Nwcml0ZUZyYW1lID0gdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICdzcHJpdGVGcmFtZScsIG51bGwpO1xuICAgICAgICBjb21wb25lbnQuX3R5cGUgPSB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ3R5cGUnLCAwKTtcbiAgICAgICAgY29tcG9uZW50Ll9maWxsVHlwZSA9IDA7XG4gICAgICAgIGNvbXBvbmVudC5fc2l6ZU1vZGUgPSB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ3NpemVNb2RlJywgMSk7XG4gICAgICAgIGNvbXBvbmVudC5fZmlsbENlbnRlciA9IHRoaXMuY3JlYXRlVmVjMk9iamVjdCh7IHg6IDAsIHk6IDAgfSk7XG4gICAgICAgIGNvbXBvbmVudC5fZmlsbFN0YXJ0ID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9maWxsUmFuZ2UgPSAwO1xuICAgICAgICBjb21wb25lbnQuX2lzVHJpbW1lZE1vZGUgPSB0cnVlO1xuICAgICAgICBjb21wb25lbnQuX3VzZUdyYXlzY2FsZSA9IGZhbHNlO1xuICAgICAgICBjb21wb25lbnQuX2F0bGFzID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgLy8gTGFiZWznu4Tku7blsZ7mgKdcbiAgICBwcml2YXRlIGFkZExhYmVsUHJvcGVydGllcyhjb21wb25lbnQ6IGFueSwgY29tcG9uZW50RGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbXBvbmVudC5fdmlzRmxhZ3MgPSAwO1xuICAgICAgICBjb21wb25lbnQuX2N1c3RvbU1hdGVyaWFsID0gbnVsbDtcbiAgICAgICAgY29tcG9uZW50Ll9zcmNCbGVuZEZhY3RvciA9IDI7XG4gICAgICAgIGNvbXBvbmVudC5fZHN0QmxlbmRGYWN0b3IgPSA0O1xuICAgICAgICBjb21wb25lbnQuX2NvbG9yID0gdGhpcy5jcmVhdGVDb2xvck9iamVjdChcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnY29sb3InLCB7IHI6IDAsIGc6IDAsIGI6IDAsIGE6IDI1NSB9KVxuICAgICAgICApO1xuICAgICAgICBjb21wb25lbnQuX3N0cmluZyA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnc3RyaW5nJywgJ0xhYmVsJyk7XG4gICAgICAgIGNvbXBvbmVudC5faG9yaXpvbnRhbEFsaWduID0gMTtcbiAgICAgICAgY29tcG9uZW50Ll92ZXJ0aWNhbEFsaWduID0gMTtcbiAgICAgICAgY29tcG9uZW50Ll9hY3R1YWxGb250U2l6ZSA9IDIwO1xuICAgICAgICBjb21wb25lbnQuX2ZvbnRTaXplID0gdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICdmb250U2l6ZScsIDIwKTtcbiAgICAgICAgY29tcG9uZW50Ll9mb250RmFtaWx5ID0gJ0FyaWFsJztcbiAgICAgICAgY29tcG9uZW50Ll9saW5lSGVpZ2h0ID0gNDA7XG4gICAgICAgIGNvbXBvbmVudC5fb3ZlcmZsb3cgPSAxO1xuICAgICAgICBjb21wb25lbnQuX2VuYWJsZVdyYXBUZXh0ID0gZmFsc2U7XG4gICAgICAgIGNvbXBvbmVudC5fZm9udCA9IG51bGw7XG4gICAgICAgIGNvbXBvbmVudC5faXNTeXN0ZW1Gb250VXNlZCA9IHRydWU7XG4gICAgICAgIGNvbXBvbmVudC5faXNJdGFsaWMgPSBmYWxzZTtcbiAgICAgICAgY29tcG9uZW50Ll9pc0JvbGQgPSBmYWxzZTtcbiAgICAgICAgY29tcG9uZW50Ll9pc1VuZGVybGluZSA9IGZhbHNlO1xuICAgICAgICBjb21wb25lbnQuX3VuZGVybGluZUhlaWdodCA9IDI7XG4gICAgICAgIGNvbXBvbmVudC5fY2FjaGVNb2RlID0gMDtcbiAgICB9XG4gICAgXG4gICAgLy8gQnV0dG9u57uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRCdXR0b25Qcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55LCBjb21wb25lbnREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29tcG9uZW50LmNsaWNrRXZlbnRzID0gW107XG4gICAgICAgIGNvbXBvbmVudC5faW50ZXJhY3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgY29tcG9uZW50Ll90cmFuc2l0aW9uID0gMjtcbiAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxDb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoeyByOiAyMTQsIGc6IDIxNCwgYjogMjE0LCBhOiAyNTUgfSk7XG4gICAgICAgIGNvbXBvbmVudC5faG92ZXJDb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoeyByOiAyMTEsIGc6IDIxMSwgYjogMjExLCBhOiAyNTUgfSk7XG4gICAgICAgIGNvbXBvbmVudC5fcHJlc3NlZENvbG9yID0gdGhpcy5jcmVhdGVDb2xvck9iamVjdCh7IHI6IDI1NSwgZzogMjU1LCBiOiAyNTUsIGE6IDI1NSB9KTtcbiAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZENvbG9yID0gdGhpcy5jcmVhdGVDb2xvck9iamVjdCh7IHI6IDEyNCwgZzogMTI0LCBiOiAxMjQsIGE6IDI1NSB9KTtcbiAgICAgICAgY29tcG9uZW50Ll9kdXJhdGlvbiA9IDAuMTtcbiAgICAgICAgY29tcG9uZW50Ll96b29tU2NhbGUgPSAxLjI7XG4gICAgfVxuICAgIFxuICAgIC8vIOa3u+WKoOmAmueUqOWxnuaAp1xuICAgIHByaXZhdGUgYWRkR2VuZXJpY1Byb3BlcnRpZXMoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyDlj6rlpI3liLblronlhajnmoTjgIHlt7Lnn6XnmoTlsZ7mgKdcbiAgICAgICAgY29uc3Qgc2FmZVByb3BlcnRpZXMgPSBbJ2VuYWJsZWQnLCAnY29sb3InLCAnc3RyaW5nJywgJ2ZvbnRTaXplJywgJ3Nwcml0ZUZyYW1lJywgJ3R5cGUnLCAnc2l6ZU1vZGUnXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBzYWZlUHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudERhdGEuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCBwcm9wKTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRbYF8ke3Byb3B9YF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8g5Yib5bu6VmVjMuWvueixoVxuICAgIHByaXZhdGUgY3JlYXRlVmVjMk9iamVjdChkYXRhOiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzJcIixcbiAgICAgICAgICAgIFwieFwiOiBkYXRhPy54IHx8IDAsXG4gICAgICAgICAgICBcInlcIjogZGF0YT8ueSB8fCAwXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIC8vIOWIm+W7ulZlYzPlr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZVZlYzNPYmplY3QoZGF0YTogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICBcInhcIjogZGF0YT8ueCB8fCAwLFxuICAgICAgICAgICAgXCJ5XCI6IGRhdGE/LnkgfHwgMCxcbiAgICAgICAgICAgIFwielwiOiBkYXRhPy56IHx8IDBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLy8g5Yib5bu6U2l6ZeWvueixoVxuICAgIHByaXZhdGUgY3JlYXRlU2l6ZU9iamVjdChkYXRhOiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlNpemVcIixcbiAgICAgICAgICAgIFwid2lkdGhcIjogZGF0YT8ud2lkdGggfHwgMTAwLFxuICAgICAgICAgICAgXCJoZWlnaHRcIjogZGF0YT8uaGVpZ2h0IHx8IDEwMFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvLyDliJvlu7pDb2xvcuWvueixoVxuICAgIHByaXZhdGUgY3JlYXRlQ29sb3JPYmplY3QoZGF0YTogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5Db2xvclwiLFxuICAgICAgICAgICAgXCJyXCI6IGRhdGE/LnIgPz8gMjU1LFxuICAgICAgICAgICAgXCJnXCI6IGRhdGE/LmcgPz8gMjU1LFxuICAgICAgICAgICAgXCJiXCI6IGRhdGE/LmIgPz8gMjU1LFxuICAgICAgICAgICAgXCJhXCI6IGRhdGE/LmEgPz8gMjU1XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8g5Yik5pat5piv5ZCm5bqU6K+l5aSN5Yi257uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBzaG91bGRDb3B5Q29tcG9uZW50UHJvcGVydHkoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgLy8g6Lez6L+H5YaF6YOo5bGe5oCn5ZKM5bey5aSE55CG55qE5bGe5oCnXG4gICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aCgnX18nKSB8fCBrZXkgPT09ICdfZW5hYmxlZCcgfHwga2V5ID09PSAnbm9kZScgfHwga2V5ID09PSAnZW5hYmxlZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6Lez6L+H5Ye95pWw5ZKMdW5kZWZpbmVk5YC8XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxuICAgIC8vIOiOt+WPlue7hOS7tuWxnuaAp+WAvCAtIOmHjeWRveWQjeS7pemBv+WFjeWGsueqgVxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhOiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBhbnkpOiBhbnkge1xuICAgICAgICAvLyDlsJ3or5Xnm7TmjqXojrflj5blsZ7mgKdcbiAgICAgICAgaWYgKGNvbXBvbmVudERhdGFbcHJvcGVydHlOYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHRyYWN0VmFsdWUoY29tcG9uZW50RGF0YVtwcm9wZXJ0eU5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5bCd6K+V5LuOdmFsdWXlsZ7mgKfkuK3ojrflj5ZcbiAgICAgICAgaWYgKGNvbXBvbmVudERhdGEudmFsdWUgJiYgY29tcG9uZW50RGF0YS52YWx1ZVtwcm9wZXJ0eU5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV4dHJhY3RWYWx1ZShjb21wb25lbnREYXRhLnZhbHVlW3Byb3BlcnR5TmFtZV0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlsJ3or5XluKbkuIvliJLnur/liY3nvIDnmoTlsZ7mgKflkI1cbiAgICAgICAgY29uc3QgcHJlZml4ZWROYW1lID0gYF8ke3Byb3BlcnR5TmFtZX1gO1xuICAgICAgICBpZiAoY29tcG9uZW50RGF0YVtwcmVmaXhlZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV4dHJhY3RWYWx1ZShjb21wb25lbnREYXRhW3ByZWZpeGVkTmFtZV0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgICBcbiAgICAvLyDmj5Dlj5blsZ7mgKflgLxcbiAgICBwcml2YXRlIGV4dHJhY3RWYWx1ZShkYXRhOiBhbnkpOiBhbnkge1xuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzmnIl2YWx1ZeWxnuaAp++8jOS8mOWFiOS9v+eUqHZhbHVlXG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgZGF0YS5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOaYr+W8leeUqOWvueixoe+8jOS/neaMgeWOn+agt1xuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmIChkYXRhLl9faWRfXyAhPT0gdW5kZWZpbmVkIHx8IGRhdGEuX191dWlkX18gIT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVN0YW5kYXJkTWV0YURhdGEocHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJ2ZXJcIjogXCIxLjEuNTBcIixcbiAgICAgICAgICAgIFwiaW1wb3J0ZXJcIjogXCJwcmVmYWJcIixcbiAgICAgICAgICAgIFwiaW1wb3J0ZWRcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwidXVpZFwiOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgXCJmaWxlc1wiOiBbXG4gICAgICAgICAgICAgICAgXCIuanNvblwiXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCJzdWJNZXRhc1wiOiB7fSxcbiAgICAgICAgICAgIFwidXNlckRhdGFcIjoge1xuICAgICAgICAgICAgICAgIFwic3luY05vZGVOYW1lXCI6IHByZWZhYk5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNhdmVQcmVmYWJXaXRoTWV0YShwcmVmYWJQYXRoOiBzdHJpbmcsIHByZWZhYkRhdGE6IGFueVtdLCBtZXRhRGF0YTogYW55KTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShwcmVmYWJEYXRhLCBudWxsLCAyKTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkobWV0YURhdGEsIG51bGwsIDIpO1xuXG4gICAgICAgICAgICAvLyDnoa7kv53ot6/lvoTku6UucHJlZmFi57uT5bC+XG4gICAgICAgICAgICBjb25zdCBmaW5hbFByZWZhYlBhdGggPSBwcmVmYWJQYXRoLmVuZHNXaXRoKCcucHJlZmFiJykgPyBwcmVmYWJQYXRoIDogYCR7cHJlZmFiUGF0aH0ucHJlZmFiYDtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFQYXRoID0gYCR7ZmluYWxQcmVmYWJQYXRofS5tZXRhYDtcblxuICAgICAgICAgICAgLy8g5L2/55SoYXNzZXQtZGIgQVBJ5Yib5bu66aKE5Yi25L2T5paH5Lu2XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnY3JlYXRlLWFzc2V0JywgZmluYWxQcmVmYWJQYXRoLCBwcmVmYWJDb250ZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIOWIm+W7um1ldGHmlofku7ZcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBtZXRhUGF0aCwgbWV0YUNvbnRlbnQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coYD09PSDpooTliLbkvZPkv53lrZjlrozmiJAgPT09YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5paH5Lu25bey5L+d5a2YOiAke2ZpbmFsUHJlZmFiUGF0aH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNZXRh5paH5Lu25bey5L+d5a2YOiAke21ldGFQYXRofWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOmihOWItuS9k+aVsOe7hOaAu+mVv+W6pjogJHtwcmVmYWJEYXRhLmxlbmd0aH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDpooTliLbkvZPmoLnoioLngrnntKLlvJU6ICR7cHJlZmFiRGF0YS5sZW5ndGggLSAxfWApO1xuXG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+S/neWtmOmihOWItuS9k+aWh+S7tuaXtuWHuumUmTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICAgICAgfVxuICAgIH1cblxufSJdfQ==