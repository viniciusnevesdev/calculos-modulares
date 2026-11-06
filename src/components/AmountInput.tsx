import { useState, type ChangeEvent } from 'react';
import { displayRaw, parseRaw } from '../domain/numbers';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currency?: boolean;
  placeholder?: string;
  id?: string;
};

export function AmountInput({ label, value, onChange, currency = true, placeholder = '0,00', id }: Props) {
  const [editing, setEditing] = useState(false);
  const [touched, setTouched] = useState(false);
  const parsed = parseRaw(value);
  const invalid = touched && parsed.kind !== 'valid';
  const error = parsed.kind === 'empty' ? 'Valor não informado.' : 'Use um número válido, como 1.250,50.';

  function changed(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <label className={'amount-control' + (invalid ? ' has-error' : '')}>
      <span className="field-label">{label}</span>
      <span className="amount-wrap">
        {currency && <span className="money-prefix" aria-hidden="true">R$</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={invalid}
          value={editing ? value : displayRaw(value, currency)}
          onChange={changed}
          onFocus={(event) => {
            setEditing(true);
            event.currentTarget.select();
          }}
          onBlur={() => { setEditing(false); setTouched(true); }}
        />
      </span>
      {invalid && <span className="field-error" role="status">{error}</span>}
    </label>
  );
}
