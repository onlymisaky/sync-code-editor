export type EditorKeys = 'vscode' | 'cursor' | 'windsurf' | 'trae' | 'tran-cn';

export interface Editor {
  key: EditorKeys;

  /** 编辑器显示名称 */
  name: string;

  /** 编辑器文件路径 */
  path: string;
}

export type EditorMap = Record<EditorKeys, Omit<Editor, 'key'>>;

export type ConfigurationKeys = 'settings' | 'keybindings' | 'snippets' | 'project-manager';

export interface Configuration {
  key: ConfigurationKeys;

  /** 同步项显示名称 */
  name: string;

  /** 要同步的内容数组，每个元素为文件路径或目录路径 */
  files: { type: 'file' | 'dir'; path: string }[];
}

export type ConfigurationMap = Record<ConfigurationKeys, Omit<Configuration, 'key'>>;

export interface SyncResultItem {
  reason?: { errorFiles?: string[]; missingFiles?: string[] };
  configurationName?: string;
  success: boolean;
  message?: string;
}

export interface SyncResult {
  [editorName: string]: Array<SyncResultItem>;
}
