function setupInfiniteCarousel() {
  const carousel = document.querySelector('[data-infinite-carousel]');
  if (!carousel) return;

  const originalCards = Array.from(carousel.children);
  if (!originalCards.length) return;

  const clonesBefore = originalCards.map(card => card.cloneNode(true));
  const clonesAfter = originalCards.map(card => card.cloneNode(true));

  clonesBefore.forEach(clone => carousel.insertBefore(clone, carousel.firstChild));
  clonesAfter.forEach(clone => carousel.appendChild(clone));

  const originalWidth = carousel.scrollWidth / 3;
  carousel.scrollLeft = originalWidth;

  let isPaused = false;
  let lastTimestamp = null;
  const speed = 0.035; // pixels per ms

  const resetScroll = () => {
    const scrollLeft = carousel.scrollLeft;
    if (scrollLeft <= 1) {
      carousel.scrollLeft = scrollLeft + originalWidth;
    } else if (scrollLeft >= originalWidth * 2 - 1) {
      carousel.scrollLeft = scrollLeft - originalWidth;
    }
  };

  const autoScroll = (timestamp) => {
    if (lastTimestamp !== null && !isPaused) {
      const delta = timestamp - lastTimestamp;
      carousel.scrollLeft += delta * speed;
      resetScroll();
    }
    lastTimestamp = timestamp;
    requestAnimationFrame(autoScroll);
  };

  carousel.addEventListener('mouseenter', () => { isPaused = true; });
  carousel.addEventListener('mouseleave', () => { isPaused = false; });
  carousel.addEventListener('touchstart', () => { isPaused = true; });
  carousel.addEventListener('touchend', () => { isPaused = false; });

  carousel.addEventListener('scroll', resetScroll);
  requestAnimationFrame(autoScroll);
}

function revealOnScroll() {
  const items = document.querySelectorAll('.section, .project-card, .gallery-tile, .text-block, .cv-card, .contact-panel');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}

function init() {
  setupInfiniteCarousel();
  revealOnScroll();
}

document.addEventListener('DOMContentLoaded', init);
