import { ArrowRight } from "lucide-react";
import Link from "next/link";
export default function NotFound() {
  return (
    <main
      className="container"
      style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}
    >
      <div style={{ textAlign: "center" }}>
        <span className="eyebrow">404 · NOT FOUND</span>
        <h1 className="serif" style={{ fontSize: 68, margin: "15px 0" }}>
          Lost your way?
        </h1>
        <p className="muted">
          That page doesn&apos;t exist. Come back to the collection.
        </p>
        <Link href="/" className="button button-dark" style={{ marginTop: 22 }}>
          Return home <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
