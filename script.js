/* =============================================================
   MockMate — Vanilla JS app logic
   - Page navigation (landing / dashboard / aptitude / technical / hr)
   - Dynamic category + topic rendering
   - Quiz engine with timer, progress, scoring, restart
   - Local storage for streak + completed tests
   - Toast notifications, mobile menu
   ============================================================= */

/* ---------- DATA ---------- */

const APTITUDE_CATS = [
  { id:'quant',  icon:'∑', name:'Quantitative Aptitude', desc:'Numbers, percentages and core math.',
    topics:['Percentages','Profit & Loss','Time & Work','Probability','Simplification']},
  { id:'logical',icon:'◇', name:'Logical Reasoning', desc:'Patterns, puzzles and deductions.',
    topics:['Blood Relations','Coding-Decoding','Seating Arrangement','Puzzles','Syllogisms']},
  { id:'verbalR',icon:'A', name:'Verbal Reasoning', desc:'Statements, assumptions, conclusions.',
    topics:['Statement & Assumption','Cause & Effect','Course of Action','Statement & Conclusion','Decision Making']},
  { id:'verbalA',icon:'¶', name:'Verbal Ability', desc:'English language fundamentals.',
    topics:['Synonyms','Antonyms','Sentence Correction','Reading Comprehension','Para Jumbles']},
  { id:'nvr',    icon:'◈', name:'Non-Verbal Reasoning', desc:'Visual patterns and series.',
    topics:['Mirror Images','Paper Folding','Series','Cubes & Dice','Embedded Figures']},
  { id:'share',  icon:'☆', name:'Share Your Experiences', desc:'Community insights & interview stories.',
    topics:['TCS Experience','Infosys Round','Wipro Walk-in','Accenture Drive','Cognizant Mock']},
];

const TECH_CATS = [
  { id:'web',  icon:'⟨⟩', name:'Web Development', desc:'Frontend & backend essentials.',
    topics:['HTML','CSS','JavaScript','React Basics','APIs']},
  { id:'ds',   icon:'∂',  name:'Data Science', desc:'Stats, ML and data wrangling.',
    topics:['Python for DS','Statistics','Pandas','Visualization','SQL for Data']},
  { id:'da',   icon:'▤',  name:'Data Analytics', desc:'Insights from data.',
    topics:['Excel','SQL','Power BI','Tableau','Business Reporting']},
  { id:'ai',   icon:'✦',  name:'AI & Machine Learning', desc:'Modern AI fundamentals.',
    topics:['Python','Machine Learning Basics','Neural Networks','Deep Learning','NLP']},
  { id:'cyber',icon:'⛨',  name:'Cybersecurity', desc:'Defense, attacks and best practices.',
    topics:['Networking Basics','Cryptography','Web Security','Ethical Hacking','OS Security']},
];

const HR_CATS = [
  { id:'classic',  icon:'☺', name:'Classic HR Questions', desc:'Tell-me-about-yourself essentials.',
    topics:['Self Introduction','Strengths & Weaknesses','Why This Company','Career Goals','Salary Discussion']},
  { id:'situational',icon:'◐', name:'Situational MCQs', desc:'How would you react if…',
    topics:['Conflict at Work','Missed Deadline','Difficult Teammate','Leadership Moment','Failure Story']},
  { id:'domain', icon:'⌘', name:'Domain-Based HR', desc:'Role-specific HR rounds.',
    topics:['Software Engineer HR','Data Analyst HR','Product Intern HR','Consulting HR','Sales HR']},
];

