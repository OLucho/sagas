# Get All Collections

## Description
Retrieves all collection cards belonging to a given user.

## Input
- `userId` (string): The ID of the user whose collections to retrieve.

## Output
- `GetAllCollectionsResponse[]`
  - `id` (string): Collection entry ID.
  - `cardId` (string): The card identifier.
  - `setId` (string): The set the card belongs to.
  - `variants` (Record<string, number>): Map of variant names to quantities.
  - `needed` (boolean): Whether the card is marked as needed.

## Business Rules
- Returns an empty array if the user has no collection cards.

## Side Effects
- Reads `CollectionCard` entities via `IFindAllCollectionsRepository`.
