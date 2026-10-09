# BikeBack – iOS-sovellus (Expo / React Native)

Mobiilisovellus käyttää samaa Supabase-tietokantaa, osumahakua ja käännöksiä kuin
verkkosivusto. Sama koodi toimii myöhemmin myös Androidilla.

## Rakenne

```
mobile/
  src/app/            Näkymät (Expo Router, tiedostopohjainen reititys)
    (tabs)/           Alapalkki: Etsi · Kartta · Ilmoita · Profiili
    bike/[id].tsx     Pyörän tiedot + viesti omistajalle/löytäjälle
    report/[kind].tsx Ilmoituslomake (stolen | register | found)
    check.tsx         Sarjanumerotarkistus
    auth.tsx          Kirjautuminen / rekisteröityminen
  src/components/     Käyttöliittymäkomponentit
  src/lib/            Supabase, kielet, teema, kuvien lataus
```

Jaetut tiedostot verkkosivuston kanssa (`@shared/*` → `../src/*`):
`src/i18n/dictionaries.ts` ja `src/lib/bikes.ts`.

## Käynnistys Macilla

> **Tärkeää:** Xcode ei toimi luotettavasti exFAT-muotoisella ulkoisella levyllä
> (`._`-tiedostot rikkovat koodiallekirjoituksen). Kloonaa repo Macin sisäiselle
> levylle, esim. `~/Developer/bike`.

```bash
cd mobile
npm install
cp .env.example .env.local   # täytä samat arvot kuin verkkosivuston .env.local:ssa
```

**Nopein tapa (Expo Go simulaattorissa):**

```bash
npx expo start --ios
```

**Oma kehitysversio Xcodella** (tarvitaan App Storea varten):

```bash
npx expo run:ios
```

Ensimmäinen käännös kestää 5–10 minuuttia. Natiivit `ios/`-kansiot luodaan
automaattisesti – niitä ei muokata käsin.

## Tarkistukset

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Tietokanta

Aja `../migrations/2026-10-09_delete_my_account.sql` Supabasessa. Apple vaatii,
että sovelluksessa luodun tilin voi myös poistaa sovelluksessa.
