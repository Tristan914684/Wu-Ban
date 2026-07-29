import { useState } from "react";

import type { CameraFailure } from "../../adapters/camera/browser-camera";
import type { Language } from "../../content/copy";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";

interface PermissionScreenProps {
  readonly language: Language;
  readonly permissionError: string | null;
  readonly onRequestCamera: () => Promise<CameraFailure | null>;
  readonly onUseSynthetic: () => void;
}

function cameraErrorCopy(language: Language, failure: CameraFailure): string {
  const isChinese = language === "zh";
  const messages: Record<CameraFailure, readonly [string, string]> = {
    "not-disclosed": [
      "请先阅读摄像头说明。",
      "Read the camera disclosure first.",
    ],
    unsupported: [
      "这个浏览器不支持摄像头。请使用最新版 Chrome 或 Edge。",
      "This browser does not support camera access. Use current Chrome or Edge.",
    ],
    denied: [
      "摄像头没有打开。请在浏览器地址栏允许访问，再重试。",
      "Camera access is blocked. Allow it in the address bar, then retry.",
    ],
    unavailable: [
      "找不到可用摄像头。请关闭其他使用摄像头的程序，再重试。",
      "No camera is available. Close other camera apps, then retry.",
    ],
    unknown: [
      "摄像头没有准备好。请重试或选择模拟演示。",
      "The camera did not become ready. Retry or use the simulated demo.",
    ],
  };
  return messages[failure][isChinese ? 0 : 1];
}

export function PermissionScreen({
  language,
  permissionError,
  onRequestCamera,
  onUseSynthetic,
}: PermissionScreenProps) {
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const isChinese = language === "zh";

  const requestCamera = async () => {
    setPending(true);
    setLocalError(null);
    const failure = await onRequestCamera();
    if (failure !== null) {
      setLocalError(cameraErrorCopy(language, failure));
    }
    setPending(false);
  };

  return (
    <StepLayout
      description={
        <p>
          {isChinese
            ? "摄像头只帮助本机动作模型看懂方向；画面不会保存或上传。只有按下按钮后，浏览器才会询问权限。"
            : "The camera only helps the on-device movement model read direction. Images are not saved or uploaded, and the browser asks only after you choose the button."}
        </p>
      }
      title={isChinese ? "现在打开摄像头？" : "Turn on the camera now?"}
    >
      <Button disabled={pending} onClick={() => void requestCamera()}>
        {pending
          ? isChinese
            ? "正在请求…"
            : "Requesting…"
          : isChinese
            ? "打开摄像头"
            : "Turn on camera"}
      </Button>
      <Button onClick={onUseSynthetic} variant="secondary">
        {isChinese ? "先看模拟演示" : "View simulated demo"}
      </Button>
      <p className="supporting-copy">
        {isChinese
          ? "模拟演示使用预先制作的关键点，不会打开摄像头，并会一直显示“模拟演示”。"
          : "The demo uses authored landmark traces, does not open the camera, and stays labelled SIMULATED."}
      </p>
      {localError === null && permissionError === null ? null : (
        <div className="status-message status-message--error" role="alert">
          {localError ?? permissionError}
        </div>
      )}
    </StepLayout>
  );
}
