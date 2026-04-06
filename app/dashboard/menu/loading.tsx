function Bone({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ''}`} />
}

export default function MenuLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Bone className="h-8 w-40" />
        <Bone className="h-9 w-36" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
          <Bone className="h-14 rounded-none" />
          <div className="p-4 space-y-3 bg-white">
            {[1, 2, 3].map((j) => <Bone key={j} className="h-12" />)}
          </div>
        </div>
      ))}
    </div>
  )
}
