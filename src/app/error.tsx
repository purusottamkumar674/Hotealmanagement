"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container content-shell">
      <div className="empty-state">
        <h1 className="serif">We couldn&apos;t load this page</h1>
        <p>Please try again in a moment.</p>
        <button className="button button-dark" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
