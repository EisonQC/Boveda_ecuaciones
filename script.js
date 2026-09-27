const DIFF = {
  facil: { label:"Aprendiz", desc:"Ecuaciones lineales directas", pts:10, problems:[
    { tag:"1 / 4", problem:"5x + 3 = 18", hint:"Resta 3 en ambos lados, luego divide entre 5.", answer:"3" },
    { tag:"2 / 4", problem:"3(x − 2) = 2x + 1", hint:"Distribuye el 3 y agrupa los términos con x.", answer:"7" },
    { tag:"3 / 4", problem:"x/4 − 1 = 2", hint:"Suma 1 a ambos lados y luego multiplica por 4.", answer:"12" },
    { tag:"4 / 4", problem:"2(x + 1) − 3 = x + 4", hint:"Distribuye, reduce y despeja x.", answer:"5" }
  ]},
  intermedio: { label:"Agente", desc:"Inecuaciones y ecuaciones con fracciones", pts:20, problems:[
    { tag:"1 / 4", problem:"3x − 4 < 11", hint:"Despeja x. Da el mayor entero que cumple.", answer:"4" },
    { tag:"2 / 4", problem:"2 − 5x ≤ −13", hint:"Al dividir entre negativo, invierte el signo. Da el menor entero que cumple.", answer:"3" },
    { tag:"3 / 4", problem:"−3 < 2x − 1 ≤ 7", hint:"Suma 1 en los tres lados, luego divide entre 2. Da el mayor entero que cumple.", answer:"4" },
    { tag:"4 / 4", problem:"(x − 1)/2 + 1 = x − 2", hint:"Multiplica todo por 2 para quitar la fracción.", answer:"5" }
  ]},
  dificil: { label:"Experto", desc:"¿Puedes cumplir este reto?", pts:30, problems:[
    { tag:"1 / 4", problem:"T1=2x⁴ᵃ⁻²y²ᵇ⁻⁵z⁶ᶜ⁺²ᵃ ; T2=−5x²ᵃ⁺²y³⁻²ᵇz⁵ᶜ⁺¹ son términos semejantes. Calcula A=(2a+3)²−(2a−3)²−4bc",
      hint:"Iguala exponentes: a=2, b=2, c=−3. Luego A=24a−4bc.", options:["A = 72","A = 0","A = 3","A = 21"], correct:0 },
    { tag:"2 / 4", problem:"Factoriza y simplifica: M = [(6x²+x−1)/(3x²−10x+3)] · [(x²+2x−15)/(2x²+11x+5)] ÷ [(x²−4)/(x³−x²−4x+4)]",
      hint:"El primer producto se cancela completo a 1; solo queda la división final.", options:["M = (X−1)","M = (X+2)","M = X","M = X(X+5)"], correct:0 },
    { tag:"3 / 4", problem:"Reduce: M = −{x − y − (x − y − x − (x − −y − x))} − y",
      hint:"Resuelve desde el paréntesis más interno hacia afuera, con cuidado en cada signo.", options:["M = −2X","M = X","M = 3X","M = 2X"], correct:2 },
    { tag:"4 / 4", problem:"Si B = [6(2ˣ⁺¹)+5(2ˣ⁺²)−2ˣ⁺⁴] / [2ˣ⁺⁵−15(2ˣ)−3(2ˣ⁺³)] y C = ⁿ²√[(100ⁿ²+25ⁿ²)/(20ⁿ²+5ⁿ²)], halla 7B − C",
      hint:"Factoriza 2ˣ en B (queda −16/7). C siempre da 5.", options:["7B−C = −21","7B−C = 21","7B−C = −16","7B−C = 16"], correct:0 }
  ]}
};

let playerName = '';
let diffKey = null, current = 0, score = 0, hintsUsed = 0, hintUsedThisLevel = false;
let found = [], seconds = 0, timerId = null, answered = false;
let recordsTab = 'facil';

const screens = { start:document.getElementById('start'), game:document.getElementById('game'), final:document.getElementById('final'), records:document.getElementById('records') };
function show(name){ Object.values(screens).forEach(s=>s.classList.remove('show')); screens[name].classList.add('show'); }
function fmtTime(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }

/* --- name gate --- */
function confirmName(){
  const val = document.getElementById('playerName').value.trim();
  if(!val){ document.getElementById('nameMsg').textContent = 'Escribe tu nombre para continuar.'; return; }
  playerName = val;
  document.getElementById('namePanel').style.display = 'none';
  document.getElementById('diffPanel').style.display = 'block';
  buildDiffPanel();
}
document.getElementById('nameOk').addEventListener('click', confirmName);
document.getElementById('playerName').addEventListener('keydown', e=>{ if(e.key==='Enter') confirmName(); });

