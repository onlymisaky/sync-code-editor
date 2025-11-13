# sync-code-editor

同步您的设备上所有以 Visual Studio Code 为内核的编辑器配置。

## 📋 功能特性

- 一键同步多个 VS Code 内核编辑器的配置
- 提供详细的同步结果报告
- [ ] 编辑器管理
- [ ] 配置项管理

## 🔧 支持的编辑器

- Visual Studio Code
- Cursor
- Windsurf
- Trae
- Trae CN

## ⚙️ 支持的配置项

- 编辑器设置 (`settings.json`)
- 快捷键绑定 (`keybindings.json`)
- 代码片段 (`snippets/*`)
- [ ] 插件 (`~/[编辑器路径]/extensions/*`)

## 📦 安装

```bash
# 使用 npm 全局安装
npm install -g sync-code-editor

# 或者使用 yarn 全局安装
yarn global add sync-code-editor
```

## 🚀 使用方法

1. 在终端中运行以下命令启动工具：
   ```bash
   sync-code-editor
   ```

2. 按照提示选择源编辑器（从哪个编辑器复制配置）

3. 选择要同步的配置项（使用空格键选择，回车键确认）

4. 等待同步完成，查看同步结果报告

## ⚠️ 注意事项

- 关于编辑器数据路径
  - 默认 macOS 系统上的编辑器数据路径为 `~/Library/Application Support/[编辑器路径]`
  - 默认 Windows 系统上的编辑器数据路径为 `%APPDATA%/[编辑器路径]` 或 `~/AppData/Roaming/[编辑器路径]`
  - 默认 Linux 系统上的编辑器数据路径为 `~/.config/[编辑器路径]`
- 如果您的编辑器数据路径不在以上默认路径中，请提 issue 或 PR 来添加对您系统的支持
- 同步前请确保您对上述路径有读写权限
- 同步操作会**覆盖**目标编辑器的现有配置，请确保在同步前备份重要配置
