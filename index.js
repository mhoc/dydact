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
  return this;
}

// ========================================================================
// READING
// ========================================================================

function Get(Arg1, Arg2, Arg3) {
  if (_.isString(Arg1) && _.isArray(Arg2) && _.isFunction(Arg3)) {
    return BatchGetOnPrimaryIndex(Arg1, Arg2, Arg3);
  } else if (_.isString(Arg1) && _.isObject(Arg2) && _.isFunction(Arg3)) {
    return GetOnPrimaryIndex(Arg1, Arg2, Arg3);
  }
}

function BatchGetOnPrimaryIndex(TableName, KVArray, Done) {
  const chunked = this.Options.ResolvePages
    ? _.chunk(KVArray, 100)
    : KVArray;
  async.map(chunked, function(chunk, chunkDone) {
    this.DynamoDB.batchGetItem({
      RequestItems: {
        [TableName]: { Keys: chunk.map(marshalItem) },
      },
      ReturnConsumedCapacity: this.Options.ConsumedCapacity,
    }, function(err, awsResponse) {
      if (err) return chunkDone(err);
      return chunkDone(null, {
        results: awsResponse.Responses[TableName].map(unmarshalItem),
        metadata: _.pick(awsResponse, [ 'ConsumedCapacity' ]),
      });
    });
  }, function(err, results) {
    if (err) return Done(err);
    // Combine the many results sets we might have gotten back.
    const allResults = _(results).map(function(r) { return r.results }).flatten().value();
    // Combine the metadata 
    const metadata = {
      ConsumedCapacity: _.reduce(results, function(accum, r) {
        accum.CapacityUnits += r.metadata.ConsumedCapacity[0].CapacityUnits;
        accum.Table.CapacityUnits += r.metadata.ConsumedCapacity[0].CapacityUnits;
        return accum;
      }, {
        TableName: TableName,
        CapacityUnits: 0,
        Table: { CapacityUnits: 0 },
      }),
    };
    // Add in the number of calls this call took.
    metadata.DydactResolvedPages = { Count: chunked.length };
    return Done(null, allResults, metadata);
  });
}

function GetOnPrimaryIndex(TableName, KVObj, Done) {
  this.DynamoDB.getItem({
    TableName: TableName,
    Key: marshalItem(KVObj),
    ReturnConsumedCapacity: this.Options.ConsumedCapacity,
  }, function(err, resp) {
    if (err) return Done(err);
    if (!resp.Item) return Done();
    return Done(null, unmarshalItem(resp.Item), _.pick(resp, [ 'ConsumedCapacity' ]));
  });
}

// ========================================================================
// HELPERS
// ========================================================================



// ========================================================================
// EXPORT
// ========================================================================

module.exports = Constructor