import { describe, it, expect } from 'vitest';
import * as serviceCommand from '../commands/service.js';

describe('service command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof serviceCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = serviceCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention service operations', () => {
      const help = serviceCommand.help();
      expect(help.toLowerCase()).toContain('service');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof serviceCommand.main).toBe('function');
    });
  });
});
