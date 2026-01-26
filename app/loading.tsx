import Footer from '@/components/Footer'
import Header from '@/components/Header'
import './loading.css'

export default function Loading() {
  return (
    <>
      <Header />
      <main id="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '32px',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="loading-skeleton" style={{ height: '400px' }} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
