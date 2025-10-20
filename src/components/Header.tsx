'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      padding: '1rem 2rem',
      zIndex: 1000,
      background: 'rgba(232, 196, 196, 0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: '2px solid #8b7355',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <Link
        href="/"
        style={{
          textDecoration: 'none',
          display: 'inline-block',
          transition: 'transform 0.2s',
          borderRadius: '8px',
          padding: '0.25rem 0.5rem',
          margin: '-0.25rem -0.5rem'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onFocus={(e) => (e.currentTarget.style.outline = '3px solid #a67c52')}
        onBlur={(e) => (e.currentTarget.style.outline = 'none')}
      >
        <h1 style={{
          fontSize: '1.5rem',
          fontFamily: 'Comic Sans MS, cursive',
          fontWeight: 'bold',
          color: '#2d2d2d',
          textShadow: '2px 2px 0px #8b7355',
          margin: 0
        }}>
          Anonasong
        </h1>
      </Link>
    </header>
  )
}
