const os = require('node:os');
const path = require('node:path');
const process = require('node:process');
const fs = require('fs-extra');

const platform = os.platform();
const homeDir = os.homedir();
// console.log(process.env.LANG);

/** @type {Record<import('../types').EditorValues, { app: string, user: string }}> */
const editorDirMap = {
  'vscode': { app: 'Code', user: '.vscode' },
  'cursor': { app: 'Cursor', user: '.cursor' },
  'windsurf': { app: 'Windsurf', user: '.windsurf' },
  'trae': { app: 'Trae', user: '.trae' },
  'trae-cn': { app: 'Trae CN', user: '.trae-cn' },
};

/**
 * 根据 editorValue 获取相应的 appDataDir
 * @param {import('../types').EditorValues} editorValue 编辑器短名称
 * @returns {string} appDataDir
 */
function getAppDataDir(editorValue) {
  let result;
  const dirMap = editorDirMap[editorValue];
  if (!dirMap) {
    throw new Error(`Unknown editor value: ${editorValue}`);
  }
  const appDataShortDir = dirMap.app;

  if (platform === 'darwin') {
    // macOS
    result = path.join(homeDir, 'Library', 'Application Support', appDataShortDir, 'User');
  }
  else if (platform === 'win32') {
    // Windows
    const appDataDir = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
    result = path.join(appDataDir, appDataShortDir, 'User');
  }
  else {
    // Linux
    result = path.join(homeDir, '.config', appDataShortDir, 'User');
  }

  if (!fs.pathExistsSync(result)) {
    return null;
  }

  return result;
}

/**
 * 根据 editorValue 获取相应的 userDataDir
 * @param {import('../types').EditorValues} editorValue 编辑器短名称
 * @returns {string} userDataDir
 */
function getUserDataDir(editorValue) {
  const dirMap = editorDirMap[editorValue];
  if (!dirMap) {
    throw new Error(`Unknown editor value: ${editorValue}`);
  }
  const userDataShortDir = dirMap.user;

  const result = path.join(homeDir, userDataShortDir);

  if (!fs.pathExistsSync(result)) {
    return null;
  }

  return result;
}

function renderLink(url, text) {
  return `\u001B]8;;${url}\u001B\\${text}\u001B]8;;\u001B\\`;
}

function printf(...args) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

/**
 * @template T
 * @param {Record<string, T>} map 要转换的 Map 对象
 * @param {string} [keyName] 键名属性名，默认空字符串
 * @returns {Array<T> | Array<T & { [keyName: string]: string }>} 转换后的列表
 */
function map2List(map, keyName = '') {
  return Object.keys(map).map((key) => {
    const item = { ...map[key] };
    if (typeof keyName === 'string' && keyName.trim()) {
      item[keyName] = key;
    }
    return item;
  });
}

function userForceExitPrompt() {
  process.exit(1);
}

module.exports = {
  getAppDataDir,
  getUserDataDir,
  renderLink,
  printf,
  map2List,
  userForceExitPrompt,
  editorDirMap,
};
