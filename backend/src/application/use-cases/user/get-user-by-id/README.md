# Get User by ID

## Description
Retrieves the public profile information for a user by their unique ID.

## Input
- `userId` (string): The user's unique identifier.

## Output
- `id` (string)
- `email` (string)
- `username` (string)
- `whatsapp` (string | undefined)
- `instagram` (string | undefined)
- `createdAt` (Date)

## Business Rules
- Throws `UserNotFoundException` if the user does not exist.
