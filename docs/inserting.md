# INSERTING

Insert operations are done with the `Insert()` function.

# Single Item, No Overwrite

_Insert a single item into a DynamoDB table._

```js
Insert(Table String, Item Object, ErrBack Function[2])
Insert('Users', {
  id: '12345',
  name: 'Mike',
}, (err, meta) => {})
```

- `err`: Error from AWS piped through, should one occur.
- `meta`: Additional metadata AWS returns about the insert.

You may also use the `Create()` alias.

# Single Item, Overwrite

_Insert a single item into a DynamoDB table, overwriting an existing item by primary key if it exists._

```js
Put(Table String, Item Object, ErrBack Function[2])
Put('Users', {
  id: '12345',
  name: 'Mike',
}, (err, meta) => {})
```

- `err`: Error from AWS piped through, should one occur.
- `meta`: Additional metadata AWS returns about the put.