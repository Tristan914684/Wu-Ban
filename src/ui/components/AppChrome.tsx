import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Language } from "../../content/copy";
import { copyFor } from "../../content/copy";
import type { SessionPhase } from "../../application/session/session-machine";
import { Button } from "../primitives/Button";

interface AppChromeProps {
  readonly language: Language;
  readonly onLanguageChange: (language: Language) => void;
  readonly reducedMotion: boolean;
  readonly onReducedMotionChange: (enabled: boolean) => void;
  readonly phase: SessionPhase;
  readonly simulated: boolean;
  readonly silentPractice: boolean;
  readonly cameraActive: boolean;
  readonly onStop: () => void;
  readonly children: ReactNode;
}

const phaseNumbers: Partial<Record<SessionPhase, number>> = {
  disclosure: 1,
  permission: 2,
  mode: 3,
  safety: 4,
  calibrating: 5,
  tutorial: 6,
  countdown: 7,
  playing: 8,
  cooldown: 9,
  completing: 10,
  result: 11,
};

export function AppChrome({
  language,
  onLanguageChange,
  reducedMotion,
  onReducedMotionChange,
  phase,
  simulated,
  silentPractice,
  cameraActive,
  onStop,
  children,
}: AppChromeProps) {
  const copy = copyFor(language);
  const phaseNumber = phase === "playing" ? undefined : phaseNumbers[phase];
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsId = useId();
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !settingsRef.current?.contains(event.target)
      ) {
        setSettingsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        settingsButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [settingsOpen]);

  return (
    <div
      className="app-shell"
      data-phase={phase}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <header className="app-header">
        <a
          className="wordmark"
          href="/"
          aria-label={
            language === "zh" ? `${copy.brand}首页` : `${copy.brand} home`
          }
        >
          <span>{copy.brand}</span>
          <small>{copy.brandRomanized}</small>
        </a>
        <div className="app-header__status">
          <span
            className="privacy-indicator"
            data-camera-active={cameraActive ? "true" : "false"}
          >
            <span className="privacy-indicator__dot" />
            {cameraActive ? copy.cameraActive : copy.localOnly}
          </span>
          {simulated ? (
            <strong className="simulation-badge">{copy.simulated}</strong>
          ) : null}
          {silentPractice ? (
            <strong className="audio-fallback-badge">
              {language === "zh" ? "静音练习" : "SILENT PRACTICE"}
            </strong>
          ) : null}
          {phaseNumber === undefined ? null : (
            <span
              className="phase-number"
              aria-label={
                language === "zh"
                  ? `第 ${phaseNumber} 步`
                  : `Step ${phaseNumber}`
              }
            >
              {String(phaseNumber).padStart(2, "0")} / 11
            </span>
          )}
        </div>
        <div className="app-header__controls">
          <div
            className="settings-menu"
            data-open={settingsOpen ? "true" : "false"}
            ref={settingsRef}
          >
            <button
              aria-controls={settingsId}
              aria-expanded={settingsOpen}
              className="settings-menu__summary"
              onClick={() => {
                setSettingsOpen((current) => !current);
              }}
              ref={settingsButtonRef}
              type="button"
            >
              <span className="settings-menu__brush" aria-hidden="true" />
              {language === "zh" ? "设置" : "Settings"}
            </button>
            <div
              aria-label={
                language === "zh" ? "显示与舒适度" : "Display and comfort"
              }
              className="settings-menu__panel"
              hidden={!settingsOpen}
              id={settingsId}
              role="group"
            >
              <fieldset className="language-setting">
                <legend>{language === "zh" ? "界面语言" : "Language"}</legend>
                <div className="language-setting__options">
                  <label>
                    <input
                      checked={language === "zh"}
                      name="interface-language"
                      onChange={() => {
                        onLanguageChange("zh");
                      }}
                      type="radio"
                    />
                    <span lang="zh-CN">中文</span>
                  </label>
                  <label>
                    <input
                      checked={language === "en"}
                      name="interface-language"
                      onChange={() => {
                        onLanguageChange("en");
                      }}
                      type="radio"
                    />
                    <span lang="en">English</span>
                  </label>
                </div>
              </fieldset>
              <label className="motion-setting">
                <span className="motion-setting__copy">
                  <strong>
                    {language === "zh" ? "减少动态效果" : "Reduce dynamics"}
                  </strong>
                  <small>
                    {language === "zh"
                      ? "减少装饰动画，并缩短画面切换。"
                      : "Limit decorative movement and shorten transitions."}
                  </small>
                </span>
                <input
                  checked={reducedMotion}
                  onChange={(event) => {
                    onReducedMotionChange(event.currentTarget.checked);
                  }}
                  role="switch"
                  type="checkbox"
                />
                <span className="motion-setting__toggle" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>
          </div>
          {phase === "idle" || phase === "result" ? null : (
            <Button onClick={onStop} variant="secondary">
              {copy.stop}
            </Button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
