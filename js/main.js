function setupCarousels() {
  const carousels = document.querySelectorAll('[data-carousel]');
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const previousButton = document.querySelector(`[data-carousel-prev="${carousel.id}"]`);
    const nextButton = document.querySelector(`[data-carousel-next="${carousel.id}"]`);
    const firstItem = carousel.firstElementChild;
    if (!firstItem || !previousButton || !nextButton) return;

    const getStep = () => firstItem.getBoundingClientRect().width + 24;
    const maxScroll = () => carousel.scrollWidth - carousel.clientWidth - 2;

    const updateButtons = () => {
      previousButton.disabled = carousel.scrollLeft <= 2;
      nextButton.disabled = carousel.scrollLeft >= maxScroll();
    };

    previousButton.addEventListener('click', () => {
      carousel.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    nextButton.addEventListener('click', () => {
      carousel.scrollBy({ left: getStep(), behavior: 'smooth' });
    });

    carousel.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  });
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
  setupCarousels();
  revealOnScroll();
}

document.addEventListener('DOMContentLoaded', init);
