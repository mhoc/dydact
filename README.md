# DYDACT

The DynamoDB API is pretty powerful. 
But in being so powerful it tends to hide basic functionality behind a lot of boilerplate.

This library attempts to streamline access to some basic functionality. 
It definitely does not match all the functionality of the original DynamoDB API, nor will it try to.
But for many usages, I think it will be helpful.

# Setup

```js
$ npm i --save dydact

const aws = require('aws-sdk')
const DynamoDB = new aws.DynamoDB()
const d = require('dydact')(DynamoDB)
```

# Documentation

See `/docs` for more information.