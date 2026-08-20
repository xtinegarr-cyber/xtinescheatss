/** Convert a product name to a URL slug. e.g. "Rainbow Six Siege" → "rainbow-six-siege" */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Convert a dollar unit price and quantity into Stripe's whole-cent charge. */
export function calculateChargeAmount(unitPrice: number, quantity: number): number {
  const unitPriceInThousandths = Math.round(unitPrice * 1000);
  return Math.round((unitPriceInThousandths * quantity) / 10) / 100;
}
