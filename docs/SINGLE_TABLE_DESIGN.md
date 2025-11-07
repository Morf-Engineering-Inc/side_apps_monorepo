# Single Table Design Pattern for SelfApp DynamoDB

## Overview

The SelfApp uses a **single table design pattern** for DynamoDB to store all entity types in one table. This approach optimizes for cost, performance, and simplicity while supporting diverse entity types.

## Table Structure

### Primary Keys
- **Partition Key (PK)**: `userId` (String)
  - Groups all data for a single user together
  - Enables efficient user-scoped queries
  
- **Sort Key (SK)**: `entryId` (String)
  - Format: `{ENTITY_TYPE}#{timestamp}#{randomId}`
  - Example: `DAILY_LOG#1699564800000#a7b3c9d`
  - Enables querying by entity type and sorting by timestamp

### Global Secondary Index (GSI)
- **Index Name**: `UserDateIndex`
- **Hash Key**: `userId`
- **Range Key**: `createdAt` (ISO 8601 timestamp string)
- **Purpose**: Query entries by user and date range

## Entity Types

The following entity types are supported:

| Entity Type | Description | Route Path |
|------------|-------------|------------|
| `BECOME` | Spiritual growth tracking entries | `/api/become` |
| `DAILY_LOG` | Daily performance logs | `/api/daily-log` |
| `SUCCESS_DEF` | Success definition (singleton per user) | `/api/success` |
| `LETGOD` | "Let God Prevail" spiritual entries | `/api/letgod` |
| `SELFREG` | Self-regulation moment tracking | `/api/selfreg` |

## Data Access Patterns

### 1. Create Entity
```javascript
POST /api/{entityType}
Body: { field1: value1, field2: value2, ... }

// DynamoDB Operation
PutItem {
  userId: "user-123",
  entryId: "ENTITY_TYPE#1699564800000#a7b3c9d",
  entityType: "ENTITY_TYPE",
  createdAt: "2024-11-09T12:00:00.000Z",
  updatedAt: "2024-11-09T12:00:00.000Z",
  ...otherFields
}
```

### 2. List Entities by Type
```javascript
GET /api/{entityType}?limit=100

// DynamoDB Operation
Query {
  KeyConditionExpression: "userId = :userId AND begins_with(entryId, :entityType)",
  ScanIndexForward: false  // Most recent first
}
```

### 3. Get Single Entity
```javascript
GET /api/{entityType}/{entryId}

// DynamoDB Operation
GetItem {
  Key: {
    userId: "user-123",
    entryId: "ENTITY_TYPE#1699564800000#a7b3c9d"
  }
}
```

### 4. Update Entity
```javascript
PUT /api/{entityType}/{entryId}
Body: { field1: newValue1, ... }

// DynamoDB Operation
UpdateItem {
  Key: { userId, entryId },
  UpdateExpression: "SET #field1 = :value1, updatedAt = :now",
  ConditionExpression: "attribute_exists(entryId)"
}
```

### 5. Delete Entity
```javascript
DELETE /api/{entityType}/{entryId}

// DynamoDB Operation
DeleteItem {
  Key: { userId, entryId },
  ConditionExpression: "attribute_exists(entryId)"
}
```

## Benefits of Single Table Design

### Cost Efficiency
- Single table = 1 set of read/write capacity units
- Reduced AWS costs compared to multiple tables
- Fewer provisioned throughput configurations

### Performance
- All user data co-located by partition key
- Efficient queries within user's data
- No cross-table joins needed

### Scalability
- DynamoDB automatically distributes data
- Easy to add new entity types without schema changes
- Partition key ensures even distribution

### Simplicity
- One table to manage and monitor
- Consistent access patterns across entity types
- Easier backup and restore procedures

## Implementation Details

### Lambda Handler (api-handler/index.js)

The Lambda function implements generic CRUD operations:

