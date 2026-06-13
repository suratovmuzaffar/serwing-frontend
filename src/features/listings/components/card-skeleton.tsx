export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/5] skeleton" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/2 rounded skeleton" />
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="h-4 w-1/3 rounded skeleton" />
      </div>
    </div>
  );
}

export default CardSkeleton;
