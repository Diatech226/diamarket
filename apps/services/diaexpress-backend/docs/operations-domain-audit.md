# Iteration E — Operations Domain Audit

## Scope audited
- Reservation API/model/controller.
- Schedule API/model/controller.
- Embarkment and transport-line master-data integration.
- Shipment assignment and planning hooks.
- Existing quote readiness and shipment lifecycle fields.

## Current state before Iteration E

### Reservation
**What existed**
- `Reservation` model supported user, origin/destination, dates, provider, basic status, and documents.
- Controller supported creation, list (self/admin), status patch, document upload.

**Gaps**
- No first-class link to quote, shipment, line, or embarkment.
- Statuses were delivery-style (`pending/in_transit/delivered`) rather than planning lifecycle.
- No SLA fields (`requestedAt`, `reservationConfirmedAt`).
- Mutations were controller-level, not domain service driven.

### Schedule
**What existed**
- `Schedule` had origin, destination, one-mode enum (`sea`), period label, departure and closing dates.
- Controller was basic CRUD/list; no operational availability logic.

**Gaps**
- No linkage to transport line / expedition line / embarkment.
- No capacity fields.
- No planning deadlines, arrival estimate, lock timestamps.
- No method to query route availability by constraints.

### Embarkment usage
**What existed**
- Embarkments were structured with line refs, windows, cutoff, allowed package types, and status.
- Master data service already created/listed embarkments from structured network refs.

**Gaps**
- Capacity existed in creation DTO but not fully represented/used in model behavior.
- No shared assignment validator for cutoff/package/capacity.

### Shipment planning/assignment
**What existed**
- Shipment had transport line and embarkment refs.
- Controller had `assign-embarkment` endpoint that only set the ref.

**Gaps**
- No capacity/cutoff validation.
- No assignment metadata (`assignedAt`, `assignedBy`, reason/note).
- No reversible/statused assignment lifecycle.
- No planning exception model.

### Quote readiness
**What existed**
- Quote status model already includes `approved`, `customer_approved`, `ready_for_shipment`, `converted`.
- Conversion to shipment already validates eligible statuses.

**Gaps**
- No explicit operations-layer readiness bridge for planning decisions.

## Recommended implementation scope for Iteration E
1. Harden reservation model lifecycle and links to quote/shipment/network entities.
2. Rework schedule into operational slot with capacity and deadlines.
3. Add reusable capacity/availability checks for schedule + embarkment.
4. Implement assignment service with role/cutoff/capacity validation.
5. Add operational exception persistence and normalized contracts.
6. Publish operations events on reservation/schedule/assignment/capacity/exception.
7. Expose minimal admin-v2 operations endpoints for managing planning.
8. Add deterministic tests for lifecycle, availability, capacity, assignment, cutoff, and events.
