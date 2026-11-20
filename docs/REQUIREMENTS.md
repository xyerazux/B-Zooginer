# B-Zooginer — Requirements

This document defines all functional and non-functional requirements for the B-Zooginer platform. Requirements are tagged with a priority: **P0** (must-have for launch), **P1** (important, build early), **P2** (nice-to-have, can defer).

---

## Table of Contents

1. [Functional Requirements](#1-functional-requirements)
   - [1.1 Public Storefront](#11-public-storefront)
   - [1.2 Authentication](#12-authentication)
   - [1.3 Group Management](#13-group-management)
   - [1.4 Product Management](#14-product-management)
   - [1.5 Order Management](#15-order-management)
   - [1.6 Payment Management](#16-payment-management)
   - [1.7 Reporting & Export](#17-reporting--export)
   - [1.8 Site Settings](#18-site-settings)
   - [1.9 User Management](#19-user-management)
2. [Non-Functional Requirements](#2-non-functional-requirements)
3. [Data Requirements](#3-data-requirements)
4. [Business Rules](#4-business-rules)
5. [Constraints & Assumptions](#5-constraints--assumptions)

---

## 1. Functional Requirements

### 1.1 Public Storefront

| ID | Priority | Requirement |
|----|----------|-------------|
| PUB-01 | P0 | The platform must display a homepage listing all published groups with poster image, group name, and PO status badge |
| PUB-02 | P0 | Each group must have a dedicated store page showing all active products |
| PUB-03 | P0 | A product detail page must show name, description, image, price, available variants, and stock status |
| PUB-04 | P0 | Buyers must be able to submit an order anonymously without creating an account |
| PUB-05 | P0 | The order form must collect: buyer name, buyer class, WhatsApp number (optional), selected product(s) with variant(s) and quantity, and payment method (CASH or TRANSFER) |
| PUB-06 | P0 | On successful submission, the buyer receives a unique `order_code` and a secure high-entropy `access_token` |
| PUB-07 | P0 | Public order confirmation is securely viewed via `/order/success/:orderCode?token=<access_token>`; access without the matching token is denied to prevent order enumeration |
| PUB-08 | P1 | Groups with `po_status = coming_soon` must show a "Coming Soon" state without a browsable product list |
| PUB-09 | P1 | Groups with `po_status = closed` must show a "Pre-order closed" state |
| PUB-10 | P1 | The storefront must display a site-level announcement banner if one is configured |
| PUB-11 | P2 | The order lookup page should allow sharing the order status link |

### 1.2 Authentication

| ID | Priority | Requirement |
|----|----------|-------------|
| AUTH-01 | P0 | MASTER_ADMIN and GROUP_ADMIN must authenticate via email and password |
| AUTH-02 | P0 | Sessions must persist across page refreshes using Supabase's session management |
| AUTH-03 | P0 | Authenticated users must be redirected to their role-appropriate dashboard on login |
| AUTH-04 | P0 | Unauthenticated access to any `/master-admin/*` or `/group-admin/*` route must redirect to `/login` |
| AUTH-05 | P0 | A GROUP_ADMIN must not be able to access `/master-admin/*` routes |
| AUTH-06 | P0 | Logout must clear the session and redirect to `/login` |
| AUTH-07 | P1 | Failed login attempts must display a clear, non-revealing error message |
| AUTH-08 | P2 | Password reset via email must be supported (Supabase Magic Link / reset flow) |

### 1.3 Group Management

| ID | Priority | Requirement |
|----|----------|-------------|
| GRP-01 | P0 | MASTER_ADMIN must be able to create a new group with: name, slug, description, logo, poster, PO status, and sort order |
| GRP-02 | P0 | MASTER_ADMIN must be able to edit any group's details |
| GRP-03 | P0 | MASTER_ADMIN must be able to publish or unpublish a group (controls storefront visibility) |
| GRP-04 | P0 | MASTER_ADMIN must be able to set a group's `po_status` (open, coming_soon, closed) |
| GRP-05 | P0 | GROUP_ADMIN must be able to edit their own group's description and poster only |
| GRP-06 | P1 | Groups must have a unique `slug` used in public URLs (e.g., `/groups/bazaar-club`) |
| GRP-07 | P1 | Group sort order must be configurable by MASTER_ADMIN for storefront display ordering |

### 1.4 Product Management

| ID | Priority | Requirement |
|----|----------|-------------|
| PRD-01 | P0 | GROUP_ADMIN must be able to create a product for their own group with: name, description, image, base price, PO open/close dates, and active status |
| PRD-02 | P0 | MASTER_ADMIN must be able to create or edit products for any group |
| PRD-03 | P0 | A product must support multiple variant dimensions (e.g. Size AND Flavor), generating a combination matrix where each option combination has a title, structured attributes JSON, price adjustment, and optional stock count |
| PRD-04 | P0 | Products without variants must be orderable directly at base price |
| PRD-05 | P0 | Inactive products (`is_active = false`) must not appear on the public storefront |
| PRD-06 | P1 | Products may have a `max_po_qty` to limit total pre-order volume |
| PRD-07 | P1 | If `track_stock = true` and stock reaches 0, the product/variant must show as out of stock and be unorderable |
| PRD-08 | P1 | Products may be marked `is_featured` to appear in a featured section on the group store page |
| PRD-09 | P2 | Products should support a `po_open_at` / `po_close_at` window; outside this window orders are blocked |

### 1.5 Order Management

| ID | Priority | Requirement |
|----|----------|-------------|
| ORD-01 | P0 | Orders must be insertable by PUBLIC (via Edge Function), GROUP_ADMIN, and MASTER_ADMIN |
| ORD-02 | P0 | Each order must have a unique, human-readable `order_code` (format: `BZG-YYYYMMDD-XXXX`) |
| ORD-03 | P0 | An order must contain at least one line item |
| ORD-04 | P0 | Each line item must record `unit_price_snapshot`, `product_variant`, `quantity`, and `subtotal` at the time of order |
| ORD-05 | P0 | MASTER_ADMIN must see all orders across all groups |
| ORD-06 | P0 | GROUP_ADMIN must see only their own group's orders |
| ORD-07 | P0 | MASTER_ADMIN and GROUP_ADMIN must be able to change `order_status` (NEW → CONFIRMED → COMPLETED or CANCELLED) |
| ORD-08 | P0 | The order list must be filterable by `order_status`, `payment_status`, and date range |
| ORD-09 | P0 | The order list must be searchable by `order_code`, `buyer_name`, or `buyer_class` |
| ORD-10 | P1 | Cancelled orders must not decrement or affect stock (or must restore stock atomically) |
| ORD-11 | P1 | Orders must display `source` (master_admin, group_admin, public) to distinguish origin |
| ORD-12 | P2 | Admins should be able to add internal notes to an order |

### 1.6 Payment Management

| ID | Priority | Requirement |
|----|----------|-------------|
| PAY-01 | P0 | Each order must have a `payment_method` (CASH or TRANSFER) set at order creation |
| PAY-02 | P0 | Each order must have a `payment_status` (UNPAID or PAID), defaulting to UNPAID |
| PAY-03 | P0 | GROUP_ADMIN must be able to mark an order's `payment_status` as PAID |
| PAY-04 | P0 | MASTER_ADMIN must be able to change payment status for any order |
| PAY-05 | P0 | PUBLIC users must not be able to change `payment_status` |
| PAY-06 | P1 | The payments page must show a summary: total revenue, paid vs unpaid breakdown, by payment method |
| PAY-07 | P2 | Payment status changes should be recorded in `activity_logs` with the actor's user ID |

### 1.7 Reporting & Export

| ID | Priority | Requirement |
|----|----------|-------------|
| RPT-01 | P0 | The Master Admin dashboard must show platform-wide stats: total orders, total revenue, orders by status, orders by group |
| RPT-02 | P0 | The Group Admin dashboard must show group-specific stats: total orders, revenue, top products |
| RPT-03 | P1 | A revenue chart (line or bar) over time must be available on both dashboards |
| RPT-04 | P1 | MASTER_ADMIN must be able to export all orders (or filtered orders) to Excel (`.xlsx`) |
| RPT-05 | P1 | GROUP_ADMIN must be able to export their own group's orders to Excel |
| RPT-06 | P1 | Excel exports must include: order_code, group, buyer name, class, WhatsApp, items, total, payment method, payment status, order status, date |
| RPT-07 | P2 | MASTER_ADMIN should be able to view a comparison chart of revenue across groups |

### 1.8 Site Settings

| ID | Priority | Requirement |
|----|----------|-------------|
| SET-01 | P0 | MASTER_ADMIN must be able to configure: platform name, logo URL, and favicon URL |
| SET-02 | P1 | MASTER_ADMIN must be able to set an announcement banner (text + visible/hidden toggle) |
| SET-03 | P2 | MASTER_ADMIN should be able to configure footer content (contact info, social links) |

### 1.9 User Management

| ID | Priority | Requirement |
|----|----------|-------------|
| USR-01 | P0 | MASTER_ADMIN must be able to create a GROUP_ADMIN account (email + password + group assignment) |
| USR-02 | P0 | MASTER_ADMIN must be able to deactivate a GROUP_ADMIN account |
| USR-03 | P0 | A GROUP_ADMIN must be assigned to exactly one group at account creation |
| USR-04 | P1 | MASTER_ADMIN must be able to reassign a GROUP_ADMIN to a different group |
| USR-05 | P1 | GROUP_ADMIN must be able to change their own password |
| USR-06 | P2 | MASTER_ADMIN should see a login activity log per user |

---

## 2. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Public storefront LCP must be < 2.5 seconds on a mobile connection (Vercel CDN + optimized images) |
| NFR-02 | Performance | Admin dashboard initial load must be < 3 seconds |
| NFR-03 | Performance | Order submission must complete within 5 seconds end-to-end |
| NFR-04 | Reliability | The system must be available 99.5% of the time (inheriting Supabase + Vercel SLA) |
| NFR-05 | Security | All admin routes must be inaccessible without a valid JWT |
| NFR-06 | Security | RLS policies must be the last line of defense — unauthorized DB access must be blocked even if the client is compromised |
| NFR-07 | Security | The service role key must never be exposed in frontend code or browser environment variables |
| NFR-08 | Security | Public order submission must be rate-limited via Edge Function (max 10 req/min per IP) |
| NFR-09 | Scalability | The system must support 5–10 groups and up to 1,000 orders without performance degradation |
| NFR-10 | Usability | The public storefront must be fully usable on a 375px viewport (mobile-first) |
| NFR-11 | Usability | Admin dashboards must be responsive; primary functions accessible on tablet (768px+) |
| NFR-12 | Maintainability | All TypeScript types must be derived from the Supabase-generated `database.types.ts` |
| NFR-13 | Maintainability | All DB interactions must go through `src/services/` — no inline Supabase calls in components |
| NFR-14 | Accessibility | Interactive elements must have focus rings; color is not the sole indicator of state |

---

## 3. Data Requirements

### 3.1 Order Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `order_code` | text | Yes | Auto-generated; unique; format `BZG-YYYYMMDD-XXXX` |
| `group_id` | uuid | Yes | FK → groups |
| `buyer_name` | text | Yes | Full name of buyer |
| `buyer_class` | text | Yes | Class/grade identifier |
| `whatsapp` | text | No | Buyer's WhatsApp number |
| `source` | enum | Yes | `master_admin` \| `group_admin` \| `public` |
| `order_date` | date | Yes | Date the order was placed |
| `payment_method` | enum | Yes | `cash` \| `transfer` |
| `payment_status` | enum | Yes | `unpaid` \| `paid`; default `unpaid` |
| `order_status` | enum | Yes | `new` \| `confirmed` \| `cancelled` \| `completed`; default `new` |
| `total` | numeric | Yes | Sum of all order_items.subtotal |
| `notes` | text | No | Optional admin notes |
| `created_by` | uuid | No | FK → profiles; null for public orders |

### 3.2 Order Item Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `order_id` | uuid | Yes | FK → orders |
| `product_id` | uuid | Yes | FK → products |
| `variant_id` | uuid | No | FK → product_variants; null if no variants |
| `product_name_snapshot` | text | Yes | Product name at time of order |
| `variant_label_snapshot` | text | No | Variant description at time of order |
| `unit_price_snapshot` | numeric | Yes | Price per unit at time of order (frozen) |
| `quantity` | int | Yes | Must be ≥ 1 |
| `subtotal` | numeric | Yes | `unit_price_snapshot × quantity` |

### 3.3 Data Retention

- Orders must not be deleted; use `order_status = cancelled` instead
- Activity logs are append-only and must not be deleted
- Soft-delete products by setting `is_active = false`

---

## 4. Business Rules

| Rule | Description |
|------|-------------|
| BR-01 | An order's `total` must equal the sum of its `order_items.subtotal` values |
| BR-02 | `unit_price_snapshot` is calculated as `base_price + variant.price_adjustment` at order time and is never updated after creation |
| BR-03 | A GROUP_ADMIN can only create orders for their assigned group |
| BR-04 | An order cannot be edited after `order_status = completed` or `order_status = cancelled` |
| BR-05 | Stock deduction (when `track_stock = true`) must be atomic; two concurrent orders must not both succeed if only one unit remains |
| BR-06 | `order_code` must be globally unique across the platform |
| BR-07 | A product with `is_active = false` cannot receive new orders |
| BR-08 | A group with `is_published = false` must not appear on the public storefront |
| BR-09 | Payment status can only be changed by MASTER_ADMIN or the GROUP_ADMIN of the order's group |
| BR-10 | Deleting a group is not supported in v1; groups may only be unpublished |

---

## 5. Constraints & Assumptions

| Item | Detail |
|------|--------|
| **Single MASTER_ADMIN** | Only one master admin account; created by direct DB insert or Supabase Auth admin API |
| **UI Language** | 100% Bahasa Indonesia across all interfaces (storefront publik, dashboard Master Admin, dashboard Group Admin, modal, badges, error messages) |
| **No payment processing** | The platform records payment intent and status but does not process money |
| **No real-time notifications** | No push notifications or email/SMS in v1 |
| **No multi-tenancy** | One platform instance per school |
| **Internet required** | No offline functionality |
| **Image hosting** | All images hosted in Supabase Storage; external image URLs are not supported |
| **Browser support** | Modern evergreen browsers only (Chrome, Safari, Firefox, Edge — latest 2 versions) |
| **Data volume** | Designed for ≤ 10 groups, ≤ 50 products per group, ≤ 1,000 orders total (school-scale) |