function buildDiffPanel(){
  const p = document.getElementById('diffPanel');
  p.innerHTML = `<p class="greeting">Bienvenido/a, ${playerName} — elige tu nivel de acceso:</p>`;
  Object.keys(DIFF).forEach(key=>{
    const d = DIFF[key];
    const el = document.createElement('div');
    el.className = 'diffcard';
    el.innerHTML = `<div><div class="name">${d.label}</div><div class="desc">${d.desc}</div></div><div class="pts">${d.pts} pts/candado</div>`;
    el.addEventListener('click', ()=>startGame(key));
    p.appendChild(el);
  });
}

/* --- game flow --- */
function startGame(key){
  diffKey = key; current = 0; score = 0; hintsUsed = 0; seconds = 0;
  found = new Array(DIFF[key].problems.length).fill(null);
  show('game');
  renderLevel();
  clearInterval(timerId);
  timerId = setInterval(()=>{ seconds++; document.getElementById('timer').textContent = fmtTime(seconds); }, 1000);
}

function renderLocks(){
  const problems = DIFF[diffKey].problems;
  const el = document.getElementById('locks'); el.innerHTML='';
  problems.forEach((_,i)=>{
    const d = document.createElement('div');
    d.className = 'lock' + (i<current?' done':i===current?' active':'');
    el.appendChild(d);
  });
}
function renderCodeStrip(target){
  const problems = DIFF[diffKey].problems;
  target.innerHTML = '';
  problems.forEach((lvl,i)=>{
    const d = document.createElement('div');
    d.className = 'chip' + (found[i]!==null?' found':'');
    d.textContent = found[i]!==null ? (lvl.options ? lvl.options[lvl.correct] : lvl.answer) : '???';
    target.appendChild(d);
  });
}

function renderLevel(){
  const lvl = DIFF[diffKey].problems[current];
  document.getElementById('levelTag').textContent = 'CANDADO ' + lvl.tag;
  document.getElementById('problem').textContent = lvl.problem;
  document.getElementById('msg').textContent = ''; document.getElementById('msg').className = 'msg';
  const hb = document.getElementById('hintbox'); hb.classList.remove('show'); hb.textContent='';
  hintUsedThisLevel = false; answered = false;
  document.getElementById('hintBtn').disabled = false;
  document.getElementById('hintBtn').style.opacity = 1;

  const area = document.getElementById('answerArea');
  if(lvl.options){
    area.innerHTML = '<div class="options"></div>';
    const box = area.querySelector('.options');
    lvl.options.forEach((opt,i)=>{
      const b = document.createElement('button');
      b.className = 'opt'; b.textContent = opt;
      b.addEventListener('click', ()=>selectOption(i,b,box));
      box.appendChild(b);
    });
  } else {
    area.innerHTML = '<div class="row"><input type="text" id="answer" inputmode="text" placeholder="x = "><button id="submit">Abrir</button></div>';
    document.getElementById('submit').addEventListener('click', submitText);
    document.getElementById('answer').addEventListener('keydown', e=>{ if(e.key==='Enter') submitText(); });
    document.getElementById('answer').focus();
  }
  renderLocks();
  renderCodeStrip(document.getElementById('codeStrip'));
}

function selectOption(i,btn,box){
  if(answered) return;
  const lvl = DIFF[diffKey].problems[current];
  answered = true;
  [...box.children].forEach((b,idx)=>{
    if(idx===lvl.correct) b.classList.add('correct');
    else if(idx===i) b.classList.add('wrong');
  });
  if(i===lvl.correct){ handleCorrect(lvl); }
  else {
    document.getElementById('msg').textContent='✗ No es correcto. Revisa la pista.';
    document.getElementById('msg').className='msg bad';
    answered=false;
    [...box.children].forEach(b=>b.classList.remove('wrong'));
  }
}

function submitText(){
  const lvl = DIFF[diffKey].problems[current];
  const val = document.getElementById('answer').value.trim().replace(/^x\s*=\s*/i,'');
  if(val === lvl.answer){ handleCorrect(lvl); }
  else { document.getElementById('msg').textContent='✗ Respuesta incorrecta. Inténtalo de nuevo.'; document.getElementById('msg').className='msg bad'; }
}

