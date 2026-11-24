"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

export function BrandLogo({
  footer = false,
  fallback = null,
}: {
  footer?: boolean;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return fallback;

  return (
    <Image
      className={`hotel-brand-logo${footer ? " hotel-brand-logo-footer" : ""}`}
      src="/images/logo.png"
      alt="Hotel Flower Inn & Petal Inn — Stay, Relax, Feel at Home"
      width={footer ? 160 : 64}
      height={footer ? 160 : 64}
      sizes={footer ? "160px" : "(max-width: 600px) 52px, 64px"}
      loading={footer ? "lazy" : "eager"}
      onError={() => setFailed(true)}
    />
  );
}
