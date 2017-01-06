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

function Get(TableName, KVLookup, Done) {
  this.DynamoDB.getItem({
    TableName,
    Key: marshalItem(KVLookup),
    ReturnConsumedCapacity: this.Options.ConsumedCapacity,
  }, function(err, resp) {
    if (err) return Done(err);
    if (!resp.Item) return Done();
    return Done(null, unmarshalItem(resp.Item), _.pick(resp, [ 'ConsumedCapacity' ]));
  });
}

// ========================================================================
// EXPORT
// ========================================================================

module.exports = Constructor