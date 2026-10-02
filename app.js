const fallbackWines=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const slugify=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const money=n=>'R$ '+Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const countryCodes={'Argentina':'ar','Brasil':'br','Uruguai':'uy','Chile':'cl','França':'fr','Itália':'it','Espanha':'es','Portugal':'pt','África do Sul':'za','Estados Unidos':'us','Austrália':'au','Alemanha':'de','Áustria':'at','Geórgia':'ge','Nova Zelândia':'nz'};
const flagUrl=country=>countryCodes[country]?'https://flagcdn.com/w80/'+countryCodes[country]+'.png':'';
function productCard(w){
 const flag=flagUrl(w.country),visual=w.image_url?'<img src="'+esc(w.image_url)+'" alt="'+esc(w.name)+'">':'<div class="bottle-fallback"></div>';
 return '<article class="product-card"><a href="/vinho/'+slugify(w.slug||w.name)+'"><div class="product-image">'+(flag?'<img class="country-flag" src="'+flag+'" alt="'+esc(w.country)+'">':'')+visual+'</div><div class="product-meta"><small>'+esc(w.winery||'Videira')+'</small><h3>'+esc(w.name)+'</h3><div class="product-sub">'+esc([w.region,w.country].filter(Boolean).join(', '))+'</div><div class="product-price">'+money(w.price)+'</div></div></a><div class="product-actions"><button class="quote-btn" data-slug="'+esc(w.slug)+'">Pedir orçamento</button><button class="save-btn" data-cart="'+esc(w.slug)+'" aria-label="Adicionar ao carrinho">+</button></div></article>'
}
function setupCarousel(root){
 if(!root)return;const rail=root.querySelector('.product-rail,.grape-rail,.country-rail,.winery-rail');if(!rail)return;
 root.querySelector('.prev')?.addEventListener('click',()=>rail.scrollBy({left:-520,behavior:'smooth'}));root.querySelector('.next')?.addEventListener('click',()=>rail.scrollBy({left:520,behavior:'smooth'}));
 let down=false,start=0,left=0,moved=false;
 rail.addEventListener('pointerdown',e=>{down=true;moved=false;start=e.clientX;left=rail.scrollLeft});
 rail.addEventListener('pointermove',e=>{if(!down)return;const d=e.clientX-start;if(Math.abs(d)>6)moved=true;if(moved){e.preventDefault();rail.scrollLeft=left-d}});
 rail.addEventListener('pointerup',()=>{down=false;setTimeout(()=>moved=false,0)});rail.addEventListener('pointercancel',()=>{down=false;moved=false});rail.addEventListener('pointerleave',()=>down=false)
}

