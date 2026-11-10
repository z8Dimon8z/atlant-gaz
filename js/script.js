document.addEventListener('DOMContentLoaded', () => {
  initPopup();
  initForms();
  initVolume();
  initReviews();
  initFaq();
  initReveal();
  initCounters();
});

/* ===== Попап ===== */
function initPopup() {
  const popup = document.getElementById('popup');
  const title = document.getElementById('popupTitle');
  const defaultTitle = title.innerHTML;

  const open = (text) => {
    title.innerHTML = text ? text.replace(/(за \d+ часа)/i, '<br>$1') : defaultTitle;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(() => popup.querySelector('input').focus(), 300);
  };

  const close = () => {
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  };

  document.querySelectorAll('[data-popup]').forEach((btn) => {
    btn.addEventListener('click', () => open(btn.dataset.popup));
  });
  popup.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('is-open')) close();
  });
}

/* ===== Формы: маска телефона и валидация ===== */
function initForms() {
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener('focus', () => { if (!input.value) input.value = '+7 '; });
    input.addEventListener('input', () => {
      let digits = input.value.replace(/\D/g, '');
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (!digits.startsWith('7')) digits = '7' + digits;
      digits = digits.slice(0, 11);

      const p = digits.slice(1);
      let out = '+7';
      if (p.length) out += ' (' + p.slice(0, 3);
      if (p.length >= 3) out += ') ' + p.slice(3, 6);
      if (p.length >= 6) out += '-' + p.slice(6, 8);
      if (p.length >= 8) out += '-' + p.slice(8, 10);
      input.value = out;
    });
    input.addEventListener('blur', () => { if (input.value.trim() === '+7') input.value = ''; });
  });

  document.querySelectorAll('[data-form]').forEach((form) => {
    const status = form.querySelector('.form__status');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const name = form.elements.name;
      const phone = form.elements.phone;
      [name, phone].forEach((el) => el.classList.remove('is-error'));

      if (name.value.trim().length < 2) { name.classList.add('is-error'); valid = false; }
      if (phone.value.replace(/\D/g, '').length !== 11) { phone.classList.add('is-error'); valid = false; }

      if (!valid) {
        status.style.color = '#ff6b6b';
        status.textContent = 'Проверьте имя и номер телефона';
        return;
      }

      // Здесь можно подключить отправку на сервер (fetch)
      status.style.color = '';
      status.textContent = 'Спасибо! Мы перезвоним вам в течение 5 минут.';
      form.reset();
      setTimeout(() => { status.textContent = ''; }, 5000);
    });

    form.querySelectorAll('.input').forEach((el) => {
      el.addEventListener('input', () => el.classList.remove('is-error'));
    });
  });
}

/* ===== Выбор объёма газовоза ===== */
function initVolume() {
  const variants = [
    { scale: 0.85, info: '<b>2000 л.</b> — идеально для частного дома' },
    { scale: 0.92, info: '<b>6000 л.</b> — для коттеджа и небольшого посёлка' },
    { scale: 1, info: '<b>10 000 л.</b> — для предприятий и котельных' },
    { scale: 1.08, info: '<b>40 000 л.</b> — оптовые поставки' },
  ];

  const truck = document.getElementById('volumeTruck');
  const info = document.getElementById('volumeInfo');
  const tabs = document.querySelectorAll('.volume__tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      const v = variants[tab.dataset.volume];
      truck.style.transform = `scale(${v.scale})`;
      info.innerHTML = 'Объём цистерны: ' + v.info;
    });
  });
}

/* ===== Слайдер отзывов ===== */
function initReviews() {
  const reviews = [
    { name: 'Ольга И.', city: 'Красногорск', photo: 'img/review-olga.jpg', text: 'Я всегда боюсь газа, а особенно боюсь что он может взорваться, как же мне помог Андрей водитель-экспедитор, показал что бояться тут нечего и самое главное мое присутствие даже не понадобится. Спасибо компании за то что они все закрыли этот вопрос под ключ.' },
    { name: 'Сергей П.', city: 'Видное', photo: 'img/review-2.jpg', text: 'Заказал газ вечером, утром уже был полный газгольдер. Водитель аккуратно протянул шланг через забор, газон не пострадал. Цена ниже, чем у прошлого поставщика.' },
    { name: 'Марина К.', city: 'Домодедово', photo: 'img/review-3.jpg', text: 'Пользуемся услугами второй год. Всегда приезжают вовремя, предоставляют все документы и сертификат качества. Рекомендую соседям.' },
    { name: 'Алексей Д.', city: 'Подольск', photo: 'img/review-4.jpg', text: 'Нужна была срочная заправка в праздники — привезли за 3 часа. Оплатил картой прямо водителю через терминал. Очень удобно.' },
    { name: 'Наталья В.', city: 'Истра', photo: 'img/review-5.jpg', text: 'Понравилась консультация менеджера Романа: подсказал оптимальное соотношение пропан-бутана на зиму. Дом тёплый, расход меньше.' },
  ];

  const track = document.querySelector('.slider__track');
  const dotsWrap = document.querySelector('.slider__dots');
  let index = 0;
  let timer;

  track.innerHTML = reviews.map((r) => `
    <article class="review">
      <div class="review__photo" data-letter="${r.name[0]}">${r.photo ? `<img src="${r.photo}" alt="${r.name}" loading="lazy" onerror="this.remove()">` : ''}</div>
      <div>
        <h3 class="review__name">${r.name}</h3>
        <p class="review__city">${r.city}</p>
        <p class="review__text">${r.text}</p>
      </div>
    </article>`).join('');

  dotsWrap.innerHTML = reviews.map((_, i) =>
    `<button class="slider__dot" aria-label="Отзыв ${i + 1}" data-i="${i}"></button>`).join('');
  const dots = dotsWrap.querySelectorAll('.slider__dot');

  const go = (i) => {
    index = (i + reviews.length) % reviews.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
  };

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 6000);
  };

  document.querySelector('.slider__arrow--prev').addEventListener('click', () => { go(index - 1); restart(); });
  document.querySelector('.slider__arrow--next').addEventListener('click', () => { go(index + 1); restart(); });
  dots.forEach((d) => d.addEventListener('click', () => { go(+d.dataset.i); restart(); }));

  // Свайп на мобильных
  let startX = null;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  });

  go(0);
  restart();
}

/* ===== FAQ: открыт только один пункт ===== */
function initFaq() {
  const items = document.querySelectorAll('.faq__item');
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) items.forEach((other) => { if (other !== item) other.open = false; });
    });
  });
}

/* ===== Появление блоков при скролле ===== */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 3) * 0.1}s`;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
}

/* ===== Счётчики процентов ===== */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const animate = (el) => {
    const target = +el.dataset.count;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
    });
  });
  counters.forEach((el) => io.observe(el));
}
