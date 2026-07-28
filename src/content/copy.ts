export type Language = "zh" | "en";

export interface Copy {
  readonly brand: string;
  readonly brandRomanized: string;
  readonly localOnly: string;
  readonly cameraActive: string;
  readonly stop: string;
  readonly simulated: string;
  readonly visualDraft: string;
}

const copyByLanguage: Record<Language, Copy> = {
  zh: {
    brand: "舞伴",
    brandRomanized: "Wǔbàn",
    localOnly: "视频留在这台设备上",
    cameraActive: "摄像头已开启 · 只在本机处理",
    stop: "停止并退出",
    simulated: "模拟演示",
    visualDraft: "手绘习作",
  },
  en: {
    brand: "舞伴",
    brandRomanized: "Wǔbàn",
    localOnly: "Video stays on this device",
    cameraActive: "Camera active · processed on this device",
    stop: "Stop and exit",
    simulated: "SIMULATED",
    visualDraft: "HAND-PAINTED STUDY",
  },
};

export function copyFor(language: Language): Copy {
  return copyByLanguage[language];
}
