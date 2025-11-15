const path = require('node:path');
const fs = require('fs-extra');
const chalk = require('chalk').default;
const inquirer = require('inquirer').default;
const process = require('node:process');
const { getExtsDir, getExtensions } = require('./extensions');
const { printf } = require('./utils');

/**
 * @param {import('../types').Editor} sourceEditor - 源编辑器
 * @param {Array<import('../types').Extension>} extensions - 要同步的插件列表
 * @param {import('../types').Editor} targetEditor - 目标编辑器
 * @returns {Promise<import('../types').SyncConfigItemResult[]>} 同步结果
 */
async function syncExtensions(sourceEditor, extensions, targetEditor) {
  /** @type {import('../types').SyncConfigItemResult[]} */
  const result = [];

  const targetEditorExtsDir = getExtsDir(targetEditor.userDataDir);
  const targetEditorExts = await getExtensions(targetEditor);

  await fs.ensureDirSync(targetEditorExtsDir);
  await fs.ensureFile(path.join(targetEditorExtsDir, 'extensions.json'));

  /**
   * @typedef Task
   * @property {string} name - 插件展示名称
   * @property {string} pkgName - 插件名称
   * @property {string} author - 插件作者
   * @property {string} targetVer - 目标编辑器插件版本
   * @property {string} sourceVer - 源编辑器插件版本
   * @property {-1 | 0 | 1} type - 同步类型
   * -1: 目标编辑器没有该插件
   * 0: 目标编辑器有该插件但版本不同
   * 1: 目标编辑器有该插件且版本相同
   * @property {string} from - 源编辑器插件目录
   * @property {string} to - 目标编辑器插件目录
   */

  /** @type {Task[]} */
  const tasks = [];

  for (const ext of extensions) {
    /**
     * @type {Task['type']}
     */
    let type = -1;
    let targetVer = '';
    targetEditorExts.forEach((targetExt) => {
      if (targetExt.author + targetExt.pkgName === ext.author + ext.pkgName) {
        type = 0;
        targetVer = targetExt.ver;
        if (targetExt.ver === ext.ver) {
          type = 1;
        }
      }
    });

    if (type === 1) {
      continue;
    }

    /** @type {Task} */
    const task = {
      name: ext.name,
      pkgName: ext.pkgName,
      author: ext.author,
      targetVer,
      sourceVer: ext.ver,
      type,
      from: ext.dir,
      to: path.join(targetEditorExtsDir, ext.value),
    };

    tasks.push(task);
  }

  // TODO: 确认是否同步已安装插件的不同版本
  if (tasks.filter(task => task.type === 0).length && false) {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `${targetEditor.name} 中已安装了以下插件，但版本不同，是否确认同步？\n  ${tasks
        .filter(task => task.type === 0)
        .map((task) => {
          return `${task.pkgName} ${task.targetVer} -> ${task.sourceVer}`;
        })
        .join('\n  ')}`,
      default: false,
    }]);
    if (!confirm) {
      printf(chalk.yellow('已取消同步操作。'));
      process.exit(0);
    }
  }

  /** @type {Array<{identifier: {id: string}}>} */
  const sourceEditorExtsJson = await fs.readJson(path.join(getExtsDir(sourceEditor.userDataDir), 'extensions.json'));
  /** @type {Array<{identifier: {id: string}}>} */
  const targetEditorExtsJson = await fs.readJson(path.join(targetEditorExtsDir, 'extensions.json'));

  for (const task of tasks) {
    try {
      const data = sourceEditorExtsJson.find(info => info.identifier.id === `${task.author}.${task.pkgName}`);
      if (!data) {
        // TODO: 暂时不同步了
        result.push({
          type: 'extension',
          path: task.to,
          extName: task.name,
          successed: false,
          message: '跨平台插件支持同步',
        });
        continue;
      }
      if (task.type === -1) {
        await fs.copy(task.from, task.to);
        result.push({
          type: 'extension',
          path: task.to,
          extName: task.name,
          successed: true,
        });
      }
      else if (task.type === 0) {
        const index = targetEditorExtsJson.findIndex(ext => ext.identifier.id === `${task.author}.${task.pkgName}`);
        if (index !== -1) {
          targetEditorExtsJson.splice(index, 1);
        }
        await fs.copy(task.from, task.to);
        result.push({
          type: 'extension',
          path: task.to,
          extName: task.name,
          successed: true,
        });
      }
      // TODO: 好像不修改 location 属性下的路径也能运行
      targetEditorExtsJson.push(data);
    }
    catch (error) {
      result.push({
        type: 'extension',
        path: task.to,
        extName: task.name,
        successed: false,
        message: error.message || `${error}`,
      });
    }
  }

  await fs.writeJson(
    path.join(targetEditorExtsDir, 'extensions.json'),
    targetEditorExtsJson,
    { spaces: 0 },
  );

  return result;
}

