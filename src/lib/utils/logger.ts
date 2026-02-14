/**
 * Structured logger using Pino (JSON by default, optional pretty/file)
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
  /** Optional stream for testing (bypasses transport) */
  destination?: pino.DestinationStream;
}

export function createLogger(config: LoggerConfig = {}): Logger {
  const { name, level = 'info', pretty = false, file, destination } = config;

  let pinoLogger: pino.Logger;

  if (destination) {
    pinoLogger = pino({ name, level }, destination);
  } else {
    const targets: pino.TransportTargetOptions[] = [];

    if (pretty) {
      targets.push({
        target: 'pino-pretty',
        options: { colorize: true },
        level,
      });
    } else {
      targets.push({
        target: 'pino/file',
        options: { destination: 1 },
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
    child: bindings => wrapPino(p.child(bindings)),
  };
}
