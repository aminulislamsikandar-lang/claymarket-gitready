import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'backend'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Only the two classic, battle-tested hooks rules. The plugin's full
      // "recommended" preset also bundles ~15 newer React Compiler
      // readiness rules (set-state-in-effect, purity, immutability, etc.)
      // that flag common, non-buggy patterns across this codebase — turning
      // those on is a separate, larger refactor, not a lint-setup task.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Codebase currently relies on a handful of intentional `any` casts
      // (dynamic Firestore field updates, third-party lib gaps). Keep this a
      // warning, not an error, so it's visible without blocking every build.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
);
