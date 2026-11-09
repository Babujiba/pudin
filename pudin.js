/* PUDiN — моушен: интро, пластинка, линейка, указатель секций, появление блоков (редизайн «ретро-аниме»). */
(() => {
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- плавная прокрутка (Lenis, если загрузился) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    window.__lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (body.classList.contains('is-loading')) lenis.stop();
  }
  const scrollToEl = (el) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY - (el.id === 'top' ? 9999 : 48);
    lenis ? lenis.scrollTo(Math.max(0, y), { duration: 1.4 }) : scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    nav.classList.remove('is-open');
    scrollToEl(el);
  }));

  /* ---------- меню ---------- */
  const nav = $('#nav');
  $('.nav-burger').addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    $('.nav-burger').setAttribute('aria-expanded', open);
  });

  /* ---------- буквы логотипа: случайный разлёт до сборки ---------- */
  $$('.wordmark .ch').forEach((ch, i) => {
    const a = (i / 4) * Math.PI + Math.random() * 0.8;
    ch.style.setProperty('--i', i);
    ch.style.setProperty('--fx', `${Math.cos(a) * (18 + Math.random() * 22)}vw`);
    ch.style.setProperty('--fy', `${(Math.random() - 0.5) * 40}vh`);
    ch.style.setProperty('--fr', `${(Math.random() - 0.5) * 50}deg`);
  });

  /* ---------- интро ---------- */
  const startIntro = async () => {
    if (reduce || !$('.loader')) { ready(); return; }
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);
    // большая точка (крупнее слова) сжимается и улетает на место над «ı»
    const dot = $('.lm-dot'), li = $('.lm-i');
    setTimeout(() => {
      const fs = parseFloat(getComputedStyle($('.lm-word')).fontSize);
      const ir = li.getBoundingClientRect(), dr = dot.getBoundingClientRect();
      const tx = ir.left + ir.width / 2 - (dr.left + dr.width / 2);
      const ty = ir.top + fs * 0.235 - (dr.top + dr.height / 2);
      dot.style.setProperty('--dx', `${tx}px`);
      dot.style.setProperty('--dy', `${ty}px`);
      dot.style.transform = `translate(${tx}px, ${ty}px) scale(${(fs * 0.19) / dr.width})`;
      body.classList.add('is-word');
    }, 800);
    setTimeout(ready, 1800);
  };
  function ready() {
    body.classList.add('is-ready');
    body.classList.remove('is-loading');
    lenis && lenis.start();
  }

  /* ---------- бегущая строка (ускоряется от прокрутки) ---------- */
  (() => {
    const track = $('.marquee-track');
    if (!track) return;
    const ul = $('ul', track);
    for (let k = 0; k < 3; k++) track.appendChild(ul.cloneNode(true));
    let x = 0, last = scrollY, vel = 0, w = 0, on = true, rate = 1;
    const measure = () => { w = ul.offsetWidth; };          // ширину меряем редко, не каждый кадр
    measure(); addEventListener('resize', measure); document.fonts && document.fonts.ready.then(measure);
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(track);
    // пластинка крутится быстрее, пока страницу листают
    const rec = $('.record');
    const recAnim = rec && rec.getAnimations ? rec.getAnimations()[0] : null;
    const loop = () => {
      requestAnimationFrame(loop);
      const dy = scrollY - last; last = scrollY;
      vel += (Math.abs(dy) * 0.25 - vel) * 0.1;
      if (vel < 0.01) vel = 0;
      if (on && !reduce && w) {
        x -= 0.45 + vel;
        if (-x >= w) x += w;
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      if (recAnim && !reduce) {
        const r = Math.round((1 + Math.min(vel, 14) * 0.3) * 10) / 10;
        if (r !== rate) { rate = r; recAnim.playbackRate = r; }
      }
    };
    requestAnimationFrame(loop);
  })();

  /* ---------- появление блоков ---------- */
  $$('[data-reveal-group]').forEach((g) => $$('[data-reveal]', g).forEach((el, i) => {
    el.style.setProperty('--d', (i % 4) * 90);
    el.style.setProperty('--tilt', `${(i % 2 ? 1 : -1) * (1 + (i % 3) * 0.6)}deg`);   // панели ложатся чуть вразнобой
  }));
  $$('.hero [data-reveal]').forEach((el, i) => el.style.setProperty('--d', i * 110));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('[data-reveal]:not(.hero [data-reveal]), .sec, .step').forEach((el) => io.observe(el));
  // герой появляется после интро
  const heroReveal = () => $$('.hero [data-reveal]').forEach((el) => el.classList.add('is-in'));
  new MutationObserver(() => { if (body.classList.contains('is-ready')) heroReveal(); }).observe(body, { attributes: true, attributeFilter: ['class'] });

  /* ---------- линейка справа ---------- */
  const tape = $('.ruler-tape'), mark = $('.ruler-mark'), pct = $('.ruler-pct');
  const STEP = 14, PX = 90;                                           // 1 деление = 90px страницы
  const buildRuler = () => {
    tape.innerHTML = '';
    const n = Math.ceil((document.documentElement.scrollHeight + innerHeight) / PX);
    const frag = document.createDocumentFragment();
    for (let i = 0; i <= n; i++) {
      const s = document.createElement('span');
      s.style.top = `${i * STEP}px`;
      if (i % 5 === 0) { s.className = 'big'; s.innerHTML = `<b>${i}</b>`; }
      frag.appendChild(s);
    }
    tape.appendChild(frag);
  };

  /* ---------- указатель секций ---------- */
  const secs = $$('[data-section]');
  const sxTop = $('.sx-top'), sxBottom = $('.sx-bottom'), vlabel = $('.vlabel');
  let cur = -1;
  const navLinks = $$('.nav-links a');
  const renderSx = (idx) => {
    sxTop.innerHTML = ''; sxBottom.innerHTML = '';
    // как у ArtCraft, но коротко: 2 пройденных, текущая крупно, 3 следующих
    const more = (list, n, before) => {
      const li = document.createElement('li');
      li.className = 'sx-more'; li.textContent = before ? `··· ${n}` : `+${n}`;
      before ? list.prepend(li) : list.appendChild(li);
    };
    secs.forEach((s, i) => {
      if (i < idx - 2 || i > idx + 3) return;
      const li = document.createElement('li');
      li.textContent = s.dataset.section;
      if (s.hasAttribute('data-brand')) li.classList.add('brand');
      li.addEventListener('click', () => scrollToEl(i === 0 ? $('#top') : s));
      if (i < idx) sxTop.appendChild(li);
      else if (i === idx) { li.classList.add('is-current'); sxTop.appendChild(li); }
      else sxBottom.appendChild(li);
    });
    if (idx - 2 > 0) more(sxTop, idx - 2, true);
    if (secs.length - 1 - (idx + 3) > 0) more(sxBottom, secs.length - 1 - (idx + 3), false);
    vlabel.classList.add('is-swap');
    setTimeout(() => {
      vlabel.firstElementChild.textContent = secs[idx].dataset.section;
      vlabel.classList.toggle('brand', secs[idx].hasAttribute('data-brand'));
      vlabel.classList.remove('is-swap');
    }, 250);
    const id = secs[idx].id;
    if (!body.dataset.page) navLinks.forEach((a) => a.classList.toggle('is-active', idx === 0 ? a.getAttribute('href') === '#top' : a.getAttribute('href') === `#${id}`));
  };

  /* ---------- общий обработчик прокрутки ---------- */
  // позиции секций и высоту страницы меряем при изменении размеров, а не на каждый шаг прокрутки
  const portrait = $('.portrait img');
  let tops = [], maxScroll = 1, pTop = 0, pH = 0, ticking = false;
  const measure = () => {
    tops = secs.map((s) => s.getBoundingClientRect().top + scrollY);
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (portrait) { const r = portrait.parentElement.getBoundingClientRect(); pTop = r.top + scrollY; pH = r.height; }
  };
  const onScroll = () => {
    ticking = false;
    const y = scrollY, p = Math.min(1, y / maxScroll), rh = innerHeight - 48;
    tape.style.transform = `translate3d(0, ${(-(y / PX) * STEP + rh * 0.08).toFixed(1)}px, 0)`;
    mark.style.transform = `translate3d(0, ${(p * (rh - 24)).toFixed(1)}px, 0)`;
    pct.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`;

    let idx = 0;
    const line = y + innerHeight * 0.45;
    tops.forEach((t, i) => { if (t < line) idx = i; });
    if (idx !== cur) { cur = idx; renderSx(idx); }

    if (portrait && pH) {
      const top = pTop - y;
      if (top + pH > 0 && top < innerHeight) {
        const k = (top + pH / 2 - innerHeight / 2) / innerHeight;
        portrait.style.transform = `translate3d(0, ${(-8 + k * 14).toFixed(2)}%, 0)`;
      }
    }
  };
  const requestScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  const relayout = () => { buildRuler(); measure(); onScroll(); };
  addEventListener('scroll', requestScroll, { passive: true });
  addEventListener('resize', relayout);
  addEventListener('load', relayout);
  document.fonts && document.fonts.ready.then(relayout);
  if (window.ResizeObserver) new ResizeObserver(() => { measure(); requestScroll(); }).observe(document.body);
  relayout();

  startIntro();
})();
