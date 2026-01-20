import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>페이지를 찾을 수 없습니다</h2>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        요청하신 페이지가 존재하지 않습니다.
      </p>
      <Link 
        href="/"
        scroll={false}
        style={{
          padding: '12px 24px',
          backgroundColor: '#171717',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '500'
        }}
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
