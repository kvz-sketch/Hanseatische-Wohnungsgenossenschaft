#!/usr/bin/env python3
"""Generate the Elementor data for the Hansea Invest landing page.

Writes wordpress/hansea-invest/elementor/landing.json, which the theme's
one-time importer (wordpress/mu-plugins/hansea-elementor-landing.php) turns
into an editable Elementor page. Placeholders the importer resolves:
  {{THEME}}            theme URL of wordpress/hansea-invest/elementor
  {{IMG:file}}         URL of an image imported into the media library
  {{IMGID:file}}       its attachment ID

Copy follows the Hansea Invest wireframe brief (as in src/data/landing.ts).
After the import, the page is edited in Elementor; this script only seeds it.
"""

import json
import secrets
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "wordpress/hansea-invest/elementor/landing.json"

# Brand tokens (Hansea Invest design system / GIG Markenbuch)
NAVY = "#141A46"
NAVY_TEXT = "#2A2F52"
GOLD = "#DDB851"
GOLD_600 = "#C6A248"
GOLD_700 = "#A9863A"
GOLD_400 = "#E6C978"
GREY_BG = "#F5F5F5"
LINE = "#E7E8EC"
MUTED = "#7A7D89"
ON_NAVY = "#E3E4EE"
ON_NAVY_MUTED = "#BFC2D6"
CREAM = "#FBF6E7"
CREAM_LINE = "#EEDCA2"
WHITE = "#FFFFFF"

DISPLAY = "Cormorant Garamond"
UI = "Inter"


# ---------------------------------------------------------------- primitives

def uid():
    return secrets.token_hex(4)[:7]


def px(v):
    return {"unit": "px", "size": v, "sizes": []}


def box(top, right=None, bottom=None, left=None, unit="px"):
    right = top if right is None else right
    bottom = top if bottom is None else bottom
    left = right if left is None else left
    return {"unit": unit, "top": str(top), "right": str(right), "bottom": str(bottom), "left": str(left),
            "isLinked": top == right == bottom == left}


def gap(v):
    return {"unit": "px", "size": v, "column": str(v), "row": str(v), "isLinked": True}


def container(children, *, row=False, inner=True, boxed=False, width=None, width_mobile=100, pad=None,
              pad_mobile=None, gap_px=24, bg=None, gradient=False, radius=None, border=None, align=None,
              justify=None, wrap=False, reverse_mobile=False, mobile_row=False, anchor=None, css=None, max_width=None):
    s = {
        "flex_direction": "row" if row else "column",
        "flex_gap": gap(gap_px),
        "padding": box(*(pad if isinstance(pad, tuple) else (pad if pad is not None else 0,))),
    }
    if row:
        s["flex_direction_mobile"] = "row" if mobile_row else ("column-reverse" if reverse_mobile else "column")
    if wrap:
        s["flex_wrap"] = "wrap"
    if pad_mobile is not None:
        s["padding_mobile"] = box(*(pad_mobile if isinstance(pad_mobile, tuple) else (pad_mobile,)))
    if boxed:
        s["content_width"] = "boxed"
        s["boxed_width"] = px(max_width or 1180)
    else:
        s["content_width"] = "full"
    if width is not None:
        s["width"] = {"unit": "%", "size": width, "sizes": []}
        s["width_mobile"] = {"unit": "%", "size": width_mobile, "sizes": []}
    elif max_width and not boxed:
        s["width"] = px(max_width)
        s["width_mobile"] = {"unit": "%", "size": 100, "sizes": []}
    if align:
        s["flex_align_items"] = align
    if justify:
        s["flex_justify_content"] = justify
    if gradient:
        s.update({
            "background_background": "gradient",
            "background_color": "#1B2354",
            "background_color_b": "#0E1338",
            "background_gradient_type": "linear",
            "background_gradient_angle": {"unit": "deg", "size": 158, "sizes": []},
        })
    elif bg:
        s.update({"background_background": "classic", "background_color": bg})
    if radius:
        s["border_radius"] = box(radius)
    if border:
        s.update({"border_border": "solid", "border_width": box(1), "border_color": border})
    if anchor:
        s["_element_id"] = anchor
    classes = [c for c in [css, None if inner else "e-no-lazyload"] if c]
    if classes:
        s["css_classes"] = " ".join(classes)
    return {"id": uid(), "elType": "container", "isInner": inner, "settings": s, "elements": children}


def section(children, **kw):
    """Full-width band with a boxed 1180px content area."""
    kw.setdefault("pad", (72, 20))
    kw.setdefault("pad_mobile", (56, 16))
    return container(children, inner=False, boxed=True, **kw)


def widget(kind, settings, css=None, hide_mobile=False):
    if css:
        settings["_css_classes"] = css
    if hide_mobile:
        settings["hide_mobile"] = "hidden-mobile"
        settings["hide_tablet"] = "hidden-tablet"
    return {"id": uid(), "elType": "widget", "widgetType": kind, "settings": settings, "elements": []}


