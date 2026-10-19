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
              justify=None, wrap=False, reverse_mobile=False, mobile_row=False, anchor=None, css=None, max_width=None,
              min_h=None, min_h_mobile=None, bg_image=None, bg_pos="center center"):
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
    elif bg_image:
        s.update({
            "background_background": "classic",
            "background_color": bg or NAVY,
            "background_image": {"url": "{{IMG:%s}}" % bg_image, "id": "{{IMGID:%s}}" % bg_image, "size": "",
                                 "alt": "", "source": "library"},
            "background_position": bg_pos, "background_repeat": "no-repeat", "background_size": "cover",
        })
    elif bg:
        s.update({"background_background": "classic", "background_color": bg})
    if min_h:
        s["min_height"] = px(min_h)
        s["min_height_mobile"] = px(min_h_mobile if min_h_mobile is not None else 0)
    if radius:
        s["border_radius"] = box(radius)
    if border:
        s.update({"border_border": "solid", "border_width": box(1), "border_color": border})
    if anchor:
        s["_element_id"] = anchor
    # Background images must not be lazy-loaded (Elementor hides them until scripts run)
    classes = [c for c in [css, None if inner and not bg_image else "e-no-lazyload"] if c]
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


# ---------------------------------------------------------------- layout helpers
#
# Clean, airy layout: white and light-grey bands, white tiles with soft shadows
# (class hs-tile), full-bleed split bands with a flat navy panel next to a
# photo (hs-panel, aligned to the 1180px grid via hs-panel-l / hs-panel-r),
# small eyebrows with a hairline (hs-eyebrow). Styles: elementor/hansea-elementor.css.

PAD = (104, 20)
PAD_MOBILE = (64, 16)


def band(children, **kw):
    kw.setdefault("pad", PAD)
    kw.setdefault("pad_mobile", PAD_MOBILE)
    return container(children, inner=False, boxed=True, **kw)


def split(children, *, anchor=None, css=None):
    """Full-bleed row of panels (no gap); each child sets its own width."""
    return container(children, inner=False, row=True, gap_px=0, anchor=anchor, css=css, align="stretch")


def panel(children, width, *, side, bg=NAVY, pad=(96, 64), gap_px=18, justify="center", min_h=None):
    """Half of a split band; `side` aligns its outer edge with the boxed grid."""
    return container(children, width=width, bg=bg, pad=pad, pad_mobile=(56, 16), gap_px=gap_px, justify=justify,
                     min_h=min_h, css=f"hs-panel hs-panel-{side}")


def photo(name, width, *, min_h=640, children=(), pos="center center", contain_on=None):
    """Photo panel; `contain_on` shows the whole image on that background colour instead of cropping."""
    return container(list(children), width=width, bg_image=name, bg_pos=pos, min_h=min_h, min_h_mobile=300,
                     bg=contain_on, css="hs-panel hs-photo" + (" hs-photo--contain" if contain_on else ""),
                     pad=(40,), pad_mobile=(20, 16), justify="flex-end", align="flex-start")


def tile(children, *, width=None, width_mobile=100, bg=WHITE, pad=(32,), pad_mobile=(24, 20), gap_px=12, css="",
         **kw):
    return container(children, width=width, width_mobile=width_mobile, bg=bg, radius=8, pad=pad, pad_mobile=pad_mobile,
                     gap_px=gap_px, css=f"hs-tile {css}".strip(), **kw)


def eyebrow(text, on_dark=False):  # noqa: F811 (replaces the plain version above)
    return widget("heading", {
        "title": text, "header_size": "p", "title_color": GOLD_400 if on_dark else GOLD_700,
        **type_(UI, 12, "600", 1.4, spacing=0.2, transform="uppercase"),
    }, css="hs-eyebrow")


def h2(title, color=NAVY):
    return heading(title, size=42, mobile=32, color=color, line=1.12)


def intro_row(eyebrow_text, title, body=None, *, on_dark=False, button_=None):
    """Section opener: eyebrow + heading on the left, intro text on the right."""
    left = container([eyebrow(eyebrow_text, on_dark), h2(title, WHITE if on_dark else NAVY)], width=50, gap_px=14)
    right = []
    if body:
        right.append(text(f"<p>{body}</p>", color=ON_NAVY if on_dark else NAVY_TEXT, size=16))
    if button_:
        right.append(button_)
    return container([left, container(right, width=42, gap_px=16)] if right else [left], row=True,
                     align="flex-end", justify="space-between", gap_px=32)


