'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Garden, Flower } from '@/lib/supabase'
import FlowerCard from '@/components/FlowerCard'
import PlantFlowerForm from '@/components/PlantFlowerForm'

export default function GardenPage() {
  const params = useParams()
  const gardenName = decodeURIComponent(params.name as string)
  
  const [garden, setGarden] = useState<Garden | null>(null)
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalFlowers, setTotalFlowers] = useState(0)
  const FLOWERS_PER_PAGE = 24

  useEffect(() => {
    loadGarden()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gardenName])

  useEffect(() => {
    if (garden) {
      loadFlowers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garden?.id, currentPage])

  const loadGarden = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Loading garden for: ${gardenName} (attempt ${retryCount + 1})`)

      // First, try to find existing garden
      const { data: existingGarden, error: findError } = await supabase
        .from('gardens')
        .select('*')
        .eq('name', gardenName.toLowerCase())
        .order('garden_index', { ascending: true })
        .limit(1)
        .single()

      let currentGarden = existingGarden

      // If garden doesn't exist, create it
      if (!existingGarden || findError?.code === 'PGRST116') {
        console.log('Garden not found, creating new one...')
        const { data: newGarden, error: createError } = await supabase
          .from('gardens')
          .insert([{ 
            name: gardenName.toLowerCase(),
            display_name: gardenName,
            garden_index: 0
          }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating garden:', createError)
          throw createError
        }
        
        currentGarden = newGarden
        console.log('Created new garden:', currentGarden)
      } else {
        console.log('Found existing garden:', currentGarden)
      }

      setGarden(currentGarden)

    } catch (err) {
      console.error('Error loading garden:', err)
      
      // Retry once if it's a network error or similar
      if (retryCount < 1) {
        console.log('Retrying garden load...')
        setTimeout(() => loadGarden(retryCount + 1), 1000)
        return
      }
      
      setError('Failed to load garden. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadFlowers = async () => {
    if (!garden) return

    try {
      // Get total count of flowers
      const { count, error: countError } = await supabase
        .from('flowers')
        .select('*', { count: 'exact', head: true })
        .eq('garden_id', garden.id)

      if (countError) {
        console.error('Error counting flowers:', countError)
      } else {
        setTotalFlowers(count || 0)
      }

      // Load flowers for current page (most recent first)
      const { data: gardenFlowers, error: flowersError } = await supabase
        .from('flowers')
        .select('*')
        .eq('garden_id', garden.id)
        .order('planted_at', { ascending: false })
        .range(currentPage * FLOWERS_PER_PAGE, (currentPage + 1) * FLOWERS_PER_PAGE - 1)

      if (flowersError) {
        console.error('Error loading flowers:', flowersError)
        throw flowersError
      }

      console.log('Loaded flowers:', gardenFlowers)
      setFlowers(gardenFlowers || [])

    } catch (err) {
      console.error('Error loading flowers:', err)
      setError('Failed to load flowers. Please try again.')
    }
  }

  const handleFlowerPlanted = (newFlower: Flower) => {
    // If on first page, add the new flower to the top
    if (currentPage === 0) {
      setFlowers(prev => [newFlower, ...prev].slice(0, FLOWERS_PER_PAGE))
    }
    // Update total count
    setTotalFlowers(prev => prev + 1)
    // Refresh garden data to get updated flower count
    if (garden) {
      setGarden(prev => prev ? { ...prev, flower_count: prev.flower_count + 1 } : null)
    }
  }

  const goToNextPage = () => {
    if ((currentPage + 1) * FLOWERS_PER_PAGE < totalFlowers) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
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
          <p style={{ color: '#4b5563' }}>Loading garden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="garden-container" style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '500', color: '#dc2626', marginBottom: '1rem' }}>Error</h2>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="plant-button"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalFlowers / FLOWERS_PER_PAGE)
  const hasNextPage = (currentPage + 1) * FLOWERS_PER_PAGE < totalFlowers
  const hasPreviousPage = currentPage > 0

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Garden Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="floating-animation" style={{ fontSize: '3rem', fontWeight: '300', color: '#2d2d2d', marginBottom: '1rem', fontFamily: 'Comic Sans MS, cursive', textShadow: '1px 1px 0px #f0e8e8' }}>
            {gardenName}&apos;s Garden
          </h1>
          <p style={{ color: '#2d2d2d', fontFamily: 'Comic Sans MS, cursive', fontWeight: 'bold', textShadow: '1px 1px 0px #f0e8e8' }}>
            {totalFlowers} {totalFlowers === 1 ? 'flower' : 'flowers'} planted
          </p>
        </div>

        {/* Plant a Flower Box - Always at top center when garden has flowers */}
        {garden && flowers.length > 0 && (
          <div style={{ maxWidth: '36rem', margin: '0 auto 3rem auto' }}>
            <div className="garden-container">
              <h2 style={{ fontSize: '1.5rem', fontWeight: '500', textAlign: 'center', marginBottom: '1.5rem', color: '#2d2d2d', fontFamily: 'Comic Sans MS, cursive', textShadow: '1px 1px 0px #f0e8e8' }}>
                Plant a Flower
              </h2>
              <PlantFlowerForm
                gardenId={garden.id}
                onFlowerPlanted={handleFlowerPlanted}
              />
            </div>
          </div>
        )}

        {/* Empty Garden - Show planting form centered */}
        {flowers.length === 0 && garden && (
          <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
            <div className="garden-container" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '500', color: '#2d2d2d', marginBottom: '1rem', fontFamily: 'Comic Sans MS, cursive', textShadow: '1px 1px 0px #f0e8e8' }}>
                Welcome to {gardenName}&apos;s Garden
              </h2>
              <p style={{ color: '#2d2d2d', marginBottom: '1.5rem', fontFamily: 'Comic Sans MS, cursive', fontWeight: 'bold', textShadow: '1px 1px 0px #f0e8e8' }}>
                No flowers have been planted here yet. Be the first to leave a musical gift!
              </p>
              <PlantFlowerForm
                gardenId={garden.id}
                onFlowerPlanted={handleFlowerPlanted}
              />
            </div>
          </div>
        )}

        {/* Flowers Grid - Below the planting box */}
        {flowers.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {flowers.map((flower) => (
              <FlowerCard
                key={flower.id}
                flower={flower}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {flowers.length > 0 && totalFlowers > FLOWERS_PER_PAGE && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <button
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage}
              aria-label="Go to previous page"
              style={{
                fontSize: '2rem',
                background: 'none',
                border: 'none',
                cursor: hasPreviousPage ? 'pointer' : 'not-allowed',
                color: hasPreviousPage ? '#2d2d2d' : '#ccc',
                transition: 'transform 0.2s',
                padding: '0.5rem'
              }}
              onMouseEnter={(e) => hasPreviousPage && (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ←
            </button>

            <div
              role="status"
              aria-live="polite"
              style={{
                fontFamily: 'Comic Sans MS, cursive',
                fontWeight: 'bold',
                color: '#2d2d2d',
                textShadow: '1px 1px 0px #f0e8e8'
              }}
            >
              Page {currentPage + 1} of {totalPages}
            </div>

            <button
              onClick={goToNextPage}
              disabled={!hasNextPage}
              aria-label="Go to next page"
              style={{
                fontSize: '2rem',
                background: 'none',
                border: 'none',
                cursor: hasNextPage ? 'pointer' : 'not-allowed',
                color: hasNextPage ? '#2d2d2d' : '#ccc',
                transition: 'transform 0.2s',
                padding: '0.5rem'
              }}
              onMouseEnter={(e) => hasNextPage && (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
