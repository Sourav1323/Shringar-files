-- ══════════════════════════════════════════════════════════════
--  Shringar — Seed Data
--  Uses plain SELECT ... WHERE NOT EXISTS (no subquery wrapper)
--  so MySQL never has to name columns from literal values.
-- ══════════════════════════════════════════════════════════════

-- ── DESIGNS ──
INSERT INTO designs (name, description, category, coverage, duration_min_hours, duration_max_hours, cones_needed, price, emoji_icon, badge, badge_color, is_active, is_featured, sort_order, click_count)
SELECT 'Rajasthani Bridal',
       'A masterpiece inspired by the royal courts of Rajasthan. Intricate peacocks, paisleys, floral jaal patterns and fine geometric latticework extend from fingertips to elbow.',
       'Bridal', 'Full hand', 3.0, 4.0, 2.0, 2500.00, '🤲', 'Popular', '#493313', 1, 1, 1, 184
WHERE NOT EXISTS (SELECT 1 FROM designs WHERE name = 'Rajasthani Bridal');

INSERT INTO designs (name, description, category, coverage, duration_min_hours, duration_max_hours, cones_needed, price, emoji_icon, badge, badge_color, is_active, is_featured, sort_order, click_count)
SELECT 'Floral Minimal',
       'Delicate blooms and fine lines for the modern minimalist. Perfect for receptions and casual events.',
       'Minimal', 'Half hand', 1.0, 2.0, 1.0, 800.00, '🌸', 'New', '#7a2c1a', 1, 1, 2, 142
WHERE NOT EXISTS (SELECT 1 FROM designs WHERE name = 'Floral Minimal');

INSERT INTO designs (name, description, category, coverage, duration_min_hours, duration_max_hours, cones_needed, price, emoji_icon, badge, badge_color, is_active, is_featured, sort_order, click_count)
SELECT 'Arabic Glam',
       'Bold Arabic strokes with floral fills. The most requested design for engagement ceremonies.',
       'Arabic', 'Both hands', 2.0, 3.0, 1.5, 1500.00, '🌿', 'Trending', '#c9a227', 1, 1, 3, 97
WHERE NOT EXISTS (SELECT 1 FROM designs WHERE name = 'Arabic Glam');

INSERT INTO designs (name, description, category, coverage, duration_min_hours, duration_max_hours, cones_needed, price, emoji_icon, badge, badge_color, is_active, is_featured, sort_order, click_count)
SELECT 'Peacock Bridal Feet',
       'Majestic peacock feather patterns with fine detailing covering both feet and ankles beautifully.',
       'Bridal', 'Both feet', 2.0, 2.0, 1.5, 1800.00, '🦚', 'Bridal', '#ba7517', 1, 0, 4, 63
WHERE NOT EXISTS (SELECT 1 FROM designs WHERE name = 'Peacock Bridal Feet');

INSERT INTO designs (name, description, category, coverage, duration_min_hours, duration_max_hours, cones_needed, price, emoji_icon, badge, badge_color, is_active, is_featured, sort_order, click_count)
SELECT 'Indo-Arabic Fusion',
       'The best of both worlds — Indian mandala roots with Arabic flowing strokes. Absolutely striking.',
       'Fusion', 'Full hand', 2.5, 2.5, 2.0, 2000.00, '🌺', 'Fusion', '#993517', 1, 0, 5, 51
WHERE NOT EXISTS (SELECT 1 FROM designs WHERE name = 'Indo-Arabic Fusion');

INSERT INTO designs (name, description, category, coverage, duration_min_hours, duration_max_hours, cones_needed, price, emoji_icon, badge, badge_color, is_active, is_featured, sort_order, click_count)
SELECT 'Mughal Classic',
       'Inspired by Mughal architecture — domed arches, geometric lattice and vine scrollwork.',
       'Mughal', 'Full feet', 1.5, 1.5, 1.0, 1200.00, '✨', 'Classic', '#493313', 1, 0, 6, 38
WHERE NOT EXISTS (SELECT 1 FROM designs WHERE name = 'Mughal Classic');


-- ── DESIGN TAGS ──
INSERT INTO design_tags (design_id, tag)
SELECT d.id, 'Bridal' FROM designs d WHERE d.name = 'Rajasthani Bridal'
  AND NOT EXISTS (SELECT 1 FROM design_tags WHERE design_id = d.id AND tag = 'Bridal');

