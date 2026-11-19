// ========== Настройки ==========
const CONFIG = {
  telegram: 'https://t.me/milka_plazma',      // ссылка на твой тг
  telegramName: '@milka_plazma',
  github: 'https://github.com/BinaryToucan',  // ссылка на гитхаб
  githubName: 'BinaryToucan',
  email: 'melnikova.emiliya.prog@gmail.com',
  realMe: 'Мельникова Эмилия',
  hh: 'https://spb.hh.ru/resume/6c84c50fff0bff0de50039ed1f4f71626c5649'
};

// ========== Ссылки в футере и на последней секции ==========
document.getElementById('tg-link-footer').querySelector('a').textContent = CONFIG.telegramName;
document.querySelectorAll('.tg-link').forEach(element => {
    element.href = CONFIG.telegram;
});
document.getElementById('contact-github').href = CONFIG.github;
document.getElementById('contact-github').querySelector('small').textContent = CONFIG.githubName; 

const emailLink = document.getElementById('contact-email');
emailLink.href = 'mailto:' + CONFIG.email;
emailLink.querySelector('small').textContent = CONFIG.email;

document.getElementById('contact-resume').href = CONFIG.hh;
document.getElementById('contact-resume').querySelector('small').textContent = CONFIG.realMe;

//document.getElementById('tg-link').textContent = CONFIG.telegramName;
//document.getElementById('gh-link').textContent = CONFIG.githubName;
//emailLink.textContent = CONFIG.email;

// ========== Звёздочка по клику в любое место ==========
document.addEventListener('click', function showClickStar(e) {

  // Не запускаем звёздочки на кнопке конфетти
  if (e.target.closest('.catch-btn')) return;

  const star = document.createElement('span');
  star.className = 'click-star';
  star.textContent = '✦';

  star.style.position = 'fixed';
  star.style.left = `${e.clientX}px`;
  star.style.top = `${e.clientY}px`;
  star.style.pointerEvents = 'none';
  star.style.zIndex = '99999';

  document.body.appendChild(star);

  star.animate([
    {
      transform: 'translate(-50%, -50%) scale(0.4)',
      opacity: 1
    },
    {
      transform: 'translate(-50%, -110%) scale(1.3) rotate(90deg)',
      opacity: 0
    }
  ], {
    duration: 600,
    easing: 'ease-out'
  }).onfinish = () => star.remove();

}, true);

// ========== Кнопки "Далее" ==========
document.querySelectorAll('.next-btn').forEach(btn => {
  //btn.textContent = CONFIG.nextBtnText;
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.next);
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  });
});

// ========== Попап с убегающей кнопкой ==========
const exitBtn = document.getElementById('exit-btn');
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupPlayground = document.getElementById('popup-playground');
const popupSad = document.getElementById('popup-sad');
const popupYes = document.getElementById('popup-yes');
const popupGoodbye = document.getElementById('popup-goodbye');
const popupClose = document.getElementById('popup-close');
const tgFooter = document.getElementById('tg-link-footer');
const contactsSection = document.getElementById('contacts');

let onLastSection = false;

// Открываем попап с нужным контентом
exitBtn.addEventListener('click', () => {
  if (onLastSection) {
    popupTitle.textContent = 'Уже уходите? Не забудьте написать:)';
    popupPlayground.classList.add('hidden');
    popupGoodbye.classList.remove('hidden');
    popupSad.classList.add('hidden');
  } else {
    popupTitle.textContent = 'Неужели не заинтересовала?..:(';
    popupGoodbye.classList.add('hidden');
    popupSad.classList.add('hidden');
    popupPlayground.classList.remove('hidden');
    resetYesButton();
  }
  popup.classList.remove('hidden');
});

popupClose.addEventListener('click', () => popup.classList.add('hidden'));
popup.addEventListener('click', e => {
  if (e.target === popup) popup.classList.add('hidden');
});

const DANGER_RADIUS = 100;
const BTN_PADDING = 15;

function moveYesButton(cursorX, cursorY) {
    const area = popupPlayground.getBoundingClientRect();
    const btn = popupYes.getBoundingClientRect();

    // Координаты курсора относительно игрового поля
    const mouseX = cursorX - area.left;
    const mouseY = cursorY - area.top;

    // Центр кнопки относительно игрового поля
    const btnX = btn.left - area.left + btn.width / 2;
    const btnY = btn.top - area.top + btn.height / 2;

    // Расстояние от курсора до кнопки
    const dx = btnX - mouseX;
    const dy = btnY - mouseY;
    const dist = Math.hypot(dx, dy);

    // Если курсор далеко — ничего не делаем
    if (dist > DANGER_RADIUS) return;

    // Направление побега
    const angle = Math.atan2(dy, dx);

    // Сила побега: чем ближе курсор, тем сильнее
    const strength = 1 - dist / DANGER_RADIUS;

    const maxX = area.width - btn.width - BTN_PADDING;
    const maxY = area.height - btn.height - BTN_PADDING;

    // Текущая позиция кнопки
    const currentX = btn.left - area.left;
    const currentY = btn.top - area.top;

    // Дистанция перемещения
    const escapeDistance = 120 + strength * 100;

    // Новая позиция
    let newX = currentX + Math.cos(angle) * escapeDistance;
    let newY = currentY + Math.sin(angle) * escapeDistance;

    // Ограничиваем игровым полем
    newX = Math.max(BTN_PADDING, Math.min(maxX, newX));
    newY = Math.max(BTN_PADDING, Math.min(maxY, newY));

    // Перемещаем кнопку
    popupYes.style.position = 'absolute';
    popupYes.style.transform = 'none';
    popupYes.style.left = `${newX}px`;
    popupYes.style.top = `${newY}px`;
}

