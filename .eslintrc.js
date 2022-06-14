module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'google',
    'eslint:recommended',
  ],
  overrides: [
    {
      files: ['*.js'],
    },
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    babelOptions: {
      plugins: [
        '@babel/syntax-import-assertions',
      ],
    },
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'import',
  ],
  rules: {
    'import/newline-after-import': ['error', {count: 2}],
    'max-len': ['error', 140],
    'no-irregular-whitespace': ['error'],
    'no-trailing-spaces': ['error'],
    'prefer-rest-params': 'off',
    'quote-props': ['error', 'consistent-as-needed'],
    'semi': ['error', 'never'],
  },
  settings: {
  },
  reportUnusedDisableDirectives: true,
}
