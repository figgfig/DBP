-- Real sessions from the calendar on dubosephotography.com (checked 2026-10-09).
-- Add new sessions here or in the Supabase table editor as they are announced.

insert into photo_sessions (id, city, state, venue_name, start_date, end_date, sitting_fee, minimum_order, status, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'Atlanta', 'GA', null, '2026-10-01', '2026-10-02', 100, 200, 'past',
   'Please arrive ten minutes before your session. DuBose Photography does not offer digital copies of client images.'),
  ('22222222-2222-2222-2222-222222222222', 'Charlotte', 'NC', null, '2026-10-19', '2026-10-20', 100, 200, 'open',
   'Please arrive ten minutes before your session. DuBose Photography does not offer digital copies of client images.'),
  ('33333333-3333-3333-3333-333333333333', 'Charlotte / Lake Norman', 'NC', null, '2026-10-21', '2026-10-21', 100, 200, 'open',
   'Please arrive ten minutes before your session. DuBose Photography does not offer digital copies of client images.');

insert into session_hostesses (session_id, name, email) values
  ('11111111-1111-1111-1111-111111111111', 'Whitney McMurray', null),
  ('22222222-2222-2222-2222-222222222222', 'Gatesy Plyler', null),
  ('33333333-3333-3333-3333-333333333333', 'Jennifer Estridge', null);

-- 15-minute slots from 8:30 AM to 4:45 PM (last slot ends at 5:00 PM) on every day of each open session.
insert into time_slots (session_id, starts_at)
select s.id, (d::date + time '08:30') + (n * interval '15 minutes')
from photo_sessions s,
     generate_series(s.start_date, s.end_date, interval '1 day') as d,
     generate_series(0, 33) as n
where s.status = 'open';
