function Bone({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ''}`} />
}

export default function AnaliticaLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Bone className="h-8 w-36" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Bone key={i} className="h-24" />)}
      </div>
      <Bone className="h-72" />
      <div className="grid grid-cols-2 gap-4">
        <Bone className="h-32" />
        <Bone className="h-32" />
      </div>
    </div>
  )
}
