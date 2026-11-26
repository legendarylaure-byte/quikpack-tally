"use client";

export default function GlobalError({ reset }: { error: unknown; reset: () => void }) {
  return (
    <html lang="en-GH">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
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
          <p style={{ margin: "0 0 24px", lineHeight: 1.6 }}>Please reload the page and try again.</p>
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
        </div>
      </body>
    </html>
  );
}
