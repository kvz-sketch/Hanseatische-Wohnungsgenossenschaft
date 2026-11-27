/* Consent bar + Meta Pixel (dataset 1596701548606291).
   The pixel loads only after the visitor accepts; the choice is kept in
   localStorage. Pages call window.hwgTrackLead() after a form submission.
   The thank-you page sets <body data-lead-page> and reports the lead there
   too, with the same event ID, so Meta counts it once. */
(function () {
  var PIXEL_ID = '1596701548606291';
  var KEY = 'hwg-consent-v1';
  var loaded = false;

  function get(k, store) { try { return (store || localStorage).getItem(k); } catch (e) { return null; } }
  function set(k, v, store) { try { (store || localStorage).setItem(k, v); } catch (e) {} }

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
    if (document.body.hasAttribute('data-lead-page') && cameFromForm()) reportLead();
  }

  function cameFromForm() {
    return get('hwg-lead-id', sessionStorage) !== null || /\/hoerbuch\/(index\.html)?(\?|#|$)/.test(document.referrer);
  }

  function leadId() {
    var id = get('hwg-lead-id', sessionStorage);
    if (!id) { id = 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); set('hwg-lead-id', id, sessionStorage); }
    return id;
  }

  function reportLead() {
    var id = leadId();
    if (window.fbq) fbq('track', 'Lead', { content_name: 'Hoerbuch Weihnachten' }, { eventID: id });
    if (window._tfa) window._tfa.push({ notify: 'event', name: 'lead' });
  }

  // Called by the landing page when the HubSpot form was sent.
  window.hwgTrackLead = function () { leadId(); if (loaded) reportLead(); };

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
        'Das geschieht nur mit Ihrer Zustimmung, die Sie jederzeit über „Cookie-Einstellungen“ im Seitenfuß ändern können. ' +
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
    var links = document.querySelectorAll('[data-consent-settings]');
    for (var i = 0; i < links.length; i++) links[i].addEventListener('click', function (e) { e.preventDefault(); showBar(); });
    var c = get(KEY);
    if (c === 'yes') loadPixel();
    else if (c !== 'no') showBar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
