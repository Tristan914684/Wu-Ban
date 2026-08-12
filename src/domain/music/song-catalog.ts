import type { SessionMode } from "../chart/session-chart";

export type SongId =
  | "mo-li-hua"
  | "kangding-love-song"
  | "flowing-stream"
  | "fengyang-flower-drum";

export type SongAvailability = "available" | "coming-soon";

interface SongMusicVideo {
  readonly src: string;
  readonly poster: string;
}

export interface SongDefinition {
  readonly id: SongId;
  readonly title: readonly [chinese: string, english: string];
  readonly durationMinutes: number;
  readonly supportedModes: readonly SessionMode[];
  readonly availability: SongAvailability;
  readonly rightsStatus: "cleared" | "pending-review";
  readonly artwork: string;
  readonly audioId?: "procedural-mo-li-hua";
  readonly chartId?: "mvp-authored-v1";
  readonly mv?: SongMusicVideo;
}

export const DEFAULT_SONG_ID: SongId = "mo-li-hua";

export const SONG_CATALOG: readonly SongDefinition[] = [
  {
    id: "mo-li-hua",
    title: ["茉莉花", "Mo Li Hua"],
    durationMinutes: 4,
    supportedModes: ["standing", "seated"],
    availability: "available",
    rightsStatus: "cleared",
    artwork: "/media/mo-li-hua-poster.webp",
    audioId: "procedural-mo-li-hua",
    chartId: "mvp-authored-v1",
    mv: {
      src: "/media/mo-li-hua-mv.mp4",
      poster: "/media/mo-li-hua-poster.webp",
    },
  },
  {
    id: "kangding-love-song",
    title: ["康定情歌", "Kangding Love Song"],
    durationMinutes: 4,
    supportedModes: ["standing", "seated"],
    availability: "coming-soon",
    rightsStatus: "pending-review",
    artwork: "mountain",
  },
  {
    id: "flowing-stream",
    title: ["小河淌水", "Flowing Stream"],
    durationMinutes: 4,
    supportedModes: ["standing", "seated"],
    availability: "coming-soon",
    rightsStatus: "pending-review",
    artwork: "river",
  },
  {
    id: "fengyang-flower-drum",
    title: ["凤阳花鼓", "Fengyang Flower Drum"],
    durationMinutes: 4,
    supportedModes: ["standing", "seated"],
    availability: "coming-soon",
    rightsStatus: "pending-review",
    artwork: "drum",
  },
];

export function playableSong(id: SongId): SongDefinition | null {
  const song = SONG_CATALOG.find((candidate) => candidate.id === id);
  return song?.availability === "available" ? song : null;
}
