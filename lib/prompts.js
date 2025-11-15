const ora = require('ora').default;
const inquirer = require('inquirer').default;
const fs = require('fs-extra');
const { configurationList } = require('./configurations');
const { getExtsDir, getExtensions } = require('./extensions');
const { printf, userForceExitPrompt } = require('./utils');
const chalk = require('chalk').default;
const path = require('node:path');
const process = require('node:process');

/**
 * 选择源编辑器
 * @param {Array<import('../types').Editor>} installedEditors - 已安装的编辑器列表
 * @returns {Promise<import('../types').Editor>} 源编辑器对象
 */
async function selectSourceEditor(installedEditors) {
  const { sourceEditor } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sourceEditor',
      message: '请选择源编辑器：',
      choices: installedEditors.map(editor => ({
        value: editor.value,
        name: editor.name,
      })),
      filter: (answer) => {
        return installedEditors.find(item => item.value === answer);
      },
    },
  ]).catch(userForceExitPrompt);

  return sourceEditor;
}

/**
 * 选择要同步的配置项
 * @returns {Promise<Array<import('../types').Configuration>>} 选中的同步项键名数组
 */
async function selectConfigurationList() {
  const { selectedItems } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedItems',
      message: '请选择要同步的配置项（使用空格选择，回车确认）：',
      choices: configurationList,
      validate: (answer) => {
        if (answer.length === 0) {
          return '请至少选择一个配置项';
        }
        return true;
      },
      filter: (answer) => {
        return answer.map(value => configurationList.find(config => config.value === value));
      },
    },
  ]).catch(userForceExitPrompt);

  return selectedItems;
}

/**
 * 选择要同步的插件
 * @param {import('../types').Editor} sourceEditor - 源编辑器对象
 * @returns {Promise<Array<import('../types').Extension>>} 选中的插件键名数组
 */
async function selectExtensions(sourceEditor) {
  const spinner = ora('正在检测插件...').start();

  const extensionsDir = getExtsDir(sourceEditor.userDataDir);
  if (!(await fs.exists(path.join(extensionsDir, 'extensions.json')))) {
    spinner.info('插件信息文件不存在');
    spinner.stop();
    return [];
  }

  const extensionsList = await getExtensions(sourceEditor);

  if (extensionsList.length === 0) {
    spinner.info('未检测到任何插件');
    spinner.stop();
    return [];
  }

  spinner.stop();

  const { extensions } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'extensions',
      message: '请选择要同步的插件：',
      choices: extensionsList.sort((a, b) => a.name.localeCompare(b.name)),
      loop: false,
      validate: (answer) => {
        if (answer.length === 0) {
          return '请至少选择一个插件';
        }
        return true;
      },
      filter: (answer) => {
        return answer.map((extNameWithVer) => {
          const item = extensionsList.find(ext => ext.value === extNameWithVer);
          return item;
        });
      },
    },
  ]).catch(userForceExitPrompt);

  return extensions;
}

/**
 * 确认同步操作
 * @param {import('../types').Editor} sourceEditor - 源编辑器对象
 * @param {Array<import('../types').Configuration>} selectedConfigurationList - 要同步的配置项键名数组
 * @param {Array<import('../types').Editor>} targetEditorList - 目标编辑器数组
 * @param {Array<import('../types').Extension>} selectedExtensions - 要同步的插件数组
 * @returns {Promise<boolean>} 是否确认
 */
async function confirmSync(
  sourceEditor,
  selectedConfigurationList,
  targetEditorList,
  selectedExtensions,
) {
  const space = '  ';
  const sourceEditorName = sourceEditor.name;
  let configurationNames = selectedConfigurationList
    .filter(item => item.value !== 'extensions')
    .map(item => `${space}- ${item.name}`)
    .join('\n');

  if (selectedExtensions.length) {
    configurationNames += `\n${space}- 插件\n${selectedExtensions
      .map(ext => `${space}${space}- ${ext.name}`)
      .join('\n')}`;
  }
  const targetEditorNames = targetEditorList.map(editor => `${space}- ${editor.name}`).join('\n');

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `确认要将 ${sourceEditorName} 中的:\n${configurationNames} \n 同步到\n${targetEditorNames}\n`,
      default: true,
    },
  ]).catch(userForceExitPrompt);

  return confirmed;
}

/**
 * 选择目标编辑器
 * @param {Array<import('../types').Editor>} installedEditors - 已安装的编辑器列表
 * @param {import('../types').Editor} sourceEditor - 源编辑器
 * @returns {Promise<Array<import('../types').Editor>>} 选中的目标编辑器数组
 */
async function selectTargetEditors(installedEditors, sourceEditor) {
  // 排除源编辑器，只显示其他已安装的编辑器
  const availableTargets = installedEditors.filter(editor => editor.value !== sourceEditor.value);

  if (availableTargets.length === 0) {
    printf(chalk.yellow('没有可用的目标编辑器（已排除源编辑器）'));
    process.exit(1);
  }

  const { targetEditors } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'targetEditors',
      message: '请选择目标编辑器（使用空格选择，回车确认）：',
      choices: availableTargets.map(editor => ({
        value: editor.value,
        name: editor.name,
      })),
      validate: (answer) => {
        if (answer.length === 0) {
          return '请至少选择一个目标编辑器';
        }
        return true;
      },
      filter: (answer) => {
        return answer.map(value => availableTargets.find(editor => editor.value === value));
      },
    },
  ]).catch(userForceExitPrompt);

  return targetEditors;
}

module.exports = {
  selectSourceEditor,
  selectConfigurationList,
  selectExtensions,
  selectTargetEditors,
  confirmSync,
};
