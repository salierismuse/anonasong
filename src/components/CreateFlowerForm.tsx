'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, GARDEN_CONSTRAINTS } from '@/lib/supabase'
import { isValidMusicUrl, detectMusicPlatform } from '@/lib/music'

export default function CreateFlowerForm() {
  const [gardenName, setGardenName] = useState('')
  const [songUrl, setSongUrl] = useState('')
  const [note, setNote] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isNoteValid = note.length <= GARDEN_CONSTRAINTS.MAX_NOTE_CHARACTERS
  const isUrlValid = songUrl.trim() && isValidMusicUrl(songUrl.trim())
  const isGardenNameValid = gardenName.trim().length > 0 && gardenName.length <= GARDEN_CONSTRAINTS.MAX_NAME_LENGTH

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Create flower form submitted with:', { 
      gardenName: gardenName.trim(), 
      songUrl: songUrl.trim(), 
      note: note.trim() 
    })
    
    // Check if Supabase is configured
    if (!supabase) {
      setError('Database connection not configured. Please check your environment variables.')
      return
    }
    
    if (!gardenName.trim()) {
      setError('Garden name is required')
      return
    }

    if (!isGardenNameValid) {
      setError(`Garden name must be ${GARDEN_CONSTRAINTS.MAX_NAME_LENGTH} characters or less`)
      return
    }

    if (!songUrl.trim()) {
      setError('Song URL is required')
      return
    }

    if (!isValidMusicUrl(songUrl.trim())) {
      setError('Please enter a valid Spotify, YouTube, or Apple Music URL')
      return
    }

    if (!isNoteValid) {
      setError(`Note must be ${GARDEN_CONSTRAINTS.MAX_NOTE_CHARACTERS} characters or less`)
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Test Supabase connection first
      console.log('Testing Supabase connection...')
      const { error: testError } = await supabase
        .from('gardens')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('Supabase connection test failed:', testError)
        setError('Database connection failed. Please check your configuration.')
        return
      }
      console.log('Supabase connection test passed')
      
      // Use the get_or_create_garden function
      console.log('Getting or creating garden for:', gardenName.trim())
      const { data: gardenId, error: gardenError } = await supabase
        .rpc('get_or_create_garden', {
          p_name: gardenName.trim(),
          p_display_name: gardenName.trim()
        })

      if (gardenError) {
        console.error('Error getting/creating garden:', gardenError)
        throw gardenError
      }

      console.log('Got garden ID:', gardenId)

      // Detect the platform
      const platform = detectMusicPlatform(songUrl.trim())

      // Create the flower
      const flowerData = {
        garden_id: gardenId,
        song_input: songUrl.trim(),
        song_type: platform,
        flower_type: '🌸', // Default flower emoji
        note: note.trim() || null
      }
      
      console.log('Inserting flower data:', flowerData)
      
      const { data: newFlower, error: flowerCreateError } = await supabase
        .from('flowers')
        .insert([flowerData])
        .select()
        .single()

      if (flowerCreateError) {
        console.error('Supabase error creating flower:', flowerCreateError)
        throw flowerCreateError
      }

      console.log('Flower created successfully:', newFlower)
      
      // Navigate to the garden page
      router.push(`/garden/${encodeURIComponent(gardenName.trim().toLowerCase())}`)
      
    } catch (err) {
      console.error('Error creating flower:', err)
      setError('Failed to create flower. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem',
      width: '100%'
    }}>
      {error && (
        <div style={{ 
          backgroundColor: '#f5e6e6', 
          border: '1px solid #d4a5a5', 
          color: '#8b4513', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          fontFamily: 'Comic Sans MS, cursive',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <div style={{ width: '100%' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: 'bold', 
          color: '#2d2d2d', 
          marginBottom: '0.5rem',
          fontFamily: 'Comic Sans MS, cursive',
          textAlign: 'center'
        }}>
          Garden Name *
        </label>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <input
            type="text"
            value={gardenName}
            onChange={(e) => setGardenName(e.target.value)}
            placeholder="Enter garden name..."
            className="search-input"
            maxLength={GARDEN_CONSTRAINTS.MAX_NAME_LENGTH}
            required
            disabled={isCreating}
            aria-describedby="garden-name-hint"
            style={{
              width: '90%',
              maxWidth: '450px',
              textAlign: 'center'
            }}
          />
        </div>
        <p
          id="garden-name-hint"
          style={{
            fontSize: '0.75rem',
            color: '#2d2d2d',
            marginTop: '0.25rem',
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          {gardenName.length}/{GARDEN_CONSTRAINTS.MAX_NAME_LENGTH} characters
        </p>
      </div>

      <div style={{ width: '100%' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          color: '#2d2d2d',
          marginBottom: '0.5rem',
          fontFamily: 'Comic Sans MS, cursive',
          textAlign: 'center'
        }}>
          Song URL (Spotify, YouTube, or Apple Music) *
        </label>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <input
            type="url"
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            placeholder="Spotify, YouTube, or Apple Music URL..."
            className="search-input"
            required
            disabled={isCreating}
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
          marginTop: '0.25rem',
          fontFamily: 'Comic Sans MS, cursive',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Paste a link from Spotify, YouTube, or Apple Music
        </p>
      </div>

      <div style={{ width: '100%' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: 'bold', 
          color: '#2d2d2d', 
          marginBottom: '0.5rem',
          fontFamily: 'Comic Sans MS, cursive',
          textAlign: 'center'
        }}>
          Note (optional)
        </label>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why does this song remind you of them?"
            className="search-input"
            style={{ 
              resize: 'none', 
              height: '5rem',
              width: '90%',
              maxWidth: '450px',
              textAlign: 'center'
            }}
            maxLength={GARDEN_CONSTRAINTS.MAX_NOTE_CHARACTERS}
            disabled={isCreating}
          />
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginTop: '0.25rem',
          gap: '1rem'
        }}>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#2d2d2d',
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold'
          }}>
            {note.length}/{GARDEN_CONSTRAINTS.MAX_NOTE_CHARACTERS} characters
          </p>
          {!isNoteValid && (
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#8b4513',
              fontFamily: 'Comic Sans MS, cursive',
              fontWeight: 'bold'
            }}>
              Too many characters
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <button
          type="submit"
          disabled={!isGardenNameValid || !isUrlValid || !isNoteValid || isCreating}
          className="plant-button"
          style={{ 
            width: '90%',
            maxWidth: '450px',
            opacity: (!isGardenNameValid || !isUrlValid || !isNoteValid || isCreating) ? 0.5 : 1,
            cursor: (!isGardenNameValid || !isUrlValid || !isNoteValid || isCreating) ? 'not-allowed' : 'pointer'
          }}
        >
          {isCreating ? 'Creating Flower...' : 'Plant Flower'}
        </button>
      </div>

      <p style={{ 
        fontSize: '0.75rem', 
        color: '#2d2d2d', 
        textAlign: 'center',
        fontFamily: 'Comic Sans MS, cursive',
        fontWeight: 'bold'
      }}>
        Your flower will be planted anonymously. No account required.
      </p>
    </form>
  )
}