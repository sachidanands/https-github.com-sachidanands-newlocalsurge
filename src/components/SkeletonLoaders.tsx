import React, { useState } from 'react';

/**
 * Single blog card shimmer skeleton matching the blog grid card layout
 */
export function BlogCardSkeleton() {
  return (
    <div className="bg-white border border-[#dfded4] rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between">
      <div>
        {/* Shimmer Image Box */}
        <div className="h-44 w-full relative overflow-hidden border-b border-[#dfded4] bg-[#edeae1] animate-shimmer">
          <div className="absolute top-3.5 left-3.5 w-20 h-4 rounded bg-[#dfdbce]/80 animate-shimmer" />
        </div>

        {/* Shimmer Content */}
        <div className="p-5.5 space-y-3">
          {/* Read time */}
          <div className="w-16 h-3 rounded bg-[#edeae1] animate-shimmer" />

          {/* Title lines */}
          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-[#edeae1] animate-shimmer" />
            <div className="w-3/4 h-4 rounded bg-[#edeae1] animate-shimmer" />
          </div>

          {/* Excerpt lines */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-3 rounded bg-[#edeae1]/70 animate-shimmer" />
            <div className="w-5/6 h-3 rounded bg-[#edeae1]/70 animate-shimmer" />
            <div className="w-2/3 h-3 rounded bg-[#edeae1]/70 animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Shimmer Footer details */}
      <div className="p-5.5 pt-0 border-t border-[#dfded4]/60 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#edeae1] animate-shimmer" />
          <div className="space-y-1">
            <div className="w-20 h-2.5 rounded bg-[#edeae1] animate-shimmer" />
            <div className="w-14 h-2 rounded bg-[#edeae1]/60 animate-shimmer" />
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-[#edeae1] animate-shimmer" />
      </div>
    </div>
  );
}

/**
 * Grid of 8 blog card skeletons for pagination and filter transitions
 */
export function BlogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Featured top banner shimmer skeleton
 */
export function BlogFeaturedSkeleton() {
  return (
    <div className="bg-white border border-[#dfded4] rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-7 h-64 sm:h-80 lg:h-96 bg-[#edeae1] animate-shimmer" />
      <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="w-28 h-4 rounded bg-[#edeae1] animate-shimmer" />
          <div className="space-y-2.5">
            <div className="w-full h-6 rounded bg-[#edeae1] animate-shimmer" />
            <div className="w-4/5 h-6 rounded bg-[#edeae1] animate-shimmer" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="w-full h-3.5 rounded bg-[#edeae1]/70 animate-shimmer" />
            <div className="w-full h-3.5 rounded bg-[#edeae1]/70 animate-shimmer" />
            <div className="w-3/4 h-3.5 rounded bg-[#edeae1]/70 animate-shimmer" />
          </div>
        </div>
        <div className="border-t border-[#dfded4] pt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#edeae1] animate-shimmer" />
            <div className="space-y-1.5">
              <div className="w-24 h-3 rounded bg-[#edeae1] animate-shimmer" />
              <div className="w-16 h-2.5 rounded bg-[#edeae1]/60 animate-shimmer" />
            </div>
          </div>
          <div className="w-24 h-8 rounded-full bg-[#edeae1] animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full blog article page shimmer skeleton
 */
export function BlogArticleSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Back button */}
      <div className="w-32 h-9 rounded-full bg-[#edeae1] animate-shimmer" />

      {/* Article Header */}
      <div className="space-y-4">
        <div className="w-28 h-5 rounded-full bg-[#edeae1] animate-shimmer" />
        <div className="w-full h-9 rounded bg-[#edeae1] animate-shimmer" />
        <div className="w-4/5 h-9 rounded bg-[#edeae1] animate-shimmer" />

        {/* Author box */}
        <div className="flex items-center gap-4.5 p-4.5 bg-[#faf9f6] rounded-2xl border border-[#e5e3da]/70">
          <div className="w-10 h-10 rounded-full bg-[#edeae1] animate-shimmer" />
          <div className="flex-grow space-y-2">
            <div className="w-32 h-3.5 rounded bg-[#edeae1] animate-shimmer" />
            <div className="w-24 h-2.5 rounded bg-[#edeae1]/60 animate-shimmer" />
          </div>
          <div className="w-20 h-3 rounded bg-[#edeae1]/70 animate-shimmer" />
        </div>
      </div>

      {/* Hero Image */}
      <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-[#edeae1] border border-[#dfded4] animate-shimmer" />

      {/* Executive summary box */}
      <div className="p-5 bg-[#edeae1]/40 border border-[#dfded4] rounded-2xl space-y-3">
        <div className="w-44 h-4 rounded bg-[#edeae1] animate-shimmer" />
        <div className="space-y-2">
          <div className="w-full h-3 rounded bg-[#edeae1] animate-shimmer" />
          <div className="w-5/6 h-3 rounded bg-[#edeae1] animate-shimmer" />
        </div>
      </div>

      {/* Body paragraphs */}
      <div className="space-y-4 pt-4">
        <div className="w-full h-3.5 rounded bg-[#edeae1]/80 animate-shimmer" />
        <div className="w-full h-3.5 rounded bg-[#edeae1]/80 animate-shimmer" />
        <div className="w-4/5 h-3.5 rounded bg-[#edeae1]/80 animate-shimmer" />
        <div className="w-2/3 h-3.5 rounded bg-[#edeae1]/80 animate-shimmer" />
      </div>
    </div>
  );
}

/**
 * Universal full-page skeleton for React Suspense fallback during route transitions
 */
export function PageSkeleton() {
  return (
    <div className="min-h-[75vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Hero section skeleton */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="w-36 h-6 rounded-full bg-[#edeae1] animate-shimmer mx-auto" />
        <div className="space-y-3">
          <div className="w-full h-10 sm:h-12 rounded-xl bg-[#edeae1] animate-shimmer" />
          <div className="w-4/5 h-10 sm:h-12 rounded-xl bg-[#edeae1] animate-shimmer mx-auto" />
        </div>
        <div className="w-3/5 h-4 rounded bg-[#edeae1]/70 animate-shimmer mx-auto" />
        <div className="flex justify-center gap-4 pt-2">
          <div className="w-40 h-11 rounded-full bg-[#edeae1] animate-shimmer" />
          <div className="w-32 h-11 rounded-full bg-[#edeae1]/60 animate-shimmer" />
        </div>
      </div>

      {/* Feature / stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#dfded4] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#edeae1] animate-shimmer" />
            <div className="w-32 h-5 rounded bg-[#edeae1] animate-shimmer" />
            <div className="space-y-2">
              <div className="w-full h-3 rounded bg-[#edeae1]/70 animate-shimmer" />
              <div className="w-4/5 h-3 rounded bg-[#edeae1]/70 animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * High-performance image with shimmer placeholder until loaded
 */
export function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  className = '',
  fetchPriority,
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer'
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 bg-[#edeae1] animate-shimmer z-0" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        referrerPolicy={referrerPolicy}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
