const K="anamnese_v3",$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let DB={at:[]},A=null,steps=[],i=0,rec=null,on=false,gen=[],items=[];
try{DB=JSON.parse(localStorage.getItem(K))||DB}catch(e){}
DB.at=DB.at||[];DB.bq=DB.bq||[];
const persist=()=>{try{localStorage.setItem(K,JSON.stringify(DB))}catch(e){}};
const baixar=(txt,nome,tipo)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:tipo+";charset=utf-8"}));a.download=nome;a.click()};
const show=id=>["home","banco","fluxo","boasvindas","setup","previa","atend","resumo","pretalk","suspiro","regressao","retorno","indicacao","encerramento"].forEach(x=>$(x).hidden=x!=id);

/* ---------- Início ---------- */
function home(){stop();A=null;show("home");
 $("lista").innerHTML=DB.at.length?DB.at.slice().reverse().map(a=>`<div class="item"><div><b>${esc(a.nome||"Sem nome")}</b><br><span class="cnt">${esc(a.dem||"")} · ${new Date(a.d).toLocaleString("pt-BR")}</span></div><button data-o="${esc(a.id)}">Abrir</button><button data-x="${esc(a.id)}">Excluir</button></div>`).join(""):'<div class="cnt">Nenhum atendimento salvo neste aparelho.</div>'}
$("lista").onclick=e=>{const o=e.target.dataset.o,x=e.target.dataset.x;
 if(o)abrir(o);
 if(x&&confirm("Excluir este atendimento? Isso não pode ser desfeito.")){DB.at=DB.at.filter(a=>a.id!=x);persist();home()}};
$("exp").onclick=()=>baixar(JSON.stringify(DB),"backup_anamneses_"+new Date().toISOString().slice(0,10)+".json","application/json");
$("imp").onchange=e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();
 fr.onload=()=>{try{const d=JSON.parse(fr.result);let n=0;(d.at||[]).forEach(a=>{if(!DB.at.some(b=>b.id==a.id)){DB.at.push(a);n++}});let m=0;(d.bq||[]).forEach(b=>{if(!DB.bq.some(x=>x.id==b.id)){DB.bq.push(b);m++}});persist();home();alert(n+" atendimento(s) e "+m+" conjunto(s) de perguntas importado(s).")}catch(x){alert("Não foi possível ler este arquivo.")}};
 fr.readAsText(f);e.target.value=""};

/* ---------- Novo paciente ---------- */
const cmd=()=>"MODO PERGUNTAS — "+$("dem").value.trim()+($("sexo").value?", "+$("sexo").value:"")+($("idade").value?", "+$("idade").value+" anos":"")+($("ctx").value.trim()?", "+$("ctx").value.trim():"");
const upd=()=>{$("cmd").value=cmd();listarBanco()};
["dem","sexo","idade","ctx"].forEach(x=>$(x).oninput=upd);
$("novo").onclick=()=>{["nome","dem","idade","ctx","cola"].forEach(x=>$(x).value="");$("sexo").value="";$("ok").checked=false;upd();show("setup")};
$("voltar1").onclick=()=>show("fluxo");$("voltar2").onclick=()=>show("setup");
$("copiar").onclick=()=>{upd();$("cmd").select();
 (navigator.clipboard?navigator.clipboard.writeText($("cmd").value):Promise.reject()).catch(()=>document.execCommand("copy")).finally(()=>{$("copiar").textContent="Copiado ✓";setTimeout(()=>$("copiar").textContent="Copiar comando",1500)})};
function validar(){
 if(typeof BASE=="undefined"){alert("Faltam arquivos do site (roteiros/base.js). Envie todos os arquivos do pacote.");return false}
 if(!$("nome").value.trim()||!$("dem").value.trim()){alert("Preencha o nome e a demanda.");return false}
 if(!$("ok").checked){alert("Confirme o consentimento por escrito do paciente.");return false}
 return true}
function previa(g,doBanco){
 gen=g;
 const ia=gen.flatMap(s=>s.qs.map(x=>({src:"ia",t:"MODO PERGUNTAS · "+s.t,o:"",n:x.n,q:x.q,opt:x.opt,off:/fecho|muro/i.test(s.t)})));
 items=[...BASE.ini.map(x=>({...x,src:"base"})),...ia,...BASE.fim.map(x=>({...x,src:"base"}))];
 let last="";
 $("pv").innerHTML=items.map((x,k)=>(x.t!=last?(last=x.t,`<h3>${esc(x.t)}</h3>`):"")+`<label class="chk ${x.src}"><input type="checkbox" data-k="${k}" ${x.off?"":"checked"}><span><b class="num"></b>${esc(x.q)}${x.n?`<br><small>${esc(x.n)}</small>`:""}</span></label>`).join("");
 $("salvarbanco").hidden=doBanco;
 if(!doBanco){$("bq_dem").value=$("dem").value.trim();$("bq_sexo").value=$("sexo").value;$("bq_min").value="";$("bq_max").value="";$("bq_msg").textContent=""}
 numerar();show("previa")}