INSERT INTO design_tags (design_id, tag)
SELECT d.id, 'Full Hand' FROM designs d WHERE d.name = 'Rajasthani Bridal'
  AND NOT EXISTS (SELECT 1 FROM design_tags WHERE design_id = d.id AND tag = 'Full Hand');

INSERT INTO design_tags (design_id, tag)
SELECT d.id, 'Rajasthani' FROM designs d WHERE d.name = 'Rajasthani Bridal'
  AND NOT EXISTS (SELECT 1 FROM design_tags WHERE design_id = d.id AND tag = 'Rajasthani');

INSERT INTO design_tags (design_id, tag)
SELECT d.id, 'Minimal' FROM designs d WHERE d.name = 'Floral Minimal'
  AND NOT EXISTS (SELECT 1 FROM design_tags WHERE design_id = d.id AND tag = 'Minimal');

INSERT INTO design_tags (design_id, tag)
SELECT d.id, 'Modern' FROM designs d WHERE d.name = 'Floral Minimal'
  AND NOT EXISTS (SELECT 1 FROM design_tags WHERE design_id = d.id AND tag = 'Modern');

INSERT INTO design_tags (design_id, tag)
SELECT d.id, 'Arabic' FROM designs d WHERE d.name = 'Arabic Glam'
  AND NOT EXISTS (SELECT 1 FROM design_tags WHERE design_id = d.id AND tag = 'Arabic');

INSERT INTO design_tags (design_id, tag)
SELECT d.id, 'Engagement' FROM designs d WHERE d.name = 'Arabic Glam'
  AND NOT EXISTS (SELECT 1 FROM design_tags WHERE design_id = d.id AND tag = 'Engagement');


-- ── DESIGN SKIN TONES ──
INSERT INTO design_skin_tones (design_id, skin_tone)
SELECT d.id, 'Wheatish' FROM designs d WHERE d.name = 'Rajasthani Bridal'
  AND NOT EXISTS (SELECT 1 FROM design_skin_tones WHERE design_id = d.id AND skin_tone = 'Wheatish');

INSERT INTO design_skin_tones (design_id, skin_tone)
SELECT d.id, 'Medium Brown' FROM designs d WHERE d.name = 'Rajasthani Bridal'
  AND NOT EXISTS (SELECT 1 FROM design_skin_tones WHERE design_id = d.id AND skin_tone = 'Medium Brown');

INSERT INTO design_skin_tones (design_id, skin_tone)
SELECT d.id, 'Fair' FROM designs d WHERE d.name = 'Rajasthani Bridal'
  AND NOT EXISTS (SELECT 1 FROM design_skin_tones WHERE design_id = d.id AND skin_tone = 'Fair');

INSERT INTO design_skin_tones (design_id, skin_tone)
SELECT d.id, 'Very Fair' FROM designs d WHERE d.name = 'Floral Minimal'
  AND NOT EXISTS (SELECT 1 FROM design_skin_tones WHERE design_id = d.id AND skin_tone = 'Very Fair');

INSERT INTO design_skin_tones (design_id, skin_tone)
SELECT d.id, 'Fair' FROM designs d WHERE d.name = 'Floral Minimal'
  AND NOT EXISTS (SELECT 1 FROM design_skin_tones WHERE design_id = d.id AND skin_tone = 'Fair');

INSERT INTO design_skin_tones (design_id, skin_tone)
SELECT d.id, 'Medium Brown' FROM designs d WHERE d.name = 'Indo-Arabic Fusion'
  AND NOT EXISTS (SELECT 1 FROM design_skin_tones WHERE design_id = d.id AND skin_tone = 'Medium Brown');

INSERT INTO design_skin_tones (design_id, skin_tone)
SELECT d.id, 'Dark Brown' FROM designs d WHERE d.name = 'Indo-Arabic Fusion'
  AND NOT EXISTS (SELECT 1 FROM design_skin_tones WHERE design_id = d.id AND skin_tone = 'Dark Brown');

INSERT INTO design_skin_tones (design_id, skin_tone)
SELECT d.id, 'Deep' FROM designs d WHERE d.name = 'Indo-Arabic Fusion'
  AND NOT EXISTS (SELECT 1 FROM design_skin_tones WHERE design_id = d.id AND skin_tone = 'Deep');


