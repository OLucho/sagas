# Sign Up

## Description
Creates a new user account with a hashed password.

## Input
- `email` (string): Must be a valid email format.
- `password` (string): Minimum 6 characters.
- `username` (string): Minimum 3 characters.

## Output
- `userId` (string)
- `username` (string)

## Business Rules
- Throws `UserAlreadyExistsException` if the email is already registered.
- Throws `InvalidEmailException` if the email format is invalid.
- Throws `InvalidUsernameException` if the username is shorter than 3 characters.

## Side Effects
- Persists a new `User` entity via `ICreateUserRepository`.
- Stores a bcrypt-hashed password; never stores the raw password.
