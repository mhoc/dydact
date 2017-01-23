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
  SerializeDates: false,
})
```

- `ConsumedCapacity`: defaults to `false` (a.k.a `"NONE"`)

If this is `true`, Dydact will request AWS to return the `ConsumedCapacity` (level `"INDEXES"`) of each operation where it is available. 
You may also specify a string here: either `"INDEXES"`, `"TOTAL"`, or `"NONE"`.
This value will be returned in the `metadata` that each request sends back.

- `SerializeDates`: defaults to `true`

If this is `true`, Dydact will introspect any objects you pass it in Create and Update operations and convert any js Date objects it is given to ISO-8601 timestamps. 
Be aware, however: Dydact does not (currently) do the same thing when reading documents, which means a single Insert->Read op on the same document will not always return the same thing each time.

Currently, date serialization is only implemented on root-level dates. Any dates nested in inner arrays or objects will trigger an error.

If this option is set to `false` and a document with a date is inserted or updated, an error is thrown.

# Pagination Resolving

Dydact does not resolve pagination for you. This is primarily because DynamoDB has pretty high limits (100 keys or 16MB), so any app seriously butting up against that limit should probably be doing pagination itself. 

That being said, Dydact will help you. 

- `UnprocessedKeys` is provided in the `metadata` result of any batch operations. It is formatted such that you can pass it directly to another batch call to get more keys.