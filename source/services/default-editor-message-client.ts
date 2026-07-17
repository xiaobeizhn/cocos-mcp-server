import { EditorMessageClient } from '../types';
import { createCocos38EditorMessageClient } from './editor-message-client';

// The extension uses one lazy client when an executor is constructed outside MCPServer.
// MCPServer's normal construction path uses this same singleton.
export const editorMessages: EditorMessageClient = createCocos38EditorMessageClient();