def type_(family, size, weight="400", line=None, mobile=None, spacing=None, transform=None):
    t = {
        "typography_typography": "custom",
        "typography_font_family": family,
        "typography_font_size": px(size),
        "typography_font_weight": str(weight),
    }
    if line:
        t["typography_line_height"] = {"unit": "em", "size": line, "sizes": []}
    if mobile:
        t["typography_font_size_mobile"] = px(mobile)
    if spacing is not None:
        t["typography_letter_spacing"] = {"unit": "em", "size": spacing, "sizes": []}
    if transform:
        t["typography_text_transform"] = transform
    return t


# ---------------------------------------------------------------- widgets

def heading(text, tag="h2", *, size=44, mobile=32, color=NAVY, weight="400", align=None, family=DISPLAY, line=1.15):
    s = {"title": text, "header_size": tag, "title_color": color, **type_(family, size, weight, line, mobile)}
    if align:
        s["align"] = align
    return widget("heading", s)


def eyebrow(text, on_dark=False):
    return widget("heading", {
        "title": text, "header_size": "p", "title_color": GOLD_400 if on_dark else GOLD_700,
        **type_(UI, 13, "600", 1.4, spacing=0.18, transform="uppercase"),
    })


def text(html, *, color=NAVY_TEXT, size=17, line=1.6, align=None, weight="400"):
    s = {"editor": html, "text_color": color, **type_(UI, size, weight, line, mobile=min(size, 16))}
    if align:
        s["align"] = align
    return widget("text-editor", s)


def button(label, url, *, variant="gold", align=None, size=15, hide_mobile=False):
    colors = {
        "gold": (GOLD, NAVY, GOLD_600, NAVY),
        "ghost": ("transparent", NAVY_TEXT, "transparent", GOLD_600),
    }[variant]
    s = {
        "text": label,
        "link": {"url": url, "is_external": "", "nofollow": "", "custom_attributes": ""},
        "background_color": colors[0], "button_text_color": colors[1],
        "button_background_hover_color": colors[2], "hover_color": colors[3],
        "border_radius": box(4),
        "text_padding": box(14, 24) if variant == "gold" else box(8, 4),
        **type_(UI, size, "600", 1, spacing=0.01),
    }
    if align:
        s["align"] = align
        s["align_mobile"] = align if align != "right" else "left"
    return widget("button", s, hide_mobile=hide_mobile)


def image(name, alt, *, radius=8, url=None, link=None, width=None):
    s = {
        "image": {"url": url or "{{IMG:%s}}" % name, "id": "" if url else "{{IMGID:%s}}" % name,
                  "alt": alt, "source": "library", "size": ""},
        "image_size": "full",
        "image_border_radius": box(radius),
    }
    if width:
        s["width"] = px(width)
    if link:
        s["link_to"] = "custom"
        s["link"] = {"url": link, "is_external": "", "nofollow": ""}
    return widget("image", s)


def placeholder(label, ratio="4/3"):
    """Striped stand-in image for a photo or logo that isn't supplied yet.

    The ratio sits on the widget box (class hs-ph-WxH) and the image fills it:
    ratio boxes or %-wide images *inside* a widget collapse to zero height in
    Elementor's mobile flex columns.
    """
    from html import escape
    from urllib.parse import quote
    w, h = (int(x) for x in ratio.split("/"))
    vw, vh = 400, round(400 * h / w)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" preserveAspectRatio="xMidYMid slice">'
        '<defs><pattern id="s" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
        '<rect width="16" height="16" fill="#E7E8EC"/><rect width="8" height="16" fill="#D2D4DA"/></pattern></defs>'
        f'<rect width="{vw}" height="{vh}" fill="url(#s)"/>'
        f'<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace,monospace" '
        f'font-size="13" fill="#7A7D89">{escape(label, quote=False)}</text></svg>'
    )
    src = "data:image/svg+xml," + quote(svg, safe="")
    return widget("html", {
        "html": f'<img class="hs-placeholder" src="{src}" alt="Platzhalter: {escape(label)}" width="{vw}" height="{vh}">'
    }, css=f"hs-ph hs-ph-{w}x{h}")


def icon_list(items, *, inline=False, color=NAVY, icon=None, icon_color=GOLD_600, size=15, weight="500", gap_px=12):
    s = {
        "icon_list": [{
            "_id": uid(), "text": label,
            "selected_icon": {"value": icon, "library": "fa-solid"} if icon else {"value": "", "library": ""},
            "link": {"url": url or "", "is_external": "", "nofollow": ""},
        } for label, url in items],
        "text_color": color, "text_color_hover": GOLD_600, "icon_color": icon_color,
        "space_between": px(gap_px), "icon_size": px(14),
        "icon_typography_typography": "custom", "icon_typography_font_family": UI,
        "icon_typography_font_size": px(size), "icon_typography_font_weight": weight,
    }
    if inline:
        s["view"] = "inline"
    return widget("icon-list", s)


