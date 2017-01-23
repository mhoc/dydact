# SETUP

You must inject a recent version of DynamoDB into Dydact in order for it to function.
This also means that you need to take care of authenticating with AWS; usually this is provided by the environment.

```js
const aws = require('aws-sdk')
const DynamoDB = new aws.DynamoDB()
const Dy = require('dydact')(DynamoDB)
```

# Optional Configuration

You may also optionally specify some configuration parameters on setup. 

```js
const Dy = require('dydact')(DynamoDB, {
  ConsumedCapacity: true,
})
```

- `ConsumedCapacity`: defaults to `false` (a.k.a `"NONE"`)

If this is `true`, Dydact will request AWS to return the `ConsumedCapacity` (level `"INDEXES"`) of each operation where it is available. 
You may also specify a string here: either `"INDEXES"`, `"TOTAL"`, or `"NONE"`.
This value will be returned in the `metadata` that each request sends back.

# Pagination Resolving

Dydact does not resolve pagination for you. This is primarily because DynamoDB has pretty high limits (100 keys or 16MB), so any app seriously butting up against that limit should probably be doing pagination itself. 

That being said, Dydact will help you. 

- `UnprocessedKeys` is provided in the `metadata` result of any batch operations. It is formatted such that you can pass it directly to another batch call to get more keys.