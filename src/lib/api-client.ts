let refreshing: Promise<boolean> | null = null;
export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (
    response.status === 401 &&
    retry &&
    (path.startsWith("admin/") || path === "auth/session")
  ) {
    if (!refreshing)
      refreshing = fetch("/api/auth/refresh", {
        method: "POST",
        cache: "no-store",
      })
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => {
          refreshing = null;
        });
    if (await refreshing) return api<T>(path, options, false);
  }
  const result = await response.json().catch(() => ({
    error: {
      message:
        response.status === 413
          ? "The image exceeds this hosting provider’s request limit. Try a smaller file."
          : "The server could not complete this request. Please try again.",
    },
  }));
  if (!response.ok)
    throw new Error(
      result.error?.message || "Unable to complete this request.",
    );
  return result.data as T;
}
export type LiveQuote = {
  room_id: string;
  hotel_id: string;
  room_name: string;
  hotel_name: string;
  tax_configured: boolean;
  currency: string;
  nights: number;
  nightly: { date: string; rate_minor: number }[];
  subtotal_minor: number;
  tax_minor: number;
  discount_minor: number;
  total_minor: number;
  available: number;
  bookable: boolean;
};
export const minorMoney = (value: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value / 100);
