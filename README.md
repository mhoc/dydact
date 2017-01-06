# DYDACT

The DynamoDB API is pretty powerful. 
But in being so powerful it tends to hide basic functionality behind a lot of boilerplate.

This library attempts to streamline access to some basic functionality. 
It definitely does not match all the functionality of the original DynamoDB API, nor will it try to.
But for many usages, I think it will be helpful.

# Setup

```js
npm i --save dydact

const aws = require('aws-sdk')
const DynamoDB = new aws.DynamoDB()
const d = require('dydact')(DynamoDB)
```

# Reading 

The most basic thing any app which uses DynamoDB can do. 

# Reading

`d.Get(table, optionalIndex, params, done)`

Retrieves documents. 
This will make smart calls to `getItem`, `batchGetItem`, `query`, or `scan` depending on which arguments are provided.

Arguments:

- `table` (`String`): the name of the table we are querying. this function only supports returning results from a single table.
- `optionalIndex` (`String`): see below
- `params` (`Object`): see below
- `done` (`function`): errback `function(err, results)`

Here are the various things you can provide as `params` and how they map to DynamoDB calls.

### Concepts

Pagination

- Dydact automatically combines results sets for you if your queries are too large.
- You cannot turn this functionality off.

Item Not Found

- No error is returned
- For calls which are expected to return a single item, `results` will be `undefined`.
- For calls which return multiple items, `results` will still be an array, but the array will not include the items which were not found.

Read Capacity Units

- All calls Dydact makes are eventually consistent.
- Strong consistency support can eventually be built into the API, but it isn't currently.

### Single Item, Partition Key, Primary Index

```js
Get('table', { id: "12345" }, done)
```

- Calls: `getItem`

### Single Item, Partition+Sort, Primary Index

```js
Get('table', { id: "12345", country: "USA" }, done)
```

- Calls: `getItem`

### Multiple Items, Partition Key, Primary Index

```js
Get('table', { id: [ "12345", "67890" ] }, done)
```

OR

```js
Get('table', [ { id: '12345' }, { id: '67890' } ], done)
```

- Calls: `batchGetItem`

### Multiple Items, Partition+Sort, Primary Index

```js
Get('table', [
  { id: "7", "country": "USA" },
  { id: "12", "country": "MEX" },
], done)
```

- Calls: `batchGetItem`

### Multiple Items, Partition Key, GSI

If you're unaware of how GSI's work: Unlike with a primary index, a GSI's partition key does not have to contain unique values. As such, it doesn't make sense to have a separate API for single items when talking about GSI's. Instead, all GSI-oriented APIs will return an array of multiple values, even if only one item matches.

```js
Get('table', 'my-index', { id: "89765" }, done)
```

OR

```js
Get('table', 'my-index', { id: [ "87567", "34299" ] }, done)
```

OR

```js
Get('table', 'my-index', [ { id: "87567" }, { id: "34299" } ], done)
```

- Calls: `query`

### Multiple Items, Partition+Sort, GSI

```js
Get('table', 'my-index', [ 
  { id: "76390", other: "key" },
  { id: "85432", other: "key" },
], done)
```

- Calls: `query`

# Reading (Unsafe)

Dydact provides some shortcuts for reading documents in ways that are... less than ideal. Generally speaking, all usages of this API should be considered a "shortcut", in that there are better ways to do what it accomplishes which might require you to deploy new indices or redesign your schemas.

### Entire Table

**Warning**: This API will consume half an RCU for every item in the table. And is slow. 

```js
GetUnsafe('table', done)
```

- Calls: `scan`

# Inserting

A slim wrapper around `putItem` is provided in `Put`

```js
Put('table', {
  id: "78652",
  country: "USA",
}, done)
```

The safer option is to use `Insert`, which will refuse to put an item (and return an error) if an item with the same id already exists. It does require passing in another parameters: the name of the primary partition key on the table.

```js
Insert('table', 'id', {
  id: '78652',
  country: 'USA',
}, done)
```

# Updating

Dydact's updating API wraps and simplifies `updateItem`. As such, only single items can be updated at a time. The API is inspired by MongoDB.

### Selectors

The second argument to the `Update` function is a selector. This is similar to `Get` semantics, in that its a map with either 1 (Primary Partition) key or 2 keys (Primary Partition+Sort key). DynamoDB cannot update items through a GSI.

### Basic Usage

```js
Update('table', { id: '12345' }, {
  $set: {
    'field': 12,
  }
}, done)
```

### Nested Documents

```js
Update('table', { id: '12345' }, {
  $set: {
    'field.thing': "hi!",
  }
}, done)
```

This is an area where Dydact starts having opinions. Dydact gives you no way to update a field with a period in the name. Instead, it treats every period as an object nest. Again: Mongo-like.

If you've ever tried to do deeply nested object updates in Dynamo, you should appreciate this API.

### List Appending

```js
Update('table', { id: '12345' }, {
  $push: {
    'field.mylist': 12
  },
})
```

`$push` is very Mongo-like. Not exactly, but similar. Its atomic, and essentially maps to:

```js
{
  ...
  UpdateExpression: 'set #list = list_append(#list, :newThing)'
  ...
}
```

### Arithmetic

Basic incrementing and decrementing of fields is supported atomically.

```js
Update('table', { id: '090909' }, {
  $inc: {
    'numeral': 2,
    'otherNumbera': -2,
  },
})
```

### Multiple Fields

Are obviously supported

```js
Update('table', { id: '989898' }, {
  'field1': 9,
  'field2.nested': [ a, b, c ],
  'field3': { $push: 9 }
})
```

### :warning: Non-Atomic Helpers :warning:

Some helpers are provided to extend DynamoDB's capabilities. These are **unsafe** because they are implemented via a `getItem` followed by an `updateItem`. This means less performance, _and_ if another update comes in in-between the read/update you've hit inconsistent state. 

But they are provided because I sometimes like using them for very low-traffic, personal projects. 

These also might implement an API that can step on element names in your DynamoDB table. In essence, there's a lot of reasons why this functionality is unsafe, but useful.

```js
UpdateUnsafe('table', { id: '67890' }, {
  
  // Left-Rotation (newest item at [$limit-1] )
  // Push to an array, but cap the array at a certain number of elements
  // [1,2,3,4,5] ==> 6 ==> [2,3,4,5,6]
  $leftRotate: { $limit: 5, 'field': 'my-value' },

  // Right-rotation (newest item at [0] )
  // [1,2,3,4,5] ==> 0 ==> [0,1,2,3,4]
  $rightRotate: { $limit: 5, 'otherField': },

})
```