def spacer(h):
    return widget("spacer", {"space": px(h)})


# ---------------------------------------------------------------- content

NAV = [("Über uns", "#ueber-uns"), ("So funktioniert's", "#so-funktionierts"), ("Case Studies", "#case-studies"),
       ("Team", "#team"), ("FAQ", "#faq"), ("Kontakt", "#kontakt")]

STEPS = [
    ("Ihr Kapital fließt in mehrere, reale Immobilienprojekte gleichzeitig",
     "Ihr gezeichnetes Kapital wird gezielt in ausgewählte Immobilienprojekte investiert. Der Fokus liegt auf kosteneffizientem Ankauf, Modernisierung, Aufteilung in Einheiten und gewinnbringendem Verkauf. Diese strukturierte Wertschöpfungskette bildet die wirtschaftliche Grundlage für Ihre Rendite innerhalb der Genossenschaft und schafft nachhaltige Perspektiven für Anleger."),
    ("Es wird als Eigenkapital eingesetzt",
     "Das eingebrachte Kapital wird als Eigenkapital in die jeweiligen Projektstrukturen eingebracht und stärkt die wirtschaftliche Substanz der Vorhaben. Dadurch entsteht eine belastbare Basis für Finanzierungsgespräche, Investitionsentscheidungen und Umsetzungsschritte entlang der gesamten Wertschöpfungskette, von Ankauf über Modernisierung bis hin zum Verkauf."),
    ("Eigenkapital ermöglicht stabile Finanzierungsstrukturen",
     "Eine solide Eigenkapitalausstattung ermöglicht ausgewogene Finanzierungsstrukturen mit klar kalkulierten Risikoabschlägen und ausreichenden Liquiditätsreserven. Durch starke Liquidität können Opportunitäten schnell genutzt und Objekte unter Marktniveau erworben werden, sodass selbst bei Marktveränderungen ausreichende Puffer und Rückzahlungsfähigkeit gewährleistet bleiben."),
    ("Erträge entstehen durch Verkauf und laufende Weitervermietung",
     "Die Rendite entsteht aus der erfolgreichen Umsetzung der Projekte, insbesondere durch Modernisierung, Aufteilung und anschließenden gewinnbringenden Verkauf der Immobilien. Ergänzend sichern effiziente Prozesse und klare Laufzeiten ein stimmiges Matching zwischen Projektzeitraum und Kündigungsfrist, wodurch planbare Rückzahlungen und wirtschaftliche Stabilität unterstützt werden."),
]

CASES = [
    ("Hamburg Eilbek",
     "Wir haben einen Altbau aus dem Jahr 1892 mit sechs Wohneinheiten und einer Gewerbeeinheit erworben und umfassend optimiert. Dazu gehörten die Sanierung und Dämmung der Fassade sowie die Modernisierung der Gemeinschaftsflächen.",
     "Die Bestandsmieten und Grundrisse wurden optimiert, während die beiden freien und später frei werdenden Wohnungen nach der Sanierung als möblierte WGs vermietet wurden. Die ehemalige Gastronomiefläche im Souterrain wurde in zwei Ferienwohnungen umgewandelt. Nach Abschluss der Maßnahmen erfolgte der Verkauf an Eigennutzer und Kapitalanleger. Die Projektlaufzeit betrug 20 Monate."),
    ("Oldenburg",
     "Wir haben zwei Vierparteienhäuser mit großzügigen Maisonette-Wohnungen erworben, die sich ideal für Studenten-WGs eignen. Die Gemeinschaftsflächen und der Außenbereich wurden überarbeitet, während zwei freie Wohnungen saniert und mit einem WG-Konzept sowie Mietgarantie verkauft wurden.",
     "Durch die gezielte Berücksichtigung der Mieterwünsche und Renovierungsmaßnahmen konnte eine einvernehmliche Mietanpassung von über 30 % erreicht werden. Da die Mieter aufgrund der familiären Situation und der attraktiven Lage bleiben wollten, entstanden wertstabile und gut verkäufliche Anlagewohnungen. Die Projektlaufzeit betrug 9 Monate."),
]

TEAM = [
    ("Stephan Gerlach", "Vorstandsvorsitzender", "stephan-gerlach-portraet.jpg",
     "Gründer der Gerlach Immobilien Gruppe und Experte für nachhaltige Kapitalanlage-Immobilien. Mit einem ganzheitlichen Ansatz begleitet er Anleger von der Objektwahl über die Finanzierung bis zur langfristigen Verwaltung."),
    ("Vadim Kogan", "Aufsichtsrat", None,
     "Experte für das deutsche Gesundheitswesen und die Digitalisierung medizinischer Prozesse. Als Vorstand der ArztData AG und Gründer des ArztData Clubs unterstützt er Ärzte dabei, ihre Praxen wirtschaftlich erfolgreicher und effizienter zu gestalten."),
    ("Christine Pistorius", "Vorstand", None,
     "Erfahrene Immobilieninvestorin und Expertin für Sprungauflassung im Immobilienhandel. Als Vorstandsmitglied der 100.PlusCommunity und gefragte Sprecherin unterstreicht sie die Bedeutung von Immobilien als sichere Kapitalanlage."),
]

