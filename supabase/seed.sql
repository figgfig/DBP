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

-- The studio's Spring 2026 price list (what the 2026 order forms charged).
-- Attach it to each gallery with galleries.price_list_id. Clients only see it
-- inside the order screen of their own gallery.
insert into price_lists (id, name, prints, composites, composite_extra_child, packages, singles, notes)
values (
  '44444444-4444-4444-4444-444444444444',
  'Spring 2026',
  '{}'::jsonb,  -- single prints are tiered (see singles), so the studio prices them on the invoice
  '{"8x10": 375, "11x14": 475, "16x20": 795}'::jsonb,
  75,
  '[
    {"id": "package-1", "name": "Package 1", "price": 795, "summary": "One 16x20, one 8x10, two 5x7s",
     "contents": [{"size": "16x20", "quantity": 1}, {"size": "8x10", "quantity": 1}, {"size": "5x7", "quantity": 2}]},
    {"id": "package-2", "name": "Package 2", "price": 550, "summary": "Two 11x14s, two 5x7s",
     "contents": [{"size": "11x14", "quantity": 2}, {"size": "5x7", "quantity": 2}]},
    {"id": "package-3", "name": "Package 3", "price": 475, "summary": "One 11x14, two 5x7s, four wallets",
     "contents": [{"size": "11x14", "quantity": 1}, {"size": "5x7", "quantity": 2}, {"size": "4 wallets", "quantity": 1}]},
    {"id": "package-4", "name": "Package 4", "price": 375, "summary": "One 8x10, two 5x7s, four wallets",
     "contents": [{"size": "8x10", "quantity": 1}, {"size": "5x7", "quantity": 2}, {"size": "4 wallets", "quantity": 1}]}
  ]'::jsonb,
  '{"sizes": ["16x20", "11x14", "8x10", "5x7 / 4x5", "4 wallets"],
    "rows": [
      {"label": "First print of each child", "prices": [725, 375, 275, 200, null]},
      {"label": "Same child, different pose", "prices": [455, 225, 125, 55, 55]},
      {"label": "Reprint, same child, size and pose", "prices": [395, 95, 75, 45, null]}
    ]}'::jsonb,
  '["Basic retouching and clean-up of children''s faces is included. Additional retouching is quoted by our photo technicians."]'::jsonb
);
