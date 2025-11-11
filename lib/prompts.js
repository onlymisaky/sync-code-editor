const inquirer = require('inquirer').default;
const { getEditorList, getSyncItemList } = require('./editors');

/**
 * 选择源编辑器
 * @returns {Promise<string>} 源编辑器键名
 */
async function selectSourceEditor() {
  const editors = getEditorList();
  
  const { sourceEditor } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sourceEditor',
      message: '请选择源编辑器：',
      choices: editors.map(editor => ({
        name: editor.displayName,
        value: editor.value
      }))
    }
  ]);

  return sourceEditor;
}

/**
 * 选择要同步的配置项
 * @returns {Promise<Array<string>>} 选中的同步项键名数组
 */
async function selectSyncItems() {
  const syncItems = getSyncItemList();
  
  const { selectedItems } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedItems',
      message: '请选择要同步的配置项（使用空格选择，回车确认）：',
      choices: syncItems.map(item => ({
        name: item.displayName,
        value: item.value
      })),
      validate: (answer) => {
        if (answer.length === 0) {
          return '请至少选择一个配置项';
        }
        return true;
      }
    }
  ]);

  return selectedItems;
}

/**
 * 确认同步操作
 * @param {string} sourceEditor - 源编辑器键名
 * @param {Array<string>} syncItems - 要同步的配置项数组
 * @returns {Promise<boolean>} 是否确认
 */
async function confirmSync(sourceEditor, syncItems) {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `确认要将 ${sourceEditor} 的配置同步到其他编辑器吗？`,
      default: true
    }
  ]);

  return confirmed;
}

module.exports = {
  selectSourceEditor,
  selectSyncItems,
  confirmSync
};