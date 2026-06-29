
// --- VIRTUAL FILE SYSTEM (Terminal Emulation) ---
const vfs = {
  "contact.txt": { type: "file", perms: "-r--r--r--", content: "Email: xyz@gmail.com\nGitHub: github.com/R3curs1on\nLinkedIn: in/vedant-shendge" },
  "projects": { type: "dir", perms: "drwxr-xr-x", content: ["ecotrack", "spam_detector", "search_engine"] },
  "resume.pdf": { type: "file", perms: "-rwxr-xr-x", content: "[Binary Data] Use UI button to view." },
  "root": { type: "dir", perms: "drwxr-xr-x", content: ["contact.txt", "projects", "resume.pdf"] }
};

const cliContainer = document.getElementById('cli-container');
const cliInput = document.getElementById('cli-input');
const cliOutput = document.getElementById('cli-output');
let cliOpen = false;

function toggleCLI() {
  cliOpen = !cliOpen;
  if(cliOpen) { cliContainer.classList.add('open'); setTimeout(() => cliInput.focus(), 300); } 
  else { cliContainer.classList.remove('open'); cliInput.blur(); }
}

document.getElementById('cli-trigger').addEventListener('click', toggleCLI);
document.addEventListener('keydown', e => { if (e.key === '`' || e.key === '~') { e.preventDefault(); toggleCLI(); } });

cliInput.addEventListener('keydown', e => {
  if(e.key === 'Enter') {
    const raw = cliInput.value.trim();
    cliInput.value = '';
    printCLI(`guest@vedant:~$ ${raw}`, '');
    if(raw !== '') executeCLI(raw.split(' '));
  }
});

function printCLI(text, className) {
  const div = document.createElement('div');
  div.textContent = text;
  if(className) div.className = className;
  cliOutput.appendChild(div);
  cliOutput.scrollTop = cliOutput.scrollHeight;
}

function executeCLI(args) {
  const cmd = args[0].toLowerCase();
  
  if (cmd === 'sudo' && args[1] === 'rm' && args[2] === '-rf' && args[3] === '/') {
    printCLI("Initiating system wipe...", "cli-err");
    setTimeout(() => { document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:20vh; font-family:var(--mono);'>SYSTEM DELETED</h1><p style='text-align:center;'><button onclick='location.reload()' style='padding: 1rem 2rem; background: transparent; border: 1px solid #64ffda; color:#64ffda; cursor:pointer; font-family:var(--mono);'>Reboot</button></p>"; }, 1000);
    return;
  }

  switch(cmd) {
    case 'ls':
      let lsOut = "";
      vfs.root.content.forEach(item => {
        const type = vfs[item]?.type === 'dir' ? 'cli-dir' : 'cli-succ';
        if(args[1] === '-l') lsOut += `${vfs[item]?.perms || '-rw-r--r--'}  vedant  ${item}\n`;
        else lsOut += `<span class="${type}">${item}</span>  `;
      });
      if(args[1] === '-l') printCLI(lsOut.trim());
      else {
        const d = document.createElement('div'); d.innerHTML = lsOut; cliOutput.appendChild(d);
      }
      break;
    case 'cat':
      if(!args[1]) printCLI("cat: missing file operand", "cli-err");
      else if(!vfs[args[1]]) printCLI(`cat: ${args[1]}: No such file or directory`, "cli-err");
      else if(vfs[args[1]].type === 'dir') printCLI(`cat: ${args[1]}: Is a directory`, "cli-err");
      else printCLI(vfs[args[1]].content);
      break;
    case 'clear': cliOutput.innerHTML = ''; break;
    case 'whoami': printCLI('guest'); break;
    case 'help': printCLI('Available commands: ls, ls -l, cat [file], whoami, clear'); break;
    default: printCLI(`bash: ${cmd}: command not found`, 'cli-err');
  }
}

// --- HERO CANVAS (Dijkstra + Trail + dy/dx Variance Heuristics) ---
const heroCanvas = document.getElementById('heroCanvas');
const heroCtx = heroCanvas.getContext('2d');
let hW, hH, hNodes = [], hEdges = [], shortestPath = [], mouse = {x:-1000, y:-1000}, trail = [];

function initHeroGraph() {
  hW = heroCanvas.width = window.innerWidth; hH = heroCanvas.height = window.innerHeight;
  hNodes = []; hEdges = []; const COLS = 16, ROWS = 10, cellW = hW/COLS, cellH = hH/ROWS;
  for(let i=0; i<=COLS; i++) {
    for(let j=0; j<=ROWS; j++) {
      hNodes.push({ id: i+'_'+j, x: (i*cellW) + (Math.random()-0.5)*(cellW*0.6), y: (j*cellH) + (Math.random()-0.5)*(cellH*0.6), neighbors: [] });
    }
  }
  const distThresh = Math.max(cellW, cellH) * 1.6;
  for(let i=0; i<hNodes.length; i++) {
    for(let j=i+1; j<hNodes.length; j++) {
      const dx = hNodes[i].x - hNodes[j].x, dy = hNodes[i].y - hNodes[j].y, dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < distThresh) {
        hNodes[i].neighbors.push({node: hNodes[j], weight: dist});
        hNodes[j].neighbors.push({node: hNodes[i], weight: dist});
        hEdges.push([hNodes[i], hNodes[j]]);
      }
    }
  }
}
window.addEventListener('resize', initHeroGraph); initHeroGraph();

function getClosestNode(x, y) {
  let minDist = Infinity, closest = null;
  hNodes.forEach(n => { const d = Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2); if(d < minDist) { minDist = d; closest = n; } });
  return closest;
}

