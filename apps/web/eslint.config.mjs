import { nextJsConfig } from "@pergon/config/eslint/next";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    ignores: [".next/**", "next-env.d.ts", "postcss.config.js", "postcss.config.mjs"],
  },
];
