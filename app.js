(() => {
  'use strict';

  const CFG = window.KOPER_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    products: [], cats: [], byId: new Map(),
    user: null, favs: new Set(), leads: [],
    cat: 'all', tab: 'saved', authMode: 'login', mode: 'usual',
    calcText: '',
  };

  /* ---------------------------------------------------------------- иконки товаров */
  const ICONS = {
    wardrobe: '<rect x="38" y="14" width="84" height="88" rx="3"/><path d="M80 14v88M72 52v14M88 52v14M44 102v8M116 102v8"/>',
    kitchen: '<rect x="22" y="16" width="116" height="24" rx="2"/><path d="M60 16v24M100 16v24"/><path d="M18 62h124" stroke-width="3.4"/><rect x="26" y="66" width="108" height="40" rx="2"/><path d="M62 66v40M98 66v40"/>',
    shelf: '<rect x="50" y="22" width="60" height="36" rx="3"/><path d="M80 58v8"/><rect x="26" y="66" width="108" height="32" rx="3"/><path d="M80 66v32M26 98v8M134 98v8"/>',
    sofa: '<path d="M38 60V50a12 12 0 0 1 12-12h60a12 12 0 0 1 12 12v10"/><rect x="22" y="58" width="116" height="32" rx="9"/><path d="M80 60v30M36 90v10M124 90v10"/>',
    armchair: '<path d="M54 64V44a12 12 0 0 1 12-12h28a12 12 0 0 1 12 12v20"/><rect x="38" y="62" width="14" height="30" rx="6"/><rect x="108" y="62" width="14" height="30" rx="6"/><rect x="50" y="68" width="60" height="24" rx="6"/><path d="M52 92v10M108 92v10"/>',
    table: '<ellipse cx="80" cy="46" rx="56" ry="11"/><path d="M80 57v43"/><ellipse cx="80" cy="102" rx="26" ry="5"/>',
    chair: '<path d="M52 64V22h56v42"/><path d="M80 22v42"/><rect x="46" y="64" width="68" height="9" rx="3"/><path d="M52 73l-3 32M108 73l3 32"/>',
    desk: '<rect x="20" y="42" width="120" height="9" rx="3"/><rect x="26" y="51" width="38" height="50" rx="2"/><path d="M26 76h38M45 62v2M45 88v2M134 51v50"/>',
    door: '<rect x="50" y="12" width="60" height="98" rx="2"/><rect x="59" y="22" width="42" height="34" rx="1"/><rect x="59" y="64" width="42" height="36" rx="1"/><circle cx="102" cy="62" r="2.6"/>',
    'door-arch': '<path d="M50 110V48a30 30 0 0 1 60 0v62z"/><path d="M80 18v92"/><circle cx="72" cy="66" r="2.6"/><circle cx="88" cy="66" r="2.6"/>',
    parquet: '<rect x="22" y="16" width="116" height="88" rx="3"/><path d="M22 40l14-9 14 9 14-9 14 9 14-9 14 9 14-9 14 9M22 62l14-9 14 9 14-9 14 9 14-9 14 9 14-9 14 9M22 84l14-9 14 9 14-9 14 9 14-9 14 9 14-9 14 9" fill="none"/>',
    planks: '<rect x="22" y="18" width="116" height="84" rx="3"/><path d="M22 46h116M22 74h116M70 18v28M112 46v28M52 74v28"/>',
    wallpaper: '<path d="M30 28v62"/><path d="M78 28v62"/><ellipse cx="54" cy="28" rx="24" ry="8"/><ellipse cx="54" cy="28" rx="6" ry="2"/><path d="M30 90a24 8 0 0 0 48 0"/><path d="M78 90h58V40H92"/><circle cx="104" cy="56" r="3"/><circle cx="122" cy="56" r="3"/><circle cx="113" cy="72" r="3"/>',
    bucket: '<path d="M38 42h84l-8 58H46z"/><ellipse cx="80" cy="42" rx="42" ry="7"/><path d="M42 42a38 28 0 0 1 76 0"/><path d="M72 70c0-8 6-12 12-12 0 8-4 14-12 12zM72 70v8"/>',
    panels: '<rect x="24" y="16" width="112" height="88" rx="3"/><path d="M42 16v88M58 16v88M80 16v88M98 16v88M116 16v88"/><path d="M32 40c4 6 2 14-2 20M68 50c-3 8-1 16 3 22M108 34c4 8 2 16-2 24"/>',
    plinth: '<path d="M18 92h124"/><rect x="18" y="74" width="124" height="18" rx="2"/><path d="M18 82h124"/><path d="M26 30h108M26 46h108M26 62h108" stroke-dasharray="3 7"/>',
    faucet: '<path d="M60 100V50a24 24 0 0 1 24-24h24v22"/><rect x="104" y="48" width="10" height="7" rx="2"/><path d="M60 40l-16-7"/><rect x="48" y="100" width="24" height="8" rx="2"/><path d="M109 66v4M109 78v4"/>',
    bathtub: '<path d="M18 58h124v10a24 24 0 0 1-24 24H42a24 24 0 0 1-24-24z"/><path d="M40 92l-3 10M120 92l3 10"/><path d="M118 58V34h-16"/><path d="M30 44c0-6 6-8 6-14M46 44c0-6 6-8 6-14"/>',
    toilet: '<rect x="86" y="18" width="40" height="34" rx="6"/><path d="M38 58h78v8c0 24-18 32-39 32S38 90 38 66z"/><path d="M62 98v8h30v-8"/><path d="M100 34h12"/><path d="M46 28v14M39 35h14"/>',
    vanity: '<rect x="24" y="58" width="112" height="46" rx="3"/><path d="M80 58v46M70 80v4M90 80v4"/><rect x="18" y="48" width="124" height="10" rx="3"/><path d="M56 48a24 16 0 0 1 48 0z"/><path d="M80 20v10h10"/>',
    sink: '<path d="M26 48h108c0 26-24 40-54 40S26 74 26 48z"/><path d="M80 48V28h14"/><path d="M80 88v14M60 102h40"/><circle cx="128" cy="26" r="13"/><path d="M121 26l5 5 9-10"/>',
    counter: '<path d="M34 72l20-32h88l-20 32z"/><path d="M34 72h88v14H34z"/><path d="M122 72l20-32v14l-20 32"/><circle cx="64" cy="54" r="1.6"/><circle cx="84" cy="48" r="1.6"/><circle cx="102" cy="58" r="1.6"/><circle cx="116" cy="48" r="1.6"/><path d="M40 86v18M116 86v18"/>',
    box: '<rect x="34" y="34" width="92" height="64" rx="4"/><path d="M34 54h92"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 160 120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.box}</svg>`;
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"/></svg>';

  /* ---------------------------------------------------------------- сервер */
  async function api(path, opts = {}) {
    const o = { method: opts.method || 'GET', headers: {}, credentials: 'same-origin' };
    if (opts.body !== undefined) {
      o.headers['Content-Type'] = 'application/json';
      o.body = JSON.stringify(opts.body);
    }
    let res;
    try { res = await fetch(path, o); }
    catch { throw new Error('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.'); }
    let data = null;
    try { data = await res.json(); } catch { /* ответ без тела */ }
    if (!res.ok) throw new Error((data && data.error) || 'Что-то пошло не так. Попробуйте ещё раз.');
    return data;
  }

  /* ---------------------------------------------------------------- помощники */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* приватный режим */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ничего */ } },
  };

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  const FORMATS = { vip: 'VIP-сопровождение', group: 'Группа 3–5 клиентов', office: 'Выбор в офисе', unknown: 'Формат не выбран' };
  const BUDGETS = { lt5: 'до 5 млн ₸', '5-15': '5–15 млн ₸', '10-20': '10–20 млн ₸', '20-40': '20–40 млн ₸', gt40: 'более 40 млн ₸', unknown: 'бюджет не указан' };
  const STATUS = { new: ['Принята', 'st-new'], work: ['В работе', 'st-work'], done: ['Закрыта', 'st-done'] };

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  /* ---------------------------------------------------------------- избранное */
  function loadLocalFavs() {
    const ids = store.get('koper_favs');
    if (Array.isArray(ids)) ids.forEach((id) => state.byId.has(id) && state.favs.add(id));
  }
  const saveLocalFavs = () => store.set('koper_favs', [...state.favs]);

  let syncChain = Promise.resolve();
  function syncFavs() {
    if (!state.user) return;
    const ids = [...state.favs];
    syncChain = syncChain
      .then(() => api('/api/favorites', { method: 'PUT', body: { ids } }))
      .catch(() => toast('Не удалось сохранить подборку в кабинете. Проверьте связь.'));
  }

  function toggleFav(id, btn) {
    if (!state.byId.has(id)) return;
    const on = !state.favs.has(id);
    on ? state.favs.add(id) : state.favs.delete(id);
    saveLocalFavs();
    syncFavs();
    if (btn) {
      btn.setAttribute('aria-pressed', on);
      btn.setAttribute('aria-label', (on ? 'Убрать из сохранённого: ' : 'Сохранить: ') + state.byId.get(id).title);
      if (on && !reduceMotion) { btn.classList.remove('pop-anim'); void btn.offsetWidth; btn.classList.add('pop-anim'); }
    }
    renderFavUI();
    if (on && state.favs.size === 1 && !state.user) toast(CFG.static ? 'Сохранено в этом браузере. Подборка попадёт в сообщение нам.' : 'Сохранено. Войдите в кабинет, чтобы подборка осталась с вами.');
  }

  function renderFavUI() {
    const n = state.favs.size;
    $('#favCount').textContent = n;
    $('#openFav').classList.toggle('has', n > 0);
    $('#favbarCount').textContent = n;
    $('#tabSavedN').textContent = n;
    const drawerOpen = $('#drawer').classList.contains('open');
    $('#favbar').hidden = n === 0 || drawerOpen;
    updateMcta();
    $$('#grid .fav').forEach((b) => b.setAttribute('aria-pressed', state.favs.has(b.dataset.id)));
    renderLeadItems();
    if (drawerOpen) renderDrawer(true);
  }

  /* ---------------------------------------------------------------- каталог */
  function cardHTML(p) {
    const cat = state.cats.find((c) => c.id === p.cat);
    const on = state.favs.has(p.id);
    const media = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`
      : icon(p.icon);
    return `<article class="card">
      <div class="tile t${(p.tone || 0) % 4}">${media}${p.tag ? `<span class="card-tag">${esc(p.tag)}</span>` : ''}</div>
      <button class="fav" type="button" data-id="${esc(p.id)}" aria-pressed="${on}" aria-label="${on ? 'Убрать из сохранённого: ' : 'Сохранить: '}${esc(p.title)}">${HEART}</button>
      <div class="card-b"><span class="card-cat">${esc(cat ? cat.title : '')}</span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></div>
    </article>`;
  }

  function renderCatalog() {
    const chips = [{ id: 'all', title: 'Всё' }, ...state.cats];
    $('#chips').innerHTML = chips.map((c) => {
      const n = c.id === 'all' ? state.products.length : state.products.filter((p) => p.cat === c.id).length;
      return `<button class="chip" type="button" role="tab" aria-selected="${c.id === state.cat}" data-cat="${esc(c.id)}">${esc(c.title)}<span>${n}</span></button>`;
    }).join('');
    const group = state.cat.split('+');  // «soft+tables»: направление из нескольких категорий
    const items = state.cat === 'all' ? state.products : state.products.filter((p) => group.includes(p.cat));
    $('#grid').innerHTML = items.length ? items.map(cardHTML).join('') : '<p class="empty">В этой категории пока пусто.</p>';
  }

  /* ---------------------------------------------------------------- цепочка цены */
  const FOUR = {
    usual: [
      ['Посредники', 'Дизайнеры работают со своими поставщиками и закладывают наценку.'],
      ['Сопровождение и гиды', 'Услуги гидов и агентов добавляют свою маржу к цене товара.'],
      ['Доставка и логистика', 'Цепочка из нескольких звеньев удорожает каждую позицию.'],
      ['Нет прозрачности', 'Клиент не знает реальной цены завода и за что именно платит.'],
    ],
    kopir: [
      ['Напрямую с заводом', 'Переговоры о цене и скидках мы ведём на стороне клиента.'],
      ['Эксперт рядом', 'Знание китайского языка, ремонта и интерьера. Только интересы клиента.'],
      ['Карго на вашей стороне', 'Доставка идёт карго, клиент оплачивает её сам.'],
      ['Прозрачность', 'Клиент платит заводу и карго сам и видит реальные цены.'],
    ],
  };

  function setMode(mode) {
    state.mode = mode;
    $('#chain').dataset.mode = mode;
    $('.bar').dataset.mode = mode;
    $$('.seg button').forEach((b) => b.setAttribute('aria-selected', b.dataset.mode === mode));
    $('#cargoTitle').textContent = mode === 'kopir' ? 'Карго' : 'Логистика';
    $('#cargoSub').textContent = mode === 'kopir' ? 'платит клиент' : 'несколько звеньев';
    $('#barCap').innerHTML = mode === 'kopir'
      ? 'Вы платите <b>цену завода</b>, доставку карго и сопровождение по выбранному формату. Все цены видны.'
      : 'Вы платите в среднем на <b>20–30% больше</b> цены завода.';
    const ul = $('#four');
    ul.classList.toggle('is-kopir', mode === 'kopir');
    ul.innerHTML = FOUR[mode].map(([h, t]) => `<li><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('');
  }

  /* ---------------------------------------------------------------- эффекты страницы */
  const navLinks = new Map();

  // на телефоне внизу висит кнопка «Оставить заявку»; прячем её у формы, при сохранённом и в кабинете
  function updateMcta() {
    const m = $('#mcta');
    if (!m) return;
    const leadTop = $('#lead').getBoundingClientRect().top;
    m.classList.toggle('show', scrollY > 640 && leadTop > innerHeight - 120 && $('#favbar').hidden && !$('#drawer').classList.contains('open'));
  }

  function setupPage() {
    const prog = $('#prog'), hdr = $('#hdr');
    $$('#nav a').forEach((a) => navLinks.set(a.getAttribute('href').slice(1), a));
    const tick = () => {
      hdr.classList.toggle('scrolled', scrollY > 24);
      const max = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      // подсветка текущего раздела в меню: раздел, пересекающий линию на 45% высоты окна
      const mid = innerHeight * 0.45;
      let cur = null;
      navLinks.forEach((_, id) => {
        const s = document.getElementById(id);
        if (!s) return;
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) cur = id;
      });
      navLinks.forEach((l, id) => l.classList.toggle('on', id === cur && scrollY >= 300));
      updateMcta();
    };
    addEventListener('scroll', tick, { passive: true });
    tick();


    // лёгкий параллакс арки в hero (только с мышью и без «уменьшения движения»)
    const hero = $('#top'), fig = $('#heroFig');
    if (fig && !reduceMotion && matchMedia('(hover: hover)').matches) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        fig.style.setProperty('--px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
        fig.style.setProperty('--py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
      });
      hero.addEventListener('pointerleave', () => { fig.style.setProperty('--px', 0); fig.style.setProperty('--py', 0); });
    }

    // иконки в «популярных направлениях»
    $$('.pop-ic').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
  }

  /* ---------------------------------------------------------------- расчёт */
  const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  const rng = (a, b) => `${nf.format(a)}–${nf.format(b)} млн ₸`;

  function calc() {
    const area = +$('#area').value;
    const withRepair = $('#withRepair').checked;
    const goods = [area * 0.12, area * 0.14];
    const repair = [area * 0.07, area * 0.08];
    const total = withRepair ? [goods[0] + repair[0], goods[1] + repair[1]] : goods;
    $('#areaOut').textContent = area;
    const rg = $('#area');
    rg.style.setProperty('--p', ((area - rg.min) / (rg.max - rg.min) * 100) + '%');
    $('#resGoods').textContent = rng(goods[0], goods[1]);
    $('#resRepair').textContent = rng(repair[0], repair[1]);
    $('#rowRepair').hidden = !withRepair;
    $('#resTotal').textContent = rng(total[0], total[1]);
    state.calcText = `Предварительный расчёт на сайте: ${area} м², товары из Китая ${rng(goods[0], goods[1])}`
      + (withRepair ? `, ремонт партнёрами ${rng(repair[0], repair[1])}, итого ${rng(total[0], total[1])}.` : '.');
  }

  /* ---------------------------------------------------------------- заявка */
  function renderLeadItems() {
    const box = $('#leadItems');
    if (!state.favs.size) {
      box.innerHTML = '<p class="lead-hint">Сохраняйте позиции в каталоге: они приложатся к заявке.</p>';
    } else {
      box.innerHTML = [...state.favs].map((id) => {
        const p = state.byId.get(id);
        return p ? `<span class="lead-chip">${esc(p.title)}<button type="button" data-unsave="${esc(id)}" aria-label="Убрать: ${esc(p.title)}">×</button></span>` : '';
      }).join('');
    }
    const acc = $('#leadAcc');
    acc.innerHTML = state.user
      ? `Заявка сохранится в вашем кабинете: <button type="button" data-open="leads">открыть заявки</button>.`
      : `Хотите следить за заявкой и хранить подборку? <button type="button" data-open="account">Создайте кабинет</button> до или после отправки.`;
    renderStaticLead();
  }

  /* ---------------------------------------------------------------- статический режим (без сервера) */
  // Текст сообщения собирается из сохранённых товаров, выбранного формата и расчёта
  function leadMessage() {
    const titles = [...state.favs].map((id) => (state.byId.get(id) || {}).title).filter(Boolean);
    const lines = ['Здравствуйте! Хочу обсудить комплектацию ремонта из Китая (сайт KÖPIR GROUP).'];
    const fmt = $('#fFormat').value;
    if (fmt && fmt !== 'unknown') lines.push('Формат: ' + FORMATS[fmt] + '.');
    if (titles.length) lines.push('Интересуют товары: ' + titles.join(', ') + '.');
    const extra = $('#fComment').value.trim();
    if (extra) lines.push(extra);
    return lines.join('\n');
  }

  function renderStaticLead() {
    if (!CFG.static) return;
    const msg = leadMessage();
    const a = [];
    if (CFG.whatsapp) a.push(`<a class="btn btn-primary" href="https://wa.me/${esc(CFG.whatsapp)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Написать в WhatsApp</a>`);
    if (CFG.telegram) a.push(`<a class="btn btn-primary" href="https://t.me/${esc(CFG.telegram)}" target="_blank" rel="noopener">Написать в Telegram</a>`);
    if (CFG.phone) a.push(`<a class="btn btn-line" href="tel:${esc(CFG.phone.replace(/[^\d+]/g, ''))}">Позвонить</a>`);
    if (CFG.email) a.push(`<a class="btn btn-line" href="mailto:${esc(CFG.email)}?subject=${encodeURIComponent('Заявка с сайта KÖPIR GROUP')}&body=${encodeURIComponent(msg)}">Написать на email</a>`);
    $('#staticActions').innerHTML = a.join('') || '<p class="static-empty">Контакты скоро появятся на этой странице.</p>';
  }

  async function copyMessage() {
    const msg = leadMessage();
    try {
      await navigator.clipboard.writeText(msg);
      toast('Текст сообщения скопирован. Вставьте его в мессенджер.');
    } catch {
      const t = document.createElement('textarea');
      t.value = msg; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* ничего */ }
      t.remove();
      toast(ok ? 'Текст сообщения скопирован. Вставьте его в мессенджер.' : 'Не удалось скопировать. Выделите текст вручную.');
    }
  }

  function showErr(msg, field) {
    const e = $('#formErr');
    e.textContent = msg;
    e.hidden = !msg;
    $$('#leadForm .bad').forEach((n) => n.classList.remove('bad'));
    if (field) { field.classList.add('bad'); field.focus(); }
  }

  async function submitLead(ev) {
    ev.preventDefault();
    const f = ev.target;
    const name = f.name.value.trim();
    const phone = f.phone.value.trim();
    if (!name) return showErr('Укажите, как к вам обращаться.', f.name);
    if (phone.replace(/\D/g, '').length < 10) return showErr('Проверьте номер телефона: нужно минимум 10 цифр.', f.phone);
    if (f.area.value.trim() && !/^\d{1,5}([.,]\d{1,2})?$/.test(f.area.value.trim())) return showErr('Площадь укажите числом, например 85.', f.area);
    if (!$('#fConsent').checked) return showErr('Подтвердите согласие на обработку данных, чтобы отправить заявку.', $('#fConsent'));
    showErr('');
    const btn = $('#sendBtn');
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    try {
      const res = await api('/api/leads', {
        method: 'POST',
        body: {
          name, phone,
          city: f.city.value.trim(),
          area: f.area.value.trim().replace(',', '.'),
          format: f.format.value, budget: f.budget.value,
          contact: f.contact.value, comment: f.comment.value.trim(),
          items: [...state.favs], website: f.website.value,
        },
      });
      showDone(res.id, name, phone, f.contact.value);
      if (state.user) refreshMe();
    } catch (e) {
      showErr(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Отправить заявку';
    }
  }

  function showDone(id, name, phone, contact) {
    const via = { whatsapp: 'в WhatsApp', telegram: 'в Telegram', call: 'по телефону' }[contact] || '';
    $('#leadForm').hidden = true;
    const d = $('#leadDone');
    d.hidden = false;
    d.innerHTML = `
      <div class="tick"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h3 class="big">Заявка №${esc(id || '')} принята</h3>
      <p>${esc(name)}, мы свяжемся с вами ${esc(via)} по номеру ${esc(phone)}. Товары из подборки уже в заявке.</p>
      <div class="row">
        ${state.user
          ? '<button class="btn btn-primary" type="button" data-open="leads">Открыть мои заявки</button>'
          : `<button class="btn btn-primary" type="button" data-open="account" data-prefill-name="${esc(name)}" data-prefill-phone="${esc(phone)}">Создать кабинет и следить за заявкой</button>`}
        <button class="btn btn-line" type="button" id="againBtn">Отправить ещё одну</button>
      </div>`;
    d.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  function resetLead() {
    $('#leadDone').hidden = true;
    $('#leadForm').hidden = false;
    $('#leadForm').comment.value = '';
    $('#fConsent').checked = false;
  }

  /* ---------------------------------------------------------------- кабинет */
  let lastFocus = null;

  function openDrawer(tab) {
    if (tab) state.tab = tab;
    lastFocus = document.activeElement;
    renderDrawer();
    const d = $('#drawer'), v = $('#veil');
    v.hidden = false;
    requestAnimationFrame(() => { v.classList.add('show'); d.classList.add('open'); });
    d.setAttribute('aria-hidden', 'false');
    $('#favbar').hidden = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => d.focus(), 50);
  }

  function closeDrawer() {
    const d = $('#drawer'), v = $('#veil');
    d.classList.remove('open');
    v.classList.remove('show');
    d.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { v.hidden = true; }, 260);
    renderFavUI();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function savedHTML() {
    const ids = [...state.favs].filter((id) => state.byId.has(id));
    if (!ids.length) {
      return `<div class="empty-box"><b>Пока ничего не сохранено</b>Нажмите сердечко на карточке товара, и он появится здесь.</div>
        <a class="btn btn-line btn-wide" href="#catalog" data-close>Перейти в каталог</a>`;
    }
    const list = ids.map((id) => {
      const p = state.byId.get(id);
      const cat = state.cats.find((c) => c.id === p.cat);
      return `<li class="saved-item">
        <div class="tile t${(p.tone || 0) % 4}">${p.image ? `<img src="${esc(p.image)}" alt="">` : icon(p.icon)}</div>
        <div><small>${esc(cat ? cat.title : '')}</small><h4>${esc(p.title)}</h4></div>
        <button class="x" type="button" data-unsave="${esc(id)}" aria-label="Убрать: ${esc(p.title)}">×</button>
      </li>`;
    }).join('');
    const nudge = state.user ? '' : `<div class="nudge">Подборка хранится только в этом браузере. Войдите в кабинет, чтобы она осталась с вами на любом устройстве.
      <br><button class="btn btn-sm btn-primary" type="button" data-tab-go="account">Войти или создать кабинет</button></div>`;
    return `<ul class="saved-list">${list}</ul>
      <a class="btn btn-primary btn-wide" href="#lead" data-close>Отправить подборку в заявку</a>${nudge}`;
  }

  function leadsHTML() {
    if (!state.user) {
      return `<div class="empty-box"><b>Заявки появятся здесь</b>Войдите в кабинет, чтобы следить за статусом ваших заявок.</div>
        <button class="btn btn-primary btn-wide" type="button" data-tab-go="account">Войти или создать кабинет</button>`;
    }
    if (!state.leads.length) {
      return `<div class="empty-box"><b>Заявок пока нет</b>Отправьте заявку, и мы покажем её статус здесь.</div>
        <a class="btn btn-primary btn-wide" href="#lead" data-close>Оставить заявку</a>`;
    }
    return state.leads.map((l) => {
      const [label, cls] = STATUS[l.status] || STATUS.new;
      const titles = l.items.map((id) => (state.byId.get(id) || {}).title).filter(Boolean);
      return `<article class="lead-li">
        <header><div><strong>Заявка №${l.id}</strong><small>${esc(fmtDate(l.created))}</small></div><span class="st ${cls}">${label}</span></header>
        <small>${esc(FORMATS[l.format] || '')} · ${esc(BUDGETS[l.budget] || '')}${l.area ? ' · ' + esc(l.area) + ' м²' : ''}</small>
        ${titles.length ? `<p>Товары: ${esc(titles.join(', '))}</p>` : ''}
        ${l.comment ? `<p>«${esc(l.comment.length > 160 ? l.comment.slice(0, 157) + '…' : l.comment)}»</p>` : ''}
      </article>`;
    }).join('');
  }

  function accountHTML() {
    if (state.user) {
      const u = state.user;
      return `<div class="profile"><dl>
        <div><dt>Имя</dt><dd>${esc(u.name)}</dd></div>
        <div><dt>Email</dt><dd>${esc(u.email)}</dd></div>
        ${u.phone ? `<div><dt>Телефон</dt><dd>${esc(u.phone)}</dd></div>` : ''}
      </dl></div>
      <button class="btn btn-line btn-wide" type="button" id="logoutBtn">Выйти из кабинета</button>`;
    }
    const reg = state.authMode === 'register';
    return `<form class="auth" id="authForm" novalidate>
      <h3>${reg ? 'Создайте кабинет' : 'Вход в кабинет'}</h3>
      <p>${reg ? 'Хранит подборку товаров и историю заявок. Всё, что вы уже сохранили, перенесём.' : 'Войдите, чтобы увидеть сохранённые товары и заявки.'}</p>
      ${reg ? '<div class="f"><label for="aName">Имя</label><input id="aName" name="name" type="text" autocomplete="name" maxlength="80" required></div>' : ''}
      <div class="f"><label for="aEmail">Email</label><input id="aEmail" name="email" type="text" inputmode="email" autocomplete="email" maxlength="120" required></div>
      ${reg ? '<div class="f"><label for="aPhone">Телефон <i>(по желанию)</i></label><input id="aPhone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>' : ''}
      <div class="f"><label for="aPass">Пароль${reg ? ' <i>(от 8 символов)</i>' : ''}</label><input id="aPass" name="password" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" maxlength="200" required></div>
      <p class="form-err" id="authErr" role="alert" hidden></p>
      <button class="btn btn-primary btn-wide" type="submit">${reg ? 'Создать кабинет' : 'Войти'}</button>
      <p class="switch">${reg ? 'Уже есть кабинет?' : 'Первый раз у нас?'} <button type="button" id="authSwitch">${reg ? 'Войти' : 'Создать кабинет'}</button></p>
    </form>`;
  }

  function renderDrawer(background) {
    $$('#drawerTabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === state.tab));
    $('#tabAccount').textContent = state.user ? 'Профиль' : 'Вход';
    $('#drawerTitle').textContent = CFG.static ? 'Сохранённое' : state.user ? `Здравствуйте, ${state.user.name.split(' ')[0]}` : 'Личный кабинет';
    const body = $('#drawerBody');
    // фоновое обновление (например, из избранного) не должно стирать то, что человек печатает в форме
    if (background && state.tab === 'account' && !state.user && body.querySelector('#authForm') && body.contains(document.activeElement)) return;
    body.innerHTML = state.tab === 'saved' ? savedHTML() : state.tab === 'leads' ? leadsHTML() : accountHTML();
    if (state.prefill && state.tab === 'account' && !state.user) {
      const n = $('#aName'), p = $('#aPhone');
      if (n && state.prefill.name) n.value = state.prefill.name;
      if (p && state.prefill.phone) p.value = state.prefill.phone;
    }
    // перерисовка удаляет кнопку, на которой стоял фокус: возвращаем его в кабинет
    if (!background && $('#drawer').classList.contains('open') && !$('#drawer').contains(document.activeElement)) {
      const first = state.tab === 'account' && !state.user ? body.querySelector('input') : null;
      (first || $('#drawer')).focus({ preventScroll: true });
    }
  }

  function renderUser() {
    $('#cabLabel').textContent = state.user ? state.user.name.split(' ')[0] : 'Войти';
    if (state.user) {  // вошедшему клиенту не нужно вводить имя и телефон заново
      const n = $('#fName'), p = $('#fPhone');
      if (!n.value) n.value = state.user.name;
      if (!p.value && state.user.phone) p.value = state.user.phone;
    }
  }

  async function submitAuth(ev) {
    ev.preventDefault();
    const f = ev.target;
    const err = $('#authErr');
    const reg = state.authMode === 'register';
    const body = { email: f.email.value.trim(), password: f.password.value, favorites: [...state.favs] };
    if (reg) { body.name = f.name.value.trim(); body.phone = f.phone.value.trim(); }
    const btn = f.querySelector('button[type="submit"]');
    btn.disabled = true;
    err.hidden = true;
    try {
      const me = await api(reg ? '/api/register' : '/api/login', { method: 'POST', body });
      applyMe(me, true);
      state.prefill = null;
      state.tab = 'saved';
      renderUser();
      renderFavUI();
      renderDrawer();
      toast(reg ? 'Кабинет создан. Подборка сохранена.' : 'Вы вошли в кабинет.');
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      btn.disabled = false;
    }
  }

  async function logout() {
    try { await api('/api/logout', { method: 'POST', body: {} }); } catch { /* всё равно выходим локально */ }
    state.user = null; state.leads = []; state.favs.clear();
    store.del('koper_favs');
    state.tab = 'saved';
    renderUser(); renderCatalog(); renderFavUI(); renderDrawer();
    toast('Вы вышли из кабинета.');
  }

  function applyMe(me, fromAuth) {
    state.user = me.user;
    state.leads = me.leads || [];
    if (me.user) {
      const server = (me.favorites || []).filter((id) => state.byId.has(id));
      state.favs = new Set(fromAuth ? server : [...server, ...state.favs]);
      saveLocalFavs();
      if (!fromAuth && state.favs.size !== server.length) syncFavs();
    }
    renderCatalog();
  }

  async function refreshMe() {
    try { const me = await api('/api/me'); applyMe(me, true); renderUser(); renderFavUI(); } catch { /* офлайн */ }
  }

  /* ---------------------------------------------------------------- контакты */
  function renderContacts() {
    const items = [];
    if (CFG.phone) items.push(`<li><a href="tel:${esc(CFG.phone.replace(/[^\d+]/g, ''))}">${esc(CFG.phone)}</a></li>`);
    if (CFG.whatsapp) items.push(`<li><a href="https://wa.me/${esc(CFG.whatsapp)}" rel="noopener">WhatsApp</a></li>`);
    if (CFG.telegram) items.push(`<li><a href="https://t.me/${esc(CFG.telegram)}" rel="noopener">Telegram${CFG.telegram.startsWith('+') ? '' : ' @' + esc(CFG.telegram)}</a></li>`);
    if (CFG.instagram) items.push(`<li><a href="https://instagram.com/${esc(CFG.instagram)}" rel="noopener">Instagram @${esc(CFG.instagram)}</a></li>`);
    if (CFG.email) items.push(`<li><a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a></li>`);
    const html = items.join('');
    $('#contactsTop').innerHTML = html;
    $('#contactsFoot').innerHTML = html || (CFG.city ? `<li>${esc(CFG.city)}, Казахстан</li>` : '');
    if (CFG.city) $('#fCity').value = CFG.city;
  }

  /* ---------------------------------------------------------------- события */
  function bind() {
    // каталог
    $('#chips').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      state.cat = b.dataset.cat;
      renderCatalog();
      $(`.chip[data-cat="${state.cat}"]`).focus({ preventScroll: true });
    });
    $('#grid').addEventListener('click', (e) => {
      const b = e.target.closest('.fav');
      if (b) toggleFav(b.dataset.id, b);
    });

    // шапка
    $('#openFav').addEventListener('click', () => openDrawer('saved'));
    $('#openCab').addEventListener('click', () => openDrawer(state.user ? 'leads' : 'account'));
    $('#favbarOpen').addEventListener('click', () => openDrawer('saved'));
    const burger = $('#burger'), nav = $('#nav');
    burger.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });
    // популярные направления: сразу фильтруют каталог
    $('.pop').addEventListener('click', (e) => {
      const c = e.target.closest('.pop-card');
      if (!c) return;
      state.cat = c.dataset.cats;
      renderCatalog();
      $('#chips').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });

    // цепочка цены
    $$('.seg button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

    // расчёт
    $('#area').addEventListener('input', calc);
    $('#withRepair').addEventListener('change', calc);
    $('#calcSend').addEventListener('click', () => {
      const c = $('#fComment');
      const lines = c.value.split('\n').filter((l) => !l.startsWith('Предварительный расчёт на сайте'));
      c.value = [state.calcText, ...lines].join('\n').trim();
      const a = $('#fArea');
      if (!a.value) a.value = $('#area').value;
      renderStaticLead();
      $('#lead').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      toast(CFG.static ? 'Расчёт добавлен в текст сообщения.' : 'Расчёт добавлен в заявку.');
    });

    // форматы
    $$('.pick-format').forEach((b) => b.addEventListener('click', () => {
      $('#fFormat').value = b.dataset.format;
      renderStaticLead();
      $('#lead').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      toast('Формат выбран: ' + FORMATS[b.dataset.format] + '.');
    }));

    // заявка
    $('#leadForm').addEventListener('submit', submitLead);
    $('#leadForm').addEventListener('input', (e) => e.target.classList.remove('bad'));
    $('#fPhone').addEventListener('blur', (e) => {
      const d = e.target.value.replace(/\D/g, '');
      if (d.length === 11 && /^[78]/.test(d)) e.target.value = `+7 ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
    });
    $('#leadCard').addEventListener('click', (e) => {
      if (e.target.id === 'againBtn') return resetLead();
      const o = e.target.closest('[data-open]');
      if (o) {
        if (o.dataset.prefillName !== undefined) state.prefill = { name: o.dataset.prefillName, phone: o.dataset.prefillPhone };
        openDrawer(o.dataset.open);
      }
    });

    // кабинет
    $('#drawerClose').addEventListener('click', closeDrawer);
    $('#veil').addEventListener('click', closeDrawer);
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('#drawer').classList.contains('open')) closeDrawer();
      if (e.key === 'Tab' && $('#drawer').classList.contains('open')) {
        const f = $$('#drawer button, #drawer a[href], #drawer input, #drawer select, #drawer textarea').filter((n) => !n.disabled && n.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === $('#drawer'))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $('#drawerTabs').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) { state.tab = b.dataset.tab; renderDrawer(); }
    });
    $('#drawerBody').addEventListener('click', (e) => {
      const t = e.target;
      const un = t.closest('[data-unsave]');
      if (un) return toggleFav(un.dataset.unsave);
      const go = t.closest('[data-tab-go]');
      if (go) { state.tab = go.dataset.tabGo; return renderDrawer(); }
      if (t.closest('[data-close]')) return closeDrawer();
      if (t.id === 'logoutBtn') return logout();
      if (t.id === 'authSwitch') { state.authMode = state.authMode === 'login' ? 'register' : 'login'; renderDrawer(); }
    });
    $('#drawerBody').addEventListener('submit', (e) => { if (e.target.id === 'authForm') submitAuth(e); });

    // быстрые действия в блоке заявки
    $('#leadItems').addEventListener('click', (e) => {
      const un = e.target.closest('[data-unsave]');
      if (un) { toggleFav(un.dataset.unsave); renderCatalog(); }
    });
    $('#leadAcc').addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]');
      if (o) { state.authMode = 'register'; openDrawer(o.dataset.open); }
    });

    // плавное появление блоков
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      $$('.rv').forEach((el, i) => { el.style.transitionDelay = ((i % 3) * 70) + 'ms'; io.observe(el); });
    } else {
      $$('.rv').forEach((el) => el.classList.add('in'));
    }
  }

  /* ---------------------------------------------------------------- запуск */
  async function init() {
    try {
      const res = await fetch('products.json');
      const data = await res.json();
      state.cats = data.categories;
      state.products = data.items;
      state.products.forEach((p) => state.byId.set(p.id, p));
    } catch {
      $('#grid').innerHTML = '<p class="empty">Не удалось загрузить каталог. Обновите страницу.</p>';
    }
    loadLocalFavs();
    renderContacts();
    setupPage();
    setMode('usual');
    calc();
    renderCatalog();
    renderFavUI();
    bind();
    if (CFG.static) {
      // сайт без сервера: нет кабинета и формы, вместо них кнопки связи
      document.documentElement.classList.add('static');
      $('#copyMsg').addEventListener('click', copyMessage);
      $('.lead-copy h2').textContent = 'Напишите нам';
      $('.lead-copy p:not(.eyebrow):not(.lead-acc)').textContent = 'Расскажите о проекте в удобном мессенджере. Сохранённые товары и расчёт добавим в сообщение.';
      $('#drawerTitle').textContent = 'Сохранённое';
    } else {
      try { applyMe(await api('/api/me')); } catch { /* сервер недоступен: сайт работает как гость */ }
    }
    renderUser();
    renderFavUI();
  }

  init();
})();
