# CycleFound

Yhteisöpohjainen polkupyörien suojaus- ja löytöpalvelu.

## Tekniikkapino

- **Kehys**: Next.js 14+ (App Router)
- **Kieli**: TypeScript
- **Tyylit**: Vanilla CSS (globals.css)
- **Ikonit**: Lucide React
- **Kirjasimet**: Outfit (Google Fonts)

## Kehitys

Asenna riippuvuudet ja käynnistä kehityspalvelin:

```bash
npm install
npm run dev
```

Avaa [http://localhost:3000](http://localhost:3000) selaimessasi nähdäksesi tuloksen.

## Ominaisuudet

- **Etusivu**: Hero-osio, tilastot, viimeksi kadonneet pyörät ja kumppanit.
- **Varkausilmoitus**: Kolmivaiheinen lomake pyörän tietojen, sijainnin ja kuvien ilmoittamiseen.
- **Kielet**: suomi, ruotsi ja englanti (`src/i18n/dictionaries.ts`). Kieli valitaan ylävalikosta
  ja tallennetaan `lang`-evästeeseen; oletuksena selaimen kieli. Lakitekstit ja kumppanisivu ovat
  toistaiseksi vain suomeksi.
- **Premium Design**: Moderni ulkoasu, lasiefektit ja sulavat animaatiot.

## Tietokanta (Supabase)

Aja SQL-tiedostot Supabasen SQL-editorissa tässä järjestyksessä:

1. `migrations/2026-05-14_add_bike_contact_fields.sql`
2. `migrations/2026-05-14_admin_and_ad_slots.sql`
3. `migrations/2026-09-26_matching_privacy_stats.sql` – automaattinen vertailu, yksityisyys, tilastot, viestit
4. `migrations/2026-09-27_tags_push_retention.sql` – QR-tarrat, push-ilmoitukset, tietojen säilytysajat
   (ota ensin käyttöön `pg_cron`: Database → Extensions)
5. *(valinnainen)* `migrations/demo_seed.sql` – demodata. Poista ennen julkaisua:
   `delete from bikes where is_demo; delete from stories where is_demo;`

### Miten vertailu toimii

- Jokainen varastettu (`varastettu`) tai ennakkoon rekisteröity (`rekisteröity`) pyörä verrataan
  automaattisesti jokaiseen löytöilmoitukseen (`ilmoitettu`) tietokantatriggerillä.
- Sarjanumero normalisoidaan (isot kirjaimet, vain A–Z0–9, O→0, I/L→1), joten
  `wtu-l23 456` ja `WTU123456` täsmäävät.
- Pisteet: sarjanumero 100, merkki 25, malli 15, kaupunki 15, väri 10, tyyppi 5, aika 5.
  Eri sarjanumerot −60, löytö ennen varkautta −40. Vähintään 50 pistettä = osuma.
- Omistaja näkee osumat omalla sivullaan ja vahvistaa tai hylkää ne.

### Yksityisyys

- `bikes`-taulu näkyy vain omistajalle ja ylläpidolle. Julkiset sivut lukevat
  `bikes_public`-näkymää, jossa ei ole sarjanumeroita eikä yhteystietoja.
- Yhteydenotot kulkevat `bike_messages`-taulun kautta (ei julkisia sähköposteja/puhelinnumeroita).
- Kuvista poistetaan EXIF/GPS-tiedot selaimessa ennen latausta.

### Sähköposti-ilmoitukset (valinnainen)

`supabase/functions/notify-owner` lähettää sähköpostin (Resend) uusista osumista ja viesteistä.
Käyttöönotto-ohjeet ovat tiedoston alussa.
