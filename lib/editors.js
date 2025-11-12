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


module.exports = {
  getEditorInfo,
  getEditorList,
  detectInstalledEditors,
};