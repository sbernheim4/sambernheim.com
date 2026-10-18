import { useMemo, type ComponentPropsWithoutRef } from "react";

export type NumberProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  value: number | bigint;
  locale?: string | string[];
  formatOptions?: Intl.NumberFormatOptions;
};

export const Number = ({ value, locale, formatOptions, ...props }: NumberProps) => {
  const formatted = useMemo(() => {
    return new Intl.NumberFormat(locale, formatOptions).format(value);
  }, [formatOptions, locale, value]);

  return <span {...props}>{formatted}</span>;
};
