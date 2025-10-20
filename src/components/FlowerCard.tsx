import { Flower } from '@/lib/supabase'
import { getMusicEmbedUrl, detectMusicPlatform } from '@/lib/music'

interface FlowerCardProps {
  flower: Flower
}

export default function FlowerCard({ flower }: FlowerCardProps) {
  const embedUrl = getMusicEmbedUrl(flower.song_input)
  const platform = detectMusicPlatform(flower.song_input)

  return (
    <div className="flower-card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{flower.flower_type}</span>
        <div>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#2d2d2d',
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold',
            textShadow: '1px 1px 0px #f0e8e8'
          }}>
            Planted {new Date(flower.planted_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {flower.note && (
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#2d2d2d', 
          marginBottom: '0.5rem',
          fontFamily: 'Comic Sans MS, cursive',
          fontWeight: 'bold',
          textShadow: '1px 1px 0px #f0e8e8'
        }}>
          &ldquo;{flower.note}&rdquo;
        </p>
      )}
      
      {embedUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#2d2d2d',
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold',
            textShadow: '1px 1px 0px #f0e8e8'
          }}>
            Listen{platform === 'spotify' ? ' on Spotify' : platform === 'youtube' ? ' on YouTube' : platform === 'apple' ? ' on Apple Music' : ''}:
          </p>
          <iframe
            src={embedUrl}
            width="100%"
            height={platform === 'youtube' ? '200' : platform === 'apple' ? '175' : '152'}
            frameBorder="0"
            allow={platform === 'youtube' ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' : 'encrypted-media'}
            allowFullScreen={platform === 'youtube'}
            style={{ borderRadius: '0.5rem' }}
            title={`${platform === 'spotify' ? 'Spotify' : platform === 'youtube' ? 'YouTube' : 'Apple Music'} player for ${flower.flower_type} flower`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}