function runDijkstra(start, end) {
  if (!start || !end || start === end) return [];
  const dist = new Map(), prev = new Map(), unvisited = new Set(hNodes);
  hNodes.forEach(n => dist.set(n, Infinity)); dist.set(start, 0);
  while(unvisited.size > 0) {
    let curr = null, minD = Infinity;
    unvisited.forEach(n => { if(dist.get(n) < minD) { minD = dist.get(n); curr = n; } });
    if(!curr || curr === end) break; unvisited.delete(curr);
    curr.neighbors.forEach(neighbor => {
      if(unvisited.has(neighbor.node)) {
        const alt = dist.get(curr) + neighbor.weight;
        if(alt < dist.get(neighbor.node)) { dist.set(neighbor.node, alt); prev.set(neighbor.node, curr); }
      }
    });
  }
  const path = []; let u = end;
  while(prev.has(u)) { path.unshift(u); u = prev.get(u); }
  if (path.length > 0) path.unshift(start); return path;
}

document.getElementById('hero').addEventListener('mousemove', e => {
  const rect = heroCanvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
  trail.push({ x: mouse.x, y: mouse.y, time: Date.now() });
  if(trail.length > 25) trail.shift();
  shortestPath = runDijkstra(getClosestNode(hW/2, hH/2), getClosestNode(mouse.x, mouse.y));
});
document.getElementById('hero').addEventListener('mouseleave', () => { trail = []; shortestPath = []; });

// dy/dx variance mathematical analysis
function analyzeTrail() {
  if(trail.length < 10) return null;
  const p1 = trail[0], p2 = trail[trail.length - 1];
  const dx = p2.x - p1.x, dy = p2.y - p1.y, dist = Math.sqrt(dx*dx + dy*dy);
  if (dist < 50) return null;
  let maxDev = 0; const m = dy / (dx || 0.001), c = p1.y - m * p1.x;
  for(let i=1; i<trail.length-1; i++) {
    const dev = Math.abs(m * trail[i].x - trail[i].y + c) / Math.sqrt(m*m + 1);
    if(dev > maxDev) maxDev = dev;
  }
  if(maxDev < 5) return `m = ${(Math.abs(dy/dx)).toFixed(1)}`;
  if(maxDev > 20) return `y = x²`;
  return null;
}