/**
 * 同步单个配置项
 * @param {import('../types').Editor} sourceEditor - 源编辑器
 * @param {import('../types').Configuration} configuration - 要同步的配置项键名
 * @param {import('../types').Editor} targetEditor - 目标编辑器
 * @returns {Promise<import('../types').SyncConfigItemResult[]>} 同步结果
 */
async function syncConfig(sourceEditor, configuration, targetEditor) {
  /** @type {import('../types').SyncConfigItemResult[]} */
  const result = [];

  /** @type {Array<{type: 'file' | 'dir', from: import('node:fs').PathLike, to: import('node:fs').PathLike}>} */
  const tasks = [];

  for (const file of configuration.fileGroups) {
    const sourceConfigFilePath = path.join(sourceEditor.appDataDir, file.path);
    const targetConfigFilePath = path.join(targetEditor.appDataDir, file.path);

    const exists = await fs.pathExists(sourceConfigFilePath);

    if (!exists) {
      result.push({
        type: file.type,
        path: targetConfigFilePath,
        successed: false,
        message: `源配置文件${sourceConfigFilePath}不存在`,
      });
    }

    if (exists) {
      // TODO: 为了方便调试，先收集 tasks ，然后单独遍历执行
      const task = {
        type: file.type,
        from: sourceConfigFilePath,
        to: targetConfigFilePath,
      };
      tasks.push(task);
    }
  }

  // 如果配置项要求完整同步，且有缺失文件，则停止同步该配置项剩余文件
  if (configuration.complete && result.length) {
    return result;
  }

  await fs.ensureDir(path.dirname(targetEditor.appDataDir));

  for (const task of tasks) {
    try {
      if (task.type === 'dir') {
        if (await fs.pathExists(task.to)) {
          await fs.remove(task.to);
        }
      }
      await fs.copy(task.from, task.to);
      result.push({ type: task.type, path: task.to, successed: true });
    }
    catch (error) {
      result.push({
        type: task.type,
        path: task.to,
        successed: false,
        message: error.message || `${error}`,
      });
    }
  }

  return result;
}

/**
 * 同步配置文件
 * @param {import('../types').Editor} sourceEditor - 源编辑器
 * @param {Array<import('../types').Configuration>} selectedConfigurationList - 要同步的配置项数组
 * @param {Array<import('../types').Extension>} selectedExtensions - 要同步的插件项数组
 * @param {Array<import('../types').Editor>} installedEditors - 已安装的编辑器列表
 * @param {Array<import('../types').Editor>} targetEditorList - 目标编辑器数组
 * @returns {Promise<import('../types').SyncResult>} 同步结果
 */
