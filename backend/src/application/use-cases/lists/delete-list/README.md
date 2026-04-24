# Delete List

## Description
Deletes a list if it is owned by the authenticated user.

## Input
- `listId` (string)

## Output
- `DeleteListResponse`
  - `deleted` (boolean): Always `true` on success.

## Business Rules
- Throws `ListNotFoundException` if the list does not exist.
- Throws `ListAccessDeniedException` if the requesting user does not own the list.

## Side Effects
- Removes the list row via `IDeleteListRepository`.
