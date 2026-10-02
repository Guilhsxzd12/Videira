(async()=>{const db=window.videiraDb;if(!db)return;try{
 const [sr,mr,cr,tr,br]=await Promise.all([
  db.from('site_settings').select('*').eq('id',1).maybeSingle(),
  db.from('menu_items').select('*').eq('active',true).order('sort_order'),
  db.from('content_sections').select('*').eq('active',true).order('sort_order'),
  db.from('wine_types_catalog').select('*').eq('active',true).order('sort_order'),
  db.from('banners').select('*').eq('active',true).order('sort_order')
 ]);
 const s=sr.data,m=mr.data||[],c=cr.data||[],t=tr.data||[],banners=br.data||[];
 window.__VIDEIRA_SETTINGS=s||{};
 if(s){
   const r=document.documentElement;
   if(s.color_primary)r.style.setProperty('--wine',s.color_primary);
   if(s.color_secondary)r.style.setProperty('--wine-mid',s.color_secondary);
   if(s.color_accent)r.style.setProperty('--green',s.color_accent);
   if(s.color_background)r.style.setProperty('--paper',s.color_background);
   if(s.font_body)r.style.setProperty('--body',"'"+s.font_body+"',Arial,sans-serif");
   if(s.font_heading)r.style.setProperty('--heading',"'"+s.font_heading+"',Georgia,serif");
   if(s.custom_css){const x=document.createElement('style');x.textContent=s.custom_css;document.head.appendChild(x)}
   if(s.logo_url)document.querySelectorAll('img[alt="Videira"]').forEach(i=>i.src=s.logo_url);
   if(s.favicon_url){let l=document.querySelector('link[rel="icon"]');if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l)}l.href=s.favicon_url}
   document.querySelectorAll('[data-cms-footer]').forEach(e=>e.textContent=s.footer_text||'Videira Vinhoteca © 2026');
   document.querySelectorAll('[data-cms-whatsapp]').forEach(a=>{if(s.whatsapp)a.href='https://wa.me/'+String(s.whatsapp).replace(/\D/g,'')});
   document.querySelectorAll('[data-cms-instagram]').forEach(a=>{if(s.instagram){let v=String(s.instagram).trim();a.href=v.startsWith('http')?v:'https://instagram.com/'+v.replace(/^@/,'')}})
 }
}catch(e){console.warn('CMS',e)}})();