def fact(value, label, *, on_dark=True):
    return container([
        heading(value, "p", size=30, mobile=26, color=WHITE if on_dark else NAVY, line=1),
        text(f"<p>{label}</p>", color=ON_NAVY_MUTED if on_dark else MUTED, size=12, line=1.4),
    ], width=31, width_mobile=31, gap_px=6)


def circle_button(url, label):
    return widget("button", {
        "text": "→", "link": {"url": url, "is_external": "", "nofollow": "", "custom_attributes": f"aria-label|{label}"},
        "background_color": GOLD, "button_text_color": NAVY, "button_background_hover_color": GOLD_600,
        "hover_color": NAVY, **type_(UI, 20, "600", 1),
    }, css="hs-circle")


def light_button(label, url):
    """Text link with arrow on navy panels."""
    return widget("button", {
        "text": f"{label}  →", "link": {"url": url, "is_external": "", "nofollow": "", "custom_attributes": ""},
        "background_color": "transparent", "button_text_color": WHITE, "button_background_hover_color": "transparent",
        "hover_color": GOLD_400, "text_padding": box(14, 4), **type_(UI, 15, "600", 1, spacing=0.01),
    })


def link_button(label, url):
    return widget("button", {
        "text": f"{label}  →", "link": {"url": url, "is_external": "", "nofollow": "", "custom_attributes": ""},
        "background_color": "transparent", "button_text_color": NAVY, "button_background_hover_color": "transparent",
        "hover_color": GOLD_700, "text_padding": box(8, 0), **type_(UI, 15, "600", 1, spacing=0.01),
    })


def logo_row(count=6):
    return container([
        tile([placeholder("Logo Platzhalter", "3/2")], width=15.5, width_mobile=47, bg=GREY_BG, pad=(16,),
             pad_mobile=(12,), css="hs-tile--flat")
        for _ in range(count)
    ], row=True, wrap=True, mobile_row=True, justify="space-between", gap_px=12, css="hs-row-wrap")


# ---------------------------------------------------------------- sections

def header():
    return container([
        container([
            image(None, "Hansea Invest eG", radius=0, url="{{THEME}}/images/logo-navy.svg", link="/", width=72),
            container([icon_list(NAV, inline=True, color=NAVY_TEXT, size=14, gap_px=32)], css="hs-nav"),
            container([
                button("Mitglieder-Login", "/login/", size=14),
            ], row=True, mobile_row=True, align="center", gap_px=16, css="hs-header-actions"),
        ], row=True, mobile_row=True, boxed=True, align="center", justify="space-between", pad=(14, 20),
            pad_mobile=(10, 16), gap_px=24),
    ], inner=False, bg=WHITE, css="hs-header", border=None)


def hero():
    chip = tile([
        eyebrow("Aktuelles Projekt"),
        text("<p><strong>Borgfelder Straße, Hamburg</strong><br>Saniertes Mehrfamilienhaus</p>", size=14, line=1.5),
    ], pad=(18, 22), gap_px=6, max_width=300, css="hs-chip")
    return split([
        panel([
            eyebrow("Genossenschaftliche Beteiligung", on_dark=True),
            heading("Investieren in reale Wohnimmobilien", "h1", size=58, mobile=40, color=WHITE, weight="300",
                    line=1.04),
            widget("divider", {"color": "rgba(255,255,255,0.22)", "weight": px(1), "width": {"unit": "px", "size": 64,
                                                                                           "sizes": []},
                               "gap": px(6)}),
            heading("Unternehmerisch. Transparent. Nachvollziehbar.", "p", size=18, mobile=17, color=WHITE,
                    weight="600", family=UI, line=1.4),
            text("<p>Gemeinsam mit anderen Mitgliedern investieren Sie in Bestandshäuser, die wir kaufen, sanieren und "
                 "verkaufen – mit einer angestrebten Verzinsung von 7&nbsp;% p.a.*</p>", color=ON_NAVY, size=16),
            container([button("Jetzt informieren", "#kontakt"), light_button("So funktioniert's", "#so-funktionierts")],
                      row=True, mobile_row=True, wrap=True, align="center", gap_px=12),
            spacer(12),
            container([fact("10.000 €", "Mindestbeteiligung"), fact("7 % p.a.*", "Zielverzinsung"),
                       fact("12 Monate", "Mindestlaufzeit")],
                      row=True, mobile_row=True, justify="space-between", gap_px=12, css="hs-facts"),
        ], 42, side="l", pad=(104, 64, 88, 64)),
        photo("projekt-hamburg-borgfelder.jpg", 58, min_h=700, children=[chip]),
    ])


