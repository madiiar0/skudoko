import PageTopbar from '../components/PageTopbar'

export default function PlaceholderPage({ title, icon }) {
  return (
    <div className="placeholder-page">
      <PageTopbar title={title} subtitle="This section is not built yet." />

      <div className="placeholder-body">
        <div style={{ color: 'rgba(255,122,26,0.5)' }}>{icon}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Coming soon</p>
      </div>
    </div>
  )
}