```javascript
// Entity type constants
const ENTITY_TYPES = {
  BECOME: 'BECOME',
  DAILY_LOG: 'DAILY_LOG',
  SUCCESS_DEF: 'SUCCESS_DEF',
  LETGOD: 'LETGOD',
  SELFREG: 'SELFREG',
};

// Generate unique entry ID
function generateEntryId(entityType) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  return `${entityType}#${timestamp}#${randomId}`;
}
```

### Frontend API Client (api-client-entities.ts)

TypeScript client with type-safe interfaces:

```typescript
// Generic functions
export async function listEntities<T>(entityType: string, limit = 100): Promise<T[]>
export async function getEntity<T>(entityType: string, entryId: string): Promise<T>
export async function createEntity<T>(entityType: string, entity: Omit<T, 'userId' | 'entryId' | 'createdAt' | 'updatedAt'>): Promise<T>
export async function updateEntity<T>(entityType: string, entryId: string, updates: Partial<T>): Promise<T>
export async function deleteEntity(entityType: string, entryId: string): Promise<void>

// Convenience functions for each entity type
export const listDailyLogs = () => listEntities<DailyLogEntry>("daily-log");
export const createDailyLog = (entry) => createEntity<DailyLogEntry>("daily-log", entry);
// ... etc for each entity type
```

## Migration from Previous Storage

All routes have been migrated from their previous storage mechanisms:

| Route | Before | After |
|-------|--------|-------|
| Daily Log | Dexie (IndexedDB) | DynamoDB API |
| Dashboard | Dexie (IndexedDB) | DynamoDB API |
| Insights | Dexie (IndexedDB) | DynamoDB API |
| Self-Reg | localStorage | DynamoDB API |
| Let God Prevail | localStorage | DynamoDB API |
| Define Success | localStorage | DynamoDB API |
| Become | API (old format) | DynamoDB API (backward compatible) |

## Best Practices

### 1. Always Include entityType
Every item should have an `entityType` attribute for easier debugging and analytics.

### 2. Use Consistent Timestamps
- `createdAt`: ISO 8601 timestamp (set once)
- `updatedAt`: ISO 8601 timestamp (updated on every change)

### 3. Handle Conditional Operations
Use condition expressions to prevent:
- Creating duplicate entries
- Updating non-existent items
- Deleting items that don't exist

### 4. Implement Proper Error Handling
```javascript
try {
  await createEntity(entityType, data);
} catch (error) {
  if (error.name === 'ConditionalCheckFailedException') {
    // Handle duplicate entry
  } else {
    // Handle other errors
  }
}
```

### 5. Filter Undefined Values
Use `removeUndefinedValues: true` in marshall options to avoid DynamoDB errors:

```javascript
const params = {
  TableName: ENTRIES_TABLE_NAME,
  Item: marshall(entry, { removeUndefinedValues: true }),
};
```

## Monitoring and Debugging

### CloudWatch Metrics
Monitor these key metrics:
- `UserErrors`: Client-side errors (400s)
- `SystemErrors`: Server-side errors (500s)
- `ConsumedReadCapacityUnits`: Read throughput
- `ConsumedWriteCapacityUnits`: Write throughput

### Logging Best Practices
```javascript
console.log('API Handler invoked:', JSON.stringify(event, null, 2));
console.error('Error in API handler:', error);
```

### DynamoDB PartiQL (for debugging)
```sql
-- List all entities for a user
SELECT * FROM selfapp-entries WHERE userId = 'user-123';

-- List all daily logs for a user
SELECT * FROM selfapp-entries WHERE userId = 'user-123' AND begins_with(entryId, 'DAILY_LOG');
```

## Future Enhancements

Potential improvements to consider:

1. **TTL for Temporary Data**: Add TTL attribute for automatic data expiration
2. **Compound GSIs**: Additional indexes for complex query patterns
3. **Streams**: Enable DynamoDB Streams for analytics and backup
4. **Point-in-Time Recovery**: Already enabled for disaster recovery
5. **Encryption**: Server-side encryption is already enabled

## Security Considerations

- ✅ All API endpoints require Cognito JWT authentication
- ✅ Row-level security enforced by userId in queries
- ✅ Condition expressions prevent unauthorized modifications
- ✅ CORS configured for specific origins
- ✅ Server-side encryption at rest enabled
- ✅ Point-in-time recovery enabled for data protection

## Conclusion

The single table design pattern provides an efficient, scalable, and cost-effective solution for the SelfApp's data storage needs. By co-locating all user data and using intelligent sort keys, we achieve optimal performance while maintaining flexibility for future growth.