function initResponsiveMenu(){
 const bar=document.querySelector('.header-bar');
 if(!bar||document.querySelector('.menu-toggle'))return;
 const btn=document.createElement('button');
 btn.className='menu-toggle';
 btn.type='button';
 btn.setAttribute('aria-label','Abrir menu');
 btn.setAttribute('aria-expanded','false');
 btn.innerHTML='<span></span><span></span><span></span>';
 const cart=document.querySelector('.header-cart');
 bar.insertBefore(btn,cart||null);
 const menu=document.createElement('div');
 menu.className='mobile-menu';
 menu.innerHTML=
 '<div class="mobile-menu-inner">'+
   '<a class="mobile-main-link" href="/">Início</a>'+
   '<details><summary>Vinhos</summary><div class="mobile-submenu">'+
     '<a href="/loja">Todos os vinhos</a><a href="/loja?tipo=Tinto">Tintos</a><a href="/loja?tipo=Branco">Brancos</a><a href="/loja?tipo=Ros%C3%A9">Rosés</a><a href="/loja?tipo=Espumante">Espumantes</a><a href="/loja?tipo=Sobremesa">Sobremesa</a>'+
   '</div></details>'+
   '<details><summary>Uvas</summary><div class="mobile-submenu">'+
     '<a href="/uvas">Todas as uvas</a><a href="/uva/malbec">Malbec</a><a href="/uva/chardonnay">Chardonnay</a><a href="/uva/cabernet-franc">Cabernet Franc</a><a href="/uva/pinot-noir">Pinot Noir</a>'+
   '</div></details>'+
   '<details><summary>Vinícolas</summary><div class="mobile-submenu">'+
     '<a href="/vinicolas">Todas as vinícolas</a><a href="/vinicola/graham-beck">Graham Beck</a><a href="/vinicola/bodegas-fabre">Bodegas Fabre</a><a href="/vinicola/luiz-argenta">Luiz Argenta</a><a href="/vinicola/casa-valduga">Casa Valduga</a>'+
   '</div></details>'+
   '<a class="mobile-main-link" href="/regioes">Regiões</a>'+
   '<a class="mobile-main-link" href="/carrinho">Carrinho</a>'+
   '<form class="mobile-search" action="/loja"><input name="q" placeholder="Buscar vinho, uva ou vinícola"><button>Buscar</button></form>'+
 '</div>';
 document.body.appendChild(menu);
 const close=()=>{menu.classList.remove('open');btn.classList.remove('active');btn.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')};
 btn.addEventListener('click',()=>{const open=menu.classList.toggle('open');btn.classList.toggle('active',open);btn.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});
 document.addEventListener('click',e=>{if(menu.classList.contains('open')&&!menu.contains(e.target)&&!btn.contains(e.target))close()});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 window.addEventListener('resize',()=>{if(innerWidth>1000)close()});
}
function pathInfo(){const p=decodeURIComponent(location.pathname).split('/').filter(Boolean);return {kind:p[0]||'',slug:p.slice(1).join('/')||''}}
(async()=>{
 initResponsiveMenu();
 const db=window.videiraDb;let wines=fallbackWines,types=[],grapes=[],wineries=[];
 if(db){
  const [wr,tr,gr,br]=await Promise.all([
   db.from('wines').select('*').eq('active',true).order('sort_order'),
   db.from('wine_types_catalog').select('*').eq('active',true).order('sort_order'),
   db.from('grapes_catalog').select('*').eq('active',true).order('sort_order'),
   db.from('bodegas').select('*').eq('active',true).order('sort_order')
  ]);
  if(wr.data?.length)wines=wr.data.map(w=>({...w,country:w.country||((w.region||'').includes('Brasil')?'Brasil':(w.region||'').includes('Uruguai')?'Uruguai':(w.region||'').includes('Argentina')?'Argentina':'')}));
  types=tr.data||[];grapes=gr.data||[];wineries=br.data||[]
 }
 window.__VIDEIRA_WINES=wines;
 const featured=document.getElementById('featuredRail');if(featured)featured.innerHTML=(wines.filter(x=>x.featured).length?wines.filter(x=>x.featured):wines).map(productCard).join('');
 const typeGrid=document.getElementById('typeGrid');if(typeGrid){if(!types.length)types=[{name:'Tinto',description:'Intensos e elegantes'},{name:'Branco',description:'Frescos e aromáticos'},{name:'Rosé',description:'Leves e versáteis'},{name:'Espumante',description:'Para celebrar'},{name:'Frizante',description:'Leves e descontraídos'},{name:'Sobremesa',description:'Doces e envolventes'}];typeGrid.innerHTML=types.slice(0,6).map(t=>'<a class="type-card" href="/loja?tipo='+encodeURIComponent(t.name)+'"><div class="type-art"'+(t.image_url?' style="background-image:url('+JSON.stringify(t.image_url)+')"':'')+'></div><strong>'+esc(t.name)+'</strong><small>'+esc(t.description||'')+'</small></a>').join('')}
 const grapeRail=document.getElementById('grapeRail');if(grapeRail){if(!grapes.length)grapes=[{name:'Malbec',description:'Frutado, macio e intenso.'},{name:'Chardonnay',description:'Versátil, fresco e elegante.'},{name:'Chenin Blanc',description:'Aromático, fresco e versátil.'},{name:'Cabernet Franc',description:'Elegante, herbal e vibrante.'},{name:'Pinot Noir',description:'Delicado e perfumado.'},{name:'Merlot',description:'Macio e redondo.'}];grapeRail.innerHTML=grapes.map(g=>'<a class="grape-card" href="/uva/'+slugify(g.name)+'"><div class="grape-art"'+(g.image_url?' style="background-image:url('+JSON.stringify(g.image_url)+')"':'')+'></div><div class="grape-body"><h3>'+esc(g.name)+'</h3><p>'+esc(g.description||'Explore os rótulos desta variedade.')+'</p><b>Ver vinhos</b></div></a>').join('')}
 const countries=[...new Set(wines.map(w=>w.country).filter(Boolean))].sort(),countryRail=document.getElementById('countryRail');
 if(countryRail)countryRail.innerHTML=countries.map(c=>'<a class="country-card" href="/pais/'+slugify(c)+'"><div class="country-art">'+(flagUrl(c)?'<img src="'+flagUrl(c)+'" alt="'+esc(c)+'">':'')+'</div><div class="country-body"><h3>'+esc(c)+'</h3><p>'+wines.filter(w=>w.country===c).length+' rótulo(s) no catálogo</p><b>Explorar país</b></div></a>').join('');
 const homeWineries=document.getElementById('homeWineries');if(homeWineries){if(!wineries.length){const wm=new Map();wines.forEach(w=>{if(w.winery&&!wm.has(w.winery))wm.set(w.winery,{name:w.winery,country:w.country||'',description:[w.region,w.country].filter(Boolean).join(', ')})});wineries=[...wm.values()]}const stock=['https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1464638681273-096c166ab676?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=900&q=85'];homeWineries.innerHTML=wineries.map((w,i)=>'<a class="winery-slide-card" href="/vinicola/'+slugify(w.name)+'"><div class="winery-slide-art" style="background-image:url('+JSON.stringify(w.image_url||stock[i%3])+')"></div><div class="winery-slide-body"><span>'+esc(w.country||'')+'</span><h3>'+esc(w.name)+'</h3><p>'+esc(w.description||'Conheça os vinhos desta vinícola.')+'</p><b>Conhecer</b></div></a>').join('')}
 document.querySelectorAll('.carousel-shell').forEach(setupCarousel);

 const catalog=document.getElementById('catalog');
 if(catalog){
  const qs=new URLSearchParams(location.search),route=pathInfo();
  const typeNames=[...new Set(wines.map(w=>w.type).filter(Boolean))],wineryNames=[...new Set(wines.map(w=>w.winery).filter(Boolean))].sort(),grapeNames=[...new Set(wines.flatMap(w=>w.grapes||[]).filter(Boolean))].sort(),countryNames=[...new Set(wines.map(w=>w.country).filter(Boolean))].sort();
  typeFilters.innerHTML=typeNames.map(n=>'<label><input type="checkbox" value="'+esc(n)+'"> '+esc(n)+'</label>').join('');
  wineryFilters.innerHTML=wineryNames.map(n=>'<label><input type="checkbox" value="'+esc(n)+'"> '+esc(n)+'</label>').join('');
  grapeFilters.innerHTML=grapeNames.map(n=>'<label><input type="checkbox" value="'+esc(n)+'"> '+esc(n)+'</label>').join('');
  countryFilters.innerHTML=countryNames.map(n=>'<label><input type="checkbox" value="'+esc(n)+'"> '+esc(n)+'</label>').join('');
  const match=(v,s)=>slugify(v)===slugify(s);
  if(route.kind==='uva')document.querySelectorAll('#grapeFilters input').forEach(x=>x.checked=match(x.value,route.slug));
  if(route.kind==='vinicola')document.querySelectorAll('#wineryFilters input').forEach(x=>x.checked=match(x.value,route.slug));
  if(route.kind==='pais')document.querySelectorAll('#countryFilters input').forEach(x=>x.checked=match(x.value,route.slug));
  if(route.kind==='regiao')qs.set('regiao',route.slug);
  const qUva=qs.get('uva'),qVin=qs.get('vinicola'),qPais=qs.get('pais'),qTipo=qs.get('tipo');
  if(qUva)document.querySelectorAll('#grapeFilters input').forEach(x=>x.checked=match(x.value,qUva));
  if(qVin)document.querySelectorAll('#wineryFilters input').forEach(x=>x.checked=match(x.value,qVin));
  if(qPais)document.querySelectorAll('#countryFilters input').forEach(x=>x.checked=match(x.value,qPais));
  if(qTipo)document.querySelectorAll('#typeFilters input').forEach(x=>x.checked=x.value===qTipo);
  catalogSearch.value=qs.get('q')||'';
  function selected(id){return [...document.querySelectorAll('#'+id+' input:checked')].map(x=>x.value)}
  function filtered(){let list=[...wines];const q=(catalogSearch.value||'').toLowerCase();if(q)list=list.filter(w=>[w.name,w.winery,w.region,w.country,w.type,(w.grapes||[]).join(' ')].join(' ').toLowerCase().includes(q));const ts=selected('typeFilters'),ws=selected('wineryFilters'),gs=selected('grapeFilters'),cs=selected('countryFilters');if(ts.length)list=list.filter(w=>ts.includes(w.type));if(ws.length)list=list.filter(w=>ws.includes(w.winery));if(gs.length)list=list.filter(w=>(w.grapes||[]).some(g=>gs.includes(g)));if(cs.length)list=list.filter(w=>cs.includes(w.country));const reg=(qs.get('regiao')||'').toLowerCase();if(reg)list=list.filter(w=>slugify(w.region).includes(slugify(reg)));const max=Number(priceRange.value||99999);list=list.filter(w=>!w.price||Number(w.price)<=max);if(sort.value==='Menor preço')list.sort((a,b)=>a.price-b.price);if(sort.value==='Maior preço')list.sort((a,b)=>b.price-a.price);return list}
  function renderCatalog(){const list=filtered();catalog.innerHTML=list.map(productCard).join('');resultCount.textContent=list.length+' vinhos encontrados'}
  document.querySelectorAll('#filters input,#sort,#catalogSearch').forEach(x=>x.addEventListener('input',()=>{if(x.id==='priceRange')priceValue.textContent='Até '+money(x.value);renderCatalog()}));
  catalogSearchForm.addEventListener('submit',e=>{e.preventDefault();renderCatalog()});clearFilters.addEventListener('click',()=>{document.querySelectorAll('#filters input[type=checkbox]').forEach(x=>x.checked=false);catalogSearch.value='';priceRange.value=3000;renderCatalog()});filterToggle.addEventListener('click',()=>filters.classList.toggle('open'));renderCatalog()
 }

 const product=document.getElementById('product');
 if(product){
  const route=pathInfo(),querySlug=new URLSearchParams(location.search).get('slug'),wanted=route.kind==='vinho'?route.slug:querySlug;
  const w=wines.find(x=>slugify(x.slug||x.name)===slugify(wanted))||wines.find(x=>x.slug===wanted)||wines[0];
  if(w){document.title=w.name+' | Videira';crumbWine.textContent=w.name;const flag=flagUrl(w.country),visual=w.image_url?'<img src="'+esc(w.image_url)+'" alt="'+esc(w.name)+'">':'<div class="detail-bottle"><span>'+esc(w.winery)+'</span></div>';product.innerHTML='<div class="product-detail"><div class="product-gallery">'+(flag?'<img class="country-flag" src="'+flag+'" alt="'+esc(w.country)+'">':'')+visual+'</div><div class="product-info"><span class="winery">'+esc(w.winery)+'</span><h1>'+esc(w.name)+'</h1><div class="region">'+esc([w.region,w.country].filter(Boolean).join(', '))+'</div><div class="facts"><div><b>Tipo</b><span>'+esc(w.type||'')+'</span></div><div><b>Uva</b><span>'+esc((w.grapes||[]).join(', '))+'</span></div><div><b>País</b><span>'+esc(w.country||'')+'</span></div><div><b>Produtor</b><span>'+esc(w.winery||'')+'</span></div></div><p class="description">'+esc(w.description||'Consulte disponibilidade, safra e condições comerciais no orçamento.')+'</p><div class="detail-price">'+money(w.price)+'</div><button class="detail-quote quote-btn" data-slug="'+esc(w.slug)+'">Pedir orçamento</button></div></div>';same.innerHTML=wines.filter(x=>x.winery===w.winery&&x.slug!==w.slug).concat(wines.filter(x=>x.winery!==w.winery)).slice(0,8).map(productCard).join('')}
 }

 const explore=document.getElementById('exploreGrid');
 if(explore){const kind=document.querySelector('.explore-page')?.dataset.kind;let data=[];if(kind==='grapes')data=grapes;if(kind==='wineries')data=wineries;if(kind==='regions'){const map=new Map();wines.forEach(w=>{if(w.region&&!map.has(w.region))map.set(w.region,{name:w.region,description:w.country||''})});data=[...map.values()]}const stock=['https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1464638681273-096c166ab676?auto=format&fit=crop&w=800&q=80'];function draw(list){explore.innerHTML=list.map((x,i)=>{const href=kind==='grapes'?'/uva/'+slugify(x.name):kind==='wineries'?'/vinicola/'+slugify(x.name):'/regiao/'+slugify(x.name);return '<a class="explore-card" href="'+href+'"><div class="explore-visual" style="background-image:url('+JSON.stringify(x.image_url||stock[i%3])+')"></div><div class="explore-body"><h3>'+esc(x.name)+'</h3><p>'+esc(x.description||x.region||'Explore os rótulos relacionados.')+'</p><b>Ver rótulos</b></div></a>'}).join('')}draw(data);exploreSearch?.addEventListener('input',e=>draw(data.filter(x=>String(x.name).toLowerCase().includes(e.target.value.toLowerCase()))))}

 const cart=JSON.parse(localStorage.getItem('videiraCart')||'[]');const badge=document.getElementById('cartCount');if(badge)badge.textContent=cart.length;

 const cartItemsEl=document.getElementById('cartItems');
 const cartEmptyEl=document.getElementById('cartEmpty');
 const cartTotalItemsEl=document.getElementById('cartTotalItems');
 const cartTotalValueEl=document.getElementById('cartTotalValue');
 const sendWhatsappBtn=document.getElementById('sendWhatsapp');
 if(cartItemsEl){
   const getCartItems=()=>{
     const ids=JSON.parse(localStorage.getItem('videiraCart')||'[]');
     return ids.map(id=>wines.find(w=>w.slug===id||slugify(w.slug||w.name)===slugify(id))).filter(Boolean);
   };
   const renderCart=()=>{
     const items=getCartItems();
     cartItemsEl.innerHTML=items.map(w=>{
       const visual=w.image_url?'<img src="'+esc(w.image_url)+'" alt="'+esc(w.name)+'">':'<div class="bottle-fallback"></div>';
       return '<article class="cart-item"><div class="cart-item-thumb">'+visual+'</div><div class="cart-item-info"><small>'+esc(w.winery||'Videira')+'</small><h3>'+esc(w.name)+'</h3><p>'+esc([w.region,w.country].filter(Boolean).join(', '))+'</p><strong class="cart-item-price">'+money(w.price)+'</strong></div><button class="cart-remove" data-remove-cart="'+esc(w.slug)+'">Remover</button></article>'
     }).join('');
     if(cartEmptyEl)cartEmptyEl.hidden=items.length>0;
     if(cartTotalItemsEl)cartTotalItemsEl.textContent=items.length;
     if(cartTotalValueEl)cartTotalValueEl.textContent=money(items.reduce((sum,w)=>sum+Number(w.price||0),0));
     if(badge)badge.textContent=items.length;
     if(sendWhatsappBtn)sendWhatsappBtn.disabled=!items.length;
   };
   renderCart();
   document.addEventListener('click',e=>{
     const rm=e.target.closest('[data-remove-cart]');
     if(!rm)return;
     let ids=JSON.parse(localStorage.getItem('videiraCart')||'[]');
     ids=ids.filter(x=>x!==rm.dataset.removeCart);
     localStorage.setItem('videiraCart',JSON.stringify(ids));
     renderCart();
   });
   sendWhatsappBtn?.addEventListener('click',()=>{
     const items=getCartItems();
     if(!items.length)return;
     const total=items.reduce((sum,w)=>sum+Number(w.price||0),0);
     const lines=items.map((w,i)=>(i+1)+'. '+w.winery+' - '+w.name+' — '+money(w.price));
     const msg=encodeURIComponent('Olá! Gostaria de solicitar um orçamento para os seguintes rótulos:\n\n'+lines.join('\n')+'\n\nTotal de referência: '+money(total)+'\n\nAguardo disponibilidade e confirmação dos valores.');
     window.open('https://wa.me/5545999056277?text='+msg,'_blank','noopener');
   });
 }
 document.addEventListener('click',e=>{const add=e.target.closest('[data-cart]');if(add){const slug=add.dataset.cart,cur=JSON.parse(localStorage.getItem('videiraCart')||'[]');if(!cur.includes(slug))cur.push(slug);localStorage.setItem('videiraCart',JSON.stringify(cur));if(badge)badge.textContent=cur.length;add.textContent='✓';return}const b=e.target.closest('.quote-btn');if(!b)return;const w=wines.find(x=>x.slug===b.dataset.slug);if(!w)return;const wa='5545999056277',msg=encodeURIComponent('Olá! Gostaria de solicitar um orçamento para '+w.winery+' '+w.name+'.');window.open(wa?'https://wa.me/'+wa+'?text='+msg:'https://wa.me/?text='+msg,'_blank','noopener')})
})();