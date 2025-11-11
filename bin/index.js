#!/usr/bin/env node

const { selectSourceEditor, selectSyncItems, confirmSync } = require('../lib/prompts');
const { syncConfigs, printSyncResults } = require('../lib/sync');
const { detectInstalledEditors, editorConfigs } = require('../lib/editors');

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
      console.log(`  - ${editor.displayName}`);
    });
    console.log('');

    // 选择源编辑器
    const sourceEditor = await selectSourceEditor(installedEditors);
    console.log(`\n已选择源编辑器: ${editorConfigs[sourceEditor].displayName}\n`);

    // 选择要同步的配置项
    const syncItems = await selectSyncItems();
    console.log(`\n已选择 ${syncItems.length} 个配置项进行同步\n`);

    const confirm = await confirmSync(editorConfigs[sourceEditor].displayName)

    if (!confirm) {
      console.log('已取消同步操作。');
      process.exit(0);
    }

    // 执行同步
    console.log('开始同步配置...\n');
    const result = await syncConfigs(sourceEditor, syncItems, installedEditors);

    // 打印结果
    printSyncResults(result);

    if (result.success) {
      console.log('✓ 同步完成！');
      process.exit(0);
    } else {
      console.log('✗ 同步过程中出现错误，请检查上述输出。');
      process.exit(1);
    }
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