/* HI Leitfaden: cookie notice and Meta Pixel (dataset 1549893906445577).
 *
 * The pixel loads only after "Akzeptieren"; nothing goes to Meta before that.
 * The choice is kept for 12 months in the first-party cookie hansea_marketing
 * ("granted" or "denied"). Every page sends PageView; a page with
 * <body data-meta-event="Lead"> also sends that event (the guide page, reached
 * after the form). Any link to #cookie-einstellungen reopens the notice. */
(function () {
	var PIXEL_ID = '1549893906445577';
	var COOKIE = 'hansea_marketing';

	function read() {
		var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=(granted|denied)'));
		return m ? m[1] : null;
	}
	function store(v) {
		document.cookie = COOKIE + '=' + v + '; Max-Age=' + 60 * 60 * 24 * 365 + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
	}

	var loaded = false;
	function loadPixel() {
		if (loaded) return;
		loaded = true;
		/* Meta's base code */
		!function (f, b, e, v, n, t, s) {
			if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
			if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
			t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
		}(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
		window.fbq('init', PIXEL_ID);
		window.fbq('track', 'PageView');
		var event = document.body.getAttribute('data-meta-event');
		if (event) window.fbq('track', event);
	}

	function removeMetaCookies() {
		['_fbp', '_fbc'].forEach(function (name) {
			document.cookie = name + '=; Max-Age=0; Path=/';
			document.cookie = name + '=; Max-Age=0; Path=/; Domain=.' + location.hostname.replace(/^www\./, '');
		});
	}

	var box = document.createElement('div');
	box.className = 'consent';
	box.id = 'consent';
	box.setAttribute('role', 'dialog');
	box.setAttribute('aria-labelledby', 'consent-title');
	box.hidden = true;
	box.innerHTML =
		'<p class="consent__title" id="consent-title">Cookies für Marketing</p>' +
		'<p class="consent__text">Mit Ihrer Zustimmung nutzen wir den Meta-Pixel (Meta Platforms Ireland Ltd.), um zu messen, wie viele Besucher über unsere Anzeigen auf Facebook und Instagram den Leitfaden anfordern. Ohne Zustimmung wird nichts an Meta übertragen. Ihre Wahl können Sie jederzeit unter „Cookie-Einstellungen“ ändern. Mehr dazu in der <a href="https://hanseainvest.de/cookie-richtlinie/">Cookie-Richtlinie</a>.</p>' +
		'<div class="consent__actions"><button type="button" data-consent="denied">Ablehnen</button><button type="button" data-consent="granted">Akzeptieren</button></div>';
	document.body.appendChild(box);

	box.addEventListener('click', function (e) {
		var v = e.target.getAttribute && e.target.getAttribute('data-consent');
		if (!v) return;
		store(v);
		box.hidden = true;
		if (v === 'granted') loadPixel();
		else if (loaded) { removeMetaCookies(); location.reload(); } // withdrawn: stop the loaded pixel
	});

	document.addEventListener('click', function (e) {
		var a = e.target.closest && e.target.closest('a[href="#cookie-einstellungen"]');
		if (!a) return;
		e.preventDefault();
		box.hidden = false;
		box.querySelector('[data-consent="granted"]').focus();
	});

	var choice = read();
	if (choice === 'granted') loadPixel();
	else if (!choice) box.hidden = false;
})();
