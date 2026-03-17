const createFormatter = (minimumFractionDigits, maximumFractionDigits) =>
  new Intl.NumberFormat('en-LK', {
    minimumFractionDigits,
    maximumFractionDigits,
  });

const currencyFormatter = createFormatter(2, 2);
const wholeCurrencyFormatter = createFormatter(0, 0);
const compactFormatter = new Intl.NumberFormat('en-LK', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatLkr = (value, options = {}) => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    prefix = 'LKR',
  } = options;

  const amount = Number(value || 0);
  const formatter =
    minimumFractionDigits === 0 && maximumFractionDigits === 0
      ? wholeCurrencyFormatter
      : minimumFractionDigits === 2 && maximumFractionDigits === 2
        ? currencyFormatter
        : createFormatter(minimumFractionDigits, maximumFractionDigits);

  return `${prefix} ${formatter.format(amount)}`;
};

export const formatLkrCompact = (value) => {
  const amount = Number(value || 0);
  return `LKR ${compactFormatter.format(amount)}`;
};