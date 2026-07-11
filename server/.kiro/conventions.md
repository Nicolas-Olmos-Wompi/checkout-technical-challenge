# Project Conventions — AI Notes

## Testing

- **Do NOT create tests for TypeORM migrations** (`src/common/migrations/`). Migrations are declarative SQL and verified by running them against the database. Unit-testing them adds no value and clutters the test suite. Jest is configured to ignore that path via `testPathIgnorePatterns`.

## Documentation

- **Do NOT update `README.md` as part of feature implementation.** The README is maintained separately by the developer. Do not add, modify, or remove sections in it when implementing features, fixing bugs, or completing tasks.

## Adapter Naming

- **Out-adapter classes that wrap external systems must use the `Adapter` suffix** in the class name. This distinguishes infrastructure adapters from domain interfaces and makes it clear the class is a concrete implementation bound to an external dependency.
  - ✅ `WompiPaymentGatewayAdapter` (wraps Wompi API)
  - ✅ `BcryptPasswordHasherAdapter` (wraps bcrypt)
  - ✅ `JwtTokenGeneratorAdapter` (wraps @nestjs/jwt / jsonwebtoken)
  - ❌ `WompiPaymentGateway` (looks like a domain interface, not an adapter)
  - ❌ `BcryptPasswordHasher` (missing adapter suffix)
- **Filenames must include `.adapter` to mirror the class suffix.** This keeps class name and filename aligned.
  - ✅ `wompi-payment-gateway.adapter.ts` → `WompiPaymentGatewayAdapter`
  - ✅ `bcrypt-password-hasher.adapter.ts` → `BcryptPasswordHasherAdapter`
  - ✅ `jwt-token-generator.adapter.ts` → `JwtTokenGeneratorAdapter`
  - ❌ `wompi-payment-gateway.ts` (filename doesn't reflect the Adapter class)
- **Repositories are NOT adapters** — they handle data manipulation and keep the `Repository` name without the `Adapter` suffix (e.g., `UserRepository` in `user.repository.ts`).
- Directory names remain descriptive of the capability (`auth/`, `security/`, `wompi/`, `postgres/`).