FAQS = [
    ("Was bedeutet „investierendes Mitglied“ konkret?", "Sie werden Mitglied, nicht Kunde.",
     "Ihr Geld bleibt im Unternehmen und fließt direkt in eigene Projekte. Die Wertschöpfung entsteht durch Arbeit an Häusern, nicht durch Finanzprodukte. Genossenschaften unterliegen dem Genossenschaftsgesetz und der Pflichtprüfung durch einen Prüfungsverband – ein Modell, das es in Deutschland seit über 150 Jahren gibt. Einmal im Jahr laden wir alle Mitglieder ein: Vorstand und Projektleiter berichten, Sie sehen die Häuser und lernen andere Mitglieder kennen."),
    ("Wie wird mein Kapital eingesetzt?", "In konkreten Häusern – mit Adresse und Fotos.",
     "Bestandshäuser günstig kaufen, sanieren, in einzelne Wohnungen aufteilen und verkaufen: Dieses Geschäft war bisher Profis mit viel Kapital vorbehalten. Die Genossenschaft bündelt das Geld vieler Mitglieder – so sind Sie schon ab 10.000 € dabei. Jeder Anteil wird einem Projekt zugeordnet. Im Mitgliederportal sehen Sie Phase, Baufortschritt und jede Ausschüttung."),
    ("Welche Rendite kann ich erwarten?", "Ziel sind 7 % im Jahr, ausgezahlt in vier Raten – nicht garantiert.",
     "Bei 25.000 € sind das als Ziel 437,50 € pro Quartal, brutto. Kein Zinseszins, vor Kapitalertragsteuer. Die Ausschüttung hängt vom wirtschaftlichen Erfolg der Genossenschaft ab."),
    ("Welche Laufzeiten und Kündigungsfristen gelten?", "Nach 12 Monaten entscheiden Sie.",
     "Weiterlaufen lassen, aufstocken oder mit neun Monaten Frist kündigen. Keine Nachschusspflicht."),
    ("Welche Risiken bestehen bei einer Beteiligung?",
     "Reale Häuser, geprüfte Genossenschaft – und trotzdem eine unternehmerische Beteiligung.",
     "Ihre Investition fließt in reale Wohnimmobilien in Deutschland. Die Hanseatische Invest eG ist eine eingetragene Genossenschaft und wird durch den DIVK Prüfungsverband regelmäßig geprüft. Bitte beachten Sie jedoch, dass es sich um eine unternehmerische Beteiligung handelt: Verlust bis zum Totalverlust ist möglich, und es besteht keine gesetzliche Einlagensicherung."),
]

LEGAL = ("Genossenschaftsanteile sind eine unternehmerische Beteiligung. Die Zielrendite von 7 % p.a. ist nicht garantiert und hängt vom wirtschaftlichen Erfolg der Genossenschaft ab. Kein Anspruch auf Ausschüttung oder Rückzahlung; Verlust bis zum Totalverlust möglich. Keine gesetzliche Einlagensicherung. Keine Anlageberatung. Bitte lesen Sie vor einer Entscheidung Risikohinweis und Satzung.")


# ---------------------------------------------------------------- sections

def header():
    return container([
        container([
            image(None, "Hansea Invest eG", radius=0, url="{{THEME}}/images/logo-navy.svg", link="/", width=78),
            container([icon_list(NAV, inline=True, size=15, gap_px=28)], css="hs-nav"),
            container([
                button("Mitglieder-Login", "/login/"),
            ], row=True, mobile_row=True, align="center", gap_px=16, css="hs-header-actions"),
        ], row=True, mobile_row=True, boxed=True, align="center", justify="space-between", pad=(12, 20), pad_mobile=(10, 16), gap_px=24),
    ], inner=False, bg=WHITE, css="hs-header", border=None)


def hero():
    return section([
        container([
            container([
                heading("Investieren in reale Wohnimmobilien", "h1", size=62, mobile=40, color=WHITE, weight="300", line=1.05),
                heading("Unternehmerisch. Transparent. Nachvollziehbar.", "p", size=20, mobile=18, color=ON_NAVY,
                        weight="600", family=UI, line=1.4),
                spacer(8),
                button("Jetzt informieren", "#kontakt", size=16),
            ], width=48, gap_px=16),
            container([image("projekt-hamburg-borgfelder.jpg", "Saniertes Mehrfamilienhaus in der Borgfelder Straße, Hamburg")],
                      width=48),
        ], row=True, align="center", justify="space-between", gap_px=48),
    ], gradient=True, pad=(96, 20), pad_mobile=(56, 16))


