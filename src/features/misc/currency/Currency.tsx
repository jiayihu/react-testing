type Props = { amount: string | number; currency: string };

export function Currency({ amount, currency }: Props) {
  return (
    <>
      {Number(amount).toLocaleString(undefined, {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol',
      })}
    </>
  );
}
