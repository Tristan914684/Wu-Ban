import type { Language } from "../../content/copy";

export class BrowserCueNarrator {
  speak(text: string, language: Language, volume: number): boolean {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "zh" ? "zh-CN" : "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    utterance.volume = Math.max(0, Math.min(1, volume));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  }

  stop(): void {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }
  }
}
