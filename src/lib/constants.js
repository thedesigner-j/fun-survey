export const CARD_COLORS = [
  '#FFC72C', '#FFE08A', '#FFF1C7', '#DA291C',
  '#FFCFC9', '#F5DEB8', '#DDF0D5', '#FFFFFF',
]

export const QUESTION_TYPES = {
  single: { label: 'Pick one', emoji: '👆' },
  multi: { label: 'Pick many', emoji: '✅' },
  rating: { label: 'Emoji rating', emoji: '😍' },
  slider: { label: 'Slider 0–10', emoji: '🎚️' },
  text: { label: 'Free text', emoji: '✍️' },
  flight: { label: 'Flight', emoji: '✈️' },
}

export const RATING_FACES = ['😫', '😕', '😐', '🙂', '😍']

export const SLIDER_FACES = ['🥶', '😬', '😐', '🙂', '😄', '🤩']

export function isAnswered(question, value) {
  switch (question.type) {
    case 'multi':
      return Array.isArray(value) && value.length > 0
    case 'flight':
      return Boolean(value?.when && value.airline?.trim() && value.flight?.trim())
    case 'text':
      return typeof value === 'string' && value.trim().length > 0
    default:
      return value !== undefined && value !== null
  }
}

// "2026-11-03T14:30" → "Tue, Nov 3, 2:30 PM". Read as wall-clock time, so it shows the same everywhere.
export function formatWhen(when) {
  if (!when) return ''
  const [date, time = '00:00'] = when.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m - 1, d, h, min).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatAnswer(a) {
  if (Array.isArray(a)) return a.join(', ')
  if (a === undefined || a === null) return ''
  if (typeof a === 'object') return [formatWhen(a.when), a.airline, a.flight].filter(Boolean).join(' · ')
  return String(a)
}
