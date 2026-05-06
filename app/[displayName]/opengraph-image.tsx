import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'My Link Profile';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

let fontData: ArrayBuffer | null = null;

export default async function Image({ params }: { params: Promise<{ displayName: string }> }) {
  const { displayName } = await params;
  const decodedName = decodeURIComponent(displayName).replace(/^@/, '');
  
  if (!fontData) {
    try {
      const res = await fetch(
        'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf'
      );
      if (res.ok) {
        fontData = await res.arrayBuffer();
      }
    } catch (e) {
      console.error('Failed to load font:', e);
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #020617 100%)',
          fontFamily: '"Pretendard", sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '40px',
            padding: '80px 100px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '140px',
              height: '140px',
              borderRadius: '70px',
              backgroundImage: 'linear-gradient(to top right, #6366f1, #22d3ee)',
              color: 'white',
              fontSize: '64px',
              fontWeight: 'bold',
              marginBottom: '40px',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
            }}
          >
            {decodedName.charAt(0).toUpperCase()}
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: '900',
              color: '#ffffff',
              marginBottom: '20px',
              display: 'flex',
              letterSpacing: '-0.02em',
            }}
          >
            @{decodedName}
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: '500',
              color: '#94a3b8',
              display: 'flex',
              letterSpacing: '-0.01em',
            }}
          >
            나의 모든 것을 담은 페이지
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#6366f1',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '12px',
            }}
          >
            M
          </div>
          <div style={{ color: '#64748b', fontSize: '24px', fontWeight: 'bold' }}>
            My Link
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [
        {
          name: 'Pretendard',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ] : undefined,
    }
  );
}
