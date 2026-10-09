// The Webflow page the survey (and its admin) is embedded on. Password-reset and invite emails
// land here, so nobody is sent to the hosting URL. Leave empty to fall back to this app's own admin.
export const PAGE_URL = 'https://www.believeinnext.com/burson-travel-survey'

// Where this app is hosted, used in the embed code. Set it once a custom domain is connected in Vercel.
export const APP_URL = ''

export const appUrl = APP_URL || window.location.origin
export const authRedirect = PAGE_URL || `${appUrl}/admin`

// Tells the Webflow page which view is showing, so its embed script can resize the frame.
export function announceView(view) {
  if (window.parent !== window) window.parent.postMessage({ type: 'fun-survey:view', view }, '*')
}