def about():
    stats = [("45", "Mitarbeiter"), ("3", "Standorte"), ("2018", "Gegründet"), ("300", "Verkaufte Wohnungen")]
    return section([
        container([
            container([
                eyebrow("Über uns"),
                heading("Die Hanseatische Invest eG"),
                text("<p>Die Hanseatische Invest eG verwendet Ihr investiertes Kapital, um Immobilienprojekte effizient "
                     "umzusetzen und nachhaltige Mehrwerte zu schaffen – für unsere Mitglieder und den deutschen "
                     "Immobilienmarkt. Als Genossenschaft stehen wir für Transparenz, Verantwortung und eine "
                     "partnerschaftliche Beteiligung an Immobilieninvestments. Werden Sie Teil der Hanseatischen Invest "
                     "eG und profitieren Sie von einer attraktiven Rendite von bis zu 7&nbsp;% p.a. – jetzt informieren "
                     "und investieren.</p>"),
            ], width=66, gap_px=12),
            container([button("Kontakt aufnehmen", "#kontakt", align="right")], width=30, justify="flex-end"),
        ], row=True, align="flex-end", justify="space-between", gap_px=32),
        spacer(24),
        container([
            container([
                heading(v, "p", size=44, mobile=36, align="center", line=1),
                text(f"<p>{label}</p>", color=MUTED, size=14, align="center"),
            ], width=23.5, width_mobile=47, pad=(24, 16), border=LINE, radius=8, gap_px=6)
            for v, label in stats
        ], row=True, wrap=True, mobile_row=True, justify="space-between", gap_px=12, css="hs-row-wrap"),
    ], anchor="ueber-uns")


def at_a_glance():
    bullets = ["Genossenschaftliche Beteiligung", "Investition in reale Wohnimmobilien", "Teilhabe mit Chancen & Risiken",
               "Mindestlaufzeit: 12 Monate", "Verzinsung bis 7 % p.a.*"]
    return section([
        container([
            container([
                eyebrow("Auf einen Blick", on_dark=True),
                heading("Kurz zusammengefasst: So funktioniert Ihre Beteiligung bei der Hanseatischen Invest eG.", "h3",
                        size=28, mobile=24, color=WHITE, line=1.25),
                text("<p>Die Hanseatische Invest eG bietet eine genossenschaftliche Beteiligung statt einer klassischen "
                     "Geldanlage: Sie investieren gemeinsam mit anderen Mitgliedern in reale Wohnimmobilien und nehmen "
                     "unternehmerisch an Chancen und Risiken teil. Die Mindestlaufzeit beträgt 12 Monate, mit einer "
                     "angestrebten Verzinsung von 7&nbsp;% p.a.*</p>", color=ON_NAVY, size=16),
            ], width=52, gap_px=14),
            container([
                icon_list([(b, None) for b in bullets], color=WHITE, icon="fas fa-check", icon_color=GOLD_400, size=16,
                          weight="600", gap_px=14),
                text("<p>* Die Verzinsung ist aus rechtlichen Gründen nicht garantiert und abhängig vom wirtschaftlichen "
                     "Erfolg der Genossenschaft.</p>", color=ON_NAVY_MUTED, size=12, line=1.5),
            ], width=42, gap_px=16),
        ], row=True, justify="space-between", gradient=True, radius=8, pad=(48,), pad_mobile=(32, 20), gap_px=32),
    ], pad=(0, 20, 72, 20), pad_mobile=(0, 16, 56, 16))


def book():
    return section([
        container([
            container([placeholder("Buchcover „Dein Weg zur finanziellen Freiheit“", "2/3")], width=22, width_mobile=60),
            container([
                eyebrow("Neues Buch"),
                heading("Dein Weg zur finanziellen Freiheit"),
                text("<p>Das neue Buch von Stephan Gerlach, des Spiegel-Bestsellerautors und CEO der Gerlach Immobilien "
                     "Gruppe, ist Ihr Leitfaden für Immobilien als Kapitalanlage. Nutzen Sie sein Expertenwissen, um "
                     "fundierte Entscheidungen zu treffen und gezielt für Ihre finanzielle Freiheit und eine sichere "
                     "Zukunft vorzusorgen.</p>"),
                button("Zum Buchkauf", "#"),
            ], width=70, gap_px=14),
        ], row=True, align="center", justify="space-between", bg=CREAM, border=CREAM_LINE, radius=8, pad=(40, 48),
            pad_mobile=(28, 20), gap_px=32),
    ], pad=(0, 20, 72, 20), pad_mobile=(0, 16, 56, 16))


