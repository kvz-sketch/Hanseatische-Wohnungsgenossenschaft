"""Builds the 12 Hörbuch ads from one layout spec.

    python3 creatives.py <canvas_project_dir>

writes
  - <canvas_project_dir>/<name>.dc.html   artboards for the Design canvas
    (images by their canvas upload urls, CTA = the GIG design system Button)
  - preview/<name>.html                   the same ad as a plain page for
    render.mjs (local images, a look-alike button), which makes ../png/.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

CANVAS_IMG = {
    'logo_w': '/_blob/82fdfd5f8c49cd80dfd22641f5b605cc',
    'logo_n': '/_blob/174969af013a3d2f8fa223ad9955c3ac',
    'photo': '/_blob/663298861e08f39c23c8a144d32349a1',
    'bg': '/_blob/ac87b16eb25e41566c55069aadce9aba',
    'book': '/_blob/de1213932a2523b61e6fee8210df7795',
    'badge': '/_blob/5b979248576b4d9195e15814b42b93bd',
}
PREVIEW_IMG = {
    'logo_w': '../../../assets/logo-hwg-weiss.png',
    'logo_n': '../../../assets/logo-hwg-navy.png',
    'photo': '../../../assets/stephan-gerlach-portraet.jpg',
    'bg': '../../../assets/stadt-hintergrund.jpg',
    'book': '../../../assets/buch-mockup.png',
    'badge': '../../../assets/spiegel-bestseller.png',
}

NAVY = '12,16,48'
OV_H = f'linear-gradient(90deg, rgba({NAVY},0.95) 0%, rgba({NAVY},0.88) 45%, rgba({NAVY},0.40) 72%, rgba({NAVY},0.15) 100%)'
OV_V = f'linear-gradient(180deg, rgba({NAVY},0.95) 0%, rgba({NAVY},0.85) 36%, rgba({NAVY},0.45) 62%, rgba({NAVY},0.88) 100%)'
OV_B_H = f'linear-gradient(90deg, rgba({NAVY},0.96) 0%, rgba({NAVY},0.90) 50%, rgba({NAVY},0.70) 100%)'
OV_B_V = f'linear-gradient(180deg, rgba({NAVY},0.96) 0%, rgba({NAVY},0.90) 45%, rgba({NAVY},0.75) 100%)'

SNOW_CSS = ('.snow{background-image:radial-gradient(3px 3px at 8% 12%, rgba(255,255,255,.55) 50%, transparent 51%),'
            'radial-gradient(2px 2px at 28% 40%, rgba(255,255,255,.5) 50%, transparent 51%),'
            'radial-gradient(4px 4px at 46% 18%, rgba(255,255,255,.4) 50%, transparent 51%),'
            'radial-gradient(2px 2px at 64% 52%, rgba(255,255,255,.5) 50%, transparent 51%),'
            'radial-gradient(3px 3px at 86% 30%, rgba(255,255,255,.4) 50%, transparent 51%);background-size:240px 200px}')

LEGAL = 'Kostenloses Hörbuch per E-Mail-Download. Keine Anlageberatung.'
BOOK_ALT = 'Buch „Immobilien-Investitionen leicht gemacht“ von Stephan Gerlach'


class Ctx:
    def __init__(self, canvas):
        self.canvas = canvas
        self.img = CANVAS_IMG if canvas else PREVIEW_IMG

    def button(self, label, zoom, variant='gold', extra=''):
        if self.canvas:
            inner = (f'<x-import component-from-global-scope="GerlachGIGDesignSystem_9efe8b.Button" '
                     f'variant="{variant}" size="lg">{label}</x-import>')
        else:
            inner = f'<span class="pbtn">{label}</span>'
        return f'<div style="zoom: {zoom};{extra}">\n      {inner}\n    </div>'


def bg_layers(c, objpos, overlay, snow):
    s = (f'  <img src="{c.img["bg"]}" alt="" style="position: absolute; inset: 0; width: 100%; height: 100%; '
         f'object-fit: cover; object-position: {objpos};">\n'
         f'  <div style="position: absolute; inset: 0; background: {overlay};"></div>\n')
    if snow:
        s += '  <div class="snow" style="position: absolute; inset: 0;"></div>\n'
    return s


def book(c, style):
    """The book cutout plus the SPIEGEL-Bestseller badge on its lower left.
    Its parent must be positioned (the badge is placed against it)."""
    w = int(style.split('width:')[1].split('px')[0])
    return (f'<img src="{c.img["book"]}" alt="{BOOK_ALT}" style="display: block; {style} height: auto; '
            f'filter: drop-shadow(0 30px 36px rgba(0,0,0,0.55));">\n    '
            f'<img src="{c.img["badge"]}" alt="SPIEGEL-Bestseller" style="position: absolute; left: {-round(w * 0.07)}px; '
            f'bottom: {round(w * 0.10)}px; width: {round(w * 0.40)}px; height: auto; transform: rotate(-6deg); '
            f'filter: drop-shadow(0 10px 18px rgba(0,0,0,0.45));">')


def coin(size, style):
    big = round(size * 0.36)
    small = round(size * 0.095)
    return (f'<div style="position: absolute; {style} width: {size}px; height: {size}px; border-radius: 50%; '
            f'background: var(--gig-gold); color: var(--gig-navy); display: flex; flex-direction: column; '
            f'align-items: center; justify-content: center; transform: rotate(12deg); box-shadow: 0 8px 20px rgba(0,0,0,0.35);">\n'
            f'      <span style="font-family: var(--font-display); font-weight: 600; font-size: {big}px; line-height: 0.9;">0 €</span>\n'
            f'      <span style="margin-top: 4px; font-size: {small}px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;">Gratis</span>\n'
            f'    </div>')


def pill(text, size, pad):
    return (f'<span style="padding: {pad}; border-radius: 999px; background: #9E2B3A; font-size: {size}px; '
            f'font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">{text}</span>')


def logo(c, h, extra=''):
    return (f'<img src="{c.img["logo_w"]}" alt="Hanseatische Wohnungsgenossenschaft · Gerlach Immobilien Gruppe" '
            f'style="display: block; height: {h}px; width: auto;{extra}">')


def eyebrow(text, size):
    return (f'<span style="font-size: {size}px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; '
            f'color: var(--gold-400);">{text}</span>')


def h1(html, size):
    # Inter, bold; sizes in the layouts are given for the display face, Inter runs wider.
    return (f'<h1 style="margin: 0; font-family: var(--font-ui); font-weight: 700; font-size: {round(size * 0.78)}px; '
            f'line-height: 1.1; letter-spacing: -0.02em;">{html}</h1>')


def sub(text, size, extra=''):
    return f'<p style="margin: 0; font-size: {size}px; line-height: 1.4; color: rgba(255,255,255,0.88);{extra}">{text}</p>'


def chips(size, pad, gap, center=False):
    jc = ' justify-content: center;' if center else ''
    one = lambda t: (f'<span style="padding: {pad}; border: 1px solid rgba(221,184,81,0.6); border-radius: 6px; '
                     f'font-size: {size}px; background: rgba({NAVY},0.45);">{t}</span>')
    return (f'<div style="display: flex; flex-wrap: wrap; gap: {gap}px;{jc}">\n        '
            + '\n        '.join(one(t) for t in ('Unterm Baum', 'Im Auto', 'Beim Spaziergang')) + '\n      </div>')


def legal(style, size):
    return f'<p style="position: absolute; {style} margin: 0; font-size: {size}px; color: rgba(255,255,255,0.6);">{LEGAL}</p>'


EM = 'font-style: normal; color: var(--gold-400);'
COPY = {
    'a': dict(eyebrow='Unser Weihnachtsgeschenk an Sie', pill='Weihnachtsaktion',
              h1=f'Das Hörbuch zum Bestseller. <em style="{EM}">Gratis.</em>',
              sub='„Immobilien-Investitionen leicht gemacht“ von Stephan Gerlach. Sicher investieren, mit klarem Plan.',
              sub_short='„Immobilien-Investitionen leicht gemacht“ von Stephan Gerlach.',
              cta='Hörbuch gratis sichern', objpos='50% 50%'),
    'c': dict(eyebrow='Für die Tage zwischen den Jahren', pill='Kostenlos',
              h1=f'Kopfhörer auf. <em style="{EM}">Plan fürs Immobilien-Vermögen</em> an.',
              cta='Hörbuch gratis anhören', objpos='50% 50%'),
    'b': dict(eyebrow='SPIEGEL-Bestseller jetzt als Hörbuch',
              h1=f'Mein Geschenk für Ihre <em style="{EM}">Weihnachtstage.</em>',
              sub='Wie Sie mit Immobilien sicher Vermögen aufbauen. Kompakt zum Anhören.',
              cta='Gratis-Hörbuch anfordern', objpos='50% 50%'),
}


# ---------- concepts A and C (background + book) ----------

def ac_square(c, k):
    t = COPY[k]
    mid = sub(t['sub'], 26) if k == 'a' else chips(20, '9px 16px', 12)
    return (bg_layers(c, t['objpos'], OV_H, True) + f'''  <div style="position: absolute; left: 70px; right: 70px; top: 60px; display: flex; justify-content: space-between; align-items: center;">
    {logo(c, 110)}
    {pill(t['pill'], 20, '12px 24px')}
  </div>
  <div style="position: absolute; left: 70px; top: 310px; width: 520px; display: flex; flex-direction: column; gap: 24px;">
    {eyebrow(t['eyebrow'], 20)}
    {h1(t['h1'], 72 if k == 'a' else 66)}
    {mid}
    {c.button(t['cta'], 1.8, extra=' align-self: flex-start; margin-top: 8px;')}
  </div>
  <div style="position: absolute; left: 640px; top: 380px;">
    {book(c, 'width: 400px;')}
    {coin(140, 'right: -10px; top: -70px;')}
  </div>
  {legal('left: 70px; bottom: 40px;', 15)}
''')


def ac_portrait(c, k):
    t = COPY[k]
    mid = sub(t['sub'], 27, ' max-width: 860px;') if k == 'a' else chips(22, '10px 18px', 14, center=True)
    return (bg_layers(c, t['objpos'], OV_V, True) + f'''  <div style="position: absolute; left: 70px; right: 70px; top: 56px; display: flex; justify-content: space-between; align-items: center;">
    {logo(c, 110)}
    {pill(t['pill'], 20, '12px 24px')}
  </div>
  <div style="position: absolute; left: 70px; right: 70px; top: 220px; bottom: 90px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center;">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
      {eyebrow(t['eyebrow'], 21)}
      {h1(t['h1'], 80)}
      {mid}
    </div>
    <div style="position: relative;">
      {book(c, 'width: 520px;')}
      {coin(140, 'right: -60px; top: -40px;')}
    </div>
    {c.button(t['cta'], 2)}
  </div>
  {legal('left: 0; right: 0; bottom: 36px; text-align: center;', 15)}
''')


def ac_story(c, k):
    t = COPY[k]
    mid = sub(t['sub_short'], 34) if k == 'a' else chips(28, '12px 22px', 16, center=True)
    return (bg_layers(c, t['objpos'], OV_V, True) + f'''  <div style="position: absolute; left: 0; right: 0; top: 100px; display: flex; justify-content: center;">
    {logo(c, 130)}
  </div>
  <div style="position: absolute; left: 76px; right: 76px; top: 290px; bottom: 390px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center;">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 26px;">
      {eyebrow(t['eyebrow'], 26)}
      {h1(t['h1'], 100)}
      {mid}
    </div>
    <div style="position: relative;">
      {book(c, 'width: 640px;')}
      {coin(170, 'right: -60px; top: -50px;')}
    </div>
    {c.button(t['cta'], 2.4)}
  </div>
  {legal('left: 0; right: 0; bottom: 300px; text-align: center;', 18)}
''')


def ac_taboola(c, k):
    t = COPY[k]
    mid = sub(t['sub'], 20) if k == 'a' else chips(15, '7px 12px', 10)
    return (bg_layers(c, '50% 50%', OV_H, True) + f'''  <div style="position: absolute; left: 56px; right: 56px; top: 34px; display: flex; justify-content: space-between; align-items: center;">
    {logo(c, 78)}
    {pill(t['pill'], 14, '8px 18px')}
  </div>
  <div style="position: absolute; left: 56px; top: 150px; width: 600px; display: flex; flex-direction: column; gap: 16px;">
    {eyebrow(t['eyebrow'], 15)}
    {h1(t['h1'], 54 if k == 'a' else 50)}
    {mid}
    {c.button(t['cta'], 1.4, extra=' align-self: flex-start; margin-top: 6px;')}
  </div>
  <div style="position: absolute; left: 700px; top: 150px;">
    {book(c, 'width: 420px;')}
    {coin(110, 'right: -30px; top: -50px;')}
  </div>
''')


# ---------- concept B (Stephan, background, book) ----------

def photo(c, style, mask_dir):
    m = f'linear-gradient({mask_dir}, transparent 0, #000 26%)'
    return (f'<img src="{c.img["photo"]}" alt="Stephan Gerlach" style="position: absolute; {style} object-fit: cover; '
            f'object-position: 50% 0%; -webkit-mask-image: {m}; mask-image: {m};">')


NAME = '<span style="font-family: var(--font-display); font-style: italic; font-size: {}px;">Stephan Gerlach</span>'


def b_square(c):
    t = COPY['b']
    return (bg_layers(c, t['objpos'], OV_B_H, False) + f'''  {photo(c, 'right: -20px; bottom: 0; width: 560px; height: 900px;', '90deg')}
  <div style="position: absolute; left: 70px; top: 60px;">
    {logo(c, 110)}
  </div>
  <div style="position: absolute; left: 70px; top: 240px; width: 540px; display: flex; flex-direction: column; gap: 24px;">
    {eyebrow(t['eyebrow'], 20)}
    {h1(t['h1'], 72)}
    {sub(t['sub'], 26)}
    {NAME.format(32)}
    {c.button(t['cta'], 1.8, extra=' align-self: flex-start;')}
  </div>
  <div style="position: absolute; left: 610px; top: 640px;">
    {book(c, 'width: 320px;')}
  </div>
  {legal('left: 70px; bottom: 40px;', 15)}
''')


def b_portrait(c):
    t = COPY['b']
    return (bg_layers(c, t['objpos'], OV_B_V, False) + f'''  {photo(c, 'left: 470px; top: 700px; width: 560px; height: 650px;', '180deg')}
  <div style="position: absolute; left: 0; right: 0; top: 56px; display: flex; justify-content: center;">
    {logo(c, 110)}
  </div>
  <div style="position: absolute; left: 70px; right: 70px; top: 220px; display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center;">
    {eyebrow(t['eyebrow'], 21)}
    {h1(t['h1'], 80)}
    {sub(t['sub'], 27)}
    {NAME.format(32)}
  </div>
  <div style="position: absolute; left: 70px; top: 740px;">
    {book(c, 'width: 400px;')}
  </div>
  <div style="position: absolute; left: 70px; top: 1150px;">
    {c.button(t['cta'], 1.8)}
  </div>
  {legal('left: 70px; bottom: 36px;', 15)}
''')


def b_story(c):
    t = COPY['b']
    return (bg_layers(c, t['objpos'], OV_B_V, False) + f'''  {photo(c, 'left: 330px; top: 1050px; width: 700px; height: 870px;', '180deg')}
  <div style="position: absolute; left: 0; right: 0; top: 100px; display: flex; justify-content: center;">
    {logo(c, 130)}
  </div>
  <div style="position: absolute; left: 76px; right: 76px; top: 290px; display: flex; flex-direction: column; align-items: center; gap: 26px; text-align: center;">
    {eyebrow(t['eyebrow'], 26)}
    {h1(t['h1'], 100)}
    {sub(t['sub'], 34)}
    {NAME.format(38)}
    {c.button(t['cta'], 2.4, extra=' margin-top: 10px;')}
  </div>
  <div style="position: absolute; left: 76px; top: 1090px;">
    {book(c, 'width: 460px;')}
  </div>
''')


def b_taboola(c):
    t = COPY['b']
    return (bg_layers(c, '50% 50%', OV_B_H, False) + f'''  {photo(c, 'right: 0; top: 0; width: 460px; height: 674px;', '90deg')}
  <div style="position: absolute; left: 56px; top: 34px;">
    {logo(c, 78)}
  </div>
  <div style="position: absolute; left: 56px; top: 150px; width: 600px; display: flex; flex-direction: column; gap: 14px;">
    {eyebrow(t['eyebrow'], 15)}
    {h1(t['h1'], 54)}
    {sub(t['sub'], 20)}
    {NAME.format(24)}
    {c.button(t['cta'], 1.4, extra=' align-self: flex-start;')}
  </div>
  <div style="position: absolute; left: 640px; top: 400px;">
    {book(c, 'width: 250px;')}
  </div>
''')


BOARDS = [
    # name, title, w, h, builder, png name
    ('Main', 'A Geschenk, Feed 1:1', 1080, 1080, lambda c: ac_square(c, 'a'), 'a-geschenk-1080x1080'),
    ('A-Portrait', 'A Geschenk, Feed 4:5', 1080, 1350, lambda c: ac_portrait(c, 'a'), 'a-geschenk-1080x1350'),
    ('A-Story', 'A Geschenk, Story 9:16', 1080, 1920, lambda c: ac_story(c, 'a'), 'a-geschenk-1080x1920'),
    ('A-Taboola', 'A Geschenk, Taboola', 1200, 674, lambda c: ac_taboola(c, 'a'), 'a-geschenk-1200x674'),
    ('B-Square', 'B Autor, Feed 1:1', 1080, 1080, b_square, 'b-autor-1080x1080'),
    ('B-Portrait', 'B Autor, Feed 4:5', 1080, 1350, b_portrait, 'b-autor-1080x1350'),
    ('B-Story', 'B Autor, Story 9:16', 1080, 1920, b_story, 'b-autor-1080x1920'),
    ('B-Taboola', 'B Autor, Taboola', 1200, 674, b_taboola, 'b-autor-1200x674'),
    ('C-Square', 'C Zwischen den Jahren, Feed 1:1', 1080, 1080, lambda c: ac_square(c, 'c'), 'c-zwischen-den-jahren-1080x1080'),
    ('C-Portrait', 'C Zwischen den Jahren, Feed 4:5', 1080, 1350, lambda c: ac_portrait(c, 'c'), 'c-zwischen-den-jahren-1080x1350'),
    ('C-Story', 'C Zwischen den Jahren, Story 9:16', 1080, 1920, lambda c: ac_story(c, 'c'), 'c-zwischen-den-jahren-1080x1920'),
    ('C-Taboola', 'C Zwischen den Jahren, Taboola', 1200, 674, lambda c: ac_taboola(c, 'c'), 'c-zwischen-den-jahren-1200x674'),
]

FONTS = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500'
         '&amp;family=Inter:wght@400;500;600;700&amp;display=swap">')
DS_FILES = ['styles.css', 'tokens/fonts.css', 'tokens/colors.css', 'tokens/typography.css', 'tokens/spacing.css', 'tokens/effects.css']
ROOT_STYLE = ('position: relative; width: {w}px; height: {h}px; overflow: hidden; background: var(--gig-navy); '
              'color: #FFFFFF; font-family: var(--font-ui);')


def canvas_page(title, w, h, body):
    links = '\n'.join(f'<link rel="stylesheet" href="ds/gig/{f}">' for f in DS_FILES)
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
{links}
<script src="ds/gig/_ds_bundle.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
body{{margin:0}}
{SNOW_CSS}
</style>
</helmet>
<div style="{ROOT_STYLE.format(w=w, h=h)}">
{body}</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{
    return {{}};
  }}
}}
</script>
</body>
</html>
'''


def preview_page(title, w, h, body):
    links = '\n'.join(f'<link rel="stylesheet" href="../ds/tokens/{f.split("/")[-1]}">' for f in DS_FILES if f != 'styles.css')
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>{title}</title>
{links}
{FONTS}
<style>
body{{margin:0}}
{SNOW_CSS}
.pbtn{{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;border-radius:4px;background:#DDB851;color:#141A46;font:600 16px/1.1 Inter,sans-serif;white-space:nowrap}}
</style>
</head>
<body>
<div style="{ROOT_STYLE.format(w=w, h=h)}">
{body}</div>
</body>
</html>
'''


def main():
    canvas_dir = sys.argv[1]
    prev_dir = os.path.join(HERE, 'preview')
    os.makedirs(prev_dir, exist_ok=True)
    for name, title, w, h, build, png in BOARDS:
        with open(os.path.join(canvas_dir, f'{name}.dc.html'), 'w') as f:
            f.write(canvas_page(title, w, h, build(Ctx(True))))
        with open(os.path.join(prev_dir, f'{png}.html'), 'w') as f:
            f.write(preview_page(title, w, h, build(Ctx(False))))
    print('wrote', len(BOARDS), 'artboards and previews')


if __name__ == '__main__':
    main()
