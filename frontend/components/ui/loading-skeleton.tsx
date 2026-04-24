"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-secondary",
        className
      )}
    />
  );
}

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <LoadingSkeleton className="aspect-[2.5/3.5] w-full" />
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SetGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <LoadingSkeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: count / 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <LoadingSkeleton className="h-12 w-12 shrink-0" />
                <div className="flex-1 space-y-2">
                  <LoadingSkeleton className="h-4 w-full" />
                  <LoadingSkeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <LoadingSkeleton className="mb-3 h-6 w-3/4" />
          <LoadingSkeleton className="mb-2 h-4 w-1/2" />
          <LoadingSkeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function SetDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <LoadingSkeleton className="h-16 w-16" />
        <div className="space-y-2">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      
      {/* Cards grid skeleton */}
      <CardGridSkeleton count={18} />
    </div>
  );
}
