/**
 * Shared utilities for BecomeLog Lambda functions
 */

/**
 * Create a standard API response
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

/**
 * Create a success response
 */
function successResponse(data, statusCode = 200) {
  return createResponse(statusCode, {
    success: true,
    data,
  });
}

/**
 * Create an error response
 */
function errorResponse(message, statusCode = 500, details = null) {
  return createResponse(statusCode, {
    success: false,
    error: {
      message,
      details,
    },
  });
}

/**
 * Validate required fields in an object
 */
function validateRequiredFields(obj, requiredFields) {
  const missingFields = requiredFields.filter(field => !obj[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Parse event body safely
 */
function parseEventBody(event) {
  if (!event.body) {
    return {};
  }
  
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  validateRequiredFields,
  parseEventBody,
};
