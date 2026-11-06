import { describe, expect, it, vi } from 'vitest';
import { newId } from '../src/domain/ids';
import { newBoard, newEntry, duplicateBoard } from '../src/domain/boards';

describe('IDs no Safari sobre HTTP local', () => {
  it('usa geração criptográfica quando randomUUID não existe (origem HTTP)', () => {
    const original = globalThis.crypto;
    vi.stubGlobal('crypto', { getRandomValues: original.getRandomValues.bind(original) });
    try {
      const id = newId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(new Set(Array.from({ length: 100 }, () => newId())).size).toBe(100);
      const board = newBoard('goal');
      expect(board.id).toMatch(/^[0-9a-f]{8}-/);
      const entry = newEntry();
      expect(entry.id).not.toBe(board.id);
      const copy = duplicateBoard(board);
      expect(copy.id).not.toBe(board.id);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('gera IDs normalmente com randomUUID disponível', () => {
    expect(newId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it('indica impossibilidade caso não haja geração segura', () => {
    vi.stubGlobal('crypto', {});
    try {
      expect(newId).toThrow(/identificador seguro/);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
