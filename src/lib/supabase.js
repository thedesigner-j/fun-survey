import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && key)

// Invite and password-reset emails land with "#...type=invite" or "type=recovery" in the URL.
// Read it before the client consumes the hash, so the admin can ask for a new password.
export const authLinkType = new URLSearchParams(window.location.hash.slice(1)).get('type')

// Those links point at the site root (the survey), so move them to the admin first.
if ((authLinkType === 'invite' || authLinkType === 'recovery') && !window.location.pathname.startsWith('/admin')) {
  window.history.replaceState(null, '', '/admin' + window.location.hash)
}

export const supabase = isConfigured ? createClient(url, key) : null
