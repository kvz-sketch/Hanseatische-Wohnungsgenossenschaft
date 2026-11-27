/* Consent bar + Meta Pixel (same dataset as the other HWG landing pages).
   The pixel loads only after the visitor accepts; the choice is kept in
   localStorage. The funnel calls window.hwgTrackLead() after a successful
   request. A small shield button (bottom left) reopens the settings. */
(function () {
  var PIXEL_ID = '1596701548606291';
  var KEY = 'hwg-consent-v1';
  var loaded = false;
  var pending = false;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function loadPixel() {
    if (loaded) return; loaded = true;
    /* Meta Pixel base code */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
    if (pending) reportLead();
  }

  function reportLead() {
    pending = false;
    var id = 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    if (window.fbq) fbq('track', 'Lead', { content_name: 'Objekte Anfrage' }, { eventID: id });
  }

  window.hwgTrackLead = function () { if (loaded) reportLead(); else pending = true; };

  function choose(v) {
    set(KEY, v);
    var bar = document.getElementById('consent-bar');
    if (bar) bar.hidden = true;
    if (v === 'yes') loadPixel();
  }

  function showBar() {
    var bar = document.getElementById('consent-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'consent-bar';
      bar.className = 'consent-bar';
      bar.setAttribute('role', 'dialog');
      bar.setAttribute('aria-label', 'Datenschutz-Einstellungen');
      bar.innerHTML =
        '<p>Wir möchten mit dem Meta-Pixel messen, wie gut unsere Anzeigen wirken. Dafür werden Daten an Meta übertragen. ' +
        'Das geschieht nur mit deiner Zustimmung, die du jederzeit über das Schild-Symbol unten links ändern kannst. ' +
        'Mehr in der <a href="https://gerlachgroup.de/datenschutzerklarung/" target="_blank" rel="noopener">Datenschutzerklärung</a>.</p>' +
        '<div class="consent-actions"><button type="button" class="btn consent-no">Ablehnen</button>' +
        '<button type="button" class="btn consent-yes">Akzeptieren</button></div>';
      document.body.appendChild(bar);
      bar.querySelector('.consent-yes').addEventListener('click', function () { choose('yes'); });
      bar.querySelector('.consent-no').addEventListener('click', function () { choose('no'); });
    }
    bar.hidden = false;
  }

  function init() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'consent-fab';
    fab.setAttribute('aria-label', 'Datenschutz-Einstellungen');
    fab.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2l6.5 2.6v4.6c0 4-2.8 7.2-6.5 8.8-3.7-1.6-6.5-4.8-6.5-8.8V4.6L10 2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 10l2.1 2.1L13.2 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    fab.addEventListener('click', showBar);
    document.body.appendChild(fab);

    var links = document.querySelectorAll('[data-consent-settings]');
    for (var i = 0; i < links.length; i++) links[i].addEventListener('click', function (e) { e.preventDefault(); showBar(); });
    var c = get(KEY);
    if (c === 'yes') loadPixel();
    else if (c !== 'no') showBar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
