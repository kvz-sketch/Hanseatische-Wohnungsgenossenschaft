<footer class="sr-footer">
    <div class="wrap">
        Performance Marketing Report · Stand <?= htmlspecialchars($asOf) ?> — Gerlach Immobilien Gruppe
    </div>
</footer>

<script>
document.addEventListener('click', function (e) {
    var thumb = e.target.closest('[data-lightbox]');
    if (thumb) {
        openLightbox(thumb.getAttribute('data-lightbox'), thumb.getAttribute('data-alt') || '');
        return;
    }
    if (e.target.classList.contains('lightbox')) {
        closeLightbox();
    }
    var toggle = e.target.closest('[data-toggle-body]');
    if (toggle) {
        var body = document.getElementById(toggle.getAttribute('data-toggle-body'));
        if (body) {
            body.hidden = !body.hidden;
            var label = toggle.querySelector('.camp-toggle');
            if (label) {
                label.textContent = body.hidden ? 'Anzeigen anzeigen ▾' : 'Anzeigen ausblenden ▴';
            }
        }
    }
});

function openLightbox(src, alt) {
    closeLightbox();
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.id = 'js-lightbox';
    box.innerHTML = '<button type="button" class="lightbox-close">✕</button><img src="' + src + '" alt="' + alt + '">';
    document.body.appendChild(box);
}
function closeLightbox() {
    var existing = document.getElementById('js-lightbox');
    if (existing) existing.remove();
}

<?php if (isset($_GET['open'])): ?>
document.addEventListener('DOMContentLoaded', function () {
    var body = document.getElementById('body-<?= htmlspecialchars($_GET['open'], ENT_QUOTES) ?>');
    if (body) { body.hidden = false; }
});
<?php endif; ?>
</script>
</body>
</html>
