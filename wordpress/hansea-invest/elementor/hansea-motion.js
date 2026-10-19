/*
 * Scroll animations for the Elementor pages (modelled on eloqwnt.com):
 * - large headings reveal line by line, each line sliding up out of a mask;
 * - every other block (text, buttons, images, cards) fades in while rising;
 * - blocks entering together are staggered;
 * - the sticky header slides away while scrolling down and returns on scroll up.
 *
 * Layout, colours and type are untouched: the script only adds classes and
 * wraps heading words in spans. The <head> snippet in inc/elementor.php adds
 * html.hs-motion (skipped for prefers-reduced-motion) and removes it again if
 * this file doesn't run, so content is never left hidden.
 */
(function () {
  var root = document.documentElement
  if (!root.classList.contains('hs-motion') || !('IntersectionObserver' in window)) {
    root.classList.remove('hs-motion')
    return
  }

  var STAGGER = 90 // ms between blocks entering together
  var LINE_STAGGER = 110 // ms between heading lines
  var MAX_DELAY = 540

  function isCard(el) {
    if (el.classList.contains('hs-card')) return true
    var cs = getComputedStyle(el)
    return (
      (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
      cs.backgroundImage !== 'none' ||
      parseFloat(cs.borderTopWidth) > 0 ||
      cs.boxShadow !== 'none'
    )
  }

  function children(container) {
    var inner = container.querySelector(':scope > .e-con-inner')
    return Array.prototype.slice.call((inner || container).children)
  }

  /** Collect the animated units of a section: cards as a whole, otherwise each widget. */
  function collect(container, out) {
    children(container).forEach(function (el) {
      if (el.classList.contains('e-con')) {
        if (isCard(el)) out.push({ el: el, type: 'rise' })
        else collect(el, out)
        return
      }
      if (!el.classList.contains('elementor-widget') || el.classList.contains('elementor-widget-spacer')) return
      var title = el.classList.contains('elementor-widget-heading') && el.querySelector('.elementor-heading-title')
      if (title && parseFloat(getComputedStyle(title).fontSize) >= 24) out.push({ el: title, type: 'lines' })
      else out.push({ el: el, type: 'rise' })
    })
    return out
  }

  /* Headings: wrap each word in a mask; words on the same line share a delay. */
  function splitWords(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var parts = child.textContent.split(/(\s+)/)
        if (parts.length === 1 && !parts[0]) return
        var frag = document.createDocumentFragment()
        parts.forEach(function (part) {
          if (!part) return
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part))
            return
          }
          var mask = document.createElement('span')
          mask.className = 'hs-wm'
          var word = document.createElement('span')
          word.className = 'hs-wi'
          word.textContent = part
          mask.appendChild(word)
          frag.appendChild(mask)
        })
        node.replaceChild(frag, child)
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        splitWords(child)
      }
    })
  }

  function setLineDelays(title) {
    var words = title.querySelectorAll('.hs-wi')
    var line = -1
    var lastTop = null
    Array.prototype.forEach.call(words, function (w) {
      var top = Math.round(w.parentNode.offsetTop)
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        line++
        lastTop = top
      }
      w.style.setProperty('--hs-line', String(line * LINE_STAGGER) + 'ms')
    })
  }

  var units = []
  document.querySelectorAll('.elementor .e-con.e-parent').forEach(function (section) {
    if (section.classList.contains('hs-header')) return
    collect(section, units)
  })

  units.forEach(function (u) {
    if (u.type === 'lines') {
      splitWords(u.el)
      setLineDelays(u.el)
      u.el.classList.add('hs-lines')
    } else {
      u.el.classList.add('hs-rise')
    }
  })

  var pending = units.filter(function (u) { return u.type === 'lines' }).map(function (u) { return u.el })
  var resizeTimer
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(function () {
      pending = pending.filter(function (t) { return !t.classList.contains('hs-in') })
      pending.forEach(setLineDelays)
    }, 150)
  })

  function reveal(els) {
    els
      .map(function (el) { return { el: el, r: el.getBoundingClientRect() } })
      .sort(function (a, b) { return a.r.top - b.r.top || a.r.left - b.r.left })
      .forEach(function (item, i) {
        var el = item.el
        el.style.setProperty('--hs-delay', Math.min(i * STAGGER, MAX_DELAY) + 'ms')
        el.classList.add('hs-in')
        observer.unobserve(el)
        // Drop the animation hints once done so nothing stays on its own layer
        setTimeout(function () { el.classList.add('hs-done') }, 1800 + MAX_DELAY)
      })
  }

  var observer = new IntersectionObserver(
    function (entries) {
      reveal(entries.filter(function (e) { return e.isIntersecting }).map(function (e) { return e.target }))
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 }
  )
  units.forEach(function (u) { observer.observe(u.el) })

  // At the end of the page the last lines can't reach the trigger line: show what's visible.
  window.addEventListener(
    'scroll',
    function () {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return
      reveal(
        units
          .map(function (u) { return u.el })
          .filter(function (el) { return !el.classList.contains('hs-in') && el.getBoundingClientRect().top < window.innerHeight })
      )
    },
    { passive: true }
  )

  /* Header: hide while scrolling down, show on scroll up or near the top. */
  var header = document.querySelector('.hs-header')
  if (header) {
    var lastY = window.scrollY
    var ticking = false
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return
        ticking = true
        requestAnimationFrame(function () {
          var y = window.scrollY
          var down = y > lastY
          if (Math.abs(y - lastY) > 6) {
            header.classList.toggle('hs-header--hidden', down && y > 160 && !header.contains(document.activeElement))
            lastY = y
          }
          if (y < 160) header.classList.remove('hs-header--hidden')
          ticking = false
        })
      },
      { passive: true }
    )
  }

  window.hsMotionReady = true
})()