async function syncConfigs(
  sourceEditor,
  selectedConfigurationList,
  selectedExtensions,
  installedEditors,
  targetEditorList,
) {
  /** @type {import('../types').SyncResult} */
  const results = targetEditorList.reduce((acc, cur) => {
    acc[cur.name] = [];
    return acc;
  }, {});

  const sourceEditorDataDir = sourceEditor.appDataDir;
  const targetEditors = installedEditors.filter(editor => targetEditorList.includes(editor));

  if (!(await fs.pathExists(sourceEditorDataDir))) {
    throw new Error(`源编辑器路径不存在: ${sourceEditorDataDir}`);
  }

  for (const targetEditor of targetEditors) {
    const targetEditorName = targetEditor.name;

    for (const configuration of selectedConfigurationList) {
      const configurationName = configuration.name;
      if (configuration.value === 'extensions') {
        try {
          const result = await syncExtensions(sourceEditor, selectedExtensions, targetEditor);
          results[targetEditorName][configurationName] = result;
        }
        catch (error) {
          results[targetEditorName][configurationName] = [
            { name: '插件复制成功，但是插件配置项同步失败', successed: false, message: error.message || `${error}` },
          ];
        }
        continue;
      }

      const result = await syncConfig(sourceEditor, configuration, targetEditor);
      results[targetEditorName][configurationName] = result;
    }
  }
  return results;
}

/**
 * 打印同步结果
 * @param {import('../types').SyncResult} syncResult - 同步结果
 */
function printSyncResults(syncResult) {
  printf('\n同步结果：');

  let successCount = 0;
  let errorCount = 0;

  const resultList = Object.entries(syncResult)
    .map(([editorName, configurationMap]) => {
      let editorSuccessCount = 0;
      let editorErrorCount = 0;
      const results = Object.entries(configurationMap)
        .map(([configurationName, configurationResults]) => {
          const itemSuccessCount = configurationResults.filter(r => r.successed).length;
          const itemErrorCount = configurationResults.length - itemSuccessCount;
          editorSuccessCount += itemSuccessCount;
          editorErrorCount += itemErrorCount;
          return {
            configurationName,
            items: configurationResults,
            totalCount: configurationResults.length,
            successCount: itemSuccessCount,
            errorCount: itemErrorCount,
          };
        });
      successCount += editorSuccessCount;
      errorCount += editorErrorCount;
      return {
        editorName,
        results,
        successCount: editorSuccessCount,
        errorCount: editorErrorCount,
        totalCount: editorSuccessCount + editorErrorCount,
      };
    });

  function color(totalCount, successCount, errorCount, name, perfix = '') {
    const p = perfix ? `${perfix} ` : '';

    const s = successCount > 0 ? chalk.green(`${successCount}成功`) : '';
    const e = errorCount > 0 ? chalk.red(`${errorCount}失败`) : '';
    const space = (s && e) ? ' ' : '';
    const info = `: [${s}${space}${e}]`;

    const msg = `${p}${name}${info}`;

    if (successCount === totalCount) {
      return chalk.green(msg);
    }
    else if (errorCount === totalCount) {
      return chalk.red(msg);
    }
    else {
      return chalk.yellow(msg);
    }
  }

  resultList.forEach((editorResult) => {
    if (editorResult.totalCount === 0) {
      return;
    }
    printf(`\n${color(
      editorResult.totalCount,
      editorResult.successCount,
      editorResult.errorCount,
      editorResult.editorName,
    )}`);
    editorResult.results.forEach((result) => {
      let prefix = '';
      if (result.successCount === result.totalCount) {
        prefix = '✓';
      }
      else if (result.errorCount === result.totalCount) {
        prefix = '✗';
      }
      else {
        prefix = '⊘';
      }
      if (result.totalCount === 0) {
        return;
      }
      const space = ' '.repeat(4);
      printf(`${space}${color(
        result.totalCount,
        result.successCount,
        result.errorCount,
        result.configurationName,
        prefix,
      )}`);
      result.items.forEach((item) => {
        printf(`${space.repeat(2)}${item.successed ? chalk.green(`✓ ${item.extName || item.path}`) : chalk.red(`✗ ${item.extName || item.path}`)}`);
        if (!item.successed) {
          printf(`${space.repeat(2)}${chalk.red(item.message)}`);
        }
      });
    });
  });

  printf(chalk.blue(`\n总计: ${successCount} 成功, ${errorCount} 失败\n`));
}

module.exports = {
  syncConfigs,
  printSyncResults,
};
