// Used when Supabase isn't connected yet (no .env), so the survey can be previewed locally.

export const DEMO_SETTINGS = {
  intro_title: 'Hey, got a sec? 🍔',
  intro_subtitle: 'Five quick questions. Faster than the drive-thru, promise.',
  intro_button: "Let's go",
  intro_illustration: 'burger',
  intro_color: '#FFC72C',
  outro_title: 'Thanks a bunch!',
  outro_subtitle: 'Your answers are in. We read every single one.',
  outro_illustration: 'cone',
  outro_color: '#DA291C',
}

export const DEMO_QUESTIONS = [
  {
    id: 'demo-1', type: 'single', title: 'How did you find us?', subtitle: "Be honest, we won't be offended.",
    options: ['Social media', 'A friend told me', 'Google', 'Pure luck ✨'], illustration: 'fries', color: '#FFC72C', required: true,
  },
  {
    id: 'demo-2', type: 'rating', title: "How's your first impression?", subtitle: 'Tap the face that fits.',
    options: [], illustration: 'burger', color: '#FFF1C7', required: true,
  },
  {
    id: 'demo-3', type: 'multi', title: 'What are you most excited about?', subtitle: 'Pick as many as you like.',
    options: ['Speed', 'Design', 'Price', 'The vibes'], illustration: 'nuggets', color: '#DA291C', required: true,
  },
  {
    id: 'demo-4', type: 'slider', title: 'How likely are you to tell a friend?', subtitle: 'Slide it.',
    options: ['Nope', 'Already texting them'], illustration: 'drink', color: '#FFE08A', required: true,
  },
  {
    id: 'demo-5', type: 'text', title: 'Anything else on your mind?', subtitle: 'Ideas, wishes, hot takes — all welcome.',
    options: [], illustration: 'bag', color: '#F5DEB8', required: false,
  },
]
