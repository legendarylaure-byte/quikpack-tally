export default function Loading() {
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
      }}
      role="status"
      aria-live="polite"
    >
      Loading QUIKPACK…
    </main>
  );
}