function drawHero() {
  heroCtx.clearRect(0, 0, hW, hH);
  
  heroCtx.lineWidth = 1; heroCtx.strokeStyle = 'rgba(100,255,210,0.04)'; heroCtx.beginPath();
  hEdges.forEach(e => { heroCtx.moveTo(e[0].x, e[0].y); heroCtx.lineTo(e[1].x, e[1].y); }); heroCtx.stroke();
  
  if(shortestPath.length > 1) {
    heroCtx.beginPath(); heroCtx.strokeStyle = 'rgba(100,255,210,0.6)'; heroCtx.lineWidth = 2;
    heroCtx.moveTo(shortestPath[0].x, shortestPath[0].y);
    for(let i=1; i<shortestPath.length; i++) heroCtx.lineTo(shortestPath[i].x, shortestPath[i].y);
    heroCtx.stroke(); heroCtx.fillStyle = '#64ffda';
    shortestPath.forEach(n => { heroCtx.beginPath(); heroCtx.arc(n.x, n.y, 3, 0, Math.PI*2); heroCtx.fill(); });
  }
  
  if (trail.length > 1) {
    heroCtx.beginPath(); heroCtx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      const xc = (trail[i].x + trail[i - 1].x) / 2, yc = (trail[i].y + trail[i - 1].y) / 2;
      heroCtx.quadraticCurveTo(trail[i - 1].x, trail[i - 1].y, xc, yc);
    }
    heroCtx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    heroCtx.strokeStyle = '#64ffda'; heroCtx.lineWidth = 3; heroCtx.lineCap = 'round';
    heroCtx.shadowBlur = 12; heroCtx.shadowColor = '#64ffda'; heroCtx.stroke(); heroCtx.shadowBlur = 0;
  }
  
  const annotation = analyzeTrail();
  if (annotation && trail.length > 0) {
    heroCtx.font = "italic 14px 'Space Mono'"; heroCtx.fillStyle = "rgba(255, 255, 255, 0.6)";
    heroCtx.fillText(annotation, trail[trail.length-1].x + 15, trail[trail.length-1].y - 15);
  }
  
  const now = Date.now(); trail = trail.filter(p => now - p.time < 300);
  requestAnimationFrame(drawHero);
}
drawHero();

// --- SKILLS DEPENDENCY GRAPH ---
const sCanvas = document.getElementById('skillsCanvas');
const sCtx = sCanvas.getContext('2d');
let activeSkill = null;
const skillRels = {
  'Python': ['FastAPI', 'Pandas', 'Scikit-learn', 'BeautifulSoup'],
  'JavaScript': ['TypeScript', 'Node.js', 'Cytoscape.js'],
  'TypeScript': ['JavaScript', 'Node.js'],
  'Node.js': ['Express', 'JavaScript', 'TypeScript', 'MongoDB'],
  'Express': ['Node.js', 'MongoDB'],
  'MongoDB': ['Node.js', 'Express', 'Python'],
  'FastAPI': ['Python', 'Pandas'],
  'C++': ['Java'],
  'Java': ['C++']
};

function drawSkillsGraph() {
  const rect = document.getElementById('skills').getBoundingClientRect();
  sCanvas.width = rect.width; sCanvas.height = rect.height;
  sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
  if(!activeSkill) return;
  const pills = document.querySelectorAll('.skill-pill');
  let activeRect = null; const depRects = [];
  pills.forEach(pill => {
    const name = pill.getAttribute('data-skill'); const pRect = pill.getBoundingClientRect();
    const x = pRect.left - rect.left + pRect.width/2, y = pRect.top - rect.top + pRect.height/2;
    if (name === activeSkill) activeRect = {x, y};
    else if (skillRels[activeSkill] && skillRels[activeSkill].includes(name)) depRects.push({x, y});
  });
  if(activeRect) {
    sCtx.lineWidth = 1.5; sCtx.strokeStyle = 'rgba(100, 255, 210, 0.4)';
    depRects.forEach(dep => {
      sCtx.beginPath(); sCtx.moveTo(activeRect.x, activeRect.y);
      const midX = (activeRect.x + dep.x) / 2;
      sCtx.bezierCurveTo(midX, activeRect.y, midX, dep.y, dep.x, dep.y); sCtx.stroke();
    });
  }
}

document.querySelectorAll('.skill-pill').forEach(pill => {
  pill.addEventListener('mouseenter', (e) => {
    activeSkill = e.target.getAttribute('data-skill'); e.target.classList.add('active');
    if(skillRels[activeSkill]) {
      document.querySelectorAll('.skill-pill').forEach(p => {
        if(skillRels[activeSkill].includes(p.getAttribute('data-skill'))) p.classList.add('dependent');
      });
    }
    drawSkillsGraph();
  });
  pill.addEventListener('mouseleave', (e) => {
    activeSkill = null; e.target.classList.remove('active');
    document.querySelectorAll('.skill-pill').forEach(p => p.classList.remove('dependent')); drawSkillsGraph();
  });
});
window.addEventListener('resize', drawSkillsGraph);

