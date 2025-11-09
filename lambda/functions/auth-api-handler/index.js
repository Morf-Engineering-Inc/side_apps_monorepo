/**
 * BecomeLog Auth API Handler
 * Handles user authentication (sign-in, sign-up) with AWS Cognito
 */

const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  AdminConfirmSignUpCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;

// Initialize Cognito client (region is automatically detected from Lambda environment)
const cognitoClient = new CognitoIdentityProviderClient({});

/**
 * Create standard API response
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
 * Handle Sign Up
 */
async function handleSignUp(requestBody) {
  const { name, email, password } = requestBody;

  if (!email || !password) {
    return createResponse(400, {
      success: false,
      error: 'Email and password are required',
    });
  }

  try {
    const signUpParams = {
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: name || email,
        },
      ],
    };

    const command = new SignUpCommand(signUpParams);
    const result = await cognitoClient.send(command);

    // Auto-confirm user for development (remove in production)
    // In production, users should confirm via email
    if (process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'test') {
      try {
        const confirmCommand = new AdminConfirmSignUpCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
        });
        await cognitoClient.send(confirmCommand);
      } catch (confirmError) {
        console.warn('Auto-confirm failed:', confirmError);
      }
    }

    // After sign-up, automatically sign in the user
    return await handleSignIn({ email, password });

  } catch (error) {
    console.error('Sign up error:', error);
    
    let errorMessage = 'Failed to create account';
    if (error.name === 'UsernameExistsException') {
      errorMessage = 'An account with this email already exists';
    } else if (error.name === 'InvalidPasswordException') {
      errorMessage = 'Password does not meet requirements';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return createResponse(400, {
      success: false,
      error: errorMessage,
    });
  }
}

/**
 * Handle Sign In
 */
async function handleSignIn(requestBody) {
  const { email, password } = requestBody;

  if (!email || !password) {
    return createResponse(400, {
      success: false,
      error: 'Email and password are required',
    });
  }

  try {
    const authParams = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const command = new InitiateAuthCommand(authParams);
    const result = await cognitoClient.send(command);

    if (!result.AuthenticationResult) {
      throw new Error('Authentication failed');
    }

    return createResponse(200, {
      success: true,
      token: result.AuthenticationResult.IdToken,
      accessToken: result.AuthenticationResult.AccessToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      expiresIn: result.AuthenticationResult.ExpiresIn,
    });

  } catch (error) {
    console.error('Sign in error:', error);
    
    let errorMessage = 'Invalid credentials';
    if (error.name === 'NotAuthorizedException') {
      errorMessage = 'Invalid email or password';
    } else if (error.name === 'UserNotConfirmedException') {
      errorMessage = 'Please confirm your email address';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return createResponse(401, {
      success: false,
      error: errorMessage,
    });
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Auth API Handler invoked:', JSON.stringify(event, null, 2));

  try {
    let { httpMethod, path, body } = event;
    
    // Strip stage prefix from path
    const stageName = process.env.ENVIRONMENT || 'test';
    if (path.startsWith(`/${stageName}/`)) {
      path = path.substring(stageName.length + 1);
    }

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return createResponse(200, { message: 'OK' });
    }

    // Parse request body if present
    const requestBody = body ? JSON.parse(body) : {};

    // Route handling
    if (path === '/api/auth/signup' && httpMethod === 'POST') {
      return await handleSignUp(requestBody);
    }

    if (path === '/api/auth/signin' && httpMethod === 'POST') {
      return await handleSignIn(requestBody);
    }

    // No matching route
    return createResponse(404, {
      success: false,
      error: 'Not Found',
      message: `Path ${path} not found`,
    });

  } catch (error) {
    console.error('Error in Auth API handler:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
