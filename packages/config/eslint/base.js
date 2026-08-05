import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  eslintConfigPrettier,
  {
    ignores: [
      "dist/**",
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "**/next-env.d.ts",
      "supabase/functions/**",
    ],
  },
];
