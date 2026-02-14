import { describe, it, expect } from 'vitest';
import * as logsCommand from '../commands/logs.js';

describe('logs command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof logsCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = logsCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention showing logs', () => {
      const help = logsCommand.help();
      expect(help.toLowerCase()).toContain('log');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof logsCommand.main).toBe('function');
    });
  });
});