popupPlayground.addEventListener('mousemove', e => {
  const btn = popupYes.getBoundingClientRect();
  const dist = Math.hypot(
    e.clientX - (btn.left + btn.width / 2),
    e.clientY - (btn.top + btn.height / 2)
  );
  if (dist < DANGER_RADIUS) moveYesButton(e.clientX, e.clientY);
});

// На случай, если курсор появился прямо на кнопке
popupYes.addEventListener('mouseenter', e => moveYesButton(e.clientX, e.clientY));

// Клик по "Да"
popupYes.addEventListener('click', () => {
  popupTitle.textContent = 'о ноу.... ту сэд';
  popupPlayground.classList.add('hidden');
  popupSad.classList.remove('hidden');
});


function resetYesButton() {
  popupYes.style.transform = 'translate(-50%, -50%)';
  popupYes.style.left = '50%';
  popupYes.style.top = '50%';
}

// ========== Следим, на последней ли секции находимся ==========
// Чтобы переключать попап и скрывать футер с тг
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      onLastSection = true;
      tgFooter.classList.add('hidden');
    } else {
      onLastSection = false;
      tgFooter.classList.remove('hidden');
    }
  });
}, { threshold: 0.5 });

observer.observe(contactsSection);

// ========== Печатающиеся запросы: SQL и MongoDB по очереди ==========
const QUERIES = [
  {
    file: 'query.sql',
    text: `SELECT category,
       COUNT(*) AS courses_count
FROM courses
GROUP BY category
ORDER BY courses_count DESC;`,
    highlight: highlightSql,
  },
  {
    file: 'query.mongodb',
    text: `db.courses.aggregate([
  { $group: { _id: "$category",
              courses_count: { $sum: 1 } } },
  { $sort: { courses_count: -1 } }
]);`,
    highlight: highlightMongo,
  },
];

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightSql(code) {
  let h = escapeHtml(code);
  h = h.replace(/\b(SELECT|FROM|GROUP BY|ORDER BY|AS|COUNT|DESC|ASC|WHERE|JOIN|ON)\b/g,
                '<span class="tok-kw">$1</span>');
  h = h.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');
  return h;
}

function highlightMongo(code) {
  let h = escapeHtml(code);
  h = h.replace(/\bdb\.\w+(?:\.\w+)?/g, '<span class="tok-fn">$&</span>');
  h = h.replace(/(\$\w+)/g, '<span class="tok-op">$1</span>');
  h = h.replace(/\b(-?\d+)\b/g, '<span class="tok-num">$1</span>');
  return h;
}

(function typeQueries() {
  const codeEl = document.getElementById('sql-typing');
  const titleEl = document.getElementById('sql-window-title');
  if (!codeEl) return;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function run() {
    let qi = 0;
    while (true) {
      const q = QUERIES[qi];
      if (titleEl) titleEl.textContent = q.file;

      // печатаем посимвольно, без подсветки
      for (let i = 1; i <= q.text.length; i++) {
        codeEl.textContent = q.text.slice(0, i);
        await sleep(q.text[i - 1] === '\n' ? 250 : 32);
      }

      // допечатали — включаем подсветку
      codeEl.innerHTML = q.highlight(q.text);
      await sleep(4000);

      // стираем быстро
      for (let i = q.text.length - 1; i >= 0; i--) {
        codeEl.textContent = q.text.slice(0, i);
        await sleep(10);
      }
      await sleep(500);

      qi = (qi + 1) % QUERIES.length; // следующий запрос
    }
  }
  run();
})();

// ========== Дополнение: мобильное меню и подсветка активной секции ==========
(() => {
  const nav = document.querySelector('.top-nav');
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(opened));
    });
    navLinks?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Подсветка активного пункта меню при прокрутке
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (sections.length && links.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
        }
      });
    }, { threshold: 0.45 });
    sections.forEach(sec => spy.observe(sec));
  }

  // Синхронизация контактов из CONFIG для второй контактной секции, если у ссылок не задан href
  const extraContacts = {
    'contact-email': 'mailto:' + CONFIG.email,
    'contact-telegram': CONFIG.telegram,
    'contact-github': CONFIG.github,
  };
  Object.entries(extraContacts).forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (el && (!el.getAttribute('href') || el.getAttribute('href') === '#')) {
      el.setAttribute('href', url);
      if (!url.startsWith('mailto:')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    }
  });
})();
