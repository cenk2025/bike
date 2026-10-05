import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import BikeSearch from "@/components/BikeSearch";
import RecentlyLost from "@/components/RecentlyLost";
import FeaturedSections from "@/components/FeaturedSections";
import HowItWorks from "@/components/home/HowItWorks";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BikeBack",
    "url": "https://bike.voon.fi",
    "logo": "https://bike.voon.fi/logo.png",
    "description": "BikeBack on yhteisöpohjainen polkupyörien turvajärjestelmä ja varkausilmoituspalvelu.",
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
      <Hero />
      <div className="shell-section" style={{ paddingBottom: '60px' }}>
        <HowItWorks />
        <BikeSearch />
        <Stats />
        <RecentlyLost />
        <div className="container">
          <FeaturedSections />
        </div>
      </div>
      <Footer />
    </main>
  );
}
