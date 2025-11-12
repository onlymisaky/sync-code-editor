const path = require('path');

const fs = require('fs-extra');
const { getAppDataPathWithCache } = require('./utils');

/**
 * @type {import('../types').EditorMap}
 */
const editorMap = {
  vscode: {
    name: 'Visual Studio Code',
    path: getAppDataPathWithCache('Code'),
    homepage: 'https://code.visualstudio.com/'
  },
  cursor: {
    name: 'Cursor',
    path: getAppDataPathWithCache('Cursor'),
    homepage: 'https://cursor.com/'
  },
  windsurf: {
    name: 'Windsurf',
    path: getAppDataPathWithCache('Windsurf'),
    homepage: 'https://windsurf.com/'
  },
  trae: {
    name: 'Trae',
    path: getAppDataPathWithCache('Trae'),
    homepage: 'https://www.trae.ai/'
  },
  'trae-cn': {
    name: 'Trae CN',
    path: getAppDataPathWithCache('Trae CN'),
    homepage: 'https://www.trae.cn/'
  }
};

/**
 * 检测已安装的编辑器
 * @returns {Promise<Array<import('../types').Editor>>} 已安装的编辑器列表 
 */
async function detectInstalledEditors() {
  /** @type {Array<import('../types').Editor>} */
  const installedEditors = [];

  for (const [key, config] of Object.entries(editorMap)) {
    const editorPath = config.path;

    // 检查编辑器目录是否存在
    if (editorPath && await fs.pathExists(editorPath)) {
      installedEditors.push({ key, ...config, path: editorPath });
    }
  }

  return installedEditors;
}

/**
 * 获取编辑器信息
 * @param {import('../types').EditorKeys} editorKey - 编辑器键名
 * @param {keyof import('../types').Editor} [field] - 编辑器字段名
 * @returns {import('../types').Editor[keyof import('../types').Editor] | import('../types').Editor} 编辑器字段值或编辑器对象
 */
function getEditorInfo(editorKey, field) {
  const editor = editorMap[editorKey];
  if (!editor) {
    throw new Error(`未知的编辑器: ${editorKey}`);
  }

  if (field && ['name', 'path'].includes(field)) {
    return editor[field];
  }

  return editor;
}

/**
 * @returns {Array<import('../types').Editor>} 编辑器列表
 */
function getEditorList() {
  return Object.keys(editorMap).map(key => {
    const editor = getEditorInfo(key);
    return { key, ...editor };
  });
}

/**
 * @type {import('../types').ConfigurationMap}
 */
const configurationMap = {
  settings: {
    name: '编辑器设置 (settings.json)',
    files: [{ type: 'file', path: 'settings.json' }]
  },
  keybindings: {
    name: '快捷键绑定 (keybindings.json)',
    files: [{ type: 'file', path: 'keybindings.json' }]
  },
  snippets: {
    name: '代码片段 (snippets/*)',
    files: [{ type: 'dir', path: 'snippets' }]
  },
  'project-manager': {
    name: '项目管理器配置',
    files: [
      {
        type: 'file',
        path: path.join('globalStorage', 'alefragnani.project-manager', 'projects.json')
      }
    ]
  }
};

/**
 * 获取所有可用的同步项列表
 * @returns {Array<{value: string, name: string}>} 
 */
function getConfigurationList() {
  return Object.keys(configurationMap).map(key => ({
    value: key,
    name: getConfigurationInfo(key).name,
  }));
}

/**
 * 获取配置项信息
 * @param {import('../types').ConfigurationKeys} configurationKey - 配置项键名
 * @param {keyof import('../types').Configuration} [field] - 配置项字段名
 * @returns {import('../types').Configuration[keyof import('../types').Configuration] | import('../types').Configuration} 配置项字段值或配置项对象
 */
function getConfigurationInfo(configurationKey, field) {
  const configuration = configurationMap[configurationKey];
  if (!configuration) {
    throw new Error(`未知的配置项: ${configurationKey}`);
  }

  if (field && ['name', 'files'].includes(field)) {
    return configuration[field];
  }

  return configuration;
}

/**
 * 获取配置项文件的完整路径
 * @param {import('../types').EditorKeys} editorKey - 编辑器键名
 * @param {import('../types').ConfigurationKeys} configurationKey - 同步项键名
 * @param {string} filePath - 配置项文件路径
 * @returns {string} 完整路径
 */
function getConfigurationFileFullPath(editorKey, filePath) {
  const editorPath = getEditorInfo(editorKey, 'path');
  return path.join(editorPath, filePath);
}

/**
 * 获取同步项的完整路径
 * @param {import('../types').EditorKeys} editorKey - 编辑器键名
 * @param {import('../types').ConfigurationKeys} configurationKey - 同步项键名
 * @returns {{type: 'file' | 'dir', path: string}[]} 完整路径
 */
function getConfigurationFiles(editorKey, configurationKey) {
  const configurationFiles = getConfigurationInfo(configurationKey, 'files');

  return configurationFiles.map(({ type, path: filePath }) => {
    return {
      type,
      path: getConfigurationFileFullPath(editorKey, filePath)
    }
  });
}

module.exports = {
  getEditorInfo,
  getEditorList,
  detectInstalledEditors,
  getConfigurationList,
  getConfigurationInfo,
  getConfigurationFileFullPath,
  getConfigurationFiles,
};