def about():
    stats = [("45", "Mitarbeiter"), ("3", "Standorte"), ("2018", "Gegründet"), ("300", "Verkaufte Wohnungen")]
    tiles = container([
        tile([
            heading(v, "p", size=54, mobile=40, line=1),
            text(f"<p>{label}</p>", color=MUTED, size=14),
        ], width=48.5, width_mobile=47, pad=(36, 32), pad_mobile=(24, 18), gap_px=8)
        for v, label in stats
    ], row=True, wrap=True, mobile_row=True, justify="space-between", gap_px=16, width=54, css="hs-row-wrap")
    return band([
        container([
            tiles,
            container([
                eyebrow("Über uns"),
                h2("Die Hanseatische Invest eG"),
                text("<p>Die Hanseatische Invest eG verwendet Ihr investiertes Kapital, um Immobilienprojekte effizient "
                     "umzusetzen und nachhaltige Mehrwerte zu schaffen – für unsere Mitglieder und den deutschen "
                     "Immobilienmarkt. Als Genossenschaft stehen wir für Transparenz, Verantwortung und eine "
                     "partnerschaftliche Beteiligung an Immobilieninvestments.</p>", size=16),
                text("<p>Werden Sie Teil der Hanseatischen Invest eG und profitieren Sie von einer attraktiven Rendite "
                     "von bis zu 7&nbsp;% p.a. – jetzt informieren und investieren.</p>", size=16),
                spacer(4),
                button("Kontakt aufnehmen", "#kontakt"),
            ], width=38, gap_px=14),
        ], row=True, align="center", justify="space-between", gap_px=48, reverse_mobile=True),
    ], bg=GREY_BG, anchor="ueber-uns", pad=(104, 20, 32, 20), pad_mobile=(64, 16, 24, 16))


def at_a_glance():
    bullets = ["Genossenschaftliche Beteiligung", "Investition in reale Wohnimmobilien", "Teilhabe mit Chancen & Risiken",
               "Mindestlaufzeit: 12 Monate", "Verzinsung bis 7 % p.a.*"]
    return band([
        container([
            tile([
                eyebrow("Auf einen Blick"),
                heading("Kurz zusammengefasst: So funktioniert Ihre Beteiligung bei der Hanseatischen Invest eG.", "h3",
                        size=30, mobile=24, line=1.2),
                text("<p>Die Hanseatische Invest eG bietet eine genossenschaftliche Beteiligung statt einer klassischen "
                     "Geldanlage: Sie investieren gemeinsam mit anderen Mitgliedern in reale Wohnimmobilien und nehmen "
                     "unternehmerisch an Chancen und Risiken teil. Die Mindestlaufzeit beträgt 12 Monate, mit einer "
                     "angestrebten Verzinsung von 7&nbsp;% p.a.*</p>", size=16),
                text("<p>* Die Verzinsung ist aus rechtlichen Gründen nicht garantiert und abhängig vom wirtschaftlichen "
                     "Erfolg der Genossenschaft.</p>", color=MUTED, size=12, line=1.5),
            ], width=56, pad=(48,), pad_mobile=(28, 20), gap_px=16, justify="center"),
            tile([
                eyebrow("Ihre Beteiligung", on_dark=True),
                icon_list([(b, None) for b in bullets], color=WHITE, icon="fas fa-check", icon_color=GOLD_400, size=15,
                          weight="500", gap_px=16),
                spacer(4),
                container([
                    text("<p>Persönlich beraten lassen</p>", color=ON_NAVY, size=14),
                    circle_button("#kontakt", "Persönlich beraten lassen"),
                ], row=True, mobile_row=True, align="center", justify="space-between", gap_px=12, css="hs-split-line"),
            ], width=40, bg=NAVY, pad=(40,), pad_mobile=(28, 20), gap_px=20),
        ], row=True, align="stretch", justify="space-between", gap_px=24),
    ], bg=GREY_BG, pad=(0, 20, 104, 20), pad_mobile=(0, 16, 64, 16))


