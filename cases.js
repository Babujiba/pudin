/* PUDiN — работы на витрине (секция «Работы» на главной).
   Наполнение: заполни поля у работы — карточка и плеер появятся сами. Первая работа направления — крупная.
   Пока видео нет (video: ''), вместо плеера стоит заглушка «Видео скоро».
   cat:   'music' | 'video' | 'animation' — в каком направлении показывать.
   kind:  короткая подпись над названием (Клип, Заставка…).
   video: ''                        → заглушка плеера
          'video/имя.mp4'          → свой файл (рядом poster: 'img/кадр.jpg')
          'https://…/embed/…'      → встроенный плеер (YouTube, Rutube, VK Видео, Vimeo — ссылка «для вставки»)
   ratio: '16/9' (горизонталь) или '9/16' (рилс) — пропорции плеера во весь экран. Клиентов в подписях не указываем. */
window.PUDIN_CASES = [
  /* ---------- Музыка ---------- */
  { id: 'case-01', cat: 'music', kind: 'Выпускной · 2025', ratio: '16/9', title: 'Выпускной 2025',
    text: 'Поздравление выпускникам от родителей: записал песню и снял к ней клип.',
    video: '', poster: '' },
  { id: 'case-02', cat: 'music', kind: 'Выпускной · 2026', ratio: '16/9', title: 'Выпускной 2026',
    text: 'Музыкальное поздравление от родителей: запись песни и съёмка.',
    video: '', poster: '' },
  { id: 'case-03', cat: 'music', kind: 'Комедийная постановка · 2026', ratio: '16/9', title: 'Постановка с родителями',
    text: 'Комедийная постановка с родителями: съёмка и монтаж.',
    video: '', poster: '' },
  /* ---------- Видео ---------- */
  { id: 'case-04', cat: 'video', kind: 'История компании', ratio: '16/9', title: 'Sony Ericsson',
    text: 'Ролик об истории компании для англоязычного YouTube.',
    video: '', poster: '' },
  { id: 'case-05', cat: 'video', kind: 'История компании', ratio: '16/9', title: 'PlayStation',
    text: 'Ролик об истории компании для англоязычного YouTube.',
    video: '', poster: '' },
  { id: 'case-06', cat: 'video', kind: 'История компании', ratio: '16/9', title: 'IBM',
    text: 'Ролик об истории компании для англоязычного YouTube.',
    video: '', poster: '' },
  /* ---------- Анимация ---------- */
  { id: 'case-07', cat: 'animation', kind: 'Мультфильм · реклама', ratio: '16/9', title: 'Последний почтальон',
    text: 'Рекламный мультфильм для сервиса открыток.',
    video: 'https://vkvideo.ru/video_ext.php?oid=-242891921&id=456239020&hd=2&autoplay=1', poster: 'img/cover-pochtalyon.jpg' },
  { id: 'case-08', cat: 'animation', kind: 'Моушн-дизайн · реклама', ratio: '16/9', title: 'PLAVNO',
    text: 'Рекламный моушн-ролик SaaS-сервиса.',
    video: 'https://vkvideo.ru/video_ext.php?oid=-242891921&id=456239022&hd=2&autoplay=1', poster: 'img/cover-plavno.webp' },
  { id: 'case-09', cat: 'animation', kind: 'Мультфильм · реклама', ratio: '16/9', title: 'ЛингВинни',
    text: 'Рекламный мультфильм для языковой школы.',
    video: 'https://vkvideo.ru/video_ext.php?oid=-242891921&id=456239021&hd=2&autoplay=1', poster: 'img/cover-lingvinni.jpg' },
];

