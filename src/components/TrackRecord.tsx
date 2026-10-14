import { useEffect, useRef, useState } from 'react'
import { trackRecord } from '../data/content'
import GermanyMap, { MapLegend } from './GermanyMap'
import { ButtonLink } from './ui'

const fmt1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Counts from 0 to the target values once the element scrolls into view. */
function useCountUp(duration = 1200) {
  const ref = useRef<HTMLDivElement>(null)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [t, setT] = useState(reduced ? 1 : 0)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration)
          setT(1 - Math.pow(1 - p, 3))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [duration, reduced])

  return { ref, t }
}

export default function TrackRecord() {
  const { ref, t } = useCountUp()
  const stats = [
    { value: String(Math.round(trackRecord.completed * t)), label: 'Projekte abgeschlossen', accent: false },
    { value: `${fmt1.format(trackRecord.investedMio * t)} Mio. €`, label: 'investiert', accent: false },
    { value: `${fmt1.format(trackRecord.revenueMio * t)} Mio. €`, label: 'Verkaufserlöse', accent: true },
  ]

  return (
    <section id="bilanz" className="section">
      <div className="container-site">
        <div className="max-w-[680px]">
          <h2 className="h2">Fünfzehn Häuser in anderthalb Jahren: gekauft, saniert, verkauft.</h2>
          <p className="m-0 mt-3 text-[16px] leading-relaxed text-ink-2">
            Die Bilanz der Gerlach Immobilien Gruppe, aus deren Projekten die Ausschüttungen der Genossenschaft stammen.
            Stand April 2026.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-[56px]">
          <div className="mx-auto w-full max-w-[420px]">
            <GermanyMap variant="filled" className="block w-full" />
            <div className="mt-4">
              <MapLegend />
            </div>
          </div>

          <div ref={ref}>
            <dl className="m-0 grid gap-6 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="border-l-[3px] border-ink pl-4">
                  <dt className={`text-[clamp(28px,3vw,36px)] leading-tight font-extrabold tracking-tight tabular-nums ${s.accent ? 'text-green' : ''}`}>
                    {s.value}
                  </dt>
                  <dd className="m-0 mt-1 text-[14px] text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>

            <ul className="m-0 mt-8 list-none space-y-3 p-0">
              {trackRecord.facts.map((f) => (
                <li key={f.strong} className="flex gap-3 text-[16px] leading-relaxed text-ink-2">
                  <span className="mt-[9px] size-2 shrink-0 rounded-full bg-green" />
                  <span>
                    <strong className="font-bold text-ink">{f.strong}</strong>
                    {f.rest}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-start gap-4 rounded-card bg-section p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="m-0 text-[15px] leading-snug font-semibold">
                Alle 15 Projekte mit Adresse und Stand finden Sie unter <a href="/projekte/">Alle Projekte</a>; Kosten und
                Verkaufspreis sehen Sie nach der Anmeldung.
              </p>
              <ButtonLink href="/projekte/#zugang" className="shrink-0">
                Zugang anfordern →
              </ButtonLink>
            </div>

            <p className="m-0 mt-4 text-[12px] leading-relaxed text-muted">
              Zahlen der Gerlach Immobilien Gruppe, nicht der Genossenschaft. Vergangene Ergebnisse sind keine Zusage für
              künftige Ausschüttungen.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
