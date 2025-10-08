module.exports = {
  extends: ['expo'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Temporarily disable import namespace check due to SDK 54 compatibility
    'import/namespace': 'off',
  },
};
