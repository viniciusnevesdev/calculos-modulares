import { Decimal, parseRaw } from './numbers';
import type { Operation } from './boards';
export type Calculation = { ok: true; value: Decimal } | { ok: false; error: string };
export function calculate(a: string, b: string, operation: Operation): Calculation {
  return calculateMany([a, b], operation);
}
export function calculateMany(amounts: string[], operation: Operation): Calculation {
  if (amounts.length < 2) return { ok: false, error: 'Adicione pelo menos dois valores.' };
  const parsed = amounts.map(parseRaw);
  if (parsed.some(item => item.kind !== 'valid')) {
    return { ok: false, error: 'Preencha todos os valores com números válidos.' };
  }
  // Every value was validated above. Reduce left-to-right, using Decimal for exact sums.
  const numbers = parsed.map(item => {
    if (item.kind !== 'valid') throw new Error('Valor inválido após validação');
    return item.value;
  });
  let value = numbers[0];
  for (const next of numbers.slice(1)) {
    if (operation === '/' && next.isZero()) return { ok: false, error: 'Não é possível dividir por zero.' };
    value = operation === '+' ? value.plus(next)
      : operation === '-' ? value.minus(next)
      : operation === '*' ? value.times(next) : value.div(next);
  }
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
