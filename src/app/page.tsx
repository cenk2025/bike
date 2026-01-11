import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import RecentlyLost from "@/components/RecentlyLost";
import FeaturedSections from "@/components/FeaturedSections";

export default function Home() {
  return (
    <main>
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
