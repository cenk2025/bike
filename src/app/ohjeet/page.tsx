import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
    title: "Ohjeet ja turvavinkit | CycleFound",
    description: "Näin CycleFound toimii, miten suojaat pyöräsi ja mitä tehdä, kun pyörä katoaa tai löytyy."
};

export default function HelpPage() {
    return (
        <ContentPage
            title="Ohjeet ja turvavinkit"
            intro="Näin CycleFound toimii – ja mitä kannattaa tehdä ennen varkautta, sen jälkeen ja kun löydät pyörän."
        >
            <h2>Näin CycleFound toimii</h2>
            <ul>
                <li><strong>Rekisteröi pyöräsi ennakkoon.</strong> Tiedot eivät näy julkisesti, mutta ne ovat valmiina, jos pyörä katoaa.</li>
                <li><strong>Ilmoita varkaudesta.</strong> Ilmoitus tulee julkiseksi, ja sitä verrataan automaattisesti jokaiseen löytöilmoitukseen.</li>
                <li><strong>Löysitkö pyörän?</strong> Tee löytöilmoitus – käyttäjätiliä ei tarvita. Jos pyörä vastaa jonkun ilmoitusta, omistaja saa tiedon heti.</li>
                <li><strong>Automaattinen osuma.</strong> Vertailu käyttää sarjanumeroa, merkkiä, mallia, väriä, kaupunkia ja päivämäärää. Omistaja vahvistaa tai hylkää osuman.</li>
                <li><strong>Viestit kulkevat CycleFoundin kautta.</strong> Kenenkään yhteystietoja ei näytetä julkisesti.</li>
            </ul>

            <h2 id="turvavinkit">Ennen varkautta</h2>
            <ul>
                <li><strong>Ota sarjanumero talteen.</strong> Se löytyy yleensä rungon alta polkimien välistä. Kuvaa se ja koko pyörä eri puolilta.</li>
                <li><strong>Säilytä ostokuitti.</strong> Se on paras todiste omistajuudesta.</li>
                <li><strong><Link href="/ilmoita-varkaudesta?tila=rekisteroi">Rekisteröi pyörä CycleFoundiin</Link>.</strong></li>
                <li><strong>Lukitse kunnolla.</strong> Käytä U- tai ketjulukkoa ja lukitse runko kiinteään telineeseen – ei pelkkää rengasta.</li>
                <li><strong>Harkitse paikanninta</strong> (esim. AirTag tai GPS-paikannin) piilotettuna runkoon tai satulaputkeen.</li>
                <li><strong>Tarkista kotivakuutus.</strong> Kattaako se pyörän ja millä ehdoilla (esim. lukitusvaatimus)?</li>
            </ul>

            <h2>Kun pyörä on varastettu</h2>
            <ul>
                <li>Tee <a href="https://poliisi.fi/rikosilmoitus" target="_blank" rel="noopener noreferrer">rikosilmoitus poliisille</a> ja kirjaa ilmoituksen numero.</li>
                <li><Link href="/ilmoita-varkaudesta">Ilmoita varkaudesta CycleFoundissa</Link> tai muuta ennakkoon rekisteröity pyöräsi varastetuksi omalta sivultasi.</li>
                <li>Ilmoita vakuutusyhtiöösi.</li>
                <li>Seuraa Tori.fi:tä, Facebook Marketplacea ja paikallisia kirpputoriryhmiä.</li>
                <li>Jos näet pyöräsi myynnissä, <strong>älä mene hakemaan sitä yksin</strong> – ilmoita poliisille.</li>
            </ul>

            <h2>Kun löydät pyörän</h2>
            <ul>
                <li><Link href="/loydetyt">Tee löytöilmoitus</Link> ja lisää sarjanumero, jos löydät sen.</li>
                <li>Löytötavaralain mukaan löydöstä on ilmoitettava omistajalle tai poliisille.</li>
                <li>Luovuta pyörä vain henkilölle, joka pystyy todistamaan omistajuutensa (kuitti, sarjanumero, vanhat kuvat).</li>
                <li>Tapaa julkisella paikalla.</li>
            </ul>

            <h2>Kun ostat käytetyn pyörän</h2>
            <ul>
                <li><Link href="/tarkista">Tarkista sarjanumero</Link> ennen ostoa – itse rungosta, ei myyjän ilmoittamana.</li>
                <li>Pyydä kuitti tai muu todiste omistajuudesta.</li>
                <li>Epäile, jos hinta on selvästi alle markkinahinnan tai sarjanumero on viilattu pois.</li>
            </ul>

            <h2>Huijausten tunnistaminen</h2>
            <ul>
                <li><strong>Älä koskaan maksa etukäteen</strong> pyöräsi palauttamisesta tai &quot;löytöpalkkiota&quot; ennen kuin näet pyörän.</li>
                <li>Älä lähetä tunnistautumis- tai pankkitunnuksia kenellekään.</li>
                <li>Epäile viestejä, joissa on kiire tai linkkejä maksusivuille.</li>
            </ul>

            <h2>Ota yhteyttä</h2>
            <p>Kysyttävää tai huomasitko väärinkäytöksen? Kirjoita meille: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
        </ContentPage>
    );
}
