#!/usr/bin/env node

const chalk = require('chalk').default;
const ora = require('ora').default;
const process = require('node:process');
const { detectInstalledEditors, editorList } = require('../lib/editors');
const {
  selectSourceEditor,
  selectConfigurationList,
  selectExtensions,
  selectTargetEditors,
  confirmSync,
} = require('../lib/prompts');
const { syncConfigs, printSyncResults } = require('../lib/sync');
const { renderLink, printf } = require('../lib/utils');

async function main() {
  try {
    printf(chalk.blue('★★ 欢迎使用编辑器配置同步工具 ★★\n'));

    let spinner = ora('正在检测已安装的编辑器...').start();
    const installedEditors = await detectInstalledEditors();
    spinner.stop();

    if (installedEditors.length === 0) {
      printf(chalk.red('✗ 未检测到任何已安装的编辑器。'));
      printf('请确保至少已安装以下编辑器中的任意两个：');
      editorList.forEach((editor) => {
        printf(`  - ${renderLink(editor.homepage, editor.name)}`);
      });
      process.exit(1);
    }

    if (installedEditors.length === 1) {
      printf(chalk.yellow(`✗ 您只安装了 ${installedEditors[0].name} ，不需要进行同步操作。`));
      process.exit(1);
    }

    // 选择源编辑器
    const sourceEditor = await selectSourceEditor(installedEditors);

    // 选择要同步的配置项
    const selectedConfigurationList = await selectConfigurationList();

    /** @type {Array<import('../types').Extension>} */
    let selectedExtensions = [];

    if (selectedConfigurationList.find(item => item.value === 'extensions')) {
      selectedExtensions = await selectExtensions(sourceEditor);
    }

    // 选择目标编辑器
    const targetEditorList = installedEditors.length === 2
      ? installedEditors.filter(editor => editor.value !== sourceEditor.value)
      : await selectTargetEditors(installedEditors, sourceEditor);

    // 确认同步操作
    const confirm = await confirmSync(
      sourceEditor,
      selectedConfigurationList,
      targetEditorList,
      selectedExtensions,
    );

    if (!confirm) {
      printf(chalk.yellow('已取消同步操作。'));
      process.exit(0);
    }

    // 执行同步
    spinner = ora('正在同步配置...').start();
    const result = await syncConfigs(
      sourceEditor,
      selectedConfigurationList,
      selectedExtensions,
      installedEditors,
      targetEditorList,
    );
    spinner.stop();

    // 打印结果
    printSyncResults(result);
  }
  catch (error) {
    printf(chalk.red('\n✗ 发生错误:'), error.message);
    if (error.stack) {
      printf(chalk.red('\n错误堆栈:'), error.stack);
    }
    process.exit(1);
  }
}

main();
