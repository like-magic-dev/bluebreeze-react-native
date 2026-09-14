import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      "lib/**",
      "ios/generated/**",
      "android/generated/**",
      "**/build/**",
      "example/ios/Pods/**",
    ],
  },
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [
      "**/babel.config.js",
      "**/metro.config.js",
      "**/jest.config.js",
      "**/react-native.config.js",
    ],
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];