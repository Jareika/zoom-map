// eslint.config.mjs
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tsparser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  // Global ignores
  {
    ignores: [
      "main.js",
      "node_modules/**",
      "dist/**",
      ".obsidian/**",
      "versions.json",
      "eslint.config.mjs",
    ],
  },

  // Hauptkonfiguration für deinen Plugin-Code (TypeScript)
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsparser,
      parserOptions: {
        // typed linting, nutzt dein tsconfig.json
        project: "./tsconfig.json",
      },
    },
    plugins: {
      obsidianmd,
    },
    rules: {
      // Basis-JavaScript-Regeln
      ...js.configs.recommended.rules,

      // Optional: Konsolen-Logging erlauben
      "no-console": "off",

      // Obsidian-spezifische Regeln (minimaler sinnvoller Satz)
      "obsidianmd/commands/no-command-in-command-id": "error",
      "obsidianmd/commands/no-command-in-command-name": "error",
      "obsidianmd/commands/no-default-hotkeys": "warn",
      "obsidianmd/commands/no-plugin-id-in-command-id": "error",
      "obsidianmd/commands/no-plugin-name-in-command-name": "error",

      "obsidianmd/prefer-file-manager-trash-file": "error",
      "obsidianmd/no-view-references-in-plugin": "error",
      "obsidianmd/no-sample-code": "error",
      "obsidianmd/validate-manifest": "error",

      "obsidianmd/settings-tab/no-manual-html-headings": "warn",
      "obsidianmd/ui/sentence-case": "warn",
    },
  },

  // Node-only: esbuild config
  {
    files: ["esbuild.config.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-console": "off",
    },
  },
]);