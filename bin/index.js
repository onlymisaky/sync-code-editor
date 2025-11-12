#!/usr/bin/env node

const chalk = require('chalk').default
const ora = require('ora').default
const { selectSourceEditor, selectConfigurationList, selectTargetEditors, confirmSync } = require('../lib/prompts');
const { syncConfigs, printSyncResults } = require('../lib/sync');
const { detectInstalledEditors, getEditorList } = require('../lib/editors');
const { renderLink } = require('../lib/utils');

/**
 * 主函数
 */
async function main() {
  try {
    console.log(chalk.blue('★★ 欢迎使用编辑器配置同步工具 ★★\n'));

    // 检测已安装的编辑器
    let spinner = ora('正在检测已安装的编辑器...').start();
    const installedEditors = await detectInstalledEditors();
    spinner.stop();

    if (installedEditors.length === 0) {
      console.log(chalk.red('✗ 未检测到任何已安装的编辑器。'));
      console.log('请确保至少已安装以下编辑器中的任意两个：');
      getEditorList().forEach(editor => {
        console.log('  - ' + renderLink(editor.homepage, editor.name));
      });
      process.exit(1);
    }

    // 选择源编辑器
    const sourceEditorKey = await selectSourceEditor(installedEditors);

    // 选择要同步的配置项
    const configurationKeys = await selectConfigurationList();

    // 选择目标编辑器
    const targetEditorKeys = await selectTargetEditors(installedEditors, sourceEditorKey);

    // 确认同步操作
    const confirm = await confirmSync(
      sourceEditorKey,
      configurationKeys,
      targetEditorKeys
    );

    if (!confirm) {
      console.log(chalk.yellow('已取消同步操作。'));
      process.exit(0);
    }

    // 执行同步
    spinner = ora('正在同步配置...').start();
    const result = await syncConfigs(sourceEditorKey, configurationKeys, installedEditors, targetEditorKeys);
    spinner.stop();

    // 打印结果
    printSyncResults(result);
  } catch (error) {
    console.log(chalk.red('\n✗ 发生错误:'), error.message);
    if (error.stack) {
      console.log(chalk.red('\n错误堆栈:'), error.stack);
    }
    process.exit(1);
  }
}

// 运行主函数
main();