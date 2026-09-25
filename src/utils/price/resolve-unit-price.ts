export interface PriceSource {
  price: unknown;
}

export interface VariantPriceSource {
  price?: unknown;
}

export function resolveUnitPrice(
  product: PriceSource,
  variant?: VariantPriceSource | null,
): number {
  const variantPrice = variant?.price;
  if (variantPrice != null) {
    return Number(variantPrice);
  }
  return Number(product.price);
}
