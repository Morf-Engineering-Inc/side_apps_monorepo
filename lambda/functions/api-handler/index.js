/**
 * SelfApp API Handler
 * Main API Gateway Lambda function handler with DynamoDB and Cognito integration
 * Implements Single Table Design pattern for all entity types
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
 * Entity type constants for single table design
 * Format: entityType#timestamp#id
 */
const ENTITY_TYPES = {
  BECOME: 'BECOME',
  DAILY_LOG: 'DAILY_LOG',
  SUCCESS_DEF: 'SUCCESS_DEF',
  LETGOD: 'LETGOD',
  SELFREG: 'SELFREG',
};

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
 * Generate a unique entry ID for an entity type
 * Format: entityType#timestamp#randomId
 */
function generateEntryId(entityType) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  return `${entityType}#${timestamp}#${randomId}`;
}

/**
 * Parse entity ID to extract components
 */
function parseEntryId(entryId) {
  const parts = entryId.split('#');
  if (parts.length === 3) {
    return {
      entityType: parts[0],
      timestamp: parseInt(parts[1], 10),
      randomId: parts[2],
    };
  }
  // Fallback for legacy IDs
  return { entityType: 'BECOME', timestamp: Date.now(), randomId: entryId };
}

/**
 * Generic function to list entries by entity type
 */
async function listEntitiesByType(userId, entityType, queryParams = {}) {
  const limit = Math.min(parseInt(queryParams.limit) || 100, 500);
  
  try {
    const params = {
      TableName: ENTRIES_TABLE_NAME,
      KeyConditionExpression: 'userId = :userId AND begins_with(entryId, :entityType)',
      ExpressionAttributeValues: marshall({
        ':userId': userId,
        ':entityType': entityType,
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
      entityType,
    });
  } catch (error) {
    console.error(`Error fetching ${entityType} entries:`, error);
    throw error;
  }
}

/**
 * Generic function to create an entry of any type
 */
async function createEntity(userId, entityType, entityData) {
  const now = new Date().toISOString();
  const entryId = generateEntryId(entityType);
  
  const entry = {
    userId,
    entryId,
    entityType,
    createdAt: now,
    updatedAt: now,
    ...entityData,
  };

  try {
    const params = {
      TableName: ENTRIES_TABLE_NAME,
      Item: marshall(entry, { removeUndefinedValues: true }),
      ConditionExpression: 'attribute_not_exists(entryId)',
    };

    const command = new PutItemCommand(params);
    await dynamoDbClient.send(command);
    
    return createResponse(201, {
      success: true,
      entry,
      message: `${entityType} entry created successfully`,
    });
  } catch (error) {
    console.error(`Error creating ${entityType} entry:`, error);
    throw error;
  }
}

/**
 * Generic function to get a specific entry
 */
async function getEntity(userId, entryId) {
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
 * Generic function to update an entry
 */
async function updateEntity(userId, entryId, updateData) {
  const now = new Date().toISOString();
  
  // Remove fields that shouldn't be updated
  delete updateData.userId;
  delete updateData.entryId;
  delete updateData.createdAt;
  delete updateData.entityType;
  
  // Build update expression dynamically
  const updateFields = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {
    ':updatedAt': now,
  };

  Object.keys(updateData).forEach(field => {
    if (updateData[field] !== undefined) {
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
      ExpressionAttributeValues: marshall(expressionAttributeValues, { removeUndefinedValues: true }),
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
 * Generic function to delete an entry
 */
async function deleteEntity(userId, entryId) {
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
 * Handle POST /api/entries - Create new entry (backward compatibility for "Become" entries)
 */
async function createEntry(userId, entryData) {
  const now = new Date().toISOString();
  const entryId = generateEntryId(ENTITY_TYPES.BECOME);
  
  const entry = {
    userId,
    entryId,
    entityType: ENTITY_TYPES.BECOME,
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
      Item: marshall(entry, { removeUndefinedValues: true }),
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
    let { httpMethod, path, body, queryStringParameters, headers } = event;
    
    // Strip stage prefix from path (e.g., /test/api/... -> /api/...)
    // API Gateway includes the stage name in the path, but we want to handle paths without it
    const stageName = process.env.ENVIRONMENT || 'test';
    if (path.startsWith(`/${stageName}/`)) {
      path = path.substring(stageName.length + 1);
    }

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
    // Parse the path to determine entity type and action
    const pathParts = path.split('/').filter(Boolean);
    
    // New entity-based routes: /api/{entityType} and /api/{entityType}/{entryId}
    if (pathParts[0] === 'api' && pathParts.length >= 2) {
      const resourceType = pathParts[1].toUpperCase();
      const entityId = pathParts[2];
      
      // Map route names to entity types
      const entityTypeMap = {
        'ENTRIES': ENTITY_TYPES.BECOME, // Backward compatibility
        'BECOME': ENTITY_TYPES.BECOME,
        'DAILY': ENTITY_TYPES.DAILY_LOG,
        'DAILYLOG': ENTITY_TYPES.DAILY_LOG,
        'DAILY-LOG': ENTITY_TYPES.DAILY_LOG,
        'SUCCESS': ENTITY_TYPES.SUCCESS_DEF,
        'LETGOD': ENTITY_TYPES.LETGOD,
        'SELFREG': ENTITY_TYPES.SELFREG,
      };
      
      const entityType = entityTypeMap[resourceType];
      
      if (!entityType) {
        return createResponse(404, {
          success: false,
          error: 'Not Found',
          message: `Resource type ${pathParts[1]} not found`,
        });
      }
      
      if (!entityId) {
        // Collection routes: GET /api/{type} or POST /api/{type}
        if (httpMethod === 'GET') {
          return await listEntitiesByType(user.userId, entityType, queryStringParameters || {});
        } else if (httpMethod === 'POST') {
          // For backward compatibility with existing "entries" route
          if (resourceType === 'ENTRIES') {
            return await createEntry(user.userId, requestBody);
          }
          return await createEntity(user.userId, entityType, requestBody);
        } else {
          return createResponse(405, {
            success: false,
            error: 'Method Not Allowed',
          });
        }
      } else {
        // Item routes: GET/PUT/DELETE /api/{type}/{id}
        if (httpMethod === 'GET') {
          return await getEntity(user.userId, entityId);
        } else if (httpMethod === 'PUT') {
          return await updateEntity(user.userId, entityId, requestBody);
        } else if (httpMethod === 'DELETE') {
          return await deleteEntity(user.userId, entityId);
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
