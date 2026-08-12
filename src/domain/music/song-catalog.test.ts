import { describe, expect, it } from "vitest";

import {
  DEFAULT_SONG_ID,
  SONG_CATALOG,
  playableSong,
} from "./song-catalog";

describe("song catalog availability", () => {
  it("keeps only Mo Li Hua playable for the hackathon", () => {
    const available = SONG_CATALOG.filter(
      (song) => song.availability === "available",
    );

    expect(DEFAULT_SONG_ID).toBe("mo-li-hua");
    expect(available).toHaveLength(1);
    expect(available[0]).toMatchObject({
      id: "mo-li-hua",
      audioId: "procedural-mo-li-hua",
      chartId: "mvp-authored-v1",
      rightsStatus: "cleared",
      mv: {
        src: "/media/mo-li-hua-mv.mp4",
        poster: "/media/mo-li-hua-poster.webp",
      },
    });
    expect(playableSong("mo-li-hua")).toBe(available[0]);
  });

  it("does not resolve pending-rights songs as playable", () => {
    const comingSoon = SONG_CATALOG.filter(
      (song) => song.availability === "coming-soon",
    );

    expect(comingSoon).toHaveLength(3);
    expect(
      comingSoon.every(
        (song) =>
          song.rightsStatus === "pending-review" &&
          song.audioId === undefined &&
          song.chartId === undefined &&
          song.mv === undefined,
      ),
    ).toBe(true);
    expect(playableSong("kangding-love-song")).toBeNull();
  });
});
