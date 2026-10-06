-- Optional sample data so the app has something to show right after setup.
-- Replace with real sessions from the website calendar.

insert into photo_sessions (id, city, state, venue_name, start_date, end_date, sitting_fee, minimum_order, status, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'Atlanta', 'GA', 'Private residence, Buckhead', '2026-10-16', '2026-10-17', 100, 200, 'open',
   'Indoor session. Exact address is shared by the hostess after your time is confirmed.'),
  ('22222222-2222-2222-2222-222222222222', 'Charlotte', 'NC', null, '2026-11-06', '2026-11-06', 100, 200, 'open', null),
  ('33333333-3333-3333-3333-333333333333', 'Augusta', 'GA', null, '2027-03-12', '2027-03-12', 100, 200, 'open', null);

insert into session_hostesses (session_id, name, email) values
  ('11111111-1111-1111-1111-111111111111', 'Emily Karempelis', 'dubosephotographyatlanta@gmail.com'),
  ('11111111-1111-1111-1111-111111111111', 'Bridget Keller', 'dubosephotographyatlanta@gmail.com'),
  ('22222222-2222-2222-2222-222222222222', 'Meredith Chapman', null),
  ('33333333-3333-3333-3333-333333333333', 'Christina Lake', 'christinaelake@gmail.com');

-- 15-minute slots from 9:00 to 1:45 on each session day.
insert into time_slots (session_id, starts_at)
select s.id, (s.start_date + time '09:00') + (n * interval '15 minutes')
from photo_sessions s, generate_series(0, 19) as n;
