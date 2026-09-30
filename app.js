const wines=[
{winery:"Santa Julia",name:"Dulce Natural Chenin",price:"R$89,00"},
{winery:"D.V. Catena",name:"Malbec - Malbec",price:"R$189,00"},
{winery:"Santa Julia",name:"Orgánica Malbec",price:"R$99,00"},
{winery:"Catena Zapata",name:"Malbec",price:"R$159,00"},
{winery:"Santa Julia",name:"La Vaquita",price:"R$109,00"},
{winery:"D.V. Catena",name:"Chardonnay",price:"R$179,00"}
];
function card(w,i){return `<article class="wine-card"><a href="/vinho.html?slug=${i}"><div class="wine-image"><div class="bottle"></div></div><div class="wine-meta"><small>BODEGA</small><h3>${w.winery}<br>${w.name}</h3><div class="price">${w.price}</div></div></a><div class="wine-actions"><button class="buy-btn" data-name="${w.winery} ${w.name}">COMPRAR</button><button class="mini-cart" aria-label="Adicionar">▣</button></div></article>`}
function render(id,data){const el=document.getElementById(id);if(el)el.innerHTML=data.map(card).join("")}
render("offers",wines);render("malbecs",wines.slice(1).concat(wines.slice(0,2)));render("cabernet",wines.slice(2).concat(wines.slice(0,2)));
document.querySelectorAll(".rail-wrap").forEach(w=>{const rail=w.querySelector(".wine-rail");w.querySelector(".prev")?.addEventListener("click",()=>rail.scrollBy({left:-520,behavior:"smooth"}));w.querySelector(".next")?.addEventListener("click",()=>rail.scrollBy({left:520,behavior:"smooth"}));let d=false,s=0,l=0;rail.addEventListener("pointerdown",e=>{d=true;s=e.clientX;l=rail.scrollLeft;rail.setPointerCapture(e.pointerId)});rail.addEventListener("pointermove",e=>{if(d)rail.scrollLeft=l-(e.clientX-s)});["pointerup","pointercancel"].forEach(ev=>rail.addEventListener(ev,()=>d=false))});
document.addEventListener("click",e=>{const b=e.target.closest(".buy-btn");if(!b)return;window.open("https://wa.me/?text="+encodeURIComponent("Olá! Gostaria de solicitar um orçamento para "+b.dataset.name+"."),"_blank","noopener")});
const slides=[...document.querySelectorAll(".hero-slide")],dots=[...document.querySelectorAll(".hero-dots button")];let current=0;function show(i){current=i;slides.forEach((s,n)=>s.classList.toggle("active",n===i));dots.forEach((d,n)=>d.classList.toggle("active",n===i))}dots.forEach((d,i)=>d.addEventListener("click",()=>show(i)));if(slides.length)setInterval(()=>show((current+1)%slides.length),5000);