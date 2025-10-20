'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GARDEN_CONSTRAINTS } from '@/lib/supabase'

export default function SearchPage() {
  const [gardenName, setGardenName] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!gardenName.trim()) return
    
    // Validate name length
    if (gardenName.length > GARDEN_CONSTRAINTS.MAX_NAME_LENGTH) {
      alert(`Garden names must be ${GARDEN_CONSTRAINTS.MAX_NAME_LENGTH} characters or less`)
      return
    }
    
    setIsSearching(true)
    
    // Navigate to garden page
    router.push(`/garden/${encodeURIComponent(gardenName.trim().toLowerCase())}`)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="garden-container" style={{ maxWidth: '28rem', width: '100%' }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: '1.5rem', 
          color: '#2d2d2d',
          fontFamily: 'Comic Sans MS, cursive',
          textShadow: '1px 1px 0px #f0e8e8'
        }}>
          Find a Garden
        </h1>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input
                type="text"
                value={gardenName}
                onChange={(e) => setGardenName(e.target.value)}
                placeholder="Enter a name..."
                className="search-input"
                maxLength={GARDEN_CONSTRAINTS.MAX_NAME_LENGTH}
                disabled={isSearching}
                style={{
                  width: '90%',
                  maxWidth: '450px',
                  textAlign: 'center'
                }}
              />
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#2d2d2d',
              marginTop: '0.5rem',
              textAlign: 'center',
              fontFamily: 'Comic Sans MS, cursive',
              fontWeight: 'bold',
              textShadow: '1px 1px 0px #f0e8e8'
            }}>
              {gardenName.length}/{GARDEN_CONSTRAINTS.MAX_NAME_LENGTH} characters
            </p>
          </div>
          
          <button
            type="submit"
            disabled={!gardenName.trim() || isSearching}
            className="plant-button"
            style={{ 
              width: '100%', 
              opacity: (!gardenName.trim() || isSearching) ? 0.5 : 1,
              cursor: (!gardenName.trim() || isSearching) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSearching ? 'Searching...' : 'Visit Garden'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#2d2d2d', 
            marginBottom: '0.5rem',
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold',
            textShadow: '1px 1px 0px #f0e8e8'
          }}>Or explore randomly:</p>
          <button
            onClick={() => router.push('/random')}
            style={{ 
              color: '#2d2d2d', 
              textDecoration: 'underline', 
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Comic Sans MS, cursive',
              fontWeight: 'bold',
              textShadow: '1px 1px 0px #f0e8e8'
            }}
            onMouseOver={(e) => e.target.style.color = '#a67c52'}
            onMouseOut={(e) => e.target.style.color = '#2d2d2d'}
          >
            Discover Random Gardens
          </button>
        </div>
      </div>
    </div>
  )
}
