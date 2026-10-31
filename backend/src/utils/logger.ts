type LogMetadata = Record<string, unknown>;

const SENSITIVE_KEY = /(authorization|cookie|password|secret|token|uri|connection)/i;

function sanitize(metadata: LogMetadata): LogMetadata {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, SENSITIVE_KEY.test(key) ? "[redacted]" : value])
  );
}

function write(level: "info" | "warn" | "error", message: string, metadata: LogMetadata = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitize(metadata),
  };

  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
    return;
  }

  console.log(output);
}

export const logger = {
  info: (message: string, metadata?: LogMetadata) => write("info", message, metadata),
  warn: (message: string, metadata?: LogMetadata) => write("warn", message, metadata),
  error: (message: string, metadata?: LogMetadata) => write("error", message, metadata),
};
