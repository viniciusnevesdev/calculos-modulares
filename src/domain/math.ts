import { Decimal, parseRaw } from './numbers';
import type { Operation } from './boards';
export type Calculation = { ok: true; value: Decimal } | { ok: false; error: string };
export function calculate(a: string, b: string, operation: Operation): Calculation {
  const left = parseRaw(a), right = parseRaw(b);
  if (left.kind !== 'valid' || right.kind !== 'valid') return { ok: false, error: 'Preencha os dois valores com números válidos.' };
  if (operation === '/' && right.value.isZero()) return { ok: false, error: 'Não é possível dividir por zero.' };
  const value = operation === '+' ? left.value.plus(right.value)
    : operation === '-' ? left.value.minus(right.value)
    : operation === '*' ? left.value.times(right.value) : left.value.div(right.value);
  return { ok: true, value };
}
export function goalSummary(targetRaw: string, amounts: string[]) {
  const target = parseRaw(targetRaw), entries = amounts.map(parseRaw);
  if (target.kind !== 'valid' || entries.some(e => e.kind !== 'valid')) {
    return { ok: false as const, error: 'Complete os valores da meta e das entradas para calcular o total.' };
  }
  const sum = entries.reduce((total, entry) => entry.kind === 'valid' ? total.plus(entry.value) : total, new Decimal(0));
  const difference = target.value.minus(sum);
  const remaining = difference.gt(0) ? difference : new Decimal(0);
  const excess = difference.lt(0) ? difference.negated() : new Decimal(0);
  const percent = target.value.gt(0) ? sum.div(target.value).times(100) : null;
  const visualPercent = percent ? (percent.lt(0) ? 0 : percent.gt(100) ? 100 : percent.toNumber()) : 0;
  return { ok: true as const, sum, remaining, excess, percent, visualPercent };
}
