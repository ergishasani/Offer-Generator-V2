Here’s your **WindowInvoice Pro Backend API & Database Documentation** in clean **Markdown (.md)** format — ready to drop in your repo (e.g. `docs/backend.md`):

---

````markdown
# 🧱 WindowInvoice Pro – Backend API & Database Specification

**Stack:**

- **Backend:** Spring Boot (Java)
- **Frontend:** React
- **Database:** PostgreSQL
- **Auth:** JWT / API Key
- **Integrations:** Stripe, Email, Webhooks, PDF Generation

This document defines the **complete backend architecture**, including **REST API endpoints** and **database schema (DDL)**.

---

## 📚 Table of Contents

- [Overview](#overview)
- [API Conventions](#api-conventions)
- [1. Auth & Tenant Management](#1-auth--tenant-management)
- [2. Users & Teams](#2-users--teams)
- [3. Clients (CRM)](#3-clients-crm)
- [4. Projects](#4-projects)
- [5. Window Templates & Designer](#5-window-templates--designer)
- [6. Window Instances](#6-window-instances)
- [7. Materials & Inventory](#7-materials--inventory)
- [8. Invoices & Billing](#8-invoices--billing)
- [9. Payments (Stripe)](#9-payments-stripe)
- [10. Documents & PDF Generation](#10-documents--pdf-generation)
- [11. Reporting & Exports](#11-reporting--exports)
- [12. Webhooks & Integrations](#12-webhooks--integrations)
- [13. Notifications & Audit Logs](#13-notifications--audit-logs)
- [14. Billing & Subscription](#14-billing--subscription)
- [📦 Database Schema (PostgreSQL DDL)](#-database-schema-postgresql-ddl)
- [🔧 Implementation Notes](#-implementation-notes)
- [🚀 MVP Tables & Endpoints](#-mvp-tables--endpoints)

---

## Overview

**WindowInvoice Pro** is a SaaS platform for window manufacturers and contractors to manage:

- Quotes, Invoices, and Projects
- Custom Window Design Templates
- Materials, Inventory, and Orders
- Client and CRM
- Team Collaboration
- Payments (Stripe)
- PDF Documents and Reporting

---

## API Conventions

- **Base URL:** `/api/v1`
- **Auth Header:** `Authorization: Bearer <token>`
- **Tenant:** derived from JWT (optional: `X-Tenant-ID` for testing)
- **IDs:** UUID
- **Pagination:** `?page=1&size=20`
- **Error Format:**

  ```json
  {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  }
  ```

---

## 1. Auth & Tenant Management

| Method   | Endpoint                              | Description               |
| -------- | ------------------------------------- | ------------------------- |
| `POST`   | `/api/v1/auth/register`               | Register tenant and owner |
| `POST`   | `/api/v1/auth/login`                  | Login user, return JWT    |
| `POST`   | `/api/v1/auth/refresh`                | Refresh token             |
| `POST`   | `/api/v1/auth/invite`                 | Invite new user           |
| `POST`   | `/api/v1/auth/verify-email`           | Verify email token        |
| `POST`   | `/api/v1/auth/reset-password`         | Send reset email          |
| `POST`   | `/api/v1/auth/reset-password/confirm` | Confirm reset             |
| `GET`    | `/api/v1/tenants/{id}`                | Get tenant info           |
| `PUT`    | `/api/v1/tenants/{id}`                | Update branding/settings  |
| `POST`   | `/api/v1/api-keys`                    | Create API key            |
| `GET`    | `/api/v1/api-keys`                    | List API keys             |
| `DELETE` | `/api/v1/api-keys/{id}`               | Delete API key            |

---

## 2. Users & Teams

| Method   | Endpoint             | Description |
| -------- | -------------------- | ----------- |
| `GET`    | `/api/v1/users`      | List users  |
| `POST`   | `/api/v1/users`      | Invite user |
| `GET`    | `/api/v1/users/{id}` | Get user    |
| `PUT`    | `/api/v1/users/{id}` | Update user |
| `DELETE` | `/api/v1/users/{id}` | Delete user |
| `GET`    | `/api/v1/teams`      | List teams  |
| `POST`   | `/api/v1/teams`      | Create team |
| `PUT`    | `/api/v1/teams/{id}` | Update team |
| `DELETE` | `/api/v1/teams/{id}` | Delete team |

---

## 3. Clients (CRM)

| Method   | Endpoint                        | Description     |
| -------- | ------------------------------- | --------------- |
| `GET`    | `/api/v1/clients`               | List clients    |
| `POST`   | `/api/v1/clients`               | Create client   |
| `GET`    | `/api/v1/clients/{id}`          | Get client      |
| `PUT`    | `/api/v1/clients/{id}`          | Update client   |
| `DELETE` | `/api/v1/clients/{id}`          | Delete client   |
| `GET`    | `/api/v1/clients/{id}/projects` | Client projects |

---

## 4. Projects

| Method   | Endpoint                       | Description    |
| -------- | ------------------------------ | -------------- |
| `GET`    | `/api/v1/projects`             | List projects  |
| `POST`   | `/api/v1/projects`             | Create project |
| `GET`    | `/api/v1/projects/{id}`        | Get project    |
| `PUT`    | `/api/v1/projects/{id}`        | Update project |
| `PATCH`  | `/api/v1/projects/{id}/status` | Change status  |
| `DELETE` | `/api/v1/projects/{id}`        | Delete project |

---

## 5. Window Templates & Designer

| Method   | Endpoint                        | Description     |
| -------- | ------------------------------- | --------------- |
| `GET`    | `/api/v1/window-templates`      | List templates  |
| `POST`   | `/api/v1/window-templates`      | Create template |
| `GET`    | `/api/v1/window-templates/{id}` | Get template    |
| `PUT`    | `/api/v1/window-templates/{id}` | Update template |
| `DELETE` | `/api/v1/window-templates/{id}` | Delete template |

---

## 6. Window Instances

| Method   | Endpoint                                    | Description           |
| -------- | ------------------------------------------- | --------------------- |
| `POST`   | `/api/v1/projects/{projectId}/windows`      | Add configured window |
| `GET`    | `/api/v1/projects/{projectId}/windows/{id}` | Get window            |
| `PUT`    | `/api/v1/projects/{projectId}/windows/{id}` | Update                |
| `DELETE` | `/api/v1/projects/{projectId}/windows/{id}` | Delete                |
| `POST`   | `/api/v1/windows/estimate`                  | Get estimated cost    |

---

## 7. Materials & Inventory

| Method   | Endpoint                      | Description      |
| -------- | ----------------------------- | ---------------- |
| `GET`    | `/api/v1/materials`           | List materials   |
| `POST`   | `/api/v1/materials`           | Add material     |
| `PUT`    | `/api/v1/materials/{id}`      | Update           |
| `DELETE` | `/api/v1/materials/{id}`      | Delete           |
| `GET`    | `/api/v1/inventory`           | List stock       |
| `POST`   | `/api/v1/inventory/movements` | Record movement  |
| `GET`    | `/api/v1/inventory/alerts`    | Low stock alerts |

---

## 8. Invoices & Billing

| Method | Endpoint                        | Description          |
| ------ | ------------------------------- | -------------------- |
| `GET`  | `/api/v1/invoices`              | List invoices        |
| `POST` | `/api/v1/invoices`              | Create draft invoice |
| `GET`  | `/api/v1/invoices/{id}`         | Get invoice          |
| `PUT`  | `/api/v1/invoices/{id}`         | Update invoice       |
| `POST` | `/api/v1/invoices/{id}/send`    | Send via email       |
| `POST` | `/api/v1/invoices/{id}/approve` | Approve invoice      |
| `POST` | `/api/v1/invoices/{id}/pay`     | Mark as paid         |
| `POST` | `/api/v1/invoices/{id}/void`    | Void invoice         |
| `GET`  | `/api/v1/invoices/{id}/pdf`     | Get PDF              |
| `GET`  | `/api/v1/invoices/{id}/history` | Version history      |

---

## 9. Payments (Stripe)

| Method | Endpoint                                | Description                  |
| ------ | --------------------------------------- | ---------------------------- |
| `POST` | `/api/v1/payments/stripe/create-intent` | Create Stripe payment intent |
| `POST` | `/api/v1/payments/stripe/webhook`       | Stripe webhook               |
| `GET`  | `/api/v1/payments/{id}`                 | Get payment                  |

---

## 10. Documents & PDF Generation

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| `POST` | `/api/v1/documents/generate` | Generate PDF        |
| `GET`  | `/api/v1/documents/{id}`     | Get document status |
| `GET`  | `/api/v1/assets/{id}`        | Get asset URL       |

---

## 11. Reporting & Exports

| Method | Endpoint                    | Description     |
| ------ | --------------------------- | --------------- |
| `POST` | `/api/v1/reports/generate`  | Generate report |
| `GET`  | `/api/v1/reports/{id}`      | Get report      |
| `GET`  | `/api/v1/analytics/summary` | Dashboard stats |

---

## 12. Webhooks & Integrations

| Method   | Endpoint                | Description |
| -------- | ----------------------- | ----------- |
| `POST`   | `/api/v1/webhooks`      | Subscribe   |
| `GET`    | `/api/v1/webhooks`      | List hooks  |
| `DELETE` | `/api/v1/webhooks/{id}` | Delete      |

---

## 13. Notifications & Audit Logs

| Method | Endpoint                               | Description       |
| ------ | -------------------------------------- | ----------------- |
| `GET`  | `/api/v1/notifications`                | Get notifications |
| `POST` | `/api/v1/notifications/{id}/mark-read` | Mark read         |
| `GET`  | `/api/v1/audit-logs`                   | List logs         |

---

## 14. Billing & Subscription

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| `POST` | `/api/v1/subscriptions`      | Create subscription |
| `GET`  | `/api/v1/subscriptions/{id}` | Get subscription    |
| `POST` | `/api/v1/billing/invoice`    | Get billing invoice |

---

## 📦 Database Schema (PostgreSQL DDL)

> Copy this SQL to your migration tool (Flyway / Liquibase).

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  currency CHAR(3) DEFAULT 'EUR',
  timezone TEXT DEFAULT 'Europe/Tirane',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT,
  full_name TEXT,
  role TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  primary_contact JSONB,
  addresses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'lead',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Window templates
CREATE TABLE window_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  svg_template JSONB,
  default_specs JSONB,
  default_pricing JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Window instances
CREATE TABLE window_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id),
  template_id UUID REFERENCES window_templates(id),
  name TEXT,
  dimensions JSONB,
  materials JSONB,
  price_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  invoice_number TEXT,
  status TEXT DEFAULT 'draft',
  currency CHAR(3) DEFAULT 'EUR',
  lines JSONB,
  totals JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  invoice_id UUID REFERENCES invoices(id),
  amount NUMERIC(14,2),
  currency CHAR(3),
  provider_payment_id TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔧 Implementation Notes

- Use **Row-level security (RLS)** or enforce tenant isolation in queries.
- Index all `tenant_id`, `client_id`, `invoice_number`.
- Use **GIN** indexes for JSONB search.
- Use **async jobs** for PDF/report generation.
- Validate all numeric dimensions (mm/inches).
- Always filter by tenant.

---

## 🚀 MVP Tables & Endpoints

Start with:

- Tables: `tenants`, `users`, `clients`, `projects`, `window_templates`, `window_instances`, `invoices`, `payments`
- Endpoints: Auth, Clients CRUD, Projects CRUD, Templates CRUD, Windows CRUD, Invoices CRUD, Stripe Payment, PDF generate

---

## ✅ Next Steps

- [ ] Add **OpenAPI (Swagger)** spec
- [ ] Implement **Spring Boot Entities + Repositories**
- [ ] Add **MapStruct DTOs**
- [ ] Setup **Flyway** for migrations

```

```
````
