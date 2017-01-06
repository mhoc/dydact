# READING

All read operations in dydact are contained within a single function: `Get()`. 
Different backend DynamoDB operations are used depending on the types of parameters you request. 

# Single Item

## Partition Key | Primary Index

_Retrieve a single item by partition key on a primary index. Backed by `DynamoDB.GetItem`._

```js
Get(Table String, KVMap Object[1], ErrBack Function[3])
Get('Users', { 'Id': '12345' }, (err, item, metadata) => {})
```

- `err`: Error from AWS piped through, should one occur.
- `item`: Unmarshaled DynamoDB response item, or `null` if the item does not exist.
- `metadata`: All the additional information DynamoDB gives you beside the item, in its original form.

## Partition+Sort Key | Primary Index

_Retrieves a single item by partition and sort key on a primary index. Backed by `DynamoDB.GetItem`._

```js
Get(Table String, KVMap Object[2], ErrBack Function[3])
Get('Config', { key: 'database_url', stage: 'production' }, (err, item, metadata) => {})
```

- `err`: Error from AWS piped through, should one occur.
- `item`: Unmarshaled DynamoDB response item, or `null` if the item requested does not exist.
- `metadata`: All the additional information DynamoDB gives you beside the item, in its original form.

# Batch Requests

## Partition Key | Primary Index

_Retrieve multiple items by partition key on the primary index of a single table. Backed by `DynamoDB.BatchGetItem`._

```js
Get(Table String, KVArray Array[Object[1]], ErrBack Function[3])
Get('Users', [
  { id: '12345' },
  { id: '54565' },
  { id: '98765' },
], (err, resp, metadata) => {})
```

- `err`: Error from AWS piped through, should one occur.
- `item`: Array of unmarshaled DynamoDB response items. An empty array is returned if no results are found.
- `metadata`: All the additional information DynamoDB gives you beside the item, in its original form.

## Partition+Sort Key | Primary Index 

_Retrieve multiple items by partition and sort key on the primary index of a single table. Backed by `DynamoDB.BatchGetItem`._

```js
Get(Table String, KVArray Array[Object[2]], ErrBack Function[3])
Get('Config', [
  { 'key': 'database_url', stage: 'production' },
  { 'key': 'redis_url', stage: 'production' },
], (err, resp, metadata) => {})
```

- `err`: Error from AWS piped through, should one occur.
- `item`: Array of unmarshaled DynamoDB response items. An empty array is returned if no results are found.
- `metadata`: All the additional information DynamoDB gives you beside the item, in its original form.

## Multiple Tables

_Dydact does not provide any wrapper for a call to `DynamoDB.BatchGetItem` which spans multiple tables._

# GSI

## Partition Key | GSI

_Retrieves multiple items by partition key on a configured GSI. Backed by `DynamoDB.Query`._

```js
Get(Table String, Index String, KVMap Object[1], ErrBack Function[3])
Get('Users', 'company-index', {
  companyId: '12345',
}, (err, results, metadata) => {})
```

## Partition+Sort Key | GSI

_Retrieves multiple items by partition and sort key on a configured GSI. Backed by `DynamoDB.Query`._

```js
Get(Table String, Index String, KVMap Object[2], ErrBack Function[3])
Get('Users', 'company-location-index', {
  companyId: '12345',
  location: 'New York',
}, (err, results, metadata) => {})
```