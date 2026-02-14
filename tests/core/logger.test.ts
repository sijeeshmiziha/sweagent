/**
 * Tests for createLogger (Pino-based)
 */

import { Writable } from 'node:stream';
import { describe, it, expect } from 'vitest';
import type pino from 'pino';
import { createLogger } from '../../src/lib/utils/logger';

function captureStream(): { stream: pino.DestinationStream; lines: string[] } {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer | string, _enc, cb) {
      const text = chunk.toString();
      text.split('\n').forEach(line => {
        const t = line.trim();
        if (t) lines.push(t);
      });
      cb();
    },
  }) as pino.DestinationStream;
  return { stream, lines };
}

describe('createLogger', () => {
  it('should use default config and output JSON with level and msg', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'info', destination: stream });
    logger.info('hello');
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.level).toBe(30);
    expect(parsed.msg).toBe('hello');
  });

  it('should not output debug when level is info', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'info', destination: stream });
    logger.debug('hidden');
    expect(lines).toHaveLength(0);
    logger.info('visible');
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]!).msg).toBe('visible');
  });

  it('should output all four log methods when level is debug', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'debug', destination: stream });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(lines).toHaveLength(4);
    expect(JSON.parse(lines[0]!).level).toBe(20);
    expect(JSON.parse(lines[0]!).msg).toBe('d');
    expect(JSON.parse(lines[1]!).level).toBe(30);
    expect(JSON.parse(lines[1]!).msg).toBe('i');
    expect(JSON.parse(lines[2]!).level).toBe(40);
    expect(JSON.parse(lines[2]!).msg).toBe('w');
    expect(JSON.parse(lines[3]!).level).toBe(50);
    expect(JSON.parse(lines[3]!).msg).toBe('e');
  });

  it('should include name in output', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({
      name: 'Agent',
      level: 'debug',
      destination: stream,
    });
    logger.info('test');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.name).toBe('Agent');
    expect(parsed.msg).toBe('test');
  });

  it('should include timestamp in JSON output', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'info', destination: stream });
    logger.info('msg');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.time).toBeDefined();
    expect(parsed.msg).toBe('msg');
  });

  it('should pass data to debug', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'debug', destination: stream });
    logger.debug('msg', { key: 'value' });
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.msg).toBe('msg');
    expect(parsed.key).toBe('value');
  });

  it('should call error with Error object', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'error', destination: stream });
    const err = new Error('fail');
    logger.error('message', err);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.msg).toBe('message');
    expect(parsed.err).toBeDefined();
    expect(parsed.err.message).toBe('fail');
  });

  it('should call error with Record data', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'error', destination: stream });
    logger.error('message', { code: 500 });
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.msg).toBe('message');
    expect(parsed.code).toBe(500);
  });

  it('should respect level hierarchy: error only', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'error', destination: stream });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]!).msg).toBe('e');
  });

  it('should respect level hierarchy: warn and above', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ level: 'warn', destination: stream });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]!).msg).toBe('w');
    expect(JSON.parse(lines[1]!).msg).toBe('e');
  });

  it('should support child logger with bindings', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({
      name: 'App',
      level: 'info',
      destination: stream,
    });
    const childLogger = logger.child({ component: 'Agent', stage: 'discovery' });
    childLogger.info('Processing');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.name).toBe('App');
    expect(parsed.component).toBe('Agent');
    expect(parsed.stage).toBe('discovery');
    expect(parsed.msg).toBe('Processing');
  });
});
