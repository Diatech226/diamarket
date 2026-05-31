# Operations Domain (Iteration E)

## Reservation model
Reservation is now an operational booking request.

Key fields:
- Links: `quoteId`, `shipmentId`, `transportLineId`, `embarkmentId`, `customerId`.
- Lifecycle: `draft`, `pending_validation`, `confirmed`, `rejected`, `cancelled`, `converted_to_shipment_assignment` (+ legacy compatibility).
- SLA timestamps: `requestedAt`, `reservationConfirmedAt`, `convertedToAssignmentAt`.
- Attachments: typed `documents[]` with uploader metadata.

Mutations are centralized through `operationsApplicationService`.

## Schedule model
Schedule now represents an executable planning slot.

Key fields:
- Route refs: `transportLineId`, `expeditionLineId`, `embarkmentId`.
- Time: `departureDate`, `closingDate` (booking cutoff), `arrivalEstimate`, `planningDeadline`, `departureLockAt`.
- Capacity: `totalCapacity`, `reservedCapacity`, `availableCapacity` (virtual).
- Compatibility: `supportedPackageTypes`.
- Status: `planned`, `booking_open`, `closed`, `departed`, `completed`, `cancelled`.

Service methods:
- `createSchedule`
- `updateSchedule`
- `listSchedules`
- `getAvailableSchedulesForRoute`

## Capacity and booking availability
Deterministic checks evaluate:
- cutoff/deadline validity,
- capacity fit,
- package compatibility,
- route compatibility.

Implemented as reusable service methods:
- `evaluateScheduleAvailability`
- `evaluateEmbarkmentAvailability`

## Assignment flow
`assignShipmentToOperation` handles shipment planning assignment to:
- transport line,
- schedule,
- embarkment.

It enforces:
- role protection (admin/operations),
- validation and exceptions,
- capacity reservation updates,
- assignment metadata (`assignedAt`, `assignedBy`, `assignmentReason`, `assignmentNote`, `assignmentStatus`),
- shipment planning state (`unplanned` → `assigned/scheduled`).

## Cutoffs, windows, SLA readiness
Cutoff and planning deadlines are enforced in availability checks.
Model timestamps support SLA analytics foundations:
- reservations: requested/confirmed/converted,
- shipments: scheduled/dispatched/delivered (existing + aligned),
- assignments: assigned timestamp and actor.

## Operational exceptions
Structured exception codes:
- `capacity_exceeded`
- `cutoff_missed`
- `incompatible_package_type`
- `invalid_route_assignment`
- `embarkment_delayed`
- `schedule_unavailable`

Exceptions can be raised by services and persisted to `OperationalException` for auditability.

## Events published
- `reservation.created`
- `reservation.confirmed`
- `reservation.rejected`
- `schedule.created`
- `shipment.assigned`
- `embarkment.capacity_reached`
- `shipment.planning_exception`

## Admin integration (minimal)
Added admin operations endpoints under `/api/v1/admin/operations/*` for:
- reservation visibility and status transitions,
- schedule visibility,
- shipment assignment and planning visibility.
