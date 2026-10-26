import { Link } from "../router";
import { RoofIcon } from "../components/brandbook/RoofIcon";

// Bildmaterial: one card per shared folder. Each folder lives in Google Drive
// and opens there in a new tab, where it can be browsed and downloaded.

type Folder = { id: string; title: string; description: string; href: string };

const folders: Folder[] = [
  {
    id: "objekte",
    title: "Objekte",
    description: "Objektbilder der Immobilien zum Ansehen und Herunterladen.",
    href: "https://drive.google.com/drive/folders/1qvCSCU0i2A87x0sZuy7Lmp3xVieODbPz?usp=sharing",
  },
];

function IconFolder({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4.2l2 2.2H19A1.5 1.5 0 0 1 20.5 9.2v8.3A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5V7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FolderCard({ folder }: { folder: Folder }) {
  return (
    <a href={folder.href} target="_blank" rel="noopener noreferrer" className="block h-full">
      <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-navy/10 bg-white p-6 shadow-[0_2px_10px_rgba(20,26,70,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(20,26,70,0.14)]">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-navy text-gold">
            <IconFolder className="h-5 w-5" />
          </div>
          <span className="rounded-[2px] bg-gold/15 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-gold-deep">
            Google Drive
          </span>
        </div>
        <div className="mt-8">
          <h3 className="subheading text-[18px] text-navy">{folder.title}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{folder.description}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-koralle">
            Ordner öffnen
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              ↗
            </span>
          </span>
        </div>
        <div className="absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
      </div>
    </a>
  );
}

export function Bildmaterial() {
  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-navy/8 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8 lg:px-11">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <RoofIcon color="#141A46" className="h-6 w-6" />
            <span className="subheading text-[14px] leading-none text-navy">Bildmaterial</span>
          </Link>
          <Link to="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-koralle">
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="bg-navy px-5 py-12 sm:px-8 lg:px-11">
        <div className="mx-auto max-w-[1200px]">
          <span className="subheading text-[10.5px] uppercase tracking-[0.16em] text-gold">Gerlach Immobilien Gruppe · Intern</span>
          <h1 className="font-serif-display mt-3 text-[30px] text-white sm:text-[38px]">Bildmaterial</h1>
          <p className="mt-2 max-w-[560px] text-[13.5px] leading-relaxed text-fog">
            Freigegebene Fotografie, Objektbilder und Grafikelemente für Marketing und Vertrieb. Jeder Ordner öffnet sich in Google Drive zum Herunterladen.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-11">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
