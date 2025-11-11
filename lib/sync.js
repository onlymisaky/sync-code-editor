const fs = require('fs-extra');
const path = require('path');
const { getEditorPath, getSyncItemPath, getSyncItemInfo } = require('./editors');

/**
 * 同步配置文件
 * @param {string} sourceEditor - 源编辑器键名
 * @param {Array<string>} syncItems - 要同步的配置项数组
 * @param {Array} installedEditors - 已安装的编辑器列表
 * @returns {Promise<Object>} 同步结果 {success: boolean, results: Array}
 */
async function syncConfigs(sourceEditor, syncItems, installedEditors) {
  const results = [];
  const sourceEditorPath = getEditorPath(sourceEditor);
  const targetEditors = installedEditors.filter(editor => editor.value !== sourceEditor);

  // 检查源编辑器路径是否存在
  if (!await fs.pathExists(sourceEditorPath)) {
    throw new Error(`源编辑器路径不存在: ${sourceEditorPath}`);
  }

  // 遍历每个要同步的配置项
  for (const itemKey of syncItems) {
    const itemInfo = getSyncItemInfo(itemKey);
    const sourcePath = getSyncItemPath(sourceEditor, itemKey);

    // 检查源文件/目录是否存在
    if (!await fs.pathExists(sourcePath)) {
      results.push({
        item: itemInfo.displayName,
        status: 'skipped',
        message: `源文件不存在: ${sourcePath}`
      });
      continue;
    }

    // 同步到每个目标编辑器
    for (const targetEditor of targetEditors) {
      const targetPath = getSyncItemPath(targetEditor.value, itemKey);

      try {
        // 确保目标编辑器目录存在
        await fs.ensureDir(path.dirname(targetPath));

        // 复制文件或目录
        if (itemInfo.type === 'directory') {
          // 如果是目录，先删除目标目录（如果存在），然后复制
          if (await fs.pathExists(targetPath)) {
            await fs.remove(targetPath);
          }
          await fs.copy(sourcePath, targetPath);
        } else {
          // 如果是文件，直接复制
          await fs.copy(sourcePath, targetPath);
        }

        results.push({
          item: itemInfo.displayName,
          target: targetEditor.displayName,
          status: 'success',
          message: `已同步到 ${targetEditor.displayName}`
        });
      } catch (error) {
        results.push({
          item: itemInfo.displayName,
          target: targetEditor.displayName,
          status: 'error',
          message: `同步失败: ${error.message}`
        });
      }
    }
  }

  return {
    success: results.every(r => r.status === 'success' || r.status === 'skipped'),
    results
  };
}

/**
 * 打印同步结果
 * @param {Object} syncResult - 同步结果
 */
function printSyncResults(syncResult) {
  console.log('\n同步结果：\n');

  const successCount = syncResult.results.filter(r => r.status === 'success').length;
  const errorCount = syncResult.results.filter(r => r.status === 'error').length;
  const skippedCount = syncResult.results.filter(r => r.status === 'skipped').length;

  syncResult.results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✓ ${result.item} -> ${result.target}`);
    } else if (result.status === 'error') {
      console.log(`✗ ${result.item} -> ${result.target}: ${result.message}`);
    } else if (result.status === 'skipped') {
      console.log(`⊘ ${result.message}`);
    }
  });

  console.log(`\n总计: ${successCount} 成功, ${errorCount} 失败, ${skippedCount} 跳过\n`);
}

module.exports = {
  syncConfigs,
  printSyncResults
};