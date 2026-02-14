import { describe, it, expect } from 'vitest';
import * as modulesCommand from '../commands/modules.js';

describe('modules command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof modulesCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = modulesCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention listing modules', () => {
      const help = modulesCommand.help();
      expect(help.toLowerCase()).toContain('module');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof modulesCommand.main).toBe('function');
    });
  });
});
