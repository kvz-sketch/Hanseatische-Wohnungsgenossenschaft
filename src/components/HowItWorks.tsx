import { useRef, useState } from 'react'
import poster from '../assets/media/erklaerfilm-poster.jpg'
import { steps } from '../data/content'
import { IS_PREVIEW } from '../routes'

function ExplainerVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  function play() {
    setStarted(true)
    const v = ref.current
    if (!v) return
    v.scrollIntoView({ behavior: 'smooth', block: 'center' })
    void v.play()
  }

  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-2">
      <div>
        <video
          ref={ref}
          id="erklaerfilm"
          controls
          preload="none"
          playsInline
          poster={poster}
          onPlay={() => setStarted(true)}
          aria-label="Erklärfilm: So funktioniert die Hanseatische Invest eG, rund 1,5 Minuten, mit Untertiteln im Bild"
          className="block aspect-video w-full rounded-card bg-section"
        >
          {/* The film is too large to embed in the single-file preview */}
          {!IS_PREVIEW && <source src="/video/hansea-erklaerfilm.mp4" type="video/mp4" />}
        </video>
        <p className="m-0 mt-3 text-[13px] leading-relaxed text-muted">
          Zielrendite, nicht garantiert. Unternehmerische Beteiligung mit Verlustrisiko bis zum Totalverlust. Keine
          Einlagensicherung. <a href="#">Risikohinweis lesen</a>
        </p>
      </div>

      <div className="flex flex-col justify-center rounded-card bg-section p-8 lg:px-[72px]">
        <p className="m-0 text-[13px] font-bold text-brick">Erklärfilm · 1:38 Min.</p>
        <h3 className="m-0 mt-3 text-[clamp(26px,2.6vw,32px)] leading-[1.1] font-extrabold tracking-tight">
          Sehen Sie, wie es funktioniert.
        </h3>
        <p className="m-0 mt-4 text-[16px] leading-relaxed text-ink-2">
          Der Film zeigt in 1:38 Minuten, wie Ihr Geld in ein echtes Haus fließt, vom Ankauf bis zur Ausschüttung.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={play}
            disabled={started}
            className="inline-flex cursor-pointer items-center gap-3 rounded-control bg-brick px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brick-hover disabled:cursor-default disabled:opacity-60"
          >
            <svg viewBox="0 0 12 14" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M0 0l12 7-12 7z" />
            </svg>
            Film ansehen
          </button>
        </div>
        <p className="m-0 mt-4 text-[13px] text-ink-2">Mit Untertiteln, auch ohne Ton verständlich.</p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="modell" className="section">
      <div className="container-site">
        <h2 className="h2 max-w-[640px]">Immobilienrendite – ohne Kredit, Notar und Mieter</h2>

        <ol className="m-0 mt-8 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {steps.map((s, i) => (
            <li key={s.title} className="border-t-2 border-ink pt-6 lg:pr-4">
              <p className="m-0 text-[13px] font-bold text-brick">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="m-0 mt-3 text-[18px] leading-snug font-bold">{s.title}</h3>
              <p className="m-0 mt-2 text-[15px] leading-relaxed text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex gap-4 rounded-card bg-green-tint px-6 py-5">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-6 shrink-0 text-green" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M16 14.6c3 0 5 1.6 5.5 4.4" />
          </svg>
          <div>
            <p className="m-0 text-[16px] font-bold">Mitglieder, die sich kennen</p>
            <p className="m-0 mt-1 text-[15px] text-ink-2">
              Einmal im Jahr treffen sich die Mitglieder mit Vorstand und Projektleitern: Bericht, Besichtigung, Gespräch.
              Viele kommen seit Jahren.
            </p>
          </div>
        </div>

        <ExplainerVideo />
      </div>
    </section>
  )
}
