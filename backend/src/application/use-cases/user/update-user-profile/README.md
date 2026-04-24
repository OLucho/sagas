# Update User Profile

## Description
Updates the authenticated user's profile fields (username, WhatsApp and Instagram).

## Input
- `username` (string, optional, min 3 characters)
- `whatsapp` (string, optional)
- `instagram` (string, optional)

## Output
- `id` (string)
- `email` (string)
- `username` (string)
- `whatsapp` (string | undefined)
- `instagram` (string | undefined)

## Business Rules
- Throws `UserNotFoundException` if the user does not exist.
- Throws `DomainException` if the provided username is shorter than 3 characters.
- Empty strings for WhatsApp or Instagram are treated as `undefined` (field is cleared).
