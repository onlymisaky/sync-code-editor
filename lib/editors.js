const fs = require('fs-extra');
const { getAppDataDir, getUserDataDir, map2List } = require('./utils');

/** @type {import('../types').EditorMap} */
const editorMap = {
  'vscode': {
    value: 'vscode',
    name: 'Visual Studio Code',
    appDataDir: getAppDataDir('vscode'),
    userDataDir: getUserDataDir('vscode'),
    homepage: 'https://code.visualstudio.com/',
  },
  'cursor': {
    value: 'cursor',
    name: 'Cursor',
    appDataDir: getAppDataDir('cursor'),
    userDataDir: getUserDataDir('cursor'),
    homepage: 'https://cursor.com/',
  },
  'windsurf': {
    value: 'windsurf',
    name: 'Windsurf',
    appDataDir: getAppDataDir('windsurf'),
    userDataDir: getUserDataDir('windsurf'),
    homepage: 'https://windsurf.com/',
  },
  'trae': {
    value: 'trae',
    name: 'Trae',
    appDataDir: getAppDataDir('trae'),
    userDataDir: getUserDataDir('trae'),
    homepage: 'https://www.trae.ai/',
  },
  'trae-cn': {
    value: 'trae-cn',
    name: 'Trae CN',
    appDataDir: getAppDataDir('trae-cn'),
    userDataDir: getUserDataDir('trae-cn'),
    homepage: 'https://www.trae.cn/',
  },
};

const editorList = Object.freeze(map2List(editorMap));

/**
 * 检测已安装的编辑器
 * @returns {Promise<Array<import('../types').Editor>>} 已安装的编辑器列表
 */
async function detectInstalledEditors() {
  /** @type {Array<import('../types').Editor>} */
  const installedEditors = [];

  for (const [value, config] of Object.entries(editorMap)) {
    const editorDataDir = config.appDataDir;

    if (editorDataDir && await fs.pathExists(editorDataDir)) {
      installedEditors.push({ value, ...config, appDataDir: editorDataDir });
    }
  }

  return installedEditors;
}

module.exports = {
  editorList,
  detectInstalledEditors,
};
