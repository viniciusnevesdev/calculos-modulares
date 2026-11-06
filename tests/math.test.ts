import { describe, expect, it } from 'vitest';
import { calculate, goalSummary } from '../src/domain/math';
import { Decimal, formatDecimal, parseRaw } from '../src/domain/numbers';
import { duplicateBoard, newBoard, swapOperands, type CalculatorBoard, type GoalBoard } from '../src/domain/boards';

describe('Valores pt-BR', () => {
  it('diferencia vazio de zero', () => {
    expect(parseRaw('').kind).toBe('empty');
    expect(parseRaw('0').kind).toBe('valid');
  });
  it('não converte entradas inválidas em zero', () => {
    expect(parseRaw('abc').kind).toBe('invalid');
    expect(parseRaw('10.5').kind).toBe('invalid');
    expect(parseRaw('1,2,3').kind).toBe('invalid');
  });
  it('reconhece milhar, vírgula e valores negativos', () => {
    const p = parseRaw('-1.234,50');
    expect(p.kind).toBe('valid');
    if (p.kind === 'valid') expect(p.value.toString()).toBe('-1234.5');
  });
  it('formata BRL com separadores locais', () => {
    expect(formatDecimal(new Decimal('1234567.5'))).toBe('1.234.567,50');
  });
});
describe('Calculadora segura', () => {
  it('soma decimais sem erro binário', () => {
    const r = calculate('0,1','0,2','+');
    expect(r.ok).toBe(true);
    if(r.ok)expect(r.value.toString()).toBe('0.3');
  });
  it('subtrai', () => {
    const r=calculate('100','40','-');
    expect(r.ok&&r.value.toString()).toBe('60');
  });
  it('multiplica', () => {
    const r=calculate('2,5','4','*');
    expect(r.ok&&r.value.toString()).toBe('10');
  });
  it('divide', () => {
    const r=calculate('100','4','/');
    expect(r.ok&&r.value.toString()).toBe('25');
  });
  it('trata divisão por zero',()=>{
    const r=calculate('100','0','/');
    expect(r.ok).toBe(false);
    if(!r.ok)expect(r.error).toMatch(/zero/);
  });
  it('recusa valores inválidos e vazios',()=>{
    expect(calculate('','2','+').ok).toBe(false);
    expect(calculate('abc','2','+').ok).toBe(false);
  });
  it('inverte sem mudar a operação',()=>{
    const b=newBoard('calculator') as CalculatorBoard;
    const inverted=swapOperands({...b,a:'12',b:'4',operation:'-'});
    expect([inverted.a,inverted.b,inverted.operation]).toEqual(['4','12','-']);
  });
});
describe('Meta financeira',()=>{
  it('soma uma lista dinâmica',()=>{
    const result=goalSummary('1000',['200','150','250']);
    expect(result.ok).toBe(true);
    if(result.ok){
      expect(result.sum.toString()).toBe('600');
      expect(result.remaining.toString()).toBe('400');
      expect(result.visualPercent).toBe(60);
    }
  });
  it('permite zero e 100%',()=>{
    const zero=goalSummary('1000',[]);
    const full=goalSummary('1000',['1000']);
    expect(zero.ok&&zero.visualPercent).toBe(0);
    expect(full.ok&&full.visualPercent).toBe(100);
  });
  it('acima de 100% mantém o percentual verdadeiro e a barra em 100%',()=>{
    const r=goalSummary('100',['150']);
    expect(r.ok).toBe(true);
    if(r.ok){expect(r.percent?.toString()).toBe('150');expect(r.visualPercent).toBe(100);expect(r.excess.toString()).toBe('50');}
  });
  it('meta zero e negativa não produzem percentuais inválidos',()=>{
    for(const target of ['0','-100']){
      const r=goalSummary(target,['20']);
      expect(r.ok).toBe(true);
      if(r.ok){expect(r.percent).toBeNull();expect(r.visualPercent).toBe(0);}
    }
  });
  it('entrada negativa ajusta o recebido',()=>{
    const r=goalSummary('1000',['100','-20']);
    expect(r.ok&&r.sum.toString()).toBe('80');
  });
  it('entrada vazia não vira zero',()=>{
    expect(goalSummary('1000',['']).ok).toBe(false);
  });
  it('duplica entradas com IDs novos',()=>{
    const b=newBoard('goal') as GoalBoard;
    b.entries=[{id:crypto.randomUUID(),label:'Cliente',amount:'100',sources:[]}];
    const copy=duplicateBoard(b) as GoalBoard;
    expect(copy.id).not.toBe(b.id);
    expect(copy.entries[0].id).not.toBe(b.entries[0].id);
    expect(copy.entries[0].amount).toBe(b.entries[0].amount);
  });
});
