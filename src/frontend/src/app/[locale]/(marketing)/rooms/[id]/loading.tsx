import { Skeleton } from '@/components/ui/skeleton';

export default function RoomDetailLoading() {
  return (
    <div className="pt-16 pb-24 min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-5xl mx-auto px-4">
        <Skeleton className="aspect-video rounded-[12px] mb-6" />
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
          <div className="hidden lg:block">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
