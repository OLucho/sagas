# RequestPasswordResetUseCase

## What it does
Generates a 6-digit numeric code, stores its HMAC-SHA256 hash in the database with a 15-minute expiration, and sends it via email to the user.

## Input contract (RequestPasswordResetRequest)
| Field | Type | Rules |
|-------|------|-------|
| email | string | Valid email format (`@IsEmail`) |

## Output contract (RequestPasswordResetResponse)
| Field | Type |
|-------|------|
| success | boolean |

## Business rules and side effects
1. Looks up the user by email. If the user does not exist it still returns `success: true` to prevent email enumeration.
2. Generates a random 6-digit numeric code.
3. Hashes the code with HMAC-SHA256 via `ITokenHasher` (fast hash, appropriate for short-lived tokens — not bcrypt).
4. Saves a `PasswordResetToken` (with hashed code, userId, and 15-minute expiration).
5. Sends the plain code to the user's email via `IEmailService`. Email is sent before token persistence — if email fails, no token is saved.
6. If the user does not exist, no email is sent but the operation appears successful.
