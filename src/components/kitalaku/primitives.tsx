import { type StatusTone } from "./data";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function toneDot(tone: StatusTone) {
  if (tone === "approved") return "bg-[var(--emerald)]";
  if (tone === "review") return "bg-[var(--purple)]";
  return "bg-[var(--amber)]";
}

export function toneSurface(tone: StatusTone) {
  if (tone === "approved") return "bg-[var(--emerald-soft)] text-[var(--slate-900)] border-[rgba(16,185,129,0.18)]";
  if (tone === "review") return "bg-[rgba(124,58,237,0.09)] text-[var(--slate-900)] border-[rgba(124,58,237,0.14)]";
  return "bg-[var(--amber-soft)] text-[var(--slate-900)] border-[rgba(245,158,11,0.18)]";
}

export function GlassPanel({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "premium-glass rounded-[24px] border border-[rgba(255,255,255,0.72)] shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