$("ler").onclick=()=>{
 if(typeof parseRoteiro=="undefined")return alert("Faltam arquivos do site (parser.js). Envie todos os arquivos do pacote.");
 if(!validar())return;
 const g=parseRoteiro($("cola").value);
 if(!g.length)return alert("Não encontrei perguntas no texto colado. Cole a resposta completa do MODO PERGUNTAS.");
 previa(g,false)};

/* ---------- Banco de perguntas ---------- */
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const faixa=b=>b.min!=null&&b.max!=null?b.min+" a "+b.max+" anos":b.max!=null?"até "+b.max+" anos":b.min!=null?"a partir de "+b.min+" anos":"qualquer idade";
const rotulo=b=>b.dem+" · "+(b.sexo||"homem ou mulher")+" · "+faixa(b);
const nq=g=>g.reduce((n,s)=>n+s.qs.length,0);
function achar(){
 const d=norm($("dem").value),sx=$("sexo").value,id=$("idade").value===""?null:+$("idade").value;
 if(!d)return[];
 return DB.bq.filter(b=>{const bd=norm(b.dem);return bd&&(d.includes(bd)||bd.includes(d))&&(!b.sexo||!sx||b.sexo==sx)&&(id==null||((b.min==null||id>=b.min)&&(b.max==null||id<=b.max)))})}
function listarBanco(){const r=achar();
 $("bancolista").innerHTML=!$("dem").value.trim()?'<div class="cnt">Preencha a demanda para procurar no banco.</div>':r.length?r.map(b=>`<div class="item"><div>${esc(rotulo(b))}<br><span class="cnt">${nq(b.gen)} perguntas</span></div><button class="p" data-b="${esc(b.id)}">Usar</button></div>`).join(""):'<div class="cnt">Nenhuma entrada no banco para esta combinação.</div>'}
$("bancolista").onclick=e=>{const b=e.target.dataset.b;if(!b||!validar())return;const x=DB.bq.find(y=>y.id==b);if(x)previa(JSON.parse(JSON.stringify(x.gen)),true)};
$("bq_salvar").onclick=()=>{
 const dem=$("bq_dem").value.trim(),sexo=$("bq_sexo").value,min=$("bq_min").value===""?null:+$("bq_min").value,max=$("bq_max").value===""?null:+$("bq_max").value;
 if(!dem)return alert("Informe a demanda.");
 if(min!==null&&max!==null&&min>max)return alert("A idade inicial é maior que a final.");
 const ig=DB.bq.find(b=>norm(b.dem)==norm(dem)&&b.sexo==sexo&&b.min===min&&b.max===max);
 if(ig){if(!confirm("Já existe uma entrada igual no banco. Substituir?"))return;ig.gen=gen;ig.d=Date.now()}
 else DB.bq.push({id:Date.now().toString(36),dem,sexo,min,max,gen,d:Date.now()});
 persist();$("bq_msg").textContent="Salvo no banco ✓";setTimeout(()=>$("bq_msg").textContent="",2500)};
function paginaBanco(){
 $("bq_lista").innerHTML=DB.bq.length?DB.bq.slice().reverse().map(b=>`<div class="item"><div><b>${esc(rotulo(b))}</b><br><span class="cnt">${nq(b.gen)} perguntas</span><details><summary class="cnt">Ver perguntas</summary>${b.gen.map(s=>"<h3>"+esc(s.t)+"</h3>"+s.qs.map(q=>'<div class="cnt">• '+esc(q.q)+"</div>").join("")).join("")}</details></div><button data-r="${esc(b.id)}">Renomear</button><button data-x="${esc(b.id)}">Excluir</button></div>`).join(""):'<div class="cnt">O banco está vazio. Salve um conjunto na tela de prévia, depois de ler as perguntas do MODO PERGUNTAS.</div>';
 show("banco")}
$("bq_lista").onclick=e=>{const r=e.target.dataset.r,x=e.target.dataset.x;
 if(r){const b=DB.bq.find(y=>y.id==r),n=prompt("Nome da demanda:",b.dem);if(n&&n.trim()){b.dem=n.trim();persist();paginaBanco()}}
 if(x&&confirm("Excluir este conjunto de perguntas?")){DB.bq=DB.bq.filter(b=>b.id!=x);persist();paginaBanco()}};
