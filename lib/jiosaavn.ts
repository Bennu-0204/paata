import CryptoJS from "crypto-js"
import type {
  AlbumBrief,
  AlbumDetail,
  ArtistBrief,
  HomeData,
  PlaylistBrief,
  PlaylistDetail,
  Quality,
  SearchResults,
  Song,
  StreamUrl,
} from "./types"

const API_BASE = "https://www.jiosaavn.com/api.php"
const DES_KEY = CryptoJS.enc.Utf8.parse("38346591")
const QUALITIES: Quality[] = ["12", "48", "96", "160", "320"]

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
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
    // JioSaavn responses change frequently; keep them fresh but allow brief caching.
    next: { revalidate: 300 },
  })

  if (!res.ok) {
    throw new Error(`JioSaavn request failed: ${res.status}`)
  }

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    // Some endpoints wrap JSON in a callback / stray characters.
    const start = text.indexOf("{")
    const startArr = text.indexOf("[")
    const idx =
      startArr !== -1 && (start === -1 || startArr < start) ? startArr : start
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
  if (!image) return ""
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
    type: "song",
    image: hiRes(raw.image),
    album: decode(more.album) || null,
    albumId: more.album_id ?? null,
    artists:
      decode(more.artistMap ? primary.map((a) => a.name).join(", ") : more.music) ||
      decode(raw.subtitle),
    primaryArtists: primary.map((a) => ({ id: String(a.id), name: decode(a.name) })),
    duration: Number(more.duration ?? raw.duration ?? 0),
    year: raw.year ?? null,
    language: raw.language ?? null,
    playCount: raw.play_count ? Number(raw.play_count) : null,
    permaUrl: raw.perma_url ?? "",
    hasLyrics: more.has_lyrics === "true",
    streamUrls: decryptStreamUrls(more.encrypted_media_url, is320),
  }
}

function normalizeAlbumBrief(raw: AnyRecord): AlbumBrief {
  return {
    id: String(raw.id),
    title: decode(raw.title),
    subtitle: decode(raw.subtitle) || decode(raw.more_info?.artistMap?.artists?.[0]?.name) || "",
    type: "album",
    image: hiRes(raw.image),
    year: raw.year ?? raw.more_info?.year ?? null,
    language: raw.language ?? raw.more_info?.language ?? null,
    permaUrl: raw.perma_url ?? "",
  }
}

function normalizePlaylistBrief(raw: AnyRecord): PlaylistBrief {
  const more = raw.more_info ?? {}
  const count = more.song_count ?? raw.list_count ?? raw.numsongs
  return {
    id: String(raw.id),
    title: decode(raw.title),
    subtitle: decode(raw.subtitle) || decode(more.subtitle) || "",
    type: "playlist",
    image: hiRes(raw.image),
    songCount: count ? Number(count) : null,
    permaUrl: raw.perma_url ?? "",
  }
}

function normalizeArtistBrief(raw: AnyRecord): ArtistBrief {
  return {
    id: String(raw.id),
    name: decode(raw.title ?? raw.name),
    type: "artist",
    image: hiRes(raw.image),
    permaUrl: raw.perma_url ?? "",
  }
}

export async function searchAll(query: string): Promise<SearchResults> {
  // autocomplete gives a good mix but its songs are not playable (no media url),
  // so pull playable songs from search.getResults and the rest from autocomplete.
  const [songs, auto] = await Promise.all([
    searchSongs(query, 1, 20),
    call({ __call: "autocomplete.get", query, cc: "in", includeMetaTags: "1" }).catch(() => ({}) as AnyRecord),
  ])

  return {
    songs,
    albums: (auto.albums?.data ?? []).map(normalizeAlbumBrief),
    playlists: (auto.playlists?.data ?? []).map(normalizePlaylistBrief),
    artists: (auto.artists?.data ?? []).map(normalizeArtistBrief),
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

export async function getAlbum(id: string): Promise<AlbumDetail> {
  const data = await call({ __call: "content.getAlbumDetails", albumid: id })
  return {
    ...normalizeAlbumBrief(data),
    songs: (data.list ?? data.songs ?? []).map(normalizeSong),
  }
}

export async function getPlaylist(id: string): Promise<PlaylistDetail> {
  const data = await call({ __call: "playlist.getDetails", listid: id })
  return {
    ...normalizePlaylistBrief(data),
    songs: (data.list ?? []).map(normalizeSong),
  }
}

export async function getSong(id: string): Promise<Song | null> {
  const data = await call({ __call: "song.getDetails", pids: id })
  const list = data.songs ?? data[id]?.songs ?? Object.values(data)
  const raw = Array.isArray(list) ? list[0] : list
  return raw ? normalizeSong(raw) : null
}

export async function getSongSuggestions(id: string, limit = 20): Promise<Song[]> {
  try {
    const station = await call({
      __call: "webradio.createEntityStation",
      entity_id: id,
      entity_type: "queue",
    })
    const stationId = station.stationid
    if (!stationId) return []
    const data = await call({
      __call: "webradio.getSong",
      stationid: stationId,
      k: String(limit),
    })
    const songs: Song[] = []
    for (const key of Object.keys(data)) {
      if (key === "stationid") continue
      const raw = data[key]?.song
      if (raw) songs.push(normalizeSong(raw))
    }
    return songs
  } catch {
    return []
  }
}

export async function getHome(): Promise<HomeData> {
  const data = await call({ __call: "webapi.getLaunchData" })
  const trending: (AlbumBrief | PlaylistBrief)[] = (data.new_trending ?? [])
    .filter((x: AnyRecord) => x.type === "album" || x.type === "playlist")
    .map((x: AnyRecord) => (x.type === "album" ? normalizeAlbumBrief(x) : normalizePlaylistBrief(x)))

  const albums: AlbumBrief[] = (data.new_albums ?? [])
    .filter((x: AnyRecord) => x.type === "album")
    .map(normalizeAlbumBrief)

  const playlistSource: AnyRecord[] = data.top_playlists ?? data.featured_playlists ?? []
  const playlists: PlaylistBrief[] = playlistSource
    .filter((x: AnyRecord) => x.type === "playlist")
    .map(normalizePlaylistBrief)

  const charts: PlaylistBrief[] = (data.charts ?? [])
    .map(normalizePlaylistBrief)

  return { trending, albums, playlists, charts }
}
