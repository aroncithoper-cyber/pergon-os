import type { LogLevel } from "./types";

type LogFields = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

function write(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...fields,
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case "debug":
      console.debug(line);
      break;
    case "info":
      console.info(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  debug(message: string, fields?: LogFields) {
    if (process.env.NODE_ENV === "production") return;
    write("debug", message, fields);
  },
  info(message: string, fields?: LogFields) {
    write("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    write("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    write("error", message, fields);
  },
  exception(message: string, error: unknown, fields?: LogFields) {
    write("error", message, {
      ...fields,
      error: serializeError(error),
    });
  },
};

export type Logger = typeof logger;
