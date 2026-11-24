// Ready for an approved sender integration; this module never sends mail.
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function bookingEmail(input: {
  hotelName: string;
  officialLogoUrl?: string;
  guestName: string;
  reference: string;
  checkin: string;
  checkout: string;
  total: string;
}) {
  const logo =
    input.officialLogoUrl && /^https:\/\//.test(input.officialLogoUrl)
      ? `<img src="${escape(input.officialLogoUrl)}" alt="${escape(input.hotelName)}" width="140" style="max-height:80px;object-fit:contain"/>`
      : "";
  return {
    subject: `${input.hotelName}: reservation ${input.reference}`,
    html: `<!doctype html><html lang="en"><body style="font:16px Arial;color:#263c33">${logo}<h1>${escape(input.hotelName)}</h1><p>Hello ${escape(input.guestName)},</p><p>Your reservation reference is <strong>${escape(input.reference)}</strong>.</p><p>${escape(input.checkin)} to ${escape(input.checkout)}</p><p>Total: ${escape(input.total)}. Payment is due at the property under its approved booking policy.</p></body></html>`,
  };
}