$("irbanco").onclick=paginaBanco;
$("voltarbanco").onclick=home;
function numerar(){let n=0;$("pv").querySelectorAll("input").forEach(c=>{c.nextElementSibling.firstChild.textContent=c.checked?(++n)+". ":"";c.parentNode.style.opacity=c.checked?1:.45});$("tot").textContent=n+" perguntas no roteiro"}
$("pv").onchange=numerar;
$("montar").onclick=()=>{
 const s=[...$("pv").querySelectorAll("input:checked")].map(c=>{const{t,o,n,q,opt}=items[c.dataset.k];return{t,o,n,q,opt}}),id=Date.now().toString(36);
 DB.at.push({id,nome:$("nome").value.trim(),dem:cmd().replace("MODO PERGUNTAS — ",""),d:Date.now(),i:0,s,a:s.map(()=>"")});persist();abrir(id)};

/* ---------- Atendimento ---------- */
function abrir(id){A=DB.at.find(a=>a.id==id);steps=A.s;i=Math.min(A.i||0,steps.length-1);show("atend");render()}
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
const arquivo=()=>{const d=new Date(A.d);return"anamnese_"+A.nome.trim()[0].toUpperCase()+"_"+d.toISOString().slice(0,10)+"_"+d.toTimeString().slice(0,5).replace(":","")+".txt"};
function relatorio(){
 const d=new Date(A.d),ini=A.nome.trim()[0].toUpperCase()+".";
 let o="ANAMNESE\nPaciente: "+ini+"\nDemanda: "+A.dem+"\nData: "+d.toLocaleString("pt-BR")+"\n",last="";
 steps.forEach((s,n)=>{const a=A.a[n];if(s.opt&&!a)return;
  if(s.t!=last){o+="\n=== "+s.t.toUpperCase()+" ===\n";last=s.t}
  o+="\n"+(s.q.includes("\n")?"Perguntas:\n- "+s.q.split("\n").join("\n- "):"Pergunta: "+s.q)+"\nResposta: "+(a||"(sem resposta)")+"\n"});
 return o}
const copiarTxt=(t,b)=>{const l=b.textContent,f=()=>{const x=document.createElement("textarea");x.value=t;document.body.append(x);x.select();document.execCommand("copy");x.remove()};
 (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(f).then(()=>{b.textContent="Copiado ✓";setTimeout(()=>b.textContent=l,1500)})};
$("rep").onclick=()=>{stop();save();$("txt").value=relatorio();show("resumo")};
$("baixar").onclick=()=>baixar($("txt").value,arquivo(),"text/plain");
$("copiarsessao").onclick=()=>copiarTxt("MODO SESSÃO\n\n"+$("txt").value,$("copiarsessao"));
$("voltarperg").onclick=()=>show("atend");
$("irpretalk").onclick=()=>show("pretalk");
$("voltarresumo").onclick=()=>show("resumo");

/* ---------- Suspiro fisiológico e Script de Confiança ---------- */
const md=s=>esc(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>");
function leitura(){
 $("sc_leitura").innerHTML=$("sc_cola").value.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!/^[-–—_*]{3,}$/.test(l)).map(l=>{
  const h=l.match(/^#{1,6}\s*(.+)$/);
  return h?"<h3>"+md(h[1])+"</h3>":"<p>"+md(l.replace(/^[-*•]\s+/,"• "))+"</p>"}).join("")}
function modoLeitura(on){$("sc_edit").hidden=on;$("sc_ler").hidden=!on}
function abrirSuspiro(){
 $("sc_aviso").hidden=!!A;
 $("sc_cola").value=A?A.sc||"":$("sc_cola").value;$("sc_ok").value=A?A.fs||"":$("sc_ok").value;
 if($("sc_cola").value.trim()){leitura();modoLeitura(true)}else modoLeitura(false);
 show("suspiro")}
$("irsuspiro").onclick=abrirSuspiro;
// Os dois atalhos da tela Pré-talk devem abrir a mesma página.
const preTalk=$("pretalk");
if(preTalk){
  preTalk.addEventListener("click",e=>{
    const btn=e.target.closest("button");
    if(!btn)return;
    const texto=(btn.textContent||"").trim().toLocaleLowerCase("pt-BR");
    if(texto.includes("suspiro fisiológico")||texto.includes("script de confiança")){
      e.preventDefault();
      abrirSuspiro();
    }
  });
}
$("sc_cola").oninput=()=>{if(A){A.sc=$("sc_cola").value;persist()}};
$("sc_ok").oninput=()=>{if(A){A.fs=$("sc_ok").value;persist()}};
$("sc_exibir").onclick=()=>{
 if(!$("sc_cola").value.trim())return alert("Cole primeiro a resposta do MODO SESSÃO.");
 if(A){A.sc=$("sc_cola").value;persist()}leitura();modoLeitura(true)};
$("sc_editar").onclick=()=>modoLeitura(false);
$("voltarpretalk").onclick=()=>show("pretalk");
$("irregressao").onclick=()=>show("regressao");
$("voltarsuspiro").onclick=()=>show("suspiro");

/* ---------- Navegação do fluxo: qualquer botão com data-go ---------- */
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{
 const p=b.dataset.go;stop();
 if(p=="home")home();else if(p=="suspiro")abrirSuspiro();else show(p)});
home();
