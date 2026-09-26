import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
    title: "Käyttöehdot | BikeBack",
    description: "BikeBack-palvelun käyttöehdot."
};

export default function TermsPage() {
    return (
        <ContentPage title="Käyttöehdot" intro={<>Voimassa {SITE.updated} alkaen.</>}>
            <h2>1. Palvelu</h2>
            <p>
                BikeBack ({SITE.url}) on {SITE.company}:n ylläpitämä maksuton palvelu, jonka avulla voi
                rekisteröidä pyörän, ilmoittaa varastetusta tai löydetystä pyörästä ja tarkistaa, onko pyörä
                ilmoitettu varastetuksi. Palvelu vertaa ilmoituksia automaattisesti ja välittää viestejä
                omistajien ja löytäjien välillä.
            </p>

            <h2>2. Käyttäjän vastuut</h2>
            <ul>
                <li>Annat tiedot totuudenmukaisesti ja ilmoitat vain omia tai itse löytämiäsi pyöriä.</li>
                <li>Et tee vääriä varkaus- tai löytöilmoituksia etkä yritä saada haltuusi toisen pyörää.</li>
                <li>Et käytä viestitoimintoa häirintään, mainontaan tai huijauksiin.</li>
                <li>Et lataa kuvia, joissa näkyy tunnistettavia ihmisiä tai joihin sinulla ei ole oikeutta.</li>
                <li>Pidät kirjautumistietosi salassa.</li>
            </ul>

            <h2>3. Löydetyt pyörät</h2>
            <p>
                Löytötavaralain mukaan löydöstä on ilmoitettava omistajalle tai poliisille. BikeBack auttaa
                löytämään omistajan, mutta ei korvaa löytäjän lakisääteisiä velvollisuuksia. Pyörän saa luovuttaa
                vain henkilölle, joka pystyy osoittamaan omistajuutensa.
            </p>

            <h2>4. Palvelun rajoitukset</h2>
            <p>
                Emme takaa, että pyörä löytyy, että automaattiset osumat ovat oikeita tai että käyttäjien antamat
                tiedot pitävät paikkansa. Varmista aina pyörän omistajuus ennen luovutusta. BikeBack ei ole
                osapuoli käyttäjien välisissä sopimuksissa tai tapaamisissa.
            </p>
            <p>
                BikeBack ei korvaa rikosilmoitusta. Tee varkaudesta aina ilmoitus poliisille osoitteessa{" "}
                <a href="https://poliisi.fi/rikosilmoitus" target="_blank" rel="noopener noreferrer">poliisi.fi</a>.
            </p>

            <h2>5. Sisällön poistaminen ja tilin sulkeminen</h2>
            <p>
                Voimme poistaa ilmoituksia tai viestejä ja sulkea tilejä, jotka rikkovat näitä ehtoja tai lakia.
                Voit poistaa omat ilmoituksesi ja pyytää tilisi poistamista milloin tahansa.
            </p>

            <h2>6. Vastuunrajoitus</h2>
            <p>
                Palvelu tarjotaan sellaisenaan. {SITE.company} ei vastaa välillisistä vahingoista eikä vahingoista,
                jotka johtuvat käyttäjien toiminnasta, palvelun katkoksista tai virheellisistä tiedoista, ellei
                pakottava lainsäädäntö muuta edellytä.
            </p>

            <h2>7. Henkilötiedot</h2>
            <p>Henkilötietojen käsittelyä kuvataan <a href="/tietosuoja">tietosuojaselosteessa</a>.</p>

            <h2>8. Muutokset ja sovellettava laki</h2>
            <p>
                Voimme muuttaa näitä ehtoja. Olennaisista muutoksista ilmoitamme palvelussa. Ehtoihin sovelletaan
                Suomen lakia. Kuluttajalla on oikeus viedä riita kuluttajariitalautakunnan käsiteltäväksi.
            </p>

            <h2>9. Yhteystiedot</h2>
            <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
        </ContentPage>
    );
}
