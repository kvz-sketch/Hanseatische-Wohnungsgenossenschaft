// Form pieces shared by the login and password pages.
import type { InputHTMLAttributes } from 'react'

const inputClass =
  'w-full rounded-control border border-line bg-white px-4 py-3.5 text-base text-ink placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_3px_rgba(221,184,81,0.45)] focus:outline-none aria-invalid:border-coral-600'

export function Field({
  id,
  label,
  hint,
  error,
  ...input
}: {
  id: string
  label: string
  hint?: string
  error?: string
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[14px] font-bold">
        {label}
      </label>
      <input id={id} aria-invalid={!!error || undefined} aria-describedby={`${id}-hint`} className={inputClass} {...input} />
      {(error || hint) && (
        <p id={`${id}-hint`} className={`m-0 mt-1.5 text-[13px] ${error ? 'text-coral-600' : 'text-muted'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

export function SubmitButton({ busy, children }: { busy: boolean; children: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full cursor-pointer rounded-control bg-gold px-5 py-4 text-base font-bold text-ink transition-colors hover:bg-gold-600 active:bg-gold-700 disabled:opacity-60"
    >
      {busy ? 'Bitte warten …' : children}
    </button>
  )
}
