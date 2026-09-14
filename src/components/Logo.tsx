import { BUSINESS } from "@/lib/config";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="16" cy="16" r="15" stroke="var(--color-brand-600)" strokeWidth="1.5" />
        <path
          d="M10 22c0-6 12-6 12-12"
          stroke="var(--color-brand-600)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="10" cy="22" r="2.6" fill="var(--color-copper)" />
        <circle cx="22" cy="10" r="2.6" fill="var(--color-brand-600)" />
      </svg>
      {!compact && (
        <span className="display text-[1.05rem] tracking-tight">{BUSINESS.name}</span>
      )}
    </span>
  );
}
