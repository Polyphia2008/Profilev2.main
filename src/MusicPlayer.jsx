import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import "./MusicPlayer.css";

const STORAGE_KEY = "profile_music_playlist_v1";
const VOLUME_KEY = "profile_music_volume_v1";
const CURRENT_KEY = "profile_music_current_v1";

/* ---------- URL Resolver ---------- */
function resolveSrc(rawUrl) {
  const url = rawUrl?.trim();
  if (!url) return null;

  const spotifyMatch = url.match(
    /https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i
  );
  if (spotifyMatch) {
    return {
      type: "spotify",
      kind: spotifyMatch[1],
      src: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator`,
    };
  }
  if (url.includes("spotify.link/") || url.includes("spotify.app.link/")) {
    return { type: "spotify-remote", src: url };
  }
  if (/\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url)) {
    return { type: "audio", src: url };
  }
  if (/^https?:\/\/.+/i.test(url) && !/youtube\.com|youtu\.be|soundcloud\.com/i.test(url)) {
    return { type: "audio", src: url };
  }
  return { type: "unsupported", src: url };
}

const DEFAULT_PLAYLIST = [
  {
    id: "default-1",
    title: "Lofi Study - Demo",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
  },
];

/* ---------- Lucide-style icons (inline SVG) ---------- */
const Icon = {
  Play: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  ),
  Pause: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ),
  SkipForward: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" x2="19" y1="5" y2="19" />
    </svg>
  ),
  SkipBack: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="19 20 9 12 19 4 19 20" />
      <line x1="5" x2="5" y1="19" y2="5" />
    </svg>
  ),
  ListMusic: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15V6" />
      <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M12 12H3" />
      <path d="M16 6H3" />
      <path d="M12 18H3" />
    </svg>
  ),
  Music: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...p}>
      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
    </svg>
  ),
  Plus: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  ),
  X: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  Trash: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Volume2: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ),
  VolumeX: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  External: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  ChevronDown: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

/* ---------- Mini Disk (album art) SVG ---------- */
function Disk({ spinning }) {
  return (
    <div className={`mp-disk ${spinning ? "spinning" : ""}`}>
      <svg viewBox="0 0 80 80" className="mp-disk-svg">
        <defs>
          <radialGradient id="diskG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="35%" stopColor="#111" />
            <stop offset="40%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="42%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="38" fill="url(#diskG)" stroke="#22c55e" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" strokeOpacity="0.15" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="#22c55e" strokeOpacity="0.12" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="14" fill="#22c55e" />
        <circle cx="40" cy="40" r="4" fill="#0a0a0a" />
      </svg>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function MusicPlayer() {
  const [playlist, setPlaylist] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [showVol, setShowVol] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const audioRef = useRef(null);

  /* ---------- Load persisted state ---------- */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      setPlaylist(Array.isArray(saved) && saved.length ? saved : DEFAULT_PLAYLIST);
      const v = parseFloat(localStorage.getItem(VOLUME_KEY) || "0.6");
      setVolume(isNaN(v) ? 0.6 : v);
      const i = parseInt(localStorage.getItem(CURRENT_KEY) || "0", 10);
      setCurrentIdx(isNaN(i) ? 0 : i);
    } catch {
      setPlaylist(DEFAULT_PLAYLIST);
    }
  }, []);

  useEffect(() => {
    if (playlist.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
  }, [playlist]);
  useEffect(() => localStorage.setItem(VOLUME_KEY, String(volume)), [volume]);
  useEffect(() => localStorage.setItem(CURRENT_KEY, String(currentIdx)), [currentIdx]);

  const current = playlist[currentIdx];
  const resolved = current ? resolveSrc(current.url) : null;

  /* ---------- Audio element sync ---------- */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !resolved || resolved.type !== "audio") return;
    a.src = resolved.src;
    a.load();
    if (playing && !firstLoad) a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line
  }, [currentIdx, resolved?.src]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.play().catch(() => setPlaying(false));
    else a.pause();
    setFirstLoad(false);
  }, [playing]);

  /* ---------- Controls ---------- */
  const togglePlay = useCallback(() => {
    if (!current) return;
    if (resolved?.type === "spotify-remote" || resolved?.type === "unsupported") {
      window.open(current.url, "_blank", "noopener");
      return;
    }
    setPlaying((p) => !p);
  }, [current, resolved]);

  const next = useCallback(() => {
    if (!playlist.length) return;
    setCurrentIdx((i) => (i + 1) % playlist.length);
    setPlaying(true);
  }, [playlist.length]);

  const prev = useCallback(() => {
    if (!playlist.length) return;
    setCurrentIdx((i) => (i - 1 + playlist.length) % playlist.length);
    setPlaying(true);
  }, [playlist.length]);

  const playAt = (i) => {
    setCurrentIdx(i);
    setPlaying(true);
    setExpanded(false);
  };

  const addSong = () => {
    const url = inputUrl.trim();
    if (!url) return toast.error("Nhập URL bài hát trước nhé!");
    const r = resolveSrc(url);
    if (!r || r.type === "unsupported") {
      return toast.error("Link không hỗ trợ. Dùng link .mp3 hoặc open.spotify.com.");
    }
    const title = inputTitle.trim() || `Bài #${playlist.length + 1}`;
    setPlaylist((p) => [...p, { id: Date.now().toString(), title, url }]);
    setInputUrl("");
    setInputTitle("");
    toast.success(`Đã thêm: ${title}`);
  };

  const removeSong = (id) => {
    setPlaylist((p) => {
      const idx = p.findIndex((s) => s.id === id);
      if (idx === -1) return p;
      const next = p.filter((s) => s.id !== id);
      if (idx === currentIdx && next.length) setCurrentIdx(Math.min(idx, next.length - 1));
      if (next.length === 0) setPlaying(false);
      return next;
    });
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a) return;
    setProgress(a.currentTime);
    if (a.duration) setDuration(a.duration);
  };
  const onEnded = () => (playlist.length > 1 ? next() : setPlaying(false));
  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = parseFloat(e.target.value);
    setProgress(a.currentTime);
  };
  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  if (!current) return null;

  /* ---------- Render ---------- */
  return (
    <div className="mp-root">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onTimeUpdate}
        onEnded={onEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        crossOrigin="anonymous"
        preload="metadata"
      />

      {/* Expanded Panel (appears above mini player) */}
      <div className={`mp-panel ${expanded ? "open" : ""}`}>
        <div className="mp-panel-head">
          <span className="mp-panel-title">🎧 Playlist ({playlist.length})</span>
          <button className="mp-icon-btn" onClick={() => setExpanded(false)} aria-label="Thu gọn">
            <Icon.ChevronDown width={16} height={16} />
          </button>
        </div>

        {/* Spotify embed (only when track playing) */}
        {resolved?.type === "spotify" && (
          <div className="mp-spotify-wrap">
            <iframe
              src={resolved.src}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="mp-spotify-iframe"
              title="Spotify"
            />
          </div>
        )}

        {/* Add form */}
        <div className="mp-add">
          <input
            className="mp-input"
            placeholder="Tên bài (tùy chọn)"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
          />
          <input
            className="mp-input"
            placeholder="Dán link .mp3 hoặc open.spotify.com/track/..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSong()}
          />
          <button className="mp-btn-primary" onClick={addSong}>
            <Icon.Plus width={14} height={14} /> Thêm vào playlist
          </button>
          <p className="mp-hint">Hỗ trợ <b>.mp3/.m4a/.wav</b> & <b>Spotify track/album/playlist</b>.</p>
        </div>

        {/* List */}
        <div className="mp-list">
          {playlist.map((s, i) => {
            const r = resolveSrc(s.url);
            return (
              <div
                key={s.id}
                className={`mp-list-item ${i === currentIdx ? "active" : ""}`}
                onClick={() => playAt(i)}
              >
                <span className="mp-list-idx">
                  {i === currentIdx && playing ? "♪" : i + 1}
                </span>
                <div className="mp-list-info">
                  <span className="mp-list-name">{s.title}</span>
                  <span className="mp-list-meta">
                    {r?.type === "spotify" ? `Spotify · ${r.kind}` : r?.type === "audio" ? "MP3 Audio" : "Link"}
                  </span>
                </div>
                <button
                  className="mp-list-del"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSong(s.id);
                  }}
                  aria-label="Xóa"
                >
                  <Icon.Trash width={13} height={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Player Bar */}
      <div className="mp-bar">
        {/* Progress strip (audio only) */}
        {resolved?.type === "audio" && (
          <div className="mp-progress-strip">
            <div
              className="mp-progress-fill"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={progress}
              onChange={seek}
              className="mp-progress-range"
              aria-label="Tua nhạc"
            />
          </div>
        )}

        <div className="mp-bar-row">
          {/* Disk */}
          <Disk spinning={playing} />

          {/* Title + meta */}
          <div className="mp-meta">
            <span className="mp-now-label">ĐANG PHÁT</span>
            <span className="mp-now-title" title={current.title}>{current.title}</span>
          </div>

          {/* Controls */}
          <div className="mp-controls">
            <button
              className="mp-ctrl-btn"
              onClick={prev}
              disabled={playlist.length < 2}
              aria-label="Bài trước"
              title="Bài trước"
            >
              <Icon.SkipBack width={14} height={14} />
            </button>

            <button
              className={`mp-play-btn ${playing ? "playing" : ""}`}
              onClick={togglePlay}
              aria-label={playing ? "Tạm dừng" : "Phát"}
              title={playing ? "Tạm dừng" : "Phát"}
            >
              {playing ? <Icon.Pause width={13} height={13} /> : <Icon.Play width={13} height={13} />}
            </button>

            <button
              className="mp-ctrl-btn"
              onClick={next}
              disabled={playlist.length < 2}
              aria-label="Bài kế"
              title="Bài kế"
            >
              <Icon.SkipForward width={14} height={14} />
            </button>

            {/* Volume */}
            <div
              className="mp-vol-wrap"
              onMouseEnter={() => setShowVol(true)}
              onMouseLeave={() => setShowVol(false)}
            >
              <button
                className="mp-ctrl-btn"
                onClick={() => setMuted((m) => !m)}
                aria-label="Âm lượng"
                title="Âm lượng"
              >
                {muted || volume === 0 ? <Icon.VolumeX width={14} height={14} /> : <Icon.Volume2 width={14} height={14} />}
              </button>
              <div className={`mp-vol-slider-wrap ${showVol ? "show" : ""}`}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setMuted(false);
                  }}
                  className="mp-vol-slider"
                  aria-label="Chỉnh âm lượng"
                />
              </div>
            </div>

            {/* Playlist toggle */}
            <button
              className={`mp-ctrl-btn mp-list-btn ${expanded ? "active" : ""}`}
              onClick={() => setExpanded((e) => !e)}
              aria-label="Playlist"
              title="Danh sách phát"
            >
              <Icon.ListMusic width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
