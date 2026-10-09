import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from '../lib/supabase.js'
import { RATING_FACES, formatAnswer, formatWhen } from '../lib/constants.js'
import { Illustration } from '../illustrations/index.jsx'

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const FLIGHT_PARTS = [
  ['when', 'Date & time'],
  ['airline', 'Airline'],
  ['flight', 'Flight #'],
]

// One column per answer; flight questions split into date, airline and flight number.
function cellValue(response, col) {
  const a = response.answers?.[col.id]?.a
  if (!col.part) return formatAnswer(a)
  const v = a?.[col.part] ?? ''
  return col.part === 'when' ? formatWhen(v) : v
}

function downloadCsv(columns, responses) {
  const escape = (v) => `"${String(v).replaceAll('"', '""')}"`
  const header = ['Submitted', ...columns.map((c) => (c.part ? `${c.title} — ${c.label}` : c.title))]
  const rows = responses.map((r) => [new Date(r.created_at).toISOString(), ...columns.map((c) => cellValue(r, c))])
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `survey-responses-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function Summary({ question, responses }) {
  const values = responses.map((r) => r.answers[question.id]?.a).filter((v) => v !== undefined && v !== '')

  if (question.type === 'single' || question.type === 'multi') {
    const counts = new Map(question.options.map((o) => [o, 0]))
    values.flat().forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1))
    const max = Math.max(1, ...counts.values())
    return (
      <div className="bars">
        {[...counts].map(([option, n]) => (
          <div key={option} className="bar">
            <span className="bar-label">{option}</span>
            <span className="bar-track">
              <motion.span
                className="bar-fill"
                style={{ background: question.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(n / max) * 100}%` }}
              />
            </span>
            <span className="bar-count">{n}</span>
          </div>
        ))}
      </div>
    )
  }

  if (question.type === 'rating' || question.type === 'slider') {
    const avg = values.length ? values.reduce((s, v) => s + Number(v), 0) / values.length : 0
    const max = question.type === 'rating' ? 5 : 10
    return (
      <div className="big-stat">
        <span className="big-stat-num">
          {question.type === 'rating' && values.length ? RATING_FACES[Math.round(avg) - 1] : ''} {avg.toFixed(1)}
        </span>
        <span className="big-stat-of">average out of {max}</span>
      </div>
    )
  }

  return (
    <ul className="quotes">
      {values.slice(0, 5).map((v, i) => (
        <li key={i}>“{formatAnswer(v)}”</li>
      ))}
      {values.length > 5 && <li className="quotes-more">+{values.length - 5} more in the table below</li>}
      {!values.length && <li className="quotes-more">No answers yet</li>}
    </ul>
  )
}