def book():
    return split([
        panel([
            container([placeholder("Buchcover „Dein Weg zur finanziellen Freiheit“", "2/3")], width=56,
                      width_mobile=60, css="hs-book"),
        ], 44, side="l", justify="center", min_h=560, gap_px=0, pad=(72, 48)),
        panel([
            eyebrow("Neues Buch"),
            h2("Dein Weg zur finanziellen Freiheit"),
            text("<p>Das neue Buch von Stephan Gerlach, des Spiegel-Bestsellerautors und CEO der Gerlach Immobilien "
                 "Gruppe, ist Ihr Leitfaden für Immobilien als Kapitalanlage. Nutzen Sie sein Expertenwissen, um "
                 "fundierte Entscheidungen zu treffen und gezielt für Ihre finanzielle Freiheit und eine sichere "
                 "Zukunft vorzusorgen.</p>", size=16),
            spacer(4),
            button("Zum Buchkauf", "#"),
        ], 56, side="r", bg=WHITE, pad=(96, 64)),
    ])


def capital_steps():
    cards = []
    for i, (title, body) in enumerate(STEPS):
        cards.append(tile([
            placeholder(f"Bild Schritt {i + 1}", "16/10"),
            container([
                heading(f"Schritt {i + 1:02d}", "p", size=12, mobile=12, color=GOLD_700, weight="600", family=UI,
                        line=1.4),
                heading(title, "h3", size=24, mobile=22, line=1.2),
                text(f"<p>{body}</p>", size=15),
            ], pad=(28, 32, 32, 32), pad_mobile=(22, 20, 24, 20), gap_px=10),
        ], width=48.5, pad=(0,), pad_mobile=(0,), gap_px=0, css="hs-card"))
    return band([
        intro_row("So funktioniert's", "Wie wir Ihr Kapital einsetzen",
                  "In vier Schritten: Ihr Kapital fließt in echte Häuser, stärkt dort als Eigenkapital die Finanzierung, "
                  "und aus Sanierung und Verkauf entstehen Ihre Erträge."),
        spacer(24),
        container(cards, row=True, wrap=True, justify="space-between", align="stretch", gap_px=24, css="hs-row-wrap"),
        spacer(8),
        text("<p>*Die Wertschöpfung entsteht durch operative Immobilienarbeit, nicht durch Finanzprodukte.</p>",
             color=MUTED, size=13),
    ], anchor="so-funktionierts", gap_px=12)


def trust():
    seals = [("siegel-top-experte-2026.png", "Siegel „Top-Experte 2026“, ERFOLG Magazin", "TOP-Experten-Siegel 2026"),
             ("siegel-top-100-coaches-berater-2025.png", "Siegel „Top 100 Coaches & Berater 2025“, ERFOLG Magazin",
              "EM Top 100 Coaches + Berater"),
             ("siegel-top-100-unternehmer-2024.png", "Siegel „Top 100 Unternehmer 2024“, ERFOLG Magazin",
              "Top 100 Unternehmer-Siegel")]
    return band([
        container([
            container([
                eyebrow("Ausgezeichnet", on_dark=True),
                heading("Mehr Rendite, weniger Risiko. Kein Aufwand", size=34, mobile=28, color=WHITE, line=1.15),
            ], width=38, gap_px=14),
            container([
                container([
                    image(f, alt, radius=0, width=84),
                    text(f"<p>{label}</p>", color=ON_NAVY, size=13, align="center", weight="600", line=1.4),
                ], width=31, width_mobile=31, align="center", gap_px=12)
                for f, alt, label in seals
            ], row=True, mobile_row=True, justify="space-between", gap_px=16, width=56),
        ], row=True, align="center", justify="space-between", gap_px=40),
    ], bg=NAVY, pad=(72, 20), pad_mobile=(56, 16))