/* Question bank — small, reusable; topic name becomes title */
const SAMPLE_QUESTIONS = {
  default: [
    { q:'A man buys an item for ₹400 and sells for ₹500. Profit %?', a:['20%','25%','30%','40%'], c:1 },
    { q:'If 3x + 5 = 20, x = ?', a:['3','4','5','6'], c:2 },
    { q:'Synonym of "Diligent"?', a:['Lazy','Hardworking','Sleepy','Loud'], c:1 },
    { q:'HTML stands for?', a:['Hyper Text Markup Language','High Text Machine Lang','Hyper Tabular ML','None'], c:0 },
    { q:'STAR in HR stands for?', a:['Situation Task Action Result','Story Topic Answer Reply','Skill Trait Aim Role','None'], c:0 },
  ],
  Percentages:[
    {q:'25% of 200?',a:['25','50','75','100'],c:1},
    {q:'What % is 45 of 180?',a:['20%','25%','30%','15%'],c:1},
    {q:'Increase 80 by 25%?',a:['90','95','100','105'],c:2},
    {q:'80 is what % of 400?',a:['10%','15%','20%','25%'],c:2},
    {q:'Decrease 200 by 40%?',a:['100','110','120','140'],c:2},
  ],
  JavaScript:[
    {q:'typeof null returns?',a:['null','object','undefined','string'],c:1},
    {q:'Which keyword declares a block-scoped variable?',a:['var','let','function','int'],c:1},
    {q:'Array.map returns?',a:['void','new array','same array','number'],c:1},
    {q:'=== checks?',a:['value','type only','value & type','reference'],c:2},
    {q:'JSON.parse converts?',a:['Object → string','String → object','Array → string','None'],c:1},
  ],
  HTML:[
    {q:'Tag for largest heading?',a:['<h6>','<head>','<h1>','<header>'],c:2},
    {q:'Self-closing tag?',a:['<div>','<img>','<span>','<p>'],c:1},
    {q:'Attribute for image source?',a:['link','src','href','source'],c:1},
    {q:'Semantic tag for navigation?',a:['<nav>','<menu>','<navigation>','<a>'],c:0},
    {q:'HTML5 doctype?',a:['<!DOCTYPE html5>','<!DOCTYPE html>','<doctype html>','<!doctype>'],c:1},
  ],
  'Self Introduction':[
    {q:'Best opener for self intro?',a:['Random joke','Name + background + interest','Salary expectation','Hobbies only'],c:1},
    {q:'Ideal length?',a:['10s','30s','60–90s','5 minutes'],c:2},
    {q:'Avoid mentioning?',a:['Education','Projects','Personal complaints','Skills'],c:2},
    {q:'STAR is useful for?',a:['Behavioral answers','Coding','Aptitude','Resume design'],c:0},
    {q:'Close intro with?',a:['Why you fit','Asking salary','Listing failures','Silence'],c:0},
  ],
};

/* ---------- STATE ---------- */
const State = {
  currentPage:'landing',
  currentView:'dashboard',
  quiz:null,
  storage: JSON.parse(localStorage.getItem('mockmate') || '{}'),
};
function saveStore(){ localStorage.setItem('mockmate', JSON.stringify(State.storage)); }

/* ---------- NAVIGATION ---------- */
const $ = (s,p=document)=>p.querySelector(s);
const $$ = (s,p=document)=>[...p.querySelectorAll(s)];

function showPage(pageName){
  if(pageName==='landing'){
    $$('.page').forEach(p=>p.classList.remove('active'));
    $('.page-landing').classList.add('active');
    State.currentPage='landing';
  } else {
    $$('.page').forEach(p=>p.classList.remove('active'));
    $('.page-app').classList.add('active');
    State.currentPage='app';
    showView(pageName);
  }
  setActiveNav(pageName);
  window.scrollTo({top:0,behavior:'smooth'});
}
function showView(view){
  $$('.view').forEach(v=>v.classList.remove('active'));
  const target = $(`.view-${view}`);
  if(target) target.classList.add('active');
  State.currentView = view;
  $$('.side-link').forEach(s=>s.classList.toggle('active', s.dataset.nav===view));
}
function setActiveNav(name){
  $$('.nav-link').forEach(l=>l.classList.toggle('active', l.dataset.nav===name));
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-nav]');
  if(!t) return;
  e.preventDefault();
  showPage(t.dataset.nav);
  $('#navLinks').classList.remove('open');
  $('#sidebar')?.classList.remove('open');
});

$('#hamburger').addEventListener('click', () => $('#navLinks').classList.toggle('open'));
$('#loginBtn').addEventListener('click', () => toast('Sign-in coming soon ✨'));

