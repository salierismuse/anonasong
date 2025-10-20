// Music platform utility functions for Spotify, YouTube, and Apple Music

export type MusicPlatform = 'spotify' | 'youtube' | 'apple' | 'unknown'

/**
 * Extract Spotify track ID from various URL formats
 * Supports:
 * - https://open.spotify.com/track/{id}
 * - https://spotify.com/track/{id}
 * - spotify:track:{id}
 */
export const extractSpotifyTrackId = (url: string): string | null => {
  const patterns = [
    /spotify\.com\/track\/([a-zA-Z0-9]+)/,
    /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
    /spotify:track:([a-zA-Z0-9]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v={id}
 * - https://youtu.be/{id}
 * - https://m.youtube.com/watch?v={id}
 * - https://youtube.com/watch?v={id}
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Extract Apple Music song ID from URL
 * Supports:
 * - https://music.apple.com/us/album/ALBUM_NAME/ALBUM_ID?i=SONG_ID
 * - https://music.apple.com/us/song/SONG_NAME/SONG_ID
 */
export const extractAppleMusicId = (url: string): { songId: string; albumId?: string } | null => {
  // Album with song ID
  const albumSongPattern = /music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/(\d+)\?i=(\d+)/
  const albumSongMatch = url.match(albumSongPattern)
  if (albumSongMatch) {
    return { albumId: albumSongMatch[1], songId: albumSongMatch[2] }
  }

  // Direct song ID
  const songPattern = /music\.apple\.com\/[a-z]{2}\/song\/[^/]+\/(\d+)/
  const songMatch = url.match(songPattern)
  if (songMatch) {
    return { songId: songMatch[1] }
  }

  return null
}

/**
 * Detect which music platform a URL belongs to
 */
export const detectMusicPlatform = (url: string): MusicPlatform => {
  if (extractSpotifyTrackId(url)) return 'spotify'
  if (extractYouTubeVideoId(url)) return 'youtube'
  if (extractAppleMusicId(url)) return 'apple'
  return 'unknown'
}

/**
 * Validate if a string is a valid music URL from any supported platform
 */
export const isValidMusicUrl = (url: string): boolean => {
  return detectMusicPlatform(url) !== 'unknown'
}

/**
 * Validate if a string is a valid Spotify URL
 */
export const isValidSpotifyUrl = (url: string): boolean => {
  return extractSpotifyTrackId(url) !== null
}

/**
 * Generate Spotify embed URL from track ID
 */
export const getSpotifyEmbedUrl = (trackId: string): string => {
  return `https://open.spotify.com/embed/track/${trackId}`
}

/**
 * Generate YouTube embed URL from video ID
 */
export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Generate Apple Music embed URL from song/album IDs
 */
export const getAppleMusicEmbedUrl = (songId: string, albumId?: string): string => {
  if (albumId) {
    return `https://embed.music.apple.com/us/album/${albumId}?i=${songId}`
  }
  return `https://embed.music.apple.com/us/song/${songId}`
}

/**
 * Get embed URL for any supported music platform
 */
export const getMusicEmbedUrl = (url: string): string | null => {
  const platform = detectMusicPlatform(url)

  switch (platform) {
    case 'spotify': {
      const trackId = extractSpotifyTrackId(url)
      return trackId ? getSpotifyEmbedUrl(trackId) : null
    }
    case 'youtube': {
      const videoId = extractYouTubeVideoId(url)
      return videoId ? getYouTubeEmbedUrl(videoId) : null
    }
    case 'apple': {
      const ids = extractAppleMusicId(url)
      return ids ? getAppleMusicEmbedUrl(ids.songId, ids.albumId) : null
    }
    default:
      return null
  }
}
