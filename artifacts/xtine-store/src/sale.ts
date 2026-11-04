export const SALE_ACTIVE = true;
export const SALE_PERCENT = 25;

export function applySale(price: number): number {
  if (!SALE_ACTIVE) return price;
  return Math.round(price * (1 - SALE_PERCENT / 100) * 100) / 100;
}

export function formatMoney(n: number): string {
  return n < 1 ? n.toFixed(3) : n.toFixed(2);
}
