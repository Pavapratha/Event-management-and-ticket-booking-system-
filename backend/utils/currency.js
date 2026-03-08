/**
 * Currency Utility - All prices are in LKR (Sri Lankan Rupees)
 */

const CURRENCY_SYMBOL = 'Rs.';
const CURRENCY_CODE = 'LKR';

/**
 * Format a number as LKR currency
 * @param {number} amount - The amount in LKR
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, options = {}) => {
  const {
    symbol = true,
    code = false,
    decimals = 2,
    locale = 'en-US',
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return symbol ? `${CURRENCY_SYMBOL} 0.00` : '0.00';
  }

  const numAmount = parseFloat(amount);
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);

  if (code) {
    return `LKR ${formatted}`;
  }

  if (symbol) {
    return `${CURRENCY_SYMBOL} ${formatted}`;
  }

  return formatted;
};

/**
 * Format currency for display
 * @param {number} amount - Amount in LKR
 * @returns {string} Formatted string like "Rs. 1,500.00"
 */
const displayPrice = (amount) => {
  return formatCurrency(amount, { symbol: true, decimals: 2 });
};

/**
 * Format currency for reports
 * @param {number} amount - Amount in LKR
 * @returns {string} Formatted string like "LKR 1,500.00"
 */
const displayReportPrice = (amount) => {
  return formatCurrency(amount, { code: true, decimals: 2 });
};

/**
 * Convert amount to LKR (future use for multi-currency support)
 * @param {number} amount - Amount in original currency
 * @param {string} fromCurrency - Source currency code
 * @returns {number} Amount in LKR
 */
const convertToLKR = (amount, fromCurrency = 'USD') => {
  // Exchange rates (can be fetched from API in production)
  const exchangeRates = {
    'USD': 330, // 1 USD = 330 LKR (approximate)
    'EUR': 360,
    'GBP': 420,
    'LKR': 1,
  };

  const rate = exchangeRates[fromCurrency] || 1;
  return amount * rate;
};

/**
 * Get currency information object
 * @returns {object} Currency info
 */
const getCurrencyInfo = () => {
  return {
    symbol: CURRENCY_SYMBOL,
    code: CURRENCY_CODE,
    name: 'Sri Lankan Rupee',
  };
};

module.exports = {
  CURRENCY_SYMBOL,
  CURRENCY_CODE,
  formatCurrency,
  displayPrice,
  displayReportPrice,
  convertToLKR,
  getCurrencyInfo,
};
