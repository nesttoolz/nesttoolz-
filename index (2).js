/* ═══ IMAGE PREVIEW ═══ */
function previewOriginal(){
  const file = document.getElementById('img-file').files[0];
  if(!file) return;
  const wrap = document.getElementById('img-preview-wrap');
  const preview = document.getElementById('img-preview');
  const origSize = document.getElementById('img-orig-size');
  preview.src = URL.createObjectURL(file);
  wrap.style.display = 'block';
  origSize.textContent = 'Original size: ' + (file.size/1024).toFixed(1) + ' KB  |  Type: ' + file.type;
}

/* ═══ EMI CALCULATOR ═══ */
function calcEMI(){
  const P = parseFloat(document.getElementById('emi-amount')?.value)||0;
  const annualRate = parseFloat(document.getElementById('emi-rate')?.value)||0;
  const months = parseFloat(document.getElementById('emi-months')?.value)||0;
  if(P<=0||annualRate<=0||months<=0){showToast('⚠️ Please fill all fields!');return;}
  const r = annualRate/(12*100);
  const emi = P*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);
  const totalPay = emi*months;
  const totalInt = totalPay-P;
  const fmt = v=>'₹'+Math.round(v).toLocaleString('en-IN');
  const res = document.getElementById('emi-result');
  res.innerHTML=`<strong>📊 EMI Breakdown:</strong><br/><br/>
    💸 <strong>Monthly EMI:</strong> <span style="color:var(--p2);font-size:1.15rem;font-weight:800">${fmt(emi)}</span><br/>
    💰 <strong>Principal Amount:</strong> ${fmt(P)}<br/>
    📈 <strong>Total Interest:</strong> <span style="color:var(--r)">${fmt(totalInt)}</span><br/>
    🏦 <strong>Total Payment:</strong> <span style="color:var(--g)">${fmt(totalPay)}</span><br/>
    📅 <strong>Tenure:</strong> ${months} months (${(months/12).toFixed(1)} years)`;
  res.classList.add('show');
}

