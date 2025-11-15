const path = require('node:path');
const fs = require('fs-extra');

function getExtsDir(userDataDir) {
  return path.join(userDataDir, 'extensions');
}

/**
 * 获取编辑器安装的插件列表
 * @param {import('../types').Editor} codeEditor - 代码编辑器实例
 * @returns {Promise<Array<import('../types').Extension>>} 插件列表
 */

async function getExtensions(codeEditor) {
  /** @type {Array<import('../types').Extension>} */
  const extensionsList = [];

  const extensionsDir = getExtsDir(codeEditor.userDataDir);

  if (!(await fs.pathExists(extensionsDir))) {
    return extensionsList;
  }

  const dirs = await fs.readdir(extensionsDir);

  for (const item of dirs) {
    if (item.startsWith('.'))
      continue;

    const dir = path.join(extensionsDir, item);
    const isDir = fs.statSync(dir).isDirectory();
    if (!isDir)
      continue;

    const pkg = await fs.readJSON(path.join(dir, 'package.json'));

    if (!pkg || !pkg.name)
      continue;

    let displayName = pkg.displayName || pkg.name;

    if (displayName.startsWith('%') && displayName.endsWith('%')) {
      displayName = displayName.slice(1, -1);
      const i18nFiles = [
        path.join(dir, 'package.nls.zh-cn.json'),
        path.join(dir, 'package.nls.json'),
      ];
      for (const i18nFile of i18nFiles) {
        if (await fs.pathExists(i18nFile)) {
          const i18n = await fs.readJSON(i18nFile);
          displayName = i18n[displayName] || displayName;
          break;
        }
      }
    }

    extensionsList.push({
      value: item,
      name: `${displayName} (${pkg.version})`,
      pkgName: item.replace(`-${pkg.version}`, '').split('.').pop(),
      author: item.replace(`-${pkg.version}`, '').split('.').shift(),
      ver: pkg.version,
      dir,
    });
  }

  return extensionsList;
}

module.exports = {
  getExtsDir,
  getExtensions,
};
