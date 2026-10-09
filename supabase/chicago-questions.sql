-- Golden Ticket to Chicago — run once in Supabase → SQL Editor → New query → Run.
-- Adds the Section field, hides the current questions (they stay in the admin, switched off,
-- and old responses keep their answers), then loads the 21 Chicago questions and the intro/thanks cards.

alter table public.questions add column if not exists section text not null default '';

-- New "Flight" question type: date and time picker, airline and flight number.
alter table public.questions drop constraint if exists questions_type_check;
alter table public.questions add constraint questions_type_check
  check (type in ('single', 'multi', 'text', 'rating', 'slider', 'flight'));

update public.questions set active = false;

-- 21 questions with room for long stories: allow bigger responses.
alter table public.responses drop constraint if exists responses_answers_check;
alter table public.responses add constraint responses_answers_check check (pg_column_size(answers) < 100000);

insert into public.questions (position, section, type, title, subtitle, options, illustration, color, required) values
  -- 01. The Golden Arrival
  (1,  '01 · The Golden Arrival', 'text', 'What''s your name?', 'First, the boring-but-important stuff.', '[]', 'chat', '#FFC72C', true),
  (2,  '01 · The Golden Arrival', 'text', 'What''s your cell number?', 'So we can find you on the ground.', '[]', 'chat', '#FFE08A', true),
  (3,  '01 · The Golden Arrival', 'flight', 'When are you arriving in Chicago?', 'Your landing time, airline and flight number.', '[]', 'rocket', '#FFF1C7', true),
  (4,  '01 · The Golden Arrival', 'flight', 'When are you departing?', 'Your takeoff time, airline and flight number.', '[]', 'planet', '#FFC72C', true),
  (5,  '01 · The Golden Arrival', 'text', 'Where are you staying?', 'Hotel name.', '[]', 'star', '#FFE08A', true),
  (6,  '01 · The Golden Arrival', 'text', 'Do you need help with transportation or have any special travel considerations?', '', '[]', 'bag', '#F5DEB8', false),
  (7,  '01 · The Golden Arrival', 'text', 'Any meetings, commitments, or timing constraints we should know about?', '', '[]', 'bulb', '#FFF1C7', false),

  -- 02. The Golden Fuel
  (8,  '02 · The Golden Fuel', 'text', 'What''s your go-to coffee or morning drink?', 'Be specific. We respect complicated orders.', '[]', 'coffee', '#F5DEB8', false),
  (9,  '02 · The Golden Fuel', 'text', 'What''s your afternoon pick-me-up?', 'Diet Coke, Celsius, iced coffee, tea, etc.', '[]', 'drink', '#FFC72C', false),
  (10, '02 · The Golden Fuel', 'text', 'What''s your favorite salty snack?', '', '[]', 'fries', '#FFE08A', false),
  (11, '02 · The Golden Fuel', 'text', 'What''s your favorite sweet treat?', '', '[]', 'cone', '#FFCFC9', false),
  (12, '02 · The Golden Fuel', 'text', 'Any dietary restrictions, allergies, or foods you avoid?', '', '[]', 'heart', '#DDF0D5', false),
  (13, '02 · The Golden Fuel', 'text', 'You''re working late on a pitch. What''s your dream dinner order?', '', '[]', 'pizza', '#FFF1C7', false),
  (14, '02 · The Golden Fuel', 'text', 'Any essentials that would make your day a little more golden?', '', '[]', 'sun', '#FFC72C', false),

  -- 03. The Golden Energy
  (15, '03 · The Golden Energy', 'text', 'What''s your ultimate pump-up song?', 'The one that makes you feel like you could walk into a room and win anything.', '[]', 'music', '#FFE08A', false),
  (16, '03 · The Golden Energy', 'single', 'What''s your pre-pitch personality?', '',
       '["☕ Caffeinated and confident", "🧘 Calm, cool, collected", "🔥 Running on adrenaline", "🎤 Ready for my main-character moment", "🍟 Just here for the fries"]',
       'party', '#FFC72C', false),
  (17, '03 · The Golden Energy', 'text', 'What''s your secret talent or unexpected fun fact?', '', '[]', 'ghost', '#FFF1C7', false),
  (18, '03 · The Golden Energy', 'text', 'What one thing always puts you in a good mood?', '', '[]', 'sun', '#FFCFC9', false),

  -- 04. The Golden Memories
  (19, '04 · The Golden Memories', 'text', 'What''s your McDonald''s order?', 'No judgment. Extra sauce encouraged.', '[]', 'burger', '#FFC72C', false),
  (20, '04 · The Golden Memories', 'text', 'What''s your earliest or favorite McDonald''s memory?', 'Tell us the story!', '[]', 'heart', '#FFE08A', false),
  (21, '04 · The Golden Memories', 'text', 'What''s one thing that would make this Chicago trip a golden memory for you?', '', '[]', 'trophy', '#FFF1C7', false);

update public.settings set
  intro_title = 'Your Golden Ticket to Chicago 🎟️',
  intro_subtitle = 'Good things are coming. Great things are golden. Part travel checklist, part personality test, and part excuse to talk about McDonald''s.',
  intro_button = 'Let''s go!',
  intro_illustration = 'burger',
  intro_color = '#FFC72C',
  outro_title = 'You''re golden! ✨',
  outro_subtitle = 'Your answers are in. Snacks: noted. Flights: noted. See you in Chicago!',
  outro_illustration = 'trophy',
  outro_color = '#DA291C'
where id = 1;
