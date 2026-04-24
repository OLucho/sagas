# Update List

## Description
Updates a list's name and/or visibility for the authenticated owner.

## Input
- `listId` (string)
- `name` (string, optional): New list name.
- `isPublic` (boolean, optional): New visibility flag.

## Output
- `UpdateListResponse`
  - `id` (string)
  - `userId` (string)
  - `name` (string)
  - `isPublic` (boolean)
  - `createdAt` (Date)

## Business Rules
- Throws `ListNotFoundException` if the list does not exist.
- Throws `ListAccessDeniedException` if the requesting user does not own the list.
- Throws `InvalidListNameException` if the new name is empty.

## Side Effects
- Persists the updated list via `IUpdateListRepository`.
