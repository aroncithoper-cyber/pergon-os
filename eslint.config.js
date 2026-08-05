import { baseConfig } from "@pergon/config/eslint/base";
import { nextPluginFlatConfig } from "@pergon/config/eslint/next";

/**
 * Root Flat Config for the monorepo.
 * lint-staged / Husky run ESLint from the repo root, so Next.js rules must be
 * registered here for apps/* (subdir eslint.config.mjs is not used in that path).
 */
/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ...nextPluginFlatConfig,
    files: ["apps/web/**/*.{js,jsx,mjs,cjs,ts,tsx}", "apps/admin/**/*.{js,jsx,mjs,cjs,ts,tsx}"],
  },
];
