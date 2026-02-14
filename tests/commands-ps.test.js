import { describe, it, expect } from 'vitest';
import * as psCommand from '../commands/ps.js';

describe('ps command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof psCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = psCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention listing processes', () => {
      const help = psCommand.help();
      expect(help.toLowerCase()).toContain('ps');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof psCommand.main).toBe('function');
    });
  });
});
