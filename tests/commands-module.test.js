import { describe, it, expect } from 'vitest';
import * as moduleCommand from '../commands/module.js';

describe('module command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof moduleCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = moduleCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention module operations', () => {
      const help = moduleCommand.help();
      expect(help.toLowerCase()).toContain('module');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof moduleCommand.main).toBe('function');
    });
  });
});
