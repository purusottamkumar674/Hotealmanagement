"use client";
import Image from "next/image";
import { useState } from "react";
import { localPhoto, visualPreviewEnabled } from "@/lib/visual-preview";
import { useBrands } from "./BrandContext";
const trusted = (src: string) => {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const u = new URL(src);
    const storage = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      : null;
    return !!(
      u.protocol === "https:" &&
      storage &&
      u.origin === storage.origin &&
      u.pathname.startsWith("/storage/v1/object/public/hotel-media/")
    );
  } catch {
    return false;
  }
};
const stock = (src: string) =>
  !/^\/images\/img[1-8]?\.png$/.test(src) &&
  ((src.startsWith("/images/") && !src.startsWith("/images/official/")) ||
    src.includes("images.unsplash.com"));
export function imageCandidates(
  src?: string | null,
  hotelId?: string,
  fallback?: string,
  allowSamples = true,
) {
  return [
    ...new Set(
      [
        src,
        ...(allowSamples
          ? [
              fallback,
              hotelId ? localPhoto(hotelId) : null,
              "/images/common/hotel-placeholder.webp",
            ]
          : []),
      ].filter(
        (s): s is string => !!s && trusted(s) && (allowSamples || !stock(s)),
      ),
    ),
  ];
}
type Props = {
  src?: string | null;
  alt: string;
  hotelId?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  fallback?: string;
  loading?: "eager" | "lazy";
  sizes?: string;
  fit?: "cover" | "contain";
  allowSamples?: boolean;
};
export function HotelImage(props: Props) {
  const brands = useBrands();
  const allow =
    props.allowSamples !== false &&
    visualPreviewEnabled &&
    (props.hotelId
      ? brands.find((h) => h.id === props.hotelId)?.samplesEnabled !== false
      : !brands.length || brands.some((h) => h.samplesEnabled !== false));
  return (
    <ImageAttempt
      key={`${props.src}|${props.hotelId}|${props.fallback}|${allow}`}
      {...props}
      allowSamples={allow}
    />
  );
}
function ImageAttempt({
  src,
  alt,
  hotelId,
  width = 1200,
  height = 800,
  fill = true,
  priority = false,
  className = "",
  fallback,
  loading,
  sizes = "(max-width: 780px) 100vw, 50vw",
  fit = "cover",
  allowSamples,
}: Props) {
  const options = imageCandidates(src, hotelId, fallback, allowSamples);
  const [attempt, setAttempt] = useState(0),
    [loaded, setLoaded] = useState(false);
  const current = options[attempt];
  const sample = !!current && stock(current);
  return (
    <div
      className={`hotel-image ${fill ? "image-fill" : ""} ${className} ${loaded ? "loaded" : "loading"}`}
      style={!fill ? { aspectRatio: `${width}/${height}` } : undefined}
      aria-busy={!!current && !loaded}
    >
      {current ? (
        <Image
          src={current}
          alt={`${sample ? "Illustrative photo — " : ""}${alt}`}
          {...(fill ? { fill: true } : { width, height })}
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : loading || "lazy"}
          style={{ objectFit: fit }}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setAttempt((n) => n + 1);
          }}
        />
      ) : (
        <div className="image-final-state">
          <span>THE INN COLLECTION</span>
          <strong>A place to picture your next stay.</strong>
          <small>Property photography is being updated.</small>
        </div>
      )}
      {current && !loaded && (
        <span className="image-loading-sheen" aria-hidden="true" />
      )}
      {sample && <span className="sample-photo-badge">Illustrative photo</span>}
    </div>
  );
}
