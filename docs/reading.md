# READING

All read operations in dydact are contained within a single function: `Get()`. 
Different backend DynamoDB operations are used depending on the types of parameters you request. 

# GetItem

_Retrieve a single item by primary key on a partition index. Backed By `DynamoDB.GetItem`_

```js
Get(String, Object[1], Function[3])

Get('Users', { 'Id': '12345' }, (err, item, metadata) => {})
```

- `err`: Error from AWS piped through should one occur.
- `item`: Unmarshaled DynamoDB response item.
- `metadata`: All the additional information DynamoDB gives you besides the item.

