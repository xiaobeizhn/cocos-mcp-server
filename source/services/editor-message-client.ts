import { cocos38Capabilities, routeKey } from '../adapters/cocos-3.8';
import { CapabilityReport, EditorCapability, EditorMessageClient, EditorMessageTransport } from '../types';
import { McpError, normalizeError } from './error-normalizer';

export interface EditorMessageClientOptions {
    transport?: EditorMessageTransport;
    getVersion?: () => string;
    now?: () => Date;
}

export class Cocos38EditorMessageClient implements EditorMessageClient {
    private reportPromise?: Promise<CapabilityReport>;
    private readonly transport: EditorMessageTransport;
    private readonly getVersion: () => string;
    private readonly now: () => Date;

    constructor(options: EditorMessageClientOptions = {}) {
        this.transport = options.transport ?? getCreatorTransport();
        this.getVersion = options.getVersion ?? (() => {
            const editor = (globalThis as any).Editor;
            return editor?.App?.version ?? 'unknown';
        });
        this.now = options.now ?? (() => new Date());
    }

    request(packageName: string, message: string, ...args: any[]): Promise<any> {
        return this.transport.request(packageName, message, ...args);
    }

    async send(packageName: string, message: string, ...args: any[]): Promise<any> {
        return this.transport.send(packageName, message, ...args);
    }

    async broadcast(message: string, ...args: any[]): Promise<any> {
        return this.transport.broadcast(message, ...args);
    }

    clearCapabilityCache(): void { this.reportPromise = undefined; }

    getCapabilityReport(): Promise<CapabilityReport> {
        if (!this.reportPromise) this.reportPromise = this.probeCapabilities();
        return this.reportPromise;
    }

    async invokeCapability<T = any>(capability: EditorCapability, args?: any): Promise<T> {
        const routes = cocos38Capabilities[capability];
        const report = await this.getCapabilityReport();
        const supported = routes.filter(candidate => report.supportedMessages.has(routeKey(candidate.route)));
        const candidates = routes.map(candidate => routeKey(candidate.route));
        const selected = supported[0] ?? routes[0];

        if (report.probeSource !== 'probe-unavailable' && supported.length === 0) {
            throw this.unsupported(capability, report, candidates);
        }

        try {
            return selected.decode(await this.request(selected.route.package, selected.route.message, ...selected.encode(args))) as T;
        } catch (error) {
            const fallback = routes[1];
            if (fallback && selected === routes[0] && report.probeSource === 'probe-unavailable' && isMessageMissingError(error)) {
                try {
                    return fallback.decode(await this.request(fallback.route.package, fallback.route.message, ...fallback.encode(args))) as T;
                } catch (fallbackError) {
                    if (isMessageMissingError(fallbackError)) throw this.unsupported(capability, report, candidates);
                    throw this.withDiagnostics(fallbackError, capability, report, candidates, routeKey(fallback.route));
                }
            }
            // No fallback to try and the only route's message is missing → the
            // capability is unsupported in this editor (rather than an internal error).
            if (!fallback && isMessageMissingError(error)) {
                throw this.unsupported(capability, report, candidates);
            }
            throw this.withDiagnostics(error, capability, report, candidates, routeKey(selected.route));
        }
    }

    private async probeCapabilities(): Promise<CapabilityReport> {
        const base = { editorVersion: this.getVersion(), probedAt: this.now().toISOString() };
        try {
            const result = await this.request('editor', 'query-ipc-events');
            const supportedMessages = extractMessageKeys(result);
            return { ...base, supportedMessages, probeSource: supportedMessages.size ? 'probe' : 'probe-partial' };
        } catch (error) {
            return { ...base, supportedMessages: new Set<string>(), probeSource: 'probe-unavailable', probeError: normalizeError(error, 'EDITOR_UNAVAILABLE') };
        }
    }

    private unsupported(capability: EditorCapability, report: CapabilityReport, candidates: string[]): McpError {
        return new McpError('UNSUPPORTED_CAPABILITY', `Editor does not support capability: ${capability}`, { details: { capability, editorVersion: report.editorVersion, candidates, probeSource: report.probeSource } });
    }

    private withDiagnostics(error: unknown, capability: EditorCapability, report: CapabilityReport, candidates: string[], route: string): McpError {
        const normalized = normalizeError(error, 'INTERNAL_ERROR', { capability, editorVersion: report.editorVersion, candidates, route, probeSource: report.probeSource });
        return new McpError(normalized.code, normalized.message, normalized);
    }
}

export function createCocos38EditorMessageClient(options: EditorMessageClientOptions = {}): EditorMessageClient {
    return new Cocos38EditorMessageClient(options);
}

function getCreatorTransport(): EditorMessageTransport {
    const editor = (globalThis as any).Editor;
    if (!editor?.Message) {
        return {
            request: async () => { throw new McpError('EDITOR_UNAVAILABLE', 'Editor.Message is unavailable'); },
            send: async () => { throw new McpError('EDITOR_UNAVAILABLE', 'Editor.Message is unavailable'); },
            broadcast: async () => { throw new McpError('EDITOR_UNAVAILABLE', 'Editor.Message is unavailable'); }
        };
    }
    return {
        request: (packageName, message, ...args) => editor.Message.request(packageName, message, ...args),
        send: (packageName, message, ...args) => editor.Message.send(packageName, message, ...args),
        broadcast: (message, ...args) => editor.Message.broadcast(message, ...args)
    };
}

export function isMessageMissingError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /(?:message|ipc)\s+(?:['"`][^'"`]+['"`]\s+)?(?:does not exist|not found|is not registered)|unknown\s+(?:ipc\s+)?message/i.test(message);
}

export function extractMessageKeys(value: unknown): Set<string> {
    const keys = new Set<string>();
    const visit = (current: unknown, packageName?: string): void => {
        if (typeof current === 'string') {
            if (/^[^:\s]+:[^:\s]+$/.test(current)) keys.add(current);
            else if (packageName && /^[^\s]+$/.test(current)) keys.add(`${packageName}:${current}`);
            return;
        }
        if (Array.isArray(current)) { current.forEach(item => visit(item, packageName)); return; }
        if (!current || typeof current !== 'object') return;
        const record = current as Record<string, unknown>;
        if (typeof record.package === 'string' && typeof record.message === 'string') keys.add(`${record.package}:${record.message}`);
        for (const [key, child] of Object.entries(record)) {
            if (typeof child === 'string' && /^[^:\s]+$/.test(child) && /^[^:\s]+$/.test(key)) keys.add(`${key}:${child}`);
            else visit(child, /^[^:\s]+$/.test(key) ? key : packageName);
        }
    };
    visit(value);
    return keys;
}
