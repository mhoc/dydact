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
  ResolvePages: false,
})
```

- `ConsumedCapacity`: defaults to `false` (a.k.a `"NONE"`)

If this is `true`, Dydact will request AWS to return the `ConsumedCapacity` (level `"INDEXES"`) of each operation where it is available. 
You may also specify a string here: either `"INDEXES"`, `"TOTAL"`, or `"NONE"`.
This value will be returned in the `metadata` that each request sends back.

- `ResolvePages`: defaults to `true`

If this is `true`, Dydact will resolve pagination for you by making multiple calls to DynamoDB, automatically assembling the complete response array. 
This has an obvious performance impact, but is usually more helpful than it isn't.