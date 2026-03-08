/**
 * Currency utility for frontend
 * All prices in LKR (Sri Lankan Rupees)
 */

export const CURRENCY_SYMBOL = 'Rs.';
export const CURRENCY_CODE = 'LKR';

/**
 * Format amount as LKR currency
 * @param {number} amount - Amount in LKR
 * @returns {string} Formatted string e.g., "Rs. 1,500.00"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_SYMBOL} 0.00`;
  }
  
  const numAmount = parseFloat(amount);
  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${CURRENCY_SYMBOL} ${formatted}`;
};

/**
 * Format amount for free events
 * @param {number} amount - Amount in LKR
 * @returns {string} "Free" if zero, otherwise formatted currency
 */
export const formatPrice = (amount) => {
  return amount === 0 ? 'Free' : formatCurrency(amount);
};

/**
 * Get currency info
 * @returns {object} Currency information
 */
export const getCurrencyInfo = () => ({
  symbol: CURRENCY_SYMBOL,
  code: CURRENCY_CODE,
  name: 'Sri Lankan Rupee',
});
