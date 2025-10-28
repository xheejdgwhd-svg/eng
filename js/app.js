const body = document.body;
const nav = document.querySelector('.nav');
const menuBtn = document.querySelector('.menu-btn');
const themeToggle = document.getElementById('themeToggle');
const caseModal = document.querySelector('.case-modal');
const caseContent = document.getElementById('caseContent');
const contactForm = document.getElementById('contactForm');
const dots = Array.from(document.querySelectorAll('.reviews .dot'));
const reviews = Array.from(document.querySelectorAll('.review'));
const storageKey = 'polaris-theme';

const cases = {
  techflow: {
    title: 'TechFlow',
    summary: 'Обновление бренда и запуск продуктовой платформы SaaS-сервиса B2B сегмента.',
    result: 'Увеличение конверсии регистрации на 37%, рост NPS с 26 до 41 за квартал.',
    stack: ['Discovery workshop', 'UX-исследования', 'Редизайн кабинета', 'Дизайн-система']
  },
  museo: {
    title: 'Museo',
    summary: 'Создание AR-экспозиции и мобильного гида для федеральной музейной сети.',
    result: 'Рост вовлеченности посетителей на 62%, среднее время сессии увеличилось до 18 минут.',
    stack: ['UX-концепция', 'AR-прототипы', 'Продакшн контента', 'Мобильное приложение']
  },
  north: {
    title: 'North Coffee',
    summary: 'Ребрендинг, разработка новой упаковки и запуск e-commerce платформы.',
    result: 'Рост онлайн-продаж в 2,3 раза, ROMI кампании — 540%.',
    stack: ['Исследование аудитории', 'Визуальная система', 'Фото/видео продакшн', 'Shopify-магазин']
  }
};

function restoreTheme() {
  const stored = localStorage.getItem(storageKey);
  if (stored === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeToggle.setAttribute('aria-pressed', 'true');
    themeToggle.textContent = 'Светлая тема';
  }
}

function toggleTheme() {
  const isDark = body.getAttribute('data-theme') === 'dark';
  if (isDark) {
    body.removeAttribute('data-theme');
    themeToggle.setAttribute('aria-pressed', 'false');
    themeToggle.textContent = 'Тёмная тема';
    localStorage.setItem(storageKey, 'light');
  } else {
    body.setAttribute('data-theme', 'dark');
    themeToggle.setAttribute('aria-pressed', 'true');
    themeToggle.textContent = 'Светлая тема';
    localStorage.setItem(storageKey, 'dark');
  }
}

function toggleMenu() {
  const isOpen = nav.getAttribute('data-open') === 'true';
  nav.setAttribute('data-open', isOpen ? 'false' : 'true');
  menuBtn.classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', (!isOpen).toString());
}

function closeMenu() {
  if (nav.getAttribute('data-open') === 'true') {
    nav.setAttribute('data-open', 'false');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
}

function smoothScrollTo(target) {
  const el = document.querySelector(target);
  if (!el) return;
  window.scrollTo({
    top: window.scrollY + el.getBoundingClientRect().top - 72,
    behavior: 'smooth'
  });
}

function openCaseModal(key) {
  const data = cases[key];
  if (!data) return;
  caseContent.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.summary}</p>
    <p><strong>Результат:</strong> ${data.result}</p>
    <h4>Что сделали:</h4>
    <ul>${data.stack.map(item => `<li>${item}</li>`).join('')}</ul>
  `;
  caseModal.setAttribute('open', '');
  caseModal.focus();
}

function closeCaseModal() {
  caseModal.removeAttribute('open');
}

function setActiveReview(index) {
  reviews.forEach((review, i) => {
    review.toggleAttribute('data-active', i === index);
  });
  dots.forEach((dot, i) => {
    dot.setAttribute('aria-pressed', i === index ? 'true' : 'false');
  });
}

function autoRotateReviews() {
  let activeIndex = reviews.findIndex(review => review.hasAttribute('data-active'));
  activeIndex = activeIndex === -1 ? 0 : activeIndex;
  const nextIndex = (activeIndex + 1) % reviews.length;
  setActiveReview(nextIndex);
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = formData.get('name').trim();
  const note = document.getElementById('formNote');
  note.textContent = `${name || 'Спасибо'}! Мы уже пишем вам письмо.`;
  note.classList.add('success');
  contactForm.reset();
}

function initScrollLinks() {
  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', () => {
      smoothScrollTo(btn.getAttribute('data-scroll'));
    });
  });
}

function initNavLinks() {
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      smoothScrollTo(link.getAttribute('href'));
      closeMenu();
    });
  });
}

function initIntersectionEffects() {
  const observed = document.querySelectorAll('.card, .case, .timeline li, .review, .stats div, .form');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  observed.forEach(el => observer.observe(el));
}

menuBtn.addEventListener('click', toggleMenu);
window.addEventListener('resize', () => {
  if (window.innerWidth > 780) {
    nav.removeAttribute('data-open');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

nav.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

caseModal.addEventListener('click', event => {
  if (event.target === caseModal || event.target.classList.contains('case-modal__close')) {
    closeCaseModal();
  }
});

contactForm.addEventListener('submit', handleFormSubmit);
themeToggle.addEventListener('click', toggleTheme);

Array.from(document.querySelectorAll('.case .tag')).forEach(button => {
  button.addEventListener('click', () => openCaseModal(button.dataset.case));
});

initScrollLinks();
initNavLinks();
restoreTheme();
initIntersectionEffects();
setActiveReview(0);

let reviewInterval = setInterval(autoRotateReviews, 6000);

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    clearInterval(reviewInterval);
    setActiveReview(index);
    reviewInterval = setInterval(autoRotateReviews, 6000);
  });
});

caseModal.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeCaseModal();
  }
});
