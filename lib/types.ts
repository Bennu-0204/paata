export type Quality = "12" | "48" | "96" | "160" | "320"

export interface StreamUrl {
  quality: Quality
  url: string
}

export interface Song {
  id: string
  title: string
  subtitle: string
  type: "song"
  image: string
  album: string | null
  albumId: string | null
  artists: string
  primaryArtists: { id: string; name: string }[]
  duration: number
  year: string | null
  language: string | null
  playCount: number | null
  permaUrl: string
  hasLyrics: boolean
  streamUrls: StreamUrl[]
}

export interface AlbumBrief {
  id: string
  title: string
  subtitle: string
  type: "album"
  image: string
  year: string | null
  language: string | null
  permaUrl: string
}

export interface PlaylistBrief {
  id: string
  title: string
  subtitle: string
  type: "playlist"
  image: string
  songCount: number | null
  permaUrl: string
}

export interface ArtistBrief {
  id: string
  name: string
  type: "artist"
  image: string
  permaUrl: string
}

export interface AlbumDetail extends AlbumBrief {
  songs: Song[]
}

export interface PlaylistDetail extends PlaylistBrief {
  songs: Song[]
}

export interface SearchResults {
  songs: Song[]
  albums: AlbumBrief[]
  playlists: PlaylistBrief[]
  artists: ArtistBrief[]
}

export interface HomeData {
  trending: (AlbumBrief | PlaylistBrief)[]
  albums: AlbumBrief[]
  playlists: PlaylistBrief[]
  charts: PlaylistBrief[]
}
