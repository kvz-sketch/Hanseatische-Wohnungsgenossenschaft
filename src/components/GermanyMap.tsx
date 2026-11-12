import { useEffect, useRef, useState } from 'react'
import { projectsCompleted, projectsPipeline } from '../data/content'
import { GERMANY_PATH } from '../data/paths'

const total = projectsCompleted.length + projectsPipeline.length

/**
 * Germany outline with a pin per completed project and per project in
 * acquisition. `filled` is the soft variant on the home page, `outline` the
 * line drawing, `navy` the animated Hansea version for dark panels: the outline
 * draws itself once the map scrolls into view, then the pins drop in one after
 * another and the projects in acquisition keep pulsing.
 */
export default function GermanyMap({
  variant = 'outline',
  className = '',
}: {
  variant?: 'filled' | 'outline' | 'navy'
  className?: string
}) {
  const navy = variant === 'navy'
  const ref = useRef<SVGSVGElement>(null)
  const [seen, setSeen] = useState(!navy)

  useEffect(() => {
    if (!navy || !ref.current || !('IntersectionObserver' in window)) return setSeen(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [navy])

  const pins = [
    ...projectsCompleted.map((p) => ({ p, pipeline: false })),
    ...projectsPipeline.map((p) => ({ p, pipeline: true })),
  ]

  return (
    <svg
      ref={ref}
      viewBox="0 0 600 760"
      role="img"
      aria-label={`Karte von Deutschland mit ${projectsCompleted.length} abgeschlossenen Projekten und ${projectsPipeline.length} Objekten im Ankauf`}
      className={`${className} ${navy ? `hs-gmap ${seen ? 'is-in' : ''}` : ''}`}
    >
      <path
        d={GERMANY_PATH}
        pathLength={1}
        className={navy ? 'hs-gmap-land' : variant === 'filled' ? 'fill-section' : 'fill-white stroke-ink'}
        strokeWidth={navy ? 2 : variant === 'filled' ? 0 : 3}
        strokeLinejoin="round"
      />
      {pins.map(({ p, pipeline }, i) =>
        p.pin ? (
          <g key={`${p.city}-${p.street ?? i}`} transform={`translate(${p.pin[0]} ${p.pin[1]})`}>
            <g
              className={navy ? `hs-gmap-pin ${pipeline ? 'hs-gmap-pin--new' : ''}` : 'map-pin'}
              style={{ animationDelay: navy ? `${1300 + (i / total) * 1100}ms` : `${(i / total) * 900}ms` }}
            >
              <title>{pipeline ? `${p.city}, im Ankauf` : `${p.city}, ${p.street}`}</title>
              {navy ? (
                <>
                  <circle r="13" className={pipeline ? 'hs-gmap-ring' : 'fill-gold/20'} />
                  <circle r="6.5" className={pipeline ? 'fill-white' : 'fill-gold'} stroke="#141a46" strokeWidth="2" />
                </>
              ) : (
                <>
                  <circle r="11" className={pipeline ? 'fill-coral/25' : 'fill-ink/15'} />
                  <circle r="6" className={pipeline ? 'fill-coral-600' : 'fill-ink'} stroke="#fff" strokeWidth="2" />
                </>
              )}
            </g>
          </g>
        ) : null,
      )}
    </svg>
  )
}

export function MapLegend({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-5 text-[13px] ${onDark ? 'text-navy-200' : 'justify-center text-ink-2'}`}>
      <span className="inline-flex items-center gap-2">
        <span className={`size-2.5 rounded-full ${onDark ? 'bg-gold ring-4 ring-gold/20' : 'bg-ink ring-2 ring-ink/15'}`} />{' '}
        abgeschlossen
      </span>
      <span className="inline-flex items-center gap-2">
        <span className={`size-2.5 rounded-full ${onDark ? 'bg-white ring-4 ring-white/20' : 'bg-coral-600 ring-2 ring-coral/25'}`} />{' '}
        im Ankauf
      </span>
    </div>
  )
}
