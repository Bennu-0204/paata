"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { Song } from "@/lib/types"

type RepeatMode = "off" | "all" | "one"

interface PlayerState {
  queue: Song[]
  currentIndex: number
  current: Song | null
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
}

interface PlayerContextValue extends PlayerState {
  playNow: (song: Song, queue?: Song[]) => void
  playQueue: (songs: Song[], startIndex?: number) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  addToQueue: (song: Song) => void
  playAt: (index: number) => void
  removeAt: (index: number) => void
  clearQueue: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

function bestStreamUrl(song: Song): string | null {
  if (!song.streamUrls?.length) return null
  const order = ["320", "160", "96", "48", "12"]
  for (const q of order) {
    const found = song.streamUrls.find((s) => s.quality === q)
    if (found) return found.url
  }
  return song.streamUrls[0].url
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [queue, setQueue] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [muted, setMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<RepeatMode>("off")

  const current = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null

  const loadAndPlay = useCallback((song: Song | null) => {
    const audio = audioRef.current
    if (!audio || !song) return
    const url = bestStreamUrl(song)
    if (!url) {
      setIsPlaying(false)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    audio.src = url
    audio.play().catch(() => setIsPlaying(false))
  }, [])

  // Load the media whenever the current track changes.
  useEffect(() => {
    if (current) loadAndPlay(current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id])

  const playQueue = useCallback((songs: Song[], startIndex = 0) => {
    const playable = songs.filter((s) => s.streamUrls?.length)
    if (!playable.length) return
    setQueue(playable)
    setCurrentIndex(Math.min(startIndex, playable.length - 1))
  }, [])

  const playNow = useCallback((song: Song, contextQueue?: Song[]) => {
    if (contextQueue?.length) {
      const playable = contextQueue.filter((s) => s.streamUrls?.length)
      const idx = playable.findIndex((s) => s.id === song.id)
      setQueue(playable)
      setCurrentIndex(idx >= 0 ? idx : 0)
    } else {
      setQueue([song])
      setCurrentIndex(0)
    }
  }, [])

  const addToQueue = useCallback((song: Song) => {
    if (!song.streamUrls?.length) return
    setQueue((q) => {
      if (q.some((s) => s.id === song.id)) return q
      const nq = [...q, song]
      setCurrentIndex((ci) => (ci < 0 ? 0 : ci))
      return nq
    })
  }, [])

  const playAt = useCallback((index: number) => {
    setCurrentIndex((ci) => (index >= 0 ? index : ci))
  }, [])

  const removeAt = useCallback((index: number) => {
    setQueue((q) => {
      const nq = q.filter((_, i) => i !== index)
      setCurrentIndex((ci) => {
        if (index < ci) return ci - 1
        if (index === ci) return Math.min(ci, nq.length - 1)
        return ci
      })
      return nq
    })
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setCurrentIndex(-1)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute("src")
    }
  }, [])

  const next = useCallback(() => {
    setCurrentIndex((ci) => {
      if (queue.length === 0) return ci
      if (shuffle) {
        if (queue.length === 1) return ci
        let n = ci
        while (n === ci) n = Math.floor(Math.random() * queue.length)
        return n
      }
      if (ci < queue.length - 1) return ci + 1
      return repeat === "all" ? 0 : ci
    })
  }, [queue.length, shuffle, repeat])

  const prev = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    setCurrentIndex((ci) => {
      if (ci > 0) return ci - 1
      return repeat === "all" ? queue.length - 1 : ci
    })
  }, [queue.length, repeat])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [current])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = time
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    setMuted(v === 0)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const nm = !m
      if (audioRef.current) audioRef.current.muted = nm
      return nm
    })
  }, [])

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), [])
  const cycleRepeat = useCallback(
    () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    [],
  )

  // Audio element event handlers.
  const handleEnded = useCallback(() => {
    if (repeat === "one") {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
      return
    }
    setCurrentIndex((ci) => {
      if (queue.length === 0) return ci
      if (shuffle) {
        if (queue.length === 1) {
          const audio = audioRef.current
          if (audio) {
            audio.currentTime = 0
            audio.play().catch(() => {})
          }
          return ci
        }
        let n = ci
        while (n === ci) n = Math.floor(Math.random() * queue.length)
        return n
      }
      if (ci < queue.length - 1) return ci + 1
      if (repeat === "all") return 0
      setIsPlaying(false)
      return ci
    })
  }, [queue.length, shuffle, repeat])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setCurrentTime(audio.currentTime)
    const onDuration = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsLoading(true)
    const onPlaying = () => setIsLoading(false)
    const onCanPlay = () => setIsLoading(false)

    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("loadedmetadata", onDuration)
    audio.addEventListener("durationchange", onDuration)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("playing", onPlaying)
    audio.addEventListener("canplay", onCanPlay)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("loadedmetadata", onDuration)
      audio.removeEventListener("durationchange", onDuration)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("playing", onPlaying)
      audio.removeEventListener("canplay", onCanPlay)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [handleEnded])

  // Media Session API for OS-level controls.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
    if (!current) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artists,
      album: current.album ?? "",
      artwork: current.image ? [{ src: current.image, sizes: "500x500", type: "image/jpeg" }] : [],
    })
    navigator.mediaSession.setActionHandler("play", () => toggle())
    navigator.mediaSession.setActionHandler("pause", () => toggle())
    navigator.mediaSession.setActionHandler("nexttrack", () => next())
    navigator.mediaSession.setActionHandler("previoustrack", () => prev())
  }, [current, toggle, next, prev])

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentIndex,
      current,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      playNow,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playAt,
      removeAt,
      clearQueue,
    }),
    [
      queue,
      currentIndex,
      current,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      playNow,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playAt,
      removeAt,
      clearQueue,
    ],
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="metadata" />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider")
  return ctx
}
