'use client';

import { currencySymbol, type CurrencyCode } from '@/lib/format';
import { InputNumber, type InputNumberProps } from './InputNumber';

export function InputCurrency(props: Omit<InputNumberProps, 'prefix' | 'grouping'> & { currency: CurrencyCode }) {
  const { currency, ...rest } = props;
  return <InputNumber {...rest} prefix={currencySymbol(currency)} grouping />;
}