def capital_steps():
    rows = []
    for i, (title, body) in enumerate(STEPS):
        txt = container([
            heading(f"{i + 1:02d}", "p", size=56, mobile=44, color=GOLD_600, line=1),
            heading(title, "h3", size=28, mobile=24, line=1.25),
            text(f"<p>{body}</p>", size=16),
        ], width=48, gap_px=12)
        img = container([placeholder(f"Bild Schritt {i + 1}")], width=48)
        rows.append(container([img, txt] if i % 2 else [txt, img], row=True, align="center", justify="space-between",
                              gap_px=48, reverse_mobile=bool(i % 2)))
    return section([
        eyebrow("So funktioniert's"),
        text("<p>In vier Schritten: Ihr Kapital fließt in echte Häuser, stärkt dort als Eigenkapital die Finanzierung, "
             "und aus Sanierung und Verkauf entstehen Ihre Erträge.</p>"),
        heading("Wie wir Ihr Kapital einsetzen:"),
        spacer(24),
        container(rows, gap_px=64),
        spacer(16),
        text("<p>*Die Wertschöpfung entsteht durch operative Immobilienarbeit, nicht durch Finanzprodukte.</p>",
             color=MUTED, size=13),
    ], bg=GREY_BG, anchor="so-funktionierts", gap_px=12)


def trust():
    seals = [("siegel-top-experte-2026.png", "Siegel „Top-Experte 2026“, ERFOLG Magazin", "TOP-Experten-Siegel 2026"),
             ("siegel-top-100-coaches-berater-2025.png", "Siegel „Top 100 Coaches & Berater 2025“, ERFOLG Magazin",
              "EM Top 100 Coaches + Berater"),
             ("siegel-top-100-unternehmer-2024.png", "Siegel „Top 100 Unternehmer 2024“, ERFOLG Magazin",
              "Top 100 Unternehmer-Siegel")]
    return section([
        heading("Mehr Rendite, weniger Risiko. Kein Aufwand", color=WHITE, align="center"),
        spacer(16),
        container([
            container([
                image(f, alt, radius=0, width=96),
                text(f"<p>{label}</p>", color=ON_NAVY, size=15, align="center", weight="600"),
            ], width=31, align="center", gap_px=12)
            for f, alt, label in seals
        ], row=True, justify="space-between", gap_px=24),
    ], gradient=True, pad=(64, 20), gap_px=8)


def case_studies():
    cards = []
    for title, intro, more in CASES:
        cards.append(container([
            placeholder(f"Projektfoto {title}", "16/10"),
            container([
                heading(title, "h3", size=28, mobile=24),
                text(f"<p>{intro}</p>", size=16),
                widget("toggle", {
                    "tabs": [{"_id": uid(), "tab_title": "Mehr anzeigen", "tab_content": f"<p>{more}</p>"}],
                    "title_color": GOLD_700, "tab_active_color": NAVY, "content_color": NAVY_TEXT,
                    "border_width": px(0), "title_padding": box(4, 0), "content_padding": box(8, 0),
                    "title_typography_typography": "custom", "title_typography_font_family": UI,
                    "title_typography_font_size": px(15), "title_typography_font_weight": "600",
                    "content_typography_typography": "custom", "content_typography_font_family": UI,
                    "content_typography_font_size": px(16), "content_typography_line_height": {"unit": "em", "size": 1.6, "sizes": []},
                }),
            ], pad=(24,), gap_px=12),
        ], width=48.5, border=LINE, radius=8, bg=WHITE, gap_px=0, css="hs-card"))
    return section([
        eyebrow("Case Studies"),
        heading("Investition der Hanseatischen Invest eG"),
        spacer(16),
        container(cards, row=True, justify="space-between", align="flex-start", gap_px=24),
    ], anchor="case-studies", gap_px=8)


def webinar():
    return section([
        container([
            container([
                eyebrow("Live Webinar", on_dark=True),
                heading("Lassen Sie Ihr Kapital sinnvoll arbeiten", color=WHITE),
                text("<p>Nutzen Sie Ihr Kapital gezielt. Erfahren Sie im kostenfreien Live-Webinar, wie "
                     "Genossenschaftsanteile als strukturierte Alternative zur klassischen Immobilienanlage funktionieren "
                     "– transparent und ohne Verwaltungsaufwand. Jetzt Platz sichern.</p>", color=ON_NAVY),
                button("Jetzt anmelden", "#kontakt"),
            ], width=48, gap_px=14),
            container([image("erklaerfilm-poster.jpg", "Standbild aus dem Erklärfilm der Hanseatischen Invest eG")],
                      width=48),
        ], row=True, align="center", justify="space-between", gap_px=48),
    ], gradient=True, pad=(80, 20))


