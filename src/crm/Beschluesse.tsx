import { useEffect, useState } from 'react'
import { api, type ActionResult, type Beschluss, type CrmDocument, type Inbox } from './api'
import { dateTime, inputClass, labelClass } from './format'
import { Badge, Button, ErrorNote, Notice } from './ui'

const STATUS: Record<Beschluss['status'], { label: string; className: string }> = {
  offen: { label: 'Wartet auf Zustimmung', className: 'bg-gold-100 text-gold-700' },
  zugestimmt: { label: 'Beschlossen', className: 'bg-green-tint text-green' },
  abgelehnt: { label: 'Abgelehnt', className: 'bg-coral-100 text-coral-600' },
  zurückgezogen: { label: 'Zurückgezogen', className: 'bg-navy-050 text-muted' },
}

/** Signed PDFs and other files of a member, opened in a new tab (each opening is logged). */
export function DocumentLinks({ member, documents }: { member: number; documents: CrmDocument[] }) {
  if (!documents.length) return <p className="m-0 text-sm text-muted">Kein Dokument angehängt.</p>
  return (
    <ul className="m-0 grid list-none gap-1.5 p-0">
      {documents.map((d) => (
        <li key={d.id}>
          <a href={api.documentUrl(member, d.id)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="rounded bg-navy-050 px-1.5 py-0.5 text-[10px] font-bold text-ink">PDF</span>
            {d.name}
          </a>
          <span className="ml-2 text-xs text-muted">{dateTime(d.time)} · {d.user}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * One decision: who has voted, the attached documents and, for an
 * Aufsichtsrat member who hasn't voted yet, Zustimmen / Ablehnen.
 */
export function BeschlussCard({
  member,
  b,
  documents,
  onDone,
  canCancel = false,
}: {
  member: number
  b: Beschluss
  documents: CrmDocument[]
  onDone: (res: ActionResult) => void
  canCancel?: boolean
}) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const voted = b.votes.filter((v) => v.vote).length

  async function run(action: () => Promise<ActionResult>) {
    setBusy(true)
    setError('')
    try {
      onDone(await action())
      setNote('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`rounded-card border px-5 py-4 ${b.status === 'offen' ? 'border-gold bg-cream' : 'border-line-soft bg-white'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="m-0 mr-auto text-[15px] font-semibold">{b.title}</h3>
        <Badge className={STATUS[b.status].className}>{STATUS[b.status].label}</Badge>
      </div>
      <p className="mb-3 mt-1 text-xs text-muted">
        Vorgelegt am {dateTime(b.created)} von {b.by}
        {b.status === 'offen' ? ` · ${voted} von ${b.votes.length} Stimmen` : b.closed ? ` · entschieden am ${dateTime(b.closed)}` : ''}
        {b.type === 'zulassung' && b.portal && ' · Portal-Zugang nach Zulassung'}
      </p>

      <ul className="m-0 grid list-none gap-1.5 p-0 text-sm sm:grid-cols-3">
        {b.votes.map((v) => (
          <li key={v.name} className="flex items-start gap-2 rounded-control bg-white/70 px-3 py-2">
            <span
              aria-hidden
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                v.vote === 'zugestimmt' ? 'bg-green text-white' : v.vote === 'abgelehnt' ? 'bg-coral-600 text-white' : 'border border-line text-muted'
              }`}
            >
              {v.vote === 'zugestimmt' ? '✓' : v.vote === 'abgelehnt' ? '✕' : ''}
            </span>
            <span>
              <span className="font-semibold">{v.name}</span>
              <span className="block text-xs text-muted">
                {v.vote ? `${v.vote === 'zugestimmt' ? 'Zugestimmt' : 'Abgelehnt'} am ${dateTime(v.time)}` : 'Stimme ausstehend'}
              </span>
              {v.note && <span className="block text-xs text-ink-2">„{v.note}“</span>}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <p className={`${labelClass} mb-1.5`}>Unterlagen</p>
        <DocumentLinks member={member} documents={documents} />
      </div>

      {error && <div className="mt-3"><ErrorNote>{error}</ErrorNote></div>}

      {b.canVote && (
        <div className="mt-4 border-t border-cream-line pt-4">
          <label className="block">
            <span className={labelClass}>Anmerkung (optional)</span>
            <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => run(() => api.vote(member, b.id, { vote: 'zugestimmt', note }))}>Zustimmen</Button>
            <Button variant="quiet" disabled={busy} onClick={() => run(() => api.vote(member, b.id, { vote: 'abgelehnt', note }))}>Ablehnen</Button>
          </div>
        </div>
      )}
      {canCancel && b.status === 'offen' && !b.canVote && (
        <button type="button" disabled={busy} className="mt-3 cursor-pointer border-0 bg-transparent p-0 text-xs text-muted underline" onClick={() => run(() => api.cancel(member, b.id))}>
          Vorlage zurückziehen
        </button>
      )}
    </div>
  )
}

/** Inbox of the Aufsichtsrat: every open decision, with documents and the vote buttons. */
export function BeschlussInbox({ onChange }: { onChange: () => void }) {
  const [inbox, setInbox] = useState<Inbox | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const load = () => api.inbox().then(setInbox, (e: Error) => setError(e.message))
  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[40px] font-normal leading-tight">Beschlüsse</h1>
      <p className="mb-6 mt-0 max-w-[700px] text-muted">
        Offene Vorlagen an den Aufsichtsrat. Ein Beschluss ist gefasst, wenn alle {inbox?.size ?? 3} Mitglieder zugestimmt haben; eine Ablehnung lehnt ihn ab.
        {inbox && inbox.ar.length < inbox.size && ` Bisher haben ${inbox.ar.length} von ${inbox.size} Aufsichtsratsmitgliedern einen eigenen Zugang.`}
      </p>
      {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
      {error && <ErrorNote>{error}</ErrorNote>}
      {!inbox ? (
        !error && <p className="text-muted">Lade …</p>
      ) : inbox.items.length === 0 ? (
        <p className="rounded-card border border-line-soft bg-white px-5 py-10 text-center text-muted">Keine offenen Beschlüsse.</p>
      ) : (
        <div className="grid gap-4">
          {inbox.items.map((b) => (
            <div key={b.id}>
              <a href={`#/mitglied/${b.member}`} className="mb-1.5 inline-block text-sm font-semibold no-underline">{b.name} →</a>
              <BeschlussCard
                member={b.member}
                b={b}
                documents={b.documents}
                onDone={(res) => {
                  setNotice(res.message)
                  load()
                  onChange()
                }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
