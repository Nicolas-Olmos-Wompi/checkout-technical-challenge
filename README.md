# Checkout Store

Full-stack checkout application built with **React Native (Expo)** and **NestJS**, integrating with a payment gateway.

---

## 📱 Download APK

You can download the latest Android APK from the [GitHub Releases](https://github.com/Nicolas-Olmos-Wompi/checkout-technical-challenge/releases) page.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Server Setup](#server-setup)
  - [App Setup](#app-setup)
- [Running Tests](#running-tests)
- [Test Results & Coverage](#test-results--coverage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Infrastructure](#infrastructure)

---

## Architecture Overview

### Server (Backend)

The server follows a **Hexagonal Architecture** (Ports & Adapters) pattern:

```
domain/src/
├── interface/       ← Ports (repository & gateway contracts)
├── model/           ← Domain entities, value objects, errors
└── usecase/         ← Application use cases (pure business logic)

server/src/
├── adapter/
│   ├── in/http/     ← Driving adapters (REST controllers)
│   └── out/
│       ├── postgres/  ← Driven adapter (TypeORM repositories)
│       ├── wompi/     ← Driven adapter (Payment gateway)
│       ├── security/  ← Driven adapter (bcrypt password hashing)
│       └── auth/      ← Driven adapter (JWT token generation)
├── handler/         ← Application handlers (orchestrate use cases)
├── model/           ← DTOs, mappers, response types
└── common/          ← Shared infrastructure (config, logger, guards)
```

### App (Frontend)

The mobile app uses **React Native with Expo** and follows a **Redux Toolkit** state management pattern:

```
app/src/
├── screens/         ← Screen components (Login, Signup, Products, etc.)
├── components/      ← Reusable UI components
├── features/        ← Redux slices (auth, products, orders, payment, card)
├── store/           ← Redux store configuration
├── api/             ← API client and service modules
├── auth/            ← Token storage, session management
├── navigation/      ← React Navigation configuration
├── utils/           ← Validation helpers, formatters
└── theme/           ← Colors, spacing, typography
```

---

## Project Structure

```
checkout-technical-challenge/
├── app/             ← React Native (Expo) mobile application
├── server/          ← NestJS backend API
│   ├── domain/      ← Pure domain layer (no framework dependencies)
│   ├── infra/       ← Terraform IaC (AWS ECS, RDS, API Gateway)
│   └── e2e/         ← End-to-end tests
└── docs/            ← Test results and documentation assets
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 24.14.1 |
| npm | ≥ 11.11.0 |
| Docker & Docker Compose | Latest |
| Expo CLI | Latest (`npx expo`) |
| Android Studio / Emulator | For Android development |

---

## Getting Started

### Server Setup

1. **Clone and navigate to the server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.template .env
   ```

   Edit `.env` with your values (see [Environment Variables](#environment-variables)).

4. **Start the database with Docker Compose:**

   ```bash
   docker compose up -d
   ```

5. **Run database migrations:**

   ```bash
   npm run migration:run
   ```

6. **Start the development server:**

   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`.

### App Setup

1. **Navigate to the app directory:**

   ```bash
   cd app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_API_URL` to your server URL (e.g., `http://localhost:3000` or your deployed API).

4. **Start the Expo development server:**

   ```bash
   npm start
   ```

5. **Run on Android:**

   ```bash
   npm run android
   ```

---

## Running Tests

### Server Tests

```bash
cd server

# Run all unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### App Tests

```bash
cd app

# Run all tests
npm test

# Run tests with coverage
npx jest --coverage
```

---

## Test Results & Coverage

### App — 38 Test Suites, 365 Tests ✅

All tests passing with excellent coverage:

| Metric | Coverage |
|--------|----------|
| Statements | 98.74% (706/715) |
| Branches | 93.46% (343/367) |
| Functions | 97.71% (214/219) |
| Lines | 98.81% (669/677) |

<details>
<summary>📋 App Test Suites (click to expand)</summary>

```
 PASS  src/components/__tests__/AcceptanceCheckbox.test.tsx
 PASS  src/components/__tests__/Checkbox.test.tsx
 PASS  src/components/__tests__/FiltersPanel.test.tsx
 PASS  src/components/__tests__/Pagination.test.tsx
 PASS  src/components/__tests__/ProductCard.test.tsx
 PASS  src/components/__tests__/Skeleton.test.tsx
 PASS  src/components/__tests__/OrderResultCard.test.tsx
 PASS  src/components/__tests__/Backdrop.test.tsx
 PASS  src/components/__tests__/CardBrandLogo.test.tsx
 PASS  src/screens/__tests__/CardScreen.test.tsx
 PASS  src/screens/__tests__/LoginScreen.test.tsx
 PASS  src/screens/__tests__/PaymentSummaryScreen.test.tsx
 PASS  src/screens/__tests__/ProductDetailScreen.test.tsx
 PASS  src/screens/__tests__/PaymentResultScreen.test.tsx
 PASS  src/screens/__tests__/SignupScreen.test.tsx
 PASS  src/screens/__tests__/SplashScreen.test.tsx
 PASS  src/screens/__tests__/ProductsScreen.test.tsx
 PASS  src/screens/__tests__/DeliveryScreen.test.tsx
 PASS  src/store/__tests__/store.test.tsx
 PASS  src/features/orders/__tests__/ordersSlice.test.ts
 PASS  src/features/payment/__tests__/paymentSlice.test.ts
 PASS  src/features/products/__tests__/productsSlice.test.ts
 PASS  src/features/card/__tests__/cardSlice.test.ts
 PASS  src/features/auth/__tests__/authSlice.test.ts
 PASS  src/features/auth/__tests__/signupFormSlice.test.ts
 PASS  src/features/auth/__tests__/loginFormSlice.test.ts
 PASS  src/auth/__tests__/SessionExpiryListener.test.tsx
 PASS  src/auth/__tests__/cardMetadataStorage.test.ts
 PASS  src/auth/__tests__/tokenStorage.test.ts
 PASS  src/auth/__tests__/sessionExpiry.test.ts
 PASS  src/api/__tests__/client.test.ts
 PASS  src/api/__tests__/orders.test.ts
 PASS  src/api/__tests__/payment.test.ts
 PASS  src/utils/__tests__/cardValidation.test.ts
 PASS  src/utils/__tests__/deliveryValidation.test.ts
 PASS  src/utils/__tests__/formatPrice.test.ts
 PASS  src/utils/__tests__/priceValidation.test.ts
 PASS  src/utils/__tests__/validation.test.ts

Test Suites: 38 passed, 38 total
Tests:       365 passed, 365 total
```

</details>

---

### Server — 49 Test Suites, 207 Tests ✅

All tests passing with coverage above 80% in all metrics:

| Metric | Coverage |
|--------|----------|
| Statements | 98.83% (850/860) |
| Branches | 83.02% (269/324) |
| Functions | 94.55% (139/147) |
| Lines | 98.74% (787/797) |

<details>
<summary>📋 Server Test Suites (click to expand)</summary>

```
 PASS  src/common/config/env.validation.spec.ts
 PASS  src/handler/create-order.handler.spec.ts
 PASS  src/handler/pay-order.handler.spec.ts
 PASS  src/handler/login.handler.spec.ts
 PASS  src/handler/signup.handler.spec.ts
 PASS  src/handler/get-products.handler.spec.ts
 PASS  src/handler/get-order.handler.spec.ts
 PASS  src/handler/get-server-health-status-handler.spec.ts
 PASS  src/adapter/in/http/product.controller.spec.ts
 PASS  src/adapter/in/http/order.controller.spec.ts
 PASS  src/adapter/in/http/auth.controller.spec.ts
 PASS  src/adapter/in/http/health.controller.spec.ts
 PASS  src/adapter/out/postgres/data-source.spec.ts
 PASS  src/adapter/out/postgres/order.repository.spec.ts
 PASS  src/adapter/out/postgres/product.repository.spec.ts
 PASS  src/adapter/out/postgres/user.repository.spec.ts
 PASS  src/adapter/out/postgres/delivery.repository.spec.ts
 PASS  src/adapter/out/postgres/typeorm-health.repository.spec.ts
 PASS  src/adapter/out/postgres/typeorm-transaction-manager.spec.ts
 PASS  src/adapter/out/postgres/typeorm.config.spec.ts
 PASS  src/adapter/out/wompi/wompi-card-payment-method.adapter.spec.ts
 PASS  src/adapter/out/wompi/wompi-payment-gateway.adapter.spec.ts
 PASS  src/adapter/out/wompi/wompi-transaction-gateway.adapter.spec.ts
 PASS  src/adapter/out/wompi/sha256-integrity-signature.adapter.spec.ts
 PASS  src/adapter/out/security/bcrypt-password-hasher.adapter.spec.ts
 PASS  src/adapter/out/auth/jwt-token-generator.adapter.spec.ts
 PASS  src/common/config/general.config.spec.ts
 PASS  src/common/logger/logger.service.spec.ts
 PASS  src/common/strategies/jwt.strategy.spec.ts
 PASS  src/common/utils/environment.util.spec.ts
 PASS  src/common/utils/general.util.spec.ts
 PASS  src/model/dto/http-response.model.spec.ts
 PASS  src/model/exceptions/custom.model.spec.ts
 PASS  src/model/mapper/product-entity.mapper.spec.ts
 PASS  src/model/mapper/product.mapper.spec.ts
 PASS  src/model/mapper/order-entity.mapper.spec.ts
 PASS  src/model/mapper/order.mapper.spec.ts
 PASS  src/model/mapper/pay-order.mapper.spec.ts
 PASS  src/model/mapper/delivery-entity.mapper.spec.ts
 PASS  src/model/mapper/auth.mapper.spec.ts
 PASS  src/model/mapper/user-entity.mapper.spec.ts
 PASS  src/model/mapper/get-server-health-status.mapper.spec.ts
 PASS  domain/src/usecase/create-order.usecase.spec.ts
 PASS  domain/src/usecase/pay-order.usecase.spec.ts
 PASS  domain/src/usecase/login.usecase.spec.ts
 PASS  domain/src/usecase/signup.usecase.spec.ts
 PASS  domain/src/usecase/get-products.usecase.spec.ts
 PASS  domain/src/usecase/get-health.usecase.spec.ts
 PASS  domain/src/usecase/transaction-status-poller.spec.ts

Test Suites: 49 passed, 49 total
Tests:       207 passed, 207 total
```

</details>

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health check |
| POST | `/auth/signup` | No | Register a new user |
| POST | `/auth/login` | No | Authenticate and get JWT token |
| GET | `/products` | Yes | List products (paginated, filterable) |
| POST | `/orders` | Yes | Create a new order |
| GET | `/orders/:id` | Yes | Get order details |
| POST | `/orders/:id/pay` | Yes | Pay an order with card |

### Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Environment (local, development, uat, production) | `local` |
| `PORT` | Server port | `3000` |
| `SERVICE_NAME` | Service identifier | `checkout-ms` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `checkout` |
| `DB_AUTH_MECHANISM` | Auth mechanism (PASSWORD or IAM_AUTH) | `PASSWORD` |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRES_IN` | Token expiration time | `1h` |
| `WOMPI_BASE_URL` | Wompi API base URL | — |
| `WOMPI_PUBLIC_KEY` | Wompi public key | — |
| `WOMPI_PRIVATE_KEY` | Wompi private key | — |
| `WOMPI_INTEGRITY_SECRET` | Wompi integrity secret for signatures | — |
| `WOMPI_MAX_POLL_WAIT_MS` | Max polling time for transaction status | `15000` |
| `WOMPI_POLL_INITIAL_INTERVAL_MS` | Initial poll interval | `1000` |

### App (`app/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |

---

## Infrastructure

The server includes Terraform infrastructure-as-code for deployment to AWS:

- **ECS Fargate** — Containerized NestJS application
- **RDS PostgreSQL** — Managed database
- **API Gateway** — HTTP API with Lambda proxy
- **ECR** — Docker image registry
- **VPC** — Private networking with security groups
- **SSM Parameter Store** — Secrets management
- **ALB** — Application Load Balancer

To deploy:

```bash
cd server/infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply
```

---

## Tech Stack

### Backend
- **NestJS** 11 — Framework
- **TypeORM** — Database ORM
- **PostgreSQL** 16 — Database
- **Passport + JWT** — Authentication
- **Jest** — Testing

### Frontend
- **React Native** 0.86 — UI framework
- **Expo** 57 — Development platform
- **Redux Toolkit** — State management
- **React Navigation** 7 — Navigation
- **Jest + Testing Library** — Testing

---

