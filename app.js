const wines=[
{winery:"Santa Julia",name:"Dulce Natural Chenin",price:"R$ 89,00",img:null},
{winery:"D.V. Catena",name:"Malbec - Malbec",price:"R$ 189,00",img:null},
{winery:"Santa Julia",name:"Orgánica Malbec",price:"R$ 99,00",img:null},
{winery:"Catena Zapata",name:"Malbec",price:"R$ 159,00",img:null},
{winery:"Santa Julia",name:"La Vaquita",price:"R$ 109,00",img:null},
{winery:"D.V. Catena",name:"Chardonnay",price:"R$ 179,00",img:null},
{winery:"Garzón",name:"Tannat Reserva",price:"R$ 149,00",img:null}
];
function premiumCard(w,i){const visual=w.img?'<img src="'+w.img+'" alt="'+w.winery+' '+w.name+'">':'<div class="premium-bottle"></div>';return '<article class="premium-card"><a href="/vinho.html?slug='+i+'"><div class="premium-card__image">'+visual+'</div><div class="premium-card__meta"><small>'+w.winery.toUpperCase()+'</small><h3>'+w.name+'</h3><div class="price">'+w.price+'</div></div></a><div class="premium-card__actions"><button class="buy-btn" data-name="'+w.winery+' '+w.name+'">Pedir orçamento</button><button class="mini-cart" aria-label="Adicionar">+</button></div></article>'}
function render(id,data){const el=document.getElementById(id);if(el)el.innerHTML=data.map(premiumCard).join("")}
render("offers",wines);render("malbecs",[wines[1],wines[3],wines[2],wines[4],wines[0],wines[5],wines[6]]);
document.querySelectorAll(".premium-rail-wrap").forEach(w=>{const rail=w.querySelector(".premium-rail");w.querySelector(".prev")?.addEventListener("click",()=>rail.scrollBy({left:-520,behavior:"smooth"}));w.querySelector(".next")?.addEventListener("click",()=>rail.scrollBy({left:520,behavior:"smooth"}));let d=false,s=0,l=0;rail.addEventListener("pointerdown",e=>{d=true;s=e.clientX;l=rail.scrollLeft;rail.classList.add("dragging");rail.setPointerCapture(e.pointerId)});rail.addEventListener("pointermove",e=>{if(d)rail.scrollLeft=l-(e.clientX-s)});["pointerup","pointercancel","pointerleave"].forEach(ev=>rail.addEventListener(ev,()=>{d=false;rail.classList.remove("dragging")}))});
document.addEventListener("click",e=>{const b=e.target.closest(".buy-btn");if(!b)return;window.open("https://wa.me/?text="+encodeURIComponent("Olá! Gostaria de solicitar um orçamento para "+b.dataset.name+"."),"_blank","noopener")});
const slides=[...document.querySelectorAll(".premium-hero .hero-slide")],dots=[...document.querySelectorAll(".premium-hero .hero-dots button")];let current=0,timer;function show(i){current=i;slides.forEach((s,n)=>s.classList.toggle("active",n===i));dots.forEach((d,n)=>d.classList.toggle("active",n===i))}function auto(){clearInterval(timer);if(slides.length)timer=setInterval(()=>show((current+1)%slides.length),5500)}dots.forEach((d,i)=>d.addEventListener("click",()=>{show(i);auto()}));auto();