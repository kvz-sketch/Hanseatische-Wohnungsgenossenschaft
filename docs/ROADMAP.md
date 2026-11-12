# Hansea Invest – Roadmap

Gesamtliste der Anforderungen (Stand 18.10.2026), mit aktuellem Status.
Status: **erledigt** · **teilweise** · **offen** · **jetzt machbar** (kann schon vor dem
Go-live vorbereitet werden).

Aktuelle Umgebung: WordPress auf Hostinger Premium (Rechenzentrum Frankfurt),
Theme `wordpress/hansea-invest`, Startseite in Elementor, Mitgliederbereich als
React-Seiten im Theme. Vorschau: https://beige-mallard-443486.hostingersite.com

---

## Phase 1 · Startseite

| # | Anforderung | Status | Stand / nächster Schritt |
|---|---|---|---|
| 1.1 | Neue hanseainvest.de, fertig mit Ihren Zahlen, Fotos und Rechtstexten | teilweise | Seite steht (Elementor, editierbar). Es fehlen echte Fotos, Logos der Tochterunternehmen, Impressum, Datenschutz, Risikohinweis, Satzung. |
| 1.2 | Rückruf-Funnel: Zeitfenster, SMS-Bestätigung, Anruf-Aufgabe für den Innendienst | teilweise | Rückrufformular mit Zeitfenstern im Mitgliederbereich; Anfragen landen unter „Anfragen“ + E-Mail. **Jetzt machbar:** Rückrufformular auf der Startseite, Anfragen als Aufgaben (Status offen/erledigt, Zuständige). SMS braucht einen SMS-Anbieter (Absender-Kennung, Vertrag). |
| 1.3 | Jede Einwilligung mit Textversion und Zeitstempel gespeichert | teilweise | Registrierung speichert nur den Zeitpunkt. **Jetzt machbar:** für jedes Formular Einwilligungstext, Version, Zeitpunkt und Seite mitspeichern. |
| 1.4 | „Anteil verfolgen“, Rendite-Rechner, Erklärfilm, Projektseiten, FAQ | teilweise | Alles im Mitgliederbereich vorhanden; FAQ auf der Startseite. **Jetzt machbar:** Rechner und Erklärfilm als Elementor-Bausteine für die Startseite. Eigene Projektseiten pro Haus fehlen noch. |
| 1.5 | Alle Formulierungen zu Rendite und Risiko mit Ihrer Rechtsberatung abgestimmt | offen | Aufgabe Rechtsberatung. Texte liegen auf der Startseite (Elementor) und in `src/data/`. |
| 1.6 | Tracking: Einwilligungsbanner, Analytics in Deutschland, Search Console, Google-Ads- und Meta-Conversions serverseitig | offen | Derzeit kein Tracking, daher noch kein Banner nötig. Search Console erst mit echter Domain. Banner + Analytics (z. B. Matomo auf dem eigenen Server) gemeinsam einführen. |
| 1.7 | Magazin auf gerlachgroup.de: 29 Artikel zusammengeführt, Weiterleitungen, ab Woche 4 zwei neue Artikel pro Woche | offen | Betrifft gerlachgroup.de (eigene Website auf dem Hostinger-Paket). |
| 1.8 | Hosting in Deutschland, Backups, Monitoring, Ausfall-Alarm | teilweise | Hosting Frankfurt: erledigt. Backup-Rhythmus des Premium-Pakets in hPanel prüfen. Monitoring/Ausfall-Alarm fehlt (externer Uptime-Dienst). |
| 1.9 | Tests auf Handy, Tablet und Desktop; Barrierefreiheit und Ladezeit | teilweise | Handy/Desktop laufend geprüft (keine Überläufe). **Jetzt machbar:** Ladezeit- und Barrierefreiheitsprüfung (Lighthouse) mit Korrekturen. |
| 1.10 | Go-live mit DNS-Umstellung, Weiterleitungen und einer Woche Live-Überwachung | offen | Domain liegt bei netcup. Danach Elementor „URL ersetzen“ und Weiterleitungen der alten Adressen. |

## Phase 2 · CRM und Portal

