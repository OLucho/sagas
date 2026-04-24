# Get User Lists

## Description
Retrieves all lists owned by the authenticated user, ordered by creation date descending.

## Input
- `userId` (string): Injected from the JWT token subject.

## Output
- `GetUserListsResponse[]`: Array of list objects.
  - `id` (string)
  - `userId` (string)
  - `name` (string)
  - `isPublic` (boolean)
  - `createdAt` (Date)

## Business Rules
- Returns an empty array if the user has no lists.

## Side Effects
- None (read-only operation).
