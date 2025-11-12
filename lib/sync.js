const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk').default;
const { getEditorInfo, } = require('./editors');
const {  getConfigurationInfo, getConfigurationFileFullPath } = require('./configurations');

/**
 * 同步单个配置项
 * @param {import('../types').EditorKeys} sourceEditorKey - 源编辑器键名
 * @param {import('../types').ConfigurationKeys} configurationKey - 要同步的配置项键名
 * @param {Array<import('../types').EditorKeys>} targetEditorKey - 目标编辑器键名数组
 * @returns {Promise<import('../types').SyncResultItem>} 同步结果
 */
async function syncConfig(sourceEditorKey, configurationKey, targetEditorKey) {
  /** @type {import('../types').Configuration} */
  const configurationInfo = getConfigurationInfo(configurationKey);
  const sourceEditorConfigurationFiles = configurationInfo.files.map((file) => ({
    ...file,
    path: getConfigurationFileFullPath(sourceEditorKey, file.path)
  }));

  const missingFiles = [];
  const errorFiles = [];

  let promises = sourceEditorConfigurationFiles.map((config) => {
    const filePath = config.path;
    return fs.pathExists(filePath)
      .then(exists => {
        if (!exists) {
          missingFiles.push(filePath);
        }
        return exists;
      })
      .catch(() => {
        errorFiles.push(filePath);
        return false;
      })
  })

  await Promise.all(promises)

  if (missingFiles.length > 0 || errorFiles.length > 0) {
    return {
      success: false,
      reason: { missingFiles, errorFiles }
    }
  }

  const targetEditorPath = getEditorInfo(targetEditorKey, 'path');

  const tasks = configurationInfo.files.map((config, index) => {
    return {
      type: config.type,
      from: sourceEditorConfigurationFiles[index].path,
      to: getConfigurationFileFullPath(targetEditorKey, config.path)
    }
  });

  await fs.ensureDir(path.dirname(targetEditorPath));

  for (const task of tasks) {
    try {
      if (task.type === 'dir') {
        if (await fs.pathExists(task.to)) {
          await fs.remove(task.to);
        }
      }
      await fs.copy(task.from, task.to);
    } catch (error) {
      errorFiles.push(task.from);
      return {
        success: false,
        reason: { errorFiles }
      }
    }
  }

  return { success: true }
}

/**
 * 同步配置文件
 * @param {import('../types').EditorKeys} sourceEditorKey - 源编辑器键名
 * @param {Array<import('../types').ConfigurationKeys>} configurationKeys - 要同步的配置项数组
 * @param {Array<import('../types').Editor>} installedEditors - 已安装的编辑器列表
 * @param {Array<import('../types').EditorKeys>} targetEditorKeys - 目标编辑器键名数组
 * @returns {Promise<import('../types').SyncResult>} 同步结果 
 */
async function syncConfigs(sourceEditorKey, configurationKeys, installedEditors, targetEditorKeys) {
  /** @type {import('../types').SyncResult} */
  const results = targetEditorKeys.reduce((acc, cur) => {
    acc[getEditorInfo(cur, 'name')] = [];
    return acc;
  }, {});

  const sourceEditorPath = getEditorInfo(sourceEditorKey, 'path');
  const targetEditors = installedEditors.filter(editor => targetEditorKeys.includes(editor.key));

  // 检查源编辑器路径是否存在
  if (!await fs.pathExists(sourceEditorPath)) {
    throw new Error(`源编辑器路径不存在: ${sourceEditorPath}`);
  }

  for (const targetEditor of targetEditors) {

    const targetEditorName = targetEditor.name;
    const targetEditorKey = targetEditor.key;

    for (const configurationKey of configurationKeys) {
      const configurationName = getConfigurationInfo(configurationKey, 'name');
      try {
        const result = await syncConfig(sourceEditorKey, configurationKey, targetEditorKey);
        results[targetEditorName].push({
          configurationName,
          ...result
        });
      } catch (error) {
        results[targetEditorName].push({
          configurationName,
          success: false,
          message: error.message || `${error}`
        });
      }
    }
  }
  return results;
}

/**
 * 打印同步结果
 * @param {import('../types').SyncResult} syncResult - 同步结果
 */
function printSyncResults(syncResult) {
  console.log('\n同步结果：');

  // const list = Object.values(syncResult).flatMap(results => results);

  // const successCount = list.filter(r => r.success).length;
  // const errorCount = list.length - successCount;

  let successCount = 0;
  let errorCount = 0;

  Object.entries(syncResult).map(([targetEditorName, results]) => {
    return {
      targetEditorName,
      results: results.sort((a, b) => b.success - a.success)
    }
  }).forEach(({ targetEditorName, results }) => {
    console.log(`\n${targetEditorName}:`);
    results.forEach((result) => {
      if (result.success) {
        console.log(chalk.green(`   ✓ ${result.configurationName}`));
        successCount++;
      } else if (!result.success) {
        console.log(chalk.red(`   ✗ ${result.configurationName}: ${result.message}`));
        errorCount++;
      }
      else {
        // TODO
        console.log(chalk.yellow(`   ⊘ ${result.message}`));
      }
    })
  })

  console.log(chalk.blue(`\n总计: ${successCount} 成功, ${errorCount} 失败\n`));
}

module.exports = {
  syncConfigs,
  printSyncResults
};