def team():
    cards = []
    for name, role, photo, bio in TEAM:
        cards.append(container([
            image(photo, f"{name}, {role}", radius=0) if photo else placeholder(f"Foto {name}", "4/5"),
            container([
                heading(name, "h3", size=26, mobile=24),
                heading(role, "p", size=14, mobile=14, color=GOLD_700, weight="600", family=UI, line=1.4),
                text(f"<p>{bio}</p>", size=15),
            ], pad=(24,), gap_px=8),
        ], width=31.5, border=LINE, radius=8, bg=WHITE, gap_px=0, css="hs-card hs-team-card"))
    return section([
        eyebrow("Team"),
        heading("Die Führungsspitze der Hanseatischen Invest eG"),
        spacer(16),
        container(cards, row=True, justify="space-between", align="flex-start", gap_px=24),
    ], anchor="team", gap_px=8)


def press():
    return section([
        container([
            container([placeholder("Bild Presse & Artikel")], width=48),
            container([
                heading("Öffentlichkeitsarbeit &amp; Artikel"),
                text("<p>In diesem Bereich finden Sie ausgewählte Artikel und Veröffentlichungen rund um unser "
                     "Unternehmen. Hier erhalten Sie kompakte Einblicke in unser Business und erfahren, wo und zu "
                     "welchen Themen wir publizieren.</p>"),
                button("Mehr erfahren", "#"),
            ], width=46, gap_px=14),
        ], row=True, align="center", justify="space-between", gap_px=48),
    ], bg=GREY_BG)


def case_numbers():
    stats = [("2,5 M", "Gesamtinvestition"), ("2 M", "Kaufpreis"), ("500.000", "Sanierung"),
             ("2 M", "Bankdarlehen"), ("500.000", "Eigenkapital"), ("3,2 M", "Verkaufspreis")]
    return section([
        heading("Case Study: Ein Mehrfamilienhaus in Hamburg", color=WHITE),
        text("<p>Die Hanseatische Invest eG ermöglicht durch gezielten Einsatz von Eigenkapital attraktive "
             "Finanzierungsstrukturen, steigert Immobilienwerte nachhaltig und bietet Anlegern transparente sowie "
             "verlässliche Renditen. Das Projekt wurde zu 80 % fremd- und zu 20 % eigenfinanziert, wobei die "
             "Ankaufnebenkosten aus Eigenkapital gedeckt wurden. Durch gezielte Sanierungsmaßnahmen erzielten die "
             "Anleger eine Rendite von 7 % zuzüglich vollständiger Rückzahlung des Eigenkapitals.</p>", color=ON_NAVY),
        spacer(16),
        container([
            container([
                heading(v, "p", size=30, mobile=26, color=GOLD_400 if i == len(stats) - 1 else WHITE, line=1),
                text(f"<p>{label}</p>", color=ON_NAVY_MUTED, size=13),
            ], width=15.5, width_mobile=47, pad=(20, 16), radius=8, border="rgba(255,255,255,0.16)", gap_px=6)
            for i, (v, label) in enumerate(stats)
        ], row=True, wrap=True, mobile_row=True, justify="space-between", gap_px=12, css="hs-row-wrap"),
    ], gradient=True, pad=(80, 20), gap_px=12)


def logo_grid():
    return container([
        container([placeholder("Logo Platzhalter", "3/2")], width=15.5, width_mobile=47) for _ in range(6)
    ], row=True, wrap=True, mobile_row=True, justify="space-between", gap_px=12, css="hs-row-wrap")


def subsidiaries():
    return section([
        heading("Tochterunternehmen"),
        text("<p>Mit unseren Marken decken wir die gesamte Wertschöpfungskette entlang der Bestandssanierung bis hin zum "
             "Verkauf als optimierte Kapitalanlage ab. Durch diese Synergien entstehen für uns und unsere Kunden "
             "relevante Kostenvorteile.</p>"),
        spacer(16),
        logo_grid(),
    ], gap_px=12)


def broker():
    return section([
        container([
            container([
                heading("Mehrwert für Makler: 7&nbsp;% p.a. Rendite-Chance für Ihre Verkaufskunden", "h2", size=32,
                        mobile=26, color=WHITE, line=1.25),
                text("<p>Was passiert mit dem Kapital Ihrer Kunden nach dem Verkauf? Mit den Genossenschaftsanteilen der "
                     "Hanseatischen Invest eG bieten Sie eine attraktive Möglichkeit zur renditestarken Weiteranlage – "
                     "7&nbsp;% p.a. im Rahmen unseres „Club der Kapitalanleger PRO“ der Gerlach Immobilien Gruppe.</p>",
                     color=ON_NAVY, size=16),
            ], width=68, gap_px=12),
            container([button("Jetzt empfehlen", "#kontakt", align="right", size=16)], width=26, justify="center"),
        ], row=True, align="center", justify="space-between", gradient=True, radius=8, pad=(48,), pad_mobile=(32, 20),
            gap_px=24),
    ], pad=(0, 20, 72, 20), pad_mobile=(0, 16, 56, 16))


