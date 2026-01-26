import Footer from '@/components/Footer'
import Header from '@/components/Header'
import '../../loading.css'

export default function Loading() {
  return (
    <>
      <Header />
      <main id="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <div
            className="loading-skeleton"
            style={{ width: '80%', height: '48px', marginBottom: '24px' }}
          />
          <div
            className="loading-skeleton"
            style={{ width: '70%', height: '24px', marginBottom: '48px' }}
          />
          <div
            className="loading-skeleton"
            style={{ height: '400px', width: '100%', marginBottom: '48px' }}
          />
          <div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="loading-skeleton"
                style={{ height: '16px', width: i % 3 === 0 ? '90%' : '100%', marginBottom: '8px' }}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
