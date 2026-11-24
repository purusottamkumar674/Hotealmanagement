"use client";
import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api("auth/session")
      .then(() => {
        if (active) {
          router.replace("/admin");
          router.refresh();
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [router]);
  return (
    <form
      className="form-card"
      style={{ maxWidth: 520, margin: "30px auto 90px" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          await api("auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: f.get("email"),
              password: f.get("password"),
            }),
          });
          await api("auth/session");
          router.replace("/admin");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Sign-in failed.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Welcome back</h2>
      <p>
        Use your Supabase staff account. Property access is assigned by the
        group administrator.
      </p>
      <div className="form-grid one">
        <label className="form-label">
          Email
          <input
            autoComplete="username"
            className="form-control"
            name="email"
            type="email"
            required
          />
        </label>
        <label className="form-label">
          Password
          <input
            autoComplete="current-password"
            className="form-control"
            name="password"
            type="password"
            required
          />
        </label>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-dark" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