-- ── CITIES ──
INSERT INTO cities (name, display_name, is_active, is_coming_soon, artist_count, launch_quarter)
SELECT 'mumbai', 'Mumbai', 1, 0, 12, NULL
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'mumbai');

INSERT INTO cities (name, display_name, is_active, is_coming_soon, artist_count, launch_quarter)
SELECT 'pune', 'Pune', 1, 0, 8, NULL
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'pune');

INSERT INTO cities (name, display_name, is_active, is_coming_soon, artist_count, launch_quarter)
SELECT 'nashik', 'Nashik', 1, 0, 4, NULL
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'nashik');

INSERT INTO cities (name, display_name, is_active, is_coming_soon, artist_count, launch_quarter)
SELECT 'aurangabad', 'Aurangabad', 0, 1, 0, 'Q3 2026'
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'aurangabad');

INSERT INTO cities (name, display_name, is_active, is_coming_soon, artist_count, launch_quarter)
SELECT 'nagpur', 'Nagpur', 0, 1, 0, 'Q4 2026'
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'nagpur');


-- ── AREAS (Mumbai) ──
INSERT INTO areas (name, city_id, is_active)
SELECT 'Andheri', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Andheri');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Bandra', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Bandra');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Juhu', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Juhu');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Borivali', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Borivali');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Malad', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Malad');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Dadar', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Dadar');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Worli', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Worli');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Lower Parel', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Lower Parel');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Thane', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Thane');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Navi Mumbai', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Navi Mumbai');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Powai', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Powai');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Kandivali', c.id, 1 FROM cities c WHERE c.name = 'mumbai'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Kandivali');


-- ── AREAS (Pune) ──
INSERT INTO areas (name, city_id, is_active)
SELECT 'Koregaon Park', c.id, 1 FROM cities c WHERE c.name = 'pune'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Koregaon Park');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Baner', c.id, 1 FROM cities c WHERE c.name = 'pune'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Baner');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Aundh', c.id, 1 FROM cities c WHERE c.name = 'pune'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Aundh');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Hinjewadi', c.id, 1 FROM cities c WHERE c.name = 'pune'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Hinjewadi');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Kothrud', c.id, 1 FROM cities c WHERE c.name = 'pune'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Kothrud');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Viman Nagar', c.id, 1 FROM cities c WHERE c.name = 'pune'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Viman Nagar');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Hadapsar', c.id, 1 FROM cities c WHERE c.name = 'pune'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Hadapsar');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Wakad', c.id, 1 FROM cities c WHERE c.name = 'pune'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Wakad');


-- ── AREAS (Nashik) ──
INSERT INTO areas (name, city_id, is_active)
SELECT 'Gangapur Rd', c.id, 1 FROM cities c WHERE c.name = 'nashik'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Gangapur Rd');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Panchvati', c.id, 1 FROM cities c WHERE c.name = 'nashik'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Panchvati');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Cidco', c.id, 1 FROM cities c WHERE c.name = 'nashik'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Cidco');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Satpur', c.id, 1 FROM cities c WHERE c.name = 'nashik'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Satpur');

INSERT INTO areas (name, city_id, is_active)
SELECT 'Nashik Rd', c.id, 1 FROM cities c WHERE c.name = 'nashik'
  AND NOT EXISTS (SELECT 1 FROM areas a WHERE a.city_id = c.id AND a.name = 'Nashik Rd');


-- ── ARTISTS ──
INSERT INTO artists (name, specialization, city, rating, review_count, avatar_emoji, experience_years, is_active, is_top_artist, badge_label)
SELECT 'Sunita Verma', 'Rajasthani & Bridal Specialist', 'mumbai', 4.9, 218, '👩‍🎨', 9, 1, 1, 'Top Artist 2025'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'Sunita Verma');

INSERT INTO artists (name, specialization, city, rating, review_count, avatar_emoji, experience_years, is_active, is_top_artist, badge_label)
SELECT 'Rekha Patel', 'Arabic & Fusion Expert', 'mumbai', 4.8, 174, '👩', 6, 1, 0, 'Highly Rated'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'Rekha Patel');

