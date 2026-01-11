import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import RecentlyLost from "@/components/RecentlyLost";
import FeaturedSections from "@/components/FeaturedSections";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CycleFound",
    "url": "https://bike.voon.fi",
    "logo": "https://bike.voon.fi/logo.png",
    "description": "CycleFound on yhteisöpohjainen polkupyörien turvajärjestelmä ja varkausilmoituspalvelu.",
    "parentOrganization": {
      "@type": "Organization",
      "name": "VoonIQ",
      "url": "https://voon.fi"
    },
    "service": {
      "@type": "Service",
      "name": "Polkupyörän varkausilmoitus ja haku",
      "description": "Rekisteröi kadonneet pyörät ja auta löytämään varastetut polkupyörät communityn avulla."
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        <Hero />
        <Stats />
        <RecentlyLost />
        <FeaturedSections />
      </div>
      <Footer />
    </main>
  );
}
