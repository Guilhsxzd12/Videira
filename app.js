const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const slugify=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const money=n=>'R$ '+Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const countryCodes={'Argentina':'ar','Brasil':'br','Uruguai':'uy','Chile':'cl','França':'fr','Itália':'it','Espanha':'es','Portugal':'pt','África do Sul':'za','Estados Unidos':'us','Austrália':'au','Alemanha':'de','Áustria':'at','Geórgia':'ge','Nova Zelândia':'nz'};
const flagUrl=country=>countryCodes[country]?'https://flagcdn.com/w320/'+countryCodes[country]+'.png':'';
const wineImg=w=>w.image_url?'<img loading="lazy" decoding="async" src="'+esc(w.image_url)+'" alt="'+esc(w.name)+'">':'<div class="bottle-fallback"></div>';
const route=()=>{const p=decodeURIComponent(location.pathname).split('/').filter(Boolean);return {kind:p[0]||'',slug:p.slice(1).join('/')||''}};

function normalizeCart(){
 const raw=JSON.parse(localStorage.getItem('videiraCart')||'[]'),out=[];
 for(const item of raw){const slug=typeof item==='string'?item:item&&item.slug,qty=typeof item==='string'?1:Math.max(1,Number(item&&item.qty||1));if(!slug)continue;const found=out.find(x=>x.slug===slug);found?found.qty+=qty:out.push({slug,qty})}
 localStorage.setItem('videiraCart',JSON.stringify(out));return out
}
function saveCart(cart){localStorage.setItem('videiraCart',JSON.stringify(cart));updateCartBadge(cart)}
function updateCartBadge(cart=normalizeCart()){const el=document.getElementById('cartCount');if(el)el.textContent=cart.reduce((s,x)=>s+x.qty,0)}
function addToCart(slug,qty=1){const c=normalizeCart(),it=c.find(x=>x.slug===slug);it?it.qty+=qty:c.push({slug,qty});saveCart(c)}
function setQty(slug,qty){let c=normalizeCart();if(qty<=0)c=c.filter(x=>x.slug!==slug);else{const it=c.find(x=>x.slug===slug);if(it)it.qty=qty}saveCart(c)}
function setupMobileMenu(){
 const btn=document.querySelector('.menu-toggle'),menu=document.getElementById('mobileMenu');if(!btn||!menu)return;
 const close=()=>{menu.classList.remove('open');btn.classList.remove('active');btn.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true');document.body.classList.remove('menu-open')};
 btn.onclick=()=>{const open=!menu.classList.contains('open');menu.classList.toggle('open',open);btn.classList.toggle('active',open);btn.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('menu-open',open)};
 menu.addEventListener('click',e=>{if(e.target===menu)close()});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));window.addEventListener('resize',()=>{if(innerWidth>1000)close()})
}
function setupRail(root){
 const rail=root.querySelector('.wine-rail,.entity-rail');if(!rail)return;
 root.querySelector('.prev')?.addEventListener('click',()=>rail.scrollBy({left:-Math.max(420,rail.clientWidth*.72),behavior:'smooth'}));
 root.querySelector('.next')?.addEventListener('click',()=>rail.scrollBy({left:Math.max(420,rail.clientWidth*.72),behavior:'smooth'}));
 let down=false,start=0,left=0;rail.addEventListener('pointerdown',e=>{down=true;start=e.clientX;left=rail.scrollLeft;rail.setPointerCapture?.(e.pointerId)});rail.addEventListener('pointermove',e=>{if(!down)return;const d=e.clientX-start;if(Math.abs(d)>4){rail.scrollLeft=left-d;e.preventDefault()}});rail.addEventListener('pointerup',()=>down=false);rail.addEventListener('pointercancel',()=>down=false)
}
function wineCard(w){
 const flag=flagUrl(w.country);
 return '<article class="wine-card"><a href="/vinho/'+slugify(w.slug||w.name)+'"><div class="wine-media">'+(flag?'<img class="country-badge" src="'+flag+'" alt="'+esc(w.country)+'">':'')+wineImg(w)+'</div><div class="wine-info"><small>'+esc(w.winery||'Videira')+'</small><h3>'+esc(w.name)+'</h3><div class="wine-origin">'+esc([w.region,w.country].filter(Boolean).join(', '))+'</div><div class="wine-price">'+money(w.price)+'</div></div></a><div class="wine-actions"><button class="quote-btn" data-quote="'+esc(w.slug)+'">Pedir orçamento</button><button class="add-cart" data-add="'+esc(w.slug)+'" aria-label="Adicionar ao carrinho">+</button></div></article>'
}
function deriveCatalog(wines,grapeMeta,bodegaMeta){
 const grapes=new Map(),wineries=new Map(),countries=new Map(),types=new Map(),regions=new Map();
 wines.forEach(w=>{
   (w.grapes||[]).forEach(g=>{if(!g)return;const k=g.trim(),x=grapes.get(k)||{name:k,count:0};x.count++;grapes.set(k,x)});
   if(w.winery){const x=wineries.get(w.winery)||{name:w.winery,count:0,country:w.country||'',region:w.region||''};x.count++;if(!x.country)x.country=w.country||'';if(!x.region)x.region=w.region||'';wineries.set(w.winery,x)}
   if(w.country){const x=countries.get(w.country)||{name:w.country,count:0};x.count++;countries.set(w.country,x)}
   if(w.type){const x=types.get(w.type)||{name:w.type,count:0};x.count++;types.set(w.type,x)}
   if(w.region){const x=regions.get(w.region)||{name:w.region,count:0,country:w.country||''};x.count++;regions.set(w.region,x)}
 });
 for(const g of grapes.values()){const m=grapeMeta.get(g.name.toLowerCase());if(m)Object.assign(g,{description:m.description||'',image_url:m.image_url||''})}
 for(const w of wineries.values()){const m=bodegaMeta.get(w.name.toLowerCase());if(m)Object.assign(w,{description:m.description||'',image_url:m.image_url||'',country:m.country||w.country,region:m.region||w.region})}
 return {grapes:[...grapes.values()].sort((a,b)=>b.count-a.count),wineries:[...wineries.values()].sort((a,b)=>b.count-a.count),countries:[...countries.values()].sort((a,b)=>a.name.localeCompare(b.name)),types:[...types.values()].sort((a,b)=>b.count-a.count),regions:[...regions.values()].sort((a,b)=>b.count-a.count)}
}
function wineryImage(i,meta){
 if(meta&&meta.image_url)return meta.image_url;
 const stock=['https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1464638681273-096c166ab676?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1533777324565-a040eb52facd?auto=format&fit=crop&w=900&q=82'];return stock[i%stock.length]
}
function entityCard(kind,x,i){
 if(kind==='country'){const flag=flagUrl(x.name);return '<a class="entity-card" href="/pais/'+slugify(x.name)+'"><div class="entity-media">'+(flag?'<img loading="lazy" src="'+flag+'" alt="'+esc(x.name)+'">':'')+'</div><div class="entity-body"><span>País</span><h3>'+esc(x.name)+'</h3><p>'+x.count+' rótulo(s) no catálogo</p><b>Explorar país</b></div></a>'}
 if(kind==='winery')return '<a class="entity-card" href="/vinicola/'+slugify(x.name)+'"><div class="entity-media" style="background-image:url(&quot;'+esc(wineryImage(i,x))+'&quot;)"></div><div class="entity-body"><span>'+esc(x.country||'Produtor')+'</span><h3>'+esc(x.name)+'</h3><p>'+esc(x.description||x.count+' rótulo(s) no catálogo')+'</p><b>Conhecer</b></div></a>';
 return '<a class="entity-card" href="/uva/'+slugify(x.name)+'"><div class="entity-media"'+(x.image_url?' style="background-image:url(&quot;'+esc(x.image_url)+'&quot;)"':'')+'></div><div class="entity-body"><span>Uva</span><h3>'+esc(x.name)+'</h3><p>'+esc(x.description||x.count+' rótulo(s) no catálogo')+'</p><b>Ver vinhos</b></div></a>'
}
function whatsappWine(w,qty=1){const msg=encodeURIComponent('Olá! Gostaria de solicitar um orçamento para '+(qty>1?qty+'x ':'')+w.winery+' - '+w.name+'.');window.open('https://wa.me/5545999056277?text='+msg,'_blank','noopener')}

