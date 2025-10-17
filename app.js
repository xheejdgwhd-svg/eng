
/* Minimal SPA‑like behavior, offline-friendly (no external libs) */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const state = {
  progress: Number(localStorage.getItem("progress") || 0),
  profile: JSON.parse(localStorage.getItem("profile") || '{"displayName":"","level":"Beginner"}'),
  quizIndex: 0,
  quizScore: 0,
  quiz: []
};

// Sample quiz (replace with your data source later)
const sampleQuiz = [
  {q:"Choose the correct sentence:", a:["She go to work.", "She goes to work.", "She going work."], c:1},
  {q:"Select the plural:", a:["Childs","Children","Childes"], c:1},
  {q:"Pick the correct preposition: I'm interested ___ music.", a:["in","on","at"], c:0},
  {q:"'Their' is used to show...", a:["Place","Possession","Time"], c:1},
  {q:"Past of 'go' is ...", a:["goed","went","gone (as verb)"], c:1}
];

const sampleBlog = [
  {title:"3 quick tips for Present Simple", body:"Use it for routines, habits, timetables. Add 's' for he/she/it. Use 'do/does' for questions/negatives."},
  {title:"Pronunciation: voiced vs voiceless", body:"Put your fingers on your throat: if it vibrates (/z/, /v/, /ð/), it's voiced; if not (/s/, /f/, /θ/), voiceless."},
  {title:"Vocabulary micro‑lesson: Collocations", body:"Learn words in common pairs: 'make a decision', 'take a break', 'do homework'."}
];

function init() {
  // profile
  $("#displayName").value = state.profile.displayName || "";
  $("#level").value = state.profile.level || "Beginner";

  // progress ring
  updateProgressRing(state.progress);

  // build quiz
  state.quiz = sampleQuiz;
  renderQuizQuestion();

  // blog
  const blogList = $("#blogList");
  blogList.innerHTML = sampleBlog.map(post => `
    <article class="post card">
      <h4>${post.title}</h4>
      <p>${post.body}</p>
    </article>
  `).join("");

  // search
  $("#searchBtn").addEventListener("click", onSearch);
  $("#searchInput").addEventListener("keydown", e=>{ if(e.key==="Enter") onSearch(); });

  // paths
  $$("#paths [data-action='startPath']").forEach(btn=>btn.addEventListener("click", e=>{
    const card = e.currentTarget.closest("[data-path]");
    const pathName = card.dataset.path;
    toast(`Started: ${pathName}`);
    bumpProgress(2);
  }));

  // profile form
  $("#profileForm").addEventListener("submit", e=>{
    e.preventDefault();
    state.profile.displayName = $("#displayName").value.trim();
    state.profile.level = $("#level").value;
    localStorage.setItem("profile", JSON.stringify(state.profile));
    toast("Profile saved");
  });
}

function onSearch(){
  const term = $("#searchInput").value.trim();
  if(!term){ toast("Type a word or topic"); return; }
  const hits = [];
  sampleBlog.forEach(p=>{ if((p.title+p.body).toLowerCase().includes(term.toLowerCase())) hits.push(`Blog: ${p.title}`); });
  state.quiz.forEach((q,i)=>{ if(q.q.toLowerCase().includes(term.toLowerCase())) hits.push(`Quiz Q${i+1}`); });
  toast(hits.length ? `Found ${hits.length} item(s): ${hits.slice(0,3).join(", ")}${hits.length>3?'…':''}` : "No results");
}

function renderQuizQuestion(){
  const box = $("#quizBox");
  const i = state.quizIndex;
  const item = state.quiz[i];
  if(!item){ // finished
    const pct = Math.round((state.quizScore / state.quiz.length) * 100);
    bumpProgress(Math.max(5, Math.round(pct/10)));
    box.innerHTML = `
      <div class="q"><strong>Finished!</strong> Score: ${state.quizScore}/${state.quiz.length} (${pct}%)</div>
      <button class="btn cta" id="retryBtn">Try again</button>
    `;
    $("#retryBtn").addEventListener("click", resetQuiz);
    return;
  }
  box.innerHTML = `
    <div class="q"><strong>Q${i+1}.</strong> ${item.q}</div>
    <div class="choices">
      ${item.a.map((choice, idx)=>`<div class="choice" data-idx="${idx}">${choice}</div>`).join("")}
    </div>
  `;
  $$("#quizBox .choice").forEach(el=>{
    el.addEventListener("click", ()=>{
      const idx = Number(el.dataset.idx);
      if(idx===item.c){
        el.classList.add("correct");
        state.quizScore++;
        toast("Nice!");
      } else {
        el.classList.add("wrong");
        toast("Not quite");
      }
      setTimeout(()=>{
        state.quizIndex++;
        renderQuizQuestion();
      }, 450);
    });
  });
}

function resetQuiz(){
  state.quizIndex = 0; state.quizScore = 0;
  renderQuizQuestion();
}

function bumpProgress(delta){
  state.progress = Math.min(100, state.progress + delta);
  localStorage.setItem("progress", String(state.progress));
  updateProgressRing(state.progress);
}

function updateProgressRing(pct){
  const arc = $("#progressArc");
  const label = $("#progressPct");
  const copy = $("#progressCopy");
  const dash = Math.max(0, Math.min(100, pct));
  arc.setAttribute("stroke-dasharray", `${dash}, 100`);
  label.textContent = `${dash}%`;
  copy.textContent = dash === 0 ? "Let’s begin!" : dash < 100 ? "Keep going!" : "Great job!";
}

function toast(msg){
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.classList.add("show"), 10);
  setTimeout(()=> { t.classList.remove("show"); setTimeout(()=>t.remove(), 250); }, 1800);
}

// Simple notification badge animation
$("#notifyBtn")?.addEventListener("click", ()=> toast("No new notifications"));

// Tiny CSS-driven toast
const styleToast = document.createElement("style");
styleToast.textContent = `.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) scale(.96);background:#0e1b2b;color:#fff;padding:.55rem .8rem;border-radius:10px;opacity:0;transition:.25s;box-shadow:0 10px 24px rgba(0,0,0,.25);z-index:99}
.toast.show{opacity:1; transform:translateX(-50%)}`;
document.head.appendChild(styleToast);

document.addEventListener("DOMContentLoaded", init);
