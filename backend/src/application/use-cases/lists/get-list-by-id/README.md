# Get List by ID

## Description
Retrieves a single list by its unique identifier.

## Input
- `listId` (string)

## Output
- `GetListByIdResponse`
  - `id` (string)
  - `userId` (string)
  - `name` (string)
  - `isPublic` (boolean)
  - `createdAt` (Date)

## Business Rules
- Throws `ListNotFoundException` if the list does not exist.

## Side Effects
- None (read-only operation).
