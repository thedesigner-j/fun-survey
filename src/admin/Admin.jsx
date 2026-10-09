import { useEffect, useState } from 'react'
import { supabase, isConfigured, authLinkType } from '../lib/supabase.js'
import QuestionsPanel from './QuestionsPanel.jsx'
import SettingsPanel from './SettingsPanel.jsx'
import ResponsesPanel from './ResponsesPanel.jsx'
import TeamPanel from './TeamPanel.jsx'
import EmbedPanel from './EmbedPanel.jsx'
import { Illustration } from '../illustrations/index.jsx'
import { adminPage, surveyPage } from '../lib/site.js'
import './admin.css'

const TABS = [
  { id: 'questions', label: 'Questions' },
  { id: 'settings', label: 'Intro & Thanks' },
  { id: 'responses', label: 'Responses' },
  { id: 'team', label: 'Team', ownerOnly: true },
  { id: 'embed', label: 'Embed' },
]

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const forgot = async () => {
    if (!email) {
      setError('Type your email above first.')
      return
    }
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: adminPage,
    })
    setBusy(false)
    if (err) setError(err.message)
    else setNotice('Check your email for a link to set a new password.')
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setBusy(false)
  }

  return (
    <div className="admin-center">
      <form className="login-card" onSubmit={submit}>
        <div className="login-art">
          <Illustration value="burger" />
        </div>
        <h1>Survey admin</h1>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        {notice && <p className="form-notice">{notice}</p>}
        <button className="a-btn a-btn--primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <button type="button" className="link-btn" onClick={forgot} disabled={busy}>
          Forgot password?
        </button>
      </form>
    </div>
  )
}

function SetPassword({ email, invited, onDone }) {
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirmPw) {
      setError("The passwords don't match.")
      return
    }
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (err) setError(err.message)
    else onDone()
  }

  return (
    <div className="admin-center">
      <form className="login-card" onSubmit={submit}>
        <div className="login-art">
          <Illustration value="fries" />
        </div>
        <h1>{invited ? 'Welcome aboard!' : 'Set a new password'}</h1>
        <p>
          {invited ? 'Pick a password' : 'Choose a new password'} for <b>{email}</b>. You'll use it to sign in to the
          survey admin.
        </p>
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label>
          Type it again
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="a-btn a-btn--primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save password'}
        </button>
        {!invited && (
          <button type="button" className="link-btn" onClick={onDone}>
            Cancel
          </button>
        )}
      </form>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState(undefined)
  // 'owner' | 'editor' | null (signed in, no access) | undefined (checking)
  const [role, setRole] = useState(undefined)
  const [tab, setTab] = useState('questions')
  const [passwordScreen, setPasswordScreen] = useState(
    authLinkType === 'invite' || authLinkType === 'recovery' ? authLinkType : null,
  )

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'PASSWORD_RECOVERY') setPasswordScreen('recovery')
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setRole(undefined)
      return
    }
    supabase.rpc('my_role').then(async ({ data, error }) => {
      if (!error) {
        setRole(data)
        return
      }
      // roles.sql hasn't been run yet: fall back to the original owner-only check.
      const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      setRole(admin ? 'owner' : null)
    })
  }, [session?.user.id])

  if (!isConfigured) {
    return (
      <div className="admin-center">
        <div className="login-card">
          <h1>Connect Supabase first</h1>
          <p>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file (locally)
            or to your Vercel project's environment variables, then reload.
          </p>
        </div>
      </div>
    )
  }

  if (session === undefined) return <div className="admin-center">Loading…</div>
  if (!session) return <Login />
  if (passwordScreen) {
    return (
      <SetPassword
        email={session.user.email}
        invited={passwordScreen === 'invite'}
        onDone={() => setPasswordScreen(null)}
      />
    )
  }
  if (role === undefined) return <div className="admin-center">Checking access…</div>

  if (!role) {
    return (
      <div className="admin-center">
        <div className="login-card">
          <h1>No access yet</h1>
          <p>
            You're signed in as <b>{session.user.email}</b>, but this email isn't on the team. Ask the survey owner to
            add it in the admin's <b>Team</b> tab, then sign in again.
          </p>
          <button className="a-btn" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-logo">
            <Illustration value="fries" />
          </span>
          Survey studio
        </div>
        <nav className="admin-tabs">
          {TABS.filter((t) => !t.ownerOnly || role === 'owner').map((t) => (
            <button key={t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="admin-actions">
          <a className="a-btn" href={surveyPage} target="_blank" rel="noreferrer">
            View survey ↗
          </a>
          <button className="a-btn a-btn--ghost" onClick={() => setPasswordScreen('change')}>
            Password
          </button>
          <button className="a-btn a-btn--ghost" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </header>
      <main className="admin-main">
        {tab === 'questions' && <QuestionsPanel />}
        {tab === 'settings' && <SettingsPanel />}
        {tab === 'responses' && <ResponsesPanel canDelete={role === 'owner'} />}
        {tab === 'team' && role === 'owner' && <TeamPanel ownerEmail={session.user.email} />}
        {tab === 'embed' && <EmbedPanel />}
      </main>
    </div>
  )
}
