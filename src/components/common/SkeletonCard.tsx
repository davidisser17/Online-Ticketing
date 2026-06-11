export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {/* Image area */}
      <div className="h-48 bg-gray-200" />

      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        {/* Subtitle / venue */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        {/* Date */}
        <div className="h-4 bg-gray-200 rounded w-2/5" />
        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}
