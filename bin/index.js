#!/usr/bin/env node

const { selectSourceEditor, selectSyncItems } = require('../lib/prompts');
const { syncConfigs, printSyncResults } = require('../lib/sync');
const { editorNames } = require('../lib/editors');

/**
 * 主函数
 */
async function main() {
  try {
    console.log('欢迎使用编辑器配置同步工具！\n');

    // 选择源编辑器
    const sourceEditor = await selectSourceEditor();
    console.log(`\n已选择源编辑器: ${editorNames[sourceEditor]}\n`);

    // 选择要同步的配置项
    const syncItems = await selectSyncItems();
    console.log(`\n已选择 ${syncItems.length} 个配置项进行同步\n`);

    // 执行同步
    console.log('开始同步配置...\n');
    const result = await syncConfigs(sourceEditor, syncItems);

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