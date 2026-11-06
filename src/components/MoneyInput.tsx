import { useId } from 'react';
import { rawError } from '../domain/numbers';
export function MoneyInput({ label, value, onChange, currency = true }: { label: string; value: string; onChange: (value: string) => void; currency?: boolean }) {
  const id = useId();
  const error = rawError(value);
  return <div className="field"><label htmlFor={id}>{label}</label><div className="money-input">{currency && <span>R$</span>}<input id={id} type="text" inputMode="decimal" autoComplete="off" spellCheck={false} value={value} onChange={e => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} /><button type="button" className="sign" aria-label={`Trocar sinal de ${label}`} onClick={() => onChange(value.startsWith('-') ? value.slice(1) : `-${value}`)}>±</button></div>{error && <small id={`${id}-error`}>{error}</small>}</div>;
}
