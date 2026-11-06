import Decimal from 'decimal.js-light';

// 80 significant digits for arithmetic; UI accepts at most 30 digits per field.
Decimal.set({ precision: 80, rounding: Decimal.ROUND_HALF_UP });
export { Decimal };
export type Parsed = { kind: 'valid'; value: Decimal } | { kind: 'empty' | 'invalid' };

/** pt-BR only: comma decimal separator, optional dots as thousands groups. */
export function parseRaw(raw: string): Parsed {
  const text = raw.trim();
  if (!text) return { kind: 'empty' };
  if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(text)
    || text.replace(/\D/g, '').length > 30) return { kind: 'invalid' };
  try {
    return { kind: 'valid', value: new Decimal(text.replace(/\./g, '').replace(',', '.')) };
  } catch { return { kind: 'invalid' }; }
}

export function editable(raw: string): string {
  const parsed = parseRaw(raw);
  return parsed.kind === 'valid' ? parsed.value.toFixed().replace('.', ',') : raw;
}

export function formatDecimal(value: Decimal, places = 2): string {
  const fixed = value.toFixed(places, Decimal.ROUND_HALF_UP);
  const [whole, fraction] = fixed.split('.');
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (fraction ? `,${fraction}` : '');
}
export function money(value: Decimal): string { return `R$ ${formatDecimal(value)}`; }
export function displayRaw(raw: string, currency: boolean): string {
  const parsed = parseRaw(raw);
  return parsed.kind === 'valid'
    ? (currency ? formatDecimal(parsed.value) : formatDecimal(parsed.value, parsed.value.decimalPlaces()))
    : raw;
}
export function rawError(raw: string): string | undefined {
  const parsed = parseRaw(raw);
  if (parsed.kind === 'empty') return 'Informe um valor. Vazio é diferente de zero.';
  if (parsed.kind === 'invalid') return 'Use números pt-BR, como -1.234,56 (até 30 dígitos).';
}
