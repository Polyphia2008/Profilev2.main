import React, { useState, useRef, useEffect } from "react";

/**
 * Mini Music Player — đơn giản, góc dưới trái/phải.
 * - Hỗ trợ MP3 direct link
 * - Hỗ trợ Spotify (track/playlist/album) qua iframe embed
 * - Không phụ thuộc thư viện ngoài ngoài React
 */

const DEFAULT_PLAYLIST = [
  {
    title: "Spotify — Nhạc của tôi",
    type: "spotify",
    src: "https://open.spotify.com/embed/playlist/37i9dQZF1E4t7f2s2qB9kR?utm_source=generator",
  },
];

// Utility: detect Spotify URL -> convert sang embed URL
const toSpotifyEmbed = (url) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/);
  if (!m) return "";
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`;
};

const isSpotifyUrl = (url) => /open\.spotify\.com\//i.test(url || "");
const isMp3Url = (url) => /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url || "");

export default function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const [playlist, setPlaylist] = useState(() => {
    try {
      const saved = localStorage.getItem("mp_playlist");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PLAYLIST;
  });
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("mp_playlist", JSON.stringify(playlist));
    } catch (e) {}
  }, [playlist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Dừng audio khi chuyển bài
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (playing) audioRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const track = playlist[current] || playlist[0];

  const togglePlay = () => {
    if (!track || track.type === "spotify") {
      setPlaying(!playing);
      return;
    }
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setPlaying(!playing);
    }
  };

  const next = () => {
    if (playlist.length === 0) return;
    setCurrent((c) => (c + 1) % playlist.length);
  };
  const prev = () => {
    if (playlist.length === 0) return;
    setCurrent((c) => (c - 1 + playlist.length) % playlist.length);
  };

  const addTrack = (e) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) return;
    let type = "mp3";
    let src = url;
    if (isSpotifyUrl(url)) {
      type = "spotify";
      src = toSpotifyEmbed(url);
      if (!src) return;
    } else if (!isMp3Url(url)) {
      // fallback: treat as mp3 anyway
      type = "mp3";
    }
    setPlaylist([...playlist, { title: newTitle.trim() || url.slice(0, 40), type, src }]);
    setNewUrl("");
    setNewTitle("");
  };

  const removeTrack = (idx) => {
    if (playlist.length <= 1) return;
    const np = playlist.filter((_, i) => i !== idx);
    setPlaylist(np);
    if (current >= np.length) setCurrent(0);
    else if (current > idx) setCurrent(current - 1);
  };

  return (
    <>
      <style>{`
        .mini-mp {
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 9999;
          font-family: inherit;
          user-select: none;
        }
        .mini-mp-fab {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .mini-mp-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 26px rgba(99,102,241,0.55);
        }
        .mini-mp-panel {
          position: absolute;
          right: 0;
          bottom: 64px;
          width: 300px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px;
          color: #e2e8f0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .mini-mp-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mini-mp-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 10px;
        }
        .mini-mp-btn {
          background: rgba(255,255,255,0.08);
          border: none;
          color: #e2e8f0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s;
        }
        .mini-mp-btn:hover { background: rgba(255,255,255,0.18); }
        .mini-mp-btn.play {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          font-size: 16px;
        }
        .mini-mp-vol {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .mini-mp-vol input {
          flex: 1;
          accent-color: #8b5cf6;
        }
        .mini-mp-list {
          max-height: 130px;
          overflow-y: auto;
          margin-bottom: 10px;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 8px;
        }
        .mini-mp-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          padding: 4px 6px;
          border-radius: 6px;
          cursor: pointer;
        }
        .mini-mp-item:hover { background: rgba(255,255,255,0.06); }
        .mini-mp-item.active { color: #a78bfa; }
        .mini-mp-item button {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
        }
        .mini-mp-add {
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 8px;
        }
        .mini-mp-add input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0;
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 12px;
          outline: none;
        }
        .mini-mp-add input:focus { border-color: #8b5cf6; }
        .mini-mp-add button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          color: white;
          padding: 6px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 600;
        }
        .mini-mp-spotify {
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }
      `}</style>

      <div className="mini-mp">
        {open && (
          <div className="mini-mp-panel">
            <div className="mini-mp-title">
              🎵 {track ? track.title : "Không có bài hát"}
            </div>

            {track && track.type === "spotify" ? (
              <div className="mini-mp-spotify">
                <iframe
                  title="spotify"
                  src={track.src}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ display: "block" }}
                />
              </div>
            ) : (
              <audio
                ref={audioRef}
                src={track?.src}
                onEnded={() => {
                  setPlaying(false);
                  next();
                }}
              />
            )}

            <div className="mini-mp-controls">
              <button className="mini-mp-btn" onClick={prev} title="Trước">⏮</button>
              <button className="mini-mp-btn play" onClick={togglePlay} title="Phát/Tạm dừng">
                {playing ? "⏸" : "▶"}
              </button>
              <button className="mini-mp-btn" onClick={next} title="Sau">⏭</button>
            </div>

            {track && track.type !== "spotify" && (
              <div className="mini-mp-vol">
                <span>🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>
            )}

            <div className="mini-mp-list">
              {playlist.map((p, i) => (
                <div
                  key={i}
                  className={"mini-mp-item" + (i === current ? " active" : "")}
                  onClick={() => {
                    setCurrent(i);
                    setPlaying(true);
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.type === "spotify" ? "🎧" : "🎶"} {p.title}
                  </span>
                  {playlist.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(i);
                      }}
                      title="Xóa"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>

            <form className="mini-mp-add" onSubmit={addTrack}>
              <input
                type="text"
                placeholder="Tên bài (không bắt buộc)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Link MP3 hoặc Spotify URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <button type="submit">➕ Thêm bài</button>
            </form>
          </div>
        )}

        <button
          className="mini-mp-fab"
          onClick={() => setOpen(!open)}
          title="Nhạc"
          aria-label="Music player"
        >
          🎵
        </button>
      </div>
    </>
  );
}
