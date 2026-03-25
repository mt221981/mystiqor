export default function DebugPage() {
  return (
    <div style={{
      background: '#15132b',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      gap: '20px',
      padding: '40px',
    }}>
      <h1 style={{ fontSize: '48px' }}>MystiQor Debug</h1>
      <p style={{ fontSize: '24px', color: '#ddb8ff' }}>If you see this, Next.js renders correctly.</p>
      <div style={{ marginTop: '20px', textAlign: 'right', direction: 'rtl' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>בדיקות:</h2>
        <ul style={{ listStyle: 'none', fontSize: '18px', lineHeight: 2 }}>
          <li>✅ Next.js App Router works</li>
          <li>✅ Server component renders</li>
          <li>⬜ Supabase: check /debug/api</li>
        </ul>
      </div>
      <a href="/login" style={{ color: '#4edea3', fontSize: '20px', marginTop: '20px' }}>
        Go to Login →
      </a>
    </div>
  );
}
