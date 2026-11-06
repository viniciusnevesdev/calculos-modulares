import { describe, expect, it } from 'vitest';
import { calculateMany } from '../src/domain/math';
import {
  addCalculatorValue, updateCalculatorValue, removeCalculatorValue,
  newBoard, duplicateBoard, isBoard, type CalculatorBoard,
} from '../src/domain/boards';

describe('Calculadora com quantidade livre de valores', () => {
  it('soma sete campos usando decimais exatos', () => {
    const values = ['0,1', '0,2', '10', '20', '30', '40', '50'];
    const result = calculateMany(values, '+');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.toString()).toBe('150.3');
  });
  it('aceita mais de sete campos e valores negativos', () => {
    const values = [...Array.from({ length: 30 }, () => '1'), '-4', '0,25'];
    const result = calculateMany(values, '+');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.toString()).toBe('26.25');
  });
  it('não considera um valor extra vazio como zero', () => {
    expect(calculateMany(['100', '20', ''], '+').ok).toBe(false);
    expect(calculateMany(['100', '20', 'abc'], '+').ok).toBe(false);
    const zero = calculateMany(['100', '20', '0'], '+');
    expect(zero.ok).toBe(true);
    if (zero.ok) expect(zero.value.toString()).toBe('120');
  });
  it('aplica a operação selecionada a todos na ordem', () => {
    const cases: Array<[string, string, string]> = [
      ['-', '70', '100,20,10'],
      ['*', '24', '2,3,4'],
      ['/', '5', '100,4,5'],
    ];
    for (const [operation, expected, values] of cases) {
      const r = calculateMany(values.split(','), operation as '+'|'-'|'*'|'/');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.toString()).toBe(expected);
    }
  });
  it('detecta divisão por zero em qualquer valor adicional', () => {
    const result = calculateMany(['100', '2', '0', '4'], '/');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/dividir por zero/);
  });
  it('cria, edita, remove e preserva a ordem dos campos adicionais', () => {
    let board = newBoard('calculator') as CalculatorBoard;
    expect(board.extraValues).toEqual([]);
    for (let i=0; i<5; i++) board = addCalculatorValue(board);
    expect(board.extraValues).toHaveLength(5);
    const ids = board.extraValues!.map(v=>v.id);
    expect(new Set(ids).size).toBe(5);
    for (let i=0;i<5;i++) board=updateCalculatorValue(board,ids[i],String(i+3));
    expect(board.extraValues!.map(v=>v.amount)).toEqual(['3','4','5','6','7']);
    board=removeCalculatorValue(board,ids[1]);
    expect(board.extraValues!.map(v=>v.amount)).toEqual(['3','5','6','7']);
    expect(isBoard(board)).toBe(true);
  });
  it('mantém calculadoras antigas com dois valores sem migrar o banco', () => {
    const board=newBoard('calculator') as CalculatorBoard;
    delete board.extraValues;
    expect(isBoard(board)).toBe(true);
    const updated=addCalculatorValue(board);
    expect(updated.extraValues).toHaveLength(1);
    expect(isBoard(updated)).toBe(true);
  });
  it('duplica calculadoras mantendo valores e criando IDs únicos', () => {
    let board=newBoard('calculator') as CalculatorBoard;
    board={ ...board, a:'10',b:'20' };
    board=addCalculatorValue(board);
    board=updateCalculatorValue(board,board.extraValues![0].id,'30');
    const copy=duplicateBoard(board) as CalculatorBoard;
    expect(copy.id).not.toBe(board.id);
    expect(copy.extraValues![0].id).not.toBe(board.extraValues![0].id);
    expect(copy.extraValues![0].amount).toBe('30');
    expect(copy.a).toBe('10');
    expect(copy.b).toBe('20');
  });
  it('rejeita registros de calculadora corrompidos, preservando base anterior', () => {
    const board=newBoard('calculator') as CalculatorBoard;
    expect(isBoard({...board,extraValues:[{id:'same',amount:'1'},{id:'same',amount:'2'}]})).toBe(false);
    expect(isBoard({...board,extraValues:[{id:'one',amount:13}]})).toBe(false);
    expect(isBoard({...board,extraValues:'not-array'})).toBe(false);
  });
});
