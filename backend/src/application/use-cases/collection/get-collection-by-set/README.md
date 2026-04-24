# Get Collection by Set

## Description
Retrieves all collection cards owned by the authenticated user for a specific card set.

## Input
- `setId` (string): The identifier of the card set.

## Output
- `GetCollectionBySetResponse[]`: Array of collection card objects.
  - `id` (string)
  - `cardId` (string)
  - `setId` (string)
  - `variants` (Record<string, number>)
  - `needed` (boolean)

## Business Rules
- Returns an empty array if the user has no cards in the set.

## Side Effects
- None (read-only operation).
