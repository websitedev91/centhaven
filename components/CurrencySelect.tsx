'use client';

import { useId } from 'react';
import { CURRENCIES, CURRENCY_LABEL, type CurrencyCode } from '@/lib/format';
import { FieldShell, fieldClass } from './FieldShell';

export function CurrencySelect(props: {
  value: CurrencyCode;
  onChange: (c: CurrencyCode) => void;
  label?: string;
  options?: readonly CurrencyCode[];
}) {
  const id = useId();
  const options = props.options ?? CURRENCIES;
  return (
    <FieldShell id={id} label={props.label ?? 'Currency'}>
      <select
        id={id}
        className={fieldClass}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as CurrencyCode)}
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {CURRENCY_LABEL[c]}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
