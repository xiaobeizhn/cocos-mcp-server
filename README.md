# Cocos Creator MCP 服务器插件

- **基于https://github.com/DaxianLee/cocos-mcp-serve**
- **基于v1.4.0，看样子是不会更新开源版本了，遂fork了一份自己修复一些3.8.8下的兼容性bug**

## 主要功能类别（部分示例）

- **scene_management**：场景管理（获取/打开/保存/新建/关闭场景）
- **node_query / node_lifecycle / node_transform**：节点查询、创建、删除、属性变更
- **component_manage / component_script / component_query**：组件增删、脚本挂载、组件信息
- **prefab_browse / prefab_lifecycle / prefab_instance**：预制体浏览、创建、实例化、同步
- **asset_manage / asset_analyze**：资源导入、删除、依赖分析
- **project_manage / project_build_system**：项目运行、构建、配置信息
- **debug_console / debug_logs**：控制台与日志管理
- **preferences_manage**：偏好设置
- **server_info**：服务器信息
- **broadcast_message**：消息广播



## 快速使用

**Claude cli配置：**

```
claude mcp add --transport http cocos-creator http://127.0.0.1:3000/mcp（使用你自己配置的端口号）
```

**Claude客户端配置：**

```
{

  "mcpServers": {

		"cocos-creator": {

 		"type": "http",

		"url": "http://127.0.0.1:3000/mcp"

		 }

	  }

}
```

**Cursor或VS类MCP配置**

```
{

  "mcpServers": { 

   "cocos-creator": {
      "url": "http://localhost:3000/mcp"
   }
  }

}
```

## 功能特性

### 🎯 场景操作 (scene_*)
- **scene_management**: 场景管理 - 获取当前场景、打开/保存/创建/关闭场景，支持场景列表查询
- **scene_hierarchy**: 场景层级 - 获取完整场景结构，支持组件信息包含
- **scene_execution_control**: 执行控制 - 执行组件方法、场景脚本、预制体同步

### 🎮 节点操作 (node_*)
- **node_query**: 节点查询 - 按名称/模式查找节点，获取节点信息，检测2D/3D类型
- **node_lifecycle**: 节点生命周期 - 创建/删除节点，支持组件预装、预制体实例化
- **node_transform**: 节点变换 - 修改节点名称、位置、旋转、缩放、可见性等属性
- **node_hierarchy**: 节点层级 - 移动、复制、粘贴节点，支持层级结构操作
- **node_clipboard**: 节点剪贴板 - 复制/粘贴/剪切节点操作
- **node_property_management**: 属性管理 - 重置节点属性、组件属性、变换属性

### 🔧 组件操作 (component_*)
- **component_manage**: 组件管理 - 添加/删除引擎组件（cc.Sprite、cc.Button等）
- **component_script**: 脚本组件 - 挂载/移除自定义脚本组件
- **component_query**: 组件查询 - 获取组件列表、详细信息、可用组件类型
- **set_component_property**: 属性设置 - 设置单个或多个组件属性值

### 📦 预制体操作 (prefab_*)
- **prefab_browse**: 预制体浏览 - 列出预制体、查看信息、验证文件
- **prefab_lifecycle**: 预制体生命周期 - 从节点创建预制体、删除预制体
- **prefab_instance**: 预制体实例 - 实例化到场景、解除链接、应用更改、还原原始
- **prefab_edit**: 预制体编辑 - 进入/退出编辑模式、保存预制体、测试更改

### 🚀 项目控制 (project_*)
- **project_manage**: 项目管理 - 运行项目、构建项目、获取项目信息和设置
- **project_build_system**: 构建系统 - 控制构建面板、检查构建状态、预览服务器管理

### 🔍 调试工具 (debug_*)
- **debug_console**: 控制台管理 - 获取/清空控制台日志，支持过滤和限制
- **debug_logs**: 日志分析 - 读取/搜索/分析项目日志文件，支持模式匹配
- **debug_system**: 系统调试 - 获取编辑器信息、性能统计、环境信息

### 📁 资源管理 (asset_*)
- **asset_manage**: 资源管理 - 批量导入/删除资源、保存元数据、生成URL
- **asset_analyze**: 资源分析 - 获取依赖关系、导出资源清单
- **asset_system**: 资源系统 - 刷新资源、查询资源数据库状态
- **asset_query**: 资源查询 - 按类型/文件夹查询资源、获取详细信息
- **asset_operations**: 资源操作 - 创建/复制/移动/删除/保存/重新导入资源

### ⚙️ 偏好设置 (preferences_*)
- **preferences_manage**: 偏好管理 - 获取/设置编辑器偏好设置
- **preferences_global**: 全局设置 - 管理全局配置和系统设置

### 🌐 服务器与广播 (server_* / broadcast_*)
- **server_info**: 服务器信息 - 获取服务器状态、项目详情、环境信息
- **broadcast_message**: 消息广播 - 监听和广播自定义消息

### 🖼️ 参考图片 (referenceImage_*)
- **reference_image_manage**: 参考图片管理 - 添加/删除/管理场景视图中的参考图片
- **reference_image_view**: 参考图片视图 - 控制参考图片的显示和编辑

### 🎨 场景视图 (sceneView_*)
- **scene_view_control**: 场景视图控制 - 控制Gizmo工具、坐标系、视图模式
- **scene_view_tools**: 场景视图工具 - 管理场景视图的各种工具和选项

