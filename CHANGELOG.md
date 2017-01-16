# v0.0.4 (Unreleased)

- Updating documents

# v0.0.3 (Unreleased)

- `Get(5)` --> Paginated GSI query 
- `Insert(3)` --> Basic document insertion
- `Create(.)` --> Alias for `Insert`
- `Remove(3)` --> Basic delete item by primary key
- `Delete(.)` --> Alias for `Remove`

# v0.0.2

- Revert lots of the ES2015 syntax to... not ES2015, in order to support Node 0.12.

# v0.0.1

- Initial release :)
- `Get(3)` --> Basic get single item
- `Get(3)` --> Basic batch get items 
- `Get(4)` --> Basic GSI query 
- `Read(.)` --> Alias for `Get`
- `options.ConsumedCapacity` --> Configure returned consumed capacity information