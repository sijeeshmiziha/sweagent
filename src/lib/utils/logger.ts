/**
 * Structured logger using Pino (JSON by default, optional pretty/file).
 * Use loggerConfigFromEnv() for .env-driven config (SWE_LOG_* vars).
 */

import pino from 'pino';
import type { Logger } from '../types/common';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  /** Logger name (appears in logs) */
  name?: string;
  /** Minimum log level */
  level?: LogLevel;
  /** Use pino-pretty for readable output */
  pretty?: boolean;
  /** File path for JSON logs */
  file?: string;
  /** Console stream: stderr avoids mixing with stdout prompts (e.g. inquirer). Default: stderr when pretty, else stdout. */
  stream?: 'stdout' | 'stderr';
  /** When false, returns a no-op logger (no output). Set via SWE_LOG_ENABLED=0. */
  enabled?: boolean;
  /** Optional stream for testing (bypasses transport) */
  destination?: pino.DestinationStream;
}

const NOOP_LOGGER: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  child: () => NOOP_LOGGER,
};

export function createLogger(config: LoggerConfig = {}): Logger {
  if (config.enabled === false) {
    return NOOP_LOGGER;
  }

  const { name, level = 'info', pretty = false, file, stream, destination } = config;

  const streamFd = stream === 'stderr' ? 2 : stream === 'stdout' ? 1 : pretty ? 2 : 1;

  let pinoLogger: pino.Logger;

  if (destination) {
    pinoLogger = pino({ name, level }, destination);
  } else {
    const targets: pino.TransportTargetOptions[] = [];

    if (pretty) {
      targets.push({
        target: 'pino-pretty',
        options: {
          colorize: true,
          destination: streamFd,
          singleLine: true,
          ignore: 'time,pid,hostname',
          translateTime: false,
        },
        level,
      });
    } else {
      targets.push({
        target: 'pino/file',
        options: { destination: streamFd },
        level,
      });
    }

    if (file) {
      targets.push({
        target: 'pino/file',
        options: { destination: file, mkdir: true },
        level,
      });
    }

    const transport = pino.transport({ targets }) as pino.DestinationStream;
    pinoLogger = pino({ name, level }, transport);
  }

  return wrapPino(pinoLogger);
}

/**
 * Build logger config from process.env (SWE_* vars). Caller loads .env if desired (e.g. dotenv or `node --env-file=.env`).
 *
 * Env vars (all optional):
 * - SWE_LOG_ENABLED: 1|true|yes (default) = on; 0|false|no|disabled = off (no-op logger).
 * - SWE_LOG_LEVEL: debug|info|warn|error (default: info).
 * - SWE_LOG_STREAM: stdout|stderr; default stderr when SWE_LOG_PRETTY is true, else stdout.
 * - SWE_LOG_PRETTY: 1|true|yes = human-readable (pino-pretty); 0|false (default) = JSON.
 * - SWE_LOG_FILE: path to also write JSON logs to a file.
 * - SWE_LOG_NAME: logger name in output.
 *
 * For interactive CLIs (e.g. inquirer), use pretty and stderr so logs do not mix with stdout prompts.
 */
export function loggerConfigFromEnv(overrides: Partial<LoggerConfig> = {}): LoggerConfig {
  const raw = process.env;
  const enabledRaw = (raw.SWE_LOG_ENABLED ?? 'true').trim().toLowerCase();
  const enabled =
    enabledRaw !== '0' &&
    enabledRaw !== 'false' &&
    enabledRaw !== 'no' &&
    enabledRaw !== 'disabled';

  const levelRaw = (raw.SWE_LOG_LEVEL ?? 'info').trim().toLowerCase();
  const level: LogLevel =
    levelRaw === 'debug' || levelRaw === 'info' || levelRaw === 'warn' || levelRaw === 'error'
      ? levelRaw
      : 'info';

  const streamRaw = (raw.SWE_LOG_STREAM ?? '').trim().toLowerCase();
  const prettyRaw = (raw.SWE_LOG_PRETTY ?? '0').trim().toLowerCase();
  const pretty = prettyRaw === '1' || prettyRaw === 'true' || prettyRaw === 'yes';
  const stream: 'stdout' | 'stderr' =
    streamRaw === 'stdout'
      ? 'stdout'
      : streamRaw === 'stderr'
        ? 'stderr'
        : pretty
          ? 'stderr'
          : 'stdout';

  const file = raw.SWE_LOG_FILE?.trim() || undefined;
  const name = raw.SWE_LOG_NAME?.trim() || undefined;

  return {
    enabled,
    level,
    stream,
    pretty,
    ...(file && { file }),
    ...(name && { name }),
    ...overrides,
  };
}

function wrapPino(p: pino.Logger): Logger {
  return {
    debug: (msg, data) => {
      p.debug(data ?? {}, msg);
    },
    info: (msg, data) => {
      p.info(data ?? {}, msg);
    },
    warn: (msg, data) => {
      p.warn(data ?? {}, msg);
    },
    error: (msg, err) => {
      if (err instanceof Error) {
        p.error({ err }, msg);
      } else {
        p.error(err ?? {}, msg);
      }
    },
    child: (bindings: Record<string, unknown>) => wrapPino(p.child(bindings as pino.Bindings)),
  };
}
