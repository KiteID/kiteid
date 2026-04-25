import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAF7F0',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(201, 152, 106, 0.08) 0%, transparent 70%)',
          display: 'flex',
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: '#C9986A',
            letterSpacing: '-0.02em',
          }}
        >
          Kite
        </span>
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#C9986A',
            letterSpacing: '-0.02em',
          }}
        >
          ID
        </span>
      </div>

      {/* Domain name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#141414',
            letterSpacing: '-0.03em',
          }}
        >
          {decodedName}
        </span>
        <span
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#C9986A',
            letterSpacing: '-0.03em',
          }}
        >
          .kite
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: 24,
          color: '#9B8564',
          marginTop: 20,
        }}
      >
        Your identity on Kite AI
      </p>

      {/* Footer bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #C9986A 0%, #9B8564 100%)',
          display: 'flex',
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
