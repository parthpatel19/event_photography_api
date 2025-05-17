import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/node_modules"],
  },
  {
    languageOptions: {
      globals: globals.node
    },
  },
  pluginJs.configs.recommended,
];