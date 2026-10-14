import { faqs } from '../data/content'

export default function Faq() {
  return (
    <section id="faq" className="section bg-section">
      <div className="mx-auto max-w-[860px]">
        <h2 className="h2">Die Idee, kurz erklärt</h2>
        <p className="m-0 mt-3 text-[16px] text-ink-2">Die Fragen, die uns am häufigsten gestellt werden, und unsere Antworten.</p>

        <div className="mt-8 border-t border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                „{f.q}“
                <span className="text-xl font-medium transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <div className="pb-6 text-[16px] leading-relaxed text-ink-2">
                <p className="m-0 font-bold text-ink">{f.lead}</p>
                <p className="m-0 mt-2">
                  {f.body}
                  {f.link && (
                    <>
                      {' '}
                      <a href={f.link.href}>{f.link.label}</a>
                    </>
                  )}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
