const { map2List } = require('./utils.js');

/** @type {import('../types').ConfigurationMap} */
const configurationMap = {
  settings: {
    value: 'settings',
    name: '编辑器设置 (settings.json)',
    fileGroups: [{ type: 'file', path: 'settings.json' }],
  },
  keybindings: {
    value: 'keybindings',
    name: '快捷键绑定 (keybindings.json)',
    fileGroups: [{ type: 'file', path: 'keybindings.json' }],
  },
  snippets: {
    value: 'snippets',
    name: '代码片段 (snippets/*)',
    fileGroups: [{ type: 'dir', path: 'snippets' }],
  },
  extensions: {
    value: 'extensions',
    name: '插件',
  },
};

const configurationList = Object.freeze(map2List(configurationMap));

module.exports = {
  configurationList,
};
