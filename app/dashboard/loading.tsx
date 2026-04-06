function Bone({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ''}`} />
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-32" />
        </div>
        <Bone className="h-7 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Bone key={i} className="h-24" />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Bone className="h-48" />
        <Bone className="h-48" />
      </div>
    </div>
  )
}
