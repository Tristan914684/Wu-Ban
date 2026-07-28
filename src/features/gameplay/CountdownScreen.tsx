import { useEffect, useState } from "react";

import type { Language } from "../../content/copy";

interface CountdownScreenProps {
  readonly language: Language;
  readonly reducedMotion: boolean;
  readonly onComplete: () => void;
}

export function CountdownScreen({
  language,
  reducedMotion,
  onComplete,
}: CountdownScreenProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    let remaining = 3;
    const timer = window.setInterval(
      () => {
        remaining -= 1;
        if (remaining === 0) {
          window.clearInterval(timer);
          onComplete();
          return;
        }
        setCount(remaining);
      },
      reducedMotion ? 450 : 750,
    );
    return () => {
      window.clearInterval(timer);
    };
  }, [onComplete, reducedMotion]);

  return (
    <main className="countdown-screen" aria-live="assertive">
      <p>{language === "zh" ? "准备" : "GET READY"}</p>
      <strong>{count}</strong>
      <span>{language === "zh" ? "慢慢来" : "Take your time"}</span>
    </main>
  );
}
