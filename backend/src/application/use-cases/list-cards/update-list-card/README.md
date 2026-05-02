# Update List Card

## Description
Updates the variants of a card within a list. If the card does not yet exist in the list, it is created (upsert behavior).

## Input
- `listId` (string): The ID of the list the card belongs to.
- `cardId` (string): The card identifier.
- `variants` (Record<string, number>): Map of variant names to quantities.
- `userId` (string): The ID of the user performing the operation (used for authorization).

## Output
- `void`: No response value on success.

## Business Rules
- Throws `ListNotFoundException` if the list does not exist.
- Throws `ListAccessDeniedException` if the list does not belong to the requesting user.
- If the card already exists in the list, its variants are updated in place.
- If the card does not exist in the list, a new `ListCard` entity is created with a generated UUID.

## Side Effects
- Reads the `List` entity via `IFindListByIdRepository`.
- Reads and persists `ListCard` entities via `IUpdateListCardRepository`.
