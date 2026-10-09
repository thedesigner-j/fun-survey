import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from '../lib/supabase.js'
import { RATING_FACES } from '../lib/constants.js'
import { Illustration } from '../illustrations/index.jsx'

const formatAnswer = (a) => {
  if (Array.isArray(a)) return a.join(', ')
  if (a === undefined || a === null) return ''
  return String(a)
}

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function downloadCsv(columns, responses) {
  const escape = (v) => `"${String(v).replaceAll('"', '""')}"`
  const header = ['Submitted', ...columns.map((c) => c.title)]
  const rows = responses.map((r) => [
    new Date(r.created_at).toISOString(),
    ...columns.map((c) => formatAnswer(r.answers[c.id]?.a)),
  ])
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
        <li key={i}>“{v}”</li>
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
    const cols = questions.map((q) => ({ id: q.id, title: q.title }))
    const known = new Set(cols.map((c) => c.id))
    for (const r of responses) {
      for (const [id, { q }] of Object.entries(r.answers ?? {})) {
        if (!known.has(id)) {
          known.add(id)
          cols.push({ id, title: `${q} (deleted)` })
        }
      }
    }
    return cols
  }, [questions, responses])

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

      {questions.length > 0 && (
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

      <h2 className="section-title">All responses</h2>
      {responses.length === 0 ? (
        <p className="admin-empty">No responses yet. Share that survey! 🚀</p>
      ) : (
        <div className="table-wrap">
          <table className="r-table">
            <thead>
              <tr>
                <th>Submitted</th>
                {columns.map((c) => (
                  <th key={c.id}>{c.title}</th>
                ))}
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {responses.map((r) => (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0, backgroundColor: '#fff3bf' }}
                    animate={{ opacity: 1, backgroundColor: fresh.has(r.id) ? '#fff9db' : 'rgba(255,255,255,0)' }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="r-date">{formatDate(r.created_at)}</td>
                    {columns.map((c) => (
                      <td key={c.id}>{formatAnswer(r.answers?.[c.id]?.a)}</td>
                    ))}
                    <td>
                      {canDelete && (
                        <button className="a-btn a-btn--icon" onClick={() => remove(r.id)} aria-label="Delete response">
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
      )}
    </div>
  )
}