// --- RESUME MODAL ---
const resumeTriggers = [document.getElementById('resume-trigger'), document.getElementById('resume-btn-hero')];
const resumeModal = document.getElementById('resume-modal');
const resumeFrame = document.getElementById('resume-frame');
const resumeTerm = document.getElementById('resume-terminal');
const RESUME_URL = "https://drive.google.com/file/d/1QJ4c0infaUUM0z5TrzqFDT2mMS3Vjoch/preview";
resumeTriggers.forEach(btn => {
  if(!btn) return;
  btn.addEventListener('click', e => {
    e.preventDefault(); resumeModal.classList.add('active'); document.body.style.overflow = 'hidden';
    resumeFrame.style.opacity = '0'; resumeFrame.src = ''; resumeTerm.innerHTML = '';
    const seq = ['> Initiating secure connection...', '> Fetching binary data...', '> Parsing layout engine...', '> Rendering PDF object...'];
    let delay = 0;
    seq.forEach((txt) => { setTimeout(() => { resumeTerm.innerHTML = txt; }, delay); delay += 400; });
    setTimeout(() => { resumeTerm.innerHTML = '> Complete.'; resumeFrame.src = RESUME_URL; resumeFrame.style.opacity = '1'; }, delay + 200);
  });
});
document.getElementById('resume-close').addEventListener('click', () => { resumeModal.classList.remove('active'); document.body.style.overflow = 'auto'; resumeFrame.src = ''; });

// --- SORTING ALGORITHM VISUALIZER ---
const sbCtx = document.getElementById('sortCanvas').getContext('2d');
let sbW, sbH, sortArray = [], sortGenerator = null, sortFrameCount = 0;
function resizeSort() { sbW = sbCtx.canvas.width = window.innerWidth; sbH = sbCtx.canvas.height = 40; }
window.addEventListener('resize', resizeSort); resizeSort();
function initSortArray() { sortArray = Array.from({length: 60}, () => Math.random() * sbH * 0.8 + 5); }
function* quickSort(arr, start = 0, end = arr.length - 1) {
  if (start >= end) return; let pivotIndex = yield* partition(arr, start, end);
  yield* quickSort(arr, start, pivotIndex - 1); yield* quickSort(arr, pivotIndex + 1, end);
}
function* partition(arr, start, end) {
  let pivotValue = arr[end], pivotIndex = start;
  for (let i = start; i < end; i++) { if (arr[i] < pivotValue) { [arr[i], arr[pivotIndex]] = [arr[pivotIndex], arr[i]]; pivotIndex++; yield; } }
  [arr[pivotIndex], arr[end]] = [arr[end], arr[pivotIndex]]; yield; return pivotIndex;
}
function drawSort() {
  sbCtx.clearRect(0, 0, sbW, sbH); const barW = sbW / 60; sbCtx.fillStyle = '#64ffda';
  sortArray.forEach((val, i) => { sbCtx.fillRect(i * barW + 1, sbH - val, barW - 2, val); });
  sortFrameCount++;
  if (sortFrameCount % 2 === 0) {
    if (!sortGenerator) { initSortArray(); sortGenerator = quickSort(sortArray); } 
    else { const state = sortGenerator.next(); if (state.done) setTimeout(() => { sortGenerator = null; }, 2000); }
  }
  requestAnimationFrame(drawSort);
}
drawSort();

// --- MISC (Typing, Scroll, Nav) ---
const el = document.getElementById('typed-text');
const phrases = ['web applications.', 'full-stack products.', 'real-world solutions.', 'things that work.'];
let phraseIdx = 0, charIdx = 0, deleting = false;
function type() {
  const current = phrases[phraseIdx];
  if (!deleting) { el.textContent = current.slice(0, ++charIdx); if (charIdx === current.length) { deleting = true; setTimeout(type, 1600); return; } } 
  else { el.textContent = current.slice(0, --charIdx); if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; } }
  setTimeout(type, deleting ? 50 : 80);
}
setTimeout(type, 1200);

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }); }, { threshold: 0.1 });
reveals.forEach(r => observer.observe(r));
window.addEventListener('scroll', () => { document.querySelector('nav').style.padding = window.scrollY > 60 ? '0.6rem 2.5rem' : '1rem 2.5rem'; });

