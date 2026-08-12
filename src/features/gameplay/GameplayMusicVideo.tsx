import { useEffect, useRef, useState, type CSSProperties } from "react";

interface GameplayMusicVideoProps {
  readonly src: string;
  readonly poster: string;
  readonly playback: "running" | "paused" | "tracking-lost";
  readonly elapsedMs: number;
  readonly reducedMotion: boolean;
}

function alignToSession(video: HTMLVideoElement, elapsedMs: number): void {
  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    return;
  }
  const desiredTime = (elapsedMs / 1_000) % video.duration;
  if (Math.abs(video.currentTime - desiredTime) > 0.75) {
    video.currentTime = desiredTime;
  }
}

export function GameplayMusicVideo({
  src,
  poster,
  playback,
  elapsedMs,
  reducedMotion,
}: GameplayMusicVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const elapsedRef = useRef(elapsedMs);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    elapsedRef.current = elapsedMs;
  }, [elapsedMs]);

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) {
      return;
    }
    if (playback === "paused") {
      video.pause();
      return;
    }
    alignToSession(video, elapsedRef.current);
    void video.play().catch(() => {
      setFailed(true);
    });
  }, [playback]);

  const layerStyle = {
    backgroundImage: `url("${poster}")`,
  } satisfies CSSProperties;

  return (
    <div
      aria-hidden="true"
      className="gameplay-mv"
      data-mv-state={failed ? "fallback" : "playing"}
      data-testid="gameplay-mv-layer"
      style={layerStyle}
    >
      <video
        autoPlay
        data-reduced-motion={reducedMotion ? "true" : "false"}
        data-testid="gameplay-mv"
        loop
        muted
        onCanPlay={(event) => {
          if (playback !== "paused") {
            alignToSession(event.currentTarget, elapsedRef.current);
            void event.currentTarget.play().catch(() => {
              setFailed(true);
            });
          }
        }}
        onError={() => {
          setFailed(true);
        }}
        playsInline
        poster={poster}
        preload="auto"
        ref={videoRef}
        src={src}
      />
    </div>
  );
}