def case_studies():
    cards = []
    for title, intro, more in CASES:
        cards.append(tile([
            placeholder(f"Projektfoto {title}", "16/10"),
            container([
                heading("Case Study", "p", size=12, mobile=12, color=GOLD_700, weight="600", family=UI, line=1.4),
                heading(title, "h3", size=28, mobile=24),
                text(f"<p>{intro}</p>", size=15),
                widget("toggle", {
                    "tabs": [{"_id": uid(), "tab_title": "Mehr anzeigen", "tab_content": f"<p>{more}</p>"}],
                    "title_color": NAVY, "tab_active_color": GOLD_700, "content_color": NAVY_TEXT,
                    "border_width": px(0), "title_padding": box(4, 0), "content_padding": box(8, 0),
                    "title_typography_typography": "custom", "title_typography_font_family": UI,
                    "title_typography_font_size": px(15), "title_typography_font_weight": "600",
                    "content_typography_typography": "custom", "content_typography_font_family": UI,
                    "content_typography_font_size": px(15),
                    "content_typography_line_height": {"unit": "em", "size": 1.6, "sizes": []},
                }),
            ], pad=(28, 32, 28, 32), pad_mobile=(22, 20), gap_px=10),
        ], width=48.5, pad=(0,), pad_mobile=(0,), gap_px=0, css="hs-card"))
    return band([
        intro_row("Case Studies", "Investition der Hanseatischen Invest eG",
                  "Zwei abgeschlossene Projekte: was wir gekauft, verbessert und verkauft haben."),
        spacer(24),
        container(cards, row=True, justify="space-between", align="flex-start", gap_px=24),
    ], bg=GREY_BG, anchor="case-studies", gap_px=8)


def webinar():
    return split([
        photo("erklaerfilm-poster.jpg", 56, min_h=470, contain_on="#EDF1F4"),
        panel([
            eyebrow("Live Webinar", on_dark=True),
            h2("Lassen Sie Ihr Kapital sinnvoll arbeiten", WHITE),
            text("<p>Nutzen Sie Ihr Kapital gezielt. Erfahren Sie im kostenfreien Live-Webinar, wie "
                 "Genossenschaftsanteile als strukturierte Alternative zur klassischen Immobilienanlage funktionieren "
                 "– transparent und ohne Verwaltungsaufwand. Jetzt Platz sichern.</p>", color=ON_NAVY, size=16),
            spacer(4),
            button("Jetzt anmelden", "#kontakt"),
        ], 44, side="r"),
    ])


def team():
    cards = []
    for name, role, photo_file, bio in TEAM:
        cards.append(tile([
            image(photo_file, f"{name}, {role}", radius=0) if photo_file else placeholder(f"Foto {name}", "4/5"),
            container([
                heading(role, "p", size=12, mobile=12, color=GOLD_700, weight="600", family=UI, line=1.4),
                heading(name, "h3", size=26, mobile=24),
                text(f"<p>{bio}</p>", size=15),
            ], pad=(24, 28, 28, 28), pad_mobile=(20,), gap_px=8),
        ], width=31.5, pad=(0,), pad_mobile=(0,), gap_px=0, css="hs-card hs-team-card"))
    return band([
        intro_row("Team", "Die Führungsspitze der Hanseatischen Invest eG"),
        spacer(24),
        container(cards, row=True, justify="space-between", align="stretch", gap_px=24),
    ], anchor="team", gap_px=8)


def press_and_broker():
    return band([
        container([
            container([
                eyebrow("Presse"),
                heading("Öffentlichkeitsarbeit &amp; Artikel", size=34, mobile=28, line=1.15),
                text("<p>In diesem Bereich finden Sie ausgewählte Artikel und Veröffentlichungen rund um unser "
                     "Unternehmen. Hier erhalten Sie kompakte Einblicke in unser Business und erfahren, wo und zu "
                     "welchen Themen wir publizieren.</p>", size=15),
                link_button("Mehr erfahren", "#"),
            ], width=31, gap_px=14, justify="center"),
            tile([placeholder("Bild Presse & Artikel", "4/5")], width=31, pad=(0,), pad_mobile=(0,), css="hs-card hs-fill"),
            tile([
                eyebrow("Für Makler", on_dark=True),
                heading("Mehrwert für Makler: 7&nbsp;% p.a. Rendite-Chance für Ihre Verkaufskunden", "h3", size=26,
                        mobile=24, color=WHITE, line=1.2),
                text("<p>Was passiert mit dem Kapital Ihrer Kunden nach dem Verkauf? Mit den Genossenschaftsanteilen der "
                     "Hanseatischen Invest eG bieten Sie eine attraktive Möglichkeit zur renditestarken Weiteranlage – "
                     "7&nbsp;% p.a. im Rahmen unseres „Club der Kapitalanleger PRO“ der Gerlach Immobilien Gruppe.</p>",
                     color=ON_NAVY, size=14),
                container([
                    text("<p>Jetzt empfehlen</p>", color=WHITE, size=14, weight="600"),
                    circle_button("#kontakt", "Jetzt empfehlen"),
                ], row=True, mobile_row=True, align="center", justify="space-between", gap_px=12, css="hs-split-line"),
            ], width=31, bg=NAVY, pad=(36,), pad_mobile=(28, 20), gap_px=16, justify="space-between"),
        ], row=True, align="stretch", justify="space-between", gap_px=24),
    ], bg=GREY_BG)


