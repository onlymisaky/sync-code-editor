const antfu = require('@antfu/eslint-config').default;

module.exports = antfu({
  type: 'lib',
  ignores: [
    'node_modules/**',
  ],
  rules: {
    // 'semi': ['error', 'always'],
    // '@stylistic/semi': ['error', 'always'],
    'jsdoc/require-returns-description': 'off',
  },
  stylistic: {
    semi: true,
  },
});
