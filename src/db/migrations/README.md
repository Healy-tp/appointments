## To add a new migration

From root of the service, do `npm add-migration <my-migration-name>`. The migration name should have spaces as hyphens and will appear in the filename, so keep it descriptive, but concise.

## To run migrations

From root of the service, do `npm migrate`.

## Making a migration

- Think about what the migration will affect. If it is all rows, or a huge chunk of them, or something with complex conditions, or the migration will be slow, consider chunking the migration.
- Think about the logic needed. If you can manage to do the migration with sql only, it will be much faster. However, sometimes logic is easier to handle with javascript, so that might be needed.
- Think about both the populated and unpopulated cases. For example, the migration needs to work on existing databases, but also needs to work with a new database instance. This might require adding extra try/catches, or conditions to exclude logic if there are no rows to affect.