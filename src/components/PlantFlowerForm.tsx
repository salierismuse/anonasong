'use client'

import { useState } from 'react'
import { supabase, GARDEN_CONSTRAINTS, Flower } from '@/lib/supabase'
import { isValidMusicUrl, detectMusicPlatform } from '@/lib/music'

interface PlantFlowerFormProps {
  gardenId: string
  gardenName?: string
  onFlowerPlanted: (flower: Flower) => void
}

export default function PlantFlowerForm({ gardenId, gardenName, onFlowerPlanted }: PlantFlowerFormProps) {
  const [songUrl, setSongUrl] = useState('')
  const [note, setNote] = useState('')
  const [isPlanting, setIsPlanting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNoteValid = note.length <= GARDEN_CONSTRAINTS.MAX_NOTE_CHARACTERS
  const isUrlValid = songUrl.trim() && isValidMusicUrl(songUrl.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with:', { songUrl: songUrl.trim(), note: note.trim(), gardenId })
    
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

    setIsPlanting(true)
    setError(null)

    try {
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
        console.error('Supabase error:', flowerCreateError)
        throw flowerCreateError
      }

      console.log('Flower created successfully:', newFlower)
      
      // Call the callback to update the UI
      onFlowerPlanted(newFlower)
      
      // Reset form
      setSongUrl('')
      setNote('')
      
    } catch (err) {
      console.error('Error creating flower:', err)
      setError('Failed to create flower. Please try again.')
    } finally {
      setIsPlanting(false)
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

      {gardenName && (
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: '#faf5ff',
          borderRadius: '0.5rem',
          border: '2px solid #e9d5ff'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#2d2d2d',
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold'
          }}>
            Who is this for? <span style={{ color: '#7c3aed' }}>{gardenName}</span>
          </p>
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
            disabled={isPlanting}
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
            disabled={isPlanting}
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
          disabled={!isUrlValid || !isNoteValid || isPlanting}
          className="plant-button"
          style={{ 
            width: '90%',
            maxWidth: '450px',
            opacity: (!isUrlValid || !isNoteValid || isPlanting) ? 0.5 : 1,
            cursor: (!isUrlValid || !isNoteValid || isPlanting) ? 'not-allowed' : 'pointer'
          }}
        >
          {isPlanting ? 'Planting Song...' : 'Plant Song'}
        </button>
      </div>

      <p style={{ 
        fontSize: '0.75rem', 
        color: '#2d2d2d', 
        textAlign: 'center',
        fontFamily: 'Comic Sans MS, cursive',
        fontWeight: 'bold'
      }}>
        Your song will be planted anonymously. No account required.
      </p>
    </form>
  )
}