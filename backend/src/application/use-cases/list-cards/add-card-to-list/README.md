# Add Card to List

## Description
Adds a card with specified variants to a list. Creates a new `ListCard` entity and persists it.

## Input
- `listId` (string): The ID of the list to add the card to.
- `cardId` (string): The card identifier.
- `variants` (Record<string, number>): Map of variant names to quantities.

## Output
- `void`: No response value on success.

## Business Rules
- Generates a new UUID for the `ListCard` entity.
- Does not check for duplicates — the same card can be added multiple times.

## Side Effects
- Persists the `ListCard` entity via `IAddCardToListRepository`.
