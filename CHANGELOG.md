# Changelog

## [1.4.1] - 2026-06-02

### 修复

- 移除 `uuid` 外部依赖，改用 Node.js 内置 `crypto.randomUUID()`，修复 Creator 扩展主进程加载时报 `Cannot find module 'uuid'`。
- `prefab_validate_prefab`、`prefab_load_prefab` 等工具改为通过 `query-asset-info` + 文件系统读取 prefab，兼容 Creator 3.8.8（不再调用不存在的 `asset-db - read-asset` 与 `scene - load-asset`）。
- 修正 `readPrefabFile` 对 prefab JSON 数组格式的解析，以及 `establishPrefabConnection` 中错误的 `.data` 访问。
- 移除 prefab 读取逻辑中硬编码的开发者本地路径，统一使用 `Editor.Project.path` 解析资源路径。

### 工程

- 更新 `.gitignore`，排除 `.claude/`、`.cursor/` 及 `*.local.json`，避免导入到其他 Cocos 项目时带入本地 IDE 配置。

### 迁移说明

克隆或复制本插件到其他项目后，请在插件目录执行：

```bash
npm install
```

Cursor MCP 配置示例：

```json
{
  "mcpServers": {
    "cocos-creator": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```
