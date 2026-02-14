import { describe, it, expect } from 'vitest';
import * as configCommand from '../commands/config.js';

describe('config command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof configCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = configCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention configuration', () => {
      const help = configCommand.help();
      expect(help.toLowerCase()).toContain('config');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof configCommand.main).toBe('function');
    });
  });
});
