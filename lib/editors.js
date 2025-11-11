const path = require('path');
const os = require('os');

const homeDir = os.homedir();

/**
 * 编辑器配置路径映射
 */
const editorPaths = {
  vscode: path.join(homeDir, 'Library', 'Application Support', 'Code', 'User'),
  cursor: path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User'),
  windsurf: path.join(homeDir, 'Library', 'Application Support', 'Windsurf', 'User'),
  trae: path.join(homeDir, 'Library', 'Application Support', 'Trae', 'User'),
  'trae-cn': path.join(homeDir, 'Library', 'Application Support', 'Trae CN', 'User')
};

/**
 * 编辑器显示名称映射
 */
const editorNames = {
  vscode: 'Visual Studio Code',
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  trae: 'Trae',
  'trae-cn': 'Trae CN'
};

/**
 * 需要同步的配置项定义
 */
const syncItems = {
  'settings.json': {
    name: 'settings.json',
    displayName: '编辑器设置 (settings.json)',
    type: 'file',
    path: 'settings.json'
  },
  'keybindings.json': {
    name: 'keybindings.json',
    displayName: '快捷键绑定 (keybindings.json)',
    type: 'file',
    path: 'keybindings.json'
  },
  'snippets': {
    name: 'snippets',
    displayName: '代码片段 (snippets/*)',
    type: 'directory',
    path: 'snippets'
  },
  'project-manager': {
    name: 'project-manager',
    displayName: '项目管理器配置 (alefragnani.project-manager/projects.json)',
    type: 'file',
    path: path.join('alefragnani.project-manager', 'projects.json')
  }
};

/**
 * 获取编辑器的配置路径
 * @param {string} editorKey - 编辑器键名
 * @returns {string} 配置路径
 */
function getEditorPath(editorKey) {
  return editorPaths[editorKey];
}

/**
 * 获取所有可用的编辑器列表
 * @returns {Array} 编辑器列表 [{name, value, displayName}]
 */
function getEditorList() {
  return Object.keys(editorPaths).map(key => ({
    name: editorNames[key],
    value: key,
    displayName: editorNames[key]
  }));
}

/**
 * 获取所有可用的同步项列表
 * @returns {Array} 同步项列表 [{name, value, displayName}]
 */
function getSyncItemList() {
  return Object.keys(syncItems).map(key => ({
    name: syncItems[key].displayName,
    value: key,
    displayName: syncItems[key].displayName
  }));
}

/**
 * 获取同步项的完整路径
 * @param {string} editorKey - 编辑器键名
 * @param {string} itemKey - 同步项键名
 * @returns {string} 完整路径
 */
function getSyncItemPath(editorKey, itemKey) {
  const editorPath = getEditorPath(editorKey);
  const item = syncItems[itemKey];
  if (!item) {
    throw new Error(`未知的同步项: ${itemKey}`);
  }
  return path.join(editorPath, item.path);
}

/**
 * 获取同步项信息
 * @param {string} itemKey - 同步项键名
 * @returns {Object} 同步项信息
 */
function getSyncItemInfo(itemKey) {
  return syncItems[itemKey];
}

module.exports = {
  editorNames,
  syncItems,
  getEditorPath,
  getEditorList,
  getSyncItemList,
  getSyncItemPath,
  getSyncItemInfo
};