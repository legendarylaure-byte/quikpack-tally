"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: unknown; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background: "#FAFBF7",
        color: "#123F35",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "520px" }}>
        <h1 style={{ fontSize: "32px", margin: "0 0 16px" }}>Something went wrong.</h1>
        <p style={{ margin: "0 0 24px", lineHeight: 1.6 }}>
          Please try again. If the problem continues, contact the QUIKPACK team on WhatsApp.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#145A4A",
              border: 0,
              borderRadius: "10px",
              color: "#fff",
              cursor: "pointer",
              font: "inherit",
              fontWeight: 700,
              padding: "12px 18px",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              border: "2px solid #145A4A",
              borderRadius: "10px",
              color: "#145A4A",
              display: "inline-flex",
              alignItems: "center",
              font: "inherit",
              fontWeight: 700,
              padding: "10px 16px",
              textDecoration: "none",
            }}
          >
            Back to website
          </Link>
        </div>
      </div>
    </main>
  );
}
