import { useEffect, useRef, type ReactNode } from "react";

interface StepLayoutProps {
  readonly eyebrow?: ReactNode;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children: ReactNode;
  readonly aside?: ReactNode;
}

export function StepLayout({
  eyebrow,
  title,
  description,
  children,
  aside,
}: StepLayoutProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main
      className="step-layout"
      data-has-aside={aside === undefined ? "false" : "true"}
    >
      <div className="step-layout__rail" aria-hidden="true">
        <span>§</span>
        <span className="step-layout__rule" />
      </div>
      <section className="step-layout__content">
        {eyebrow === undefined || eyebrow === null ? null : (
          <p className="eyebrow">{eyebrow}</p>
        )}
        <h1 ref={headingRef} tabIndex={-1}>
          {title}
        </h1>
        {description === undefined ? null : (
          <div className="lede">{description}</div>
        )}
        <div className="step-layout__actions">{children}</div>
      </section>
      {aside === undefined ? null : (
        <aside className="step-layout__aside">{aside}</aside>
      )}
    </main>
  );
}
