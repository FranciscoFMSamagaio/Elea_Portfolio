(function () {
  const supportedLanguages = ['pt', 'en'];
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const languageIndex = pathParts.findIndex((part) => supportedLanguages.includes(part));
  const pathLanguage = languageIndex >= 0 ? pathParts[languageIndex] : null;
  const storedLanguage = localStorage.getItem('siteLanguage');
  const browserLanguage = (navigator.language || 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en';
  const initialLanguage = pathLanguage || storedLanguage || browserLanguage;
  const assetPrefix = pathLanguage ? '../' : '';

  const fileName = pathLanguage
    ? pathParts[languageIndex + 1] || 'index.html'
    : (window.location.pathname.endsWith('/') ? 'index.html' : pathParts[pathParts.length - 1] || 'index.html');
  const pageKey = fileName.replace('.html', '') || 'index';

  if (!pathLanguage && (fileName === 'index.html' || fileName === '')) {
    localStorage.setItem('siteLanguage', initialLanguage);
    if (window.location.protocol !== 'file:') {
      window.location.replace(new URL(`./${initialLanguage}/`, window.location.href).href);
      return;
    }
  }

  localStorage.setItem('siteLanguage', initialLanguage);

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element && value) element.textContent = value;
  }

  function setAllText(selector, values) {
    if (!Array.isArray(values)) return;
    document.querySelectorAll(selector).forEach((element, index) => {
      if (values[index]) element.textContent = values[index];
    });
  }

  function setAttribute(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element && value) element.setAttribute(attribute, value);
  }

  function applyDataTranslations(t) {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = t(element.dataset.i18n);
      if (value && value !== element.dataset.i18n) element.textContent = value;
    });

    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      const value = t(element.dataset.i18nHtml);
      if (value && value !== element.dataset.i18nHtml) element.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      element.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attribute, key] = pair.split(':').map((part) => part && part.trim());
        if (!attribute || !key) return;
        const value = t(key);
        if (value && value !== key) element.setAttribute(attribute, value);
      });
    });
  }

  function ensureMetaDescription() {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    return meta;
  }

  function ensureLanguageSwitcher(language) {
    const nav = document.querySelector('.nav-links');
    if (!nav || nav.querySelector('.language-switcher')) return;

    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.setAttribute('aria-label', 'Language switcher');
    switcher.innerHTML = `
      <button type="button" data-language="pt">🇵🇹 PT</button>
      <button type="button" data-language="en">🇬🇧 EN</button>
    `;
    nav.appendChild(switcher);

    switcher.addEventListener('click', (event) => {
      const button = event.target.closest('[data-language]');
      if (!button) return;
      changeSiteLanguage(button.dataset.language);
    });

    updateLanguageSwitcher(language);
  }

  function updateLanguageSwitcher(language) {
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.language === language);
    });
  }

  function updateLanguageUrls(language) {
    if (pageKey !== 'index' && !pathLanguage) return;
    const target = pathLanguage
      ? window.location.pathname.replace(`/${pathLanguage}`, `/${language}`)
      : new URL(`./${language}/`, window.location.href).href;
    window.location.href = target;
  }

  async function loadResources(language) {
    const response = await fetch(`${assetPrefix}locales/${language}.json`);
    if (!response.ok) throw new Error(`Could not load ${language}.json`);
    return response.json();
  }

  function applyCommonTranslations(t) {
    const navLinks = document.querySelectorAll('.nav-links > a');
    const navKeys = ['nav.portfolio', 'nav.about', 'nav.cv', 'nav.contact'];
    navLinks.forEach((link, index) => {
      const key = navKeys[index];
      if (key) link.textContent = t(key);
    });
    setText('.site-footer p', t('footer'));
  }

  function applyIndexTranslations(t) {
    setText('.projects-title h2', t('index.projects'));
    setAllText('.project-type', t('index.projectTypes', { returnObjects: true }));
    setAllText('.project-card h3', t('index.projectTitles', { returnObjects: true }));
    setAllText('.project-copy', t('index.projectCopy', { returnObjects: true }));
    setText('.section-gallery .section-label', t('index.otherWork'));
    setText('.section-gallery h2', t('index.otherWorkTitle'));
    setText('.tile-3d', t('index.tiles.modeling'));
    setText('.tile-model', t('index.tiles.model'));
    setText('.tile-drawing', t('index.tiles.drawings'));
    setAttribute('[aria-label="Project carousel controls"]', 'aria-label', t('index.controls.projects'));
    setAttribute('[aria-label="Other work carousel controls"]', 'aria-label', t('index.controls.otherWork'));
    setAttribute('[data-carousel-prev="project-carousel"]', 'aria-label', t('index.controls.previousProjects'));
    setAttribute('[data-carousel-next="project-carousel"]', 'aria-label', t('index.controls.nextProjects'));
    setAttribute('[data-carousel-prev="other-work-carousel"]', 'aria-label', t('index.controls.previousOtherWork'));
    setAttribute('[data-carousel-next="other-work-carousel"]', 'aria-label', t('index.controls.nextOtherWork'));
  }

  function applyPageHeaderTranslations(t) {
    const pageMap = {
      about: () => {
        setText('.section-label', t('pages.about.label'));
        setText('.section-page-header h1', t('pages.about.title'));
        setAllText('.about-text .section-description', [t('pages.about.copy1'), t('pages.about.copy2')]);
        setText('.portrait-caption', t('pages.about.portrait'));
      },
      cv: () => {
        setText('.section-label', t('pages.cv.label'));
        setText('.section-page-header h1', t('pages.cv.title'));
        setText('.section-description', t('pages.cv.description'));
        setText('.button-primary', t('pages.cv.button'));
      },
      contacts: () => {
        setText('.section-label', t('pages.contacts.label'));
        setText('.section-page-header h1', t('pages.contacts.title'));
        setText('.section-page-header p:not(.section-label)', t('pages.contacts.description'));
      },
      drawings: () => {
        setText('.section-label', t('pages.otherWork.label'));
        setText('.section-page-header h1', t('pages.otherWork.drawings'));
      },
      '3d-modeling': () => {
        setText('.section-label', t('pages.otherWork.label'));
        setText('.section-page-header h1', t('pages.otherWork.modeling'));
      },
      'architecture-model': () => {
        setText('.section-label', t('pages.otherWork.label'));
        setText('.section-page-header h1', t('pages.otherWork.model'));
      },
      'project-atelier': () => setText('.section-label', t('pages.project.label')),
      'project-urban': () => setText('.section-label', t('pages.project.label')),
      'project-heritage': () => setText('.section-label', t('pages.project.label'))
    };

    if (pageMap[pageKey]) pageMap[pageKey]();
  }

  function applyMetadata(t) {
    const metadata = t(`metadata.${pageKey}`, { returnObjects: true });
    if (!metadata || typeof metadata !== 'object') return;
    document.title = metadata.title;
    ensureMetaDescription().setAttribute('content', metadata.description);
  }

  function applyTranslations(language) {
    const t = i18next.t.bind(i18next);
    document.documentElement.lang = language;
    applyMetadata(t);
    applyCommonTranslations(t);
    applyDataTranslations(t);
    if (pageKey === 'index') applyIndexTranslations(t);
    applyPageHeaderTranslations(t);
    ensureLanguageSwitcher(language);
    updateLanguageSwitcher(language);
  }

  async function changeSiteLanguage(language) {
    if (!supportedLanguages.includes(language)) return;
    localStorage.setItem('siteLanguage', language);
    if (pageKey === 'index') {
      updateLanguageUrls(language);
      return;
    }
    const resources = await loadResources(language);
    i18next.addResourceBundle(language, 'translation', resources, true, true);
    await i18next.changeLanguage(language);
    applyTranslations(language);
  }

  window.changeSiteLanguage = changeSiteLanguage;

  async function initI18n() {
    if (!window.i18next) return;
    const resources = await loadResources(initialLanguage);
    await i18next.init({
      lng: initialLanguage,
      fallbackLng: 'en',
      resources: {
        [initialLanguage]: {
          translation: resources
        }
      }
    });
    applyTranslations(initialLanguage);
  }

  initI18n().catch((error) => {
    console.warn(error);
    ensureLanguageSwitcher(initialLanguage);
  });
})();
