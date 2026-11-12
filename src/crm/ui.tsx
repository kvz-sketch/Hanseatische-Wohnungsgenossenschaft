import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-control px-2 py-0.5 text-xs font-bold ${className}`}>{children}</span>
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' }) {
  const styles = {
    primary: 'border-gold bg-gold text-ink hover:bg-gold-600 hover:border-gold-600',
    secondary: 'border-ink bg-white text-ink hover:bg-navy-050',
    quiet: 'border-line bg-white text-ink hover:border-ink',
  }[variant]
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-control border px-4 text-sm font-semibold transition-colors disabled:cursor-default disabled:opacity-50 ${styles} ${className}`}
    />
  )
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p role="alert" className="mb-4 rounded-control border border-coral bg-coral-100 px-4 py-3 text-sm text-coral-600">{children}</p>
}

export function Notice({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div role="status" className="mb-4 flex items-start gap-4 rounded-control border border-green bg-green-tint px-4 py-3 text-sm text-green">
      <span className="flex-1">{children}</span>
      <button type="button" onClick={onClose} className="cursor-pointer border-0 bg-transparent p-0 text-green" aria-label="Hinweis schließen">✕</button>
    </div>
  )
}

export function Card({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-card border border-line-soft bg-white">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-soft px-5 py-3.5">
        <h2 className="m-0 text-[15px] font-semibold">{title}</h2>
        {aside && <div className="sm:ml-auto">{aside}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

/** Label/value pairs in two columns. */
export function Facts({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="m-0 grid grid-cols-[minmax(120px,40%)_1fr] gap-x-4 gap-y-2.5 text-sm">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted">{label}</dt>
          <dd className="m-0 break-words">{value === '' || value === null || value === undefined ? '–' : value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Table({ head, rows, empty, foot }: { head: { label: string; right?: boolean }[]; rows: ReactNode[][]; empty: string; foot?: ReactNode[] }) {
  if (rows.length === 0) return <p className="m-0 text-sm text-muted">{empty}</p>
  const cls = (i: number) => `px-3 py-2 ${head[i]?.right ? 'text-right tabular-nums' : ''}`
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line-soft text-left text-xs text-muted">
            {head.map((h, i) => <th key={h.label} className={`${cls(i)} font-medium first:pl-0`}>{h.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, n) => (
            <tr key={n} className="border-b border-line-soft last:border-0">
              {r.map((c, i) => <td key={i} className={`${cls(i)} whitespace-nowrap first:pl-0`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
        {foot && (
          <tfoot>
            <tr className="border-t border-line font-semibold">
              {foot.map((c, i) => <td key={i} className={`${cls(i)} whitespace-nowrap first:pl-0`}>{c}</td>)}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
