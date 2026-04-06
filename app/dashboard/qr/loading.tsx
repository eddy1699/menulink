function Bone({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ''}`} />
}

export default function Loading() {
  return (
    <div className="space-y-6 max-w-lg">
      <Bone className="h-8 w-32" />
      <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: 'var(--brand-border)' }}>
        <div className="p-8 flex flex-col items-center gap-4">
          <Bone className="w-52 h-52" />
          <Bone className="h-10 w-full" />
          <Bone className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
