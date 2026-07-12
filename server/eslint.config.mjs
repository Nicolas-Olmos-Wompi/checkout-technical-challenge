import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import jestPlugin from "eslint-plugin-jest";
import tseslint from "typescript-eslint";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { importX } from "eslint-plugin-import-x";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig(
  {
    ignores: ["**/{node_modules,build,dist}/**"],
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      unicorn: eslintPluginUnicorn,
      "import-x": importX,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
      ecmaVersion: 2024,
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "no-console": "error",
      "no-negated-condition": "error",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-extraneous-class": [
        "error",
        {
          allowStaticOnly: true,
          allowWithDecorator: true,
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowBoolean: true,
        },
      ],
      "prefer-object-has-own": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "no-useless-return": "error",
      "import-x/no-unresolved": ["off", { commonjs: true, amd: true }],
      "unicorn/prefer-node-protocol": "error",
      "unicorn/no-array-for-each": "error",
    },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    files: ["**/**.spec.ts", "**/__mocks__/**/*.ts"],
    ...jestPlugin.configs["flat/recommended"],
    ...jestPlugin.configs["flat/style"],
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "jest/unbound-method": "error",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.ts"],
    extends: [eslintPluginPrettierRecommended],
    rules: {
      ...eslintConfigPrettier.rules,
    },
  },
);
