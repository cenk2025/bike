import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Stats from "@/components/Stats";
import FinnishOnlyNote from "@/components/FinnishOnlyNote";
import { ShieldCheck, Building2, Store, Home, Siren, ArrowRight, Search, Sparkles, MessageSquare } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
    title: "Kumppaneille | BikeBack",
    description: "BikeBack vakuutusyhtiöille, kaupungeille, pyöräliikkeille ja taloyhtiöille: vähemmän korvauksia, vähemmän hylättyjä pyöriä, enemmän palautuksia."
};

const mail = (subject: string) => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;

const SEGMENTS = [
    {
        icon: ShieldCheck,
        title: "Vakuutusyhtiöt",
        points: [
            "Löytynyt pyörä = vältetty tai palautuva korvaus.",
            "Sarjanumerotarkistus korvauskäsittelyyn: onko pyörä ilmoitettu löydetyksi tai myyty eteenpäin?",
            "Ennakkorekisteröinti asiakasetuna: sarjanumero, kuvat ja kuitti valmiina vahingon sattuessa.",
            "Yhteisbrändätty näkyvyys pyöräilijöille juuri oikealla hetkellä."
        ],
        cta: "Kumppanuus – vakuutusyhtiö"
    },
    {
        icon: Building2,
        title: "Kaupungit ja poliisi",
        points: [
            "Siirrettyjen ja hylättyjen pyörien massailmoitus: omistajat löytyvät automaattisesti.",
            "Vähemmän löytötavaroiden käsittelyä ja varastointia.",
            "Kansalaiset ilmoittavat varkaudet valmiiksi jäsenneltyinä (sarjanumero, rikosilmoituksen numero).",
            "Anonymisoitu tilannekuva varkauksien alueista ja ajankohdista."
        ],
        cta: "Kumppanuus – kaupunki / viranomainen"
    },
    {
        icon: Store,
        title: "Pyöräliikkeet ja huollot",
        points: [
            "Rekisteröi pyörä asiakkaan puolesta myyntihetkellä – lisäarvoa ilman lisätyötä.",
            "Tarkista huoltoon tulevan tai vaihdossa otettavan pyörän sarjanumero sekunneissa.",
            "Näkyvyys BikeBackissa luotettavana kumppanina."
        ],
        cta: "Kumppanuus – pyöräliike"
    },
    {
        icon: Home,
        title: "Taloyhtiöt ja isännöitsijät",
        points: [
            "Kevään pyöräsiivouksen löydöt yhdellä ilmoituksella – omistajat saavat tiedon automaattisesti.",
            "Vähemmän hylättyjä pyöriä ja kierrätyskuluja.",
            "Palvelu asukkaille: rekisteröi pyörät taloyhtiön nimissä."
        ],
        cta: "Kumppanuus – taloyhtiö"
    }
];

const STEPS = [
    { icon: ShieldCheck, title: "Rekisteröinti", text: "Omistaja tallentaa sarjanumeron, kuvat ja tuntomerkit – julkisesti tai ennakkoon yksityisesti." },
    { icon: Siren, title: "Varkaus tai löytö", text: "Varkaus- ja löytöilmoitukset tulevat samaan järjestelmään. Löytäjä ei tarvitse käyttäjätiliä." },
    { icon: Sparkles, title: "Automaattinen osuma", text: "Järjestelmä vertaa sarjanumeroa, merkkiä, mallia, väriä, paikkaa ja aikaa – myös kirjoitusvirheistä huolimatta." },
    { icon: MessageSquare, title: "Turvallinen yhteydenotto", text: "Omistaja ja löytäjä viestivät BikeBackin kautta. Kenenkään yhteystietoja ei julkaista." }
];

export default function PartnersPage() {
    return (
        <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
            <Header />

            <section style={{ backgroundColor: '#0a0a0a', color: '#fff', padding: '80px 0' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '13px', marginBottom: '16px' }}>KUMPPANEILLE</p>
                    <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
                        Jokainen palautettu pyörä on vältetty korvaus, yksi rikos vähemmän ja tyytyväinen asiakas.
                    </h1>
                    <p style={{ fontSize: '18px', color: '#bbb', lineHeight: 1.6, marginBottom: '32px' }}>
                        BikeBack yhdistää varkaus-, löytö- ja rekisteröintitiedot yhteen paikkaan ja löytää osumat
                        automaattisesti. Aloitamme Suomesta ja laajennamme koko Pohjolaan.
                    </p>
                    <a href={mail("Kumppanuus – BikeBack")} className="primary-button" style={{ padding: '16px 28px', fontSize: '17px' }}>
                        Varaa esittely <ArrowRight size={20} />
                    </a>
                </div>
            </section>

            <div className="container" style={{ padding: '20px 24px 0' }}>
                <div style={{ marginTop: '20px' }}><FinnishOnlyNote /></div>
                <Stats />
            </div>

            <section className="container" style={{ padding: '40px 24px' }}>
                <h2 className="section-title">Näin se toimii</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {STEPS.map(({ icon: Icon, title, text }, i) => (
                        <div key={title} className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <span style={{ backgroundColor: 'var(--primary)', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>{i + 1}</span>
                                <Icon size={20} />
                            </div>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '15px' }}>{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container" style={{ padding: '40px 24px' }}>
                <h2 className="section-title">Kenelle</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    {SEGMENTS.map(({ icon: Icon, title, points, cta }) => (
                        <div key={title} className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '12px', display: 'flex' }}><Icon size={22} color="#2e7d32" /></div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{title}</h3>
                            </div>
                            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.55, marginBottom: '24px', flex: 1 }}>
                                {points.map(p => <li key={p}>{p}</li>)}
                            </ul>
                            <a href={mail(cta)} style={{ color: 'var(--primary-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Ota yhteyttä <ArrowRight size={16} />
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container" style={{ padding: '40px 24px 80px' }}>
                <div className="card" style={{ padding: '40px', textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px' }}>Aloitetaan pilotilla</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '620px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                        Kolmen kuukauden pilotti yhdessä kaupungissa tai asiakasryhmässä. Mittaamme ilmoitukset,
                        osumat ja palautukset – ja päätätte jatkosta tulosten perusteella.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href={mail("Pilotti – BikeBack")} className="primary-button" style={{ padding: '14px 24px' }}>Ehdota pilottia</a>
                        <Link href="/tarkista" className="secondary-button" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Search size={18} /> Kokeile sarjanumerotarkistusta
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
