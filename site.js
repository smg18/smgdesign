// Shared behaviour for every page: reveal-on-scroll, hero fade, image lightbox, gallery wheel.
// Theme (dark default, ?light easter egg) is applied by the tiny inline script in each <head>.
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll
  var items = [].slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  // Home: the pinned header fades as the page scrolls over it
  var hero = document.querySelector('.hero-in'), queued = false;
  function tick() {
    queued = false;
    if (!hero || reduce) return;
    var p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85)));
    hero.style.opacity = (1 - p).toFixed(3);
    hero.style.transform = 'translate3d(0,' + (-p * 30).toFixed(1) + 'px,0) scale(' + (1 - p * 0.03).toFixed(4) + ')';
  }
  if (hero) {
    window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(tick); } }, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  // Lightbox: any element with [data-zoom] (shots on home, images in articles).
  var lb, img, cap, list = [], ix = 0, opener = null, startX = 0;
  function build() {
    if (lb) return;
    lb = document.createElement('div');
    lb.id = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<button class="x" aria-label="Close">&times;</button><button class="p" aria-label="Previous image">&lsaquo;</button><button class="n" aria-label="Next image">&rsaquo;</button><img alt=""><div class="cap"></div>';
    document.body.appendChild(lb);
    img = lb.querySelector('img');
    cap = lb.querySelector('.cap');
    lb.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b && b.classList.contains('p')) return show(ix - 1);
      if (b && b.classList.contains('n')) return show(ix + 1);
      close();
    });
    lb.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var d = e.changedTouches[0].clientX - startX;
      if (Math.abs(d) > 50 && list.length > 1) show(ix + (d < 0 ? 1 : -1));
    }, { passive: true });
  }
  function show(n) {
    ix = (n + list.length) % list.length;
    var el = list[ix], im = el.tagName === 'IMG' ? el : el.querySelector('img');
    img.src = im.currentSrc || im.src;
    img.alt = im.alt || '';
    cap.textContent = el.getAttribute('data-caption') || im.alt || '';
    if (list.length > 1) { var s = document.createElement('span'); s.textContent = (ix + 1) + ' / ' + list.length; cap.appendChild(s); }
    lb.classList.toggle('single', list.length < 2);
  }
  function open(el) {
    build();
    list = [].slice.call((el.closest('main') || document).querySelectorAll('[data-zoom]'));
    opener = el;
    show(list.indexOf(el));
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.x').focus();
  }
  function close() {
    if (!lb) return;
    lb.classList.remove('on');
    img.removeAttribute('src');
    document.body.style.overflow = '';
    if (opener && opener.focus) opener.focus();
  }
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]');
    if (z && !(lb && lb.contains(z))) { e.preventDefault(); open(z); }
  });
  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(ix - 1);
    if (e.key === 'ArrowRight') show(ix + 1);
  });

  // Horizontal galleries: let a normal mouse wheel scroll them sideways.
  document.querySelectorAll('.scroll-gallery').forEach(function (g) {
    g.addEventListener('wheel', function (e) {
      if (g.scrollWidth <= g.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      g.scrollLeft += e.deltaY;
    }, { passive: false });
  });
})();
