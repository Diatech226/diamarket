# Sandbox Guide

Sandbox scenarios are deterministic and never move real money.

## Scenarios

- `success`: successful card, mobile money or crypto payment.
- `failed`: provider decline or failed mobile money authorization.
- `pending`: delayed mobile money confirmation.
- `expired`: checkout or payment expiration.
- `refund`: partial or full refund simulation.
- `webhook`: signed event delivery to a local endpoint.
- `payout`: payout creation and status tracking.

Test values: card `4242 4242 4242 4242` succeeds, card `4000 0000 0000 0002` fails, phone `70000000` succeeds and phone `70000001` fails.
