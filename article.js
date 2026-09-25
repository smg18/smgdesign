// Shared behavior for article-style pages (case studies, concepts, etc.)
// Currently: click-to-zoom lightbox for content images.

(function () {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');

  if (!lightbox || !lightboxImg) return;

  function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.article-content img, .featured-image img').forEach(function (img) {
    img.addEventListener('click', function () {
      openLightbox(img);
    });
  });

  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // Horizontal scroll galleries: a plain vertical mouse wheel does nothing
  // to horizontal overflow by default in most browsers (only trackpad
  // horizontal gestures, dragging, or Shift+wheel work natively). Convert
  // ordinary vertical wheel input into horizontal movement so a normal
  // mouse works too. Only takes over when the gallery actually has
  // horizontal overflow to scroll, and only when the scroll is more
  // vertical than horizontal (so trackpad horizontal gestures, which
  // already work, aren't double-handled).
  document.querySelectorAll('.scroll-gallery').forEach(function (gallery) {
    gallery.addEventListener('wheel', function (e) {
      var canScrollX = gallery.scrollWidth > gallery.clientWidth;
      if (!canScrollX) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      gallery.scrollLeft += e.deltaY;
    }, { passive: false });
  });
})();
