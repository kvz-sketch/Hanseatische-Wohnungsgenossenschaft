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
import re
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
    return {"id": uid(), "elType": "container", "isInner": inner, "settings": s,
            "elements": [c for c in children if c is not None]}


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

def heading(text, tag="h2", *, size=44, mobile=32, color=NAVY, weight="400", align=None, family=DISPLAY, line=1.15,
            css_class=None):
    s = {"title": text, "header_size": tag, "title_color": color, **type_(family, size, weight, line, mobile)}
    if align:
        s["align"] = align
    return widget("heading", s, css=css_class)


def eyebrow(text, on_dark=False):
    return widget("heading", {
        "title": text, "header_size": "p", "title_color": GOLD_400 if on_dark else GOLD_700,
        **type_(UI, 13, "600", 1.4, spacing=0.18, transform="uppercase"),
    })


DROP = "__DROP__"  # paragraph removed when the copy was shortened; text() skips it


def text(html, *, color=NAVY_TEXT, size=17, line=1.6, align=None, weight="400"):
    if DROP in html:
        return None
    s = {"editor": html, "text_color": color, **type_(UI, size, weight, line, mobile=min(size, 16))}
    if align:
        s["align"] = align
    return widget("text-editor", s)


def button(label, url, *, variant="gold", align=None, size=15, hide_mobile=False, external=False):
    colors = {
        "gold": (GOLD, NAVY, GOLD_600, NAVY),
        "ghost": ("transparent", NAVY_TEXT, "transparent", GOLD_600),
    }[variant]
    s = {
        "text": label,
        "link": {"url": url, "is_external": "on" if external else "", "nofollow": "", "custom_attributes": ""},
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


def image(name, alt, *, radius=8, url=None, link=None, width=None, css_extra=None, lightbox=False, align=None):
    s = {
        "image": {"url": url or "{{IMG:%s}}" % name, "id": "" if url else "{{IMGID:%s}}" % name,
                  "alt": alt, "source": "library", "size": ""},
        "image_size": "full",
        "image_border_radius": box(radius),
    }
    if width:
        s["width"] = px(width)
    if align:
        s["align"] = align
        s["align_mobile"] = align
    if lightbox:  # click opens the full-size image in Elementor's lightbox
        s["link_to"] = "file"
        s["open_lightbox"] = "yes"
    if link:
        s["link_to"] = "custom"
        s["link"] = {"url": link, "is_external": "", "nofollow": ""}
    return widget("image", s, css=css_extra)


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

NAV = [("Über uns", "#ueber-uns"), ("Sponsoring", "#sponsoring"), ("So funktioniert's", "#so-funktionierts"),
       ("Projekte", "#projekte"), ("Konditionen", "#konditionen"), ("Team", "#team"), ("FAQ", "#faq"),
       ("Kontakt", "#kontakt")]

# The business model (brochure, "Das Geschäftsmodell"): always the same four steps
STEPS = [
    ("Kaufen",
     "Häuser in gefragten Lagen, deren Wohnungen sich später einzeln verkaufen lassen."),
    ("Modernisieren",
     "Heizung, Fassade, Dach, Wohnungen: nur was sich rechnet."),
    ("Vermieten",
     "Leerstand neu vermieten, Verträge marktgerecht, Verwaltung im eigenen Haus."),
    ("Verkaufen",
     "Die Wohnungen werden einzeln verkauft. Aus dem Mehrerlös entsteht der Überschuss."),
]

CASES = [
    ("Hamburg Eilbek",
     "Altbau von 1892 mit sechs Wohnungen und einer Gewerbeeinheit: Fassade saniert und gedämmt.",
     "WG-Vermietung, zwei neue Ferienwohnungen im Souterrain, danach Verkauf. Laufzeit 20 Monate."),
    ("Oldenburg",
     "Zwei Vierparteienhäuser mit Maisonette-Wohnungen, ideal für Studenten-WGs.",
     "Über 30 % Mietanpassung im Einvernehmen mit den Mietern. Laufzeit 9 Monate."),
]

# Team: name, role, photo, bio. LinkedIn profiles in TEAM_LINKEDIN ("#" until the real URL is known).
TEAM = [
    ("Stephan Gerlach", "Vorstand", "stephan-gerlach-portraet.jpg",
     "Gründer der Gerlach Immobilien Gruppe und Experte für Kapitalanlage-Immobilien."),
    ("Vadim Kogan", "Aufsichtsratsvorsitzender", "vadim-kogan-portraet.jpg",
     "Vorstand der ArztData AG und Experte für das deutsche Gesundheitswesen."),
    ("Christine Pistorius", "Vorstand", "christine-pistorius-portraet.jpg",
     "Immobilieninvestorin und Vorstandsmitglied der 100.PlusCommunity."),
]

# Case study photos (16:9); placeholder until a file is set
CASE_PHOTOS = {
    "Hamburg Eilbek": ("projekt-eilbek-kueche-v2.jpg", "Projekt Hamburg Eilbek: Küche vorher (links) und nachher (rechts)",
                       "hs-ba"),
    "Oldenburg": ("projekt-oldenburg.jpg", "Projekt Oldenburg: renovierte Maisonette-Wohnung", ""),
}

TEAM_LINKEDIN = {
    "Stephan Gerlach": "https://www.linkedin.com/in/stephan-gerlach/",
    "Vadim Kogan": "https://www.linkedin.com/in/vadim-kogan-7b08b3b1/",
    "Christine Pistorius": "https://www.linkedin.com/in/christine-pistorius-518b71246/",
}

FAQS = [
    ("Woran beteilige ich mich genau?", "An der Genossenschaft selbst.",
     "Sie übernehmen einen oder mehrere Anteile zu je 10.000 Euro und werden damit Mitglied der Hanseatischen "
     "Invest eG."),
    ("Gehört mir dann eine Wohnung?", "Nein.",
     "Sie beteiligen sich an der Genossenschaft. Um Mieter und Reparaturen kümmern wir uns."),
    ("Was bedeutet „investierendes Mitglied“?", "Sie stellen Geld zur Verfügung und erhalten dafür Zinsen.",
     "Sie arbeiten nicht im Betrieb mit und haben kein Stimmrecht in der Versammlung."),
    ("Wann bekomme ich die ersten Zinsen?", "Nach dem ersten vollen Quartal Ihrer Mitgliedschaft.",
     "Danach alle drei Monate."),
    ("Kann ich mehrere Anteile übernehmen?", "Ja.",
     "Jeder weitere Anteil kostet ebenfalls 10.000 Euro, die Konditionen sind dieselben."),
    ("Wie lange bin ich gebunden?", "Zunächst zwölf Monate.",
     "Kündigen Sie nicht spätestens neun Monate vor Ablauf, läuft Ihr Anteil ein weiteres Jahr."),
    ("Was passiert, wenn ich kündige?", "Nach Ablauf der Laufzeit bekommen Sie Ihren Anteil ausgezahlt.",
     "Der Betrag ergibt sich aus dem Jahresabschluss und kann unter Ihrer Einzahlung liegen."),
    ("Muss ich die Zinsen versteuern?", "Ja, so wie Zinsen auf einem Konto.",
     "Wir führen die Steuer direkt ab. Ein Freistellungsauftrag ist möglich."),
    ("Kann ich später zur Kasse gebeten werden?", "Nein.",
     "Mehr als Ihren Anteil zahlen Sie nie ein. Das ist in der Satzung festgeschrieben."),
    ("Wer kontrolliert die Genossenschaft?", "Ein unabhängiger Prüfungsverband.",
     "Das schreibt das Gesetz für jede Genossenschaft vor. Für uns ist das der DIVK e. V. in Hildesheim."),
    ("Wie erfahre ich, was mit meinem Geld passiert?", "Wir informieren Sie regelmäßig.",
     "Mit regelmäßigen Projektberichten und einer jährlichen Mitgliederversammlung."),
    ("Welche Risiken bestehen bei einer Beteiligung?", "Ihr Anteil ist kein Sparbuch.",
     "Die Zinsen können niedriger ausfallen oder entfallen, ein Totalverlust ist möglich. Keine Einlagensicherung."),
]

BOOKING_URL = "https://calendly.com/dpp-gerlachgroup/30min-erstgesprach-gig"  # Calendly, 30-minute first call
BOOK_URL = "https://www.remote-verlag.de/products/immobilien-investitionen-leicht-gemacht"
BLOG_URL = "https://blog.gerlachgroup.de/%C3%B6ffentlichkeit-pr-blog"

LEGAL = ("<strong>Risikohinweis.</strong> Genossenschaftsanteile sind eine unternehmerische Beteiligung und nicht "
         "garantiert. Es besteht Totalverlustrisiko des eingesetzten Kapitals. Keine Nachschusspflicht. Die vorgesehenen "
         "Zinsen können niedriger ausfallen oder entfallen. Bei Kündigung wird Ihr Guthaben nach § 73 Absatz 2 GenG aus "
         "der Bilanz ermittelt und kann unter Ihrer Einzahlung liegen. Der Geschäftsanteil ist keine Bankeinlage, nicht "
         "durch ein gesetzliches Entschädigungssystem geschützt und nicht täglich verfügbar. <strong>Hinweise.</strong> "
         "Angeboten wird die investierende Mitgliedschaft nach § 8 Absatz 2 GenG, nicht die Beteiligung an einem "
         "einzelnen Objekt. Diese Seite dient der Information und ersetzt keine Anlage-, Rechts- oder Steuerberatung. "
         "Maßgeblich sind Satzung, Allgemeine Geschäftsordnung und Beitrittsunterlagen. Geschäftsanteile an "
         "eingetragenen Genossenschaften sind nach § 2 Absatz 1 Nummer 1 VermAnlG von der Prospektpflicht ausgenommen, "
         "ein Verkaufsprospekt liegt nicht vor. Projektangaben nach Unterlagen der Gerlach Immobilien Gruppe, Stand "
         "September 2026. * Vorgesehene Verzinsung laut Geschäftsordnung, keine Zusage.")


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


# The few small labels that stay; every other eyebrow() is left out (too many read as a template)
KEEP_EYEBROWS = {"Abgeschlossenes Projekt", "Stimmen unserer Mitglieder", "Spiegel-Bestseller"}


def eyebrow(text, on_dark=False):  # noqa: F811 (replaces the plain version above)
    if text not in KEEP_EYEBROWS:
        return None
    return widget("heading", {
        "title": text, "header_size": "p", "title_color": GOLD_400 if on_dark else GOLD_700,
        **type_(UI, 12, "600", 1.4, spacing=0.2, transform="uppercase"),
    }, css="hs-eyebrow")


def h2(title, color=NAVY):
    return heading(title, size=42, mobile=32, color=color, line=1.12)


def intro_row(eyebrow_text, title, body=None, *, on_dark=False, button_=None, note=None, wide=False):
    """Section opener: eyebrow (optional), heading, small note and intro paragraph stacked on the left.
    `wide` lets a long heading use the full content width (one line on desktop)."""
    children = ([eyebrow(eyebrow_text, on_dark)] if eyebrow_text else []) + [h2(title, WHITE if on_dark else NAVY)]
    if note:
        children.append(text(f"<p>{note}</p>", color=ON_NAVY_MUTED if on_dark else MUTED, size=13, line=1.5))
    if body:
        children.append(text(f"<p>{body}</p>", color=ON_NAVY if on_dark else NAVY_TEXT, size=16))
    if button_:
        children.append(button_)
    return container(children, gap_px=14) if wide else container(children, max_width=720, gap_px=14)


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


def link_button(label, url, external=False):
    return widget("button", {
        "text": f"{label}  →", "link": {"url": url, "is_external": "on" if external else "", "nofollow": "",
                                       "custom_attributes": ""},
        "background_color": "transparent", "button_text_color": NAVY, "button_background_hover_color": "transparent",
        "hover_color": GOLD_700, "text_padding": box(8, 0), **type_(UI, 15, "600", 1, spacing=0.01),
    })


VIDEO_URL = "https://www.youtube.com/watch?v=LN4jH5tXYwk"


def video_box():
    """YouTube film in privacy mode; the player loads only after a click on the thumbnail."""
    return widget("video", {
        "video_type": "youtube",
        "youtube_url": VIDEO_URL,
        "yt_privacy": "yes",
        "rel": "",
        "modestbranding": "yes",
        "show_image_overlay": "yes",
        "image_overlay": {"url": "{{IMG:erklaerfilm-youtube.jpg}}", "id": "{{IMGID:erklaerfilm-youtube.jpg}}",
                          "alt": "Immobilien-Investment: Was passiert mit Ihrem Geld?", "source": "library", "size": ""},
        "show_play_icon": "yes",
        "lazy_load": "yes",
        "aspect_ratio": "169",
        "controls": "yes",
        "play_icon_color": WHITE,
    }, css="hs-video")


def linkedin_button(name, url):
    return widget("button", {
        "text": "LinkedIn",
        "link": {"url": url, "is_external": "on", "nofollow": "",
                 "custom_attributes": f"aria-label|{name} auf LinkedIn"},
        "selected_icon": {"value": "fab fa-linkedin-in", "library": "fa-brands"},
        "icon_align": "left", "icon_indent": px(8),
        "background_color": "transparent", "button_text_color": NAVY, "button_background_hover_color": "transparent",
        "hover_color": GOLD_700, "text_padding": box(6, 0), **type_(UI, 14, "600", 1, spacing=0.01),
    }, css="hs-linkedin")


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
    """Full-width photo with the headline (and the project label) on it; the rest of the intro below."""
    chip = tile([
        eyebrow("Abgeschlossenes Projekt"),
        text("<p><strong>Borgfelder Straße, Hamburg</strong><br>20 Wohnungen, alle verkauft</p>", size=14, line=1.5),
    ], pad=(18, 22), gap_px=6, max_width=300, css="hs-chip")
    photo_band = container([
        container([
            heading("Ihr Anteil an Wohnimmobilien. Ohne selbst zu kaufen.", "h1", size=64, mobile=36, color=NAVY, weight="700",
                    family=UI, line=1.08),
        ], css="hs-hero-title"),
        chip,
    ], inner=False, boxed=True, row=True, align="flex-end", justify="space-between", gap_px=32,
        pad=(220, 20, 64, 20), pad_mobile=(180, 16, 32, 16), min_h=680, min_h_mobile=520,
        bg_image="hero-wohnung.jpg", bg_pos="center 40%", css="hs-hero-photo")
    photo_band["settings"].update({
        "background_overlay_background": "gradient",
        "background_overlay_color": "rgba(14,19,56,0.88)",
        "background_overlay_color_stop": {"unit": "%", "size": 0, "sizes": []},
        "background_overlay_color_b": "rgba(14,19,56,0)",
        "background_overlay_color_b_stop": {"unit": "%", "size": 70, "sizes": []},
        "background_overlay_gradient_type": "linear",
        "background_overlay_gradient_angle": {"unit": "deg", "size": 0, "sizes": []},
        "flex_direction_mobile": "column", "flex_align_items_mobile": "flex-start",
    })
    intro = band([
        container([
            container([
                eyebrow("Mitglied werden in der Hanseatischen Invest eG", on_dark=True),
                heading("Unternehmerisch. Transparent. Nachvollziehbar.", "p", size=22, mobile=19, color=WHITE,
                        weight="600", family=UI, line=1.35),
                text("<p>Wir kaufen, modernisieren und verkaufen Wohnhäuser. Sie erhalten vorgesehene 7&nbsp;% Zinsen pro Jahr.*</p>", color=ON_NAVY, size=16),
                container([button("Jetzt informieren", "#kontakt"), light_button("So funktioniert's",
                                                                                 "#so-funktionierts")],
                          row=True, mobile_row=True, wrap=True, align="center", gap_px=12),
            ], width=54, gap_px=16),
            container([fact("10.000 €", "je Geschäftsanteil"), fact("7 % p. a.*", "vorgesehene Verzinsung"),
                       fact("je Quartal", "Auszahlung")],
                      row=True, mobile_row=True, justify="space-between", gap_px=12, width=38, css="hs-facts"),
        ], row=True, align="center", justify="space-between", gap_px=48),
    ], bg=NAVY, pad=(56, 20, 64, 20), pad_mobile=(40, 16, 48, 16))
    return [photo_band, intro]


TESTIMONIALS = [
    # Placeholders until the real quotes are in (name, since/place)
    ("Platzhalter für das Zitat eines Mitglieds: zwei bis drei Sätze, warum es Mitglied geworden ist und was es "
     "überzeugt hat.", "Name des Mitglieds", "Mitglied seit 20XX · Ort", "white"),
    ("Platzhalter für das Zitat eines Mitglieds: zum Beispiel über Transparenz, die Besichtigung der Häuser oder die "
     "erste Ausschüttung.", "Name des Mitglieds", "Mitglied seit 20XX · Ort", "gold"),
    ("Platzhalter für das Zitat eines Mitglieds: zum Beispiel über die persönliche Beratung und das "
     "Mitgliedertreffen.", "Name des Mitglieds", "Mitglied seit 20XX · Ort", "navy"),
]


def testimonials():
    cards = []
    for quote, name, meta, tone in TESTIMONIALS:
        bg, fg, sub, mark = {"white": (WHITE, NAVY, MUTED, GOLD_600), "gold": (GOLD, NAVY, NAVY_TEXT, NAVY),
                             "navy": (NAVY, WHITE, ON_NAVY_MUTED, GOLD_400)}[tone]
        cards.append(tile([
            heading("“", "p", size=120, mobile=96, color=mark, line=0.7),
            heading(quote, "p", size=26, mobile=22, color=fg, line=1.3),
            container([
                widget("html", {"html": f'<span class="hs-avatar hs-avatar--{tone}" aria-hidden="true"></span>'}),
                container([
                    heading(name, "p", size=15, mobile=15, color=fg, weight="700", family=UI, line=1.3),
                    heading(meta, "p", size=13, mobile=13, color=sub, weight="400", family=UI, line=1.4),
                ], gap_px=2),
            ], row=True, mobile_row=True, align="center", gap_px=14, css="hs-quote-author"),
        ], width=31.5, bg=bg, pad=(40, 36, 36, 36), pad_mobile=(32, 24, 28, 24), gap_px=20,
            justify="space-between", css=f"hs-quote hs-quote--{tone}"))
    return band([
        container([
            eyebrow("Stimmen unserer Mitglieder"),
            heading("Was unsere Mitglieder sagen", size=48, mobile=34, line=1.1),
        ], gap_px=14, align="center", css="hs-center"),
        spacer(32),
        container(cards, row=True, justify="space-between", align="stretch", gap_px=24),
    ], bg=CREAM, anchor="stimmen", gap_px=8)


def about():
    stats = [("45", "Mitarbeiter"), ("3", "Standorte"), ("2024", "Gründung der Genossenschaft"),
             ("5 Mio. €", "Kapital in der Genossenschaft (Mitte 2026)")]
    tiles = container([
        tile([
            heading(v, "p", size=54, mobile=40, line=1),
            text(f"<p>{label}</p>", color=MUTED, size=14),
        ], width=48.5, width_mobile=47, pad=(36, 32), pad_mobile=(24, 18), gap_px=8)
        for v, label in stats
    ], row=True, wrap=True, mobile_row=True, justify="space-between", gap_px=16, width=54, css="hs-row-wrap")
    return band([
        intro_row("Über uns", "Die Hanseatische Invest eG"),
        spacer(4),
        container([
            tiles,
            container([
                text("<p>Wir setzen das Kapital unserer Mitglieder in echten Wohnungsprojekten ein: transparent und partnerschaftlich.</p>", size=16),
                text("<p>__DROP__</p>", size=16),
                spacer(4),
                button("Kontakt aufnehmen", "#kontakt"),
            ], width=38, gap_px=14),
        ], row=True, align="center", justify="space-between", gap_px=48, reverse_mobile=True),
    ], bg=GREY_BG, anchor="ueber-uns", pad=(104, 20, 32, 20), pad_mobile=(64, 16, 24, 16))


def at_a_glance():
    bullets = ["Ein Anteil: 10.000 €, auch mehrere möglich", "Vorgesehene Verzinsung: 7 % p. a.*",
               "Auszahlung alle drei Monate", "Laufzeit 12 Monate, verlängert sich um je ein Jahr",
               "Keine Nachschusspflicht", "Steuer führen wir direkt ab"]
    return band([
        container([
            tile([
                eyebrow("Auf einen Blick"),
                heading("Kurz zusammengefasst: So funktioniert Ihre Beteiligung bei der Hanseatischen Invest eG.", "h3",
                        size=30, mobile=24, line=1.2),
                text("<p>Sie investieren gemeinsam mit anderen Mitgliedern in reale Wohnimmobilien, mit Chancen und Risiken.</p>", size=16),
                text("<p>* Die Verzinsung ist nicht garantiert.</p>", color=MUTED, size=12, line=1.5),
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
    """The book visual fills the band; headline and text sit on the open sky on the right."""
    return container([
        container([], width=46, width_mobile=100, css="hs-book-space"),
        container([
            eyebrow("Spiegel-Bestseller", on_dark=True),
            h2("Immobilien Investitionen leicht gemacht", WHITE),
            text("<p>Der Spiegel-Bestseller von Stephan Gerlach: Ihr Leitfaden für Immobilien als Kapitalanlage.</p>", color=WHITE, size=16),
            spacer(4),
            button("Zum Buchkauf", BOOK_URL, external=True),
        ], width=48, width_mobile=100, gap_px=14, css="hs-book-text"),
    ], inner=False, boxed=True, row=True, align="center", justify="space-between", gap_px=32,
        pad=(80, 20), pad_mobile=(0, 16, 48, 16), min_h=480, bg_image="buch-hintergrund.jpg", bg_pos="left center",
        bg="#3E6F8E", css="hs-book-band")


def capital_steps():
    """Four steps in a row on one gold line (vertical on phones): number, title, one sentence. No cards."""
    steps = [
        container([
            widget("html", {"html": f'<span class="hs-tl-dot" aria-hidden="true">{i + 1:02d}</span>'}, css="hs-tl-marker"),
            heading(title, "h3", size=28, mobile=24, line=1.2),
            text(f"<p>{body}</p>", size=15),
        ], width=23, width_mobile=100, gap_px=12, css="hs-tl-step")
        for i, (title, body) in enumerate(STEPS)
    ]
    return band([
        intro_row("Das Geschäftsmodell", "Wie aus Wohnhäusern Erträge werden.",
                  "Vier Schritte, immer in derselben Reihenfolge. Daraus kommt die Verzinsung.",
                  note="*Die Wertschöpfung entsteht durch operative Immobilienarbeit, nicht durch Finanzprodukte."),
        spacer(40),
        container(steps, row=True, justify="space-between", align="flex-start", gap_px=24, css="hs-timeline"),
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
                heading("Mehr Rendite, weniger Risiko. Kein Aufwand", size=30, mobile=24, color=WHITE, weight="700", family=UI,
                        line=1.2),
            ], width=38, gap_px=14),
            container([
                container([
                    image(f, alt, radius=0, width=84, lightbox=True, css_extra="hs-zoom"),
                    text(f"<p>{label}</p>", color=ON_NAVY, size=13, align="center", weight="600", line=1.4),
                ], width=31, width_mobile=31, align="center", gap_px=12)
                for f, alt, label in seals
            ], row=True, mobile_row=True, justify="space-between", gap_px=16, width=56),
        ], row=True, align="center", justify="space-between", gap_px=40),
    ], bg=NAVY, pad=(72, 20), pad_mobile=(56, 16))


def case_studies():
    cards = []
    for title, intro, more in CASES:
        photo = CASE_PHOTOS.get(title)
        cards.append(tile([
            image(photo[0], photo[1], radius=0, css_extra=f"hs-case-img {photo[2]}".strip())
            if photo else placeholder(f"Projektfoto {title}", "16/9"),
            container([
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
        panel([tile([video_box()], pad=(10,), pad_mobile=(8,), gap_px=0, css="hs-video-frame")], 56, side="l",
              bg="#EDF1F4", pad=(72, 56), gap_px=0),
        panel([
            eyebrow("Erklärfilm", on_dark=True),
            h2("Was passiert mit Ihrem Geld?", WHITE),
            text("<p>Wie Ihr Geld in echte Häuser fließt: vom Ankauf bis zum Verkauf.</p>", color=ON_NAVY, size=16),
            text("<p>Das Video wird erst beim Abspielen von YouTube geladen.</p>", color=ON_NAVY_MUTED, size=13),
            spacer(4),
            button("Persönlich beraten lassen", "#kontakt"),
        ], 44, side="r"),
    ], css="hs-video-band")


def team():
    cards = []
    for name, role, photo_file, bio in TEAM:
        cards.append(tile([
            image(photo_file, f"{name}, {role}", radius=0) if photo_file else placeholder(f"Foto {name}", "4/5"),
            container([
                heading(role, "p", size=12, mobile=12, color=GOLD_700, weight="600", family=UI, line=1.4),
                heading(name, "h3", size=26, mobile=24),
                text(f"<p>{bio}</p>", size=15),
                linkedin_button(name, TEAM_LINKEDIN.get(name, "#")),
            ], pad=(24, 28, 28, 28), pad_mobile=(20,), gap_px=8),
        ], width=31.5, pad=(0,), pad_mobile=(0,), gap_px=0, css="hs-card hs-team-card"))
    return band([
        intro_row(None, "Die Führungsspitze der Hanseatischen Invest eG", wide=True),
        spacer(24),
        container(cards, row=True, justify="space-between", align="stretch", gap_px=24),
    ], anchor="team", gap_px=8)


def press():
    return band([
        container([
            container([
                eyebrow("Presse"),
                h2("Öffentlichkeitsarbeit &amp; Artikel"),
                text("<p>Ausgewählte Artikel und Veröffentlichungen über uns.</p>", size=16),
                link_button("Zum Blog", BLOG_URL, external=True),
            ], width=50, gap_px=14, justify="center"),
            tile([image("presse-sueddeutsche.jpg", "Süddeutsche Zeitung: Stephan Gerlach von der Hanseatischen "
                        "Wohnungsgenossenschaft", radius=0, lightbox=True, css_extra="hs-zoom hs-press-img")],
                 width=34, pad=(0,), pad_mobile=(0,), css="hs-card"),
        ], row=True, align="center", justify="space-between", gap_px=48),
    ], bg=GREY_BG, pad=(56, 20), pad_mobile=(40, 16))


CASE_CHART = """
<figure class="hs-chart" aria-labelledby="hs-chart-cap">
  <div class="hs-chart__legend" aria-hidden="true">
    <span><i class="hs-sw hs-sw--base"></i>Kauf und Modernisierung</span>
    <span><i class="hs-sw hs-sw--gold"></i>Überschuss</span>
  </div>
  <div class="hs-chart__plot" aria-hidden="true">
    <div class="hs-chart__grid"><span style="left:0">0</span><span style="left:28.571%">2 Mio.</span><span style="left:57.143%">4 Mio.</span><span style="left:85.714%">6 Mio.</span></div>
    ROWS
  </div>
  <figcaption id="hs-chart-cap" class="hs-chart__note">Erlös aus den Einzelverkäufen = Kosten für Kauf und Modernisierung + Überschuss. Angaben der Gerlach Immobilien Gruppe, Stand September 2026.</figcaption>
  <div class="hs-sr-only"><table>
    <caption>Zwei abgeschlossene Projekte, Beträge in Euro</caption>
    <tr><th scope="col">Projekt</th><th scope="col">Kosten</th><th scope="col">Überschuss</th><th scope="col">Erlös</th></tr>
    <tr><th scope="row">Pinneberg, Im Bans</th><td>3,01 Mio.</td><td>1,02 Mio.</td><td>4,03 Mio.</td></tr>
    <tr><th scope="row">Hamburg, Borgfelder Straße</th><td>4,75 Mio.</td><td>1,8 Mio.</td><td>6,55 Mio.</td></tr>
  </table></div>
</figure>
"""

# (row label, total, [(segment label, value in Mio., tone, tooltip)])
CASE_ROWS = [
    ("Pinneberg · 18 Wohnungen", "4,03 Mio. €",
     [("Kosten 3,01 Mio. €", 3.01, "base", "Kauf und Modernisierung: 3,01 Mio. € (davon Ankauf 2,29 Mio. €)"),
      ("+1,02 Mio. €", 1.02, "gold", "Überschuss: 1,02 Mio. €")]),
    ("Hamburg-Borgfelde · 20 Wohnungen", "6,55 Mio. €",
     [("Kosten 4,75 Mio. €", 4.75, "base", "Kauf und Modernisierung: 4,75 Mio. €"),
      ("+1,8 Mio. €", 1.8, "gold", "Überschuss: 1,8 Mio. €")]),
]


def case_chart():
    scale = 7.0  # Mio. €, width of the plot
    rows = []
    for r, (label, total, segs) in enumerate(CASE_ROWS):
        bars, labels, start = [], [], 0.0
        for i, (seg, value, tone, tip) in enumerate(segs):
            width = value / scale * 100
            delay = r * 160 + i * 120
            bars.append(f'<span class="hs-seg hs-seg--{tone}" style="width:{width:.3f}%;--d:{delay}ms" tabindex="0" '
                        f'data-tip="{tip}"></span>')
            align = " hs-seg-label--end" if i == len(segs) - 1 else ""
            labels.append(f'<span class="hs-seg-label{align}" style="left:{start:.3f}%;width:{width:.3f}%">{seg}</span>')
            start += width
        rows.append(f'<div class="hs-chart__row"><div class="hs-chart__head"><span>{label}</span><strong>{total}</strong></div>'
                    f'<div class="hs-chart__bar">{"".join(bars)}</div><div class="hs-chart__labels">{"".join(labels)}</div></div>')
    return widget("html", {"html": CASE_CHART.replace("ROWS", "".join(rows))}, css="hs-chart-widget")


def case_numbers():
    return band([
        container([
            container([
                eyebrow("In Zahlen", on_dark=True),
                h2("Woher der Überschuss kommt", WHITE),
                text("<p>Der Erlös deckt Kauf und Modernisierung. Was darüber hinausgeht, ist der Überschuss.</p>",
                     color=ON_NAVY, size=15),
                text("<p>* Zahlen aus der Vergangenheit sind keine Zusage für künftige Ergebnisse.</p>",
                     color=ON_NAVY_MUTED, size=13),
            ], width=38, gap_px=14),
            container([case_chart()], width=56),
        ], row=True, align="center", justify="space-between", gap_px=48),
    ], bg=NAVY)


SUBSIDIARIES = [
    ("logo-gig.png", "Gerlach Immobilien Gruppe", "https://gerlachgroup.de/"),
    ("logo-hanseatische-wohnungsgenossenschaft.png", "Hanseatische Wohnungsgenossenschaft",
     "https://www.diefamiliengenossenschaft.de/"),
    ("logo-hansea-grow.png", "Hansea Grow", "https://www.hanseagrow.de/"),
    ("logo-kapitalanlagevertrieb.png", "Kapitalanlagevertrieb.de", "https://kapitalanlagevertrieb.de/"),
]


def subsidiaries():
    tiles = [
        tile([widget("image", {
            "image": {"url": "{{IMG:%s}}" % f, "id": "{{IMGID:%s}}" % f, "alt": name, "source": "library", "size": ""},
            "image_size": "full", "align": "center",
            "link_to": "custom", "link": {"url": url, "is_external": "on", "nofollow": "",
                                          "custom_attributes": f"aria-label|{name} (öffnet neue Seite)"},
        }, css="hs-sub-logo")],
            width=23.5, width_mobile=48, bg=WHITE, pad=(28, 24), pad_mobile=(20, 14), gap_px=14, justify="center",
            css="hs-sub-tile")
        for f, name, url in SUBSIDIARIES
    ]
    return band([
        container([
            eyebrow("Unsere Marken"),
            h2("Tochterunternehmen"),
            text("<p>Unsere Marken decken die ganze Kette ab, vom Ankauf bis zum Verkauf.</p>", size=16),
        ], max_width=680, gap_px=14),
        spacer(24),
        container(tiles, row=True, wrap=True, mobile_row=True, justify="space-between", align="stretch", gap_px=16,
                  css="hs-row-wrap"),
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


# Handball player in a jump throw, line art in gold at low opacity behind the sponsoring band
SPONSOR_WATERMARK = (
    '<svg class="hs-wm-player" viewBox="0 0 400 520" aria-hidden="true" focusable="false">'
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
    # court arc (6 m line) and goal area hint
    '<path d="M-40 500 Q200 380 440 500" stroke-width="6" stroke-dasharray="2 22"/>'
    # body
    '<g stroke-width="34">'
    '<path d="M196 168 L176 288"/>'                 # torso
    '<path d="M196 178 L262 120 L300 58"/>'         # throwing arm up
    '<path d="M190 186 L132 214 L104 182"/>'        # other arm
    '<path d="M176 288 L230 338 L212 420"/>'        # front leg, bent
    '<path d="M176 288 L134 360 L72 386"/>'         # back leg kicked back
    '</g>'
    '</g>'
    '<g fill="currentColor"><circle cx="214" cy="120" r="30"/>'  # head
    '<circle cx="318" cy="34" r="26" fill="none" stroke="currentColor" stroke-width="8"/>'  # ball
    '<path d="M296 26 Q318 46 340 26 M318 8 L318 60" fill="none" stroke="currentColor" stroke-width="5"/></g>'
    '</svg>'
)

# One image for now; more photos are added to the same carousel in Elementor later
SPONSOR_GALLERY = ["sponsoring-handball-trikot.jpg"]


def sponsoring():
    """Hansea Invest Sponsoring, directly below "Über uns": text left, swipeable gallery right."""
    gallery = widget("image-carousel", {
        "carousel": [{"id": "{{IMGID:%s}}" % f, "url": "{{IMG:%s}}" % f} for f in SPONSOR_GALLERY],
        "thumbnail_size": "full",
        "slides_to_show": "1", "slides_to_show_tablet": "1", "slides_to_show_mobile": "1",
        "slides_to_scroll": "1",
        "navigation": "both",
        "image_stretch": "yes",
        "link_to": "file", "open_lightbox": "yes",
        "autoplay": "yes", "autoplay_speed": 4500, "pause_on_hover": "yes", "pause_on_interaction": "yes",
        "infinite": "yes", "speed": 600,
        "arrows_size": px(22), "arrows_color": WHITE,
        "dots_size": px(8), "dots_color": "rgba(255,255,255,0.35)", "dots_color_active": GOLD,
        "image_border_radius": box(8),
    }, css="hs-gallery")
    return band([
        container([
            container([
                eyebrow("Hansea Invest Sponsoring", on_dark=True),
                heading("Wir sind stolzer Sponsor des HSV Handball Hamburg", size=48, mobile=34, color=WHITE,
                        line=1.08),
                text("<p>Teamgeist, Fairness und Leistung: Werte, die auch unsere Genossenschaft tragen.</p>", color=ON_NAVY,
                     size=16),
            ], width=50, gap_px=16),
            container([gallery], width=42, css="hs-spons-media"),
        ], row=True, align="center", justify="space-between", gap_px=48),
        widget("html", {"html": SPONSOR_WATERMARK}, css="hs-watermark"),
    ], bg=NAVY, anchor="sponsoring", gap_px=8, css="hs-sponsor-band")


# ---------------------------------------------------------------- brochure sections

def caption(t, on_dark=False):
    return text(f"<p>{t}</p>", color=ON_NAVY_MUTED if on_dark else MUTED, size=13, line=1.5)


def kv_table(rows, *, on_dark=False, title=None):
    """Label/value list (definition list); a value may contain <br> and <small>."""
    items = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in rows)
    head = f'<p class="hs-kv__title">{title}</p>' if title else ""
    tone = " hs-kv--dark" if on_dark else ""
    return widget("html", {"html": f'<div class="hs-kv{tone}">{head}<dl>{items}</dl></div>'})


def einstieg():
    """Split band: the question on the left, the answer ("Ein anderer Weg") filling the cream right half."""
    return split([
        panel([
            h2("Warum so viele Immobilien wollen und so wenige dazu kommen."),
            text("<p>Viele wollen Immobilien, aber nicht den Aufwand. Eine eigene Wohnung bindet Sie an ein Objekt, "
                 "einen Kredit und die Rolle als Vermieter.</p>", size=16),
        ], 50, side="l", bg=WHITE, pad=(104, 64)),
        panel([
            heading("Ein anderer Weg", "h3", size=36, mobile=28, line=1.2),
            text("<p>Sie werden Mitglied einer Genossenschaft, die in Wohnimmobilien investiert. Ohne Kredit, ohne "
                 "Vermieten. <strong>Ein Anteil: 10.000&nbsp;€.</strong></p>", size=17),
        ], 50, side="r", bg=CREAM, pad=(104, 64)),
    ], anchor="einstieg")


def photo_break(name, pos="center center"):
    """Full-width photo with no text: a pause between sections."""
    return container([], inner=False, min_h=560, min_h_mobile=280, bg_image=name, bg_pos=pos, css="hs-photo-break")


def quote_band():
    return band([
        heading("„Was einer allein nicht schafft, das schaffen viele.“", "p", size=64, mobile=36, line=1.12,
                align="center"),
        heading("Friedrich Wilhelm Raiffeisen, Begründer des Genossenschaftswesens", "p", size=14, mobile=13,
                color=GOLD_700, weight="600", family=UI, line=1.4, align="center"),
    ], bg=CREAM, pad=(120, 20), pad_mobile=(72, 16), gap_px=20, max_width=980)


def genossenschaft():
    points = [("Eingetragen und geprüft", "Eine eingetragene Genossenschaft gehört ihren Mitgliedern und wird vom "
               "Prüfungsverband geprüft."),
              ("Ihre Rolle als Mitglied", "Sie stellen Geld zur Verfügung und erhalten Zinsen. Kein Stimmrecht, keine "
               "Pflichten im Betrieb."),
              ("Keine Nachzahlungen", "Eine Nachschusspflicht besteht nicht. So steht es in der Satzung.")]
    return band([
        intro_row("Die Genossenschaft", "Was eine Genossenschaft für Sie bedeutet.",
                  "Gesetzlich streng geregelt und jährlich geprüft.", wide=True),
        spacer(12),
        container([
            container([heading(t, "h3", size=26, mobile=22, line=1.2), text(f"<p>{b}</p>", size=16)],
                      width=31, gap_px=10, css="hs-step-plain")
            for t, b in points
        ], row=True, align="flex-start", justify="space-between", gap_px=32),
    ], bg=GREY_BG, anchor="genossenschaft", gap_px=12)


def unternehmen():
    stats = [("1.000+", "Wohneinheiten", "seit Gründung der Gruppe"),
             ("100+ Mio. €", "Transaktionsvolumen", "seit Gründung der Gruppe"),
             ("300+", "verkaufte Wohnungen", "allein im Jahr 2024")]
    return band([
        intro_row("Das Unternehmen", "Die Genossenschaft ist jung. Das Unternehmen dahinter ist es nicht.",
                  "Dahinter steht die Gerlach Immobilien Gruppe aus Hamburg.",
                  wide=True),
        spacer(12),
        container([
            container([
                text("<p>Die Gruppe kauft Mehrfamilienhäuser, modernisiert sie und verkauft die Wohnungen einzeln.</p>", size=16),
                text("<p>__DROP__</p>", size=16),
            ], width=48, gap_px=8),
            container([
                heading("Warum das für Sie zählt", "h3", size=26, mobile=22, line=1.2),
                text("<p>Ein erprobtes Geschäftsmodell mit erfahrenen Leuten. Vergangene Zahlen sind keine Zusage.</p>", size=16),
            ], width=46, gap_px=12),
        ], row=True, align="flex-start", justify="space-between", gap_px=32),
        spacer(12),
        container([
            container([
                heading(v, "p", size=64, mobile=44, line=1),
                heading(label, "p", size=15, mobile=15, color=NAVY, weight="600", family=UI, line=1.3),
                text(f"<p>{sub}</p>", color=MUTED, size=13, line=1.4),
            ], width=31, pad=(20, 0, 0, 0), gap_px=8, css="hs-figure")
            for v, label, sub in stats
        ], row=True, justify="space-between", align="stretch", gap_px=20),
        spacer(16),
        image("brosch-kiel.jpg", "Mühlenweg in Kiel: Visualisierung der Gerlach Immobilien Gruppe", radius=8,
              css_extra="hs-wide-img"),
        caption("Mühlenweg in Kiel: 21 Wohnungen und 6 Garagen, Verkauf abgeschlossen. Visualisierung der Gruppe."),
    ], anchor="unternehmen", gap_px=12)


# Target cities on the map: name, x, y in the 600 x 760 viewBox of GERMANY_PATH
# (converted from longitude/latitude, calibrated on the project pins of the member portal)
CITIES = [("Hamburg", 269.9, 154.3), ("Berlin", 469.4, 250.9), ("Düsseldorf", 81.2, 371.8, -8),
          ("Köln", 91.9, 399.0, 16), ("Leipzig", 408.8, 361.5), ("Frankfurt", 192.5, 476.8),
          ("Stuttgart", 221.8, 601.5), ("München", 362.5, 661.5)]  # optional 4th value: label baseline

def germany_map():
    paths_ts = (Path(__file__).resolve().parent.parent / "src/data/paths.ts").read_text()
    outline = re.search(r"GERMANY_PATH =\s*'([^']+)'", paths_ts).group(1)
    dots = "".join(
        f'<g class="hs-map-city" transform="translate({x} {y})"><circle r="15" class="hs-map-halo"/>'
        f'<circle r="7" class="hs-map-dot"/><text x="16" y="{c[3] if len(c) > 3 else 6}">{name}</text></g>'
        for c in CITIES for name, x, y in [c[:3]])
    names = ", ".join(c[0] for c in CITIES)
    return widget("html", {"html": (
        f'<figure class="hs-map"><svg viewBox="0 0 600 760" role="img" aria-label="Deutschlandkarte mit den '
        f'Zielregionen {names}"><path d="{outline}" class="hs-map-land"/>{dots}</svg>'
        '<figcaption>Unsere Zielregionen: die deutschen A-Städte und Wachstumsregionen mit stabiler Nachfrage.'
        '</figcaption></figure>')}, css="hs-map-widget")


def standorte():
    return band([
        container([
            container([
                eyebrow("Standorte"),
                h2("Wo wir investieren."),
                text("<p>Wir kaufen dort, wo Menschen hinziehen und bleiben: in A-Städten und Wachstumsregionen.</p>", size=16),
                text("<p>__DROP__</p>", size=16),
                text("<p>__DROP__</p>", size=16),
                tile([
                    heading("Streuung statt Wette", "h3", size=24, mobile=22, line=1.2),
                    text("<p>Das Kapital verteilt sich auf mehrere Projekte an verschiedenen Standorten.</p>", size=15),
                ], pad=(28,), pad_mobile=(22, 20), gap_px=8),
            ], width=50, gap_px=14),
            container([germany_map()], width=44),
        ], row=True, align="center", justify="space-between", gap_px=40),
    ], bg=GREY_BG, anchor="standorte", gap_px=12)


PROJECTS = [
    ("Pinneberg, Im Bans.", "projekt-pinneberg.jpg", "Im Bans in Pinneberg. Foto: Gerlach Immobilien Gruppe",
     "Ein Mehrfamilienhaus vor den Toren Hamburgs, vom Ankauf bis zur letzten Wohnung.",
     ("1,02 Mio. €", "Überschuss nach allen Kosten von 3,01 Mio. €"),
     ("4,03 Mio. €", "Erlös aus dem Verkauf, 18 Wohnungen einzeln verkauft"),
     [("Adresse", "Im Bans, 25421 Pinneberg"), ("Wohnungen", "18"), ("Wohnfläche", "ca. 1.220 m²"),
      ("Baujahr", "1965"), ("Modernisiert", "2025 bis 2026"), ("Vertrieb ab", "Januar 2026"),
      ("Alle verkauft", "September 2026")],
     ["Baujahr 1965, Sackgasse mit altem Baumbestand. 18 Wohnungen, alle mit Balkon, in neun Monaten verkauft.",
      "__DROP__",
      "__DROP__"]),
    ("Hamburg, Borgfelder Straße.", "projekt-borgfelder.jpg", "Borgfelder Straße in Hamburg. Foto: Gerlach Immobilien Gruppe",
     "Mitten in Hamburg, zwischen Hauptbahnhof und Hamm.",
     ("1,8 Mio. €", "Überschuss nach allen Kosten von 4,75 Mio. €"),
     ("6,55 Mio. €", "Erlös aus dem Verkauf, 20 Wohnungen einzeln verkauft"),
     [("Adresse", "Borgfelder Straße, 20537 Hamburg"), ("Wohnungen", "20"), ("Wohnfläche", "ca. 1.159 m²"),
      ("Baujahr", "1955"), ("Modernisiert", "2015 bis 2018"), ("Vertrieb ab", "August 2025"),
      ("Alle verkauft", "April 2026")],
     ["Baujahr 1955, Aufzug, viele Balkone nach Süden. 20 Wohnungen in acht Monaten verkauft.",
      "__DROP__",
      "__DROP__"]),
]


def projektbeispiele():
    rows = []
    for i, (title, img, alt, lead, surplus, revenue, facts, paras) in enumerate(PROJECTS):
        media = container([
            image(img, alt, radius=8, css_extra="hs-project-img"),
            caption(alt),
        ], width=36, gap_px=8)
        figures = container([
            tile([heading(v, "p", size=34, mobile=26, color=fg, line=1),
                  text(f"<p>{label}</p>", color=sub, size=13, line=1.4)],
                 width=48.5, width_mobile=47, bg=bg, pad=(24,), pad_mobile=(16, 14), gap_px=8, css="hs-tile--flat")
            for (v, label), bg, fg, sub in [(surplus, NAVY, GOLD_400, ON_NAVY), (revenue, CREAM, NAVY, NAVY_TEXT)]
        ], row=True, mobile_row=True, justify="space-between", align="stretch", gap_px=12)
        body = container([
            heading(title, "h3", size=36, mobile=28, line=1.15),
            text(f"<p>{lead}</p>", size=16),
            figures,
            container([
                container([text("".join(f"<p>{t}</p>" for t in paras if t != DROP), size=15)], width=56),
                container([kv_table(facts)], width=40),
            ], row=True, align="flex-start", justify="space-between", gap_px=24),
        ], width=60, gap_px=14)
        rows.append(container([media, body] if i % 2 == 0 else [body, media], row=True, align="flex-start",
                              justify="space-between", gap_px=40, reverse_mobile=i % 2 == 1))
        if i < len(PROJECTS) - 1:
            rows.append(widget("divider", {"color": LINE, "gap": px(32)}))
    return band([
        intro_row("Projektbeispiele", "Vom Ankauf bis zur letzten verkauften Wohnung",
                  "Zwei abgeschlossene Projekte der Gerlach Immobilien Gruppe, mit allen Zahlen."),
        spacer(24),
        *rows,
    ], anchor="projekte", gap_px=12)


def mittelverwendung():
    path = [("01", "Sie übernehmen", "einen oder mehrere Anteile zu je 10.000 Euro"),
            ("02", "Wir investieren", "in laufende Wohnungsprojekte"),
            ("03", "Wir entwickeln", "modernisieren, vermieten, verkaufen"),
            ("04", "Sie erhalten", "alle drei Monate Ihre Zinsen")]
    blocks = [("Ihr Geld geht in laufende Projekte",
               "Ihr Geld fließt über die Genossenschaft in Wohnungsprojekte."),
              ("Aus dem Verkauf kommt das Geld zurück",
               "Der Erlös deckt die Kosten. Der Rest ist Überschuss."),
              ("Daraus wird Ihre Verzinsung bedient",
               "Daraus zahlen wir Ihre Zinsen. Deshalb sind sie nicht garantiert.")]
    return band([
        intro_row("Mittelverwendung", "Wohin Ihr Geld fließt.",
                  "Die häufigste Frage, kurz beantwortet."),
        spacer(16),
        container([
            container([heading(t, "h3", size=24, mobile=22, line=1.2), text(f"<p>{b}</p>", size=15)],
                      width=31.5, gap_px=10)
            for t, b in blocks
        ], row=True, justify="space-between", align="flex-start", gap_px=24),
        spacer(24),
        heading("Sie übernehmen Anteile, wir investieren und entwickeln, Sie erhalten alle drei Monate Ihre Zinsen.",
                "p", size=30, mobile=24, line=1.25, css_class="hs-statement"),
        spacer(16),
        image("brosch-mittelverwendung.jpg", "Mehrfamilienhaus der Gerlach Immobilien Gruppe", radius=8,
              css_extra="hs-wide-img"),
    ], anchor="mittelverwendung", gap_px=12)


def konditionen():
    terms = [("Ein Anteil", "10.000 €"),
             ("Zinsen", "7 % pro Jahr vorgesehen<br><small>§ 10 der Allgemeinen Geschäftsordnung</small>"),
             ("Auszahlung", "alle drei Monate"),
             ("Laufzeit", "12 Monate<br><small>verlängert sich um je ein Jahr</small>"),
             ("Kündigungsfrist", "9 Monate vor Ablauf"), ("Steuer auf Zinsen", "führen wir direkt ab"),
             ("Nachzahlungen", "keine"),
             ("Club der Kapitalanleger", "Mitgliedschaft inklusive,<br>ohne Zusatzkosten")]
    return band([
        intro_row("Konditionen", "Ihre Konditionen im Überblick.",
                  "Das Wichtigste aus Satzung und Geschäftsordnung."),
        spacer(12),
        container([
            container([
                text("<p>Ein Anteil kostet 10.000&nbsp;€. Vorgesehen sind 7&nbsp;% Zinsen pro Jahr, ausgezahlt alle drei Monate.</p>",
                     size=16),
                text("<p>Laufzeit zwölf Monate, Kündigung bis neun Monate vor Ablauf. Keine Nachschüsse.</p>", size=16),
                text("<p>__DROP__</p>",
                     size=16),
                spacer(4),
                button("Persönlich beraten lassen", "#kontakt"),
            ], width=48, gap_px=8),
            tile([kv_table(terms, title="Die Bedingungen in Kurzform")], width=46, pad=(32,), pad_mobile=(22, 18)),
        ], row=True, align="flex-start", justify="space-between", gap_px=32),
    ], bg=GREY_BG, anchor="konditionen", gap_px=12)


def mitglied_werden():
    steps = [("01", "Gespräch vereinbaren",
              "30 Minuten, telefonisch oder per Video."),
             ("02", "Unterlagen erhalten",
              "Beitrittsformular, Satzung, Geschäfts- und Beitragsordnung."),
             ("03", "Beitreten",
              "Formular zurücksenden, Anteil einzahlen. Der Aufsichtsrat entscheidet über die Aufnahme.")]
    return band([
        intro_row("Mitglied werden", "So werden Sie Mitglied.",
                  "Drei Schritte, ein Gespräch dazwischen. Den Rest erledigen wir für Sie."),
        spacer(16),
        container([
            container([
                container([heading(t, "h3", size=24, mobile=22, line=1.2), text(f"<p>{b}</p>", size=15)],
                          gap_px=6, css="hs-step-plain")
                for _, t, b in steps
            ], width=54, gap_px=24),
            tile([
                eyebrow("Ihr persönlicher Kontakt", on_dark=True),
                heading("Cornelia Richter", "h3", size=32, mobile=28, color=WHITE, line=1.15),
                text("<p>Mitgliederservice · Hanseatische Invest eG</p>", color=ON_NAVY, size=15),
                icon_list([("cr@gerlachgroup.de", "mailto:cr@gerlachgroup.de"),
                           ("mitgliederservice@hanseainvest.de", "mailto:mitgliederservice@hanseainvest.de"),
                           ("+49 40 22862372-0", "tel:+4940228623720")],
                          color=WHITE, icon="fas fa-arrow-right", icon_color=GOLD_400, size=15, weight="500",
                          gap_px=12),
                spacer(4),
                button("Termin buchen", BOOKING_URL, external=True),
                text("<p>30 Minuten, Telefon oder Video</p>", color=ON_NAVY_MUTED, size=13),
            ], width=40, bg=NAVY, pad=(40,), pad_mobile=(28, 20), gap_px=12),
        ], row=True, align="flex-start", justify="space-between", gap_px=40),
    ], anchor="mitglied-werden", gap_px=12)


def contact():
    """Light contact band (white text side, grey form side) so it stands off the navy footer."""
    return split([
        panel([
            eyebrow("Kontakt"),
            h2("Sprechen Sie mit uns"),
            text("<p>Fragen oder ein persönliches Gespräch? Wir melden uns gern.</p>", size=16),
            spacer(8),
            icon_list([("+49 40 22862372-0", "tel:+4940228623720"),
                       ("mitgliederservice@hanseainvest.de", "mailto:mitgliederservice@hanseainvest.de"),
                       ("Langenhorner Chaussee 155, 22415 Hamburg", None)],
                      color=NAVY, icon="fas fa-arrow-right", icon_color=GOLD_600, size=15, weight="500", gap_px=14),
        ], 42, side="l", bg=WHITE, justify="flex-start"),
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
                image(None, "Hansea Invest eG", radius=0, url="{{THEME}}/images/logo-white.svg", width=84, align="left"),
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
    return [header(), *hero(), about(), at_a_glance(), einstieg(), photo_break("brosch-wohnanlage.jpg"), genossenschaft(),
            quote_band(), sponsoring(), unternehmen(),
            capital_steps(), trust(), projektbeispiele(), case_numbers(), photo_break("brosch-stadt.jpg", "center 60%"), standorte(),
            mittelverwendung(), konditionen(), book(), webinar(), team(), press(), subsidiaries(), faq(),
            mitglied_werden(), testimonials(), contact(), footer()]


if __name__ == "__main__":
    data = build()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print(f"wrote {OUT} ({len(data)} sections)")