/* ═══ PDF MERGE ═══ */
async function mergePDF(){
  const files = document.getElementById('pdf-files')?.files;
  if(!files||files.length<2){showToast('⚠️ Select at least 2 PDF files!');return;}
  if(files.length>5){showToast('⚠️ Maximum 5 files allowed!');return;}
  const btn = document.getElementById('merge-btn');
  btn.disabled=true; btn.textContent='⏳ Merging...';
  const res = document.getElementById('pdf-result');
  try{
    const {PDFDocument} = PDFLib;
    const merged = await PDFDocument.create();
    let totalPages=0;
    const list = document.getElementById('pdf-file-list');
    list.innerHTML='';
    for(let i=0;i<files.length;i++){
      const buf = await files[i].arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p=>merged.addPage(p));
      totalPages+=pages.length;
      list.innerHTML+=`<div>✅ ${files[i].name} (${pages.length} page${pages.length>1?'s':''})</div>`;
    }
    const bytes = await merged.save();
    const blob = new Blob([bytes],{type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download='merged_nesttoolz.pdf';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    res.innerHTML=`<strong>✅ Merged Successfully!</strong><br/>Total pages: <strong>${totalPages}</strong><br/>Files merged: <strong>${files.length}</strong><br/><small style="color:var(--tx3)">File downloaded automatically ↑</small>`;
    res.classList.add('show');
    showToast('✅ PDFs merged & downloaded!');
  }catch(e){
    res.innerHTML=`<strong style="color:var(--r)">❌ Error:</strong> ${e.message}`;
    res.classList.add('show');
    showToast('❌ Merge failed!');
  }
  btn.disabled=false; btn.textContent='📄 Merge PDFs & Download';
}

/* ═══ PDF COMPRESS ═══ */
async function compressPDF(){
  const file = document.getElementById('pdf-comp-file')?.files[0];
  if(!file){showToast('⚠️ Please select a PDF file!');return;}
  const btn = document.getElementById('compress-btn');
  btn.disabled=true; btn.textContent='⏳ Compressing...';
  const res = document.getElementById('comp-result');
  try{
    const {PDFDocument} = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf,{ignoreEncryption:true});
    const level = document.getElementById('comp-level')?.value||'medium';
    const opts = {useObjectStreams:true};
    if(level==='high') opts.addDefaultPage=false;
    const bytes = await doc.save(opts);
    const origKB=(file.size/1024).toFixed(1);
    const newKB=(bytes.byteLength/1024).toFixed(1);
    const saved=((1-bytes.byteLength/file.size)*100).toFixed(0);
    const blob=new Blob([bytes],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=file.name.replace('.pdf','_compressed.pdf');
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    res.innerHTML=`<strong>✅ Compressed!</strong><br/>Original: <strong>${origKB} KB</strong><br/>Compressed: <strong>${newKB} KB</strong><br/>Saved: <strong style="color:var(--g)">${saved}%</strong><br/><small style="color:var(--tx3)">File downloaded automatically ↑</small>`;
    res.classList.add('show');
    showToast('✅ PDF compressed & downloaded!');
  }catch(e){
    res.innerHTML=`<strong style="color:var(--r)">❌ Error:</strong> ${e.message}`;
    res.classList.add('show');
    showToast('❌ Compression failed!');
  }
  btn.disabled=false; btn.textContent='🗜️ Compress PDF & Download';
}

/* ═══ IMAGE COMPRESSOR ═══ */
function compressImage(){
  const file = document.getElementById('img-file')?.files[0];
  if(!file){showToast('⚠️ Please select an image!');return;}
  const quality = parseInt(document.getElementById('img-quality')?.value||'72')/100;
  const canvas = document.getElementById('img-canvas');
  const res = document.getElementById('img-result');
  const img = new Image();
  img.onload=function(){
    canvas.width=img.naturalWidth;
    canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');
    ctx.drawImage(img,0,0);
    const isPng = file.type==='image/png';
    const mimeType = isPng?'image/png':'image/jpeg';
    canvas.toBlob(blob=>{
      if(!blob){showToast('❌ Compression failed!');return;}
      const origKB=(file.size/1024).toFixed(1);
      const newKB=(blob.size/1024).toFixed(1);
      const saved=(((file.size-blob.size)/file.size)*100).toFixed(0);
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      const ext=isPng?'png':'jpg';
      a.href=url; a.download=file.name.replace(/\.[^.]+$/,'')+'_compressed.'+ext;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      res.innerHTML=`<strong>✅ Compressed!</strong><br/>Original: <strong>${origKB} KB</strong><br/>Compressed: <strong>${newKB} KB</strong><br/>Saved: <strong style="color:var(--g)">${saved}%</strong><br/><small style="color:var(--tx3)">File downloaded automatically ↑</small>`;
      res.classList.add('show');
      showToast('✅ Image compressed & downloaded!');
    }, mimeType, isPng?undefined:quality);
  };
  img.src=URL.createObjectURL(file);
}

/* ═══ QR CODE GENERATOR ═══ */
let qrInstance=null;
function generateQR(){
  const text=document.getElementById('qr-text')?.value||'https://nesttoolz.vercel.app';
  const size=parseInt(document.getElementById('qr-size')?.value||'256');
  const color=document.getElementById('qr-color')?.value||'#000000';
  const container=document.getElementById('qr-container');
  if(!container)return;
  container.innerHTML='';
  try{
    qrInstance=new QRCode(container,{
      text:text||'https://nesttoolz.vercel.app',
      width:size, height:size,
      colorDark:color, colorLight:'#ffffff',
      correctLevel:QRCode.CorrectLevel.H
    });
  }catch(e){container.innerHTML='<p style="color:var(--r);font-size:.8rem">❌ Error generating QR</p>';}
}

function downloadQR(type){
  const container=document.getElementById('qr-container');
  if(!container){showToast('⚠️ Generate QR first!');return;}
  const canvas=container.querySelector('canvas');
  const img=container.querySelector('img');
  let dataUrl='';
  if(canvas) dataUrl=canvas.toDataURL(type==='jpg'?'image/jpeg':'image/png');
  else if(img) dataUrl=img.src;
  else{showToast('⚠️ QR not ready yet!');return;}
  const a=document.createElement('a');
  a.href=dataUrl; a.download='qrcode_nesttoolz.'+type;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  showToast('✅ QR Code downloaded!');
}

/* ═══ WORD COUNTER ═══ */
function countWords(){
  const text=document.getElementById('wc-text')?.value||'';
  const words=text.trim()===''?0:text.trim().split(/\s+/).length;
  const chars=text.length;
  const sentences=text.trim()===''?0:(text.match(/[^.!?]+[.!?]+/g)||[]).length;
  const readTime=Math.ceil(words/200);
  const el_w=document.getElementById('wc-words');
  const el_c=document.getElementById('wc-chars');
  const el_s=document.getElementById('wc-sents');
  const el_t=document.getElementById('wc-time');
  if(el_w)el_w.textContent=words;
  if(el_c)el_c.textContent=chars;
  if(el_s)el_s.textContent=sentences;
  if(el_t)el_t.textContent=readTime<1?'<1 min':readTime+' min';
}

/* ═══ TIME AGO HELPER ═══ */
function timeAgo(ts){
  const secs = Math.floor((Date.now() - ts) / 1000);
  if(secs < 5)  return 'just now';
  if(secs < 60) return secs + 's ago';
  const mins = Math.floor(secs / 60);
  if(mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if(hrs < 24)  return hrs + ' hr ago';
  return Math.floor(hrs / 24) + 'd ago';
}

/* ═══ PASSWORD HISTORY ═══ */
let passHistory = [];
let pinnedPasses = new Set();

function addToPassHistory(pass){
  const unpinned = passHistory.filter(p => !p.pinned && p.pass !== pass);
  const pinned   = passHistory.filter(p => p.pinned);
  const newEntry = { pass, pinned: false, ts: Date.now() };
  const maxUnpinned = Math.max(1, 5 - pinned.length);
  passHistory = [...pinned, newEntry, ...unpinned].slice(0, pinned.length + maxUnpinned);
  renderPassHistory();
}

function renderPassHistory(){
  const panel = document.getElementById('pass-history-panel');
  const list  = document.getElementById('pass-history-list');
  if(!panel || !list) return;
  if(!passHistory.length){ panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  const hasUnpinned = passHistory.some(p => !p.pinned);
  list.innerHTML = passHistory.map((item, i) => `
    <div style="display:flex;flex-direction:column;gap:4px;padding:8px;border-radius:8px;
         background:${item.pinned ? 'rgba(251,191,36,.06)' : 'rgba(255,255,255,.03)'};
         border:1px solid ${item.pinned ? 'rgba(251,191,36,.3)' : 'rgba(120,100,255,.1)'};
         transition:background .2s,border-color .2s">
      <div style="display:flex;align-items:center;gap:6px">
        ${item.pinned ? '<span style="font-size:.75rem;flex-shrink:0" title="Pinned">📌</span>' : ''}
        <span style="font-family:monospace;font-size:.78rem;color:var(--tx2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">${item.pass}</span>
        <span style="font-size:.65rem;color:var(--tx3);flex-shrink:0;white-space:nowrap">🕐 ${timeAgo(item.ts)}</span>
      </div>
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button onclick="togglePinPass(${i})" title="${item.pinned ? 'Unpin' : 'Pin to top'}"
          style="background:${item.pinned ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.05)'};
                 border:1px solid ${item.pinned ? 'rgba(251,191,36,.4)' : 'rgba(255,255,255,.1)'};
                 color:${item.pinned ? 'var(--y)' : 'var(--tx3)'};
                 padding:3px 8px;border-radius:6px;font-size:.8rem;cursor:pointer;flex-shrink:0;transition:all .2s">
          ${item.pinned ? '🔒' : '🔓'}
        </button>
        <button onclick="useHistoryPass(${i})" style="background:rgba(124,108,252,.12);border:1px solid rgba(124,108,252,.28);color:var(--p2);padding:3px 10px;border-radius:6px;font-size:.7rem;font-weight:700;cursor:pointer;flex-shrink:0;white-space:nowrap">Use</button>
        <button onclick="copyHistoryPass(${i})" style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.25);color:var(--g);padding:3px 10px;border-radius:6px;font-size:.7rem;font-weight:700;cursor:pointer;flex-shrink:0;white-space:nowrap">Copy</button>
      </div>
    </div>`).join('') + (hasUnpinned ? `
  <div style="margin-top:8px;text-align:right">
    <button onclick="clearUnpinnedHistory()"
      style="background:rgba(248,113,113,.08);border:1.5px solid rgba(248,113,113,.25);color:var(--r);
             padding:5px 14px;border-radius:8px;font-size:.72rem;font-weight:700;cursor:pointer;
             transition:background .2s,border-color .2s"
      onmouseover="this.style.background='rgba(248,113,113,.16)';this.style.borderColor='rgba(248,113,113,.5)'"
      onmouseout="this.style.background='rgba(248,113,113,.08)';this.style.borderColor='rgba(248,113,113,.25)'">
      🗑️ Clear Unpinned
    </button>
  </div>` : '');
}

function togglePinPass(idx){
  if(!passHistory[idx]) return;
  passHistory[idx].pinned = !passHistory[idx].pinned;
  passHistory = [
    ...passHistory.filter(p => p.pinned),
    ...passHistory.filter(p => !p.pinned)
  ];
  renderPassHistory();
  showToast(passHistory[idx]?.pinned ? '📌 Password pinned to top!' : '🔓 Password unpinned!');
}

function clearUnpinnedHistory(){
  passHistory = passHistory.filter(p => p.pinned);
  renderPassHistory();
  showToast('🗑️ Unpinned history cleared!');
}

function togglePassHistory(){
  const list  = document.getElementById('pass-history-list');
  const arrow = document.getElementById('pass-history-arrow');
  if(!list) return;
  const collapsed = list.style.display === 'none';
  list.style.display  = collapsed ? 'flex'  : 'none';
  if(arrow) arrow.style.transform = collapsed ? 'rotate(0deg)' : 'rotate(-90deg)';
}

function useHistoryPass(idx){
  const item = passHistory[idx];
  if(!item) return;
  const el = document.getElementById('pass-output');
  if(el) el.value = item.pass;
  updateStrength(item.pass);
  showToast('✅ Password restored from history!');
}

function copyHistoryPass(idx){
  const item = passHistory[idx];
  if(!item) return;
  navigator.clipboard.writeText(item.pass).then(() => showToast('📋 Copied from history!')).catch(() => showToast('❌ Copy failed'));
}

/* ═══ PASSWORD GENERATOR ═══ */
function genPass(){
  const passField = document.getElementById('pass-output');
  if(passField && !passField._regenListenerAdded){
    passField.addEventListener('keydown', function(e){
      if(e.key === ' ' || e.key === 'Enter'){
        e.preventDefault();
        genPass();
      }
    });
    passField._regenListenerAdded = true;
  }
  const len=parseInt(document.getElementById('pass-len')?.value||'16');
  const useUpper=document.getElementById('pass-upper')?.checked!==false;
  const useLower=document.getElementById('pass-lower')?.checked!==false;
  const useNums=document.getElementById('pass-nums')?.checked!==false;
  const useSyms=document.getElementById('pass-syms')?.checked||false;
  let chars='';
  if(useUpper)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(useLower)chars+='abcdefghijklmnopqrstuvwxyz';
  if(useNums)chars+='0123456789';
  if(useSyms)chars+='!@#$%^&*()_+-=[]{}|;:,.<>?';
  if(!chars){showToast('⚠️ Select at least one character type!');return;}
  const arr=new Uint32Array(len);
  crypto.getRandomValues(arr);
  let pass='';
  for(let i=0;i<len;i++) pass+=chars[arr[i]%chars.length];
  const el=document.getElementById('pass-output');
  if(el) el.value=pass;
  updateStrength(pass);
  addToPassHistory(pass);

  const autoCopy=document.getElementById('pass-auto-copy');
  if(autoCopy?.checked && pass){
    navigator.clipboard.writeText(pass).then(()=>{
      showCopiedBadge();
    }).catch(()=>{
      if(el){ el.type='text'; el.select(); document.execCommand('copy'); el.type='password'; showCopiedBadge(); }
    });
  }
}

function updateStrength(p){
  let score=0;
  if(p.length>=8)score++;
  if(p.length>=12)score++;
  if(/[A-Z]/.test(p))score++;
  if(/[a-z]/.test(p))score++;
  if(/[0-9]/.test(p))score++;
  if(/[^a-zA-Z0-9]/.test(p))score++;
  const labels=['','Very Weak','Weak','Fair','Good','Strong','Very Strong'];
  const colors=['','var(--r)','var(--r)','var(--y)','var(--y)','var(--g)','var(--g)'];
  const el=document.getElementById('pass-strength');
  if(el){el.textContent='Strength: '+labels[score];el.style.color=colors[score];}
  const bar=document.getElementById('pass-strength-bar');
  if(bar){bar.style.width=((score/6)*100)+'%';bar.style.background=colors[score];bar.style.transition='width 0.4s ease, background 0.4s ease';}
}

function copyPass(){
  const el=document.getElementById('pass-output');
  if(!el?.value){showToast('⚠️ Generate a password first!');return;}
  const prevType=el.type;
  el.type='text';
  el.select();
  el.setSelectionRange(0,99999);
  navigator.clipboard.writeText(el.value).then(()=>{
    el.type=prevType;
    showCopiedBadge();
    showToast('📋 Password copied!');
  }).catch(()=>{
    document.execCommand('copy');
    el.type=prevType;
    showCopiedBadge();
    showToast('📋 Password copied!');
  });
}

function togglePassVisibility(){
  const el=document.getElementById('pass-output');
  const btn=document.getElementById('pass-eye-btn');
  if(!el)return;
  const isHidden=el.type==='password';
  el.type=isHidden?'text':'password';
  if(btn) btn.textContent=isHidden?'🙈':'👁️';
}

function showCopiedBadge(){
  const badge=document.getElementById('pass-copied-badge');
  if(!badge)return;
  badge.style.opacity='1';
  badge.style.transform='translateY(0)';
  clearTimeout(badge._t);
  badge._t=setTimeout(()=>{
    badge.style.opacity='0';
    badge.style.transform='translateY(-6px)';
  },1800);
}

/* ═══ WHATSAPP LINK GENERATOR ═══ */
function genWALink(){
  const phone=document.getElementById('wa-phone')?.value?.replace(/\D/g,'')||'';
  const msg=document.getElementById('wa-msg')?.value||'';
  if(!phone){showToast('⚠️ Enter a phone number!');return;}
  const link=`https://wa.me/${phone}${msg?'?text='+encodeURIComponent(msg):''}`;
  const out=document.getElementById('wa-output');
  const linkEl=document.getElementById('wa-link-text');
  if(linkEl) linkEl.textContent=link;
  if(out) out.classList.add('show');
}

function copyWALink(){
  const el=document.getElementById('wa-link-text');
  if(!el?.textContent){showToast('⚠️ Generate a link first!');return;}
  navigator.clipboard.writeText(el.textContent).then(()=>showToast('🔗 WhatsApp link copied!')).catch(()=>showToast('❌ Copy failed'));
}

/* ═══ TOAST ═══ */
function showToast(msg){
  const t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('show'),3000);
}

/* ═══ TOOLS GRID ═══ */
function renderToolsGrid(filter){
  const grid=document.getElementById('tools-grid');
  if(!grid)return;
  const q=(filter||'').toLowerCase().trim();
  const filtered=q?TOOLS.filter(t=>t.name.toLowerCase().includes(q)||t.desc.toLowerCase().includes(q)):TOOLS;
  if(!filtered.length){
    grid.innerHTML='<div class="no-results">🔍 No tools found for "'+filter+'".<br/>Try "PDF", "QR", "EMI" etc.</div>';
    return;
  }
  grid.innerHTML=filtered.map(t=>`
    <a class="tc" href="/tools/${t.slug}" onclick="navigateTo(event,'${t.id}')">
      <div class="tc-top">
        <div class="tc-icon" style="background:${t.color};border:1px solid ${t.border}">${t.icon}</div>
        <span class="tc-tag tag-${t.tag}">${t.tag==='hot'?'🔥 Hot':t.tag==='new'?'✨ New':'✅ Free'}</span>
        <div class="tc-arrow">→</div>
      </div>
      <h3>${t.name}</h3>
      <p>${t.desc}</p>
    </a>`).join('');
}

function filterTools(q){
  renderToolsGrid(q);
  const navInput=document.getElementById('nav-search-input');
  const toolInput=document.getElementById('tools-search-input');
  if(navInput&&document.activeElement!==navInput)navInput.value=q;
  if(toolInput&&document.activeElement!==toolInput)toolInput.value=q;
}

/* ═══ MOBILE NAV ═══ */
function toggleMobileNav(){
  const nav=document.getElementById('mobile-nav');
  const ham=document.getElementById('ham-btn');
  if(!nav)return;
  nav.classList.toggle('open');
  if(ham){
    const spans=ham.querySelectorAll('span');
    if(nav.classList.contains('open')){
      spans[0].style.transform='rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity='0';
      spans[2].style.transform='rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s=>{s.style.transform='';s.style.opacity='';});
    }
  }
}

/* ═══ BACKGROUND CANVAS ═══ */
function initBgCanvas(){
  const canvas=document.getElementById('bg-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let W=canvas.width=window.innerWidth;
  let H=canvas.height=window.innerHeight;
  const dots=Array.from({length:60},()=>({
    x:Math.random()*W, y:Math.random()*H,
    r:Math.random()*1.5+.5,
    vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
    a:Math.random()*.5+.2
  }));
  function draw(){
    ctx.clearRect(0,0,W,H);
    dots.forEach(d=>{
      d.x+=d.vx; d.y+=d.vy;
      if(d.x<0||d.x>W)d.vx*=-1;
      if(d.y<0||d.y>H)d.vy*=-1;
      ctx.beginPath();
      ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(124,108,252,${d.a})`;
      ctx.fill();
    });
    for(let i=0;i<dots.length;i++){
      for(let j=i+1;j<dots.length;j++){
        const dx=dots[i].x-dots[j].x;
        const dy=dots[i].y-dots[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){
          ctx.beginPath();
          ctx.moveTo(dots[i].x,dots[i].y);
          ctx.lineTo(dots[j].x,dots[j].y);
          ctx.strokeStyle=`rgba(124,108,252,${.06*(1-dist/120)})`;
          ctx.lineWidth=.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize',()=>{
    W=canvas.width=window.innerWidth;
    H=canvas.height=window.innerHeight;
  });
}

/* ═══ HERO 3D CANVAS ═══ */
function initHero3D(){
  const canvas=document.getElementById('hero3d');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  canvas.width=canvas.offsetWidth||500;
  canvas.height=canvas.offsetHeight||480;
  const W=canvas.width, H=canvas.height;
  const icons=['📄','🖼️','📱','💰','🔐','📝','🔗','🔤','🔄','🎂','🔢','🔡','🧾','🏦','▶️'];
  const cards=icons.map((ic,i)=>({
    icon:ic,
    x:W/2+(Math.cos(i/icons.length*Math.PI*2)*W*.35),
    y:H/2+(Math.sin(i/icons.length*Math.PI*2)*H*.35),
    vx:(Math.random()-.5)*.8,
    vy:(Math.random()-.5)*.8,
    size:36+Math.random()*16,
    a:0
  }));
  let frame=0;
  function draw(){
    ctx.clearRect(0,0,W,H);
    frame++;
    cards.forEach((c,i)=>{
      c.a=Math.min(1,c.a+.02);
      const orbit=frame*.008+i*(Math.PI*2/cards.length);
      c.x=W/2+Math.cos(orbit)*(W*.3)+Math.sin(orbit*.7)*(W*.08);
      c.y=H/2+Math.sin(orbit)*(H*.28)+Math.cos(orbit*.5)*(H*.06);
      ctx.save();
      ctx.globalAlpha=c.a*.85;
      ctx.shadowColor='rgba(124,108,252,.3)';
      ctx.shadowBlur=16;
      ctx.fillStyle='rgba(20,20,40,.85)';
      const r=10;
      const bw=c.size+16, bh=c.size+8;
      ctx.beginPath();
      ctx.roundRect(c.x-bw/2,c.y-bh/2,bw,bh,r);
      ctx.fill();
      ctx.strokeStyle='rgba(124,108,252,.25)';
      ctx.lineWidth=1;
      ctx.stroke();
      ctx.font=c.size+'px serif';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.shadowBlur=0;
      ctx.fillText(c.icon,c.x,c.y);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ═══ REVEAL OBSERVER ═══ */
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});
},{threshold:.15});

/* ═══ LIVE TIMESTAMP TICKER ═══ */
setInterval(()=>{
  if(passHistory.length && document.getElementById('pass-history-panel')?.style.display !== 'none'){
    renderPassHistory();
  }
}, 30000);

/* ═══ INIT ═══ */
document.addEventListener('DOMContentLoaded',()=>{
  renderToolsGrid();
  initBgCanvas();
  initHero3D();
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
  const pdfFiles=document.getElementById('pdf-files');
  if(pdfFiles){
    pdfFiles.addEventListener('change',function(){
      const list=document.getElementById('pdf-file-list');
      if(list) list.innerHTML=Array.from(this.files).map(f=>`<div>📄 ${f.name} (${(f.size/1024).toFixed(0)} KB)</div>`).join('');
    });
  }
});
