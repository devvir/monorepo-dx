import { describe, it, expect } from 'vitest';
import * as buildCommand from '../commands/build.js';

describe('build command', () => {
  describe('help()', () => {
    it('should export a help function', () => {
      expect(typeof buildCommand.help).toBe('function');
    });

    it('should return a string', () => {
      const help = buildCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention building', () => {
      const help = buildCommand.help();
      expect(help.toLowerCase()).toContain('build');
    });
  });

  describe('main()', () => {
    it('should export a main function', () => {
      expect(typeof buildCommand.main).toBe('function');
    });
  });
});
