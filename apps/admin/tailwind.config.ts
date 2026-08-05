import type { Config } from "tailwindcss";
import sharedConfig from "@pergon/config/tailwind";

const config: Config = {
  darkMode: sharedConfig.darkMode,
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [sharedConfig],
};

export default config;