/* ---------- RENDER CATEGORIES ---------- */
function renderCats(containerId, cats, kind){
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = cats.map(c => `
    <div class="cat-card">
      <div class="cat-head">
        <div class="cat-ic">${c.icon}</div>
        <div>
          <h3>${c.name}</h3>
          <div class="cat-desc">${c.desc}</div>
        </div>
      </div>
      <div class="topic-list">
        ${c.topics.map((t,i) => `
          <div class="topic" data-topic="${t}" data-cat="${c.name}">
            <div><b>${t}</b></div>
            <div class="topic-meta">
              <span class="diff ${['easy','med','hard','easy','med'][i]}">${['Easy','Medium','Hard','Easy','Medium'][i]}</span>
              <span>5 Q · 3 min</span>
              <span style="color:var(--primary);font-weight:600">Start →</span>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  wrap.querySelectorAll('.topic').forEach(el => {
    el.addEventListener('click', () => startQuiz(el.dataset.topic, el.dataset.cat));
  });
}

renderCats('aptitudeCats', APTITUDE_CATS, 'aptitude');
renderCats('techCats', TECH_CATS, 'technical');
renderCats('hrCats', HR_CATS, 'hr');

/* ---------- QUIZ ENGINE ---------- */
function startQuiz(topic, cat){
  const bank = SAMPLE_QUESTIONS[topic] || SAMPLE_QUESTIONS.default;
  const questions = bank.map(q => ({...q, picked: null}));
  State.quiz = { topic, cat, questions, idx:0, time:180, timerId:null };

  $('#quizCat').textContent = cat;
  $('#quizTitle').textContent = topic;
  $('#qTotal').textContent = questions.length;
  openModal('quizModal');
  renderQuestion();
  startTimer();
}

function renderQuestion(){
  const Q = State.quiz;
  const q = Q.questions[Q.idx];
  $('#qIndex').textContent = Q.idx + 1;
  $('#quizProgress').style.width = `${((Q.idx+1)/Q.questions.length)*100}%`;
  $('#quizBody').innerHTML = `
    <div class="q">${Q.idx+1}. ${q.q}</div>
    <div class="options">
      ${q.a.map((opt,i)=>`
        <div class="opt ${q.picked===i?'selected':''}" data-i="${i}">
          <span class="ok">✓</span>${opt}
        </div>`).join('')}
    </div>`;
  $$('#quizBody .opt').forEach(o => o.addEventListener('click', () => {
    q.picked = +o.dataset.i;
    renderQuestion();
  }));

  $('#quizPrev').disabled = Q.idx===0;
  $('#quizPrev').style.opacity = Q.idx===0 ? .5 : 1;
  const last = Q.idx === Q.questions.length-1;
  $('#quizNext').style.display = last?'none':'inline-flex';
  $('#quizSubmit').style.display = last?'inline-flex':'none';
}

$('#quizPrev').addEventListener('click', () => { if(State.quiz.idx>0){State.quiz.idx--;renderQuestion();} });
$('#quizNext').addEventListener('click', () => { if(State.quiz.idx<State.quiz.questions.length-1){State.quiz.idx++;renderQuestion();} });
$('#quizSubmit').addEventListener('click', submitQuiz);
$('#quizClose').addEventListener('click', () => { stopTimer(); closeModal('quizModal'); });

function startTimer(){
  stopTimer();
  updateTimer();
  State.quiz.timerId = setInterval(()=>{
    State.quiz.time--;
    updateTimer();
    if(State.quiz.time<=0){ submitQuiz(); }
  },1000);
}
function stopTimer(){ if(State.quiz?.timerId){clearInterval(State.quiz.timerId);State.quiz.timerId=null;} }
function updateTimer(){
  const t = State.quiz.time;
  const m = String(Math.floor(t/60)).padStart(2,'0');
  const s = String(t%60).padStart(2,'0');
  const el = $('#quizTimer');
  el.textContent = `${m}:${s}`;
  el.classList.toggle('warn', t<=60 && t>30);
  el.classList.toggle('danger', t<=30);
}

function submitQuiz(){
  stopTimer();
  const Q = State.quiz;
  let correct = 0;
  Q.questions.forEach(q => { if(q.picked === q.c) correct++; });
  const pct = Math.round((correct/Q.questions.length)*100);

  // store
  State.storage.completed = (State.storage.completed||0)+1;
  State.storage.scores = State.storage.scores||[];
  State.storage.scores.push({topic:Q.topic, pct, at:Date.now()});
  saveStore();

  // result UI
  $('#resultPct').textContent = `${pct}%`;
  $('#resultLabel').textContent = pct>=80?'Excellent':pct>=60?'Good':pct>=40?'Average':'Keep practicing';
  const arc = $('#resultArc');
  const total = 377;
  arc.setAttribute('stroke-dashoffset', total - (total*pct/100));
  $('#resultSummary').textContent = `You answered ${correct} out of ${Q.questions.length} correctly on ${Q.topic}.`;
  $('#resultBreakdown').innerHTML = `
    <div class="rb"><b>${correct}</b><small>Correct</small></div>
    <div class="rb"><b>${Q.questions.length-correct}</b><small>Wrong</small></div>
    <div class="rb"><b>${pct}%</b><small>Accuracy</small></div>`;
  closeModal('quizModal');
  openModal('resultModal');
  toast(`Test complete · ${pct}% scored`);
}

$('#resultClose').addEventListener('click', ()=>closeModal('resultModal'));
$('#resultRestart').addEventListener('click', ()=>{
  closeModal('resultModal');
  startQuiz(State.quiz.topic, State.quiz.cat);
});

/* ---------- MODAL ---------- */
function openModal(id){ $('#'+id).classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id){ $('#'+id).classList.remove('open'); document.body.style.overflow=''; }

/* ---------- TOAST ---------- */
let toastTimer;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
}

/* ---------- INIT ---------- */
showPage('landing');
console.log('MockMate ready ✨');
