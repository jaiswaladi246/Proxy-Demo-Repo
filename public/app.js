const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
let requests = 0, success = 0;

const terminal = $('#terminalBody');
function log(line, cls='') {
  const p = document.createElement('p');
  p.innerHTML = `<span class="muted">[${new Date().toLocaleTimeString()}]</span> <span class="${cls}">${line}</span>`;
  terminal.appendChild(p); terminal.scrollTop = terminal.scrollHeight;
}
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
function animateNodes(){ const nodes=$$('.node-card'); nodes.forEach((n,i)=>setTimeout(()=>{n.classList.add('pulse-node');setTimeout(()=>n.classList.remove('pulse-node'),900)},i*350)); }

async function loadHealth(){
  try{ const r=await fetch('/api/health',{cache:'no-store'}); const d=await r.json(); $('#healthStatus').textContent=d.status==='ok'?'Healthy':'Unknown'; }
  catch{ $('#healthStatus').textContent='Unreachable'; }
}

async function sendRequest(){
  const start=performance.now(); requests++; $('#requestCount').textContent=requests; animateNodes();
  log('Browser → GET /api/info','accent');
  setTimeout(()=>log('Nginx → proxy_pass to private backend','accent'),260);
  try{
    const r=await fetch('/api/info',{cache:'no-store'}); const data=await r.json(); const ms=Math.max(1,Math.round(performance.now()-start));
    if(r.ok) success++;
    $('#latency').textContent=`${ms} ms`; $('#successRate').textContent=`${Math.round((success/requests)*100)}%`;
    $('#environment').textContent=data.environment || '--'; $('#serverName').textContent=data.server || '--'; $('#lastCode').textContent=`${r.status} ${r.statusText||'OK'}`;
    $('#jsonOutput').textContent=JSON.stringify(data,null,2);
    log(`Backend → ${r.status} OK (${ms} ms)`,'success'); log('Response returned through Nginx to browser','success'); toast('Live request completed successfully');
  }catch(err){ $('#lastCode').textContent='FAILED'; $('#successRate').textContent=`${Math.round((success/requests)*100)}%`; log(`Request failed: ${err.message}`); toast('Request failed'); }
}

const answers={
  'explain reverse proxy':'A reverse proxy sits in front of your backend. The client talks to Nginx, and Nginx forwards the request to the private Node.js service. This lets you hide the backend, centralize TLS, logging, routing, and access control.',
  'why hide backend':'Keeping the backend private reduces direct exposure. Users only know the public proxy endpoint, while the application server can stay inside a private subnet and accept traffic only from the proxy layer.',
  'check backend health':'I’ll check /api/health now. If it returns { status: "ok" }, the private backend is responding correctly through the proxy path.',
  'show request path':'The path is: Browser → Public Nginx Reverse Proxy → Private Node.js Backend → Nginx → Browser. The moving request visualizer above represents this exact flow.'
};
function addMessage(text,type='bot'){
  const wrap=document.createElement('div'); wrap.className=`message ${type}`;
  wrap.innerHTML= type==='bot' ? `<span class="avatar">DS</span><div><b>DevOps Shack AI</b><p>${text}</p></div>` : `<div><p>${text}</p></div>`;
  $('#messages').appendChild(wrap); $('#messages').scrollTop=$('#messages').scrollHeight;
}
function handleChat(raw){ const q=raw.trim(); if(!q)return; addMessage(q,'user'); $('#chatInput').value=''; const key=q.toLowerCase();
  if(key.includes('health')) loadHealth().then(()=>setTimeout(()=>addMessage(`Backend health is currently <strong>${$('#healthStatus').textContent}</strong>. The check is performed through <code>/api/health</code>.`),350));
  else setTimeout(()=>addMessage(answers[key] || 'For this demo, focus on the core idea: the browser never talks directly to the private Node.js server. Nginx is the public entry point and forwards the request internally.'),380);
}

$('#sendRequestBtn').addEventListener('click',sendRequest); $('#replayBtn').addEventListener('click',()=>{animateNodes();log('Replaying request flow animation...','accent')});
$('#chatSend').addEventListener('click',()=>handleChat($('#chatInput').value)); $('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')handleChat(e.target.value)}); $$('.quick').forEach(b=>b.addEventListener('click',()=>handleChat(b.dataset.q)));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12}); $$('.reveal').forEach(el=>observer.observe(el));
loadHealth(); setTimeout(sendRequest,900);
