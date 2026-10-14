import { projectsCompleted, projectsPipeline } from '../data/content'
import { GERMANY_PATH } from '../data/paths'

const total = projectsCompleted.length + projectsPipeline.length

/**
 * Germany outline with a pin per completed project (navy) and per
 * project in acquisition (brick). `filled` is the soft variant used on the
 * home page, `outline` the line-drawing used on the projects page.
 */
export default function GermanyMap({ variant = 'outline', className = '' }: { variant?: 'filled' | 'outline'; className?: string }) {
  const pins = [
    ...projectsCompleted.map((p) => ({ p, pipeline: false })),
    ...projectsPipeline.map((p) => ({ p, pipeline: true })),
  ]

  return (
    <svg
      viewBox="0 0 600 760"
      role="img"
      aria-label={`Karte von Deutschland mit ${projectsCompleted.length} abgeschlossenen Projekten und ${projectsPipeline.length} Objekten im Ankauf`}
      className={className}
    >
      <path
        d={GERMANY_PATH}
        className={variant === 'filled' ? 'fill-section' : 'fill-white stroke-ink'}
        strokeWidth={variant === 'filled' ? 0 : 3}
        strokeLinejoin="round"
      />
      {pins.map(({ p, pipeline }, i) =>
        p.pin ? (
          <g key={`${p.city}-${p.street ?? i}`} transform={`translate(${p.pin[0]} ${p.pin[1]})`}>
            <g className="map-pin" style={{ animationDelay: `${(i / total) * 900}ms` }}>
              <title>{pipeline ? `${p.city}, im Ankauf` : `${p.city}, ${p.street}`}</title>
              <circle r="11" className={pipeline ? 'fill-brick/20' : 'fill-ink/15'} />
              <circle r="6" className={pipeline ? 'fill-brick' : 'fill-ink'} stroke="#fff" strokeWidth="2" />
            </g>
          </g>
        ) : null,
      )}
    </svg>
  )
}

export function MapLegend() {
  return (
    <div className="flex justify-center gap-5 text-[13px] text-ink-2">
      <span className="inline-flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-ink ring-2 ring-ink/15" /> abgeschlossen
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-brick ring-2 ring-brick/20" /> im Ankauf
      </span>
    </div>
  )
}
