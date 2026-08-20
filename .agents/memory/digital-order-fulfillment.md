---
name: Digital order fulfillment
description: Customer-approved fulfillment behavior for completed digital orders.
---

Stripe purchases return to a completed-order screen that displays the purchased items and the approved Mega download link only after the payment is confirmed. Do not add customer email collection or automatic delivery emails.

**Why:** The customer explicitly narrowed the flow to immediate on-site access and asked to preserve their existing Stripe checkout setup.

**How to apply:** Keep checkout completion tied to a verified Stripe session and route customers back to the storefront when verification is unavailable.