# v.NEXT

- `Get(5)` --> Paginated GSI query 
- `Remove(3)` --> Basic delete item by primary key
- `Delete(.)` --> Alias for `Remove`
- `Insert(3)` --> Insert document, error on overwrite
- Updating documents

# v0.0.5

- Change aws-sdk peer dependency from `~2.0` to `2.*`

# v0.0.4

- Add 1-level iso-8601 date serialization as default behavior for Put operation

# v0.0.3

- `Put(3)` --> Insert document, overwrite on primary key

# v0.0.2

- Revert lots of the ES2015 syntax to... not ES2015, in order to support Node 0.12

# v0.0.1

- Initial release :)
- `Get(3)` --> Basic get single item
- `Get(3)` --> Basic batch get items 
- `Get(4)` --> Basic GSI query 
- `Read(.)` --> Alias for `Get`
- `options.ConsumedCapacity` --> Configure returned consumed capacity information
