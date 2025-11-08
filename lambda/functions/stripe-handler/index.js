/**
 * BecomeLog Stripe Handler
 * Handles Stripe checkout session creation and webhook events
 */

const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

// Stripe will be initialized with secret key from environment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Environment variables
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || process.env.ENTRIES_TABLE_NAME;
const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Initialize AWS SDK clients
const dynamoDbClient = new DynamoDBClient({ region: AWS_REGION });

// Initialize Cognito JWT Verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'id',
  clientId: CLIENT_ID,
});

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
 * Verify and decode Cognito JWT token
 */
async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const payload = await verifier.verify(token);
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload['cognito:username'] || payload.email,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Create Stripe Checkout Session
 */
async function createCheckoutSession(user, requestBody) {
  const { priceId, planType, successUrl, cancelUrl } = requestBody;

  if (!priceId || !planType) {
    return createResponse(400, {
      success: false,
      error: 'Missing required fields: priceId and planType',
    });
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: planType === 'lifetime' ? 'payment' : 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      client_reference_id: user.userId,
      metadata: {
        userId: user.userId,
        planType: planType,
        email: user.email,
      },
    });

    return createResponse(200, {
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return createResponse(500, {
      success: false,
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
}

/**
 * Get user subscription status
 */
async function getUserSubscription(userId) {
  try {
    const params = {
      TableName: USERS_TABLE_NAME,
      Key: marshall({
        userId: userId,
        entryId: 'SUBSCRIPTION_STATUS', // Special entry for subscription
      }),
    };

    const command = new GetItemCommand(params);
    const result = await dynamoDbClient.send(command);
    
    if (!result.Item) {
      // No subscription found, return free tier
      return createResponse(200, {
        success: true,
        subscriptionType: 'free',
        status: 'active',
      });
    }
    
    const subscription = unmarshall(result.Item);
    
    return createResponse(200, {
      success: true,
      subscriptionType: subscription.subscriptionType || 'free',
      status: subscription.status || 'active',
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return createResponse(500, {
      success: false,
      error: 'Failed to fetch subscription status',
    });
  }
}

/**
 * Update user subscription in DynamoDB
 */
async function updateUserSubscription(userId, subscriptionData) {
  const now = new Date().toISOString();
  
  try {
    const params = {
      TableName: USERS_TABLE_NAME,
      Key: marshall({
        userId: userId,
        entryId: 'SUBSCRIPTION_STATUS',
      }),
      UpdateExpression: 'SET subscriptionType = :type, #status = :status, stripeCustomerId = :customerId, stripeSubscriptionId = :subscriptionId, currentPeriodEnd = :periodEnd, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: marshall({
        ':type': subscriptionData.subscriptionType,
        ':status': subscriptionData.status || 'active',
        ':customerId': subscriptionData.stripeCustomerId || '',
        ':subscriptionId': subscriptionData.stripeSubscriptionId || '',
        ':periodEnd': subscriptionData.currentPeriodEnd || '',
        ':updatedAt': now,
      }),
    };

    const command = new UpdateItemCommand(params);
    await dynamoDbClient.send(command);
    
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
}

/**
 * Handle Stripe Webhooks
 */
async function handleWebhook(event) {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return createResponse(400, {
      success: false,
      error: 'Missing signature or webhook secret',
    });
  }

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return createResponse(400, {
      success: false,
      error: `Webhook Error: ${err.message}`,
    });
  }

  console.log('Stripe webhook event:', stripeEvent.type);

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      const session = stripeEvent.data.object;
      const userId = session.metadata.userId;
      const planType = session.metadata.planType;

      // Update user subscription in DynamoDB
      await updateUserSubscription(userId, {
        subscriptionType: planType,
        status: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd: session.subscription ? undefined : 'lifetime',
      });
      
      console.log(`Subscription activated for user ${userId}: ${planType}`);
      break;

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = stripeEvent.data.object;
      // Find user by customer ID and update subscription
      // This requires a GSI on stripeCustomerId, or you'll need to query
      console.log('Subscription updated:', subscription.id);
      break;

    case 'invoice.payment_succeeded':
      const invoice = stripeEvent.data.object;
      console.log('Payment succeeded:', invoice.id);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = stripeEvent.data.object;
      console.log('Payment failed:', failedInvoice.id);
      // Could send email notification or update subscription status
      break;

    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return createResponse(200, { received: true });
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Stripe Handler invoked:', JSON.stringify(event, null, 2));

  try {
    let { httpMethod, path, body, headers } = event;
    
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

    // Handle Stripe webhook
    if (path === '/api/stripe/webhook' && httpMethod === 'POST') {
      return await handleWebhook(event);
    }

    // All other endpoints require authentication
    let user;
    try {
      user = await verifyToken(headers.Authorization || headers.authorization);
    } catch (error) {
      return createResponse(401, {
        success: false,
        error: 'Unauthorized',
        message: error.message,
      });
    }

    // Route handling
    if (path === '/api/stripe/create-checkout' && httpMethod === 'POST') {
      return await createCheckoutSession(user, requestBody);
    }

    if (path === '/api/user/subscription' && httpMethod === 'GET') {
      return await getUserSubscription(user.userId);
    }

    // No matching route
    return createResponse(404, {
      success: false,
      error: 'Not Found',
      message: `Path ${path} not found`,
    });

  } catch (error) {
    console.error('Error in Stripe handler:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
