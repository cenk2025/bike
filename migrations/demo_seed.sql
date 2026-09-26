-- Demo data for trying out CycleFound. NOT a migration – run it manually in
-- the Supabase SQL editor after 2026-09-26_matching_privacy_stats.sql.
--
-- * Every row is flagged is_demo = true.
-- * The stolen / registered / recovered demo bikes are owned by the first
--   admin user, so logging in as admin shows matches and messages on the
--   dashboard. Found reports are anonymous (user_id = null), like real ones.
-- * Re-running the file first deletes the previous demo rows.
--
-- Remove all demo data before going live:
--     delete from public.bikes   where is_demo;
--     delete from public.stories where is_demo;

do $$
declare
    owner uuid;
begin
    select id into owner from public.profiles where is_admin order by created_at limit 1;
    if owner is null then
        raise exception 'No admin user found. Run 2026-05-14_admin_and_ad_slots.sql and sign up with the admin e-mail first.';
    end if;

    delete from public.bikes   where is_demo;
    delete from public.stories where is_demo;

    -- Stolen, registered and recovered bikes (owned by the admin).
    insert into public.bikes
        (serial_number, brand, model, type, color, city, location, status,
         description, event_date, police_report_number, image_url,
         user_id, allow_contact, is_demo, created_at)
    values
        ('HK-JP-2021-4471', 'Helkama', 'Jopo', 'Kaupunki', 'turkoosi', 'Helsinki', 'Kallio, Helsinki', 'varastettu',
         'Turkoosi Jopo, valkoinen kori edessä ja tarra "Kallio" takalokasuojassa.', current_date - 2, '5010/R/10442/26', null,
         owner, true, true, now() - interval '2 days'),
        ('WTU283C0912K', 'Trek', 'Marlin 7', 'Maastopyörä', 'musta', 'Espoo', 'Tapiola, Espoo', 'varastettu',
         'Musta Marlin 7, 29" renkaat, punaiset polkimet.', current_date - 5, '5010/R/10871/26', null,
         owner, true, true, now() - interval '5 days'),
        ('CB-KH-55120', 'Cube', 'Kathmandu Hybrid', 'Sähkö', 'harmaa', 'Tampere', 'Tampereen keskusta, Tampere', 'varastettu',
         'Harmaa sähköpyörä, Bosch-moottori. Akku oli mukana.', current_date - 9, '4010/R/22011/26', null,
         owner, false, true, now() - interval '9 days'),
        ('PLG-BK-3317', 'Pelago', 'Brooklyn', 'Kaupunki', 'vihreä', 'Helsinki', 'Punavuori, Helsinki', 'varastettu',
         'Tummanvihreä, ruskea Brooks-satula ja tavarateline.', current_date - 1, null, null,
         owner, true, true, now() - interval '20 hours'),
        ('WSBC6021977', 'Specialized', 'Rockhopper', 'Maastopyörä', 'sininen', 'Vantaa', 'Tikkurila, Vantaa', 'varastettu',
         'Sininen Rockhopper, jousitettu etuhaarukka.', current_date - 3, '5010/R/10610/26',
         'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?q=80&w=800&auto=format&fit=crop',
         owner, true, true, now() - interval '3 days'),
        ('CNY-GR-00981', 'Canyon', 'Grail', 'Maantie', 'harmaa', 'Turku', 'Aurajoen ranta, Turku', 'varastettu',
         'Gravel-pyörä, tankolaukku kiinni.', current_date - 12, null, null,
         owner, false, true, now() - interval '12 days'),
        ('GNT-ES-44102', 'Giant', 'Escape 2', 'Kaupunki', 'valkoinen', 'Oulu', 'Oulun rautatieasema, Oulu', 'varastettu',
         null, current_date - 6, null, null,
         owner, true, true, now() - interval '6 days'),
        ('JYARM321000123456', 'Yamaha', 'MT-07', 'Moottoripyörä', 'musta', 'Helsinki', 'Herttoniemi, Helsinki', 'varastettu',
         'Rekisterikilpi ABC-12. Varastettu pihasta yöllä.', current_date - 4, '5010/R/10703/26', null,
         owner, true, true, now() - interval '4 days'),
        ('MI4PRO-771234', 'Xiaomi', 'Electric Scooter 4 Pro', 'Sähköpotkulauta', 'musta', 'Jyväskylä', 'Kauppakatu, Jyväskylä', 'varastettu',
         null, current_date - 1, null, null,
         owner, true, true, now() - interval '30 hours'),
        -- Registered in advance – NOT stolen. A found report with the same
        -- serial still notifies the owner.
        ('BIA-VN7-88412', 'Bianchi', 'Via Nirone 7', 'Maantie', 'celeste', 'Helsinki', 'Töölö, Helsinki', 'rekisteröity',
         'Celeste-värinen maantiepyörä.', null, null, null,
         owner, true, true, now() - interval '60 days'),
        -- Recovered: counted in the "Löydetty" statistic.
        ('SCT-AS-12877', 'Scott', 'Aspect 950', 'Maastopyörä', 'punainen', 'Kerava', 'Keravan asema, Kerava', 'löytynyt',
         null, current_date - 30, null, null,
         owner, false, true, now() - interval '30 days'),
        ('NSK-CM-66031', 'Nishiki', 'Comfort', 'Kaupunki', 'musta', 'Jyväskylä', 'Harju, Jyväskylä', 'löytynyt',
         null, current_date - 45, null, null,
         owner, false, true, now() - interval '45 days');

    -- Found reports (anonymous finders). Serials are typed sloppily on
    -- purpose – normalisation should still match them.
    insert into public.bikes
        (serial_number, brand, model, type, color, city, location, status,
         description, event_date, image_url, finder_email, user_id, is_demo, created_at)
    values
        ('hkjp 2021 4471', 'Helkama', 'Jopo', 'Kaupunki', 'turkoosi', 'Helsinki', 'Sörnäisten metroasema, Helsinki', 'ilmoitettu',
         'Lukitsematon Jopo seissyt telineessä useamman päivän. Valkoinen kori.', current_date - 1, null,
         'demo.loytaja1@example.com', null, true, now() - interval '1 day'),
        (null, 'Trek', 'Marlin 7', 'Maastopyörä', 'musta', 'Espoo', 'Leppävaaran asema, Espoo', 'ilmoitettu',
         'Musta maastopyörä, etupyörä vääntynyt. Punaiset polkimet.', current_date - 2, null,
         'demo.loytaja2@example.com', null, true, now() - interval '2 days'),
        (null, 'Cube', 'Kathmandu Hybrid', 'Sähkö', 'harmaa', 'Tampere', 'Hervanta, Tampere', 'ilmoitettu',
         'Harmaa sähköpyörä metsän reunassa, akku puuttuu.', current_date - 3, null,
         null, null, true, now() - interval '3 days'),
        ('BIA VN7 88412', 'Bianchi', null, 'Maantie', 'celeste', 'Helsinki', 'Taloyhtiön pyöräsiivous, Töölö, Helsinki', 'ilmoitettu',
         'Löytyi taloyhtiön kevätsiivouksessa, ei omistajatarraa.', current_date - 1, null,
         'demo.isannoitsija@example.com', null, true, now() - interval '18 hours'),
        (null, 'Tuntematon', null, 'Kaupunki', 'punainen', 'Lahti', 'Lahden matkakeskus, Lahti', 'ilmoitettu',
         'Punainen naistenpyörä, kori ja lukko rikottu.', current_date - 4,
         'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800&auto=format&fit=crop',
         null, null, true, now() - interval '4 days'),
        (null, 'Crescent', 'Elda', 'Sähkö', 'valkoinen', 'Kuopio', 'Väinölänniemi, Kuopio', 'ilmoitettu',
         'Valkoinen sähköpyörä rannassa.', current_date - 2, null,
         null, null, true, now() - interval '2 days');

    -- Demo messages to the owner's stolen bikes.
    insert into public.bike_messages (bike_id, sender_name, sender_email, body)
    select id, 'Laura K.', 'demo.laura@example.com',
           'Hei! Näin eilen illalla samanlaisen turkoosin Jopon Sörnäisten metroaseman telineessä. Kori oli edessä.'
    from public.bikes where is_demo and serial_number = 'HK-JP-2021-4471';

    insert into public.bike_messages (bike_id, sender_name, sender_email, body)
    select id, 'Mikko', 'demo.mikko@example.com',
           'Punavuoressa myytiin Tori.fi:ssä vihreää Brooklynia halvalla, kannattaa tarkistaa.'
    from public.bikes where is_demo and serial_number = 'PLG-BK-3317';

    insert into public.stories (user_id, full_name, location, content, approved, is_demo)
    values
        (owner, 'Aino L.', 'Helsinki',
         'Joponi varastettiin Kalliosta. Kaksi päivää myöhemmin CycleFound ilmoitti, että sarjanumerolla oli tehty löytöilmoitus Sörnäisistä. Sain pyörän takaisin samana iltana!', true, true),
        (owner, 'Janne P.', 'Kerava',
         'Rekisteröin pyöräni etukäteen. Kun se katosi, kaikki tiedot ja kuvat olivat valmiina – poliisi ja vakuutusyhtiö saivat ne heti.', true, true),
        (owner, 'Taloyhtiö As Oy Harju', 'Jyväskylä',
         'Kevään pyöräsiivouksessa löytyi 14 hylättyä pyörää. Kolme niistä palautui omistajalleen CycleFoundin kautta.', true, true);
end $$;

select brand, model, score, reasons
from public.bike_matches m
join public.bikes b on b.id = m.lost_bike_id
where b.is_demo
order by score desc;
