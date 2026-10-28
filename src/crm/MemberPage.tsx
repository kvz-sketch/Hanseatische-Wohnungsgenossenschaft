import { useEffect, useState } from 'react'
import { api, ZINS, type MemberDetail, type Secrets, type Zinszahlung } from './api'
import { MemberForm } from './MemberForm'
import { AR_NAMES, PORTAL, STATUS, date, dateTime, eur, inputClass, kuendigungLabel, labelClass, num, today } from './format'
import { Badge, Button, Card, ErrorNote, Facts, Notice, Table } from './ui'

const sum = (rows: Zinszahlung[], key: 'betrag' | 'steuer') => rows.reduce((s, z) => s + (z[key] ?? 0), 0)

const AR = (name: string, status: string) => [status, name].filter(Boolean).join(', ') || '–'

export default function MemberPage({ id, onChange }: { id: number; onChange: () => void }) {
  const [m, setM] = useState<MemberDetail | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [secrets, setSecrets] = useState<Secrets | null>(null)
  const [editing, setEditing] = useState(false)
  const [deciding, setDeciding] = useState<'approve' | 'reject' | null>(null)
  const [busy, setBusy] = useState(false)
  const [payout, setPayout] = useState<Zinszahlung | null>(null)

  useEffect(() => {
    api.get(id).then(setM, (e: Error) => setError(e.message))
  }, [id])

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
      setDeciding(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

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
          onCancel={() => setEditing(false)}
          onSave={async (record, s) => {
            const detail = await api.update(id, record, s)
            if (secrets) setSecrets(await api.reveal(id).catch(() => null))
            apply(detail, 'Gespeichert.')
            setEditing(false)
          }}
        />
      </>
    )
  }

  const zinsRows = r.zeichnungen.map((z) => [
    num(z.anteile),
    eur(z.betrag),
    date(z.zahlung),
    date(z.zugelassen),
    AR(z.ar, z.ar_status),
    z.betrag ? eur(z.betrag * ZINS) : '–',
    z.betrag ? eur((z.betrag * ZINS) / 4) : '–',
    date(z.zins_ende),
    date(z.zins_zahlung),
  ])

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
            {k && <Badge className="bg-coral-100 text-coral-600">{k}</Badge>}
          </div>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {r.status === 'antrag' && (
            <>
              <Button onClick={() => setDeciding('approve')}>Zulassen</Button>
              <Button variant="quiet" onClick={() => setDeciding('reject')}>Ablehnen</Button>
            </>
          )}
          {r.status === 'zugelassen' && (
            <Button variant={m.portal.status === 'keiner' ? 'primary' : 'quiet'} disabled={busy} onClick={() => run(() => api.portal(id))}>
              {m.portal.status === 'keiner' ? 'Portal-Zugang einrichten' : 'Willkommensmail erneut senden'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => setEditing(true)}>Bearbeiten</Button>
        </div>
      </div>

      {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
      {error && <ErrorNote>{error}</ErrorNote>}
      {deciding && <Decision kind={deciding} busy={busy} hasEmail={!!r.email} onCancel={() => setDeciding(null)} onSubmit={(body) => run(() => (deciding === 'approve' ? api.approve(id, body) : api.reject(id, body)))} />}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Zulassung">
          <Facts
            items={[
              ['Status', STATUS[r.status].label],
              ['Mitgliedsnummer', r.nr ?? 'wird bei Zulassung vergeben'],
              ['Art', r.art === 'o' ? 'ordentliches Mitglied' : 'investierendes Mitglied'],
              ['Tag der Zulassung', date(r.zulassung_datum)],
              ['Zustimmung Aufsichtsrat', r.zulassung_status],
              ['Zustimmender Aufsichtsrat', r.zulassung_ar],
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
          title="Anteile, Zahlungen und Zinsen"
          aside={<span className="text-sm text-muted">{num(m.totals.aktiv)} von {num(m.totals.anteile)} Anteilen gehalten · {eur(m.totals.kapital)} eingezahlt</span>}
        >
          <Table
            head={[
              { label: 'Anteile', right: true }, { label: 'Betrag', right: true }, { label: 'Zahlungseingang' }, { label: 'Zugelassen am' }, { label: 'Aufsichtsrat' },
              { label: `Zinsen p.a. (${Math.round(ZINS * 100)} %)`, right: true }, { label: 'Zinsen p.q.', right: true }, { label: 'Erstes Ende Verzinsung' }, { label: 'Erste Zinszahlung bis' },
            ]}
            rows={zinsRows}
            empty="Keine Anteile eingetragen."
            foot={r.zeichnungen.length > 1 ? [num(m.totals.anteile), eur(m.totals.kapital), '', '', '', eur(m.totals.kapital * ZINS), eur((m.totals.kapital * ZINS) / 4), '', ''] : undefined}
          />
        </Card>

        <Card
          title="Zinszahlungen"
          aside={m.next && !payout && r.status === 'zugelassen' ? (
            <Button variant="quiet" className="h-8" onClick={() => setPayout({ datum: m.next!.date, zeitraum: m.next!.period, betrag: m.next!.amount, steuer: null })}>
              Fällige Zahlung eintragen
            </Button>
          ) : null}
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
        </Card>

        <Card title="Kündigungen">
          <Table
            head={[{ label: 'Anteile', right: true }, { label: 'Kündigung eingegangen' }, { label: 'Gekündigt zum' }, { label: 'Betrag', right: true }, { label: 'Aufsichtsrat' }, { label: 'Stand' }]}
            rows={r.kuendigungen.map((c) => [num(c.anteile), date(c.datum), date(c.zum), eur(c.betrag), AR(c.ar, c.ar_status), c.zum && c.zum <= today() ? 'ausgezahlt / fällig' : 'läuft'])}
            empty="Keine Kündigungen."
          />
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
          <Card title="Ausscheiden">
            <Facts items={[['Tag der Eintragung', date(r.aus_eintragung)], ['Tag des Ausscheidens', date(r.aus_datum)], ['Grund', r.aus_grund], ['Zustimmung Aufsichtsrat', AR(r.aus_ar, r.aus_ar_status)]]} />
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

        <Card title="Verlauf">
          {m.log.length === 0 ? (
            <p className="m-0 text-sm text-muted">Noch keine Einträge.</p>
          ) : (
            <ol className="m-0 list-none p-0 text-sm">
              {m.log.map((l, i) => (
                <li key={i} className="flex flex-wrap gap-x-4 border-b border-line-soft py-2 last:border-0">
                  <span className="w-[140px] shrink-0 tabular-nums text-muted">{dateTime(l.time)}</span>
                  <span className="w-[160px] shrink-0">{l.user}</span>
                  <span className="font-medium">{l.action}</span>
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

function Decision({
  kind,
  busy,
  hasEmail,
  onCancel,
  onSubmit,
}: {
  kind: 'approve' | 'reject'
  busy: boolean
  hasEmail: boolean
  onCancel: () => void
  onSubmit: (body: { ar: string; datum: string; portal: boolean; grund: string }) => void
}) {
  const [ar, setAr] = useState('')
  const [datum, setDatum] = useState(today())
  const [portal, setPortal] = useState(hasEmail)
  const [grund, setGrund] = useState('')
  const approve = kind === 'approve'
  return (
    <form
      className="mb-5 rounded-card border border-gold bg-cream px-5 py-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ ar: ar.trim(), datum, portal, grund })
      }}
    >
      <h2 className="m-0 text-[15px] font-semibold">{approve ? 'Antrag zulassen' : 'Antrag ablehnen'}</h2>
      <p className="mb-0 mt-1 text-sm text-ink-2">
        {approve
          ? 'Das Mitglied erhält die nächste freie Mitgliedsnummer. Mit Portal-Zugang wird das Konto angelegt und die Willkommensmail gesendet.'
          : 'Der Antrag wird als abgelehnt gespeichert. Es wird keine E-Mail gesendet.'}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={labelClass}>{approve ? 'Zustimmender Aufsichtsrat' : 'Aufsichtsrat'}</span>
          <input className={inputClass} list="decision-ar" value={ar} onChange={(e) => setAr(e.target.value)} required={approve} />
          <datalist id="decision-ar">{AR_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
        </label>
        <label className="block">
          <span className={labelClass}>{approve ? 'Tag der Zulassung' : 'Datum'}</span>
          <input type="date" className={inputClass} value={datum} onChange={(e) => setDatum(e.target.value)} required />
        </label>
        {!approve && (
          <label className="block">
            <span className={labelClass}>Grund (optional)</span>
            <input className={inputClass} value={grund} onChange={(e) => setGrund(e.target.value)} />
          </label>
        )}
      </div>
      {approve && (
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={portal} disabled={!hasEmail} onChange={(e) => setPortal(e.target.checked)} />
          Portal-Zugang einrichten und Willkommensmail senden{!hasEmail && ' (keine E-Mail-Adresse hinterlegt)'}
        </label>
      )}
      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={busy}>{busy ? 'Speichert …' : approve ? 'Zulassen' : 'Ablehnen'}</Button>
        <Button variant="quiet" onClick={onCancel} disabled={busy}>Abbrechen</Button>
      </div>
    </form>
  )
}
