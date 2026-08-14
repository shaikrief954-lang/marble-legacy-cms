export function whatsappHref(number: string, message: string) {
  const digits = (number || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message || "")}`;
}

export function telHref(phone: string) {
  return `tel:${(phone || "").replace(/[^0-9+]/g, "")}`;
}

export const NAV_ITEMS = [
  { to: "/", label: "ראשי" },
  { to: "/about", label: "אודות" },
  { to: "/monuments", label: "מצבות" },
  { to: "/gallery", label: "עבודות" },
  { to: "/services", label: "שירותים" },
  { to: "/contact", label: "צור קשר" },
] as const;

export function priceLabel(
  product: { price: number | null; show_price: boolean; price_on_request: boolean },
  onRequestText: string,
) {
  if (product.show_price && product.price != null) {
    return `${new Intl.NumberFormat("he-IL").format(product.price)} ₪`;
  }
  if (product.price_on_request) return onRequestText || "מחיר לפי הצעת מחיר";
  return null;
}

/** Safe accessor for the settings/texts maps (strict index-signature friendly). */
export function pick(map: Record<string, string> | undefined, key: string, fallback = ""): string {
  const value = map?.[key];
  return value && value.length > 0 ? value : fallback;
}
