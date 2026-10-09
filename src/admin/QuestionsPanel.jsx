import { useEffect, useState } from 'react'
import { Reorder, useDragControls } from 'motion/react'
import { supabase } from '../lib/supabase.js'
import { QUESTION_TYPES } from '../lib/constants.js'
import { questionCard } from '../lib/cards.js'
import { Illustration } from '../illustrations/index.jsx'
import IllustrationPicker from './IllustrationPicker.jsx'
import ColorPicker from './ColorPicker.jsx'
import CardPreview from './CardPreview.jsx'

const EDITABLE = ['type', 'section', 'title', 'subtitle', 'options', 'illustration', 'color', 'required', 'active']

function QuestionRow({ question, number, selected, onSelect, onToggle, onDragEnd }) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={question}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className={`q-row ${selected ? 'is-selected' : ''} ${question.active ? '' : 'is-hidden'}`}
      whileDrag={{ scale: 1.03, boxShadow: '0 12px 30px rgba(29,26,47,.18)' }}
    >
      <span className="q-handle" onPointerDown={(e) => controls.start(e)} title="Drag to reorder">
        ⋮⋮
      </span>
      <button type="button" className="q-row-main" onClick={onSelect}>
        <span className="q-thumb" style={{ background: question.color }}>
          <Illustration value={question.illustration} />
        </span>
        <span className="q-row-text">
          <span className="q-row-title">
            {number}. {question.title}
          </span>
          <span className="q-row-type">
            {QUESTION_TYPES[question.type]?.emoji} {QUESTION_TYPES[question.type]?.label}
            {!question.active && ' · hidden'}
          </span>
        </span>
      </button>
      <label className="toggle" title={question.active ? 'Showing in survey' : 'Hidden from survey'}>
        <input type="checkbox" checked={question.active} onChange={onToggle} />
        <span />
      </label>
    </Reorder.Item>
  )
}

function OptionsEditor({ type, options, onChange }) {
  if (type === 'slider') {
    const [min = '', max = ''] = options
    return (
      <div className="field-row">
        <label className="field">
          Left label (0)
          <input value={min} onChange={(e) => onChange([e.target.value, max])} placeholder="Not at all" />
        </label>
        <label className="field">
          Right label (10)
          <input value={max} onChange={(e) => onChange([min, e.target.value])} placeholder="Absolutely" />
        </label>
      </div>
    )
  }
  if (type !== 'single' && type !== 'multi') return null

  const update = (i, v) => onChange(options.map((o, j) => (j === i ? v : o)))
  return (
    <div className="field">
      Answer options
      <div className="options-list">
        {options.map((option, i) => (
          <div key={i} className="option-row">
            <span className="option-key">{i + 1}</span>
            <input value={option} onChange={(e) => update(i, e.target.value)} placeholder={`Option ${i + 1}`} />
            <button
              type="button"
              className="a-btn a-btn--icon"
              onClick={() => onChange(options.filter((_, j) => j !== i))}
              aria-label="Remove option"
            >
              ×
            </button>
          </div>
        ))}
        {options.length < 9 && (
          <button type="button" className="a-btn a-btn--dashed" onClick={() => onChange([...options, ''])}>
            + Add option
          </button>
        )}
      </div>
    </div>
  )
}

