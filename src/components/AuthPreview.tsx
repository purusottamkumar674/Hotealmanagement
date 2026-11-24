"use client";
import { ArrowRight, Info, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { demoMode } from "@/lib/platform";
import { useState } from "react";
export function AuthPreview({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const titles = {
    login: "Welcome back.",
    signup: "Join our collection.",
    forgot: "Reset your password.",
  };
  if (!demoMode)
    return (
      <main className="container content-shell">
        <section className="section">
          <h1 className="serif">Plan your stay</h1>
          <p>
            Book as a guest and manage your reservation with a private access
            code.
          </p>
          <div className="property-actions">
            <Link href="/search" className="button button-dark">
              Find accommodation
            </Link>
            <Link href="/booking/manage" className="button button-outline">
              Manage reservation
            </Link>
            <Link href="/admin-login" className="text-link">
              Staff sign in
            </Link>
          </div>
        </section>
      </main>
    );
  return (
    <main className="container" style={{ minHeight: "64vh" }}>
      <div className="demo-page-head" style={{ textAlign: "center" }}>
        <span className="eyebrow">CUSTOMER ACCOUNT</span>
        <h1 className="serif">{titles[mode]}</h1>
        <p style={{ margin: "10px auto" }}>
          Secure account functionality will be enabled after connecting Supabase
          Auth.
        </p>
      </div>
      <div
        className="admin-card"
        style={{ maxWidth: 460, margin: "20px auto 30px" }}
      >
        <div className="notice info" style={{ marginBottom: 24 }}>
          <Info size={16} /> Account sign-in is not available in the
          frontend-only preview.
        </div>
        <div className="form-grid one">
          <label className="form-label">
            Email address
            <input
              className="form-control"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {mode !== "forgot" && (
            <label className="form-label">
              Password
              <input
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          <button className="button button-dark" disabled type="button">
            {mode === "login"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Send reset link"}{" "}
            <LockKeyhole size={15} />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 18,
            marginTop: 22,
            fontSize: 12,
          }}
        >
          <Link href="/login">Sign in</Link>
          <Link href="/signup">Create account</Link>
          <Link href="/forgot-password">Reset password</Link>
        </div>
      </div>
      <div style={{ textAlign: "center", marginBottom: 75 }}>
        <Link className="text-link" href="/search">
          Continue as guest (demo) <ArrowRight size={15} />
        </Link>
      </div>
    </main>
  );
}
