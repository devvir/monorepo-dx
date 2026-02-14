import { describe, it, expect } from 'vitest';
import * as downCommand from '../commands/down.js';

describe('down command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof downCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = downCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention stopping services', () => {
      const help = downCommand.help();
      expect(help.toLowerCase()).toContain('down');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof downCommand.main).toBe('function');
    });
  });
});
