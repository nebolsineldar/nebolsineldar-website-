document.getElementById('year').textContent = new Date().getFullYear();

const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isSpanish = document.documentElement.lang === 'es';

const updateRecordingCarousel = (list) => {
  const cards = [...list.querySelectorAll('.recording-row')];
  const centre = list.scrollLeft + list.clientWidth / 2;
  const unit = Math.max(cards[0]?.offsetWidth * .88 || 1, 1);
  let nearest = null;
  let nearestDistance = Infinity;

  cards.forEach((card) => {
    const distance = (card.offsetLeft + card.offsetWidth / 2 - centre) / unit;
    const clamped = Math.max(-2.4, Math.min(2.4, distance));
    const depth = Math.min(1, Math.abs(distance) / 2.25);
    card.style.setProperty('--cover-rotate', `${(clamped * -17).toFixed(3)}deg`);
    card.style.setProperty('--cover-scale', (1 - depth * .19).toFixed(3));
    card.style.setProperty('--cover-opacity', (1 - depth * .46).toFixed(3));
    card.style.setProperty('--cover-z', `${((1 - depth) * 72 - 22).toFixed(3)}px`);
    if (Math.abs(distance) < nearestDistance) {
      nearest = card;
      nearestDistance = Math.abs(distance);
    }
  });

  cards.forEach((card) => card.classList.toggle('is-centre', card === nearest));
};

const initRecordingCarousel = () => {
  const list = document.querySelector('.discography-list');
  if (!list) return;
  if (list.dataset.carouselReady) {
    window.requestAnimationFrame(() => updateRecordingCarousel(list));
    return;
  }
  list.dataset.carouselReady = 'true';
  let framePending = false;
  const requestUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(() => {
      updateRecordingCarousel(list);
      framePending = false;
    });
  };
  const move = (direction) => {
    const cards = [...list.querySelectorAll('.recording-row')];
    if (!cards.length) return;
    const centre = list.scrollLeft + list.clientWidth / 2;
    const activeIndex = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Infinity }).index;
    const nextIndex = Math.max(0, Math.min(cards.length - 1, activeIndex + direction));
    cards[nextIndex].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  };

  list.addEventListener('scroll', requestUpdate, { passive: true });
  list.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  window.addEventListener('resize', requestUpdate);
  list.closest('.recording-carousel-stage')?.querySelector('.recording-carousel-prev')?.addEventListener('click', () => move(-1));
  list.closest('.recording-carousel-stage')?.querySelector('.recording-carousel-next')?.addEventListener('click', () => move(1));
  requestUpdate();
};

fetch('/api/content').then(r => r.ok ? r.json() : null).then(data => {
  if (!data) return;
  const s = data.settings || {};
  if (s.contactEmail) { const a=document.querySelector('#contact .email'); a.textContent=s.contactEmail; a.href='mailto:'+s.contactEmail; }
  if (s.gramophoneQuote) document.querySelector('.hero .intro').textContent=s.gramophoneQuote;
  if (s.bbcQuote) document.querySelector('.quote-band blockquote').textContent=s.bbcQuote;
  if (!isSpanish && s.bioEnglish) { const p=document.querySelector('#bio .prose'); const downloads=p.querySelector('.download-links'); p.innerHTML='<p>'+esc(s.bioEnglish).replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')+'</p>'; if(downloads)p.appendChild(downloads); }
  const projects=data.items.filter(x=>x.type==='project');
  if(projects.length && !document.querySelector('#upcoming-project-list.unified-calendar')) document.querySelector('#concerts .event-list').innerHTML=projects.map(x=>`<article><time><b>${esc(x.date)}</b></time><div><h3>${esc(x.title)}</h3><p>${esc(x.subtitle)}</p></div>${x.url?`<a class="programme" href="${esc(x.url)}" target="_blank">Details</a>`:''}</article>`).join('');
  const recordings=data.items.filter(x=>x.type==='recording');
  if(recordings.length) { document.querySelector('.discography-list').innerHTML=recordings.map(x=>`<a class="recording-row" href="${esc(x.url||'#')}" target="_blank"><img src="${x.image_key?'/api/upload/'+encodeURIComponent(x.image_key):'taneyev-8574566.jpg'}" alt="${esc(x.title)}"><span class="recording-year">${esc(x.date)}</span><span class="recording-info"><b>${esc(x.title)}</b><small>${esc(x.subtitle)}</small></span><span class="recording-label">${isSpanish?'Escuchar':'Listen'}</span></a>`).join(''); initRecordingCarousel(); }
  const photos=data.items.filter(x=>x.type==='photo'&&x.image_key);
  if(photos.length) document.querySelector('.press-photo-grid').innerHTML=photos.map(x=>{const src='/api/upload/'+encodeURIComponent(x.image_key);return `<figure><button class="photo-preview" type="button" data-full="${src}" aria-label="${isSpanish?'Ver':'View'} ${esc(x.title)}"><img src="${src}" alt="${esc(x.title)}"></button><a class="photo-download" href="${src}" download><span>${isSpanish?'Descargar':'Download'}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 20h14"/></svg></a></figure>`}).join('');
}).catch(()=>{});
document.querySelectorAll('a').forEach((link) => {
  const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    node.textContent = node.textContent.replace(/[↗→↓]/g, '').replace(/\s{2,}/g, ' ').trim();
  });
});

