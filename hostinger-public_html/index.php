<?php
session_start();
$hash = '$2y$10$6Mn4c0FarNT1fyevYxr0..UOcCLZmiAEAxxGnPd6Q37w1/tmuqefm';
$error = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (password_verify($_POST['passwort'] ?? '', $hash)) {
        session_regenerate_id(true);
        $_SESSION['hswg_ok'] = true;
        header('Location: ./', true, 303);
        exit;
    }
    $error = true;
    usleep(500000);
}
if (empty($_SESSION['hswg_ok'])) {
    header('Cache-Control: no-store');
?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Geschützter Bereich</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;background:#F5F6F9;font-family:Inter,'Helvetica Neue',Helvetica,sans-serif;color:#141A46}
.card{background:#FFFFFF;border:1px solid #E6E7EE;padding:40px;width:100%;max-width:420px;text-align:center}
.card img{height:56px;width:auto;margin-bottom:28px}
h1{font-size:20px;font-weight:600;margin:0 0 8px}
p{font-size:14px;color:#5A607F;margin:0 0 24px}
input{width:100%;padding:12px 14px;font:inherit;font-size:16px;border:1px solid #C9CBD8;color:#141A46}
input:focus{outline:2px solid #141A46;outline-offset:1px}
button{margin-top:12px;width:100%;padding:12px;font:inherit;font-size:13px;letter-spacing:.08em;text-transform:uppercase;background:#141A46;color:#FFFFFF;border:0;cursor:pointer}
button:hover{background:#2A3270}
.err{color:#B3261E;font-size:14px;margin:12px 0 0}
</style>
</head>
<body>
<form class="card" method="post" action="./">
<img src="bilder/8b98918efbdab4d570efd458c9a8a1a2.png" alt="Hanseatische Wohnungsgenossenschaft · Gerlach Immobilien Gruppe">
<h1>Geschützter Bereich</h1>
<p>Bitte geben Sie das Passwort ein, um die Objektübersicht zu sehen.</p>
<label for="pw" style="position:absolute;left:-9999px">Passwort</label>
<input id="pw" type="password" name="passwort" placeholder="Passwort" autocomplete="current-password" required autofocus>
<button type="submit">Weiter</button>
<?php if ($error): ?><p class="err" role="alert">Das Passwort ist leider nicht korrekt.</p><?php endif; ?>
</form>
</body>
</html>
<?php
    exit;
}
header('Cache-Control: private, no-store');
?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Unsere aktuellen Objekte</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<style>
body{margin:0;background:#FFFFFF}
a{color:#141A46}a:hover{color:#2A3270}
</style>
<style>[hidden]{display:none!important}</style>
</head>
<body>
<div style="font-family: Inter, 'Helvetica Neue', Helvetica, sans-serif; color: #141A46; background: #FFFFFF; font-size: 16px; line-height: 1.6">

<!-- Header -->
<header style="border-bottom: 1px solid #E6E7EE; background: #FFFFFF">
<div style="max-width: 1200px; margin: 0 auto; padding: 20px 40px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between">
<div style="display: flex; align-items: center; text-decoration: none"><img src="bilder/8b98918efbdab4d570efd458c9a8a1a2.png" alt="Hanseatische Wohnungsgenossenschaft · Gerlach Immobilien Gruppe" style="display: block; height: 56px; width: auto"></div>
<nav style="display: flex; flex-wrap: wrap; gap: 28px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase">
<a href="#objekte" style="text-decoration: none">Objekte</a>
<a href="#weg" style="text-decoration: none">So funktioniert es</a>
<a href="#kontakt" style="text-decoration: none">Kontakt</a>
</nav>
</div>
</header>

<!-- Hero -->
<section style="background: #141A46; color: #FFFFFF">
<div style="max-width: 1200px; margin: 0 auto; padding: 112px 40px 104px; display: flex; flex-wrap: wrap; gap: 48px; align-items: flex-end; justify-content: space-between">
<div style="flex: 1 1 560px; display: flex; flex-direction: column; gap: 24px; min-width: 0">
<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #DDB851">Kapitalanlage Immobilien</div>
<h1 style="margin: 0; font-weight: 500; font-size: clamp(44px, 5.5vw, 76px); line-height: 1.05; letter-spacing: -0.03em">Unsere aktuellen Objekte.</h1>
<p style="margin: 0; font-size: 18px; font-weight: 300; color: #D5D7E3; max-width: 520px">Ausgewählte Mehrfamilienhäuser in gefragten Lagen, geprüft, modernisiert und mit durchdachtem Vermietungskonzept. Wähle ein Objekt und öffne das digitale Exposé.</p>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 12px">
<a href="#kontakt" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 28px; background: #DDB851; color: #141A46; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.04em">Termin beantragen</a>
<a href="#weg" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 28px; border: 1px solid #FFFFFF; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 0.04em">So funktioniert es</a>
</div>
</div>
</section>

<!-- Featured -->
<section id="objekte" style="padding: 120px 0 0">
<div style="max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; flex-direction: column; gap: 48px">
<div style="display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-between; align-items: flex-end">
<div style="display: flex; flex-direction: column; gap: 16px">
<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Portfolio</div>
<h2 style="margin: 0; font-weight: 500; font-size: 44px; line-height: 1.12; letter-spacing: -0.02em">15 Objekte, 9 Städte.</h2>
</div>
<p style="margin: 0; font-size: 15px; color: #3A3F63; max-width: 420px">Von Hamburg bis Köln: Jedes Objekt hat ein eigenes digitales Exposé mit allen Daten, Fotos und dem Vermietungskonzept.</p>
</div>

<a href="oberbilker-allee-113.html" style="display: flex; flex-wrap: wrap; text-decoration: none; color: #141A46; border-top: 1px solid #141A46; border-bottom: 1px solid #141A46">
<div style="flex: 1 1 520px; min-height: 440px; min-width: 0"><img src="bilder/2c92dac318488bd8fb8a96d02f4222c8.jpg" alt="Oberbilker Allee 113, Düsseldorf" style="display: block; width: 100%; height: 100%; min-height: 440px; object-fit: cover"></div>
<div style="flex: 1 1 420px; padding: 48px 0 48px 56px; display: flex; flex-direction: column; gap: 20px; justify-content: center; min-width: 0">
<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Neu · Düsseldorf</div>
<h3 style="margin: 0; font-weight: 500; font-size: 40px; line-height: 1.1; letter-spacing: -0.02em">Oberbilker Allee 113</h3>
<p style="margin: 0; font-size: 15px; color: #3A3F63">Mehrfamilienhaus aus der Gründerzeit (1908) in Düsseldorf Oberbilk. Laufend modernisiert, mit möbliertem Vermietungskonzept.</p>
<dl style="margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 32px; font-size: 14px">
<div style="padding: 12px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase">Kaufpreis</dt><dd style="margin: 4px 0 0; font-weight: 500; font-size: 18px">ab 171.300 €</dd></div>
<div style="padding: 12px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase">Zimmer</dt><dd style="margin: 4px 0 0; font-weight: 500; font-size: 18px">3 bis 4</dd></div>
<div style="padding: 12px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase">Wohnungsgrößen</dt><dd style="margin: 4px 0 0; font-weight: 500; font-size: 18px">41 bis 151 m²</dd></div>
<div style="padding: 12px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase">Zielmiete</dt><dd style="margin: 4px 0 0; font-weight: 500; font-size: 18px">17,00 €/m²</dd></div>
</dl>
<span style="display: inline-flex; align-self: flex-start; align-items: center; min-height: 48px; padding: 0 28px; background: #141A46; color: #FFFFFF; font-size: 14px; font-weight: 600; letter-spacing: 0.04em">Zum digitalen Exposé</span>
</div>
</a>

<!-- Grid -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 56px 32px; padding-bottom: 120px">
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/9297bb507659d9075a553fad7ba1b419.jpg" alt="Langer Kamp 49, Norderstedt" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Norderstedt</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Langer Kamp 49</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Gepflegtes Mehrfamilienhaus (Baujahr 1997) direkt im Hamburger Umland, mit 18 Garagen, 4 Stellplätzen und möbliertem Vermietungskonzept.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1997</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">56 bis 115 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 300.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">17,00 €</dd></div>
</dl>
<a href="langer-kamp-49.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/c4074cdec6b53510be598fce9b9713dc.jpg" alt="Hohe Straße 3, Drochtersen" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Drochtersen</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Hohe Straße 3</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Mehrfamilienhaus aus dem Jahr 1971 bei Stade, mit robuster Rotklinkerfassade. Renovierte Wohnungen mit möbliertem Vermietungskonzept.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1971</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgröße</dt><dd style="margin: 0; font-weight: 500">71,14 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 176.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">13,50 €</dd></div>
</dl>
<a href="hohe-strasse-3.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/a2a67a745abf9160f9580d6861504d86.jpg" alt="Uhlgasse 17, Bonn" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Bonn</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Uhlgasse 17</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Mehrfamilienhaus aus dem Jahr 1962 in Bonn-Hardtberg, zwischen Rhein und Naherholungsgebieten. Frisch renovierte Apartments und 8 Garagen.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1962</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">60 bis 93 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Kaufpreis</dt><dd style="margin: 0; font-weight: 500">ab 271.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">16,00 €</dd></div>
</dl>
<a href="uhlgasse-17.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/a94383e2a4cdbdc5a05b3cc315dfb8ff.jpg" alt="Grefenstraße 36–40, Drochtersen" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Drochtersen</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Grefenstraße 36–40</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Mehrfamilienhaus aus dem Jahr 1971 bei Stade. Neue Fenster, gedämmte Fassade und sanierte Balkone, mit möbliertem Vermietungskonzept.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1971</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgröße</dt><dd style="margin: 0; font-weight: 500">ca. 82,90 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Kaufpreis</dt><dd style="margin: 0; font-weight: 500">ab 215.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">13,50 €</dd></div>
</dl>
<a href="grefenstrasse-36-40.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/43c92e07e52bbaac334566836b8193ef.jpg" alt="Lülsdorfer Straße 210A, Köln" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Köln</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Lülsdorfer Straße 210A</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Gepflegtes Mehrfamilienhaus aus dem Jahr 1991 in Köln-Porz Langel, nahe dem Rhein. Neue Gasheizung 2024, kein Instandhaltungsstau.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1991</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">63 bis 102 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Kaufpreis</dt><dd style="margin: 0; font-weight: 500">ab 260.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">18,00 €</dd></div>
</dl>
<a href="luelsdorfer-strasse-210a.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/e9b8e815e4ffb3aad2d595117c151438.jpg" alt="Im Bans 20a-b, Pinneberg" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Pinneberg</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Im Bans 20a-b</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Solide Kapitalanlage in gefragter Lage von Pinneberg, rund 20 Minuten von Hamburg. Baujahr 1965, Fernwärme, Garagen und Stellplätze.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1965</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">ab 80,8 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 267.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">15,00 €</dd></div>
</dl>
<a href="im-bans-20a-b.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/83e279195bc645a75151587d83c94d40.jpg" alt="Segeberger Chaussee 102a, Norderstedt" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Norderstedt</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Segeberger Chaussee 102a</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Mehrfamilienhaus aus dem Jahr 1964 in Norderstedt, direkt im Hamburger Umland. Gasheizung von 2018 und geplanter Dachgeschossausbau.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1964</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">ab 85,32 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">310.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">18,00 €</dd></div>
</dl>
<a href="segeberger-chaussee-102a.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/6cfd16f7590df21f64a8cdcb6198b9bc.jpg" alt="Letternkamp 6, Hamburg" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Hamburg</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Letternkamp 6</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Klinkerhaus aus dem Jahr 1904 in Hamburg-Billstedt mit zwei großzügigen Wohnungen und Gaszentralheizung von 2022.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1904</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">126 und 127 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 410.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">ab 16,50 €</dd></div>
</dl>
<a href="letternkamp-6.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/4a2eed483345e635ea29c8957bfe1cb1.jpg" alt="Steinbeker Marktstraße 49, Hamburg" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Hamburg</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Steinbeker Marktstraße 49</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Mehrfamilienhaus aus dem Jahr 1919, aufgestockt 1994, in Hamburg-Billstedt. Gepflegte Substanz und Gasheizung von 2019.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1919</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">ab 106 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">2.200.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro Monat</dt><dd style="margin: 0; font-weight: 500">11.000 €</dd></div>
</dl>
<a href="steinbeker-marktstrasse-49.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/4a2eed483345e635ea29c8957bfe1cb1.jpg" alt="Steinbeker Marktstraße 49 · Einzelwohnungen, Hamburg" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Hamburg</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Steinbeker Marktstraße 49 · Einzelwohnungen</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Einzelne Wohnungen in einem Mehrfamilienhaus aus dem Jahr 1919, aufgestockt 1994, in Hamburg-Billstedt.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1919</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">54 bis 132 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 240.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">ab 13,00 €</dd></div>
</dl>
<a href="steinbeker-marktstrasse-49-einzelwohnungen.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/e086c9b38e995bef4f8ee9d99e181ee6.jpg" alt="Udetstraße 22, Sankt Augustin-Hangelar" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Sankt Augustin-Hangelar</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Udetstraße 22</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Mehrfamilienhaus aus dem Jahr 1961, saniert 2004, nahe Bonn. Wohnungen bereits renoviert, Fassadendämmung durch den Eigentümer.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1961</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">55,79 bis 132,09 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 210.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">17,00 €</dd></div>
</dl>
<a href="udetstrasse-22.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/d80969e1d83987ca25378ab2494461f4.jpg" alt="Kantstraße 44, Hamburg-Eilbek" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Hamburg-Eilbek</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Kantstraße 44</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Mehrfamilienhaus aus dem Jahr 1956 in zentraler Lage von Hamburg-Eilbek. Fernwärme, neue Dreifachverglasung und Fassadendämmung.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1956</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">48,5 bis 61,8 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 199.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">13,50 €</dd></div>
</dl>
<a href="kantstrasse-44.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/f5dfb228ac3908e4088b2e445dc17d0f.jpg" alt="Dorfstraße 3, Grönwohld" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Grönwohld</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Dorfstraße 3</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Wohnanlage aus dem Jahr 1972, ruhig und naturnah im Kreis Stormarn, rund 35 Minuten bis Hamburg.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1972</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">ca. 100 bis 129 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 280.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">17,00 €</dd></div>
</dl>
<a href="dorfstrasse-3.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
<article style="display: flex; flex-direction: column; gap: 16px">
<img src="bilder/0bae25208ea383f12a2401053f3a5058.jpg" alt="Brookdeich 98–100a, Hamburg-Bergedorf" style="display: block; width: 100%; height: 260px; object-fit: cover">

<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Hamburg-Bergedorf</div>
<h3 style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.15; letter-spacing: -0.02em">Brookdeich 98–100a</h3>
<p style="margin: 0; font-size: 14px; color: #3A3F63">Wohnanlage aus dem Jahr 1994 in Hamburg-Bergedorf, nahe Dove Elbe und Bergedorfer Zentrum, mit Erdgasheizung von 2017.</p>
<dl style="margin: 0; display: flex; flex-direction: column; font-size: 14px">
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #141A46"><dt style="color: #5A5F80">Baujahr</dt><dd style="margin: 0; font-weight: 500">1994</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Wohnungsgrößen</dt><dd style="margin: 0; font-weight: 500">72 bis 88,3 m²</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE"><dt style="color: #5A5F80">Gesamtinvestition</dt><dd style="margin: 0; font-weight: 500">ab 300.000 €</dd></div>
<div style="display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E7EE; border-bottom: 1px solid #141A46"><dt style="color: #5A5F80">Mietgarantie pro m²</dt><dd style="margin: 0; font-weight: 500">16,00 €</dd></div>
</dl>
<a href="brookdeich-98-100a.html" style="align-self: flex-start; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; padding: 10px 0">Zum digitalen Exposé →</a>
</article>
</div>
</div>
</section>

<!-- Weg -->
<section id="weg" style="background: #141A46; color: #FFFFFF; padding: 120px 0">
<div style="max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; flex-wrap: wrap; gap: 80px">
<div style="flex: 1 1 380px; display: flex; flex-direction: column; gap: 24px; min-width: 0">
<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #DDB851">Rundum sorglos</div>
<h2 style="margin: 0; font-weight: 500; font-size: 44px; line-height: 1.12; letter-spacing: -0.02em">Der Weg zu Deinem Vermögensaufbau.</h2>
<p style="margin: 0; font-size: 16px; color: #D5D7E3">Wir begleiten Dich transparent, persönlich und langfristig: von der Auswahl über die Finanzierung bis zur Verwaltung. In rund 60 Tagen zur eigenen Kapitalanlage, ohne eigenen Zeitaufwand.</p>
</div>
<ol style="flex: 1 1 480px; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; min-width: 0">
<li style="display: flex; gap: 28px; padding: 28px 0; border-top: 1px solid #3A4170">
<span style="font-size: 28px; font-weight: 500; color: #DDB851; line-height: 1">01</span>
<div style="display: flex; flex-direction: column; gap: 8px"><h3 style="margin: 0; font-size: 18px; font-weight: 500">Individuelle Strategie und Finanzierung</h3><p style="margin: 0; font-size: 15px; color: #D5D7E3">Eine Kapitalanlagestrategie passend zu Deinen Zielen und Deiner Lebenssituation, inklusive optimaler Finanzierung.</p></div>
</li>
<li style="display: flex; gap: 28px; padding: 28px 0; border-top: 1px solid #3A4170">
<span style="font-size: 28px; font-weight: 500; color: #DDB851; line-height: 1">02</span>
<div style="display: flex; flex-direction: column; gap: 8px"><h3 style="margin: 0; font-size: 18px; font-weight: 500">Exklusive Auswahl und Kaufbegleitung</h3><p style="margin: 0; font-size: 15px; color: #D5D7E3">Aus über 200 Off Market Immobilien wählen wir passende Objekte aus und begleiten Dich bis zum Notartermin.</p></div>
</li>
<li style="display: flex; gap: 28px; padding: 28px 0; border-top: 1px solid #3A4170; border-bottom: 1px solid #3A4170">
<span style="font-size: 28px; font-weight: 500; color: #DDB851; line-height: 1">03</span>
<div style="display: flex; flex-direction: column; gap: 8px"><h3 style="margin: 0; font-size: 18px; font-weight: 500">Vermietung und Verwaltung</h3><p style="margin: 0; font-size: 15px; color: #D5D7E3">Nach dem Kauf übernehmen wir Vermietung und Verwaltung. Das integrierte Mietkonzept sorgt für planbare Mieteinnahmen und reduziert das Leerstandsrisiko.</p></div>
</li>
</ol>
</div>
</section>

<!-- Kontakt CTA -->
<section id="kontakt" style="background: #F5F5F5; padding: 120px 0">
<div style="max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; flex-wrap: wrap; gap: 48px; align-items: flex-end; justify-content: space-between">
<div style="flex: 1 1 520px; display: flex; flex-direction: column; gap: 20px; min-width: 0">
<div style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #5A5F80">Vertriebsteam</div>
<h2 style="margin: 0; font-weight: 500; font-size: 44px; line-height: 1.12; letter-spacing: -0.02em">Persönlich für Dich da.</h2>
<p style="margin: 0; font-size: 16px; color: #3A3F63; max-width: 560px">Unser Team in Hamburg und Köln steht Dir jederzeit mit umfassendem Expertenwissen zur Verfügung. Buche ein unverbindliches Strategiegespräch, wir melden uns innerhalb von 24 Stunden.</p>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 12px">
<a href="mailto:verkauf@gerlachgroup.de" style="display: inline-flex; align-items: center; min-height: 52px; padding: 0 32px; background: #141A46; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.04em">Strategiegespräch sichern</a>
<a href="tel:+494022862370" style="display: inline-flex; align-items: center; min-height: 52px; padding: 0 32px; border: 1px solid #141A46; color: #141A46; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 0.04em">+49 40 228 6237 0</a>
</div>
</div>
</section>

<!-- Footer -->
<footer style="background: #141A46; color: #D5D7E3; padding: 64px 0 48px">
<div style="max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; flex-direction: column; gap: 40px">
<div style="display: flex; flex-wrap: wrap; gap: 32px; justify-content: space-between; align-items: flex-end">
<img src="bilder/77d2af104cf668dfbb86cafe70460985.png" alt="Hanseatische Wohnungsgenossenschaft · Gerlach Immobilien Gruppe" style="display: block; height: 72px; width: auto">
<div style="display: flex; flex-wrap: wrap; gap: 48px; font-size: 14px">
<div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #9DA1BC">Kontakt</span><a href="mailto:verkauf@gerlachgroup.de" style="color: #FFFFFF; text-decoration: none">verkauf@gerlachgroup.de</a><a href="tel:+494022862370" style="color: #FFFFFF; text-decoration: none">+49 40 228 6237 0</a></div>
<div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #9DA1BC">Adresse</span><span style="color: #FFFFFF">Langenhorner Chaussee 155<br>22415 Hamburg</span></div>
</div>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-between; align-items: center; border-top: 1px solid #3A4170; padding-top: 24px">
<span style="font-size: 18px; font-weight: 500; color: #DDB851">Mehr Rendite. Weniger Risiko. Kein Aufwand.</span>
<div style="display: flex; flex-wrap: wrap; gap: 24px; font-size: 13px">
<a href="https://gerlachgroup.de/impressum/" target="_blank" rel="noopener" style="color: #D5D7E3; text-decoration: none">Impressum</a>
<a href="https://gerlachgroup.de/datenschutzerklarung/" target="_blank" rel="noopener" style="color: #D5D7E3; text-decoration: none">Datenschutz</a>
<a href="#" style="color: #D5D7E3; text-decoration: none">Risikohinweis</a>
</div>
</div>
<p style="margin: 0; font-size: 12px; line-height: 1.7; color: #9DA1BC; max-width: 900px">Alle Angaben ohne Gewähr. Keine Anlageberatung. Steuerliche Vorteile können möglich sein und hängen von Deiner persönlichen Situation ab. Mieteinnahmen sind planbar, aber nicht garantiert. Immobilieninvestitionen sind mit Risiken verbunden, die sich reduzieren, aber nicht ausschließen lassen. © 2026 Hanseatische Wohnungsgenossenschaft eG</p>
</div>
</footer>

</div>
</body>
</html>
