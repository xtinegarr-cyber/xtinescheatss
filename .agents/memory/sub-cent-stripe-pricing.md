---
name: Sub-cent Stripe pricing
description: How the storefront preserves exact pricing for products whose individual unit price is below one USD cent.
---

For a unit product whose advertised unit price has more than two decimal places, calculate the selected quantity's combined total once, round that total to Stripe's whole cents, and show that same rounded amount in the storefront.

**Why:** Stripe accepts USD charges in whole cents. Rounding each $0.081 unit independently changes the advertised rate; displaying an unrounded cart amount can also disagree with what Stripe charges.

**How to apply:** Keep the advertised per-unit rate visible, store sub-cent unit prices with enough precision to calculate deterministically, enforce the item's minimum against the rounded combined subtotal, and use that same total for the cart, checkout, and Stripe line item.