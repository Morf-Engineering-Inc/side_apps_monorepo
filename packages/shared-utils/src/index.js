/**
 * Format a date to ISO string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date = new Date()) {
  return date.toISOString();
}

/**
 * Generate a simple unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  formatDate,
  generateId,
  sleep,
  deepClone,
};