INSERT INTO artists (name, specialization, city, rating, review_count, avatar_emoji, experience_years, is_active, is_top_artist, badge_label)
SELECT 'Fatima Khan', 'Mughal & Traditional Art', 'mumbai', 4.9, 201, '🧕', 11, 1, 1, 'Top Artist 2025'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'Fatima Khan');

INSERT INTO artists (name, specialization, city, rating, review_count, avatar_emoji, experience_years, is_active, is_top_artist, badge_label)
SELECT 'Preethi Nair', 'Minimal & Modern Designs', 'pune', 4.7, 132, '👱‍♀️', 4, 1, 0, 'Rising Star'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'Preethi Nair');

INSERT INTO artists (name, specialization, city, rating, review_count, avatar_emoji, experience_years, is_active, is_top_artist, badge_label)
SELECT 'Deepa Kulkarni', 'Rajasthani & Bridal', 'pune', 4.8, 96, '👩', 7, 1, 0, NULL
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'Deepa Kulkarni');

INSERT INTO artists (name, specialization, city, rating, review_count, avatar_emoji, experience_years, is_active, is_top_artist, badge_label)
SELECT 'Asha Desai', 'Traditional & Heritage', 'nashik', 4.6, 58, '🧕', 5, 1, 0, NULL
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'Asha Desai');


-- ── ARTIST SERVICE AREAS ──
INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Andheri' FROM artists a WHERE a.name = 'Sunita Verma'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Andheri');

INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Bandra' FROM artists a WHERE a.name = 'Sunita Verma'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Bandra');

INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Juhu' FROM artists a WHERE a.name = 'Sunita Verma'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Juhu');

INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Dadar' FROM artists a WHERE a.name = 'Rekha Patel'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Dadar');

INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Worli' FROM artists a WHERE a.name = 'Rekha Patel'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Worli');

INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Lower Parel' FROM artists a WHERE a.name = 'Rekha Patel'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Lower Parel');

INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Malad' FROM artists a WHERE a.name = 'Fatima Khan'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Malad');

INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Borivali' FROM artists a WHERE a.name = 'Fatima Khan'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Borivali');

INSERT INTO artist_areas (artist_id, area)
SELECT a.id, 'Kandivali' FROM artists a WHERE a.name = 'Fatima Khan'
  AND NOT EXISTS (SELECT 1 FROM artist_areas WHERE artist_id = a.id AND area = 'Kandivali');


-- ── COUPONS ──
INSERT INTO coupons (code, type, value, min_order_value, description, is_active, valid_from, valid_until)
SELECT 'BRIDE10', 'PERCENT', 10.00, 1000.00, '10% Bridal Discount', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'BRIDE10');

INSERT INTO coupons (code, type, value, min_order_value, description, is_active, valid_from, valid_until)
SELECT 'FIRST15', 'PERCENT', 15.00, 500.00, '15% First-Time Discount', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'FIRST15');

INSERT INTO coupons (code, type, value, min_order_value, description, is_active, valid_from, valid_until)
SELECT 'FESTIVE20', 'PERCENT', 20.00, 2000.00, '20% Festive Offer', 1, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH)
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'FESTIVE20');

INSERT INTO coupons (code, type, value, min_order_value, description, is_active, valid_from, valid_until)
SELECT 'FLAT200', 'FLAT', 200.00, 2000.00, 'Rs.200 Flat Off', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'FLAT200');

INSERT INTO coupons (code, type, value, min_order_value, description, is_active, valid_from, valid_until)
SELECT 'WELCOME5', 'PERCENT', 5.00, 0.00, '5% Welcome Discount', 1, NOW(), DATE_ADD(NOW(), INTERVAL 2 YEAR)
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'WELCOME5');


-- ── SITE SETTINGS ──
INSERT INTO site_settings (
  instagram_handle, youtube_channel_url, youtube_intro_video_url,
  whatsapp_number, contact_phone, contact_email,
  hero_title, hero_subtitle, hero_cta_text,
  advance_percent, artist_visit_fee, free_cancel_hours, reschedule_hours,
  available_time_slots, blackout_days,
  announcement_active
)
SELECT 'shringar.in', 'https://www.youtube.com/@shringar',
       'https://www.youtube.com/watch?v=REPLACE_WITH_YOUR_VIDEO_ID',
       '919876543210', '+91 98765 43210', 'hello@shringar.in',
       'मेहंदी कला for Every Celebration',
       'Book India''s finest mehendi artists for your home, venue or event.',
       'Book Your Artist',
       30, 200.00, 48, 24,
       '09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00,18:00',
       '', 0
