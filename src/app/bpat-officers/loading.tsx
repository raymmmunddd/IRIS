import { BpatSidebar } from "@/components/bpat/sidebar";
import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function BpatLoading() {
  return (
    <div className="flex min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden">
      <BpatSidebar />
      <main
        role="status"
        aria-label="Loading BPAT page"
        aria-busy="true"
        className="min-w-0 flex-1 p-4 pt-16 sm:p-6 sm:pt-16 lg:min-h-0 lg:overflow-y-auto lg:p-8"
      >
        <div className="hidden lg:block">
          <PageHeaderSkeleton />
        </div>
        <div className="mx-auto w-full max-w-md space-y-4 pt-3 lg:max-w-6xl lg:pt-0">
          <Skeleton className="h-9 w-2/3 lg:hidden" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton
                key={item}
                className={`h-24 w-full ${item === 2 ? "col-span-2 sm:col-span-1" : ""}`}
              />
            ))}
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
            <div className="min-w-0 space-y-3">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 w-full" />)}
            </div>
            <div className="min-w-0 space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
