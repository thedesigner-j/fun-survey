// The Webflow pages the survey and admin are embedded on. Links and auth emails point here,
// so nobody lands on the hosting URL. Leave empty to fall back to this app's own pages.
export const SURVEY_PAGE_URL = ''
export const ADMIN_PAGE_URL = ''

// Where this app is hosted, used in the embed codes. Set it once a custom domain is connected in Vercel.
export const APP_URL = ''

export const appUrl = APP_URL || window.location.origin
export const surveyPage = SURVEY_PAGE_URL || '/'
export const adminPage = ADMIN_PAGE_URL || `${appUrl}/admin`