WHERE NOT EXISTS (SELECT 1 FROM site_settings);


-- ── ARTIST SOCIAL LINKS ──
UPDATE artists SET instagram_handle = 'sunita.mehendi.art'    WHERE name = 'Sunita Verma'    AND instagram_handle IS NULL;
UPDATE artists SET instagram_handle = 'rekha.henna.studio'    WHERE name = 'Rekha Patel'     AND instagram_handle IS NULL;
UPDATE artists SET instagram_handle = 'fatima.traditional.art' WHERE name = 'Fatima Khan'     AND instagram_handle IS NULL;
UPDATE artists SET instagram_handle = 'preethi.minimal.henna' WHERE name = 'Preethi Nair'    AND instagram_handle IS NULL;


-- ── ARTIST EMAILS ──
UPDATE artists SET email = 'sunita.verma@shringar.in'    WHERE name = 'Sunita Verma'    AND email IS NULL;
UPDATE artists SET email = 'rekha.patel@shringar.in'     WHERE name = 'Rekha Patel'     AND email IS NULL;
UPDATE artists SET email = 'fatima.khan@shringar.in'     WHERE name = 'Fatima Khan'     AND email IS NULL;
UPDATE artists SET email = 'preethi.nair@shringar.in'    WHERE name = 'Preethi Nair'    AND email IS NULL;
UPDATE artists SET email = 'deepa.kulkarni@shringar.in'  WHERE name = 'Deepa Kulkarni'  AND email IS NULL;
UPDATE artists SET email = 'asha.desai@shringar.in'      WHERE name = 'Asha Desai'      AND email IS NULL;


-- ── DESIGN YOUTUBE VIDEOS ──
UPDATE designs SET youtube_video_url = 'https://www.youtube.com/watch?v=REPLACE_WITH_YOUR_VIDEO_ID'
  WHERE name = 'Rajasthani Bridal' AND youtube_video_url IS NULL;
UPDATE designs SET youtube_video_url = 'https://www.youtube.com/watch?v=REPLACE_WITH_YOUR_VIDEO_ID'
  WHERE name = 'Arabic Glam' AND youtube_video_url IS NULL;

-- ── TESTIMONIALS (shown on homepage — admin can add/edit/delete via portal) ──
INSERT INTO testimonials (customer_name, occasion, location, review, rating, avatar_emoji, is_active, sort_order)
SELECT 'Priya Sharma', 'Bridal Mehendi 2025', 'Bandra, Mumbai',
  'Sunita didi did my bridal mehendi and it was absolutely stunning. The design lasted 10 days and everyone kept asking who did it. Highly recommend Shringar!',
  5, '👰', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE customer_name = 'Priya Sharma');

INSERT INTO testimonials (customer_name, occasion, location, review, rating, avatar_emoji, is_active, sort_order)
SELECT 'Ananya Iyer', 'Navratri 2025', 'Koregaon Park, Pune',
  'Booked Preethi for Navratri and was blown away. The booking process was so smooth and she arrived exactly on time. The Arabic pattern on my hands got so many compliments!',
  5, '🙏', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE customer_name = 'Ananya Iyer');

INSERT INTO testimonials (customer_name, occasion, location, review, rating, avatar_emoji, is_active, sort_order)
SELECT 'Meera Kulkarni', 'Sister''s Wedding', 'Andheri, Mumbai',
  'Got the Peacock Bridal Feet design for my sister''s wedding. Fatima Khan was incredibly skilled and patient. The design was perfect and way beyond our expectations.',
  5, '👑', 1, 3
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE customer_name = 'Meera Kulkarni');

INSERT INTO testimonials (customer_name, occasion, location, review, rating, avatar_emoji, is_active, sort_order)
SELECT 'Ritu Patel', 'Engagement Ceremony', 'Worli, Mumbai',
  'The Indo-Arabic Fusion design was exactly what I wanted. Rekha was so professional and the online booking made it hassle-free. Will definitely book again for my wedding!',
  5, '💍', 1, 4
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE customer_name = 'Ritu Patel');
