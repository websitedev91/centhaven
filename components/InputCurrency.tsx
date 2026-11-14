'use client';

import { currencySymbol, localeFor, type CurrencyCode } from '@/lib/format';
import { InputNumber, type InputNumberProps } from './InputNumber';

export function InputCurrency(props: Omit<InputNumberProps, 'prefix' | 'grouping' | 'locale'> & { currency: CurrencyCode }) {
  const { currency, ...rest } = props;
  return <InputNumber {...rest} prefix={currencySymbol(currency)} grouping locale={localeFor(currency)} />;
}