### ✅ 验证工具 (validation_*)
- **validation_scene**: 场景验证 - 验证场景完整性、检查缺失资源
- **validation_asset**: 资源验证 - 验证资源引用、检查资源完整性

### 🛠️ 工具管理
- **工具配置系统**: 选择性启用/禁用工具，支持多套配置
- **配置持久化**: 自动保存和加载工具配置
- **配置导入导出**: 支持工具配置的导入导出功能
- **实时状态管理**: 工具状态实时更新和同步

### 🚀 核心优势
- **操作码统一**: 所有工具采用"类别_操作"命名，参数Schema统一
- **高复用性**: 50个核心工具覆盖99%编辑器功能
- **AI友好**: 参数清晰、文档完善、调用简单
- **性能优化**: 降低50% token消耗，提升AI调用成功率
- **完全兼容**: 与Cocos Creator官方API 100%对齐

## 安装说明

### 1. 复制插件文件

将整个 `cocos-mcp-server` 文件夹复制到您的 Cocos Creator 项目的 `extensions` 目录中，您也可以直接在扩展管理器中导入项目：

```
您的项目/
├── assets/
├── extensions/
│   └── cocos-mcp-server/          <- 将插件放在这里
│       ├── source/
│       ├── dist/
│       ├── package.json
│       └── ...
├── settings/
└── ...
```

### 2. 安装依赖

```bash
cd extensions/cocos-mcp-server
npm install
```

### 3. 构建插件

```bash
npm run build
```

### 4. 启用插件

1. 重启 Cocos Creator 或刷新扩展
2. 插件将出现在扩展菜单中
3. 点击 `扩展 > Cocos MCP Server` 打开控制面板

## 使用方法

### 启动服务器

1. 从 `扩展 > Cocos MCP Server` 打开 MCP 服务器面板
2. 配置设置：
   - **端口**: HTTP 服务器端口（默认：3000）
   - **自动启动**: 编辑器启动时自动启动服务器
   - **调试日志**: 启用详细日志以便开发调试
   - **最大连接数**: 允许的最大并发连接数

3. 点击"启动服务器"开始接受连接

### 连接 AI 助手

服务器在 `http://localhost:3000/mcp`（或您配置的端口）上提供 HTTP 端点。

AI 助手可以使用 MCP 协议连接并访问所有可用工具。


## 开发

### 项目结构
```
cocos-mcp-server/
├── source/                    # TypeScript 源文件
│   ├── main.ts               # 插件入口点
│   ├── mcp-server.ts         # MCP 服务器实现
│   ├── settings.ts           # 设置管理
│   ├── types/                # TypeScript 类型定义
│   ├── tools/                # 工具实现
│   │   ├── scene-tools.ts
│   │   ├── node-tools.ts
│   │   ├── component-tools.ts
│   │   ├── prefab-tools.ts
│   │   ├── project-tools.ts
│   │   ├── debug-tools.ts
│   │   ├── preferences-tools.ts
│   │   ├── server-tools.ts
│   │   ├── broadcast-tools.ts
│   │   ├── scene-advanced-tools.ts (已整合到 node-tools.ts 和 scene-tools.ts)
│   │   ├── scene-view-tools.ts
│   │   ├── reference-image-tools.ts
│   │   └── asset-advanced-tools.ts
│   ├── panels/               # UI 面板实现
│   └── test/                 # 测试文件
├── dist/                     # 编译后的 JavaScript 输出
├── static/                   # 静态资源（图标等）
├── i18n/                     # 国际化文件
├── package.json              # 插件配置
└── tsconfig.json             # TypeScript 配置
```

### 从源码构建

```bash
# 安装依赖
npm install

# 开发构建（监视模式）
npm run watch

# 生产构建
npm run build
```

### 添加新工具

1. 在 `source/tools/` 中创建新的工具类
2. 实现 `ToolExecutor` 接口
3. 将工具添加到 `mcp-server.ts` 初始化中
4. 工具会自动通过 MCP 协议暴露

### TypeScript 支持

插件完全使用 TypeScript 编写，具备：
- 启用严格类型检查
- 为所有 API 提供全面的类型定义
- 开发时的 IntelliSense 支持
- 自动编译为 JavaScript

## 故障排除

### 常见问题

1. **服务器无法启动**: 检查端口可用性和防火墙设置
2. **工具不工作**: 确保场景已加载且 UUID 有效
3. **构建错误**: 运行 `npm run build` 检查 TypeScript 错误
4. **连接问题**: 验证 HTTP URL 和服务器状态

### 调试模式

在插件面板中启用调试日志以获取详细的操作日志。

### 使用调试工具

```json
{
  "tool": "debug_get_console_logs",
  "arguments": {"limit": 50, "filter": "error"}
}
```

```json
{
  "tool": "debug_validate_scene",
  "arguments": {"checkMissingAssets": true}
}
```

## 系统要求

- Cocos Creator 3.8.6 或更高版本
- Node.js（Cocos Creator 自带）
- TypeScript（作为开发依赖安装）

## 许可证

本插件供 Cocos Creator 项目使用,并且源代码一并打包，可以用于学习和交流。没有加密。可以支持你自己二次开发优化，任何本项目代码或者衍生代码均不能用于任何商用、转售，如果需要商用，请联系本人。

## 联系我加入群
<img alt="image" src="https://github.com/user-attachments/assets/a276682c-4586-480c-90e5-6db132e89e0f" width="400" height="400" />


