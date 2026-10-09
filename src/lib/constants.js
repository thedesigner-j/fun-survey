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
}

export const RATING_FACES = ['😫', '😕', '😐', '🙂', '😍']

export const SLIDER_FACES = ['🥶', '😬', '😐', '🙂', '😄', '🤩']

export function isAnswered(question, value) {
  switch (question.type) {
    case 'multi':
      return Array.isArray(value) && value.length > 0
    case 'text':
      return typeof value === 'string' && value.trim().length > 0
    default:
      return value !== undefined && value !== null
  }
}
