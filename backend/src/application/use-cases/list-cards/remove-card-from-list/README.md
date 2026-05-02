# Remove Card from List

## Description
Removes a card from a list. Validates that the list exists and belongs to the requesting user before deletion.

## Input
- `listId` (string): The ID of the list to remove the card from.
- `cardId` (string): The card identifier to remove.
- `userId` (string): The ID of the user performing the operation (used for authorization).

## Output
- `void`: No response value on success.

## Business Rules
- Throws `ListNotFoundException` if the list does not exist.
- Throws `ListAccessDeniedException` if the list does not belong to the requesting user.

## Side Effects
- Reads the `List` entity via `IFindListByIdRepository`.
- Deletes the `ListCard` entry via `IRemoveCardFromListRepository`.
