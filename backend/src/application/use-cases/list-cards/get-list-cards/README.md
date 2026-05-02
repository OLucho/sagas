# Get List Cards

## Description
Retrieves all cards belonging to a specific list.

## Input
- `listId` (string): The ID of the list whose cards to retrieve.

## Output
- `GetListCardsResponse[]`
  - `id` (string): The list-card entry ID.
  - `listId` (string): The parent list ID.
  - `cardId` (string): The card identifier.
  - `variants` (Record<string, number>): Map of variant names to quantities.
  - `addedAt` (string): ISO 8601 timestamp of when the card was added.

## Business Rules
- Returns an empty array if the list has no cards.

## Side Effects
- Reads `ListCard` entities via `IGetListCardsRepository`.
