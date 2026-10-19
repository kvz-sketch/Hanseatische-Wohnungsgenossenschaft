# DocuSign: Beitrittserklärung digital unterschreiben

Mitglieder füllen im Mitgliederbereich (Abschnitt „Beitritt“) ihre Beitrittserklärung
aus und unterschreiben sie bei DocuSign. Danach kommen sie automatisch zurück; das
unterschriebene PDF liegt im Portal und in wp-admin unter **Beitrittserklärungen**.

Solange DocuSign nicht eingerichtet ist, nimmt das Portal die Angaben trotzdem an
(Status „Eingegangen“) und meldet sie per E-Mail an das Team.

## Ablauf

1. Das Mitglied ergänzt Geburtsdatum, Anschrift, Telefon und die Anzahl der Anteile
   (je 10.000 €, mindestens ein Anteil). Name und E-Mail kommen aus dem Mitgliederkonto.
2. Die Website erzeugt die Beitrittserklärung mit diesen Daten
   (`wordpress/hansea-invest/inc/beitritt-dokument.php`), legt einen DocuSign-Umschlag an
   und leitet das Mitglied zur Unterschrift weiter (Embedded Signing).
3. Nach der Unterschrift fragt die Website den Status bei DocuSign ab, lädt das
   unterschriebene PDF (mit Abschlusszertifikat) herunter und speichert es in einem
   nicht öffentlichen Ordner. Zusätzlich meldet DocuSign den Abschluss per Webhook.
4. Das Team bekommt eine E-Mail, das Mitglied eine gebrandete Bestätigung.

Einwilligungstext und -version werden mit jeder Erklärung gespeichert.

## Einrichtung (einmalig)

### 1. In DocuSign (zuerst das Entwicklerkonto, „Demo“)

Unter **Settings → Apps and Keys**:

1. **Add App and Integration Key**, Name z. B. „Hansea Website“.
   Den **Integration Key** notieren.
2. Bei *Authentication*: **Generate RSA**. Den **Private Key** sofort kopieren,
   DocuSign zeigt ihn nur einmal.
3. Bei *Additional settings → Redirect URIs* die Adresse eintragen, die in wp-admin
   unter Einstellungen → DocuSign steht (…/wp-admin/options-general.php?page=hansea-docusign).
4. Oben auf der Seite **User ID** und **API Account ID** notieren.

### 2. In WordPress

**Einstellungen → DocuSign**:

1. Umgebung **Demo**, Integration Key, User ID, API Account ID und Private Key
   eintragen und speichern. Der Schlüssel wird danach nicht mehr angezeigt.
2. **1. Zustimmung erteilen** klicken und mit dem DocuSign-Login des API-Benutzers
   bestätigen (einmalig).
3. **2. Verbindung testen**. Erwartet: „Verbindung steht: Konto …“.

Alternativ können die Werte als Konstanten in `wp-config.php` stehen
(`HANSEA_DOCUSIGN_INTEGRATION_KEY`, `HANSEA_DOCUSIGN_USER_ID`,
`HANSEA_DOCUSIGN_ACCOUNT_ID`, `HANSEA_DOCUSIGN_PRIVATE_KEY`,
`HANSEA_DOCUSIGN_ENVIRONMENT`, `HANSEA_DOCUSIGN_HMAC_SECRET`,
`HANSEA_DOCUSIGN_SIGNATURE_PROVIDER`); sie haben Vorrang.

Zugangsdaten gehören nicht ins Repository und nicht in Chats oder E-Mails.

### 3. Testen

Mit einem Mitgliedskonto anmelden → Mitgliederbereich → „Beitritt“ → ausfüllen →
unterschreiben. In der Demo-Umgebung trägt das Dokument den Vermerk
„ENTWURF / TESTUMGEBUNG – nicht rechtsgültig“.

### 4. Go-live (Produktion)

1. DocuSign verlangt für die Freigabe erfolgreiche API-Aufrufe in der Demo-Umgebung
   und danach **Request Go-Live** auf der Apps-and-Keys-Seite.
2. Nach der Freigabe im Produktivkonto unter Apps and Keys die Werte des
   Produktivkontos (User ID, API Account ID) übernehmen und einen RSA-Schlüssel für
   die Produktion erzeugen.
3. In WordPress Umgebung **Produktion** wählen, Werte eintragen, Zustimmung erneut
   erteilen, Verbindung testen.
4. Optional: unter Settings → Connect einen HMAC-Schlüssel anlegen und in WordPress
   eintragen; dann nimmt die Website nur signierte Statusmeldungen an.

## Vor dem Go-live zu klären

- **Text der Beitrittserklärung**: Entwurf in `inc/beitritt-dokument.php`, mit der
  Rechtsberatung und der Satzung abstimmen (Nachschusspflicht, Kündigungsfristen,
  Eintrittsgeld).
- **Signaturstufe**: § 15 GenG verlangt eine schriftliche Beitrittserklärung. Ob
  dafür eine qualifizierte elektronische Signatur (QES) nötig ist, entscheidet die
  Rechtsberatung. QES schaltet DocuSign gesondert frei; den Anbieternamen dann unter
  „Signaturanbieter (QES)“ eintragen.
- **Satzung, Risikohinweis, Datenschutzhinweise** verlinken (derzeit Platzhalter).
- **AVV mit DocuSign** und Hinweis in den Datenschutzhinweisen.

## Technik

| Teil | Datei |
|---|---|
| DocuSign-Verbindung (JWT), Einstellungsseite | `wordpress/hansea-invest/inc/docusign.php` |
| Erklärungen, REST-Endpunkte, Webhook, PDF-Ablage, wp-admin | `wordpress/hansea-invest/inc/beitritt.php` |
| Dokumentvorlage | `wordpress/hansea-invest/inc/beitritt-dokument.php` |
| Portal-Abschnitt | `src/components/Beitritt.tsx`, `src/data/beitritt.ts` |

REST (nur angemeldete Mitglieder): `POST /wp-json/hansea/v1/beitritt/start`, `/resume`,
`/sync`, `GET /beitritt/document`. Webhook: `POST /wp-json/hansea/v1/docusign/webhook`
(löst nur eine Statusabfrage bei DocuSign aus; der Inhalt der Meldung wird nicht
übernommen).
