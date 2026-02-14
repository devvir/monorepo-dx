import { describe, it, expect } from 'vitest';
import * as helpCommand from '../commands/help.js';

describe('help command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof helpCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = helpCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention help', () => {
      const help = helpCommand.help();
      expect(help.toLowerCase()).toContain('help');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof helpCommand.main).toBe('function');
    });
  });
});
