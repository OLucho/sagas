# Mark Card as Need

## Description
Toggles the "needed" flag for a card in the user's collection. Creates the card entry if it does not already exist.

## Input
- `setId` (string)
- `cardId` (string)

## Output
- `MarkCardAsNeedResponse`
  - `updated` (boolean): Always `true` on success.

## Business Rules
- Throws `InvalidCardIdException` if `cardId` is empty.
- Throws `InvalidSetIdException` if `setId` is empty.
- If the card does not exist, it is created with `needed: true`.
- If the card already exists, its `needed` flag is toggled.

## Side Effects
- Persists the `CollectionCard` entity via `ISaveCollectionCardRepository`.
- Uses `IFindCollectionCardRepository` to check for an existing card.
