export const roundPercentageValue = (total = 0, defaultPercentageValue = 0) => {
  const dividedValue = defaultPercentageValue / 2;
  const integralValue = defaultPercentageValue;

  const decimalValue = total > 1 ? dividedValue : integralValue;

  return Math.round(decimalValue);
};
