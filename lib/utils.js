const os = require('node:os');
const path = require('node:path');
const process = require('node:process');
const fs = require('fs-extra');

const platform = os.platform();
const homeDir = os.homedir();
// console.log(process.env.LANG);

function getAppDataPath() {
  /** 缓存已计算的路径 */
  const cache = {};

  /**
   * 根据 appPathName 获取 app 在当前平台的配置路径
   * @param {'Code'|'Cursor'|'Windsurf'|'Trae'|'Trae CN'} appPathName 编辑器短名称
   * @returns {string} 配置路径
   */
  function getAppDataPathWithCache(appPathName) {
    if (cache[appPathName]) {
      return cache[appPathName];
    }

    let appDataPath;

    if (platform === 'darwin') {
      // macOS
      appDataPath = path.join(homeDir, 'Library', 'Application Support', appPathName, 'User');
    }
    else if (platform === 'win32') {
      // Windows
      const appDataDir = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
      appDataPath = path.join(appDataDir, appPathName, 'User');
    }
    else {
      // Linux
      appDataPath = path.join(homeDir, '.config', appPathName, 'User');
    }

    if (!fs.pathExistsSync(appDataPath)) {
      return null;
    }

    cache[appPathName] = appDataPath;

    return appDataPath;
  }

  return getAppDataPathWithCache;
}

const getAppDataPathWithCache = getAppDataPath();

function renderLink(url, text) {
  return `\u001B]8;;${url}\u001B\\${text}\u001B]8;;\u001B\\`;
}

function printf(...args) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

module.exports = {
  getAppDataPathWithCache,
  renderLink,
  printf,
};
