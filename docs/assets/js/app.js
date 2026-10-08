'use strict';
// Registros gerados por scripts/02_consolidar_dados.py (assets/js/dados.js)
const DATA=(window.DADOS||[]).map(x=>({
 c:x.cargo==='Federal'?'F':'E',u:x.nome_urna,n:x.nome_completo,p:x.partido,num:x.numero,g:x.genero,r:x.cor_raca,s:x.situacao,v:x.votos,
 t:x.receita_liquida,dp:x.receita_partidos,nac:x.receita_direcao_nacional,est:x.receita_direcao_estadual,dc:x.receita_outros_candidatos,pf:x.receita_pessoas_fisicas,
 dt:x.despesa_total,dd:x.despesa_doacoes_outros_candidatos,fb:x.despesa_facebook,fbl:x.lancamentos_facebook,imp:x.despesa_impulsionamento,
 mil:x.despesa_militancia_rua,pes:x.despesa_pessoal,ter:x.despesa_servicos_terceiros,cpf:x.pago_pessoas_fisicas,cpfn:x.pessoas_fisicas_pagas,upd:x.contas_atualizadas_em}));
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const brl2=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const fmtInt=v=>Number(v).toLocaleString('pt-BR');
const pct=v=>(isFinite(v)?(v*100).toLocaleString('pt-BR',{maximumFractionDigits:1}):'0')+'%';
function compact(v){if(v>=1e6)return 'R$ '+(v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' mi';if(v>=1e3)return 'R$ '+(v/1e3).toLocaleString('pt-BR',{maximumFractionDigits:0})+' mil';return brl.format(v)}
const dm=s=>s.slice(8,10)+'/'+s.slice(5,7), dmy=s=>dm(s)+'/'+s.slice(0,4);
const sum=(a,k)=>a.reduce((s,d)=>s+((typeof k==='function'?k(d):d[k])||0),0);
const cargoL=d=>d.c==='F'?'Dep. Federal':'Dep. Estadual';
const norm=s=>(s||'').toString().normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

DATA.forEach((d,i)=>{d.i=i;d.cp=d.mil+d.pes;d.oth=Math.max(0,d.dt-d.fb-d.cp-d.dd);d.out=Math.max(0,d.t-d.nac-d.est-d.dc-d.pf);d.cpvI=d.v>0?d.t/d.v:null;d.cpvD=d.v>0?d.dt/d.v:null;d.stale=d.upd<'2026-10-01'});

const SRC=[
 {k:'nac',l:'Direção nacional',c:'var(--s1)'},
 {k:'est',l:'Direção estadual (RS)',c:'var(--s2)'},
 {k:'dc',l:'Outros candidatos',c:'var(--s3)'},
 {k:'pf',l:'Pessoas físicas',c:'var(--s4)'},
 {k:'out',l:'Outras fontes',c:'var(--s5)'}];
const EXP=[
 {k:'fb',l:'Facebook',c:'var(--s1)'},
 {k:'cp',l:'Contratação de pessoas',c:'var(--s2)'},
 {k:'dd',l:'Doações a outros candidatos',c:'var(--s3)'},
 {k:'oth',l:'Outras despesas',c:'var(--s5)'}];

const st={cargo:'',part:'',gen:'',raca:'',q:'',sort:{k:'v',dir:-1}};
function filtered(){const q=norm(st.q);return DATA.filter(d=>(!st.cargo||d.c===st.cargo)&&(!st.part||d.p===st.part)&&(!st.gen||d.g===st.gen)&&(!st.raca||d.r===st.raca)&&(!q||norm(d.u).includes(q)||norm(d.n).includes(q)||norm(d.p).includes(q)||String(d.num).includes(q)))}

const tip=$('tip');
function showTip(e,html){tip.innerHTML=html;tip.hidden=false;const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14,y=e.clientY+14;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y+h>innerHeight-8)y=e.clientY-h-14;tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px'}
function hideTip(){tip.hidden=true}
const metaLine=d=>`${cargoL(d)} · ${esc(d.p)} · nº ${d.num}`;
function candTip(d){return `<b>${esc(d.u)}</b><div class="note">${esc(d.n)} · ${esc(d.p)} · nº ${d.num}</div><div class="r">${SRC.map(s=>`<i class="lk" style="background:${s.c}"></i><span>${s.l}</span><span>${brl2.format(d[s.k]||0)}</span>`).join('')}<i></i><span class="tot">Receita líquida</span><span class="tot">${brl2.format(d.t)}</span></div><div class="note">${fmtInt(d.v)} votos · ${brl2.format(d.cpvI)} investidos por voto</div>`}
function despTip(d){
 const rows=[['var(--s1)','Facebook',d.fb],['var(--s2)','Contratação de pessoas',d.cp],[null,'Militância e mobilização de rua',d.mil,1],[null,'Despesas com pessoal',d.pes,1],['var(--s3)','Doações a outros candidatos',d.dd],['var(--s5)','Outras despesas',d.oth]];
 return `<b>${esc(d.u)}</b><div class="note">${metaLine(d)}</div><div class="r">${rows.map(([c,l,v,sub])=>`${c?`<i class="lk" style="background:${c}"></i>`:'<i></i>'}<span${sub?' class="sub"':''}>${l}</span><span${sub?' class="sub"':''}>${brl2.format(v)}</span>`).join('')}<i></i><span class="tot">Despesa total</span><span class="tot">${brl2.format(d.dt)}</span></div>
 <div class="note">${fmtInt(d.v)} votos · ${brl2.format(d.cpvD)} gastos por voto${d.fb>0?`<br>Facebook: ${pct(d.fb/d.dt)} da despesa, ${d.fbl} lançamento${d.fbl===1?'':'s'}`:''}<br>Pago a pessoas físicas (CPF): ${brl2.format(d.cpf)} para ${fmtInt(d.cpfn)} pessoa${d.cpfn===1?'':'s'}<br>Serviços prestados por terceiros (fora de "pessoas"): ${brl2.format(d.ter)}<br>Impulsionamento de conteúdo, todas as plataformas: ${brl2.format(d.imp)}</div>
 <div class="note${d.stale?' warnline':''}">Contas atualizadas em ${dmy(d.upd)}${d.stale?'. Despesas feitas depois dessa data ainda não aparecem.':''}</div>`}

function render(){
 const f=filtered();
 $('count').textContent=`${f.length} de ${DATA.length} deputados`;
 const T=sum(f,'t'),P=sum(f,'dp'),D=sum(f,'dt'),FB=sum(f,'fb'),CP=sum(f,'cp'),V=sum(f,'v'),nfb=f.filter(d=>d.fb>0).length;
 const k=[
  {l:'Receita líquida',v:compact(T),t:brl2.format(T),d:f.length?`${f.length} deputados · média ${compact(T/f.length)}`:'sem deputados'},
  {l:'Doação dos partidos',v:compact(P),t:brl2.format(P),d:`${pct(P/T)} da receita`},
  {l:'Despesa total lançada',v:compact(D),t:brl2.format(D),d:`${pct(D/T)} da receita · prestação parcial`},
  {l:'Gasto com Facebook',v:compact(FB),t:brl2.format(FB),d:`${nfb} deputado${nfb===1?'':'s'} · ${pct(FB/D)} da despesa`},
  {l:'Contratação de pessoas',v:compact(CP),t:brl2.format(CP),d:`${pct(CP/D)} da despesa · militância de rua e pessoal`},
  {l:'Votos',v:fmtInt(V),t:fmtInt(V)+' votos',d:V?`${brl2.format(T/V)} investidos · ${brl2.format(D/V)} gastos por voto`:'—'}];
 $('kpis').innerHTML=k.map(x=>`<div class="kpi"><span class="l">${x.l}</span><span class="v" title="${x.t}">${x.v}</span><span class="d">${x.d}</span></div>`).join('');
 // composição
 const parts=SRC.map(s=>({...s,v:sum(f,s.k)}));
 $('stack').innerHTML=T?parts.filter(p=>p.v>0).map(p=>`<div style="flex:0 0 calc(${p.v/T*100}% - 2px);background:${p.c}" data-l="${p.l}" data-v="${p.v}"></div>`).join(''):'<div class="empty" style="flex:1">Sem dados</div>';
 document.querySelectorAll('#stack>div[data-l]').forEach(el=>{el.onmousemove=e=>showTip(e,`<b>${el.dataset.l}</b><div>${brl2.format(+el.dataset.v)} · ${pct(el.dataset.v/T)}</div>`);el.onmouseleave=hideTip});
 $('comp').innerHTML=parts.map(p=>`<i class="sw" style="background:${p.c}"></i><span>${p.l}</span><span class="n">${brl.format(p.v)}</span><span class="p">${pct(p.v/T)}</span>`).join('');
 // equidade (igual ao painel anterior)
 const groups=[{t:'Mulheres',m:d=>d.g==='Feminino'},{t:'Pessoas negras (pretas e pardas)',m:d=>d.r==='Preta'||d.r==='Parda'},{t:'Pessoas brancas',m:d=>d.r==='Branca'}];
 $('eq').innerHTML=f.length?groups.map(g=>{const s=f.filter(g.m);const a=s.length/f.length,b=P?sum(s,'dp')/P:0;const diff=(b-a)*100;
   return `<div class="eq-row"><div class="t"><span>${g.t}</span><em class="gap-pos">${s.length} candidatos · ${diff>=0?'+':''}${diff.toLocaleString('pt-BR',{maximumFractionDigits:1})} p.p.</em></div>
   <div class="bar"><span>Candidaturas</span><div class="track"><div class="fill" style="width:${a*100}%;background:var(--s1)"></div></div><span class="pv">${pct(a)}</span></div>
   <div class="bar"><span>Doação do partido</span><div class="track"><div class="fill" style="width:${b*100}%;background:var(--s2)"></div></div><span class="pv">${pct(b)}</span></div></div>`}).join(''):'<div class="empty">Sem dados</div>';
 const tot=m=>brl.format(sum(f.filter(m),'dp'));
 $('avg').innerHTML=`<span>Total de doação do partido · mulheres</span><span>${tot(d=>d.g==='Feminino')}</span><span>Total de doação do partido · homens</span><span>${tot(d=>d.g==='Masculino')}</span><span>Total de doação do partido · pessoas negras</span><span>${tot(d=>d.r==='Preta'||d.r==='Parda')}</span><span>Total de doação do partido · pessoas brancas</span><span>${tot(d=>d.r==='Branca')}</span>`;
 renderRank(f);
 renderScatter(f);
 renderCands(f);
 renderTable(f);
}

// ---------- ranking ----------
const MET={
 inv:{v:d=>d.t,head:'Investido',pct:false,word:'investidos'},
 dt:{v:d=>d.dt,head:'Despesa total',pct:false,word:'gastos'},
 fb:{v:d=>d.fb,head:'Facebook',pct:true,word:'com Facebook',none:'Facebook'},
 cp:{v:d=>d.cp,head:'Pessoas',pct:true,word:'com pessoas',none:'contratação de pessoas'}};
const TITLES={
 inv:{cpv:'Ranking de R$ investido por voto',val:'Ranking de R$ investido'},
 dt:{cpv:'Ranking de R$ gasto por voto',val:'Ranking de despesa total'},
 fb:{val:'Ranking de gastos com Facebook',cpv:'Ranking de R$ gasto com Facebook por voto',pct:'Ranking do peso do Facebook na despesa'},
 cp:{val:'Ranking de gastos com contratação de pessoas',cpv:'Ranking de R$ gasto com pessoas por voto',pct:'Ranking do peso da contratação de pessoas na despesa'}};
const SUBS={
 inv:{cpv:'Receita líquida ÷ votos nominais do 1º turno. Posição 1 = quem precisou de menos dinheiro para conquistar cada voto.',val:'Receita líquida: total recebido, descontadas as devoluções. Posição 1 = quem mais recebeu.'},
 dt:{cpv:'Despesa total lançada na prestação de contas ÷ votos nominais do 1º turno. Posição 1 = quem gastou menos para conquistar cada voto.',val:'Despesa total lançada na prestação de contas, incluindo doações a outros candidatos. Posição 1 = quem mais gastou.'},
 fb:{val:'Pagamentos a Facebook Serviços Online do Brasil Ltda. (CNPJ 13.347.016/0001-17). Posição 1 = quem mais pagou ao Facebook.',cpv:'Pagamentos ao Facebook (CNPJ 13.347.016/0001-17) ÷ votos nominais. Posição 1 = menor gasto com Facebook por voto.',pct:'Parte da despesa total paga ao Facebook (CNPJ 13.347.016/0001-17). Posição 1 = quem destinou a maior fatia da despesa ao Facebook.'},
 cp:{val:'Atividades de militância e mobilização de rua + despesas com pessoal, como cada campanha classificou na prestação. Posição 1 = quem mais gastou contratando pessoas.',cpv:'Gasto com militância de rua e pessoal ÷ votos nominais. Posição 1 = menor gasto com pessoas por voto.',pct:'Parte da despesa total gasta com militância de rua e pessoal. Posição 1 = quem destinou a maior fatia da despesa a contratar pessoas.'}};
const NAT={cpv:1,val:-1,pct:-1};
const DEF={inv:{by:'cpv',dir:1},dt:{by:'cpv',dir:1},fb:{by:'val',dir:-1},cp:{by:'val',dir:-1}};
const RK={mode:'inv',met:'dt',by:'cpv',dir:1};
const rkKey=()=>RK.mode==='inv'?'inv':RK.met;
function setPressed(sel,test,attr){document.querySelectorAll(sel).forEach(b=>b.setAttribute(attr||'aria-pressed',String(test(b))))}
function syncRankUI(){
 const k=rkKey(),M=MET[k];
 if(!M.pct&&RK.by==='pct')RK.by='cpv';
 setPressed('#rk-tabs button',b=>b.dataset.v===RK.mode,'aria-selected');
 $('rk-met').hidden=RK.mode!=='desp';
 setPressed('#rk-met button',b=>b.dataset.v===RK.met);
 document.querySelector('#rk-by [data-v="pct"]').hidden=!M.pct;
 document.querySelector('#rk-by [data-v="val"]').textContent=k==='inv'?'Valor investido':'Valor gasto';
 setPressed('#rk-by button',b=>b.dataset.v===RK.by);
 setPressed('#effsort button',b=>+b.dataset.v===RK.dir);
 $('rk-eyebrow').textContent=RK.mode==='inv'?'Eficiência do investimento':'Despesas lançadas na prestação de contas';
 $('rk-title').textContent=TITLES[k][RK.by];
 $('rk-sub').textContent=SUBS[k][RK.by];
 $('h-val').textContent=M.head;$('h-pct').hidden=!M.pct;
 $('ranking').classList.toggle('pct',M.pct);
 [['h-val','val'],['h-pct','pct'],['h-cpv','cpv']].forEach(([id,b])=>$(id).classList.toggle('on',RK.by===b));
}
function setRank(mode,met){RK.mode=mode;if(met)RK.met=met;Object.assign(RK,DEF[rkKey()]);syncRankUI();renderRank(filtered())}
function renderRank(fd){
 const k=rkKey(),M=MET[k],desp=RK.mode==='desp';
 const val=M.v,cpv=d=>val(d)/d.v,pc=d=>d.dt>0?val(d)/d.dt:0;
 const by=RK.by,key={cpv,val,pct:pc}[by],nat=NAT[by];
 const zero=M.pct?fd.filter(d=>!(val(d)>0)):[];
 const wv=fd.filter(d=>d.v>0&&(!M.pct||val(d)>0));
 const ranked=[...wv].sort((a,b)=>(key(a)-key(b))*nat||a.u.localeCompare(b.u,'pt-BR'));
 const pos=new Map(ranked.map((d,i)=>[d,i+1]));
 const list=RK.dir===nat?ranked:[...ranked].reverse();
 const mx={cpv:Math.max(1e-9,...wv.map(cpv)),val:Math.max(1e-9,...wv.map(val)),pct:Math.max(1e-9,...wv.map(pc))};
 const staleTag=d=>desp&&d.stale?`<span class="stale">contas de ${dm(d.upd)}</span>`:'';
 const big={cpv:d=>`${brl2.format(cpv(d))} <small>por voto</small>`,val:d=>`${compact(val(d))} <small>${M.word}</small>`,pct:d=>`${pct(pc(d))} <small>da despesa</small>`}[by];
 const det=d=>by==='cpv'?`${fmtInt(d.v)} votos · ${compact(val(d))} ${M.word}`:by==='val'?`${fmtInt(d.v)} votos · ${brl2.format(cpv(d))} por voto${M.pct?' · '+pct(pc(d))+' da despesa':''}`:`${compact(val(d))} de ${compact(d.dt)} gastos · ${fmtInt(d.v)} votos`;
 $('podium').innerHTML=list.slice(0,3).map(d=>`<div class="pod"><span class="n">${pos.get(d)}º</span><span class="who">${esc(d.u)}<small>${metaLine(d)}${staleTag(d)}</small></span><span class="val">${big(d)}</span><span class="det">${det(d)}</span></div>`).join('');
 const cell=(kind,v,txt)=>{const on=by===kind;return `<span class="vc${on?' on':''}">${on?`<span class="eb"><div style="width:${Math.max(.5,v/mx[kind]*100)}%"></div></span>`:''}<b>${txt}</b></span>`};
 $('eff').innerHTML=list.length?list.map(d=>`<div class="rrow" data-i="${d.i}"><span class="rk">${pos.get(d)}</span><span class="nm"><b title="${esc(d.u)}">${esc(d.u)}</b><small>${metaLine(d)}${staleTag(d)}</small></span><span class="r vv">${fmtInt(d.v)}</span>${cell('val',val(d),brl.format(val(d)))}${M.pct?cell('pct',pc(d),pct(pc(d))):''}${cell('cpv',cpv(d),brl2.format(cpv(d)))}</div>`).join(''):'<div class="empty">Nenhum deputado nesse filtro.</div>';
 document.querySelectorAll('#eff .rrow').forEach(r=>{const d=DATA[r.dataset.i];r.onmousemove=e=>showTip(e,desp?despTip(d):candTip(d));r.onmouseleave=hideTip});
 let note=`${wv.length} deputado${wv.length===1?'':'s'} no ranking.`;
 if(zero.length)note+=` Sem gasto com ${M.none} lançado (fora do ranking): ${zero.map(d=>d.u).join(', ')}.`;
 const ns=wv.filter(d=>d.stale).length;
 if(desp&&ns)note+=` ${ns} ${ns===1?'tem':'têm'} contas atualizadas só até setembro (marcados com "contas de dd/mm"): despesas feitas depois ainda não aparecem, então os valores deles tendem a sair menores.`;
 if(k==='cp')note+=' Pagamentos lançados como "serviços prestados por terceiros" não entram, mesmo quando feitos a pessoas físicas; passe o mouse sobre um deputado para ver quanto ele pagou a pessoas físicas (CPF).';
 $('rk-note').textContent=note;
}

// ---------- dispersão ----------
const SC={mode:'inv'};let SCPTS=[];
function ticks(a,b,max){let best=null;for(const ms of [[1,1.5,2,3,5,7],[1,2,5],[1,3],[1]]){const out=[];for(let e=Math.floor(a)-1;e<=Math.ceil(b);e++)for(const m of ms){const v=m*10**e,l=Math.log10(v);if(l>=a-1e-9&&l<=b+1e-9)out.push(v)}if(out.length<=max&&out.length>=2)return out;if(out.length>=1)best=out}return best||[]}
const fmtTick=(v,money)=>{const s=v>=1e6?(v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mi':v>=1e3?(v/1e3).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mil':fmtInt(v);return money?'R$ '+s:s};
function renderScatter(fd){
 const inv=SC.mode==='inv',X=d=>inv?d.t:d.dt;
 $('sc-title').textContent=inv?'Votos × total líquido investido':'Votos × despesa total';
 $('sc-sub').textContent=inv?'Votação nominal do 1º turno (TSE, 04/10/2026) contra a receita líquida de cada deputado. O custo por voto é a receita líquida dividida pelos votos.':'Votação nominal do 1º turno (TSE, 04/10/2026) contra a despesa total lançada por cada deputado. Pontos vazados têm contas atualizadas só até setembro, com despesa provavelmente abaixo da real.';
 $('lg-stale').hidden=inv;
 const wv=fd.filter(d=>d.v>0&&X(d)>0);
 const V=sum(wv,'v'),T=sum(wv,X);
 const byc=[...wv].sort((a,b)=>X(a)/a.v-X(b)/b.v),lo=byc[0],hi=byc[byc.length-1];
 const grp=(m,l)=>{const s=wv.filter(m),vv=sum(s,'v'),tt=sum(s,X);return `<div><b>${vv?brl2.format(tt/vv):'—'}</b><span>custo médio por voto · ${l} (${s.length})</span></div>`};
 $('vkpis').innerHTML=`<div><b>${fmtInt(V)}</b><span>votos somados</span></div><div><b>${V?brl2.format(T/V):'—'}</b><span>custo médio por voto</span></div><div><b>${lo?brl2.format(X(lo)/lo.v):'—'}</b><span>menor custo${lo?' · '+esc(lo.u):''}</span></div><div><b>${hi?brl2.format(X(hi)/hi.v):'—'}</b><span>maior custo${hi?' · '+esc(hi.u):''}</span></div>${grp(d=>d.c==='F','federais')}${grp(d=>d.c==='E','estaduais')}`;
 const svg=$('scatter'),W=Math.max(300,Math.round($('sc-wrap').clientWidth||900)),narrow=W<600,H=narrow?360:420,L=narrow?54:66,R=narrow?10:18,Tp=narrow?26:12,B=44;
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 if(!wv.length){svg.innerHTML=`<rect x="0" y="0" width="${W}" height="${H}" fill="var(--bg)" rx="8"/><text x="${W/2}" y="${H/2}" text-anchor="middle" style="font-size:14px;fill:var(--ink-2)">Nenhum deputado nesse filtro</text>`;SCPTS=[];return}
 const lg=Math.log10,xs=wv.map(X),ys=wv.map(d=>d.v);
 let x0=lg(Math.min(...xs)),x1=lg(Math.max(...xs)),y0=lg(Math.min(...ys)),y1=lg(Math.max(...ys));
 const px=Math.max(.08,(x1-x0)*.06),py=Math.max(.06,(y1-y0)*.08);x0-=px;x1+=px;y0-=py;y1+=py;
 const sx=v=>L+(lg(v)-x0)/(x1-x0)*(W-L-R),sy=v=>H-B-(lg(v)-y0)/(y1-y0)*(H-B-Tp);
 let g='';
 ticks(x0,x1,Math.floor((W-L-R)/(narrow?78:95))).forEach(v=>{const x=sx(v);g+=`<line class="gl" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${Tp}" y2="${H-B}"/><text x="${x.toFixed(1)}" y="${H-B+16}" text-anchor="middle">${fmtTick(v,1)}</text>`});
 ticks(y0,y1,Math.floor((H-B-Tp)/44)).forEach(v=>{const y=sy(v);g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text x="${L-8}" y="${(y+4).toFixed(1)}" text-anchor="end">${fmtTick(v)}</text>`});
 g+=`<line class="ax" x1="${L}" x2="${W-R}" y1="${H-B}" y2="${H-B}"/><text class="axt" x="${(L+W-R)/2}" y="${H-6}" text-anchor="middle">${inv?'Receita líquida (total líquido investido)':'Despesa total lançada'}</text>`+(narrow?`<text class="axt" x="${L-8}" y="14" text-anchor="end">Votos</text>`:`<text class="axt" transform="translate(14 ${(Tp+H-B)/2}) rotate(-90)" text-anchor="middle">Votos</text>`);
 const pts=wv.map(d=>({d,x:sx(X(d)),y:sy(d.v)}));
 // linha do custo médio; o rótulo vai para o trecho da linha com menos pontos por perto
 let avgTxt='',avgS=[];
 if(V>0){const la=lg(T/V),a=Math.max(x0,y0+la),b=Math.min(x1,y1+la);
  if(b>a){const X1=sx(10**a),Y1=sy(10**(a-la)),X2=sx(10**b),Y2=sy(10**(b-la));
   g+=`<line x1="${X1.toFixed(1)}" y1="${Y1.toFixed(1)}" x2="${X2.toFixed(1)}" y2="${Y2.toFixed(1)}" stroke="var(--ink-2)" stroke-width="2" stroke-dasharray="6 5"/>`;
   const txt=`${narrow?'Média':'Custo médio'}: ${brl2.format(T/V)} por voto`,tw=txt.length*6.3,len=Math.hypot(X2-X1,Y2-Y1),ux=(X2-X1)/len,uy=(Y2-Y1)/len,nx=uy,ny=-ux;
   if(len>tw+20){let bs=10,bc=1e9;
    for(let s=10;s<=len-tw-10;s+=12){let c=0;for(let q=0;q<=tw;q+=12){const cx=X1+ux*(s+q)+nx*10,cy=Y1+uy*(s+q)+ny*10;for(const p of pts)if((p.x-cx)**2+(p.y-cy)**2<110)c++}if(c<bc){bc=c;bs=s}}
    const tx=X1+ux*bs+nx*5,ty=Y1+uy*bs+ny*5;
    for(let q=0;q<=tw;q+=10)avgS.push([X1+ux*(bs+q)+nx*10,Y1+uy*(bs+q)+ny*10]);
    avgTxt=`<text class="avgl" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) rotate(${(Math.atan2(uy,ux)*180/Math.PI).toFixed(2)})">${txt}</text>`}}}
 g+=pts.map(p=>{const col=p.d.c==='F'?'var(--s1)':'var(--s2)',hol=!inv&&p.d.stale;return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5.5" fill="${hol?'var(--surface)':col}" stroke="${hol?col:'var(--surface)'}" stroke-width="2"/>`}).join('');
 g+=avgTxt;
 // rótulos seletivos: menores e maiores custos por voto + o mais votado
 const nl=narrow?2:3,byp=[...pts].sort((a,b)=>X(a.d)/a.d.v-X(b.d)/b.d.v),top=[...pts].sort((a,b)=>b.d.v-a.d.v)[0];
 const pick=[...new Set([top,...byp.slice(0,nl),...byp.slice(-nl)])],placed=[];
 const fits=b=>b.x0>=L+2&&b.x1<=W-R&&b.y0>=Tp&&b.y1<=H-B-2&&!placed.some(o=>!(b.x1<o.x0||b.x0>o.x1||b.y1<o.y0||b.y0>o.y1))&&!avgS.some(([x,y])=>x>b.x0-6&&x<b.x1+6&&y>b.y0-6&&y<b.y1+6);
 pick.forEach(p=>{const w=p.d.u.length*6.7+4;
  const c=[{x:p.x+9,y:p.y+4,a:'start',b:{x0:p.x+8,x1:p.x+9+w,y0:p.y-7,y1:p.y+6}},{x:p.x-9,y:p.y+4,a:'end',b:{x0:p.x-9-w,x1:p.x-8,y0:p.y-7,y1:p.y+6}},{x:p.x,y:p.y-11,a:'middle',b:{x0:p.x-w/2,x1:p.x+w/2,y0:p.y-22,y1:p.y-9}},{x:p.x,y:p.y+20,a:'middle',b:{x0:p.x-w/2,x1:p.x+w/2,y0:p.y+9,y1:p.y+22}}].find(c=>fits(c.b));
  if(c){placed.push(c.b);g+=`<text class="lbl" x="${c.x.toFixed(1)}" y="${c.y.toFixed(1)}" text-anchor="${c.a}">${esc(p.d.u)}</text>`}});
 g+=`<circle id="sc-hl" r="9.5" fill="none" stroke="var(--ink)" stroke-width="2" visibility="hidden" pointer-events="none"/>`;
 svg.innerHTML=g;SCPTS=pts;
}
function scTip(d){const inv=SC.mode==='inv',x=inv?d.t:d.dt;return `<b>${esc(d.u)}</b><div class="note">${metaLine(d)}</div><div class="r2"><span>Votos</span><span>${fmtInt(d.v)}</span><span>${inv?'Receita líquida':'Despesa total'}</span><span>${brl2.format(x)}</span><span>${inv?'R$ investido por voto':'R$ gasto por voto'}</span><span>${brl2.format(x/d.v)}</span></div>${!inv?`<div class="note${d.stale?' warnline':''}">Contas atualizadas em ${dmy(d.upd)}${d.stale?'. Despesas feitas depois dessa data ainda não aparecem.':''}</div>`:''}`}
function scHover(e){const svg=$('scatter'),r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;if(!vb||!r.width)return;const k=vb.width/r.width,x=(e.clientX-r.left)*k,y=(e.clientY-r.top)*k;let best=null,bd=24*24;SCPTS.forEach(p=>{const q=(p.x-x)**2+(p.y-y)**2;if(q<bd){bd=q;best=p}});const hl=$('sc-hl');if(!hl)return;if(best){hl.setAttribute('cx',best.x);hl.setAttribute('cy',best.y);hl.setAttribute('visibility','visible');showTip(e,scTip(best.d))}else{hl.setAttribute('visibility','hidden');hideTip()}}
$('scatter').addEventListener('pointermove',scHover);$('scatter').addEventListener('pointerdown',scHover);
$('scatter').addEventListener('pointerleave',()=>{const hl=$('sc-hl');if(hl)hl.setAttribute('visibility','hidden');hideTip()});

// ---------- barras por deputado ----------
const PC={mode:'inv'};
function renderCands(fd){
 const inv=PC.mode==='inv',parts=inv?SRC:EXP,tot=d=>inv?d.t:d.dt;
 $('pc-title').textContent=inv?'Recursos por candidato':'Despesas por candidato';
 $('pc-sub').textContent=inv?'Ordenado pela receita líquida. Passe o mouse para ver o detalhe.':'Ordenado pela despesa total lançada. Passe o mouse para ver o detalhe.';
 $('leg2').innerHTML=parts.map(s=>`<span><i class="sw" style="background:${s.c}"></i>${s.l}</span>`).join('')+(inv?'':'<span><i class="dot-warn"></i>Contas atualizadas só até setembro</span>');
 const sorted=[...fd].sort((a,b)=>tot(b)-tot(a)),mx=sorted.length?tot(sorted[0]):1;
 const el=$('cands');
 el.innerHTML=sorted.length?sorted.map(d=>`<div class="crow" data-i="${d.i}"><span class="nm" title="${esc(d.u)}">${esc(d.u)}<small>${esc(d.p)} · ${d.c==='F'?'Fed.':'Est.'}</small></span><div class="cstack" style="width:${Math.max(.4,tot(d)/mx*100)}%">${parts.filter(s=>d[s.k]>0).map(s=>`<div style="flex:${d[s.k]} 1 0;background:${s.c}"></div>`).join('')}</div><span class="tot">${!inv&&d.stale?`<i class="dot-warn" title="Contas atualizadas em ${dmy(d.upd)}"></i>`:''}${compact(tot(d))}</span></div>`).join(''):'<div class="empty">Nenhum deputado com esses filtros</div>';
 el.querySelectorAll('.crow').forEach(r=>{const d=DATA[r.dataset.i];r.onmousemove=e=>showTip(e,inv?candTip(d):despTip(d));r.onmouseleave=hideTip});
}

// ---------- tabela ----------
const COLS=[
 {k:'c',l:'Cargo'},{k:'u',l:'Nome de urna'},{k:'n',l:'Nome completo'},{k:'p',l:'Partido'},{k:'num',l:'Número',num:1},
 {k:'g',l:'Gênero'},{k:'r',l:'Cor/Raça'},{k:'s',l:'Situação'},{k:'v',l:'Votos',int:1},
 {k:'t',l:'Receita líquida',m:1},{k:'dp',l:'Doação dos partidos',m:1},{k:'dt',l:'Despesa total',m:1},{k:'fb',l:'Facebook',m:1},{k:'cp',l:'Contratação de pessoas',m:1},
 {k:'cpvI',l:'R$ investido por voto',m:1},{k:'cpvD',l:'R$ gasto por voto',m:1},{k:'upd',l:'Contas atualizadas em',date:1}];
const thead=document.querySelector('#tbl thead tr');
thead.innerHTML=COLS.map(c=>`<th tabindex="0" data-k="${c.k}" class="${c.m||c.num||c.int||c.date?'num':''}">${c.l}</th>`).join('');
thead.querySelectorAll('th').forEach(th=>{const go=()=>{const k=th.dataset.k,c=COLS.find(c=>c.k===k);st.sort={k,dir:st.sort.k===k?-st.sort.dir:(c.m||c.int||c.date?-1:1)};renderTable(filtered())};th.onclick=go;th.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
function renderTable(f){
 const {k,dir}=st.sort;
 const rows=[...f].sort((a,b)=>{const x=a[k],y=b[k];if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return -1;return (typeof x==='number'?x-y:String(x).localeCompare(String(y),'pt-BR'))*dir});
 thead.querySelectorAll('th').forEach(th=>th.setAttribute('aria-sort',th.dataset.k===k?(dir>0?'ascending':'descending'):'none'));
 document.querySelector('#tbl tbody').innerHTML=rows.map(d=>`<tr>${COLS.map(c=>{const v=d[c.k];
   if(c.k==='c')return `<td><span class="pill">${d.c==='F'?'Federal':'Estadual'}</span></td>`;
   if(c.k==='s')return `<td><span class="pill${v==='Eleito por QP'?' qp':''}">${esc(v)}</span></td>`;
   if(c.m)return `<td class="num">${v==null?'—':brl2.format(v)}</td>`;
   if(c.int)return `<td class="num">${fmtInt(v)}</td>`;
   if(c.date)return `<td class="num">${d.stale?'<i class="dot-warn" title="Despesas feitas depois dessa data ainda não aparecem"></i> ':''}${dmy(v)}</td>`;
   return `<td class="${c.num?'num':''}">${esc(v)}</td>`}).join('')}</tr>`).join('');
}

// ---------- controles ----------
const PARTIES=[...new Set(DATA.map(d=>d.p))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
$('f-part').innerHTML='<option value="">Todos os partidos</option>'+PARTIES.map(p=>`<option>${esc(p)}</option>`).join('');
const RACAS=[...new Set(DATA.map(d=>d.r))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
$('f-raca').innerHTML='<option value="">Todas as cores/raças</option>'+RACAS.map(r=>`<option>${esc(r)}</option>`).join('');
document.querySelectorAll('#f-cargo button').forEach(b=>b.onclick=()=>{st.cargo=b.dataset.v;setPressed('#f-cargo button',x=>x===b);render()});
$('f-part').onchange=e=>{st.part=e.target.value;render()};
$('f-gen').onchange=e=>{st.gen=e.target.value;render()};
$('f-raca').onchange=e=>{st.raca=e.target.value;render()};
$('f-q').oninput=e=>{st.q=e.target.value;render()};
document.querySelectorAll('#rk-tabs button').forEach(b=>b.onclick=()=>setRank(b.dataset.v));
document.querySelectorAll('#rk-met button').forEach(b=>b.onclick=()=>setRank('desp',b.dataset.v));
document.querySelectorAll('#rk-by button').forEach(b=>b.onclick=()=>{RK.by=b.dataset.v;RK.dir=NAT[RK.by];syncRankUI();renderRank(filtered())});
document.querySelectorAll('#effsort button').forEach(b=>b.onclick=()=>{RK.dir=+b.dataset.v;syncRankUI();renderRank(filtered())});
document.querySelectorAll('#sc-tabs button').forEach(b=>b.onclick=()=>{SC.mode=b.dataset.v;setPressed('#sc-tabs button',x=>x===b,'aria-selected');renderScatter(filtered())});
document.querySelectorAll('#pc-tabs button').forEach(b=>b.onclick=()=>{PC.mode=b.dataset.v;setPressed('#pc-tabs button',x=>x===b,'aria-selected');renderCands(filtered())});
document.querySelectorAll('[role="tablist"]').forEach(tl=>tl.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const bs=[...tl.querySelectorAll('[role="tab"]')],i=bs.indexOf(document.activeElement);if(i<0)return;const n=bs[(i+(e.key==='ArrowRight'?1:bs.length-1))%bs.length];n.focus();n.click();e.preventDefault()}));
syncRankUI();
render();
let rsz=0,lastW=0;new ResizeObserver(()=>{const w=$('sc-wrap').clientWidth;if(Math.abs(w-lastW)<2)return;lastW=w;cancelAnimationFrame(rsz);rsz=requestAnimationFrame(()=>renderScatter(filtered()))}).observe($('sc-wrap'));
