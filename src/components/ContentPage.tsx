import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinnishOnlyNote from "@/components/FinnishOnlyNote";

/** Shared shell for long-form text pages (privacy policy, terms, help). */
export default function ContentPage({ title, intro, children }: { title: string; intro?: React.ReactNode; children: React.ReactNode }) {
    return (
        <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
            <Header />
            <article className="container content-page" style={{ maxWidth: '760px', padding: '60px 24px 80px' }}>
                <FinnishOnlyNote />
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}>{title}</h1>
                {intro && <div style={{ color: 'var(--text-muted)', fontSize: '17px', lineHeight: 1.6, marginBottom: '40px' }}>{intro}</div>}
                {children}
            </article>
            <Footer />
        </main>
    );
}
