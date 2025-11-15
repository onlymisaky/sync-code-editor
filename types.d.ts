export interface InquirerCheckboxItem<T extends string = string> {
  // 唯一标识符
  value: T;
  // 显示名称
  name: string;
}

export type EditorValues = 'vscode' | 'cursor' | 'windsurf' | 'trae' | 'trae-cn';

export interface Editor extends InquirerCheckboxItem<EditorValues> {
  /** 编辑器文件路径 */
  appDataDir: string;

  /** 编辑器用户数据路径 */
  userDataDir: string;

  /** 编辑器首页 URL */
  homepage: string;
}

export type EditorMap = Record<EditorValues, Editor>;

export type ConfigurationValues = 'settings' | 'keybindings' | 'snippets' | 'extensions';

export interface Configuration extends InquirerCheckboxItem<ConfigurationValues> {
  /** 是否必须完整同步 */
  complete?: boolean;

  /** 要同步的内容数组，每个元素为文件路径或目录路径 */
  fileGroups?: { type: 'file' | 'dir'; path: string }[];
}

export type ConfigurationMap = Record<ConfigurationValues, Configuration>;

export interface Extension extends InquirerCheckboxItem {
  /** 插件包名 */
  pkgName: string;

  /** 插件作者 */
  author: string;

  /** 插件版本 */
  ver: string;

  /** 插件安装路径 */
  dir: string;
}

export interface SyncConfigItemResult {
  type: 'file' | 'dir' | 'extension';
  path: string;
  successed: boolean;
  extName?: string;
  message?: string;
}

export interface SyncConfigResult {
  [configurationName: string]: SyncConfigItemResult[];
}

export interface SyncResult {
  [editorName: string]: SyncConfigResult;
}
