import { useCallback, useEffect, useMemo, useState } from 'react'
import { currentMember, logout } from '../auth/auth'
import { Logo } from '../components/ui'
import { api, type MemberSummary } from '../crm/api'
import { BeschlussInbox } from '../crm/Beschluesse'
import MemberPage from '../crm/MemberPage'
import { MemberForm } from '../crm/MemberForm'
import { PORTAL, STATUS, date, eur, go, kuendigungLabel, num } from '../crm/format'
import { Badge, Button, ErrorNote } from '../crm/ui'

/** Views by URL hash: #/ (list), #/antraege, #/bonus, #/neu, #/mitglied/12. */
type Route = { view: 'list' | 'antraege' | 'bonus' | 'neu' | 'beschluesse' } | { view: 'member'; id: number }

function parseHash(): Route {
  const h = location.hash.replace(/^#\/?/, '')
  const m = /^mitglied\/(\d+)/.exec(h)
  if (m) return { view: 'member', id: Number(m[1]) }
  if (h === 'antraege' || h === 'bonus' || h === 'neu' || h === 'beschluesse') return { view: h }
  return { view: 'list' }
}

export default function Mitgliederliste() {
  const [route, setRoute] = useState(parseHash)
  const [members, setMembers] = useState<MemberSummary[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  const [pending, setPending] = useState(0)
  const reload = useCallback(() => {
    api.list().then(setMembers, (e: Error) => setError(e.message))
    // Decisions waiting for the logged-in Aufsichtsrat member (0 for other staff)
    api.inbox().then((i) => setPending(i.items.filter((b) => b.canVote).length), () => setPending(0))
  }, [])
  useEffect(reload, [reload])

  const user = currentMember()
  const antraege = members?.filter((m) => m.status === 'antrag').length ?? 0

  return (
    <div className="min-h-screen bg-section">
      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          <a href="#/" className="flex items-center gap-3 text-ink no-underline hover:text-ink">
            <Logo className="h-10 w-auto" />
            <span className="hidden border-l border-line pl-3 text-[15px] font-semibold sm:inline">Mitgliederliste</span>
          </a>
          <nav className="order-last -mx-3 flex w-[calc(100%+24px)] gap-1 overflow-x-auto text-sm font-medium md:order-none md:mx-0 md:w-auto" aria-label="Bereiche">
            <Tab href="#/" active={route.view === 'list' || route.view === 'member'}>Mitglieder</Tab>
            <Tab href="#/antraege" active={route.view === 'antraege'}>
              Anträge{antraege > 0 && <span className="ml-1.5 rounded-full bg-gold px-1.5 py-px text-[11px] font-bold text-ink">{antraege}</span>}
            </Tab>
            <Tab href="#/beschluesse" active={route.view === 'beschluesse'}>
              Beschlüsse{pending > 0 && <span className="ml-1.5 rounded-full bg-gold px-1.5 py-px text-[11px] font-bold text-ink">{pending}</span>}
            </Tab>
            <Tab href="#/bonus" active={route.view === 'bonus'}>Zeichnungsbonus</Tab>
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            {user && <span className="hidden text-muted md:inline">{user.firstName} {user.lastName}</span>}
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-ink underline-offset-4 hover:underline"
              onClick={async () => {
                await logout()
                location.assign('/')
              }}
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 py-8">
        {error && <ErrorNote>{error}</ErrorNote>}
        {route.view === 'member' ? (
          <MemberPage key={route.id} id={route.id} onChange={reload} />
        ) : route.view === 'beschluesse' ? (
          <BeschlussInbox onChange={reload} />
        ) : route.view === 'neu' ? (
          <NewAntrag onCreated={reload} />
        ) : !members ? (
          !error && <p className="text-muted">Lade Mitglieder …</p>
        ) : route.view === 'bonus' ? (
          <BonusList members={members} />
        ) : (
          <MemberList members={members} antraege={route.view === 'antraege'} />
        )}
      </main>
    </div>
  )
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`whitespace-nowrap rounded-control px-3 py-2 no-underline ${active ? 'bg-navy-050 text-ink' : 'text-muted hover:text-ink'}`}
    >
      {children}
    </a>
  )
}

/* ------------------------------------------------------------------------ */

type Filter = 'alle' | 'zugelassen' | 'gekuendigt' | 'ausgeschieden' | 'abgelehnt'
const FILTERS: [Filter, string][] = [
  ['alle', 'Alle'],
  ['zugelassen', 'Zugelassen'],
  ['gekuendigt', 'Mit Kündigung'],
  ['ausgeschieden', 'Ausgeschieden'],
  ['abgelehnt', 'Abgelehnt'],
]

