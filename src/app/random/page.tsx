'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Garden } from '@/lib/supabase'

export default function RandomGardenPage() {
  const [randomGarden, setRandomGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadRandomGarden()
  }, [])

  const loadRandomGarden = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get gardens that have flowers using the denormalized flower_count
      const { data: gardens, error } = await supabase
        .from('gardens')
        .select('*')
        .gt('flower_count', 0)
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) throw error

      if (!gardens || gardens.length === 0) {
        setError('No gardens with flowers found yet. Be the first to plant some flowers!')
        return
      }

      // Pick a random garden from the results
      const randomIndex = Math.floor(Math.random() * gardens.length)
      setRandomGarden(gardens[randomIndex])

    } catch (err) {
      console.error('Error loading random garden:', err)
      setError('Failed to load a random garden. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVisitGarden = () => {
    if (randomGarden) {
      router.push(`/garden/${encodeURIComponent(randomGarden.name)}`)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            animation: 'spin 1s linear infinite', 
            borderRadius: '50%', 
            height: '3rem', 
            width: '3rem', 
            borderBottom: '2px solid #9333ea', 
            margin: '0 auto 1rem' 
          }}></div>
          <p style={{ color: '#4b5563' }}>Finding a random garden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="garden-container" style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '500', color: '#dc2626', marginBottom: '1rem' }}>No Gardens Found</h2>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => window.location.reload()}
              className="plant-button"
              style={{ width: '100%' }}
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/search')}
              style={{ 
                color: '#9333ea', 
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.color = '#7c2d12'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.color = '#9333ea'}
            >
              Search for a specific garden
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="garden-container" style={{ maxWidth: '28rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '300', color: '#7c3aed', marginBottom: '1.5rem' }}>
          Random Garden Discovery
        </h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <div className="floating-animation" style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>
            🌸
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '500', color: '#2d2d2d', marginBottom: '0.5rem', fontFamily: 'Comic Sans MS, cursive', textShadow: '1px 1px 0px #f0e8e8' }}>
            {randomGarden?.display_name}&apos;s Garden
          </h2>
          <p style={{ color: '#4b5563' }}>
            Discover what musical flowers have been left here
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={handleVisitGarden}
            className="plant-button"
            style={{ width: '100%' }}
          >
            Visit This Garden
          </button>
          
          <button
            onClick={loadRandomGarden}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              border: '2px solid #e9d5ff',
              color: '#9333ea',
              borderRadius: '1rem',
              background: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = '#c4b5fd';
              (e.target as HTMLButtonElement).style.backgroundColor = '#faf5ff'
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = '#e9d5ff';
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            Find Another Garden
          </button>
          
          <button
            onClick={() => router.push('/search')}
            style={{ 
              color: '#9333ea', 
              textDecoration: 'underline', 
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.color = '#7c2d12'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.color = '#9333ea'}
          >
            Search for a specific garden
          </button>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Discover the musical connections others have made
          </p>
        </div>
      </div>
    </div>
  )
}
