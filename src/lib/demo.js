// Used when Supabase isn't connected yet (no .env), so the survey can be previewed locally.
// Mirrors supabase/chicago-questions.sql.

export const DEMO_SETTINGS = {
  "intro_title": "Your Golden Ticket to Chicago 🎟️",
  "intro_subtitle": "Good things are coming. Great things are golden. Part travel checklist, part personality test, and part excuse to talk about McDonald's.",
  "intro_button": "Let's go!",
  "intro_illustration": "burger",
  "intro_color": "#FFC72C",
  "outro_title": "You're golden! ✨",
  "outro_subtitle": "Your answers are in. Snacks: noted. Flights: noted. See you in Chicago!",
  "outro_illustration": "trophy",
  "outro_color": "#DA291C"
}

export const DEMO_QUESTIONS = [
  {
    "id": "demo-1",
    "section": "01 · The Golden Arrival",
    "type": "text",
    "title": "What's your name?",
    "subtitle": "First, the boring-but-important stuff.",
    "options": [],
    "illustration": "chat",
    "color": "#FFC72C",
    "required": true
  },
  {
    "id": "demo-2",
    "section": "01 · The Golden Arrival",
    "type": "text",
    "title": "What's your cell number?",
    "subtitle": "So we can find you on the ground.",
    "options": [],
    "illustration": "chat",
    "color": "#FFE08A",
    "required": true
  },
  {
    "id": "demo-3",
    "section": "01 · The Golden Arrival",
    "type": "text",
    "title": "When are you arriving in Chicago?",
    "subtitle": "Date, time, airline, flight number.",
    "options": [],
    "illustration": "rocket",
    "color": "#FFF1C7",
    "required": true
  },
  {
    "id": "demo-4",
    "section": "01 · The Golden Arrival",
    "type": "text",
    "title": "When are you departing?",
    "subtitle": "Date, time, airline, flight number.",
    "options": [],
    "illustration": "planet",
    "color": "#FFC72C",
    "required": true
  },
  {
    "id": "demo-5",
    "section": "01 · The Golden Arrival",
    "type": "text",
    "title": "Where are you staying?",
    "subtitle": "Hotel name.",
    "options": [],
    "illustration": "star",
    "color": "#FFE08A",
    "required": true
  },
  {
    "id": "demo-6",
    "section": "01 · The Golden Arrival",
    "type": "text",
    "title": "Do you need help with transportation or have any special travel considerations?",
    "subtitle": "",
    "options": [],
    "illustration": "bag",
    "color": "#F5DEB8",
    "required": false
  },
  {
    "id": "demo-7",
    "section": "01 · The Golden Arrival",
    "type": "text",
    "title": "Any meetings, commitments, or timing constraints we should know about?",
    "subtitle": "",
    "options": [],
    "illustration": "bulb",
    "color": "#FFF1C7",
    "required": false
  },
  {
    "id": "demo-8",
    "section": "02 · The Golden Fuel",
    "type": "text",
    "title": "What's your go-to coffee or morning drink?",
    "subtitle": "Be specific. We respect complicated orders.",
    "options": [],
    "illustration": "coffee",
    "color": "#F5DEB8",
    "required": false
  },
  {
    "id": "demo-9",
    "section": "02 · The Golden Fuel",
    "type": "text",
    "title": "What's your afternoon pick-me-up?",
    "subtitle": "Diet Coke, Celsius, iced coffee, tea, etc.",
    "options": [],
    "illustration": "drink",
    "color": "#FFC72C",
    "required": false
  },
  {
    "id": "demo-10",
    "section": "02 · The Golden Fuel",
    "type": "text",
    "title": "What's your favorite salty snack?",
    "subtitle": "",
    "options": [],
    "illustration": "fries",
    "color": "#FFE08A",
    "required": false
  },
  {
    "id": "demo-11",
    "section": "02 · The Golden Fuel",
    "type": "text",
    "title": "What's your favorite sweet treat?",
    "subtitle": "",
    "options": [],
    "illustration": "cone",
    "color": "#FFCFC9",
    "required": false
  },
  {
    "id": "demo-12",
    "section": "02 · The Golden Fuel",
    "type": "text",
    "title": "Any dietary restrictions, allergies, or foods you avoid?",
    "subtitle": "",
    "options": [],
    "illustration": "heart",
    "color": "#DDF0D5",
    "required": false
  },
  {
    "id": "demo-13",
    "section": "02 · The Golden Fuel",
    "type": "text",
    "title": "You're working late on a pitch. What's your dream dinner order?",
    "subtitle": "",
    "options": [],
    "illustration": "pizza",
    "color": "#FFF1C7",
    "required": false
  },
  {
    "id": "demo-14",
    "section": "02 · The Golden Fuel",
    "type": "text",
    "title": "Any essentials that would make your day a little more golden?",
    "subtitle": "",
    "options": [],
    "illustration": "sun",
    "color": "#FFC72C",
    "required": false
  },
  {
    "id": "demo-15",
    "section": "03 · The Golden Energy",
    "type": "text",
    "title": "What's your ultimate pump-up song?",
    "subtitle": "The one that makes you feel like you could walk into a room and win anything.",
    "options": [],
    "illustration": "music",
    "color": "#FFE08A",
    "required": false
  },
  {
    "id": "demo-16",
    "section": "03 · The Golden Energy",
    "type": "single",
    "title": "What's your pre-pitch personality?",
    "subtitle": "",
    "options": [
      "☕ Caffeinated and confident",
      "🧘 Calm, cool, collected",
      "🔥 Running on adrenaline",
      "🎤 Ready for my main-character moment",
      "🍟 Just here for the fries"
    ],
    "illustration": "party",
    "color": "#FFC72C",
    "required": false
  },
  {
    "id": "demo-17",
    "section": "03 · The Golden Energy",
    "type": "text",
    "title": "What's your secret talent or unexpected fun fact?",
    "subtitle": "",
    "options": [],
    "illustration": "ghost",
    "color": "#FFF1C7",
    "required": false
  },
  {
    "id": "demo-18",
    "section": "03 · The Golden Energy",
    "type": "text",
    "title": "What one thing always puts you in a good mood?",
    "subtitle": "",
    "options": [],
    "illustration": "sun",
    "color": "#FFCFC9",
    "required": false
  },
  {
    "id": "demo-19",
    "section": "04 · The Golden Memories",
    "type": "text",
    "title": "What's your McDonald's order?",
    "subtitle": "No judgment. Extra sauce encouraged.",
    "options": [],
    "illustration": "burger",
    "color": "#FFC72C",
    "required": false
  },
  {
    "id": "demo-20",
    "section": "04 · The Golden Memories",
    "type": "text",
    "title": "What's your earliest or favorite McDonald's memory?",
    "subtitle": "Tell us the story!",
    "options": [],
    "illustration": "heart",
    "color": "#FFE08A",
    "required": false
  },
  {
    "id": "demo-21",
    "section": "04 · The Golden Memories",
    "type": "text",
    "title": "What's one thing that would make this Chicago trip a golden memory for you?",
    "subtitle": "",
    "options": [],
    "illustration": "trophy",
    "color": "#FFF1C7",
    "required": false
  }
]
