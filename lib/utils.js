const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const platform = os.platform();
const homeDir = os.homedir();
const appDataDir = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');

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
    } else if (platform === 'win32') {
      // Windows
      appDataPath = path.join(appDataDir, appPathName, 'User');
    } else {
      // Linux
      appDataPath = path.join(homeDir, '.config', appPathName, 'User');
    }

    if (!fs.pathExistsSync(appDataPath)) {
      return null;
    }

    cache[appPathName] = appDataPath;

    return appDataPath;
  }

  return getAppDataPathWithCache
}

const getAppDataPathWithCache = getAppDataPath();

function renderLink(url, text) {
  return `\u001B]8;;${url}\u001B\\${text}\u001B]8;;\u001B\\`;
}

module.exports = {
  getAppDataPathWithCache,
  renderLink
}