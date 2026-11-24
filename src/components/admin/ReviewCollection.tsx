"use client";
import { QRCodeSVG } from "qrcode.react";
export function ReviewCollection({
  name,
  url,
  keywords,
}: {
  name: string;
  url?: string;
  keywords?: string;
}) {
  return (
    <div className="admin-card" style={{ marginBottom: 24 }}>
      <h2>{name} · Local presence</h2>
      {keywords && <p>Target keywords: {keywords}</p>}
      {url ? (
        <>
          <p>
            Approved review link. Share with guests after their stay; review
            responses are managed through the verified platform.
          </p>
          <QRCodeSVG
            value={url}
            size={144}
            title={`${name} approved review link`}
          />
          <p>
            <a
              className="text-link"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open review link
            </a>
          </p>
        </>
      ) : (
        <p>
          Add the property&apos;s approved Google review link in Property
          settings to enable review collection.
        </p>
      )}
      <p className="muted">
        Google Business Profile, Search Console and ranking APIs are not
        connected. This workspace records manually verified tasks and reviews.
      </p>
    </div>
  );
}
