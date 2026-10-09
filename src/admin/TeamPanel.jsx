import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const projectRef = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/^https?:\/\//, '').split('.')[0]
const INVITE_PAGE = `https://supabase.com/dashboard/project/${projectRef}/auth/users`

export default function TeamPanel({ ownerEmail }) {
  const [editors, setEditors] = useState(null)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [justAdded, setJustAdded] = useState('')

  const load = async () => {
    const { data, error } = await supabase.from('editors').select('*').order('added_at')
    if (error) {
      setStatus(
        error.code === '42P01' || /editors/.test(error.message)
          ? 'Run supabase/roles.sql in the Supabase SQL Editor once to turn on the Team tab.'
          : error.message,
      )
      setEditors([])
      return
    }
    setEditors(data)
  }

  useEffect(() => {
    load()
  }, [])

  const add = async (e) => {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (clean === ownerEmail.toLowerCase()) {
      setStatus("That's you. You're already the owner.")
      return
    }
    setBusy(true)
    setStatus('')
    const { error } = await supabase.from('editors').insert({ email: clean })
    setBusy(false)
    if (error) {
      setStatus(error.code === '23505' ? 'That email is already on the team.' : error.message)
      return
    }
    setEmail('')
    setJustAdded(clean)
    load()
  }

  const remove = async (row) => {
    if (!confirm(`Remove ${row.email}? They'll lose access to the admin right away.`)) return
    const { error } = await supabase.from('editors').delete().eq('email', row.email)
    if (error) setStatus(error.message)
    if (justAdded === row.email) setJustAdded('')
    load()
  }

  return (
    <div className="team">
      <section className="q-editor">
        <div className="panel-head">
          <h2>Team</h2>
        </div>
        <p className="field-help">
          Editors can change questions, illustrations and the intro/thanks cards, and can view responses. Only you can
          manage the team and delete responses.
        </p>

        <ul className="team-list">
          <li>
            <span className="team-email">{ownerEmail}</span>
            <span className="team-role team-role--owner">Owner</span>
          </li>
          {editors?.map((row) => (
            <li key={row.email}>
              <span className="team-email">{row.email}</span>
              <span className="team-role">Editor</span>
              <button className="a-btn a-btn--icon" onClick={() => remove(row)} aria-label={`Remove ${row.email}`}>
                ×
              </button>
            </li>
          ))}
          {editors === null && <li className="admin-empty">Loading…</li>}
        </ul>

        <form className="team-add" onSubmit={add}>
          <label className="field">
            Add an editor
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button className="a-btn a-btn--primary" disabled={busy}>
            {busy ? 'Adding…' : 'Add'}
          </button>
        </form>
        {status && <p className="form-error">{status}</p>}

        {justAdded && (
          <div className="team-next">
            <b>One more step: send {justAdded} their invite email.</b>
            <ol>
              <li>
                Open{' '}
                <a href={INVITE_PAGE} target="_blank" rel="noreferrer">
                  Supabase → Authentication → Users ↗
                </a>
              </li>
              <li>
                Click <b>Add user → Send invitation</b>, enter <b>{justAdded}</b>, and send.
              </li>
              <li>They click the link in the email, pick a password, and they're in.</li>
            </ol>
            <p className="field-help">
              Already has a login? Skip this. They'll have access the next time they sign in.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
