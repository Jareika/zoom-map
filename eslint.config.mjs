import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
// Globale Ignores (ersetzt .eslintignore)
{
ignores: [
"node_modules/",
"dist/",
"build/**",
"main.js",
"manifest.json",
"versions.json",
"esbuild.config.mjs"
],
},

// Basis-Empfehlungen von ESLint für JS (unschädlich, auch wenn du nur TS hast)
js.configs.recommended,

// TypeScript-Empfehlungen (mit Type-Checking)
...tseslint.configs.recommendedTypeChecked,
...tseslint.configs.stylisticTypeChecked,

// Projekt-spezifische Einstellungen + Regeln
{
files: ["src/**/*.ts"],
languageOptions: {
ecmaVersion: 2022,
sourceType: "module",
globals: { ...globals.browser, ...globals.node },
parserOptions: {
// Type-aware Linting (schnell und stabil)
projectService: true,
tsconfigRootDir: import.meta.dirname,
// Alternative (klassisch, falls gewünscht):
// project: ["./tsconfig.json"],
},
},
rules: {
"@typescript-eslint/no-explicit-any": "off",
"@typescript-eslint/no-misused-promises": ["warn", { checksVoidReturn: false }],
"@typescript-eslint/consistent-type-imports": "warn",
"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^", varsIgnorePattern: "^" }],
"no-console": "off",
},
},
);