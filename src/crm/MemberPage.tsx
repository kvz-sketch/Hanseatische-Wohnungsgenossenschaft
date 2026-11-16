import { useEffect, useRef, useState } from 'react'
import { api, linkOnly, ZINS, type BeschlussType, type LogEntry, type MemberDetail, type Secrets, type UploadOptions, type Zinszahlung } from './api'
import { ensureApprovalDocs, missingApprovalDocs } from './approvalPdf'
import { BeschlussCard, DocumentLinks } from './Beschluesse'
import { MemberForm } from './MemberForm'
import { PORTAL, STATUS, date, dateTime, eur, inputClass, kuendigungLabel, labelClass, num, today } from './format'
import { Badge, Button, Card, ErrorNote, Facts, Notice, Table } from './ui'

const sum = (rows: Zinszahlung[], key: 'betrag' | 'steuer') => rows.reduce((s, z) => s + (z[key] ?? 0), 0)

const AR = (name: string, status: string) => [status, name].filter(Boolean).join(', ') || '–'

/** Log entries of things that went to the member (emails, documents in their members' area). */
const wasSent = (l: LogEntry) => !!l.sent || l.action === 'Portal-Zugang eingerichtet'

export default function MemberPage({ id, onChange }: { id: number; onChange: () => void }) {
  const [m, setM] = useState<MemberDetail | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [secrets, setSecrets] = useState<Secrets | null>(null)
  // false, or the section the form opens at (true: from the top)
  const [editing, setEditing] = useState<boolean | string>(false)
  // Open DocuSign-link field: 'doc' (Dokumente) or the row of a Kündigung
  const [linkFor, setLinkFor] = useState<'doc' | number | null>(null)
  const [presenting, setPresenting] = useState(false)
  const upload = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [payout, setPayout] = useState<Zinszahlung | null>(null)

  useEffect(() => {
    api.get(id).then(setM, (e: Error) => setError(e.message))
  }, [id])

  // Approved Aufnahme or Kündigung without its approval document yet: make it now
  useEffect(() => {
    if (m && missingApprovalDocs(m).length > 0) ensureApprovalDocs(id, m).then((d) => d && setM(d))
  }, [id, m])

  const apply = (detail: MemberDetail, message = '') => {
    setM(detail)
    setNotice(message)
    onChange()
  }

  async function run(action: () => Promise<{ member: MemberDetail; message: string }>) {
    setBusy(true)
    setError('')
    try {
      const res = await action()
      apply(res.member, res.message)
      setPresenting(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  /** Adds a PDF or a DocuSign link (file null, opts.url) to the member. */
  async function addDocument(f: File | null, opts: UploadOptions, done: string) {
    setBusy(true)
    setError('')
    try {
      const detail = await api.upload(id, f, opts)
      apply(detail, detail.message ?? done)
      setLinkFor(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const uploadSchreiben = (ref: number, f: File | null, url?: string) =>
    addDocument(f, { kind: 'kuendigung', ref, url }, 'Kündigungsschreiben hinzugefügt. Die Kündigung kann jetzt vorgelegt werden.')

  async function reveal() {
    setError('')
    try {
      setSecrets(await api.reveal(id))
      setM(await api.get(id)) // the log now shows the access
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (!m) return error ? <ErrorNote>{error}</ErrorNote> : <p className="text-muted">Lade …</p>
  const r = m.record
  const name = `${r.vorname} ${r.nachname}`.trim() || r.firma || 'Ohne Namen'
  const k = r.status === 'zugelassen' ? kuendigungLabel(m.totals) : null
  // Ordentliche Mitglieder: no interest, decisions by the Vorstand instead of the Aufsichtsrat
  const ordentlich = r.art === 'o'
  const gremium = ordentlich ? 'Vorstand' : 'Aufsichtsrat'

  if (editing) {
    return (
      <>
        <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-sm text-ink" onClick={() => setEditing(false)}>← {name}</button>
        <h1 className="mb-6 mt-2 font-display text-[40px] font-normal leading-tight">Bearbeiten</h1>
        <MemberForm
          mode="edit"
          initial={r}
          masked={m.masked}
          revealed={secrets}
          focus={typeof editing === 'string' ? editing : undefined}
          onCancel={() => setEditing(false)}
          onSave={async (record, s) => {
            const detail = await api.update(id, record, s)
            if (secrets) setSecrets(await api.reveal(id).catch(() => null))
            apply(detail, detail.message ? `Gespeichert. ${detail.message}` : 'Gespeichert.')
            setEditing(false)
            window.scrollTo(0, 0)
          }}
        />
      </>
    )
  }

  const open = (type: BeschlussType, ref = 0) => m.beschluesse.some((b) => b.status === 'offen' && b.type === type && b.ref === ref)
  const present = (type: BeschlussType, ref = 0) => run(() => api.vorlegen(id, { type, ref }))
  // "Vorlegen" in a row of Anteile or Kündigungen that the Aufsichtsrat has not approved yet
  const presentCell = (type: BeschlussType, ref: number, status: string) =>
    r.status !== 'zugelassen' || status === 'zugestimmt' ? '' : open(type, ref) || status === 'offen' ? (
      <span key={`${type}${ref}`} className="text-xs text-gold-700">beim {gremium}</span>
    ) : type === 'kuendigung' && !r.kuendigungen[ref]?.schreiben ? (
      <span key={`${type}${ref}`} className="text-xs text-muted">erst Schreiben hochladen</span>
    ) : (
      <Button key={`${type}${ref}`} variant="quiet" className="h-7 px-2 text-xs" disabled={busy} onClick={() => present(type, ref)}>Vorlegen</Button>
    )
  const sent = m.log.filter(wasSent)
  const schreibenCell = (ref: number, doc: string, status: string) => {
    const d = m.documents.find((x) => x.id === doc)
    if (doc) {
      return (
        <a key={`s${ref}`} href={d && linkOnly(d) ? d.url : api.documentUrl(id, doc)} target="_blank" rel="noopener" className="text-sm font-semibold">
          {d?.name ?? 'Kündigungsschreiben'}
        </a>
      )
    }
    if (status === 'offen' || status === 'zugestimmt') return '–'
    if (linkFor === ref) return <LinkField key={`s${ref}`} busy={busy} onSave={(url) => uploadSchreiben(ref, null, url)} onCancel={() => setLinkFor(null)} />
    return (
      <span key={`s${ref}`} className="inline-flex flex-wrap gap-1">
        <label className="inline-flex h-7 cursor-pointer items-center rounded-control border border-line bg-white px-2 text-xs font-medium hover:border-ink">
          PDF hochladen
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) uploadSchreiben(ref, f)
            }}
          />
        </label>
        <Button variant="quiet" className="h-7 px-2 text-xs" disabled={busy} onClick={() => setLinkFor(ref)}>DocuSign-Link</Button>
      </span>
    )
  }
  const editButton = (section: string, label = 'Bearbeiten') => (
    <Button variant="quiet" className="h-8" onClick={() => setEditing(section)}>{label}</Button>
  )
  const beschluesse = [...m.beschluesse].sort((a, b) => Number(b.status === 'offen') - Number(a.status === 'offen') || b.created.localeCompare(a.created))

  const zinsRows = r.zeichnungen.map((z, i) =>
    ordentlich
      ? [num(z.anteile), eur(z.betrag), date(z.zahlung), date(z.zugelassen), AR(z.ar, z.ar_status), presentCell('zeichnung', i, z.ar_status)]
      : [
          num(z.anteile),
          eur(z.betrag),
          date(z.zahlung),
          date(z.zugelassen),
          AR(z.ar, z.ar_status),
          z.betrag ? eur(z.betrag * ZINS) : '–',
          z.betrag ? eur((z.betrag * ZINS) / 4) : '–',
          date(z.zins_ende),
          date(z.zins_zahlung),
          presentCell('zeichnung', i, z.ar_status),
        ],
  )

  return (
    <>
      <a href="#/" className="text-sm no-underline">← Alle Mitglieder</a>
      <div className="mb-6 mt-2 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <h1 className="m-0 font-display text-[40px] font-normal leading-tight">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            {r.nr && <span>Mitglied Nr. {r.nr}</span>}
            {r.firma && r.vorname && <span>· {r.firma}</span>}
            <Badge className={STATUS[r.status].className}>{STATUS[r.status].label}</Badge>
            {ordentlich && <Badge className="bg-navy-050 text-ink">Ordentliches Mitglied</Badge>}
            {k && <Badge className="bg-coral-100 text-coral-600">{k}</Badge>}
          </div>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {r.status === 'antrag' && !open('zulassung') && <Button onClick={() => setPresenting(true)}>Dem {gremium} vorlegen</Button>}
          {r.status === 'zugelassen' && (
            <Button variant={m.portal.status === 'keiner' ? 'primary' : 'quiet'} disabled={busy} onClick={() => run(() => api.portal(id))}>
              {m.portal.status === 'keiner' ? 'Portal-Zugang einrichten' : 'Bestätigungsmail erneut senden'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => setEditing(true)}>Bearbeiten</Button>
        </div>
      </div>

      {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
      {error && <ErrorNote>{error}</ErrorNote>}
      {presenting && (
        <Vorlegen gremium={gremium} busy={busy} hasEmail={!!r.email} hasDocument={m.documents.length > 0} onCancel={() => setPresenting(false)} onSubmit={() => run(() => api.vorlegen(id, { type: 'zulassung', portal: true }))} />
      )}

      {beschluesse.length > 0 && (
        <div className="mb-5 grid gap-3">
          {beschluesse.map((b) => (
            <BeschlussCard key={b.id} member={id} b={b} documents={m.documents} canCancel onDone={(res) => apply(res.member, res.message)} />
          ))}
        </div>
      )}

      <Card
        title="An das Mitglied gesendet"
        aside={
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-sm text-ink underline-offset-4 hover:underline" onClick={() => document.getElementById('verlauf')?.scrollIntoView({ behavior: 'smooth' })}>
            Ganzer Verlauf ↓
          </button>
        }
      >
        {sent.length === 0 ? (
          <p className="m-0 text-sm text-muted">Noch nichts gesendet.</p>
        ) : (
          <ol className="m-0 list-none p-0 text-sm">
            {sent.map((l, i) => (
              <li key={i} className="flex flex-wrap gap-x-4 border-b border-line-soft py-2 last:border-0">
                <span className="w-[140px] shrink-0 tabular-nums text-muted">{dateTime(l.time)}</span>
                <span className="font-medium">{l.action}</span>
                {l.detail && <span className="text-muted">{l.detail}</span>}
              </li>
            ))}
          </ol>
        )}
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Zulassung">
          <Facts
            items={[
              ['Status', STATUS[r.status].label],
              ['Mitgliedsnummer', r.nr ?? 'wird bei Zulassung vergeben'],
              ['Art', ordentlich ? 'Ordentliches Mitglied (keine Zinsen, Zustimmung durch den Vorstand)' : 'Investierendes Mitglied'],
              ['Eintrittsdatum', r.eintritt ? date(r.eintritt) : r.zulassung_datum ? `${date(r.zulassung_datum)} (Tag der Zulassung)` : '–'],
              ['Tag der Zulassung', date(r.zulassung_datum)],
              [`Zustimmung ${gremium}`, r.zulassung_status],
              [`Zustimmender ${gremium}`, r.zulassung_ar],
              ['Kündigung möglich zu', date(r.kuendbar_zu)],
              ['Empfehler', r.empfehler],
              ['Portal', r.status === 'zugelassen' ? `${PORTAL[m.portal.status]}${m.portal.invited ? ` am ${dateTime(m.portal.invited)}` : ''}` : 'erst nach Zulassung'],
            ]}
          />
        </Card>
        <Card title="Stammdaten">
          <Facts
            items={[
              ['Anrede', r.anrede],
              ['Name', `${r.vorname} ${r.nachname}`.trim()],
              ['Firma', r.firma],
              ['Anschrift', [r.strasse, `${r.plz} ${r.ort}`.trim(), r.land].filter(Boolean).join(', ')],
              ['Telefon', r.telefon ? <a key="tel" href={`tel:${r.telefon.replace(/\s+/g, '')}`}>{r.telefon}</a> : ''],
              ['E-Mail', r.email ? <a key="mail" href={`mailto:${r.email}`}>{r.email}</a> : ''],
              ['Geburtstag', date(r.geburtstag)],
            ]}
          />
        </Card>
      </div>

      <div className="mt-5 grid gap-5">
        <Card
          title={ordentlich ? 'Anteile und Zahlungen' : 'Anteile, Zahlungen und Zinsen'}
          aside={
            <span className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted">{num(m.totals.aktiv)} von {num(m.totals.anteile)} Anteilen gehalten · {eur(m.totals.kapital)} eingezahlt</span>
              {editButton('anteile')}
            </span>
          }
        >
          <Table
            head={[
              { label: 'Anteile', right: true }, { label: 'Betrag', right: true }, { label: 'Zahlungseingang' }, { label: 'Zugelassen am' }, { label: gremium },
              ...(ordentlich
                ? []
                : [{ label: `Zinsen p.a. (${Math.round(ZINS * 100)} %)`, right: true }, { label: 'Zinsen p.q.', right: true }, { label: 'Erstes Ende Verzinsung' }, { label: 'Erste Zinszahlung bis' }]),
              { label: '' },
            ]}
            rows={zinsRows}
            empty="Keine Anteile eingetragen."
            foot={
              r.zeichnungen.length > 1
                ? ordentlich
                  ? [num(m.totals.anteile), eur(m.totals.kapital), '', '', '', '']
                  : [num(m.totals.anteile), eur(m.totals.kapital), '', '', '', eur(m.totals.kapital * ZINS), eur((m.totals.kapital * ZINS) / 4), '', '', '']
                : undefined
            }
          />
          {ordentlich && <p className="mb-0 mt-3 text-xs text-muted">Ordentliches Mitglied: keine Verzinsung.</p>}
        </Card>

        {(!ordentlich || r.zinszahlungen.length > 0) && <Card
          title="Zinszahlungen"
          aside={
            <span className="flex flex-wrap gap-2">
              {m.next && !payout && r.status === 'zugelassen' && (
                <Button variant="quiet" className="h-8" onClick={() => setPayout({ datum: m.next!.date, zeitraum: m.next!.period, betrag: m.next!.amount, steuer: null })}>
                  Fällige Zahlung eintragen
                </Button>
              )}
              {editButton('zinsen')}
            </span>
          }
        >
          {payout && (
            <form
              className="mb-4 rounded-card border border-gold bg-cream p-4"
              onSubmit={async (e) => {
                e.preventDefault()
                setBusy(true)
                setError('')
                try {
                  const detail = await api.update(id, { ...r, zinszahlungen: [...r.zinszahlungen, payout] }, { iban: null, steuer_id: null, kirchensteuer: null })
                  apply(detail, 'Zinszahlung eingetragen.')
                  setPayout(null)
                } catch (err) {
                  setError((err as Error).message)
                } finally {
                  setBusy(false)
                }
              }}
            >
              <p className="m-0 mb-3 text-sm text-ink-2">Vorschlag aus den Einzahlungen (7 % p.a.). Bitte mit der tatsächlichen Überweisung abgleichen.</p>
              <div className="grid gap-3 sm:grid-cols-4">
                {([['datum', 'Ausgezahlt am', 'date'], ['zeitraum', 'Zeitraum bis', 'date'], ['betrag', 'Brutto €', 'number'], ['steuer', 'Steuer einbehalten €', 'number']] as const).map(([key, label, type]) => (
                  <label key={key} className="block">
                    <span className={labelClass}>{label}</span>
                    <input
                      type={type}
                      step={type === 'number' ? '0.01' : undefined}
                      required={key !== 'steuer'}
                      className={inputClass}
                      value={payout[key] ?? ''}
                      onChange={(e) => setPayout({ ...payout, [key]: type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value })}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-3">
                <Button type="submit" disabled={busy}>{busy ? 'Speichert …' : 'Eintragen'}</Button>
                <Button variant="quiet" onClick={() => setPayout(null)} disabled={busy}>Abbrechen</Button>
              </div>
            </form>
          )}
          <Table
            head={[{ label: 'Ausgezahlt am' }, { label: 'Zeitraum bis' }, { label: 'Brutto', right: true }, { label: 'Steuer einbehalten', right: true }, { label: 'Netto', right: true }]}
            rows={[...r.zinszahlungen].sort((a, b) => a.datum.localeCompare(b.datum)).map((z) => [date(z.datum), date(z.zeitraum), eur(z.betrag), eur(z.steuer ?? 0), eur((z.betrag ?? 0) - (z.steuer ?? 0))])}
            empty="Noch keine Zinszahlungen eingetragen."
            foot={r.zinszahlungen.length > 1 ? ['Summe', '', eur(sum(r.zinszahlungen, 'betrag')), eur(sum(r.zinszahlungen, 'steuer')), eur(sum(r.zinszahlungen, 'betrag') - sum(r.zinszahlungen, 'steuer'))] : undefined}
          />
          {m.next && r.status === 'zugelassen' && (
            <p className="mb-0 mt-3 text-xs text-muted">Nächste fällige Zahlung (berechnet): {eur(m.next.amount)} für den Zeitraum bis {date(m.next.period)}, spätestens am {date(m.next.date)}.</p>
          )}
        </Card>}

        <Card
          title="Kündigungen"
          aside={
            <span className="flex flex-wrap gap-2">
              {r.kuendigungen.length > 0 && editButton('kuendigungen')}
              {editButton('kuendigung-neu', 'Kündigung hinzufügen')}
            </span>
          }
        >
          <Table
            head={[{ label: 'Anteile', right: true }, { label: 'Kündigung eingegangen' }, { label: 'Gekündigt zum' }, { label: 'Betrag', right: true }, { label: 'Kündigungsschreiben' }, { label: gremium }, { label: 'Stand' }, { label: '' }]}
            rows={r.kuendigungen.map((c, i) => [num(c.anteile), date(c.datum), date(c.zum), eur(c.betrag), schreibenCell(i, c.schreiben, c.ar_status), AR(c.ar, c.ar_status), c.zum && c.zum <= today() ? 'ausgezahlt / fällig' : 'läuft', presentCell('kuendigung', i, c.ar_status)])}
            empty="Keine Kündigungen."
          />
          {r.kuendigungen.length > 0 && (
            <p className="mb-0 mt-3 text-xs text-muted">
              Vor der Vorlage an den {gremium} das ausgefüllte Kündigungsschreiben hinzufügen (PDF oder DocuSign-Link). Nach der Zustimmung liegt die Bestätigung unter „Dokumente“ und geht dem
              Mitglied per E-Mail zu. Wird eine genehmigte oder vorliegende Kündigung geändert, wird sie beim Speichern automatisch neu vorgelegt.
            </p>
          )}
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card
            title="Bank und Steuer"
            aside={!secrets && (m.masked.iban || m.masked.steuer_id || m.masked.kirchensteuer) ? <Button variant="quiet" className="h-8" onClick={reveal}>Anzeigen</Button> : null}
          >
            <Facts
              items={[
                ['IBAN', <span key="iban" className="font-mono">{(secrets ?? m.masked).iban.replace(/(.{4})(?=.)/g, secrets ? '$1 ' : '$1')}</span>],
                ['Kontoinhaber', r.kontoinhaber],
                ['Steuer-ID', <span key="stid" className="font-mono">{(secrets ?? m.masked).steuer_id}</span>],
                ['Kirchensteuer', (secrets ?? m.masked).kirchensteuer],
                ['Bundesland', r.bundesland],
                ['Freistellungsauftrag', r.freistellung === null ? '' : eur(r.freistellung)],
              ]}
            />
            <p className="mb-0 mt-3 text-xs text-muted">Verschlüsselt gespeichert. Das Anzeigen wird im Verlauf festgehalten.</p>
          </Card>
          <Card title="Bemerkungen">
            <p className="m-0 whitespace-pre-line text-sm">{r.bemerkungen || <span className="text-muted">Keine Bemerkungen.</span>}</p>
          </Card>
        </div>

        {(r.status === 'ausgeschieden' || r.aus_datum || r.aus_grund) && (
          <Card
            title="Ausscheiden"
            aside={r.status === 'zugelassen' && r.aus_ar_status !== 'zugestimmt' && !open('ausscheiden') ? (
              <Button variant="quiet" className="h-8" disabled={busy} onClick={() => present('ausscheiden')}>Dem {gremium} vorlegen</Button>
            ) : null}
          >
            <Facts items={[['Tag der Eintragung', date(r.aus_eintragung)], ['Tag des Ausscheidens', date(r.aus_datum)], ['Grund', r.aus_grund], [`Zustimmung ${gremium}`, AR(r.aus_ar, r.aus_ar_status)]]} />
          </Card>
        )}

        {r.bonus.length > 0 && (
          <Card title="Zeichnungsbonus">
            <Table
              head={[{ label: 'Projekt' }, { label: 'Anteile', right: true }, { label: 'Betrag', right: true }, { label: 'Auszahlung am' }]}
              rows={r.bonus.map((b) => [b.projekt, num(b.anteile), eur(b.betrag), date(b.auszahlung)])}
              empty=""
            />
          </Card>
        )}

        <Card
          title="Dokumente"
          aside={
            <>
              <input
                ref={upload}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (!f) return
                  setBusy(true)
                  setError('')
                  try {
                    apply(await api.upload(id, f), 'Dokument angehängt.')
                  } catch (err) {
                    setError((err as Error).message)
                  } finally {
                    setBusy(false)
                  }
                }}
              />
              <span className="flex flex-wrap gap-2">
                <Button variant="quiet" className="h-8" disabled={busy} onClick={() => upload.current?.click()}>PDF hochladen</Button>
                <Button variant="quiet" className="h-8" disabled={busy} onClick={() => setLinkFor('doc')}>DocuSign-Link</Button>
              </span>
            </>
          }
        >
          {linkFor === 'doc' && (
            <div className="mb-4">
              <LinkField busy={busy} onSave={(url) => addDocument(null, { url }, 'DocuSign-Dokument hinzugefügt.')} onCancel={() => setLinkFor(null)} />
              <p className="mb-0 mt-1 text-xs text-muted">Mit eingerichteter DocuSign-Anbindung wird das unterschriebene PDF geladen und gespeichert, sonst der Link.</p>
            </div>
          )}
          <DocumentLinks member={id} documents={m.documents} />
          <p className="mb-0 mt-3 text-xs text-muted">
            Alle Dokumente sieht das Mitglied auch in seinem Mitgliederbereich. Verschlüsselt gespeichert; das Öffnen wird im Verlauf festgehalten.
          </p>
        </Card>

        <Card title="Verlauf" id="verlauf">
          {m.log.length === 0 ? (
            <p className="m-0 text-sm text-muted">Noch keine Einträge.</p>
          ) : (
            <ol className="m-0 list-none p-0 text-sm">
              {m.log.map((l, i) => (
                <li key={i} className="flex flex-wrap gap-x-4 border-b border-line-soft py-2 last:border-0">
                  <span className="w-[140px] shrink-0 tabular-nums text-muted">{dateTime(l.time)}</span>
                  <span className="w-[160px] shrink-0">{l.user}</span>
                  <span className="font-medium">{l.action}</span>
                  {wasSent(l) && <Badge className="bg-gold-100 text-gold-700">an Mitglied</Badge>}
                  {l.detail && <span className="text-muted">{l.detail}</span>}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  )
}

/** Field for a DocuSign link (https). */
function LinkField({ busy, onSave, onCancel }: { busy: boolean; onSave: (url: string) => void; onCancel: () => void }) {
  const [url, setUrl] = useState('')
  const ok = /^https:\/\/\S+$/.test(url.trim())
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) onSave(url.trim())
      }}
    >
      <label className="min-w-[220px] flex-1">
        <span className="sr-only">DocuSign-Link</span>
        <input autoFocus type="url" className={inputClass} placeholder="DocuSign-Link (https://…)" value={url} onChange={(e) => setUrl(e.target.value)} />
      </label>
      <Button type="submit" className="h-10" disabled={busy || !ok}>Hinzufügen</Button>
      <Button variant="quiet" className="h-10" onClick={onCancel}>Abbrechen</Button>
    </form>
  )
}

/** Puts an Antrag to the Aufsichtsrat (or Vorstand); the confirmation email follows once all have agreed. */
function Vorlegen({
  gremium,
  busy,
  hasEmail,
  hasDocument,
  onCancel,
  onSubmit,
}: {
  gremium: 'Aufsichtsrat' | 'Vorstand'
  busy: boolean
  hasEmail: boolean
  hasDocument: boolean
  onCancel: () => void
  onSubmit: () => void
}) {
  return (
    <form
      className="mb-5 rounded-card border border-gold bg-cream px-5 py-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <h2 className="m-0 text-[15px] font-semibold">Antrag dem {gremium} vorlegen</h2>
      <p className="mb-0 mt-1 text-sm text-ink-2">
        {gremium === 'Vorstand'
          ? 'Ordentliches Mitglied: Der Vorstand erhält eine E-Mail und stimmt in der Mitgliederliste ab. Mit seiner Zustimmung'
          : 'Alle Mitglieder des Aufsichtsrats erhalten eine E-Mail und stimmen in der Mitgliederliste ab. Sobald alle zugestimmt haben,'}{' '}
        wird das Mitglied mit der nächsten freien Mitgliedsnummer zugelassen.
      </p>
      {!hasDocument && <p className="mb-0 mt-2 text-sm text-coral-600">Noch keine unterschriebene Beitrittserklärung angehängt (unten unter „Dokumente“).</p>}
      <p className={`mb-0 mt-2 text-sm ${hasEmail ? 'text-ink-2' : 'text-coral-600'}`}>
        {hasEmail
          ? 'Nach der Zulassung erhält das Mitglied automatisch die Bestätigung per E-Mail: Mitgliedsnummer, Zahlungsdaten und Zugang zum Mitgliederbereich. Die Zustimmungen werden der Beitrittserklärung unter „Dokumente“ beigefügt.'
          : 'Keine E-Mail-Adresse hinterlegt: Die Bestätigung mit Zugangsdaten kann erst nach dem Eintragen einer Adresse gesendet werden („Portal-Zugang einrichten“).'}
      </p>
      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={busy}>{busy ? 'Speichert …' : 'Vorlegen'}</Button>
        <Button variant="quiet" onClick={onCancel} disabled={busy}>Abbrechen</Button>
      </div>
    </form>
  )
}