def case_numbers():
    stats = [("2,5 M", "Gesamtinvestition"), ("2 M", "Kaufpreis"), ("500.000", "Sanierung"),
             ("2 M", "Bankdarlehen"), ("500.000", "Eigenkapital"), ("3,2 M", "Verkaufspreis")]
    return band([
        container([
            container([
                eyebrow("Case Study", on_dark=True),
                h2("Ein Mehrfamilienhaus in Hamburg", WHITE),
                text("<p>Die Hanseatische Invest eG ermöglicht durch gezielten Einsatz von Eigenkapital attraktive "
                     "Finanzierungsstrukturen, steigert Immobilienwerte nachhaltig und bietet Anlegern transparente sowie "
                     "verlässliche Renditen. Das Projekt wurde zu 80 % fremd- und zu 20 % eigenfinanziert, wobei die "
                     "Ankaufnebenkosten aus Eigenkapital gedeckt wurden. Durch gezielte Sanierungsmaßnahmen erzielten die "
                     "Anleger eine Rendite von 7 % zuzüglich vollständiger Rückzahlung des Eigenkapitals.</p>",
                     color=ON_NAVY, size=15),
            ], width=40, gap_px=14),
            container([
                container([
                    heading(v, "p", size=36, mobile=28, color=GOLD_400 if i == len(stats) - 1 else WHITE, line=1),
                    text(f"<p>{label}</p>", color=ON_NAVY_MUTED, size=13),
                ], width=32, width_mobile=48, pad=(28, 24), pad_mobile=(20, 16), radius=8,
                    border="rgba(255,255,255,0.14)", gap_px=8)
                for i, (v, label) in enumerate(stats)
            ], row=True, wrap=True, mobile_row=True, justify="space-between", gap_px=12, width=55, css="hs-row-wrap"),
        ], row=True, align="center", justify="space-between", gap_px=48),
    ], bg=NAVY)


def subsidiaries():
    return band([
        intro_row("Unsere Marken", "Tochterunternehmen",
                  "Mit unseren Marken decken wir die gesamte Wertschöpfungskette entlang der Bestandssanierung bis hin "
                  "zum Verkauf als optimierte Kapitalanlage ab. Durch diese Synergien entstehen für uns und unsere "
                  "Kunden relevante Kostenvorteile."),
        spacer(24),
        logo_row(),
    ], gap_px=12)


def faq():
    return band([
        container([
            container([
                eyebrow("FAQ"),
                h2("Häufig gestellte Fragen"),
                text("<p>Ihre Frage ist nicht dabei? Wir rufen Sie gern an und nehmen uns Zeit für Ihre Fragen.</p>",
                     size=16),
                spacer(4),
                button("Kontakt aufnehmen", "#kontakt"),
            ], width=34, gap_px=14),
            container([
                widget("accordion", {
                    "tabs": [{"_id": uid(), "tab_title": q, "tab_content": f"<p><strong>{lead}</strong></p><p>{body}</p>"}
                             for q, lead, body in FAQS],
                    "border_width": px(1), "border_color": LINE, "title_background": WHITE,
                    "title_color": NAVY, "tab_active_color": GOLD_700, "content_background_color": WHITE,
                    "content_color": NAVY_TEXT, "title_padding": box(22, 24), "content_padding": box(0, 24, 24, 24),
                    "title_typography_typography": "custom", "title_typography_font_family": UI,
                    "title_typography_font_size": px(16), "title_typography_font_weight": "600",
                    "content_typography_typography": "custom", "content_typography_font_family": UI,
                    "content_typography_font_size": px(15),
                    "content_typography_line_height": {"unit": "em", "size": 1.6, "sizes": []},
                    "icon_align": "right",
                    "selected_icon": {"value": "fas fa-plus", "library": "fa-solid"},
                    "selected_active_icon": {"value": "fas fa-minus", "library": "fa-solid"},
                }, css="hs-faq hs-faq-tiles"),
            ], width=60),
        ], row=True, align="flex-start", justify="space-between", gap_px=48),
    ], bg=GREY_BG, anchor="faq")


