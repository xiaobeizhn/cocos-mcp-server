export interface MCPServerSettings {
    port: number;
    autoStart: boolean;
    enableDebugLog: boolean;
    allowedOrigins: string[];
    maxConnections: number;
}

export interface ServerStatus {
    running: boolean;
    port: number;
    clients: number;
}

export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
}

export type ErrorCode =
    | 'INVALID_ARGUMENT'
    | 'NOT_FOUND'
    | 'AMBIGUOUS_TARGET'
    | 'INVALID_PROPERTY'
    | 'EDITOR_BUSY'
    | 'EDITOR_UNAVAILABLE'
    | 'COMPILE_ERROR'
    | 'UNSUPPORTED_CAPABILITY'
    | 'TOOL_NOT_FOUND'
    | 'RESOURCE_NOT_FOUND'
    | 'METHOD_NOT_FOUND'
    | 'TIMEOUT'
    | 'INTERNAL_ERROR';

export interface StructuredError {
    code: ErrorCode;
    message: string;
    retryable: boolean;
    details: Record<string, unknown>;
    suggestions: string[];
}

export interface ToolResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: StructuredError | string;
    instruction?: string;
    warning?: string;
    editContext?: EditContext;
    verificationData?: any;
    updatedProperties?: string[];
}

export interface EditorMessageRoute {
    package: string;
    message: string;
}

export type EditorCapability =
    | 'asset.urlToUuid'
    | 'asset.uuidToUrl'
    | 'asset.refresh'
    | 'selection.queryNodes'
    | 'scene.createNode'
    | 'scene.instantiateAsset'
    | 'scene.deleteNodes'
    | 'scene.duplicateNodes'
    | 'scene.moveNodes'
    | 'scene.save'
    | 'scene.dirtyState'
    | 'component.add';

export interface CapabilityReport {
    editorVersion: string;
    supportedMessages: ReadonlySet<string>;
    probeSource: 'probe' | 'probe-partial' | 'probe-unavailable';
    probedAt: string;
    probeError?: StructuredError;
}

export interface EditorMessageTransport {
    request(packageName: string, message: string, ...args: any[]): Promise<any>;
    send(packageName: string, message: string, ...args: any[]): any;
    broadcast(message: string, ...args: any[]): any;
}

export interface EditorMessageClient {
    request(packageName: string, message: string, ...args: any[]): Promise<any>;
    send(packageName: string, message: string, ...args: any[]): Promise<any>;
    broadcast(message: string, ...args: any[]): Promise<any>;
    invokeCapability<T = any>(capability: EditorCapability, args?: any): Promise<T>;
    getCapabilityReport(): Promise<CapabilityReport>;
    clearCapabilityCache(): void;
}

export interface NodeInfo {
    uuid: string;
    name: string;
    active: boolean;
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
    parent?: string;
    children?: string[];
    components?: ComponentInfo[];
    layer?: number;
    mobility?: number;
}

export interface ComponentInfo {
    type: string;
    enabled: boolean;
    properties?: Record<string, any>;
}

export interface SceneInfo { name: string; uuid: string; path: string; }
export interface PrefabInfo { name: string; uuid: string; path: string; folder: string; createTime?: string; modifyTime?: string; dependencies?: string[]; }
export interface AssetInfo { name: string; uuid: string; path: string; type: string; size?: number; isDirectory: boolean; meta?: { ver: string; importer: string; }; }
export interface ProjectInfo { name: string; path: string; uuid: string; version: string; cocosVersion: string; }
export interface ConsoleMessage { timestamp: string; type: 'log' | 'warn' | 'error' | 'info'; message: string; stack?: string; }
export interface PerformanceStats { nodeCount: number; componentCount: number; drawCalls: number; triangles: number; memory: Record<string, any>; }
export interface ValidationIssue { type: 'error' | 'warning' | 'info'; category: string; message: string; details?: any; suggestion?: string; }
export interface ValidationResult { valid: boolean; issueCount: number; issues: ValidationIssue[]; }
export interface MCPClient { id: string; lastActivity: Date; userAgent?: string; }

export interface ToolExecutor {
    getTools(): ToolDefinition[];
    execute(toolName: string, args: any): Promise<ToolResponse>;
}

export interface ToolConfig { category: string; name: string; enabled: boolean; description: string; }
export interface ToolConfiguration { id: string; name: string; description?: string; tools: ToolConfig[]; createdAt: string; updatedAt: string; }
export interface ToolManagerSettings { configurations: ToolConfiguration[]; currentConfigId: string; maxConfigSlots: number; }
export interface ToolManagerState { availableTools: ToolConfig[]; currentConfiguration: ToolConfiguration | null; configurations: ToolConfiguration[]; }
export interface ResourceDefinition { uri: string; name: string; description: string; mimeType?: string; }
export interface ResourceReadResult { content: string; mimeType?: string; }
export interface ResourceProvider { getResources(): ResourceDefinition[]; readResource(uri: string, params: Record<string, string>): Promise<ResourceReadResult>; }
export type EditContext = 'scene' | 'prefab-stage';
export interface PrefabEditState { active: boolean; prefabPath: string; prefabUuid: string; rootUuid: string; openedAt: string; }
