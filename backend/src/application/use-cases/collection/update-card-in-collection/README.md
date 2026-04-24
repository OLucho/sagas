# Update Card in Collection

## Description
Adds or updates a card's variant quantities in the user's collection. Creates the card entry if it does not already exist.

## Input
- `setId` (string)
- `cardId` (string)
- `variants` (Record<string, number>): Quantity per variant type.

## Output
- `UpdateCardInCollectionResponse`
  - `updated` (boolean): Always `true` on success.

## Business Rules
- Throws `InvalidCardIdException` if `cardId` is empty.
- Throws `InvalidSetIdException` if `setId` is empty.
- If the card does not exist, it is created with default values (`needed: false`, empty variants).
- Variants with a quantity of 0 or less are automatically removed.

## Side Effects
- Persists the `CollectionCard` entity via `ISaveCollectionCardRepository`.
- Uses `IFindCollectionCardRepository` to check for an existing card.
