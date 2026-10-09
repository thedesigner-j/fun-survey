import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { introCard, outroCard } from '../lib/cards.js'
import IllustrationPicker from './IllustrationPicker.jsx'
import ColorPicker from './ColorPicker.jsx'
import CardPreview from './CardPreview.jsx'

const FIELDS = {
  intro: [
    ['intro_title', 'Title', 80],
    ['intro_subtitle', 'Message', 240],
    ['intro_button', 'Button text', 30],
  ],
  outro: [
    ['outro_title', 'Title', 80],
    ['outro_subtitle', 'Message', 240],
  ],
}

export default function SettingsPanel() {
  const [saved, setSaved] = useState(null)
  const [draft, setDraft] = useState(null)
  const [which, setWhich] = useState('intro')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (error) setStatus(error.message)
        setSaved(data)
        setDraft(data)
      })
  }, [])

  if (!draft) return <p className="admin-empty">{status || 'Loading…'}</p>

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const patch = (fields) => setDraft((d) => ({ ...d, ...fields }))

  const save = async () => {
    setSaving(true)
    const { id, ...fields } = draft
    const { data, error } = await supabase.from('settings').update(fields).eq('id', id).select().single()
    setSaving(false)
    if (error) {
      setStatus(error.message)
      return
    }
    setSaved(data)
    setDraft(data)
    setStatus('Saved ✓')
    setTimeout(() => setStatus(''), 2000)
  }

  const card = which === 'intro' ? introCard(draft) : outroCard(draft)

  return (
    <div className="q-layout q-layout--settings">
      <section className="q-editor">
        <div className="panel-head">
          <h2>Intro & thank-you cards</h2>
        </div>
        <div className="type-tabs type-tabs--two">
          <button className={which === 'intro' ? 'is-active' : ''} onClick={() => setWhich('intro')}>
            <span>👋</span>Intro card
          </button>
          <button className={which === 'outro' ? 'is-active' : ''} onClick={() => setWhich('outro')}>
            <span>🎉</span>Thank-you card
          </button>
        </div>

        {FIELDS[which].map(([key, label, max]) => (
          <label key={key} className="field">
            {label}
            {max > 100 ? (
              <textarea rows={3} value={draft[key]} maxLength={max} onChange={(e) => patch({ [key]: e.target.value })} />
            ) : (
              <input value={draft[key]} maxLength={max} onChange={(e) => patch({ [key]: e.target.value })} />
            )}
          </label>
        ))}

        <div className="field">
          Illustration
          <IllustrationPicker
            value={draft[`${which}_illustration`]}
            onChange={(v) => patch({ [`${which}_illustration`]: v })}
          />
        </div>

        <div className="field">
          Card color
          <ColorPicker value={draft[`${which}_color`]} onChange={(v) => patch({ [`${which}_color`]: v })} />
        </div>

        <div className="save-bar">
          <span className="save-status">{status || (dirty ? 'Unsaved changes' : '')}</span>
          <button className="a-btn" disabled={!dirty} onClick={() => setDraft(saved)}>
            Reset
          </button>
          <button className="a-btn a-btn--primary" disabled={!dirty || saving} onClick={save}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>

      <aside className="q-preview">
        <h2>Live preview</h2>
        <CardPreview card={card} />
      </aside>
    </div>
  )
}
