const K="anamnese_v2",$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let DB={at:[]},A=null,steps=[],i=0,rec=null,on=false;
try{DB=JSON.parse(localStorage.getItem(K))||DB}catch(e){}
const persist=()=>{try{localStorage.setItem(K,JSON.stringify(DB))}catch(e){}};
const R=id=>ROTEIROS.find(r=>r.id==id);
const flat=r=>r.secoes.flatMap(s=>s[3].map(q=>({t:s[0],o:s[1],n:s[2],q,opt:/abertura/i.test(s[0])})));
const nomeIdx=st=>st.findIndex(s=>/^nome/i.test(s.q));
function nomeDe(a){const r=R(a.r);if(!r)return"Sem nome";const k=nomeIdx(flat(r));return(k>=0&&a.a[k])||"Sem nome"}
const baixar=(txt,nome,tipo)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:tipo+";charset=utf-8"}));a.download=nome;a.click()};

/* ---------- Tela inicial ---------- */
function home(){stop();A=null;$("atend").hidden=true;$("home").hidden=false;
 $("rs").innerHTML=ROTEIROS.map(r=>`<option value="${esc(r.id)}">${esc(r.nome)}</option>`).join("");
 $("novo").disabled=!ROTEIROS.length;
 $("lista").innerHTML=DB.at.length?DB.at.slice().reverse().map(a=>{const r=R(a.r);
  return`<div class="item"><div><b>${esc(nomeDe(a))}</b><br><span class="cnt">${esc(r?r.nome:"roteiro não encontrado")} · ${new Date(a.d).toLocaleString("pt-BR")}</span></div><button data-o="${esc(a.id)}">Abrir</button><button data-x="${esc(a.id)}">Excluir</button></div>`}).join(""):'<div class="cnt">Nenhum atendimento salvo neste aparelho.</div>'}
$("lista").onclick=e=>{const o=e.target.dataset.o,x=e.target.dataset.x;
 if(o)abrir(o);
 if(x&&confirm("Excluir este atendimento? Isso não pode ser desfeito.")){DB.at=DB.at.filter(a=>a.id!=x);persist();home()}};
$("novo").onclick=()=>{const id=Date.now().toString(36);DB.at.push({id,r:$("rs").value,d:Date.now(),i:0,a:[]});persist();abrir(id)};
$("exp").onclick=()=>baixar(JSON.stringify(DB),"backup_anamneses_"+new Date().toISOString().slice(0,10)+".json","application/json");
$("imp").onchange=e=>lerArquivo(e,t=>{const d=JSON.parse(t);let n=0;(d.at||[]).forEach(a=>{if(!DB.at.some(b=>b.id==a.id)){DB.at.push(a);n++}});persist();home();alert(n+" atendimento(s) importado(s).")});
$("irot").onchange=e=>lerArquivo(e,t=>{const r=JSON.parse(t);if(!r.nome||!Array.isArray(r.secoes))throw 0;r.id=r.id||"ext"+Date.now();ROTEIROS.push(r);home();$("rs").value=r.id;alert("Roteiro carregado. Ele vale até você fechar ou recarregar a página.")});
function lerArquivo(e,fn){const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=()=>{try{fn(fr.result)}catch(x){alert("Não foi possível ler este arquivo.")}};fr.readAsText(f);e.target.value=""}

/* ---------- Atendimento ---------- */
function abrir(id){A=DB.at.find(a=>a.id==id);const r=R(A.r);
 if(!r){alert("O roteiro deste atendimento não está disponível nesta página.");A=null;return}
 steps=flat(r);while(A.a.length<steps.length)A.a.push("");i=Math.min(A.i||0,steps.length-1);
 $("home").hidden=true;$("atend").hidden=false;render()}
function save(){if(!A)return;A.a[i]=$("ta").value.trim();A.i=i;persist()}
function render(){const s=steps[i];
 $("sec").textContent=s.t;$("obj").textContent=s.o;$("q").textContent=s.q;$("note").textContent=s.n;
 $("ta").value=A.a[i];$("cnt").textContent="Pergunta "+(i+1)+" de "+steps.length+" · respondidas: "+A.a.filter(Boolean).length;
 $("pb").style.width=((i+1)/steps.length*100)+"%";$("prev").disabled=i==0;$("next").disabled=i==steps.length-1;$("msg").textContent=""}
function stop(){on=false;if(rec){try{rec.stop()}catch(e){}}$("mic").classList.remove("on");$("mic").textContent="🎙️ Gravar resposta do paciente"}
function start(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){$("msg").textContent="Este navegador não suporta reconhecimento de voz. Use o Google Chrome ou o Microsoft Edge.";return}
 save();const at=A,idx=i,me=new SR();rec=me;
 me.lang="pt-BR";me.continuous=true;me.interimResults=true;
 let base=at.a[idx]?at.a[idx]+" ":"";
 me.onresult=e=>{const t=(base+Array.from(e.results).map(r=>r[0].transcript).join(" ")).trim();at.a[idx]=t;if(A===at&&i===idx)$("ta").value=t;persist()};
 me.onerror=e=>{if(e.error=="not-allowed"||e.error=="service-not-allowed"){stop();$("msg").textContent="Permissão do microfone negada. Libere o microfone nas configurações do navegador."}};
 me.onend=()=>{if(on&&rec===me&&A===at&&i===idx){base=at.a[idx]?at.a[idx]+" ":"";try{me.start()}catch(e){}}};
 on=true;me.start();$("mic").classList.add("on");$("mic").textContent="⏹️ Gravando… clique para parar"}
function go(n){stop();save();i=n;render()}
$("mic").onclick=()=>on?(stop(),save()):start();
$("next").onclick=()=>go(i+1);$("prev").onclick=()=>go(i-1);
$("ta").oninput=save;
$("inicio").onclick=()=>{stop();save();home()};
$("rep").onclick=()=>{stop();save();
 const k=nomeIdx(steps),nome=(k>=0&&A.a[k])||"paciente";
 let o="ANAMNESE — "+R(A.r).nome+"\nPaciente: "+nome+"\nData: "+new Date(A.d).toLocaleString("pt-BR")+"\n",last="";
 steps.forEach((s,n)=>{const a=A.a[n];if(s.opt&&!a)return;
  if(s.t!=last){o+="\n=== "+s.t.toUpperCase()+" ===\n";last=s.t}
  o+="\nPergunta: "+s.q+"\nResposta: "+(a||"(sem resposta)")+"\n"});
 baixar(o,"anamnese_"+nome.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").slice(0,30)+"_"+new Date().toISOString().slice(0,10)+".txt","text/plain")};
home();
