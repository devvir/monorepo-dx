import { describe, it, expect } from 'vitest';
import * as installCommand from '../commands/install.js';

describe('install command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof installCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = installCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention installing', () => {
      const help = installCommand.help();
      expect(help.toLowerCase()).toContain('install');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof installCommand.main).toBe('function');
    });
  });
});
