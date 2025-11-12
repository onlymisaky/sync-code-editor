const path = require('path');
const { getEditorInfo } = require('./editors');

/** @type {import('../types').ConfigurationMap} */
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
 * @param {string} filePath - 配置项文件路径
 * @returns {string} 完整路径
 */
function getConfigurationFileFullPath(editorKey, filePath) {
  const editorPath = getEditorInfo(editorKey, 'path');
  return path.join(editorPath, filePath);
}

module.exports = {
  getConfigurationList,
  getConfigurationInfo,
  getConfigurationFileFullPath,
};