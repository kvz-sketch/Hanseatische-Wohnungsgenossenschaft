import type { ReactNode } from 'react'
import { LOGO_PATH } from '../data/paths'
import type { ProjectStatus } from '../data/content'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 951 614" role="img" aria-label="Hansea Invest eG" className={className}>
      <path fill="currentColor" fillRule="evenodd" d={LOGO_PATH} />
    </svg>
  )
}

export function ButtonLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-control bg-brick px-5 py-3 text-[15px] font-bold text-white no-underline transition-colors hover:bg-brick-hover active:bg-brick-active ${className}`}
    >
      {children}
    </a>
  )
}

const badgeStyles: Record<ProjectStatus | 'Verkauf läuft', string> = {
  'Im Verkauf': 'bg-amber-tint text-amber',
  Verkauft: 'bg-green-tint text-green',
  'Verkauf läuft': 'bg-green-tint text-green',
  'Im Ankauf': 'bg-brick-tint text-brick',
}

export function StatusBadge({ status }: { status: keyof typeof badgeStyles }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${badgeStyles[status]}`}>
      {status}
    </span>
  )
}

/** Segmented progress bar: finished stages green, the current stage brick, the rest grey. */
export function StageBar({ stages, current }: { stages: string[]; current: number }) {
  return (
    <div>
      <div className="flex gap-1">
        {stages.map((s, i) => (
          <span
            key={s}
            className={`h-1 flex-1 rounded-full ${i < current ? 'bg-green' : i === current ? 'bg-brick' : 'bg-line'}`}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-1">
        {stages.map((s, i) => (
          <span
            key={s}
            className={`flex-1 truncate text-[11px] ${i === current ? 'font-bold text-ink' : 'text-muted'}`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

export function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function Arrow() {
  return <span aria-hidden>→</span>
}

/** Consent checkbox used by both lead forms. */
export function ConsentCheckbox({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  error?: boolean
  children: ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-ink-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`mt-0.5 size-5 shrink-0 accent-ink ${error ? 'outline-2 outline-brick' : ''}`}
      />
      <span>{children}</span>
    </label>
  )
}