function handleCorrect(lvl){
  found[current] = true;
  score += hintUsedThisLevel ? Math.round(DIFF[diffKey].pts/2) : DIFF[diffKey].pts;
  document.getElementById('scoreLive').textContent = score;
  document.getElementById('msg').textContent = '✓ Correcto. Candado desactivado.';
  document.getElementById('msg').className = 'msg ok';
  renderCodeStrip(document.getElementById('codeStrip'));
  current++;
  if(current >= DIFF[diffKey].problems.length){ setTimeout(showFinal,700); }
  else { setTimeout(renderLevel,700); }
}

document.getElementById('hintBtn').addEventListener('click', ()=>{
  if(hintUsedThisLevel) return;
  hintUsedThisLevel = true; hintsUsed++;
  const hb = document.getElementById('hintbox');
  hb.textContent = '💡 ' + DIFF[diffKey].problems[current].hint;
  hb.classList.add('show');
  document.getElementById('hintBtn').disabled = true;
  document.getElementById('hintBtn').style.opacity = .5;
});

function confettiBurst(){
  const c = document.createElement('div'); c.className='confetti'; document.body.appendChild(c);
  const colors = ['#c9a227','#e6c65c','#2dd4bf','#e9ebf1'];
  for(let i=0;i<40;i++){
    const s = document.createElement('span');
    s.style.left = Math.random()*100+'vw';
    s.style.background = colors[i%colors.length];
    s.style.animationDuration = (2+Math.random()*1.5)+'s';
    s.style.animationDelay = (Math.random()*0.4)+'s';
    c.appendChild(s);
  }
  setTimeout(()=>c.remove(), 3800);
}

/* --- final + auto-save --- */
function showFinal(){
  clearInterval(timerId);
  show('final');
  confettiBurst();
  document.getElementById('finalTitle').textContent = '🔓 Bóveda "' + DIFF[diffKey].label + '" desactivada';
  document.getElementById('finalSub').textContent = 'Completaste los ' + DIFF[diffKey].problems.length + ' candados de este nivel.';
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalTime').textContent = fmtTime(seconds);
  document.getElementById('finalHints').textContent = hintsUsed;
  renderCodeStrip(document.getElementById('finalCode'));
  autoSaveRecord();
}

function loadRecords(){ try{ return JSON.parse(localStorage.getItem('bovedaRecords')||'[]'); }catch(e){ return []; } }
function saveRecords(r){ try{ localStorage.setItem('bovedaRecords', JSON.stringify(r)); }catch(e){} }

function autoSaveRecord(){
  const records = loadRecords();
  records.push({ name: playerName, diffKey, diffLabel: DIFF[diffKey].label, score, time: seconds, date: new Date().toLocaleDateString() });
  saveRecords(records);
  document.getElementById('saveMsg').textContent = `✓ Guardado como "${playerName}" en el ranking de ${DIFF[diffKey].label}.`;
}

/* --- records screen --- */
function buildTabs(){
  const tabsEl = document.getElementById('diffTabs');
  tabsEl.innerHTML = '';
  Object.keys(DIFF).forEach(key=>{
    const b = document.createElement('button');
    b.className = 'tab' + (key===recordsTab ? ' active' : '');
    b.textContent = DIFF[key].label;
    b.addEventListener('click', ()=>{ recordsTab = key; renderRecords(); });
    tabsEl.appendChild(b);
  });
}

function renderRecords(){
  buildTabs();
  const records = loadRecords().filter(r=>r.diffKey===recordsTab).sort((a,b)=> b.score-a.score || a.time-b.time).slice(0,10);
  const body = document.getElementById('recordsBody');
  if(records.length === 0){ body.innerHTML = `<p class="empty">Aún no hay récords en ${DIFF[recordsTab].label}. ¡Sé el primero!</p>`; return; }
  let html = '<table><thead><tr><th>#</th><th>Nombre</th><th>Puntaje</th><th>Tiempo</th></tr></thead><tbody>';
  records.forEach((r,i)=>{ html += `<tr><td>${i+1}</td><td>${r.name}</td><td class="num">${r.score}</td><td class="num">${fmtTime(r.time)}</td></tr>`; });
  html += '</tbody></table>';
  body.innerHTML = html;
}

document.getElementById('toRecords').addEventListener('click', ()=>{ recordsTab = diffKey || 'facil'; renderRecords(); show('records'); });
document.getElementById('goRecords').addEventListener('click', ()=>{ recordsTab = diffKey || 'facil'; renderRecords(); show('records'); });
document.getElementById('backHome').addEventListener('click', ()=> show('start'));
document.getElementById('backHome2').addEventListener('click', ()=> show('start'));
