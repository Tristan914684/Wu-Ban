export type CameraFailure =
  | "not-disclosed"
  | "unsupported"
  | "denied"
  | "unavailable"
  | "unknown";

export type CameraRequestResult =
  | { readonly kind: "ready" }
  | { readonly kind: "error"; readonly failure: CameraFailure };

export class BrowserCamera {
  private stream: MediaStream | null = null;

  async request(disclosureAccepted: boolean): Promise<CameraRequestResult> {
    if (!disclosureAccepted) {
      return { kind: "error", failure: "not-disclosed" };
    }
    // TypeScript targets modern browsers, but the deployed page can still open
    // in a browser without media capture support.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.mediaDevices === undefined) {
      return { kind: "error", failure: "unsupported" };
    }

    this.stop();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user",
        },
      });
      return { kind: "ready" };
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        return { kind: "error", failure: "denied" };
      }
      if (
        error instanceof DOMException &&
        (error.name === "NotFoundError" ||
          error.name === "NotReadableError" ||
          error.name === "OverconstrainedError")
      ) {
        return { kind: "error", failure: "unavailable" };
      }
      return { kind: "error", failure: "unknown" };
    }
  }

  async attachPreview(video: HTMLVideoElement): Promise<void> {
    if (this.stream === null) {
      throw new Error("Camera is not active.");
    }
    video.srcObject = this.stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
  }

  stop(): void {
    if (this.stream === null) {
      return;
    }
    for (const track of this.stream.getTracks()) {
      track.stop();
    }
    this.stream = null;
  }

  isActive(): boolean {
    return this.stream?.active === true;
  }
}
