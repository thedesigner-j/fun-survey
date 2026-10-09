import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { ILLUSTRATIONS, Illustration } from '../illustrations/index.jsx'

const BUCKET = 'illustrations'

export default function IllustrationPicker({ value, onChange }) {
  const [uploads, setUploads] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef()

  const loadUploads = async () => {
    const { data } = await supabase.storage.from(BUCKET).list('', { sortBy: { column: 'created_at', order: 'desc' } })
    setUploads(
      (data ?? [])
        .filter((f) => f.id)
        .map((f) => ({ name: f.name, url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl })),
    )
  }

  useEffect(() => {
    loadUploads()
  }, [])

  const upload = async (file) => {
    if (!file) return
    setBusy(true)
    setError('')
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: err } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    onChange(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
    loadUploads()
  }

  const remove = async (name, url) => {
    if (!confirm('Delete this image? Cards using it will show a placeholder.')) return
    await supabase.storage.from(BUCKET).remove([name])
    if (value === url) onChange('fries')
    loadUploads()
  }

  return (
    <div className="picker">
      <div className="picker-grid">
        {Object.entries(ILLUSTRATIONS).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            title={label}
            className={`picker-item ${value === key ? 'is-selected' : ''}`}
            onClick={() => onChange(key)}
          >
            <Illustration value={key} />
          </button>
        ))}
        {uploads.map((u) => (
          <div key={u.name} className={`picker-item picker-item--upload ${value === u.url ? 'is-selected' : ''}`}>
            <button type="button" onClick={() => onChange(u.url)} title="Use this image">
              <Illustration value={u.url} />
            </button>
            <button type="button" className="picker-delete" onClick={() => remove(u.name, u.url)} title="Delete image">
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="picker-item picker-upload"
          onClick={() => fileInput.current.click()}
          disabled={busy}
        >
          {busy ? '…' : '+ Upload'}
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
        hidden
        onChange={(e) => {
          upload(e.target.files[0])
          e.target.value = ''
        }}
      />
      <p className="field-help">PNG, JPG, GIF, WebP or SVG up to 5 MB. Transparent backgrounds look best.</p>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
