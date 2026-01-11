export default function Stats() {
    const stats = [
        { label: "LÖYDETTY", value: "1,240", color: "var(--primary)" },
        { label: "KADONNUT TÄNÄÄN", value: "42", color: "var(--secondary)" },
        { label: "AKTIIVISET KÄYTTÄJÄT", value: "15k", color: "var(--text)" }
    ];

    return (
        <section className="container" style={{ margin: '40px auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {stats.map((stat, index) => (
                    <div key={index} className="card" style={{ textAlign: 'center', borderTop: `4px solid ${stat.color}` }}>
                        <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>{stat.value}</h3>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
