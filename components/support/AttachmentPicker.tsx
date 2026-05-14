'use client'

import { useState, useRef } from 'react'
import { Paperclip, X, Loader2 } from 'lucide-react'

export interface Attachment {
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

interface Props {
  value: Attachment[]
  onChange: (next: Attachment[]) => void
  disabled?: boolean
  max?: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentPicker({ value, onChange, disabled, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePick = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (value.length + files.length > max) {
      setError(`Máximo ${max} archivos por mensaje`)
      return
    }
    setUploading(true)
    setError(null)
    const next = [...value]
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/support/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || `No se pudo subir ${file.name}`)
          continue
        }
        next.push({
          fileUrl: json.fileUrl,
          fileName: json.fileName,
          fileSize: json.fileSize,
          mimeType: json.mimeType,
        })
      } catch {
        setError(`Error de red al subir ${file.name}`)
      }
    }
    onChange(next)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading || value.length >= max}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-dark)' }}
      >
        {uploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Paperclip size={14} />
        )}
        {uploading ? 'Subiendo…' : 'Adjuntar archivo'}
        <span style={{ color: 'var(--brand-muted)' }}>
          ({value.length}/{max})
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,application/pdf,text/plain,application/zip"
        onChange={(e) => handlePick(e.target.files)}
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((a, i) => (
            <li
              key={`${a.fileUrl}-${i}`}
              className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-gray-50"
            >
              <Paperclip size={12} />
              <a
                href={a.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate flex-1 hover:underline"
                style={{ color: 'var(--brand-dark)' }}
              >
                {a.fileName}
              </a>
              <span style={{ color: 'var(--brand-muted)' }}>{formatBytes(a.fileSize)}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-1 hover:text-red-500"
                aria-label="Quitar"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null
  return (
    <div className="mt-2 space-y-1">
      {attachments.map((a) => {
        const isImage = a.mimeType.startsWith('image/')
        return (
          <div key={a.fileUrl} className="flex items-start gap-2 text-xs">
            {isImage ? (
              <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.fileUrl}
                  alt={a.fileName}
                  className="max-h-32 rounded border"
                  style={{ borderColor: 'var(--brand-border)' }}
                />
              </a>
            ) : (
              <a
                href={a.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50"
                style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-dark)' }}
              >
                <Paperclip size={12} />
                <span>{a.fileName}</span>
                <span style={{ color: 'var(--brand-muted)' }}>
                  ({formatBytes(a.fileSize)})
                </span>
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
