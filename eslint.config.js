import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public/pdfjs', '.preview-artifacts', '.dotnet'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { URL: 'readonly', process: 'readonly', Buffer: 'readonly' } },
  },
  {
    // Playwright callbacks run in the browser; their harness runs in Node.
    files: ['tests/browser/**/*.mjs', 'docs/refinement/evidence/**/*.mjs'],
    languageOptions: { globals: Object.fromEntries(['URL', 'Buffer', 'process', 'console', 'fetch', 'crypto', 'document', 'window', 'innerWidth', 'sessionStorage', 'localStorage', 'Image', 'navigator', 'setTimeout', 'clearTimeout', 'getComputedStyle'].map(name => [name, 'readonly'])) },
    rules: { 'no-redeclare': ['error', { builtinGlobals: false }] },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022 },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
