export default function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-px bg-border" />
        <div className="flex gap-4">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-20" />
        </div>
      </div>
    </div>
  );
}
