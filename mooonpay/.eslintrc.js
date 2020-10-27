module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: { jest: true, browser: true, node: true },
  rules: {
    'no-console': 'warn',
    // Fix problem that causes eslint to request that all importsinclude the extension, thus breaking them
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
      },
    ],
    // Replace eslint's 'no-unused-vars' rule for tslint's one
    "@typescript-eslint/no-unused-vars-experimental": "error",
    "no-unused-vars": "off",
    // Disable rule. Rationale: code is much more readable when this rule is not enabled
    "prefer-destructuring": "off",
  },
  overrides: [
    {
      // Remove rule that disables "for of" loops in test files. Rationale: it doesnt matter if the generated code is large there as it never gets shipped to production
      files: ["*.test.ts", "**/__mocks__/*"],
      rules: {
        "no-restricted-syntax": "off"
      }
    }
  ],
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.ts'],
      },
    },
  },
};