export default function ResponsesPanel({ canDelete }) {
  const [responses, setResponses] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [fresh, setFresh] = useState(new Set())

  useEffect(() => {
    Promise.all([
      supabase.from('responses').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('questions').select('*').order('position'),
    ]).then(([r, q]) => {
      setResponses(r.data ?? [])
      setQuestions(q.data ?? [])
      setLoading(false)
    })

    const channel = supabase
      .channel('responses-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses' }, ({ new: row }) => {
        setResponses((rs) => (rs.some((r) => r.id === row.id) ? rs : [row, ...rs]))
        setFresh((s) => new Set(s).add(row.id))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Current questions first (in order), then any answered questions that have since been deleted.
  const columns = useMemo(() => {
    const cols = []
    for (const q of questions) {
      const base = { id: q.id, title: q.title, section: q.section || '' }
      if (q.type === 'flight') FLIGHT_PARTS.forEach(([part, label]) => cols.push({ ...base, part, label }))
      else cols.push(base)
    }
    const known = new Set(questions.map((q) => q.id))
    for (const r of responses) {
      for (const [id, { q, a }] of Object.entries(r.answers ?? {})) {
        if (known.has(id)) continue
        known.add(id)
        const base = { id, title: q, section: 'Deleted questions' }
        if (a && typeof a === 'object' && !Array.isArray(a)) {
          FLIGHT_PARTS.forEach(([part, label]) => cols.push({ ...base, part, label }))
        } else cols.push(base)
      }
    }
    return cols
  }, [questions, responses])

  // Header bands: consecutive columns that share a section, then each question over its flight parts.
  const bands = useMemo(() => {
    const group = (key) =>
      columns.reduce((out, c) => {
        const last = out[out.length - 1]
        if (last && last.key === key(c)) last.span++
        else out.push({ key: key(c), col: c, span: 1 })
        return out
      }, [])
    return { sections: group((c) => c.section), questions: group((c) => c.id) }
  }, [columns])

  const hasSections = columns.some((c) => c.section)
  // Keep the first answer (the name) in view while scrolling sideways.
  const pinFirst = columns.length > 0 && !columns[0].part
  const [view, setView] = useState('table')
  const [open, setOpen] = useState(null)

  const remove = async (id) => {
    if (!confirm('Delete this response?')) return
    const { error } = await supabase.from('responses').delete().eq('id', id)
    if (!error) setResponses((rs) => rs.filter((r) => r.id !== id))
  }

  if (loading) return <p className="admin-empty">Loading responses…</p>

  const today = responses.filter((r) => new Date(r.created_at).toDateString() === new Date().toDateString()).length

  return (
    <div className="responses">
      <div className="stat-row">
        <div className="stat-card" style={{ background: '#FFC72C' }}>
          <span className="stat-num">{responses.length}</span>
          <span className="stat-label">total responses</span>
          <span className="stat-art">
            <Illustration value="fries" />
          </span>
        </div>
        <div className="stat-card" style={{ background: '#FFCFC9' }}>
          <span className="stat-num">{today}</span>
          <span className="stat-label">today</span>
          <span className="stat-art">
            <Illustration value="burger" />
          </span>
        </div>
        <div className="stat-card stat-card--live" style={{ background: '#FFF1C7' }}>
          <span className="live-dot" /> Live — new answers pop in automatically
        </div>
        <button
          className="a-btn a-btn--primary"
          onClick={() => downloadCsv(columns, responses)}
          disabled={!responses.length}
        >
          ⬇ Export CSV
        </button>
      </div>

      <div className="r-toolbar">
        <div className="type-tabs type-tabs--two">
          <button type="button" className={view === 'table' ? 'is-active' : ''} onClick={() => setView('table')}>
            Table
          </button>
          <button type="button" className={view === 'summary' ? 'is-active' : ''} onClick={() => setView('summary')}>
            Summary
          </button>
        </div>
        {view === 'table' && responses.length > 0 && (
          <span className="field-help">Click a row to read the whole response.</span>
        )}
      </div>

      {view === 'summary' && questions.length > 0 && (
        <div className="summary-grid">
          {questions.map((q) => (
            <div key={q.id} className="summary-card">
              <div className="summary-head">
                <span className="q-thumb" style={{ background: q.color }}>
                  <Illustration value={q.illustration} />
                </span>
                <h3>{q.title}</h3>
              </div>
              <Summary question={{ ...q, options: Array.isArray(q.options) ? q.options : [] }} responses={responses} />
            </div>
          ))}
        </div>
      )}

      {view === 'table' &&
        (responses.length === 0 ? (
          <p className="admin-empty">No responses yet. Share that survey! 🚀</p>
        ) : (
          <div className="table-wrap">
            <table className="r-table">
              <thead>
                {hasSections && (
                  <tr className="r-sections">
                    <th className="r-sticky" />
                    {bands.sections.map((b, i) => (
                      <th key={i} colSpan={b.span}>
                        <span>{b.key}</span>
                      </th>
                    ))}
                    <th />
                    <th />
                  </tr>
                )}
                <tr>
                  <th className="r-sticky">#</th>
                  {bands.questions.map((b, i) => (
                    <th
                      key={b.key}
                      colSpan={b.span}
                      rowSpan={b.col.part ? 1 : 2}
                      title={b.col.title}
                      className={i === 0 && pinFirst ? 'r-sticky r-sticky--name' : undefined}
                    >
                      <span className="r-head">{b.col.title}</span>
                    </th>
                  ))}
                  <th rowSpan={2}>Submitted</th>
                  <th rowSpan={2} aria-label="Actions" />
                </tr>
                <tr className="r-parts">
                  <th className="r-sticky" />
                  {columns.filter((c) => c.part).map((c) => (
                    <th key={c.id + c.part}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {responses.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      layout
                      className={fresh.has(r.id) ? 'is-fresh' : ''}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setOpen(r)}
                    >
                      <td className="r-sticky r-num">{responses.length - i}</td>
                      {columns.map((c, j) => (
                        <td
                          key={c.id + (c.part ?? '')}
                          className={c.part ? 'r-nowrap' : j === 0 && pinFirst ? 'r-sticky r-sticky--name' : ''}
                        >
                          <span className="r-clamp">{cellValue(r, c) || <span className="r-blank">—</span>}</span>
                        </td>
                      ))}
                      <td className="r-date">{formatDate(r.created_at)}</td>
                      <td>
                        {canDelete && (
                          <button
                            className="a-btn a-btn--icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              remove(r.id)
                            }}
                            aria-label="Delete response"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ))}

      <AnimatePresence>
        {open && (
          <motion.div
            className="r-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.aside
              className="r-drawer"
              initial={{ x: 40 }}
              animate={{ x: 0 }}
              exit={{ x: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="panel-head">
                <h2>Response</h2>
                <button className="a-btn a-btn--icon" onClick={() => setOpen(null)} aria-label="Close">
                  ×
                </button>
              </div>
              <p className="field-help">Submitted {formatDate(open.created_at)}</p>
              <dl className="r-detail">
                {bands.questions.map(({ col }) => {
                  const a = formatAnswer(open.answers?.[col.id]?.a)
                  return (
                    <div key={col.id}>
                      <dt>{col.title}</dt>
                      <dd>{a || <span className="r-blank">No answer</span>}</dd>
                    </div>
                  )
                })}
              </dl>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
