/**
 * BecomeLog API Handler
 * Main API Gateway Lambda function handler with DynamoDB and Cognito integration
 */

const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

// Environment variables
const ENTRIES_TABLE_NAME = process.env.ENTRIES_TABLE_NAME;
const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Initialize AWS SDK clients
const dynamoDbClient = new DynamoDBClient({ region: AWS_REGION });

// Initialize Cognito JWT Verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'id',
  clientId: CLIENT_ID, // Restrict to specific client for security
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
 * Generate a unique entry ID
 */
function generateEntryId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handle GET /api/entries - List user's entries
 */
async function getEntries(userId, queryParams = {}) {
  const limit = Math.min(parseInt(queryParams.limit) || 50, 100);
  
  try {
    const params = {
      TableName: ENTRIES_TABLE_NAME,
      IndexName: 'UserDateIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: marshall({
        ':userId': userId,
      }),
      ScanIndexForward: false, // Most recent first
      Limit: limit,
    };

    const command = new QueryCommand(params);
    const result = await dynamoDbClient.send(command);
    
    const entries = result.Items ? result.Items.map(item => unmarshall(item)) : [];
    
    return createResponse(200, {
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }
}

/**
 * Handle POST /api/entries - Create new entry
 */
async function createEntry(userId, entryData) {
  const now = new Date().toISOString();
  const entryId = generateEntryId();
  
  const entry = {
    userId,
    entryId,
    createdAt: now,
    updatedAt: now,
    date: entryData.date || now.split('T')[0],
    action: entryData.action || '',
    motive: entryData.motive || '',
    conscienceCheck: entryData.conscienceCheck || false,
    hearingHisVoice: entryData.hearingHisVoice || false,
    losingEvilDesires: entryData.losingEvilDesires || false,
    servingOthers: entryData.servingOthers || false,
    serviceBlessedOthers: entryData.serviceBlessedOthers || false,
    reflection: entryData.reflection || '',
  };

  try {
    const params = {
      TableName: ENTRIES_TABLE_NAME,
      Item: marshall(entry),
      ConditionExpression: 'attribute_not_exists(entryId)',
    };

    const command = new PutItemCommand(params);
    await dynamoDbClient.send(command);
    
    return createResponse(201, {
      success: true,
      entry,
      message: 'Entry created successfully',
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    throw error;
  }
}

/**
 * Handle GET /api/entries/{entryId} - Get specific entry
 */
async function getEntry(userId, entryId) {
  try {
    const params = {
      TableName: ENTRIES_TABLE_NAME,
      Key: marshall({
        userId,
        entryId,
      }),
    };

    const command = new GetItemCommand(params);
    const result = await dynamoDbClient.send(command);
    
    if (!result.Item) {
      return createResponse(404, {
        success: false,
        error: 'Entry not found',
      });
    }
    
    const entry = unmarshall(result.Item);
    
    return createResponse(200, {
      success: true,
      entry,
    });
  } catch (error) {
    console.error('Error fetching entry:', error);
    throw error;
  }
}

/**
 * Handle PUT /api/entries/{entryId} - Update entry
 */
async function updateEntry(userId, entryId, updateData) {
  const now = new Date().toISOString();
  
  // Build update expression dynamically
  const updateFields = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {
    ':updatedAt': now,
  };

  // Fields that can be updated
  const allowedFields = [
    'date', 'action', 'motive', 'conscienceCheck', 'hearingHisVoice',
    'losingEvilDesires', 'servingOthers', 'serviceBlessedOthers', 'reflection'
  ];

  allowedFields.forEach(field => {
    if (updateData.hasOwnProperty(field)) {
      const placeholder = `:${field}`;
      updateFields.push(`#${field} = ${placeholder}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[placeholder] = updateData[field];
    }
  });

  if (updateFields.length === 0) {
    return createResponse(400, {
      success: false,
      error: 'No valid fields to update',
    });
  }

  updateFields.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';

  try {
    const params = {
      TableName: ENTRIES_TABLE_NAME,
      Key: marshall({
        userId,
        entryId,
      }),
      UpdateExpression: `SET ${updateFields.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ConditionExpression: 'attribute_exists(entryId)',
      ReturnValues: 'ALL_NEW',
    };

    const command = new UpdateItemCommand(params);
    const result = await dynamoDbClient.send(command);
    
    const entry = unmarshall(result.Attributes);
    
    return createResponse(200, {
      success: true,
      entry,
      message: 'Entry updated successfully',
    });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(404, {
        success: false,
        error: 'Entry not found',
      });
    }
    console.error('Error updating entry:', error);
    throw error;
  }
}

/**
 * Handle DELETE /api/entries/{entryId} - Delete entry
 */
async function deleteEntry(userId, entryId) {
  try {
    const params = {
      TableName: ENTRIES_TABLE_NAME,
      Key: marshall({
        userId,
        entryId,
      }),
      ConditionExpression: 'attribute_exists(entryId)',
    };

    const command = new DeleteItemCommand(params);
    await dynamoDbClient.send(command);
    
    return createResponse(200, {
      success: true,
      message: 'Entry deleted successfully',
    });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(404, {
        success: false,
        error: 'Entry not found',
      });
    }
    console.error('Error deleting entry:', error);
    throw error;
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('API Handler invoked:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, path, body, queryStringParameters, headers } = event;

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return createResponse(200, { message: 'OK' });
    }

    // Health check endpoint (no auth required)
    if (path === '/health') {
      return createResponse(200, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.ENVIRONMENT,
      });
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

    // Parse request body if present
    const requestBody = body ? JSON.parse(body) : {};

    // Route handling
    // Match paths like /api/entries and /api/entries/{entryId}
    const pathParts = path.split('/').filter(Boolean);
    
    if (pathParts[0] === 'api' && pathParts[1] === 'entries') {
      const entryId = pathParts[2];
      
      if (!entryId) {
        // /api/entries routes
        if (httpMethod === 'GET') {
          return await getEntries(user.userId, queryStringParameters || {});
        } else if (httpMethod === 'POST') {
          return await createEntry(user.userId, requestBody);
        } else {
          return createResponse(405, {
            success: false,
            error: 'Method Not Allowed',
          });
        }
      } else {
        // /api/entries/{entryId} routes
        if (httpMethod === 'GET') {
          return await getEntry(user.userId, entryId);
        } else if (httpMethod === 'PUT') {
          return await updateEntry(user.userId, entryId, requestBody);
        } else if (httpMethod === 'DELETE') {
          return await deleteEntry(user.userId, entryId);
        } else {
          return createResponse(405, {
            success: false,
            error: 'Method Not Allowed',
          });
        }
      }
    }

    // No matching route
    return createResponse(404, {
      success: false,
      error: 'Not Found',
      message: `Path ${path} not found`,
    });

  } catch (error) {
    console.error('Error in API handler:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
