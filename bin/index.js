#!/usr/bin/env node

const { selectSourceEditor, selectConfigurationList, selectTargetEditors, confirmSync } = require('../lib/prompts');
const { syncConfigs, printSyncResults } = require('../lib/sync');
const { detectInstalledEditors, getEditorInfo } = require('../lib/editors');

/**
 * 主函数
 */
async function main() {
  try {
    console.log('欢迎使用编辑器配置同步工具！\n');

    // 检测已安装的编辑器
    console.log('正在检测已安装的编辑器...');
    const installedEditors = await detectInstalledEditors();

    if (installedEditors.length === 0) {
      console.log('\n✗ 未检测到任何已安装的编辑器。');
      console.log('请确保已安装以下编辑器之一：VSCode、Cursor、Windsurf、Trae 或 Trae CN\n');
      process.exit(1);
    }

    // 显示检测结果
    console.log(`\n✓ 检测到 ${installedEditors.length} 个已安装的编辑器：`);
    installedEditors.forEach(editor => {
      console.log(`  - ${editor.name}`);
    });
    console.log('');

    // 选择源编辑器
    const sourceEditorKey = await selectSourceEditor(installedEditors);
    console.log(`\n已选择源编辑器: ${getEditorInfo(sourceEditorKey, 'name')}\n`);

    // 选择要同步的配置项
    const configurationKeys = await selectConfigurationList();
    console.log(`\n已选择 ${configurationKeys.length} 个配置项进行同步\n`);

    const targetEditorKeys = await selectTargetEditors(installedEditors, sourceEditorKey);
    const targetEditorNames = targetEditorKeys.map(key => getEditorInfo(key, 'name')).join(', ');
    console.log(`\n已选择目标编辑器: ${targetEditorNames}\n`);

    const confirm = await confirmSync(
      sourceEditorKey,
      configurationKeys,
      targetEditorKeys
    );

    if (!confirm) {
      console.log('已取消同步操作。');
      process.exit(0);
    }

    // 执行同步
    console.log('开始同步配置...\n');
    const result = await syncConfigs(sourceEditorKey, configurationKeys, installedEditors, targetEditorKeys);

    // 打印结果
    printSyncResults(result);
  } catch (error) {
    console.error('\n✗ 发生错误:', error.message);
    if (error.stack) {
      console.error('\n错误堆栈:', error.stack);
    }
    process.exit(1);
  }
}

// 运行主函数
main();