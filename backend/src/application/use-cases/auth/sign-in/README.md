# Sign In

## Description
Authenticates a user and returns a signed JWT token.

## Input
- `email` (string): Must be a valid email format.
- `password` (string)

## Output
- `token` (string): Signed JWT containing the user ID.
- `userId` (string)
- `username` (string)

## Business Rules
- Throws `InvalidCredentialsException` if the email does not exist or the password does not match.
- Verifies the raw password against the stored bcrypt hash via `IPasswordHasher`.

## Side Effects
- None (read-only operation).