export default function QuestionsPanel() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  const selected = questions.find((q) => q.id === selectedId)
  const dirty = Boolean(draft && selected && EDITABLE.some((k) => JSON.stringify(draft[k]) !== JSON.stringify(selected[k])))

  const load = async () => {
    const { data, error } = await supabase.from('questions').select('*').order('position')
    if (error) setStatus(error.message)
    setQuestions(data ?? [])
    setLoading(false)
    return data ?? []
  }

  useEffect(() => {
    load().then((rows) => {
      if (rows[0]) {
        setSelectedId(rows[0].id)
        setDraft(rows[0])
      }
    })
  }, [])

  const select = (q) => {
    if (dirty && !confirm('You have unsaved changes. Discard them?')) return
    setSelectedId(q.id)
    setDraft(q)
    setStatus('')
  }

  const patch = (fields) => setDraft((d) => ({ ...d, ...fields }))

  const changeType = (type) => {
    const needsOptions = type === 'single' || type === 'multi'
    let options = draft.options
    if (needsOptions && options.length < 2) options = ['Option A', 'Option B']
    if (type === 'slider') options = ['Not at all', 'Absolutely']
    if (type === 'rating' || type === 'text') options = []
    patch({ type, options })
  }

  const save = async () => {
    setSaving(true)
    const fields = Object.fromEntries(EDITABLE.map((k) => [k, draft[k]]))
    fields.options = fields.options.map((o) => o.trim()).filter(Boolean)
    const { data, error } = await supabase.from('questions').update(fields).eq('id', draft.id).select().single()
    setSaving(false)
    if (error) {
      setStatus(error.message)
      return
    }
    setQuestions((qs) => qs.map((q) => (q.id === data.id ? data : q)))
    setDraft(data)
    setStatus('Saved ✓')
    setTimeout(() => setStatus(''), 2000)
  }

  const create = async (base) => {
    if (dirty && !confirm('You have unsaved changes. Discard them?')) return
    const position = Math.max(0, ...questions.map((q) => q.position)) + 1
    const row = base
      ? { ...Object.fromEntries(EDITABLE.map((k) => [k, base[k]])), title: `${base.title} (copy)`, position }
      : { position, title: 'New question', type: 'single', options: ['Option A', 'Option B'] }
    const { data, error } = await supabase.from('questions').insert(row).select().single()
    if (error) {
      setStatus(error.message)
      return
    }
    setQuestions((qs) => [...qs, data])
    setSelectedId(data.id)
    setDraft(data)
  }

  const remove = async () => {
    if (!confirm(`Delete “${selected.title}”? This can't be undone.`)) return
    const { error } = await supabase.from('questions').delete().eq('id', selected.id)
    if (error) {
      setStatus(error.message)
      return
    }
    const rest = questions.filter((q) => q.id !== selected.id)
    setQuestions(rest)
    setSelectedId(rest[0]?.id ?? null)
    setDraft(rest[0] ?? null)
  }

  const toggleActive = async (q) => {
    const active = !q.active
    setQuestions((qs) => qs.map((x) => (x.id === q.id ? { ...x, active } : x)))
    if (draft?.id === q.id) patch({ active })
    await supabase.from('questions').update({ active }).eq('id', q.id)
  }

  const saveOrder = async () => {
    const changed = questions.map((q, i) => ({ ...q, position: i + 1 })).filter((q, i) => questions[i].position !== q.position)
    if (!changed.length) return
    setQuestions((qs) => qs.map((q, i) => ({ ...q, position: i + 1 })))
    await Promise.all(changed.map((q) => supabase.from('questions').update({ position: q.position }).eq('id', q.id)))
  }

  if (loading) return <p className="admin-empty">Loading questions…</p>

  return (
    <div className="q-layout">
      <aside className="q-list">
        <div className="panel-head">
          <h2>Questions</h2>
          <button className="a-btn a-btn--primary" onClick={() => create()}>
            + New
          </button>
        </div>
        {questions.length === 0 && <p className="admin-empty">No questions yet. Add your first one!</p>}
        <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="q-rows">
          {questions.map((q, i) => (
            <QuestionRow
              key={q.id}
              question={q}
              number={i + 1}
              selected={q.id === selectedId}
              onSelect={() => select(q)}
              onToggle={() => toggleActive(q)}
              onDragEnd={saveOrder}
            />
          ))}
        </Reorder.Group>
        <p className="field-help">Drag ⋮⋮ to reorder. Toggle to hide a question without deleting it.</p>
      </aside>

      {draft ? (
        <section className="q-editor">
          <div className="panel-head">
            <h2>Edit question</h2>
            <div className="panel-head-actions">
              <button className="a-btn a-btn--ghost" onClick={() => create(draft)}>
                Duplicate
              </button>
              <button className="a-btn a-btn--danger" onClick={remove}>
                Delete
              </button>
            </div>
          </div>

          <div className="field">
            Question type
            <div className="type-tabs">
              {Object.entries(QUESTION_TYPES).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  className={draft.type === key ? 'is-active' : ''}
                  onClick={() => changeType(key)}
                >
                  <span>{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            Section <span className="field-optional">optional</span>
            <input
              value={draft.section ?? ''}
              onChange={(e) => patch({ section: e.target.value })}
              maxLength={60}
              placeholder="e.g. 01 · The Golden Arrival"
            />
          </label>
          <label className="field">
            Question
            <input value={draft.title} onChange={(e) => patch({ title: e.target.value })} maxLength={140} />
          </label>
          <label className="field">
            Helper text <span className="field-optional">optional</span>
            <input value={draft.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} maxLength={200} />
          </label>

          <OptionsEditor type={draft.type} options={draft.options} onChange={(options) => patch({ options })} />

          <div className="field">
            Illustration
            <IllustrationPicker value={draft.illustration} onChange={(illustration) => patch({ illustration })} />
          </div>

          <div className="field">
            Card color
            <ColorPicker value={draft.color} onChange={(color) => patch({ color })} />
          </div>

          <div className="field-row field-row--checks">
            <label className="check">
              <input type="checkbox" checked={draft.required} onChange={(e) => patch({ required: e.target.checked })} />
              Answer required
            </label>
            <label className="check">
              <input type="checkbox" checked={draft.active} onChange={(e) => patch({ active: e.target.checked })} />
              Show in survey
            </label>
          </div>

          <div className="save-bar">
            <span className="save-status">{status || (dirty ? 'Unsaved changes' : '')}</span>
            <button className="a-btn" disabled={!dirty} onClick={() => setDraft(selected)}>
              Reset
            </button>
            <button className="a-btn a-btn--primary" disabled={!dirty || saving} onClick={save}>
              {saving ? 'Saving…' : 'Save question'}
            </button>
          </div>
        </section>
      ) : (
        <section className="q-editor">
          <p className="admin-empty">Select or create a question to edit it.</p>
        </section>
      )}

      <aside className="q-preview">
        <h2>Live preview</h2>
        {draft && <CardPreview card={questionCard(draft)} />}
      </aside>
    </div>
  )
}
