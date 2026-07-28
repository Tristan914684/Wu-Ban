import type { Language } from "../../content/copy";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";

interface DisclosureScreenProps {
  readonly language: Language;
  readonly onAccept: () => void;
}

export function DisclosureScreen({
  language,
  onAccept,
}: DisclosureScreenProps) {
  const isChinese = language === "zh";

  return (
    <StepLayout
      description={
        <p>
          {isChinese
            ? "摄像头只用来寻找身体或手部关键点，让游戏知道动作是否跟上。"
            : "The camera is used only to find body or hand landmarks so the game can respond to movement."}
        </p>
      }
      eyebrow={isChinese ? "§ 01 — 摄像头说明" : "§ 01 — CAMERA DISCLOSURE"}
      title={
        <>
          {isChinese ? "画面看过就" : "Frames are seen,"}
          <em>{isChinese ? "丢弃。" : "then discarded."}</em>
        </>
      }
    >
      <dl className="fact-list">
        <div>
          <dt>{isChinese ? "会做" : "DOES"}</dt>
          <dd>
            {isChinese
              ? "在这台设备上读取动作关键点。"
              : "Reads movement landmarks on this device."}
          </dd>
        </div>
        <div>
          <dt>{isChinese ? "不会做" : "DOES NOT"}</dt>
          <dd>
            {isChinese
              ? "不保存视频、照片、人脸或声音。"
              : "Does not save video, photos, faces, or sound."}
          </dd>
        </div>
        <div>
          <dt>{isChinese ? "可随时" : "AT ANY TIME"}</dt>
          <dd>
            {isChinese
              ? "按“停止并退出”关闭摄像头。"
              : "Choose Stop and exit to turn the camera off."}
          </dd>
        </div>
      </dl>
      <Button onClick={onAccept}>
        {isChinese ? "我明白了，继续" : "I understand, continue"}
      </Button>
    </StepLayout>
  );
}

