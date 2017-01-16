const async = require('async');
const _ = require('lodash');
const marshal = require('dynamodb-marshaler').marshal;
const marshalItem = require('dynamodb-marshaler').marshalItem;
const unmarshalItem = require('dynamodb-marshaler').unmarshalItem;

function Constructor(DynamoDB, Options) {
  // Resolve the options passed in
  if (!Options) Options = {};
  if (_.isString(Options.ConsumedCapacity)) {
    Options.ConsumedCapacity = Options.ConsumedCapacity;
  } else if (_.isBoolean(Options.ConsumedCapacity) && Options.ConsumedCapacity) {
    Options.ConsumedCapacity = "INDEXES";
  } else if (_.isBoolean(Options.ConsumedCapacity)) {
    Options.ConsumedCapacity = "NONE";
  }
  if (!_.isBoolean(Options.ResolvePages)) {
    Options.ResolvePages = true;
  }
  this.Options = Options;
  // Assign all the functions this library exports
  this.DynamoDB = DynamoDB;
  this.Get = Get.bind(this);
  this.Read = Get.bind(this);
  return this;
}

// ========================================================================
// READING
// ========================================================================

function Get(Arg1, Arg2, Arg3, Arg4) {
  if (_.isString(Arg1) && _.isArray(Arg2) && _.isFunction(Arg3)) {
    return BatchGetOnPrimaryIndex(Arg1, Arg2, Arg3);
  } else if (_.isString(Arg1) && _.isObject(Arg2) && _.isFunction(Arg3)) {
    return GetOnPrimaryIndex(Arg1, Arg2, Arg3);
  } else if (_.isString(Arg1) && _.isString(Arg2) && _.isArray(Arg3) && _.isFunction(Arg4)) {
    // Nothing is currently implemented on this branch 
  } else if (_.isString(Arg1) && _.isString(Arg2) && _.isObject(Arg3) && _.isFunction(Arg4)) {
    return Query(Arg1, Arg2, Arg3, Arg4);
  }
  throw 'That method of calling Dydact is not supported';
}

function BatchGetOnPrimaryIndex(TableName, KVArray, Done) {
  const RequestObject = { 
    RequestItems: null,
    ReturnConsumedCapacity: this.Options.ConsumedCapacity
  };
  RequestObject.RequestItems[TableName] = { Keys: _.map(KVArray, marshalItem) };
  this.DynamoDB.batchGetItem(RequestObject, function(err, awsResponse) {
    if (err) return Done(err);
    const allResults = _.map(awsResponse.Responses[TableName], unmarshalItem);
    if (!_.isEmpty(awsResponse.UnprocessedKeys)) {
      awsResponse.UnprocessedKeys = _.map(awsResponse.UnprocessedKeys[TableName], unmarshalItem);
    }
    return Done(null, allResults, _.pick(awsResponse, [ 'ConsumedCapacity', 'UnprocessedKeys' ]))
  });
}

function GetOnPrimaryIndex(TableName, KVObj, Done) {
  this.DynamoDB.getItem({
    TableName: TableName,
    Key: marshalItem(KVObj),
    ReturnConsumedCapacity: this.Options.ConsumedCapacity
  }, function(err, resp) {
    if (err) return Done(err);
    if (!resp.Item) return Done();
    return Done(null, unmarshalItem(resp.Item), _.pick(resp, [ 'ConsumedCapacity' ]));
  });
}

function Query(TableName, IndexName, KVObj, Done) {
  this.DynamoDB.query({
    TableName: TableName,
    IndexName: IndexName,
    KeyConditions: _.mapValues(KVObj, function(v, k) {
      return {
        ComparisonOperator: 'EQ',
        AttributeValueList: [ marshal(v) ]
      }
    }),
    ReturnConsumedCapacity: this.Options.ConsumedCapacity
  }, function(err, awsResponse) {
    if (err) return Done(err);
    const allResults = _.map(awsResponse.Items, unmarshalItem);
    const meta = _.pick(awsResponse, [ 'ConsumedCapacity', 'LastEvaluatedKey' ]);
    return Done(null, allResults, meta);
  })
}

// ========================================================================
// HELPERS
// ========================================================================

// ========================================================================
// EXPORT
// ========================================================================

module.exports = Constructor