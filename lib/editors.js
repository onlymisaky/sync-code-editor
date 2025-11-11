const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const platform = os.platform();
const homeDir = os.homedir();
const appDataDir = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');

/**
 * 编辑器配置路径映射（根据平台动态生成）
 */
const editorConfigs = {
  vscode: { pathName: 'Code', displayName: 'Visual Studio Code' },
  cursor: { pathName: 'Cursor', displayName: 'Cursor' },
  windsurf: { pathName: 'Windsurf', displayName: 'Windsurf' },
  trae: { pathName: 'Trae', displayName: 'Trae' },
  'trae-cn': { pathName: 'Trae CN', displayName: 'Trae CN' }
};

/**
 * 根据平台获取编辑器配置路径
 * @param {string} editorPathName - 编辑器名称（在配置目录中的名称）
 * @returns {string} 配置路径
 */
function getEditorPathByPlatform(editorPathName) {
  if (platform === 'darwin') {
    // macOS
    return path.join(homeDir, 'Library', 'Application Support', editorPathName, 'User');
  } else if (platform === 'win32') {
    // Windows
    return path.join(appDataDir, editorPathName, 'User');
  } else {
    // Linux
    return path.join(homeDir, '.config', editorPathName, 'User');
  }
}

/**
 * 检测已安装的编辑器
 * @returns {Promise<Array>} 已安装的编辑器列表 [{name, value, displayName, path}]
 */
async function detectInstalledEditors() {
  const installedEditors = [];
  

  for (const [key, config] of Object.entries(editorConfigs)) {
    const editorPath = getEditorPathByPlatform(config.pathName);

    // 检查编辑器目录是否存在
    if (await fs.pathExists(editorPath)) {
      installedEditors.push({
        name: config.displayName,
        value: key,
        displayName: config.displayName,
        path: editorPath
      });
    }
  }

  return installedEditors;
}

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
  const config = editorConfigs[editorKey];
  if (!config) {
    throw new Error(`未知的编辑器: ${editorKey}`);
  }
  return getEditorPathByPlatform(config.pathName);
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
  editorConfigs,
  detectInstalledEditors,
  syncItems,
  getEditorPath,
  getSyncItemList,
  getSyncItemPath,
  getSyncItemInfo
};