def faq():
    return section([
        container([
            heading("Häufig gestellte Fragen"),
            spacer(8),
            widget("accordion", {
                "tabs": [{"_id": uid(), "tab_title": q, "tab_content": f"<p><strong>{lead}</strong></p><p>{body}</p>"}
                         for q, lead, body in FAQS],
                "border_width": px(1), "border_color": "#D2D4DA", "title_background": "transparent",
                "title_color": NAVY, "tab_active_color": GOLD_700, "content_background_color": "transparent",
                "content_color": NAVY_TEXT, "title_padding": box(20, 4), "content_padding": box(4, 4, 24, 4),
                "title_typography_typography": "custom", "title_typography_font_family": UI,
                "title_typography_font_size": px(17), "title_typography_font_weight": "600",
                "content_typography_typography": "custom", "content_typography_font_family": UI,
                "content_typography_font_size": px(16),
                "content_typography_line_height": {"unit": "em", "size": 1.6, "sizes": []},
                "icon_align": "right",
                "selected_icon": {"value": "fas fa-plus", "library": "fa-solid"},
                "selected_active_icon": {"value": "fas fa-minus", "library": "fa-solid"},
            }, css="hs-faq"),
        ], max_width=860, gap_px=12),
    ], bg=GREY_BG, anchor="faq", align="center")


def sponsoring():
    return section([
        container([
            container([
                heading("Wir sponsern Ihr Team"),
                text("<p>Die Hanseatische Invest eG ist stolzer Sponsor verschiedener Sportteams und engagiert sich aktiv "
                     "für sportliche Leistung und Gemeinschaft. Mit diesem Engagement unterstreicht das Unternehmen seine "
                     "Verbundenheit zu Teamgeist, Fairness und nachhaltiger Förderung.</p>"),
            ], width=66, gap_px=12),
            container([button("Mehr erfahren", "#kontakt", align="right")], width=30, justify="flex-end"),
        ], row=True, align="flex-end", justify="space-between", gap_px=24),
        spacer(16),
        logo_grid(),
    ], gap_px=12)


def contact():
    return section([
        container([
            container([
                heading("Kontakt"),
                text("<p>Wenn Sie Fragen haben oder einen Termin mit einem unserer Berater für weiterführende "
                     "Informationen vereinbaren möchten, nehmen Sie gerne Kontakt mit uns auf. Unser Team steht Ihnen "
                     "jederzeit zur Verfügung und organisiert gerne ein persönliches Gespräch zu einem für Sie passenden "
                     "Zeitpunkt. Wir freuen uns auf Ihre Anfrage.</p>"),
                spacer(8),
                placeholder("Bild Beratung / Team"),
            ], width=48, gap_px=12),
            container([widget("shortcode", {"shortcode": "[hansea_kontakt]"})], width=48),
        ], row=True, align="flex-start", justify="space-between", gap_px=48),
    ], bg=GREY_BG, anchor="kontakt")


def footer():
    def col(title, items):
        return container([
            heading(title, "p", size=14, mobile=14, color=WHITE, weight="600", family=UI, line=1.4),
            icon_list(items, color=ON_NAVY, size=14, weight="400", gap_px=6),
        ], width=22, gap_px=8)

    return container([
        container([
            container([
                image(None, "Hansea Invest eG", radius=0, url="{{THEME}}/images/logo-white.svg", width=90),
                text("<p><strong>Hanseatische Invest eG</strong><br>Langenhorner Chaussee 155<br>22415 Hamburg<br>"
                     "+49 40 22862372-0<br>mitgliederservice@hanseainvest.de</p>", color=ON_NAVY, size=14),
            ], width=24, gap_px=16),
            col("Navigation", NAV),
            col("Mitglieder", [("Mitglieder-Login", "/login/"),
                               ("Geprüfter Jahresabschluss auf Anfrage", "mailto:mitgliederservice@hanseainvest.de"),
                               ("Prüfungsverband: DIVK Prüfungsverband", None)]),
            col("Rechtliches", [("Impressum", "#"), ("Datenschutz", "#"), ("Risikohinweis", "#"), ("Satzung", "#"),
                                ("Amtsgericht Hamburg, GnR 1175", None)]),
        ], row=True, wrap=True, justify="space-between", gap_px=24),
        widget("divider", {"color": "rgba(255,255,255,0.16)", "gap": px(24)}),
        text(f"<p>{LEGAL}</p>", color=ON_NAVY_MUTED, size=12, line=1.6),
    ], inner=False, boxed=True, gradient=True, pad=(64, 20), pad_mobile=(48, 16), gap_px=8)


def build():
    return [header(), hero(), about(), at_a_glance(), book(), capital_steps(), trust(), case_studies(), webinar(),
            team(), press(), case_numbers(), subsidiaries(), broker(), faq(), sponsoring(), contact(), footer()]


if __name__ == "__main__":
    data = build()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print(f"wrote {OUT} ({len(data)} sections)")
