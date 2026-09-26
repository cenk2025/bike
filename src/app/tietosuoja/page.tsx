import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
    title: "Tietosuojaseloste | CycleFound",
    description: "Miten CycleFound käsittelee henkilötietojasi."
};

export default function PrivacyPage() {
    return (
        <ContentPage
            title="Tietosuojaseloste"
            intro={<>EU:n yleisen tietosuoja-asetuksen (GDPR) mukainen seloste. Päivitetty {SITE.updated}.</>}
        >
            <h2>1. Rekisterinpitäjä</h2>
            <p>
                {SITE.company}{SITE.businessId && ` (Y-tunnus ${SITE.businessId})`}<br />
                {SITE.address && <>{SITE.address}<br /></>}
                Sähköposti: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <p>Tietosuojaan liittyvissä asioissa voit ottaa yhteyttä yllä olevaan sähköpostiosoitteeseen.</p>

            <h2>2. Mitä tietoja käsittelemme</h2>
            <ul>
                <li><strong>Käyttäjätili:</strong> sähköpostiosoite, nimi (jos annat sen) ja salasanan tiiviste.</li>
                <li><strong>Pyörän tiedot:</strong> sarjanumero, merkki, malli, tyyppi, väri, kuvat, kuvaus, kaupunki ja paikka sekä varkaus- tai löytöpäivä.</li>
                <li><strong>Rikosilmoituksen numero</strong>, jos lisäät sen varkausilmoitukseen.</li>
                <li><strong>Yhteystiedot ilmoituksia varten:</strong> sähköposti ja puhelinnumero, jos annat ne.</li>
                <li><strong>Löytäjän sähköposti</strong>, jos annat sen löytöilmoituksen yhteydessä.</li>
                <li><strong>Viestit:</strong> CycleFoundin kautta lähetetyt viestit sekä lähettäjän nimi, sähköposti ja mahdollinen puhelinnumero.</li>
                <li><strong>Tekniset tiedot:</strong> kirjautumisen istuntotiedot selaimessa sekä palvelimien tavanomaiset lokitiedot.</li>
            </ul>

            <h2>3. Käsittelyn tarkoitus ja oikeusperuste</h2>
            <ul>
                <li><strong>Palvelun tarjoaminen (sopimus):</strong> käyttäjätili, pyörän rekisteröinti, varkaus- ja löytöilmoitukset sekä niiden automaattinen vertailu.</li>
                <li><strong>Yhteydenpito omistajan ja löytäjän välillä (sopimus / oikeutettu etu):</strong> viestien välittäminen ja ilmoitukset mahdollisista osumista.</li>
                <li><strong>Väärinkäytösten estäminen (oikeutettu etu):</strong> roskaviestien ja huijausten torjunta sekä palvelun turvallisuus.</li>
            </ul>
            <p>Emme käytä tietojasi mainontaan emmekä myy niitä kenellekään.</p>

            <h2>4. Mitä tietoja näytetään julkisesti</h2>
            <p>
                Varastetuista ja löydetyistä pyöristä näytetään julkisesti merkki, malli, tyyppi, väri, kuvaus,
                kuvat, kaupunki, paikka ja päivämäärä. <strong>Sarjanumeroa, yhteystietoja, rikosilmoituksen
                numeroa ja löytäjän sähköpostia ei näytetä koskaan julkisesti.</strong> Ennakkoon rekisteröidyt
                pyörät eivät näy julkisesti lainkaan.
            </p>
            <p>
                Sarjanumerotarkistus (<a href="/tarkista">Tarkista sarjanumero</a>) kertoo vain, onko koko
                sarjanumerolla tehty ilmoitus, sekä pyörän perustiedot – ei henkilötietoja.
            </p>
            <p>Lähettämäsi viestin ja yhteystietosi näkee vain viestin vastaanottaja (pyörän omistaja tai löytäjä) sekä palvelun ylläpito.</p>

            <h2>5. Tietojen vastaanottajat ja siirrot</h2>
            <p>Käytämme palvelun toteuttamiseen seuraavia palveluntarjoajia, jotka käsittelevät tietoja lukuumme:</p>
            <ul>
                <li><strong>Supabase</strong> – tietokanta, kirjautuminen ja kuvien tallennus</li>
                <li><strong>Vercel</strong> – verkkosivuston ylläpito</li>
                <li><strong>Resend</strong> – sähköposti-ilmoitukset</li>
            </ul>
            <p>
                Jos tietoja siirretään EU/ETA-alueen ulkopuolelle, siirto perustuu Euroopan komission
                vakiosopimuslausekkeisiin tai muuhun GDPR:n mukaiseen siirtoperusteeseen.
            </p>
            <p>Emme luovuta tietoja poliisille tai vakuutusyhtiöille ilman suostumustasi, ellei laki sitä edellytä.</p>

            <h2>6. Säilytysaika</h2>
            <ul>
                <li>Käyttäjätili ja sen pyörät säilytetään, kunnes poistat ne tai tilin.</li>
                <li>Palautetuksi merkityt ilmoitukset poistetaan tai anonymisoidaan viimeistään kahden vuoden kuluttua.</li>
                <li>Viestit säilytetään enintään 12 kuukautta.</li>
                <li>Nimettömät löytöilmoitukset poistetaan viimeistään 12 kuukauden kuluttua.</li>
            </ul>

            <h2>7. Kuvat</h2>
            <p>
                Poistamme kuvista selaimessa automaattisesti sijainti- ja laitetiedot (EXIF) ennen tallennusta.
                Älä lataa kuvia, joissa näkyy ihmisiä, rekisterikilpiä tai kotiosoitteita.
            </p>

            <h2 id="evasteet">8. Evästeet ja selaimen tallennustila</h2>
            <p>
                Käytämme vain palvelun toiminnan kannalta välttämätöntä tallennusta: kirjautumisen istuntotietoa,
                kielivalintaa ja evästevalintaasi. Emme käytä analytiikka- tai mainosevästeitä. Jos niitä otetaan
                myöhemmin käyttöön, kysymme suostumuksesi erikseen.
            </p>

            <h2>9. Oikeutesi</h2>
            <p>Sinulla on oikeus:</p>
            <ul>
                <li>saada pääsy tietoihisi ja pyytää niistä kopio</li>
                <li>oikaista virheelliset tiedot (voit muokata pyöriesi tietoja itse omalla sivullasi)</li>
                <li>pyytää tietojesi poistamista</li>
                <li>vastustaa käsittelyä tai pyytää sen rajoittamista</li>
                <li>siirtää tietosi järjestelmästä toiseen</li>
            </ul>
            <p>Lähetä pyyntö osoitteeseen <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Vastaamme kuukauden kuluessa.</p>
            <p>
                Voit myös tehdä valituksen valvontaviranomaiselle:{" "}
                <a href="https://tietosuoja.fi" target="_blank" rel="noopener noreferrer">Tietosuojavaltuutetun toimisto</a>.
            </p>

            <h2>10. Muutokset</h2>
            <p>Voimme päivittää tätä selostetta. Olennaisista muutoksista ilmoitamme palvelussa.</p>
        </ContentPage>
    );
}
