/**
 * BecomeLog API Handler
 * Main API Gateway Lambda function handler
 */

// Shared utilities will be copied during build
// const shared = require('./shared');

exports.handler = async (event) => {
  console.log('API Handler invoked:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, path, body } = event;

    // Parse request body if present
    const requestBody = body ? JSON.parse(body) : {};

    // Route handling
    switch (path) {
      case '/health':
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
          }),
        };

      case '/api/entries':
        if (httpMethod === 'GET') {
          // Get entries
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              entries: [],
              message: 'Entries retrieved successfully',
            }),
          };
        } else if (httpMethod === 'POST') {
          // Create entry
          return {
            statusCode: 201,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              id: Date.now().toString(),
              ...requestBody,
              createdAt: new Date().toISOString(),
            }),
          };
        }
        break;

      default:
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: 'Not Found',
            message: `Path ${path} not found`,
          }),
        };
    }
  } catch (error) {
    console.error('Error in API handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
};
