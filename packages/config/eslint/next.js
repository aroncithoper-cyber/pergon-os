import pluginNext from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { baseConfig } from "./base.js";

/** Next.js Flat Config fragment (plugin + core-web-vitals rules) for monorepo root. */
export const nextPluginFlatConfig = {
  ...pluginNext.flatConfig.coreWebVitals,
  settings: {
    next: {
      rootDir: ["apps/web/", "apps/admin/"],
    },
  },
};

/** @type {import("eslint").Linter.Config[]} */
export const nextJsConfig = [
  ...baseConfig,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    ...pluginNext.flatConfig.coreWebVitals,
    settings: {
      next: {
        // Per-app ESLint runs with cwd = apps/<app>; "." is that app root.
        rootDir: ["."],
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  eslintConfigPrettier,
];
