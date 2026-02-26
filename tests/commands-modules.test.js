import { describe, it, expect } from 'vitest';

describe('modules command', () => {
  describe('register()', () => {
    it('should export a register function', async () => {
      const cmd = await import('../commands/modules.js');
      expect(typeof cmd.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('should export an action function', async () => {
      const cmd = await import('../commands/modules.js');
      expect(typeof cmd.action).toBe('function');
    });
  });
});
