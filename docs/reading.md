# READING

All read operations in dydact are contained within a single function: `Get()`. 
Different backend DynamoDB operations are used depending on the types of parameters you request. 

# Single Item

## Partition Key | Primary Index

_Retrieve a single item by partition key on a primary index. Backed by `DynamoDB.GetItem`._

```js
Get(String, Object[1], Function[3])

Get('Users', { 'Id': '12345' }, (err, item, metadata) => {})
```

- `err`: Error from AWS piped through, should one occur.
- `item`: Unmarshaled DynamoDB response item, or `null` if the item does not exist.
- `metadata`: All the additional information DynamoDB gives you beside the item, in its original form.

## Partition+Sort Key | Primary Index

_Retrieves a single item by partition and sort key on a primary index. Backed by `DynamoDB.GetItem`._

```js
Get(String, Object[2], Function[3])

Get('Config', { key: 'database_url', stage: 'production' }, (err, item, metadata) => {})
```

- `err`: Error from AWS piped through, should one occur.
- `item`: Unmarshaled DynamoDB response item, or `null` if the item requested does not exist.
- `metadata`: All the additional information DynamoDB gives you beside the item, in its original form.