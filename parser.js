// Lê a resposta do MODO PERGUNTAS e separa seções, perguntas e lembretes ("Escutar").
function parseRoteiro(txt){
 const secs=[];let cur=null,q=null,grp=[];
 const LAB=/^(escutar|prioridade|registrar|lembrete|anote|leia|observa)/i;
 const sec=t=>{cur={t,qs:[],opt:/se couber|condicional|opcional/i.test(t)};secs.push(cur);q=null};
 const add=(x,n,opt)=>{if(!cur)sec("Perguntas geradas");q={q:x,n:n||"",opt:!!opt||cur.opt};cur.qs.push(q);grp.push(q)};
 const note=s=>{if(!q)return;const f=grp[0]||q;f.n=f.n?f.n+" "+s:s;if(/^(só se|fazer só se)/i.test(s))grp.forEach(x=>x.opt=true)};
 txt.split(/\r?\n/).forEach(raw=>{
  const sn=raw.trim().replace(/^[•\-–*]\s*/,"").replace(/^\d+[.)]\s*/,"");
  if(!sn)return;
  if(LAB.test(sn)){if(!/^lembrete/i.test(sn))note(sn);return}
  const k=sn.search(/[“"]/);
  if(k>=0){const pre=sn.slice(0,k).trim();
   if(!pre||(pre.endsWith(":")&&pre.length<160)){
    const c=pre.slice(0,-1);grp=[];
    [...sn.matchAll(/[“"]([^”"]+)[”"]/g)].map(m=>m[1].trim()).forEach((s,n)=>add(s,n?"":c,n>0||/^(se|só se)\b/i.test(c)));return}}
  const [a,b]=sn.split(/\s*o que escutar:\s*/i);
  if(/\?$/.test(a)&&a.length>8){grp=[];add(a,b);return}
  if(sn.length<=80&&!/[.:;?]$/.test(sn)){sec(sn);return}
  note(sn)});
 return secs.filter(s=>s.qs.length)}
if(typeof module!=="undefined")module.exports=parseRoteiro;
