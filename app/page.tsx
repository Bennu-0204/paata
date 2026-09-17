'use client'

import { useState, useRef } from 'react'
import type { Song } from '@/lib/jiosaavn'

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<{ songs: Song[] }>({ songs: [] })
  const [loading, setLoading] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults({ songs: data.songs || [] })
    } catch (error) {
      console.error('Search error:', error)
      setResults({ songs: [] })
    }
    setLoading(false)
  }

  const playSong = (song: Song) => {
    if (song.streamUrls.length === 0) {
      alert('No playable URL available for this song')
      return
    }

    setCurrentSong(song)
    if (audioRef.current) {
      audioRef.current.src = song.streamUrls[3]?.url || song.streamUrls[0].url
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <>
      <div className="header">
        <h1>PAATA</h1>
      </div>

      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </form>

      <div className="results-container">
        {loading && <div className="loading">Loading...</div>}

        {!loading && results.songs.length === 0 && searchQuery && (
          <div className="empty-state">No songs found. Try another search.</div>
        )}

        {!loading && results.songs.length > 0 && (
          <div className="results-grid">
            {results.songs.map((song) => (
              <div key={song.id} className="song-card">
                <img
                  src={song.image}
                  alt={song.title}
                  className="song-image"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.jpg'
                  }}
                />
                <div className="song-info">
                  <div className="song-title">{song.title}</div>
                  <div className="song-artist">{song.artists}</div>
                  <button
                    onClick={() => playSong(song)}
                    className="play-btn"
                  >
                    {currentSong?.id === song.id && isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.songs.length === 0 && !searchQuery && (
          <div className="empty-state">
            <p>Search for your favorite music to get started</p>
          </div>
        )}
      </div>

      {currentSong && (
        <div className="player-container">
          <div className="player-content">
            <img
              src={currentSong.image}
              alt={currentSong.title}
              className="player-image"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.jpg'
              }}
            />
            <div className="player-info">
              <div className="player-title">{currentSong.title}</div>
              <div className="player-artist">{currentSong.artists}</div>
            </div>
            <div className="player-controls">
              <button onClick={togglePlayPause} className="control-btn">
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} />
    </>
  )
}
