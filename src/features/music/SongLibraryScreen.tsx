import { useEffect, useRef } from "react";

import type { Language } from "../../content/copy";
import {
  SONG_CATALOG,
  playableSong,
  type SongId,
} from "../../domain/music/song-catalog";
import { Button } from "../../ui/primitives/Button";

interface SongLibraryScreenProps {
  readonly language: Language;
  readonly selectedSongId: SongId;
  readonly onBack: () => void;
  readonly onSelect: (songId: SongId) => void;
  readonly onPlay: (songId: SongId) => void;
}

export function SongLibraryScreen({
  language,
  selectedSongId,
  onBack,
  onSelect,
  onPlay,
}: SongLibraryScreenProps) {
  const isChinese = language === "zh";
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedSong = playableSong(selectedSongId);
  const futureSongs = SONG_CATALOG.filter(
    (song) => song.availability === "coming-soon",
  );

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className="song-library-screen">
      <header className="song-library-screen__heading">
        <Button onClick={onBack} variant="quiet">
          {isChinese ? "返回" : "Back"}
        </Button>
        <div>
          <span>{isChinese ? "歌曲库" : "SONG LIBRARY"}</span>
          <h1 ref={headingRef} tabIndex={-1}>
            {isChinese ? "选择歌曲" : "Choose your song"}
          </h1>
        </div>
      </header>

      {selectedSong === null ? null : (
        <article
          aria-label={
            isChinese
              ? `${selectedSong.title[0]}，已选择`
              : `${selectedSong.title[1]}, selected`
          }
          className="song-feature"
          data-selected="true"
        >
          <div className="song-feature__artwork">
            <img alt="" src={selectedSong.artwork} />
            <span>{isChinese ? "✓ 已选择" : "✓ SELECTED"}</span>
          </div>
          <div className="song-feature__details">
            <p>{isChinese ? "今天的舞曲" : "TODAY'S DANCE"}</p>
            <h2 lang="zh-CN">{selectedSong.title[0]}</h2>
            <strong>{selectedSong.title[1]}</strong>
            <dl>
              <div>
                <dt>{isChinese ? "时长" : "Time"}</dt>
                <dd>
                  {isChinese
                    ? `约 ${selectedSong.durationMinutes} 分钟`
                    : `About ${selectedSong.durationMinutes} minutes`}
                </dd>
              </div>
              <div>
                <dt>{isChinese ? "玩法" : "Modes"}</dt>
                <dd>{isChinese ? "站立 · 坐姿" : "Standing + seated"}</dd>
              </div>
            </dl>
            <Button
              className="song-feature__play"
              onClick={() => {
                onSelect(selectedSong.id);
                onPlay(selectedSong.id);
              }}
            >
              {isChinese
                ? `播放《${selectedSong.title[0]}》`
                : `Play ${selectedSong.title[1]}`}
            </Button>
          </div>
        </article>
      )}

      <section
        aria-labelledby="future-songs-title"
        className="future-songs"
      >
        <div className="future-songs__heading">
          <h2 id="future-songs-title">
            {isChinese ? "更多歌曲" : "More songs"}
          </h2>
          <p>
            {isChinese ? "通过版权审核后开放" : "Available after rights review"}
          </p>
        </div>
        <div className="future-songs__list">
          {futureSongs.map((song) => {
            const title = song.title[isChinese ? 0 : 1];
            const availability = isChinese ? "即将推出" : "Coming soon";
            return (
              <article
                aria-disabled="true"
                aria-label={`${title} — ${availability}`}
                className="future-song"
                data-artwork={song.artwork}
                key={song.id}
              >
                <span aria-hidden="true" className="future-song__lock">×</span>
                <h3>{title}</h3>
                <strong>{availability}</strong>
                <small className="visually-hidden">
                  {isChinese ? "版权审核中" : "Pending rights review"}
                </small>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
