import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'My Link - 나만의 모든 링크, 단 하나의 주소로.';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// 폰트 데이터 캐싱
let fontData: ArrayBuffer | null = null;

export default async function Image() {
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
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #083344 100%)',
          fontFamily: '"Pretendard", sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '140px',
            height: '140px',
            borderRadius: '40px',
            backgroundImage: 'linear-gradient(to top right, #6366f1, #22d3ee)',
            color: 'white',
            fontSize: '70px',
            fontWeight: 'bold',
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
            marginBottom: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          M
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
          My Link
        </div>
        <div
          style={{
            fontSize: '36px',
            fontWeight: '600',
            color: '#94a3b8',
            display: 'flex',
            letterSpacing: '-0.01em',
          }}
        >
          나만의 모든 링크, 단 하나의 주소로.
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
