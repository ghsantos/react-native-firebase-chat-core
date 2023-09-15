module.exports = {
  extends: ['@react-native-community', 'plugin:prettier/recommended'],
  plugins: ['simple-import-sort'],
  root: true,
  rules: {
    'import/order': 'off',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'off',
    'sort-imports': 'off',
  },
}
