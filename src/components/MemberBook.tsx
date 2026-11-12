import bookImage from '../assets/media/buch-hintergrund.jpg'

/** Stephan Gerlach's book in the Remote Verlag shop (same link as on the homepage). */
export const BOOK_URL = 'https://www.remote-verlag.de/products/immobilien-investitionen-leicht-gemacht'

/**
 * Stephan Gerlach's book, to buy in the publisher's shop. As on the homepage:
 * the cover visual is the background, the text sits on the sky on the right.
 * On phones the whole visual sits on top and the text below.
 */
export default function MemberBook() {
  return (
    <section id="buch" className="scroll-mt-20 bg-[#3E6F8E]">
      <div
        className="bg-[length:100%_auto] bg-top bg-no-repeat pt-[34.6vw] md:bg-cover md:bg-left md:pt-0"
        style={{ backgroundImage: `url(${bookImage})` }}
      >
        <div className="container-site flex min-h-0 items-center px-5 pb-10 md:min-h-[440px] md:justify-end md:py-16">
          <div className="w-full rounded-card bg-[rgba(14,19,56,0.72)] px-6 py-7 text-white backdrop-blur-sm md:max-w-[480px] md:px-10 md:py-9">
            <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-gold-400 uppercase">Spiegel-Bestseller</p>
            <h2 className="h2 mt-3 text-white">Immobilien Investitionen leicht gemacht</h2>
            <p className="m-0 mt-3 text-[16px] leading-relaxed text-lighter-dark">
              Das Buch von Stephan Gerlach, Vorstand der Hanseatischen Invest eG: Ihr Leitfaden für Immobilien als Kapitalanlage.
            </p>
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex h-12 items-center rounded-control bg-gold px-6 text-[16px] font-semibold text-ink no-underline hover:bg-gold-400"
            >
              Zum Buchkauf
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
