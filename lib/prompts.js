const inquirer = require('inquirer').default;
const { getConfigurationList, getConfigurationInfo } = require('./configurations');
const { getEditorInfo } = require('./editors');

/**
 * 选择源编辑器
 * @param {Array<import('../types').Editor>} installedEditors - 已安装的编辑器列表
 * @returns {Promise<import('../types').EditorKeys>} 源编辑器键名
 */
async function selectSourceEditor(installedEditors) {
  if (!installedEditors || installedEditors.length === 0) {
    throw new Error('未检测到已安装的编辑器');
  }

  const { sourceEditor } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sourceEditor',
      message: '请选择源编辑器：',
      choices: installedEditors.map(editor => ({
        value: editor.key,
        name: editor.name,
      })),
    },
  ]);

  return sourceEditor;
}

/**
 * 选择要同步的配置项
 * @returns {Promise<Array<import('../types').ConfigurationKeys>>} 选中的同步项键名数组
 */
async function selectConfigurationList() {
  const configurationList = getConfigurationList();

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
    },
  ]);

  return selectedItems;
}

/**
 * 确认同步操作
 * @param {import('../types').EditorKeys} sourceEditorKey - 源编辑器键名
 * @param {Array<import('../types').ConfigurationKeys>} configurationKeys - 要同步的配置项键名数组
 * @param {Array<import('../types').EditorKeys>} targetEditorKeys - 目标编辑器键名数组
 * @returns {Promise<boolean>} 是否确认
 */
async function confirmSync(sourceEditorKey, configurationKeys, targetEditorKeys) {
  const sourceEditorName = getEditorInfo(sourceEditorKey, 'name');
  const configurationNames = configurationKeys.map(item => `  - ${getConfigurationInfo(item, 'name')}`).join('\n');
  const targetEditorNames = targetEditorKeys.map(editor => `  - ${getEditorInfo(editor, 'name')}`).join('\n');

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `确认要将 ${sourceEditorName} 中的:\n${configurationNames} \n 同步到\n${targetEditorNames}\n`,
      default: true,
    },
  ]);

  return confirmed;
}

/**
 * 选择目标编辑器
 * @param {Array<import('../types').Editor>} installedEditors - 已安装的编辑器列表
 * @param {import('../types').EditorKeys} sourceEditorKey - 源编辑器键名
 * @returns {Promise<Array<import('../types').EditorKeys>>} 选中的目标编辑器键名数组
 */
async function selectTargetEditors(installedEditors, sourceEditorKey) {
  // 排除源编辑器，只显示其他已安装的编辑器
  const availableTargets = installedEditors.filter(editor => editor.key !== sourceEditorKey);

  if (availableTargets.length === 0) {
    throw new Error('没有可用的目标编辑器（已排除源编辑器）');
  }

  const { targetEditors } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'targetEditors',
      message: '请选择目标编辑器（使用空格选择，回车确认）：',
      choices: availableTargets.map(editor => ({
        value: editor.key,
        name: editor.name,
      })),
      validate: (answer) => {
        if (answer.length === 0) {
          return '请至少选择一个目标编辑器';
        }
        return true;
      },
    },
  ]);

  return targetEditors;
}

module.exports = {
  selectSourceEditor,
  selectConfigurationList,
  selectTargetEditors,
  confirmSync,
};
