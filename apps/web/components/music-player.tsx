'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Song {
  name: string;
  url: string;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const svgStyle: React.CSSProperties = { width: 14, height: 14, fill: '#000', display: 'block' };

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" style={svgStyle}>
      <polygon points="4,2 14,8 4,14" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" style={svgStyle}>
      <rect x="3" y="2" width="4" height="12" rx="1" />
      <rect x="9" y="2" width="4" height="12" rx="1" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg viewBox="0 0 16 16" style={svgStyle}>
      <rect x="2" y="2" width="12" height="12" rx="1" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg viewBox="0 0 16 16" style={svgStyle}>
      <polygon points="2,2 10,8 2,14" />
      <rect x="11" y="2" width="3" height="12" rx="1" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg viewBox="0 0 16 16" style={svgStyle}>
      <polygon points="14,2 6,8 14,14" />
      <rect x="2" y="2" width="3" height="12" rx="1" />
    </svg>
  );
}
function VolumeIcon({ level }: { level: number }) {
  return <img src="/icons/MediaAudio_16x16_4.png" alt="Volume" style={{ width: 16, height: 16, imageRendering: 'pixelated', opacity: level > 0 ? 1 : 0.4 }} />;
}

const btnStyle: React.CSSProperties = {
  height: 24,
  width: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#c0c0c0',
  border: '2px outset #fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
  padding: 0,
};
const disabledBtn: React.CSSProperties = {
  ...btnStyle,
  opacity: 0.4,
  cursor: 'default',
  border: '2px outset #dfdfdf',
};

export function MusicPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/music')
      .then(r => r.json())
      .then(data => setSongs(data.songs))
      .catch(() => {});
  }, []);

  const currentSong = currentIdx >= 0 && currentIdx < songs.length ? songs[currentIdx] : null;

  const play = useCallback((idx: number) => {
    if (idx < 0 || idx >= songs.length) return;
    setCurrentIdx(idx);
    setPlaying(true);
  }, [songs.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentSong) {
      audio.src = currentSong.url;
      audio.load();
      if (playing) {
        const playPromise = audio.play();
        if (playPromise) playPromise.catch(() => setPlaying(false));
      }
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing && audio.src) {
      const playPromise = audio.play();
      if (playPromise) playPromise.catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const handleTogglePlay = useCallback(() => {
    if (currentIdx < 0 && songs.length > 0) {
      play(0);
      return;
    }
    setPlaying(p => !p);
  }, [currentIdx, songs.length, play]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setPlaying(false);
    setCurrentTime(0);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) play(currentIdx - 1);
  }, [currentIdx, play]);

  const handleNext = useCallback(() => {
    if (currentIdx < songs.length - 1) play(currentIdx + 1);
  }, [currentIdx, songs.length, play]);

  const handleEnded = useCallback(() => {
    if (currentIdx < songs.length - 1) {
      play(currentIdx + 1);
    } else {
      setPlaying(false);
      setCurrentTime(0);
      setCurrentIdx(-1);
      if (audioRef.current) { audioRef.current.currentTime = 0; }
    }
  }, [currentIdx, songs.length, play]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    audio.currentTime = frac * duration;
  }, [duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  }, []);

  const prevDisabled = currentIdx <= 0;
  const nextDisabled = currentIdx >= songs.length - 1;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={handleEnded}
        onError={() => setPlaying(false)}
      />

      {/* Playlist */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflow: 'auto',
          border: '2px inset #fff',
          background: '#fff',
          marginBottom: 6,
          fontFamily: 'inherit',
        }}
      >
        {songs.length === 0 && (
          <div style={{ padding: 8, color: '#808080' }}>No songs found.</div>
        )}
        {songs.map((song, i) => {
          const isCurrent = i === currentIdx;
          return (
            <div
              key={song.url}
              onDoubleClick={() => play(i)}
              style={{
                padding: '3px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: isCurrent ? '#000080' : 'transparent',
                color: isCurrent ? '#fff' : '#000',
                userSelect: 'none',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.8 }}>
                {isCurrent && playing ? (
                  <svg viewBox="0 0 16 16" style={{ width: 12, height: 12, fill: '#fff', display: 'block' }}>
                    <polygon points="4,2 12,8 4,14" />
                  </svg>
                ) : (
                  <img src="/icons/CdMusic_16x16_4.png" alt="" style={{ width: 12, height: 12, imageRendering: 'pixelated' }} />
                )}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {song.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        onClick={handleSeek}
        style={{
          height: 14,
          background: '#fff',
          border: '2px inset #fff',
          marginBottom: 4,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
            height: '100%',
            background: '#000080',
            transition: 'width 0.2s linear',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: 4,
            top: 0,
            fontSize: 13,
            lineHeight: '14px',
            color: duration > 0 && currentTime / duration > 0.5 ? '#fff' : '#000',
          }}
        >
          {duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)}` : '0:00 / 0:00'}
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <button
          style={prevDisabled ? disabledBtn : btnStyle}
          disabled={prevDisabled}
          onClick={handlePrev}
          title="Previous"
        >
          <PrevIcon />
        </button>
        <button
          style={{ ...btnStyle, width: 36 }}
          onClick={handleTogglePlay}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          style={btnStyle}
          onClick={handleStop}
          title="Stop"
        >
          <StopIcon />
        </button>
        <button
          style={nextDisabled ? disabledBtn : btnStyle}
          disabled={nextDisabled}
          onClick={handleNext}
          title="Next"
        >
          <NextIcon />
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VolumeIcon level={volume} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: 60, height: 16, accentColor: '#000080' }}
          />
        </div>
      </div>
    </>
  );
}