(async()=>{
 setupMobileMenu();updateCartBadge();
 const db=window.videiraDb;if(!db)return;
 const res=await Promise.all([
   db.from('wines').select('slug,name,winery,type,country,region,grapes,vintage,volume_ml,alcohol,price,description,aromas,pairings,serving_temperature,image_url,featured,new_arrival,sort_order,available').eq('active',true).order('sort_order'),
   db.from('grapes_catalog').select('*').eq('active',true).order('sort_order'),
   db.from('bodegas').select('*').eq('active',true).order('sort_order')
 ]);
 const wines=res[0].data||[],grapeMeta=new Map((res[1].data||[]).map(x=>[String(x.name).toLowerCase(),x])),bodegaMeta=new Map((res[2].data||[]).map(x=>[String(x.name).toLowerCase(),x])),derived=deriveCatalog(wines,grapeMeta,bodegaMeta);
 window.__VIDEIRA_WINES=wines;

 const hw=derived.wineries.slice(0,5),desktopWin=document.getElementById('headerWineries'),mobileWin=document.getElementById('mobileWineries');
 if(desktopWin)desktopWin.innerHTML=hw.map(x=>'<a href="/vinicola/'+slugify(x.name)+'">'+esc(x.name)+'</a>').join('')+'<a class="mega-all" href="/vinicolas">Ver todas</a>';
 if(mobileWin)mobileWin.innerHTML='<a href="/vinicolas">Todas as vinícolas</a>'+hw.map(x=>'<a href="/vinicola/'+slugify(x.name)+'">'+esc(x.name)+'</a>').join('');

 if(document.body.dataset.page==='home'){
   const typeGrid=document.getElementById('typeGrid');
   typeGrid.innerHTML=derived.types.slice(0,6).map(t=>{const sample=wines.find(w=>w.type===t.name&&w.image_url),st=sample?' style="background-image:url(&quot;'+esc(sample.image_url)+'&quot;);background-size:contain;background-repeat:no-repeat"':'';return '<a class="style-card" href="/loja?tipo='+encodeURIComponent(t.name)+'"><div class="style-card-media"'+st+'></div><strong>'+esc(t.name)+'</strong><small>'+t.count+' rótulo(s)</small></a>'}).join('');
   const featured=wines.filter(w=>w.featured);document.getElementById('featuredRail').innerHTML=(featured.length?featured:wines.slice(0,12)).slice(0,12).map(wineCard).join('');
   document.getElementById('newRail').innerHTML=[...wines].reverse().slice(0,12).map(wineCard).join('');
   document.getElementById('grapeRail').innerHTML=derived.grapes.slice(0,16).map((x,i)=>entityCard('grape',x,i)).join('');
   document.getElementById('countryRail').innerHTML=derived.countries.map((x,i)=>entityCard('country',x,i)).join('');
   document.getElementById('wineryRail').innerHTML=derived.wineries.slice(0,24).map((x,i)=>entityCard('winery',x,i)).join('')
 }

 if(document.body.dataset.page==='catalog'){
   const qs=new URLSearchParams(location.search),r=route(),typeBox=document.getElementById('typeFilters'),wineryBox=document.getElementById('wineryFilters'),grapeBox=document.getElementById('grapeFilters'),countryBox=document.getElementById('countryFilters');
   typeBox.innerHTML=derived.types.map(x=>'<label><input type="checkbox" value="'+esc(x.name)+'"> '+esc(x.name)+' <small>('+x.count+')</small></label>').join('');
   wineryBox.innerHTML=derived.wineries.map(x=>'<label><input type="checkbox" value="'+esc(x.name)+'"> '+esc(x.name)+'</label>').join('');
   grapeBox.innerHTML=derived.grapes.map(x=>'<label><input type="checkbox" value="'+esc(x.name)+'"> '+esc(x.name)+'</label>').join('');
   countryBox.innerHTML=derived.countries.map(x=>'<label><input type="checkbox" value="'+esc(x.name)+'"> '+esc(x.name)+'</label>').join('');
   const match=(a,b)=>slugify(a)===slugify(b),check=(id,value)=>document.querySelectorAll('#'+id+' input').forEach(x=>x.checked=match(x.value,value));
   if(r.kind==='uva')check('grapeFilters',r.slug);if(r.kind==='vinicola')check('wineryFilters',r.slug);if(r.kind==='pais')check('countryFilters',r.slug);
   if(qs.get('uva'))check('grapeFilters',qs.get('uva'));if(qs.get('vinicola'))check('wineryFilters',qs.get('vinicola'));if(qs.get('pais'))check('countryFilters',qs.get('pais'));if(qs.get('tipo'))check('typeFilters',qs.get('tipo'));
   document.getElementById('catalogSearch').value=qs.get('q')||'';const reg=r.kind==='regiao'?r.slug:qs.get('regiao')||'',selected=id=>[...document.querySelectorAll('#'+id+' input:checked')].map(x=>x.value);
   function list(){let out=[...wines],q=document.getElementById('catalogSearch').value.trim().toLowerCase();if(q)out=out.filter(w=>[w.name,w.winery,w.type,w.country,w.region,(w.grapes||[]).join(' ')].join(' ').toLowerCase().includes(q));const ts=selected('typeFilters'),ws=selected('wineryFilters'),gs=selected('grapeFilters'),cs=selected('countryFilters');if(ts.length)out=out.filter(w=>ts.includes(w.type));if(ws.length)out=out.filter(w=>ws.includes(w.winery));if(gs.length)out=out.filter(w=>(w.grapes||[]).some(g=>gs.includes(g)));if(cs.length)out=out.filter(w=>cs.includes(w.country));if(reg)out=out.filter(w=>slugify(w.region).includes(slugify(reg)));const max=Number(document.getElementById('priceRange').value);out=out.filter(w=>Number(w.price||0)<=max);const sort=document.getElementById('sort').value;if(sort==='Menor preço')out.sort((a,b)=>a.price-b.price);if(sort==='Maior preço')out.sort((a,b)=>b.price-a.price);if(sort==='Nome A–Z')out.sort((a,b)=>a.name.localeCompare(b.name));return out}
   function chips(){const arr=[];[['typeFilters','tipo'],['wineryFilters','vinícola'],['grapeFilters','uva'],['countryFilters','país']].forEach(pair=>selected(pair[0]).forEach(v=>arr.push({id:pair[0],v,label:pair[1]})));document.getElementById('activeFilters').innerHTML=arr.map(c=>'<span class="filter-chip">'+esc(c.label)+': '+esc(c.v)+' <button type="button" data-chip-id="'+c.id+'" data-chip-value="'+esc(c.v)+'">×</button></span>').join('');document.getElementById('filterBadge').textContent=arr.length?'('+arr.length+')':''}
   function render(){const out=list();document.getElementById('catalog').innerHTML=out.map(wineCard).join('');document.getElementById('resultCount').textContent=out.length+' vinhos encontrados';document.getElementById('catalogEmpty').hidden=out.length>0;chips()}
   document.querySelectorAll('#filters input,#sort,#catalogSearch').forEach(el=>el.addEventListener('input',()=>{if(el.id==='priceRange')document.getElementById('priceValue').textContent='Até '+money(el.value);render()}));document.getElementById('catalogSearchForm').onsubmit=e=>{e.preventDefault();render()};
   document.getElementById('clearFilters').onclick=()=>{document.querySelectorAll('#filters input[type=checkbox]').forEach(x=>x.checked=false);document.getElementById('catalogSearch').value='';document.getElementById('priceRange').value=3000;document.getElementById('priceValue').textContent='Até R$ 3.000';render()};
   document.getElementById('activeFilters').onclick=e=>{const b=e.target.closest('[data-chip-id]');if(!b)return;document.querySelectorAll('#'+b.dataset.chipId+' input').forEach(x=>{if(x.value===b.dataset.chipValue)x.checked=false});render()};
   const filters=document.getElementById('filters'),backdrop=document.getElementById('filterBackdrop'),open=()=>{filters.classList.add('open');backdrop.classList.add('open');document.body.classList.add('menu-open')},close=()=>{filters.classList.remove('open');backdrop.classList.remove('open');document.body.classList.remove('menu-open')};document.getElementById('filterToggle').onclick=open;document.getElementById('closeFilters').onclick=close;backdrop.onclick=close;render()
 }

 if(document.body.dataset.page==='product'){
   const r=route(),querySlug=new URLSearchParams(location.search).get('slug'),wanted=r.kind==='vinho'?r.slug:querySlug,w=wines.find(x=>slugify(x.slug||x.name)===slugify(wanted)),product=document.getElementById('product');
   if(!w)product.innerHTML='<div class="empty-state"><h2>Vinho não encontrado</h2><p>Este rótulo pode não estar mais disponível.</p><a class="btn btn-wine" href="/loja">Voltar ao catálogo</a></div>';
   else{
     document.title=w.name+' | Videira';document.getElementById('crumbWine').textContent=w.name;
     const facts=[['Tipo',w.type],['Uva',(w.grapes||[]).join(', ')],['País',w.country],['Região',w.region],['Safra',w.vintage],['Volume',w.volume_ml?w.volume_ml+' ml':null],['Álcool',w.alcohol?String(w.alcohol).replace('.',',')+'%':null],['Produtor',w.winery]].filter(x=>x[1]),notes=[];if(w.aromas&&w.aromas.length)notes.push(['Aromas',w.aromas.join(', ')]);if(w.pairings&&w.pairings.length)notes.push(['Harmoniza com',w.pairings.join(', ')]);if(w.serving_temperature)notes.push(['Serviço',w.serving_temperature]);const flag=flagUrl(w.country);
     product.innerHTML='<div class="product-detail"><div class="product-gallery">'+(flag?'<img class="country-badge" src="'+flag+'" alt="'+esc(w.country)+'">':'')+wineImg(w)+'</div><div class="product-info"><span class="producer">'+esc(w.winery||'Videira')+'</span><h1>'+esc(w.name)+'</h1><div class="origin">'+esc([w.region,w.country].filter(Boolean).join(', '))+'</div><div class="product-facts">'+facts.map(x=>'<div><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>').join('')+'</div><p class="product-description">'+esc(w.description||'Consulte disponibilidade, safra e condições comerciais no orçamento.')+'</p>'+(notes.length?'<div class="product-notes">'+notes.map(x=>'<div class="note-card"><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>').join('')+'</div>':'')+'<div class="product-price">'+money(w.price)+'</div><div class="product-cta-row"><button class="quote-btn" data-quote="'+esc(w.slug)+'">Pedir orçamento</button><button class="add-cart" data-add="'+esc(w.slug)+'">+</button></div></div></div>';
     document.getElementById('sameWinery').innerHTML=wines.filter(x=>x.slug!==w.slug&&x.winery===w.winery).slice(0,12).map(wineCard).join('');const g=(w.grapes||[])[0];document.getElementById('sameGrape').innerHTML=wines.filter(x=>x.slug!==w.slug&&g&&(x.grapes||[]).includes(g)).slice(0,12).map(wineCard).join('');const bar=document.getElementById('mobileProductBar');bar.hidden=false;document.getElementById('mobileProductName').textContent=w.name;document.getElementById('mobileProductPrice').textContent=money(w.price);document.getElementById('mobileQuoteBtn').onclick=()=>whatsappWine(w)
   }
 }

 if(document.body.dataset.page==='explore'){
   const kind=document.body.dataset.kind,grid=document.getElementById('exploreGrid');let data=[];if(kind==='grapes')data=derived.grapes;if(kind==='wineries')data=derived.wineries;if(kind==='regions')data=derived.regions;
   function draw(list){grid.innerHTML=list.map((x,i)=>{const href=kind==='grapes'?'/uva/'+slugify(x.name):kind==='wineries'?'/vinicola/'+slugify(x.name):'/regiao/'+slugify(x.name),bg=kind==='wineries'?wineryImage(i,x):kind==='grapes'?(x.image_url||'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=900&q=82'):'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=82';return '<a class="explore-card" href="'+href+'"><div class="explore-media" style="background-image:url(&quot;'+esc(bg)+'&quot;)"></div><div class="explore-body"><span>'+esc(kind==='grapes'?'Uva':kind==='wineries'?(x.country||'Vinícola'):(x.country||'Região'))+'</span><h3>'+esc(x.name)+'</h3><p>'+esc(x.description||x.count+' rótulo(s) no catálogo')+'</p><b>Ver rótulos</b></div></a>'}).join('')}
   draw(data);document.getElementById('exploreSearch').oninput=e=>draw(data.filter(x=>x.name.toLowerCase().includes(e.target.value.toLowerCase())))
 }

 if(document.body.dataset.page==='cart'){
   const itemsBox=document.getElementById('cartItems'),empty=document.getElementById('cartEmpty');
   function renderCart(){const cart=normalizeCart(),items=cart.map(c=>({c,w:wines.find(w=>w.slug===c.slug)})).filter(x=>x.w);itemsBox.innerHTML=items.map(x=>'<article class="cart-item"><div class="cart-thumb">'+wineImg(x.w)+'</div><div class="cart-info"><small>'+esc(x.w.winery)+'</small><h3>'+esc(x.w.name)+'</h3><p>'+esc([x.w.region,x.w.country].filter(Boolean).join(', '))+'</p><strong class="cart-price">'+money(x.w.price*x.c.qty)+'</strong></div><div class="cart-tools"><div class="qty"><button data-qty-minus="'+esc(x.w.slug)+'">−</button><span>'+x.c.qty+'</span><button data-qty-plus="'+esc(x.w.slug)+'">+</button></div><button class="remove-cart" data-remove="'+esc(x.w.slug)+'">Remover</button></div></article>').join('');empty.hidden=items.length>0;const totalQty=items.reduce((s,x)=>s+x.c.qty,0),total=items.reduce((s,x)=>s+x.c.qty*Number(x.w.price||0),0);document.getElementById('cartTotalItems').textContent=totalQty;document.getElementById('cartTotalValue').textContent=money(total);document.getElementById('sendWhatsapp').disabled=!items.length;updateCartBadge()}
   itemsBox.onclick=e=>{const plus=e.target.closest('[data-qty-plus]'),minus=e.target.closest('[data-qty-minus]'),rm=e.target.closest('[data-remove]');if(plus){const c=normalizeCart(),it=c.find(x=>x.slug===plus.dataset.qtyPlus);setQty(it.slug,it.qty+1)}if(minus){const c=normalizeCart(),it=c.find(x=>x.slug===minus.dataset.qtyMinus);setQty(it.slug,it.qty-1)}if(rm)setQty(rm.dataset.remove,0);renderCart()};
   document.getElementById('sendWhatsapp').onclick=()=>{const cart=normalizeCart(),items=cart.map(c=>({c,w:wines.find(w=>w.slug===c.slug)})).filter(x=>x.w);if(!items.length)return;const lines=items.map((x,i)=>(i+1)+'. '+x.c.qty+'x '+x.w.winery+' - '+x.w.name+' — '+money(x.w.price*x.c.qty)),total=items.reduce((s,x)=>s+x.c.qty*Number(x.w.price||0),0),msg=encodeURIComponent('Olá! Gostaria de solicitar um orçamento para:\n\n'+lines.join('\n')+'\n\nValor de referência: '+money(total)+'\n\nAguardo confirmação de disponibilidade e valores.');window.open('https://wa.me/5545999056277?text='+msg,'_blank','noopener')};renderCart()
 }

 document.querySelectorAll('.rail-wrap').forEach(setupRail);
 document.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add){addToCart(add.dataset.add);add.textContent='✓';setTimeout(()=>add.textContent='+',900);return}const q=e.target.closest('[data-quote]');if(q){const w=wines.find(x=>x.slug===q.dataset.quote);if(w)whatsappWine(w)}})
})();