export const introCard = (s) => ({
  id: 'intro',
  kind: 'intro',
  title: s.intro_title,
  subtitle: s.intro_subtitle,
  button: s.intro_button,
  illustration: s.intro_illustration,
  color: s.intro_color,
})

export const outroCard = (s) => ({
  id: 'outro',
  kind: 'outro',
  title: s.outro_title,
  subtitle: s.outro_subtitle,
  illustration: s.outro_illustration,
  color: s.outro_color,
})

export const questionCard = (q) => ({
  ...q,
  kind: 'question',
  options: Array.isArray(q.options) ? q.options : [],
})
