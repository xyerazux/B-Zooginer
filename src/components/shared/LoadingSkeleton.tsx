export function GroupCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-slate-200 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-10 bg-slate-200 rounded-md w-full pt-2" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200 w-full" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-5 bg-slate-200 rounded w-1/2 pt-1" />
        <div className="h-9 bg-slate-200 rounded-md w-full mt-2" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-200 rounded w-1/2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
        {[1, 2, 3, 4].map((n) => (
          <GroupCardSkeleton key={n} />
        ))}
      </div>
    </div>
  );
}
