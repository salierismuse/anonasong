'use client'

import { useState } from 'react'
import CreateFlowerForm from '@/components/CreateFlowerForm'
import SearchGardenForm from '@/components/SearchGardenForm'

export default function HomePage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSearchForm, setShowSearchForm] = useState(false)

  return (
    <div style={{
      height: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      animation: 'fadeIn 0.8s ease-out',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        fontSize: '2.5rem',
        animation: 'drift 8s ease-in-out infinite, twinkle 3s ease-in-out infinite',
        animationDelay: '0s',
        opacity: 0.7
      }}>🌟</div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        fontSize: '2rem',
        animation: 'drift 10s ease-in-out infinite, twinkle 4s ease-in-out infinite',
        animationDelay: '1s',
        opacity: 0.7
      }}>✨</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        fontSize: '1.8rem',
        animation: 'drift 12s ease-in-out infinite, twinkle 3.5s ease-in-out infinite',
        animationDelay: '2s',
        opacity: 0.7
      }}>💫</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        fontSize: '2rem',
        animation: 'drift 9s ease-in-out infinite, twinkle 4.5s ease-in-out infinite',
        animationDelay: '0.5s',
        opacity: 0.7
      }}>⭐</div>

      {/* Content centered - no absolute positioning */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        zIndex: 10,
        width: '100%',
        maxWidth: '42rem',
        marginTop: showCreateForm || showSearchForm ? '-4rem' : '-8rem'
      }}>
        {/* Title - only show when no forms are active */}
        {!showCreateForm && !showSearchForm && (
          <h1 className="retro-title floating-animation" style={{
            fontSize: '3rem',
            color: '#2d2d2d',
            textShadow: '3px 3px 0px #8b7355, 0 0 20px rgba(212, 165, 165, 0.8), 0 0 30px rgba(165, 196, 212, 0.6)',
            textAlign: 'center',
            margin: 0
          }}>
            Anonasong
          </h1>
        )}

        {/* Main action box */}
        {!showCreateForm && !showSearchForm ? (
        <div style={{ width: '100%' }}>
          <div className="garden-container" style={{ width: '100%' }}>
            {/* Guiding principle - inside card at top */}
            <p style={{
              color: '#8b7355',
              fontSize: '1.1rem',
              fontFamily: 'Comic Sans MS, cursive',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '1.5rem',
              fontStyle: 'italic',
              textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)'
            }}>
              💭 What song should they listen to?
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '1.5rem',
              color: '#2d2d2d',
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '1px 1px 0px #f0e8e8'
            }}>
              Choose Your Action
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              width: '100%',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setShowCreateForm(true)}
                className="plant-button"
                style={{ width: '85%', fontSize: '1.1rem', padding: '1.25rem 2rem' }}
              >
                🌱 Plant a Flower
              </button>

              <button
                onClick={() => setShowSearchForm(true)}
                className="plant-button"
                style={{ width: '85%', fontSize: '1.1rem', padding: '1.25rem 2rem' }}
              >
                🔍 Search Gardens
              </button>
            </div>
          </div>
        </div>
        ) : showCreateForm ? (
        <div className="garden-container" style={{ width: '100%', maxWidth: '36rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2d2d2d',
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '1px 1px 0px #f0e8e8'
            }}>
              Plant a Flower
            </h2>
            <button
              onClick={() => setShowCreateForm(false)}
              aria-label="Close form"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#2d2d2d',
                fontFamily: 'Comic Sans MS, cursive',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>

          <CreateFlowerForm />
        </div>
        ) : (
        <div className="garden-container" style={{ width: '100%', maxWidth: '36rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2d2d2d',
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '1px 1px 0px #f0e8e8'
            }}>
              Search Gardens
            </h2>
            <button
              onClick={() => setShowSearchForm(false)}
              aria-label="Close form"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#2d2d2d',
                fontFamily: 'Comic Sans MS, cursive',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>

          <SearchGardenForm />
        </div>
        )}
      </div>
    </div>
  )
}