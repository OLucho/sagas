# ResetPasswordUseCase

## What it does
Validates a 6-digit recovery code and, if correct, atomically updates the user's password and invalidates the token.

## Input contract (ResetPasswordRequest)
| Field | Type | Rules |
|-------|------|-------|
| email | string | Valid email format (`@IsEmail`) |
| code | string | Exactly 6 digits (`@Length(6, 6)`, `@Matches(/^\d{6}$/)`) |
| password | string | Min 6 characters (`@MinLength(6)`) |

## Output contract (ResetPasswordResponse)
| Field | Type |
|-------|------|
| success | boolean |

## Business rules and side effects
1. Fetches the user by email. If not found → throws `InvalidResetTokenException`.
2. Fetches the most recent `PasswordResetToken` for that user. If not found, already used, or expired → throws `InvalidResetTokenException`.
3. Compares the raw code against the stored HMAC-SHA256 hash using `ITokenHasher`. If it does not match → throws `InvalidResetTokenException`.
4. Hashes the new password with `bcrypt` via `IPasswordHasher`.
5. Atomically updates the user's `passwordHash` and marks the token as `used` in a single transaction via `IResetPasswordAtomicRepository`.
