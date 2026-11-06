import { newId } from './ids';
export type Operation = '+' | '-' | '*' | '/';
export type Source = { boardId: string; fieldId: string };
export interface Entry { id: string; label: string; amount: string; sources: Source[] }
interface BaseBoard {
  id: string; title: string; schemaVersion: 1; createdAt: string; updatedAt: string; sources: Source[];
}
export interface GoalBoard extends BaseBoard { kind: 'goal'; target: string; entries: Entry[] }
export interface CalculatorValue { id: string; amount: string }
export interface CalculatorBoard extends BaseBoard {
  kind: 'calculator'; a: string; b: string; operation: Operation; display: 'brl' | 'number';
  // Optional for backwards compatibility with calculators saved before multi-value support.
  extraValues?: CalculatorValue[];
}
export type Board = GoalBoard | CalculatorBoard;
export function newEntry(): Entry {
  return { id: newId(), label: 'Nova entrada', amount: '', sources: [] };
}
export function newBoard(kind: Board['kind'], now = new Date().toISOString()): Board {
  const base = { id: newId(), title: kind === 'goal' ? 'Minha meta' : 'Meu cálculo',
    schemaVersion: 1 as const, createdAt: now, updatedAt: now, sources: [] };
  return kind === 'goal'
    ? { ...base, kind, target: '1000', entries: [] }
    : { ...base, kind, a: '', b: '', extraValues: [], operation: '+', display: 'brl' };
}
export function duplicateBoard(board: Board, now = new Date().toISOString()): Board {
  const copy: Board = { ...structuredClone(board), id: newId(),
    title: `${board.title || 'Sem título'} (cópia)`, createdAt: now, updatedAt: now };
  if (copy.kind === 'goal') copy.entries = copy.entries.map(entry => ({ ...entry, id: newId() }));
  if (copy.kind === 'calculator' && copy.extraValues) {
    copy.extraValues = copy.extraValues.map(value => ({ ...value, id: newId() }));
  }
  return copy;
}
export function swapOperands(board: CalculatorBoard): CalculatorBoard {
  return { ...board, a: board.b, b: board.a };
}
export function addCalculatorValue(board: CalculatorBoard): CalculatorBoard {
  return { ...board, extraValues: [...(board.extraValues ?? []), { id: newId(), amount: '' }] };
}
export function updateCalculatorValue(board: CalculatorBoard, id: string, amount: string): CalculatorBoard {
  return { ...board, extraValues: (board.extraValues ?? []).map(value => value.id === id ? { ...value, amount } : value) };
}
export function removeCalculatorValue(board: CalculatorBoard, id: string): CalculatorBoard {
  return { ...board, extraValues: (board.extraValues ?? []).filter(value => value.id !== id) };
}
// Validate stored records before rendering; unknown schemas are never overwritten.
export function isBoard(value: unknown): value is Board {
  if (!value || typeof value !== 'object') return false;
  const b = value as Record<string, unknown>;
  if (b.schemaVersion !== 1 || !['id', 'title', 'createdAt', 'updatedAt'].every(k => typeof b[k] === 'string')
    || !Array.isArray(b.sources)) return false;
  if (b.kind === 'calculator') {
    const extras = b.extraValues;
    return typeof b.a === 'string' && typeof b.b === 'string'
      && ['+', '-', '*', '/'].includes(b.operation as string) && ['brl', 'number'].includes(b.display as string)
      && (extras === undefined || (Array.isArray(extras)
        && extras.every(value => value && typeof value.id === 'string' && typeof value.amount === 'string')
        && new Set(extras.map(value => value.id)).size === extras.length));
  }
  return b.kind === 'goal' && typeof b.target === 'string' && Array.isArray(b.entries)
    && b.entries.every(e => e && typeof e.id === 'string' && typeof e.label === 'string'
      && typeof e.amount === 'string' && Array.isArray(e.sources))
    && new Set(b.entries.map(e => e.id)).size === b.entries.length;
}