document.querySelectorAll('.section-toggle').forEach((button) => {
  if (button.hasAttribute('data-calendar-toggle')) return;
  button.addEventListener('click', () => {
    const section = document.getElementById(button.dataset.toggleSection);
    if (!section) return;
    const expanded = section.classList.toggle('is-expanded');
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? button.dataset.less : button.dataset.more;
  });
});

document.querySelectorAll('[data-calendar-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const section = document.getElementById('concerts');
    if (!section) return;
    const expanded = section.classList.toggle('calendar-expanded');
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? button.dataset.less : button.dataset.more;
  });
});

const photoLightbox = document.getElementById('photo-lightbox');
if (photoLightbox) {
  const lightboxImage = photoLightbox.querySelector('img');
  const lightboxDownload = photoLightbox.querySelector('.photo-lightbox-download');
  document.querySelector('.press-photo-grid')?.addEventListener('click', (event) => {
    const preview = event.target.closest('.photo-preview');
    if (!preview) return;
    const thumbnail = preview.querySelector('img');
    lightboxImage.src = preview.dataset.full;
    lightboxImage.alt = thumbnail?.alt || 'Eldar Nebolsin press photograph';
    lightboxDownload.href = preview.dataset.full;
    photoLightbox.showModal();
  });
  photoLightbox.querySelector('.photo-lightbox-close')?.addEventListener('click', () => photoLightbox.close());
  photoLightbox.addEventListener('click', (event) => {
    if (event.target === photoLightbox) photoLightbox.close();
  });
}

const layeredSections = document.querySelectorAll('main > section[data-layer]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initRecordingCarousel();

const quoteBands = document.querySelectorAll('.quote-band');
if (quoteBands.length && !reducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('has-quote-motion');
  const quoteObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('quote-visible');
      quoteObserver.unobserve(entry.target);
    });
  }, { threshold: .22 });
  quoteBands.forEach((band) => quoteObserver.observe(band));
}

if (layeredSections.length && !reducedMotion) {
  document.documentElement.classList.add('has-layer-motion');
  const main = document.querySelector('main');
  let layerFramePending = false;

  const renderLayers = () => {
    const viewportHeight = window.innerHeight;
    const animationStart = viewportHeight * .98;
    const animationEnd = viewportHeight * .34;
    const travel = window.innerWidth < 600 ? 165 : 235;
    const mainTop = main ? main.offsetTop : 0;

    layeredSections.forEach((section, index) => {
      const naturalTop = mainTop + section.offsetTop - window.scrollY;
      const rawProgress = (animationStart - naturalTop) / (animationStart - animationEnd);
      const progress = Math.max(0, Math.min(1, rawProgress));
      const eased = 1 - Math.pow(1 - progress, 3);

      section.style.setProperty('--layer-order', index);
      section.style.setProperty('--layer-shift', `${(1 - eased) * travel}px`);
      section.style.setProperty('--layer-progress', eased.toFixed(4));
    });

    layerFramePending = false;
  };

  const requestLayerFrame = () => {
    if (layerFramePending) return;
    layerFramePending = true;
    window.requestAnimationFrame(renderLayers);
  };

  window.addEventListener('scroll', requestLayerFrame, { passive: true });
  window.addEventListener('resize', requestLayerFrame);
  requestLayerFrame();
}