def sponsoring():
    return band([
        container([
            container([
                eyebrow("Engagement"),
                h2("Wir sponsern Ihr Team"),
                text("<p>Die Hanseatische Invest eG ist stolzer Sponsor verschiedener Sportteams und engagiert sich aktiv "
                     "für sportliche Leistung und Gemeinschaft. Mit diesem Engagement unterstreicht das Unternehmen seine "
                     "Verbundenheit zu Teamgeist, Fairness und nachhaltiger Förderung.</p>", size=16),
                link_button("Mehr erfahren", "#kontakt"),
            ], width=38, gap_px=14),
            container([
                tile([placeholder("Logo Platzhalter", "3/2")], width=31.5, width_mobile=47, bg=GREY_BG, pad=(16,),
                     pad_mobile=(12,), css="hs-tile--flat")
                for _ in range(6)
            ], row=True, wrap=True, mobile_row=True, justify="space-between", gap_px=12, width=56, css="hs-row-wrap"),
        ], row=True, align="center", justify="space-between", gap_px=48),
    ])


def contact():
    return split([
        panel([
            eyebrow("Kontakt", on_dark=True),
            h2("Sprechen Sie mit uns", WHITE),
            text("<p>Wenn Sie Fragen haben oder einen Termin mit einem unserer Berater für weiterführende "
                 "Informationen vereinbaren möchten, nehmen Sie gerne Kontakt mit uns auf. Unser Team organisiert gerne "
                 "ein persönliches Gespräch zu einem für Sie passenden Zeitpunkt.</p>", color=ON_NAVY, size=16),
            spacer(8),
            icon_list([("+49 40 22862372-0", "tel:+4940228623720"),
                       ("mitgliederservice@hanseainvest.de", "mailto:mitgliederservice@hanseainvest.de"),
                       ("Langenhorner Chaussee 155, 22415 Hamburg", None)],
                      color=WHITE, icon="fas fa-arrow-right", icon_color=GOLD_400, size=15, weight="500", gap_px=14),
        ], 42, side="l", justify="flex-start"),
        panel([widget("shortcode", {"shortcode": "[hansea_kontakt]"})], 58, side="r", bg=GREY_BG, pad=(96, 64)),
    ], anchor="kontakt")


def footer():
    def col(title, items):
        return container([
            heading(title, "p", size=12, mobile=12, color=GOLD_400, weight="600", family=UI, line=1.4),
            icon_list(items, color=ON_NAVY, size=14, weight="400", gap_px=8),
        ], width=22, width_mobile=100, gap_px=12)

    return container([
        container([
            container([
                image(None, "Hansea Invest eG", radius=0, url="{{THEME}}/images/logo-white.svg", width=84),
                text("<p>Hanseatische Invest eG<br>Langenhorner Chaussee 155<br>22415 Hamburg</p>", color=ON_NAVY,
                     size=14),
            ], width=24, gap_px=16),
            col("Navigation", NAV),
            col("Mitglieder", [("Mitglieder-Login", "/login/"),
                               ("Geprüfter Jahresabschluss auf Anfrage", "mailto:mitgliederservice@hanseainvest.de"),
                               ("Prüfungsverband: DIVK Prüfungsverband", None)]),
            col("Rechtliches", [("Impressum", "#"), ("Datenschutz", "#"), ("Risikohinweis", "#"), ("Satzung", "#"),
                                ("Amtsgericht Hamburg, GnR 1175", None)]),
        ], row=True, wrap=True, justify="space-between", gap_px=24),
        widget("divider", {"color": "rgba(255,255,255,0.14)", "gap": px(28)}),
        text(f"<p>{LEGAL}</p>", color=ON_NAVY_MUTED, size=12, line=1.6),
    ], inner=False, boxed=True, bg=NAVY, pad=(80, 20, 56, 20), pad_mobile=(56, 16, 40, 16), gap_px=8)


def build():
    return [header(), hero(), about(), at_a_glance(), book(), capital_steps(), trust(), case_studies(), webinar(),
            team(), press_and_broker(), case_numbers(), subsidiaries(), faq(), sponsoring(), contact(), footer()]


if __name__ == "__main__":
    data = build()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print(f"wrote {OUT} ({len(data)} sections)")
