export function DashboardSkeleton() {
  return (
    <div className="mk-dashboard mk-dashboard--loading" aria-busy="true" aria-label="Loading dashboard">
      <div className="mk-skeleton mk-skeleton--hero" />
      <div className="mk-skeleton-grid">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="mk-skeleton mk-skeleton--card" key={index} />
        ))}
      </div>
      <div className="mk-skeleton-grid mk-skeleton-grid--wide">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="mk-skeleton mk-skeleton--tile" key={index} />
        ))}
      </div>
    </div>
  );
}
