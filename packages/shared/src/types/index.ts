export type AppId = "web" | "admin";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type JsonValue =
  string | number | boolean | null | { [key: string]: JsonValue | undefined } | JsonValue[];