/* ---------- отрисовка и плеер во весь экран ---------- */
(() => {
  const cases = window.PUDIN_CASES;
  const CATS = { music: 'Музыка', video: 'Видео', animation: 'Анимация' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (c) => String(cases.indexOf(c) + 1).padStart(2, '0');
  const isEmbed = (v) => /^https?:\/\//.test(v) && !/\.(mp4|webm|mov)(\?|$)/i.test(v);

  // плеер: заглушка → файл → встроенный плеер
  const player = (c, big) => {
    if (big && c.video) {
      if (isEmbed(c.video)) return `<iframe src="${esc(c.video)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen loading="lazy" title="${esc(c.title)}"></iframe>`;
      return `<video src="${esc(c.video)}" ${c.poster ? `poster="${esc(c.poster)}"` : ''} controls playsinline preload="metadata"></video>`;
    }
    const bg = c.poster ? `<img src="${esc(c.poster)}" alt="" loading="lazy">` : '';
    return `<span class="ph ${c.poster ? 'has-poster' : ''}">${bg}
      <span class="ph-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg></span>
      <span class="ph-label">${c.video ? 'Смотреть' : 'Видео скоро'}</span>
    </span>`;
  };

  // карточки направлений: <div data-works="music">
  const boxes = document.querySelectorAll('[data-works]');
  boxes.forEach((box) => {
    box.innerHTML = cases.filter((c) => c.cat === box.dataset.works).map((c) => `
      <a class="work" href="#${c.id}" data-case="${c.id}">
        <span class="work-media">${player(c, false)}</span>
        <span class="work-body">
          <span class="work-kind">${esc(c.kind)}</span>
          <span class="work-t">${esc(c.title)}</span>
          <span class="work-p">${esc(c.text)}</span>
        </span>
      </a>`).join('');
  });

  const modal = document.querySelector('.case-modal');
  if (!modal) return;
  const toast = (() => {
    const el = document.createElement('div');
    el.className = 'toast'; document.body.appendChild(el);
    let t; return (msg) => { el.textContent = msg; el.classList.add('is-on'); clearTimeout(t); t = setTimeout(() => el.classList.remove('is-on'), 1800); };
  })();
  const copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg);
  };
  const baseUrl = () => location.href.split('#')[0];

  // ссылка вида index.html#case-03 открывает работу сразу
  const n = cases.length;
  let current = null;
  const open = (id, push) => {
    const c = cases.find((x) => x.id === id);
    if (!c) return;
    current = c;
    modal.querySelector('.cm-hud span').textContent = `${CATS[c.cat]} · ${c.kind}`;
    const stage = modal.querySelector('.cm-player');
    stage.style.aspectRatio = c.ratio; stage.classList.toggle('is-vertical', c.ratio === '9/16');
    const [rw, rh] = c.ratio.split('/').map(Number);
    modal.style.setProperty('--ar', rw / rh);   // окно подстраивается под пропорции плеера
    stage.innerHTML = player(c, true);
    modal.querySelector('.cm-title').textContent = c.title;
    modal.querySelector('.cm-task').textContent = c.text;
    modal.classList.add('is-open'); document.documentElement.classList.add('modal-open');
    window.__lenis && window.__lenis.stop();
    if (push) history.pushState(null, '', `#${c.id}`);
  };
  const close = (push) => {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open'); document.documentElement.classList.remove('modal-open');
    modal.querySelector('.cm-player').innerHTML = ''; current = null;
    window.__lenis && window.__lenis.start();
    if (push) history.pushState(null, '', location.pathname + location.search);
  };
  const step = (d) => {
    if (!current) return;
    const next = cases[(cases.indexOf(current) + d + n) % n];
    open(next.id, false); history.replaceState(null, '', `#${next.id}`);
  };
  boxes.forEach((box) => box.addEventListener('click', (e) => {
    const a = e.target.closest('.work'); if (!a) return;
    e.preventDefault(); open(a.dataset.case, true);
  }));
  modal.querySelector('.cm-close').addEventListener('click', () => close(true));
  modal.querySelector('.cm-bg').addEventListener('click', () => close(true));
  modal.querySelector('.cm-prev').addEventListener('click', () => step(-1));
  modal.querySelector('.cm-next').addEventListener('click', () => step(1));
  modal.querySelector('.cm-copy').addEventListener('click', () => current && copy(`${baseUrl()}#${current.id}`, 'Ссылка на работу скопирована'));
  addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close(true);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  const fromHash = () => { const id = location.hash.slice(1); id.startsWith('case-') ? open(id, false) : close(false); };
  addEventListener('popstate', fromHash);
  fromHash();
})();
