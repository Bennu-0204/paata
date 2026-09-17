// @ts-ignore
import CryptoJS from "crypto-js"
export interface Song {
  id: string
  title: string
  subtitle: string
  image: string
  artists: string
  duration: number
  streamUrls: StreamUrl[]
  album: string | null
  year: number | null
}

export interface StreamUrl {
  quality: string
  url: string
}

export interface AlbumBrief {
  id: string
  title: string
  subtitle: string
  image: string
  year: number | null
}

export interface PlaylistBrief {
  id: string
  title: string
  subtitle: string
  image: string
  songCount: number | null
}

export interface SearchResults {
  songs: Song[]
  albums: AlbumBrief[]
  playlists: PlaylistBrief[]
}

const API_BASE = "https://www.jiosaavn.com/api.php"
const DES_KEY = CryptoJS.enc.Utf8.parse("38346591")
const QUALITIES = ["12", "48", "96", "160", "320"]

type AnyRecord = Record<string, any>

async function call(params: Record<string, string>): Promise<AnyRecord> {
  const search = new URLSearchParams({
    _format: "json",
    _marker: "0",
    api_version: "4",
    ctx: "web6dot0",
    ...params,
  })

  const res = await fetch(`${API_BASE}?${search.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  if (!res.ok) throw new Error(`API request failed: ${res.status}`)

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf("{")
    const startArr = text.indexOf("[")
    const idx = startArr !== -1 && (start === -1 || startArr < start) ? startArr : start
    return JSON.parse(text.slice(idx))
  }
}

function decode(str: string | undefined | null): string {
  if (!str) return ""
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
}

function hiRes(image: string | undefined): string {
  if (!image) return "/placeholder.jpg"
  return image.replace("http://", "https://").replace(/50x50|150x150/g, "500x500")
}

function decryptStreamUrls(encrypted: string | undefined, is320: boolean): StreamUrl[] {
  if (!encrypted) return []
  try {
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encrypted) } as CryptoJS.lib.CipherParams,
      DES_KEY,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 },
    ).toString(CryptoJS.enc.Utf8)

    if (!decrypted) return []

    const base = is320 ? decrypted.replace("_96.mp4", "_320.mp4") : decrypted
    return QUALITIES.map((quality) => ({
      quality,
      url: base.replace(/_(12|48|96|160|320)\.mp4/, `_${quality}.mp4`),
    }))
  } catch {
    return []
  }
}

function normalizeSong(raw: AnyRecord): Song {
  const more = raw.more_info ?? {}
  const artistMap = more.artistMap ?? {}
  const primary: AnyRecord[] = artistMap.primary_artists ?? artistMap.artists ?? []
  const is320 = more["320kbps"] === "true" || more["320kbps"] === true

  return {
    id: raw.id,
    title: decode(raw.title ?? raw.song),
    subtitle: decode(raw.subtitle),
    image: hiRes(raw.image),
    album: decode(more.album) || null,
    artists: decode(more.artistMap ? primary.map((a) => a.name).join(", ") : more.music) || decode(raw.subtitle),
    duration: Number(more.duration ?? raw.duration ?? 0),
    year: raw.year ?? null,
    streamUrls: decryptStreamUrls(more.encrypted_media_url, is320),
  }
}

function normalizeAlbumBrief(raw: AnyRecord): AlbumBrief {
  return {
    id: String(raw.id),
    title: decode(raw.title),
    subtitle: decode(raw.subtitle) || decode(raw.more_info?.artistMap?.artists?.[0]?.name) || "",
    image: hiRes(raw.image),
    year: raw.year ?? raw.more_info?.year ?? null,
  }
}

function normalizePlaylistBrief(raw: AnyRecord): PlaylistBrief {
  const more = raw.more_info ?? {}
  const count = more.song_count ?? raw.list_count ?? raw.numsongs
  return {
    id: String(raw.id),
    title: decode(raw.title),
    subtitle: decode(raw.subtitle) || decode(more.subtitle) || "",
    image: hiRes(raw.image),
    songCount: count ? Number(count) : null,
  }
}

export async function searchAll(query: string): Promise<SearchResults> {
  const [songs, auto] = await Promise.all([
    searchSongs(query, 1, 20),
    call({ __call: "autocomplete.get", query, cc: "in", includeMetaTags: "1" }).catch(() => ({}) as AnyRecord),
  ])

  return {
    songs,
    albums: (auto.albums?.data ?? []).map(normalizeAlbumBrief),
    playlists: (auto.playlists?.data ?? []).map(normalizePlaylistBrief),
  }
}

export async function searchSongs(query: string, page = 1, limit = 30): Promise<Song[]> {
  const data = await call({
    __call: "search.getResults",
    q: query,
    p: String(page),
    n: String(limit),
    _rendition: "true",
  })
  return (data.results ?? []).map(normalizeSong)
}

export async function searchAlbums(query: string, page = 1, limit = 20): Promise<AlbumBrief[]> {
  const data = await call({ __call: "search.getAlbumResults", q: query, p: String(page), n: String(limit) })
  return (data.results ?? []).map(normalizeAlbumBrief)
}

export async function searchPlaylists(query: string, page = 1, limit = 20): Promise<PlaylistBrief[]> {
  const data = await call({ __call: "search.getPlaylistResults", q: query, p: String(page), n: String(limit) })
  return (data.results ?? []).map(normalizePlaylistBrief)
}