function MemberList({ members, antraege }: { members: MemberSummary[]; antraege: boolean }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('alle')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members
      .filter((m) => (antraege ? m.status === 'antrag' : m.status !== 'antrag'))
      .filter((m) => antraege || filter === 'alle' || (filter === 'gekuendigt' ? m.gekuendigt > 0 : m.status === filter))
      .filter((m) => !q || [m.name, m.firma, m.ort, m.email, m.empfehler, String(m.nr ?? '')].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => (a.nr ?? 1e9) - (b.nr ?? 1e9) || a.name.localeCompare(b.name, 'de'))
  }, [members, query, filter, antraege])

  const admitted = members.filter((m) => m.status === 'zugelassen')
  const kpis = [
    ['Mitglieder', num(admitted.length)],
    ['Anteile gehalten', num(admitted.reduce((s, m) => s + m.aktiv, 0))],
    ['Eingezahltes Kapital', eur(members.reduce((s, m) => s + m.kapital, 0))],
    ['Offene Anträge', num(members.filter((m) => m.status === 'antrag').length)],
  ]

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-display text-[40px] font-normal leading-tight">{antraege ? 'Anträge' : 'Mitglieder'}</h1>
        <Button onClick={() => go('#/neu')}>Neuer Antrag</Button>
      </div>

      {!antraege && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map(([label, value]) => (
            <div key={label} className="rounded-card border border-line-soft bg-white px-5 py-4">
              <div className="text-xs font-medium text-muted">{label}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen: Name, Firma, Ort, E-Mail, Nr., Empfehler"
          aria-label="Mitglieder durchsuchen"
          className="h-10 w-full max-w-[380px] rounded-control border border-line bg-white px-3 text-sm"
        />
        {!antraege && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`h-9 cursor-pointer rounded-control border px-3 text-sm ${filter === key ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <span className="ml-auto text-sm text-muted">{rows.length} Einträge</span>
      </div>

      <div className="overflow-x-auto rounded-card border border-line-soft bg-white">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs text-muted">
              <th className="w-14 px-4 py-3 font-medium">Nr.</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Ort</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">{antraege ? 'Empfehler' : 'Zulassung'}</th>
              <th className="px-4 py-3 text-right font-medium">Anteile</th>
              <th className="px-4 py-3 text-right font-medium">Kapital</th>
              <th className="px-4 py-3 font-medium">Portal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const k = m.status === 'zugelassen' ? kuendigungLabel(m) : null
              return (
                <tr key={m.id} className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-navy-050" onClick={() => go(`#/mitglied/${m.id}`)}>
                  <td className="px-4 py-3 tabular-nums text-muted">{m.nr ?? '–'}</td>
                  <td className="px-4 py-3">
                    <a href={`#/mitglied/${m.id}`} className="font-semibold no-underline" onClick={(e) => e.stopPropagation()}>
                      {m.name}
                    </a>
                    {m.firma && <div className="text-xs text-muted">{m.firma}</div>}
                  </td>
                  <td className="px-4 py-3">{m.ort || '–'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge className={STATUS[m.status].className}>{STATUS[m.status].label}</Badge>
                      {k && <Badge className="bg-coral-100 text-coral-600">{k}</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{antraege ? m.empfehler || '–' : date(m.zulassung_datum)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{num(m.anteile)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{m.kapital ? eur(m.kapital) : '–'}</td>
                  <td className="px-4 py-3 text-muted">{m.status === 'zugelassen' ? PORTAL[m.portal] : '–'}</td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  {antraege ? 'Keine offenen Anträge.' : 'Keine Treffer.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function BonusList({ members }: { members: MemberSummary[] }) {
  const rows = members.flatMap((m) => m.bonus.map((b, i) => ({ m, b, key: `${m.id}-${i}` })))
  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[40px] font-normal leading-tight">Zeichnungsbonus</h1>
      <p className="mb-6 mt-0 max-w-[640px] text-muted">Bonus der GIG pro gezeichnetem Anteil. Eintragen und ändern im jeweiligen Mitglied unter „Zeichnungsbonus“.</p>
      <div className="overflow-x-auto rounded-card border border-line-soft bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Mitglied</th>
              <th className="px-4 py-3 font-medium">Projekt</th>
              <th className="px-4 py-3 text-right font-medium">Anteile</th>
              <th className="px-4 py-3 text-right font-medium">Betrag</th>
              <th className="px-4 py-3 font-medium">Auszahlung</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ m, b, key }) => (
              <tr key={key} className="border-b border-line-soft last:border-0">
                <td className="px-4 py-3"><a href={`#/mitglied/${m.id}`} className="font-semibold no-underline">{m.name}</a></td>
                <td className="px-4 py-3">{b.projekt || '–'}</td>
                <td className="px-4 py-3 text-right tabular-nums">{num(b.anteile)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{eur(b.betrag)}</td>
                <td className="px-4 py-3 tabular-nums">{date(b.auszahlung)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">Noch kein Zeichnungsbonus eingetragen.</td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-line text-sm font-semibold">
                <td className="px-4 py-3" colSpan={2}>Summe</td>
                <td className="px-4 py-3 text-right tabular-nums">{num(rows.reduce((s, r) => s + (r.b.anteile ?? 0), 0))}</td>
                <td className="px-4 py-3 text-right tabular-nums">{eur(rows.reduce((s, r) => s + (r.b.betrag ?? 0), 0))}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  )
}

function NewAntrag({ onCreated }: { onCreated: () => void }) {
  return (
    <>
      <a href="#/antraege" className="text-sm no-underline">← Anträge</a>
      <h1 className="mb-6 mt-2 font-display text-[40px] font-normal leading-tight">Neuer Antrag</h1>
      <MemberForm
        mode="neu"
        onCancel={() => go('#/antraege')}
        onSave={async (record, secrets, document) => {
          const created = await api.create(record, secrets)
          if (document) await api.upload(created.id, document)
          onCreated()
          go(`#/mitglied/${created.id}`)
        }}
      />
    </>
  )
}
