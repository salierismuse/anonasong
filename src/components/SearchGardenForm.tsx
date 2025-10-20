'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GARDEN_CONSTRAINTS } from '@/lib/supabase'

export default function SearchGardenForm() {
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
    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <input
            type="text"
            value={gardenName}
            onChange={(e) => setGardenName(e.target.value)}
            placeholder="Find a garden"
            className="search-input"
            maxLength={GARDEN_CONSTRAINTS.MAX_NAME_LENGTH}
            disabled={isSearching}
            aria-describedby="search-hint"
            style={{
              width: '90%',
              maxWidth: '450px',
              textAlign: 'center'
            }}
          />
        </div>
        <p
          id="search-hint"
          style={{
            fontSize: '0.75rem',
            color: '#2d2d2d',
            marginTop: '0.5rem',
            textAlign: 'center',
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold',
            textShadow: '1px 1px 0px #f0e8e8'
          }}
        >
          {gardenName.length}/{GARDEN_CONSTRAINTS.MAX_NAME_LENGTH} characters
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <button
          type="submit"
          disabled={!gardenName.trim() || isSearching}
          className="plant-button"
          style={{
            width: '90%',
            maxWidth: '450px',
            fontSize: '1.1rem',
            padding: '1.25rem 2rem',
            opacity: (!gardenName.trim() || isSearching) ? 0.5 : 1,
            cursor: (!gardenName.trim() || isSearching) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSearching ? 'Searching...' : 'Visit Garden'}
        </button>
      </div>
    </form>
  )
}
