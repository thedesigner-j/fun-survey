-- Only needed if you ran schema.sql BEFORE the red & yellow theme.
-- Restyles the intro/thank-you cards and the 5 starter questions. Safe to skip otherwise.

update public.settings set
  intro_title = 'Hey, got a sec? 🍔',
  intro_subtitle = 'Five quick questions. Faster than the drive-thru, promise.',
  intro_illustration = 'burger',
  intro_color = '#FFC72C',
  outro_title = 'Thanks a bunch!',
  outro_subtitle = 'Your answers are in. We read every single one.',
  outro_illustration = 'cone',
  outro_color = '#DA291C'
where id = 1;

update public.questions set illustration = 'fries',   color = '#FFC72C' where illustration = 'planet' and color = '#D6E4FF';
update public.questions set illustration = 'burger',  color = '#FFF1C7' where illustration = 'heart'  and color = '#FFD6E0';
update public.questions set illustration = 'nuggets', color = '#DA291C' where illustration = 'rocket' and color = '#C8F7DC';
update public.questions set illustration = 'drink',   color = '#FFE08A' where illustration = 'chat'   and color = '#FFE0CC';
update public.questions set illustration = 'bag',     color = '#F5DEB8' where illustration = 'bulb'   and color = '#FFF1C1';

alter table public.questions alter column illustration set default 'fries';
alter table public.questions alter column color set default '#FFC72C';
