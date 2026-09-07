document.getElementById('year').textContent = new Date().getFullYear();

const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
fetch('/api/content').then(r => r.ok ? r.json() : null).then(data => {
  if (!data) return;
  const s = data.settings || {};
  if (s.contactEmail) { const a=document.querySelector('#contact .email'); a.textContent=s.contactEmail; a.href='mailto:'+s.contactEmail; }
  if (s.gramophoneQuote) document.querySelector('.hero .intro').textContent=s.gramophoneQuote;
  if (s.bbcQuote) document.querySelector('.quote-band blockquote').textContent=s.bbcQuote;
  if (s.bioEnglish) { const p=document.querySelector('#bio .prose'); const downloads=p.querySelector('.download-links'); p.innerHTML='<p>'+esc(s.bioEnglish).replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')+'</p>'; if(downloads)p.appendChild(downloads); }
  const projects=data.items.filter(x=>x.type==='project');
  if(projects.length) document.querySelector('#concerts .event-list').innerHTML=projects.map(x=>`<article><time><b>${esc(x.date)}</b></time><div><h3>${esc(x.title)}</h3><p>${esc(x.subtitle)}</p></div>${x.url?`<a class="programme" href="${esc(x.url)}" target="_blank">Details</a>`:''}</article>`).join('');
  const recordings=data.items.filter(x=>x.type==='recording');
  if(recordings.length) document.querySelector('.discography-list').innerHTML=recordings.map(x=>`<a class="recording-row" href="${esc(x.url||'#')}" target="_blank"><img src="${x.image_key?'/api/upload/'+encodeURIComponent(x.image_key):'taneyev-8574566.jpg'}" alt="${esc(x.title)}"><span class="recording-year">${esc(x.date)}</span><span class="recording-info"><b>${esc(x.title)}</b><small>${esc(x.subtitle)}</small></span><span class="recording-label">Listen</span></a>`).join('');
  const photos=data.items.filter(x=>x.type==='photo'&&x.image_key);
  if(photos.length) document.querySelector('.press-photo-grid').innerHTML=photos.map(x=>`<a href="/api/upload/${encodeURIComponent(x.image_key)}" download><img src="/api/upload/${encodeURIComponent(x.image_key)}" alt="${esc(x.title)}"><span>${esc(x.title)} · Download</span></a>`).join('');
}).catch(()=>{});
document.querySelectorAll('a').forEach((link) => {
  const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    node.textContent = node.textContent.replace(/[↗→↓]/g, '').replace(/\s{2,}/g, ' ').trim();
  });
});
