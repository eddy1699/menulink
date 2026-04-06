function Bone({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ''}`} />
}

export default function AparienciaLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Bone className="h-8 w-36" />
      <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: 'var(--brand-border)' }}>
        <Bone className="h-14 rounded-none" />
        <div className="p-6 space-y-4">
          <Bone className="h-24 rounded-xl w-24" />
          <Bone className="h-10" />
          <Bone className="h-20" />
          <div className="grid grid-cols-2 gap-4">
            <Bone className="h-10" />
            <Bone className="h-10" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: 'var(--brand-border)' }}>
        <Bone className="h-14 rounded-none" />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Bone className="h-12" />
            <Bone className="h-12" />
          </div>
          <Bone className="h-28" />
        </div>
      </div>
    </div>
  )
}