| # | Anforderung | Status | Stand / nächster Schritt |
|---|---|---|---|
| 2.1 | Bildschirmentwürfe für Cockpit und Portal, mit Ihnen abgestimmt | teilweise | Portal-Dashboard existiert als Entwurf (Beispieldaten). Cockpit offen. |
| 2.2 | Datenmodell für Personen, Projekte, Anteile, Ausschüttungen, Anrufe und Dokumente | offen | **Jetzt machbar:** Grundmodell (Projekte, Anteile, Ausschüttungen pro Mitglied) in WordPress, damit das Dashboard echte statt Beispieldaten zeigt. |
| 2.3 | Cockpit: Personen, Anrufe, Projekte, Geld, Websites, Traffic, Dashboard | offen | Setzt 2.2 voraus. |
| 2.4 | Rollen und Zwei-Faktor-Login für Ihr Team | offen | **Jetzt machbar:** Team-Rollen (z. B. Innendienst) und Zwei-Faktor-Login für alle Admin-Konten. |
| 2.5 | Alle Kontakte, Formulareinträge und Notizen aus beiden HubSpot-Konten übernommen; HubSpot abgeschaltet | offen | Braucht HubSpot-Exporte bzw. Zugang. |
| 2.6 | Alle Formulare aller heutigen Websites auf das neue System umgestellt | teilweise | Formulare der neuen Startseite und des Portals laufen bereits über das eigene System („Anfragen“). |
| 2.7 | Mitgliederportal: Login per Telefon oder E-Mail mit Einmalcode | teilweise | Login per E-Mail + Passwort, eigene gebrandete Passwort-Seiten. Keine Selbstregistrierung: das Team legt Konten an (Benutzer → Mitglied anlegen), das Mitglied bekommt eine Willkommens-Mail mit Zugangsdaten und Link zum Passwort-Festlegen. **Jetzt machbar:** E-Mail-Einmalcode; Telefon-Code braucht den SMS-Anbieter aus 1.2. |
| 2.8 | Portal: Projekte, Ausschüttungshistorie, Dokumente, Steuerbescheinigung, Rückruf-Button | teilweise | Projekte, Anteilsverfolgung, Rückruf-Button vorhanden (Beispieldaten). Dokumente/Steuerbescheinigung fehlen (setzt 2.2 voraus). |
| 2.9 | Willkommens-Mail und SMS von Ihrer Domain; Willkommensanruf-Aufgabe beim ersten Login | teilweise | Gebrandete Willkommens-Mail beim Anlegen eines Mitglieds (mit optionaler persönlicher Zeile, erneut sendbar). **Jetzt machbar:** Anruf-Aufgabe beim ersten Login. Versand „von Ihrer Domain“ braucht SMTP mit SPF/DKIM der echten Domain. |
| 2.10 | Beitrittsformular im Portal vorausgefüllt und unterschrieben (integrierte Signaturplattform, gehostet in Deutschland) | teilweise | DocuSign-Anbindung fertig vorbereitet (Embedded Signing, PDF-Ablage, Webhook, Einstellungsseite), siehe [DOCUSIGN.md](DOCUSIGN.md). Wartet auf die DocuSign-Zugangsdaten; Text der Erklärung und Signaturstufe (QES?) mit Rechtsberatung klären. |
| 2.11 | Assistent auf Ihren Daten: die sechs Fragetypen aus diesem Angebot und die Formulierungsprüfung | offen | Setzt 2.2 voraus. |
| 2.12 | Echte Anteile und Ausschüttungen geladen und geprüft; Portal in zwei Wellen geöffnet | offen | Setzt 2.2 voraus. Erste Mitglieder angelegt: Kai Raila, Katrin van Zyl. |
| 2.13 | Auftragsverarbeitungsvertrag, Verschlüsselung, tägliche Backups | teilweise | HTTPS aktiv. **Jetzt machbar:** AVV mit Hostinger abschließen (hPanel), Backup-Rhythmus prüfen. |

## Phase 3 · Vier Markenbereiche

| # | Anforderung | Status | Stand / nächster Schritt |
|---|---|---|---|
| 3.1 | diefamiliengenossenschaft.de: Wohnungsangebot, 19 FAQ-Antworten, Beispielrechnung, erstmals bei Google auffindbar | offen | |
| 3.2 | gerlachgroup.de/verkaufen: Eigentümer-Angebot, vier Case Studies, funktionierendes Anfrageformular | offen | Anfrage-Endpunkt aus 1.2 wiederverwendbar. |
| 3.3 | gerlachgroup.de: Unternehmen, Team, Presse, Karriere, Heimat des Magazins | offen | |
| 3.4 | gerlachgroup.de/kapitalpartner: zwei Anfragewege, Anbindung an das Portal | offen | |
| 3.5 | Jede Website im gemeinsamen Design mit eigenem Angebot, FAQ und Anmeldung | teilweise | Gemeinsames Design (Navy/Gold, Cormorant/Inter) als Theme-Tokens und Elementor-Kit vorhanden. |
| 3.6 | Formulierungen jeder Website mit Ihrer Rechtsberatung abgestimmt | offen | |
| 3.7 | Tracking und Search Console für alle Domains | offen | Nach 1.6. |
| 3.8 | Weiterleitungen von jeder alten Adresse, umgeschaltet am Tag der Freigabe | offen | |
| 3.9 | Links zwischen allen Websites, überall dieselbe Anmeldung | offen | Gemeinsames Konto über Domains hinweg ist eine Architekturentscheidung (zentrales Login). |
| 3.10 | Bereich Websites im Cockpit: Texte, Fotos, Zahlen und Rechtstexte zentral gepflegt | offen | Setzt 2.3 voraus. |
