/**
 * BecomeLog Auth Handler
 * Handles authentication and authorization for API requests
 */

// Shared utilities will be copied during build
// const shared = require('./shared');

exports.handler = async (event) => {
  console.log('Auth Handler invoked:', JSON.stringify(event, null, 2));

  try {
    const { type, authorizationToken, methodArn } = event;

    // For now, this is a simple authorizer that allows all requests
    // In production, you would verify JWT tokens or other credentials here
    
    if (!authorizationToken) {
      throw new Error('Unauthorized');
    }

    // Extract token from "Bearer <token>" format
    const token = authorizationToken.replace('Bearer ', '');

    // TODO: Verify token with Cognito or your auth provider
    // For now, we'll create a simple policy that allows all
    
    const principalId = 'user'; // This would come from your token validation
    
    // Generate IAM policy
    const policy = generatePolicy(principalId, 'Allow', methodArn);
    
    return policy;
  } catch (error) {
    console.error('Error in Auth handler:', error);
    throw new Error('Unauthorized');
  }
};

/**
 * Generate IAM policy document
 */
function generatePolicy(principalId, effect, resource) {
  const authResponse = {
    principalId,
  };

  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }

  // Optional: Add additional context
  authResponse.context = {
    stringKey: 'value',
    numberKey: 123,
    booleanKey: true,
  };

  return authResponse;
}
