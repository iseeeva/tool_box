const { antfu } = require('@antfu/eslint-config')

module.exports = antfu({
  rules: {
    'ts/no-namespace': 'off',
    'node/prefer-global/buffer': 'off',
    'node/prefer-global/process': 'off',
    'unused-imports/no-unused-vars': 'off',
    'style/max-statements-per-line': 'off',
    'regexp/no-unused-capturing-group': 'off',
    'no-console': 'off',
    'no-lone-blocks': 'off',
  },
})
