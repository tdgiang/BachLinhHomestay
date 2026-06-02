import { Skeleton } from '@/components/ui/skeleton';

export default function RoomsLoading() {
  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </aside>
          <main className="flex-1">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-[12px]" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
