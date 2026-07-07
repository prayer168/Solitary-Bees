/* ===================================================
   放大鏡的秘密 · 凸透鏡成像 - 互動邏輯
   =================================================== */

/* ---------- 分頁切換 ---------- */
function go(tab){
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.nav-tab[data-tab="${tab}"]`)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.replaceState(null, '', '#' + tab);
  if (tab === 'quiz') initQuiz();
  if (tab === 'bench') requestAnimationFrame(drawBench);
}

/* ===================================================
   一、實驗器材
   =================================================== */
const GEAR = [
  { emoji:'🟫', name:'紙板', use:'當作「屏幕」，用來接住放大鏡投射出來的像。' },
  { emoji:'📏', name:'長尺', use:'量出物體、放大鏡、屏幕之間的距離（例如 20、40、60 公分）。' },
  { emoji:'🔍', name:'放大鏡', use:'其實就是「凸透鏡」，是讓光線聚集、產生像的主角。' },
  { emoji:'🗜️', name:'長尾夾', use:'把放大鏡或紙板夾住固定，實驗時位置才不會跑掉。' },
  { emoji:'🕯️', name:'香氛蠟燭', use:'當作「發光的物體」，燭火明亮，成的像看得最清楚。' },
  { emoji:'🔥', name:'打火機', use:'點燃蠟燭。使用時一定要有大人陪同。' },
  { emoji:'🥤', name:'紙杯', use:'當蠟燭的底座，讓蠟燭站穩、方便移動。' },
  { emoji:'✨', name:'鋁箔紙', use:'包住底座、擋一點風，也讓實驗桌面更安全穩固。' },
];

function buildGear(){
  const grid = document.getElementById('gearGrid');
  grid.innerHTML = GEAR.map((g, i) => `
    <div class="gear-card" onclick="toggleGear(${i})" id="gear-${i}">
      <span class="gear-emoji">${g.emoji}</span>
      <span class="gear-name">${g.name}</span>
      <div class="gear-use">${g.use}</div>
    </div>`).join('');
}
function toggleGear(i){ document.getElementById('gear-' + i)?.classList.toggle('open'); }

/* ===================================================
   二、實驗示範（還原影片三步驟）
   =================================================== */
const DEMO = [
  { title:'實驗一：固定放大鏡和蠟燭，移動屏幕',
    body:'先讓放大鏡和蠟燭相距 20 公分固定不動，再把紙板（屏幕）慢慢往後拉。一開始只看到一個模糊的圓點，拉到某個距離時，蠟燭「倒立」的像會突然變清楚；再往後拉又變模糊。',
    chips:['<span class="chip">放大鏡↔蠟燭 20cm</span>','<span class="chip good">約 40cm 處清楚</span>','<span class="chip warm">倒立</span>'] },
  { title:'實驗二：固定放大鏡和屏幕，移動蠟燭',
    body:'這次讓放大鏡和紙板相距 20 公分固定，改成慢慢把蠟燭往後移。移到大約 60 公分時，紙板上出現一個「倒立、縮小、清楚」的像。',
    chips:['<span class="chip">放大鏡↔屏幕 20cm</span>','<span class="chip good">蠟燭約 60cm</span>','<span class="chip warm">倒立縮小</span>'] },
  { title:'實驗三：把物體放桌上，移動放大鏡',
    body:'把物體放在桌面上，調整放大鏡靠近或遠離。可以看到「正立、放大、清楚」的像，也會經過模糊不清的階段。影片藉此提問：要怎樣才能看到「放大倒立」和「縮小倒立」的清楚的像呢？',
    chips:['<span class="chip good">正立放大</span>','<span class="chip">會經過模糊</span>','<span class="chip warm">動手找規律</span>'] },
];

function buildDemo(){
  const box = document.getElementById('demoSteps');
  box.innerHTML = DEMO.map((d, i) => `
    <div class="demo-step">
      <div class="step-no">${i + 1}</div>
      <div>
        <h3>${d.title}</h3>
        <p>${d.body}</p>
        <div class="step-data">${d.chips.join('')}</div>
      </div>
    </div>`).join('');
}

/* ===================================================
   三、光學實驗台（核心模擬器）
   =================================================== */
const AXIS_Y   = 190;      // 光軸的 y
const LENS_X   = 300;      // 放大鏡的 x
const PX_PER_CM = 3.2;     // 1cm 對應的像素
const OBJ_H    = 62;       // 物體（蠟燭）畫面高度(px)
const CV_W = 720, CV_H = 380;

let objCm = 60;            // 物距(cm)
let focCm = 13;            // 焦距(cm)
let showAdvanced = false;

const cv  = () => document.getElementById('benchCanvas');
const ctx = () => cv().getContext('2d');

/* 依物距、焦距算出成像結果 */
function computeImage(){
  const f = focCm, u = objCm;
  const denom = (1 / f) - (1 / u);
  // 焦點附近視為無法成像
  if (Math.abs(u - f) < 0.4){
    return { type:'blur' };
  }
  const di = 1 / denom;              // 像距(cm)，正=右側實像，負=左側虛像
  const m  = -di / u;                // 放大率，負=倒立
  return {
    type: di > 0 ? 'real' : 'virtual',
    di, m,
    upright: m > 0,
    enlarged: Math.abs(m) > 1.02,
    sameSize: Math.abs(Math.abs(m) - 1) <= 0.02,
  };
}

/* 畫一支箭頭（物體/像） */
function drawArrow(c, x, topY, color, label, glow){
  c.save();
  c.strokeStyle = color; c.fillStyle = color;
  c.lineWidth = 3;
  if (glow){ c.shadowColor = color; c.shadowBlur = 10; }
  const up = topY < AXIS_Y;
  c.beginPath(); c.moveTo(x, AXIS_Y); c.lineTo(x, topY); c.stroke();
  const tip = topY, dir = up ? 1 : -1;
  c.beginPath();
  c.moveTo(x, tip);
  c.lineTo(x - 6, tip + dir * 10);
  c.lineTo(x + 6, tip + dir * 10);
  c.closePath(); c.fill();
  c.restore();
  if (label){
    c.save();
    c.fillStyle = color; c.font = '12px "Noto Sans TC", sans-serif';
    c.textAlign = 'center';
    c.fillText(label, x, up ? topY - 8 : topY + 18);
    c.restore();
  }
}

function ray(c, x1, y1, x2, y2, color, dashed){
  c.save();
  c.strokeStyle = color; c.lineWidth = 1.6;
  c.setLineDash(dashed ? [5, 5] : []);
  if (!dashed){ c.shadowColor = color; c.shadowBlur = 4; }
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.restore();
}

function drawBench(){
  const canvas = cv(); if (!canvas) return;
  const c = ctx();
  // 高解析度
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== CV_W * dpr){
    canvas.width = CV_W * dpr; canvas.height = CV_H * dpr;
  }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, CV_W, CV_H);

  const showRays = document.getElementById('rayToggle')?.checked;

  /* 光軸 */
  c.strokeStyle = 'rgba(148,163,184,0.5)'; c.lineWidth = 1; c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(0, AXIS_Y); c.lineTo(CV_W, AXIS_Y); c.stroke();
  c.setLineDash([]);

  /* 焦點 F、2F 標記 */
  const fpx = focCm * PX_PER_CM;
  [['F', fpx, 'right'], ['2F', 2 * fpx, 'right'], ['F', -fpx, 'left'], ['2F', -2 * fpx, 'left']]
    .forEach(([lab, dx]) => {
      const x = LENS_X + dx;
      if (x < 6 || x > CV_W - 6) return;
      c.fillStyle = 'rgba(157,78,221,0.9)';
      c.beginPath(); c.arc(x, AXIS_Y, 3.4, 0, 7); c.fill();
      c.font = '11px "Noto Sans TC", sans-serif'; c.textAlign = 'center';
      c.fillStyle = '#c79bef';
      c.fillText(lab, x, AXIS_Y + 18);
    });

  /* 放大鏡（凸透鏡） */
  c.save();
  c.strokeStyle = '#00f2fe'; c.lineWidth = 2.5;
  c.fillStyle = 'rgba(0,242,254,0.10)';
  c.shadowColor = '#00f2fe'; c.shadowBlur = 12;
  c.beginPath();
  c.moveTo(LENS_X, AXIS_Y - 78);
  c.bezierCurveTo(LENS_X + 26, AXIS_Y - 38, LENS_X + 26, AXIS_Y + 38, LENS_X, AXIS_Y + 78);
  c.bezierCurveTo(LENS_X - 26, AXIS_Y + 38, LENS_X - 26, AXIS_Y - 38, LENS_X, AXIS_Y - 78);
  c.closePath(); c.fill(); c.stroke();
  c.restore();
  // 上下小箭頭表示凸透鏡
  c.fillStyle = '#00f2fe';
  c.beginPath(); c.moveTo(LENS_X - 5, AXIS_Y - 78); c.lineTo(LENS_X + 5, AXIS_Y - 78); c.lineTo(LENS_X, AXIS_Y - 86); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(LENS_X - 5, AXIS_Y + 78); c.lineTo(LENS_X + 5, AXIS_Y + 78); c.lineTo(LENS_X, AXIS_Y + 86); c.closePath(); c.fill();

  /* 物體（蠟燭）*/
  const objX = LENS_X - objCm * PX_PER_CM;
  const objTopY = AXIS_Y - OBJ_H;
  // 燭身
  c.save();
  c.fillStyle = '#ffe1a8'; c.strokeStyle = '#e0b968'; c.lineWidth = 1;
  c.fillRect(objX - 6, objTopY + 8, 12, OBJ_H - 8);
  c.strokeRect(objX - 6, objTopY + 8, 12, OBJ_H - 8);
  // 燭火
  c.fillStyle = '#ffcf6b'; c.shadowColor = '#ff8a3c'; c.shadowBlur = 12;
  c.beginPath(); c.ellipse(objX, objTopY + 2, 5, 9, 0, 0, 7); c.fill();
  c.restore();
  c.fillStyle = '#ff9f43'; c.font = '12px "Noto Sans TC", sans-serif'; c.textAlign = 'center';
  c.fillText('物體 ' + objCm.toFixed(0) + 'cm', objX, AXIS_Y + 34);

  /* 計算成像 */
  const R = computeImage();
  const fptR = LENS_X + fpx, fptL = LENS_X - fpx;

  let offscreen = false;
  if (R.type === 'blur'){
    // 平行射出，無法成像
    if (showRays){
      ray(c, objX, objTopY, LENS_X, objTopY, '#00f2fe');
      ray(c, LENS_X, objTopY, CV_W, objTopY, '#00f2fe');
      ray(c, objX, objTopY, LENS_X, AXIS_Y, '#00f5a0');
      ray(c, LENS_X, AXIS_Y, CV_W, AXIS_Y + (AXIS_Y - objTopY) * (CV_W - LENS_X) / (LENS_X - objX), '#00f5a0');
    }
  } else {
    const imgX = LENS_X + R.di * PX_PER_CM;
    const imgH = OBJ_H * Math.abs(R.m);
    const imgTopY = R.upright ? (AXIS_Y - imgH) : (AXIS_Y + imgH);

    if (showRays){
      // 光線1：平行光 → 折射過右焦點
      ray(c, objX, objTopY, LENS_X, objTopY, '#00f2fe');
      if (R.type === 'real'){
        ray(c, LENS_X, objTopY, imgX, imgTopY, '#00f2fe');
      } else {
        // 虛像：實線往右發散，虛線往左回推
        const slope1 = (AXIS_Y - objTopY) / (fptR - LENS_X);
        ray(c, LENS_X, objTopY, CV_W, objTopY + slope1 * (CV_W - LENS_X), '#00f2fe');
        ray(c, LENS_X, objTopY, imgX, imgTopY, '#00f2fe', true);
      }
      // 光線2：過鏡心 → 直線
      if (R.type === 'real'){
        ray(c, objX, objTopY, imgX, imgTopY, '#ffd166');
      } else {
        const slope2 = (AXIS_Y - objTopY) / (LENS_X - objX);
        ray(c, objX, objTopY, CV_W, AXIS_Y - slope2 * (CV_W - objX), '#ffd166');
        ray(c, LENS_X, AXIS_Y, imgX, imgTopY, '#ffd166', true);
      }
      // 光線3：過左焦點 → 折射後平行射出
      if (fptL < objX){
        const slope3 = (AXIS_Y - objTopY) / (fptL - objX);
        const yAtLens = objTopY + slope3 * (LENS_X - objX);
        ray(c, objX, objTopY, LENS_X, yAtLens, '#00f5a0');
        if (R.type === 'real'){
          ray(c, LENS_X, yAtLens, imgX, yAtLens, '#00f5a0');
        } else {
          ray(c, LENS_X, yAtLens, CV_W, yAtLens, '#00f5a0');
          ray(c, LENS_X, yAtLens, imgX, imgTopY, '#00f5a0', true);
        }
      }
    }

    // 屏幕（僅實像可投影）
    if (R.type === 'real' && imgX < CV_W - 4){
      c.save();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(imgX, AXIS_Y - 92); c.lineTo(imgX, AXIS_Y + 92); c.stroke();
      c.restore();
    }

    // 像（畫布會自動裁切過高的箭頭；只有水平超出畫面才提示）
    if (imgX > 4 && imgX < CV_W - 4){
      const col = R.type === 'real' ? '#00f2fe' : '#00f5a0';
      const drawTopY = R.upright
        ? Math.max(AXIS_Y - 168, imgTopY)
        : Math.min(AXIS_Y + 168, imgTopY);
      drawArrow(c, imgX, drawTopY, col, '像', true);
    } else {
      offscreen = true;
    }
  }

  updateReadout(R, offscreen);
  syncRuleTable(R);
}

/* 更新右側像的判讀 */
function updateReadout(R, offscreen){
  const box = document.getElementById('imageReadout');
  if (!box) return;
  if (R.type === 'blur'){
    box.innerHTML = `
      <div class="readout-line"><span>物距</span><b>${objCm.toFixed(1)} cm</b></div>
      <div class="readout-line"><span>狀態</span><b>光線平行射出</b></div>
      <div class="verdict blur">🌫️ 物體剛好在焦點上<br>屏幕上無法成像（一片模糊）</div>`;
    return;
  }
  const dir = R.upright ? '正立' : '倒立';
  const size = R.sameSize ? '一樣大' : (R.enlarged ? '放大' : '縮小');
  const kind = R.type === 'real' ? '實像' : '虛像';
  const vClass = R.type === 'real' ? 'real' : 'virtual';
  const canProject = R.type === 'real' ? '可以投影在屏幕上' : '不能投影，要用眼睛透過放大鏡看';
  box.innerHTML = `
    <div class="readout-line"><span>物距（物體↔放大鏡）</span><b>${objCm.toFixed(1)} cm</b></div>
    <div class="readout-line"><span>像距（像↔放大鏡）</span><b>${Math.abs(R.di).toFixed(1)} cm${R.type==='virtual'?'（同側）':''}</b></div>
    <div class="readout-line"><span>放大率</span><b>${Math.abs(R.m).toFixed(2)} 倍</b></div>
    <div class="verdict ${vClass}">${R.type==='real'?'🔎':'👁️'} ${dir}、${size}的${kind}<br><small style="opacity:.85">${canProject}</small>${offscreen?'<br><small style="opacity:.85">（像太大或太遠，超出畫面）</small>':''}</div>`;
}

/* 依成像結果高亮「成像規律」表 */
function currentZone(R){
  if (R.type === 'blur') return 'focus';
  if (R.type === 'virtual') return 'inside';
  if (R.sameSize) return 'two-f';
  return R.enlarged ? 'near' : 'far';
}
function syncRuleTable(R){
  const zone = currentZone(R);
  document.querySelectorAll('.rule-table tbody tr').forEach(tr => {
    tr.classList.toggle('hl', tr.dataset.zone === zone);
  });
}

/* 一鍵重現影片場景 */
function setScene(kind){
  const f = focCm;
  let u;
  switch (kind){
    case 'far':    u = Math.min(78, 3 * f); break;
    case 'two-f':  u = 2 * f; break;
    case 'near':   u = 1.5 * f; break;
    case 'focus':  u = f; break;
    case 'inside': u = 0.6 * f; break;
    default: u = 60;
  }
  objCm = Math.max(5, Math.min(80, u));
  document.getElementById('objSlider').value = objCm;
  document.getElementById('objVal').textContent = objCm.toFixed(1) + ' cm';
  drawBench();
}

function toggleAdvanced(){
  showAdvanced = document.getElementById('advToggle').checked;
  document.getElementById('advBlock').hidden = !showAdvanced;
  document.getElementById('advExplain').hidden = !showAdvanced;
}

/* 滑鼠 / 觸控拖動蠟燭 */
function bindBenchDrag(){
  const canvas = cv(); if (!canvas) return;
  let dragging = false;
  const toCm = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (CV_W / rect.width);
    let u = (LENS_X - x) / PX_PER_CM;
    return Math.max(5, Math.min(80, u));
  };
  const start = (e) => {
    dragging = true;
    move(e);
  };
  const move = (e) => {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    objCm = toCm(clientX);
    document.getElementById('objSlider').value = objCm;
    document.getElementById('objVal').textContent = objCm.toFixed(1) + ' cm';
    drawBench();
    if (e.cancelable) e.preventDefault();
  };
  const end = () => { dragging = false; };
  canvas.addEventListener('mousedown', start);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);
}

/* ===================================================
   四、探究挑戰
   =================================================== */
const CHALLENGES = [
  { from:'影片提問',
    title:'從什麼時候開始，變成「倒立、放大」的清楚像？',
    task:'到實驗台把蠟燭移到「介於 1～2 倍焦距之間」的位置，觀察右側判讀。',
    ans:'當物體距離在「1 倍焦距」到「2 倍焦距」之間時，會在屏幕上得到倒立、放大的清楚實像。比 2 倍焦距更遠時就會變成縮小。' },
  { from:'影片提問',
    title:'從什麼時候開始，變成「倒立、縮小」的清楚像？',
    task:'把蠟燭移到「比 2 倍焦距還要遠」的地方，看看像變成什麼樣子。',
    ans:'只要物體比「2 倍焦距」更遠，像就會是倒立、縮小的清楚實像；物體越遠，像越小、也越靠近焦點。' },
  { from:'影片提問',
    title:'怎麼看到「正立、放大」的清楚像？',
    task:'把蠟燭移到「比 1 倍焦距還近」的地方（物距 < f）。',
    ans:'當物體比焦距還近時，會看到正立、放大的「虛像」——這沒辦法投影到屏幕上，要用眼睛直接透過放大鏡看，就是平常我們用放大鏡看小字的樣子！' },
];

function buildChallenges(){
  const box = document.getElementById('challengeList');
  box.innerHTML = CHALLENGES.map((ch, i) => `
    <div class="challenge-card" id="ch-${i}">
      <div class="q-from">💬 ${ch.from}</div>
      <h3>${ch.title}</h3>
      <p>🎯 任務：${ch.task}</p>
      <div class="btn-row" style="justify-content:flex-start;margin-top:0">
        <button class="mini-btn" onclick="go('bench')">🔭 去實驗台試試</button>
        <button class="mini-btn" onclick="document.getElementById('ch-${i}').classList.toggle('open')">💡 看解答</button>
      </div>
      <div class="reveal">✅ ${ch.ans}</div>
    </div>`).join('');
}

/* ===================================================
   五、闖關測驗
   =================================================== */
const quizBank = [
  { q:'放大鏡其實是哪一種鏡片？',
    options:['凸透鏡', '凹透鏡', '平面鏡'],
    answer:0,
    explain:'放大鏡是「凸透鏡」，中間厚、邊緣薄，可以讓光線聚集而成像。' },
  { q:'影片中，當物體離放大鏡「很遠」時，屏幕上看到的像是？',
    options:['倒立、縮小', '正立、放大', '正立、縮小'],
    answer:0,
    explain:'物體很遠（比 2 倍焦距還遠）時，會在屏幕上得到倒立、縮小的清楚實像。' },
  { q:'物體從遠處慢慢靠近放大鏡，像的大小會怎麼變化？',
    options:['越來越大', '越來越小', '完全不變'],
    answer:0,
    explain:'物體越靠近放大鏡，成的像就越大，直到越過焦點後變成正立放大的虛像。' },
  { q:'當物體「剛好在焦點上」時，屏幕上會看到什麼？',
    options:['一片模糊，無法成像', '最清楚的像', '倒立縮小的像'],
    answer:0,
    explain:'物體在焦點上時，光線折射後變成平行光，無法會聚，所以屏幕上一片模糊、無法成像。' },
  { q:'要看到「正立、放大」的像，物體要放在哪裡？',
    options:['比焦距還近（物距 < f）', '比 2 倍焦距還遠', '剛好 2 倍焦距'],
    answer:0,
    explain:'物體比焦距近時，會形成正立放大的虛像，就是我們平常用放大鏡看字的情形。' },
  { q:'倒立、放大的清楚像，物體大約在什麼位置？',
    options:['1～2 倍焦距之間', '比 2 倍焦距遠', '比焦距近'],
    answer:0,
    explain:'物距介於 1 倍到 2 倍焦距之間時，成的是倒立、放大的清楚實像。' },
  { q:'影片實驗二裡，蠟燭移到約 60 公分時，紙板上出現的是？',
    options:['倒立、縮小、清楚的像', '正立、放大的像', '看不到像'],
    answer:0,
    explain:'影片中蠟燭移到約 60cm 時，紙板上出現倒立、縮小、清楚的實像。' },
  { q:'用「不同的放大鏡」重做實驗，出現相似影像的距離會怎樣？',
    options:['可能不一樣，因為焦距不同', '一定完全相同', '和放大鏡完全無關'],
    answer:0,
    explain:'不同放大鏡的焦距不同，所以出現相同性質的像時，物體所在的距離也會不一樣。' },
  { q:'能「投影在屏幕上」的像，屬於哪一種？',
    options:['實像（倒立）', '虛像（正立）', '兩種都可以'],
    answer:0,
    explain:'只有實像才能被屏幕接住；虛像（正立放大）沒辦法投影，要用眼睛直接看。' },
  { q:'做科學實驗時，下列哪個習慣最重要？',
    options:['仔細測量並記錄距離、反覆驗證', '憑印象猜答案就好', '只做一次就下結論'],
    answer:0,
    explain:'像影片一樣測量距離、反覆觀察、換條件再試，才能找出可靠的規律，這就是科學探究的精神。' },
];

let quizIndex = 0, quizScore = 0, quizAnswered = false;

function initQuiz(){ quizIndex = 0; quizScore = 0; quizAnswered = false; renderQuestion(); }

function renderQuestion(){
  const card = document.getElementById('quizCard');
  const item = quizBank[quizIndex];
  const progress = (quizIndex / quizBank.length) * 100;
  const optsHTML = item.options.map((opt, i) =>
    `<button class="option-btn" onclick="answerQuiz(${i})">${opt}</button>`).join('');
  card.innerHTML = `
    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
    <div style="color:var(--text-muted); font-size:0.85rem; margin-bottom:6px;">第 ${quizIndex + 1} 題 / 共 ${quizBank.length} 題　目前得分 ${quizScore}</div>
    <div class="quiz-question">${item.q}</div>
    <div id="optionArea">${optsHTML}</div>
    <div id="explainArea"></div>`;
  quizAnswered = false;
}

function answerQuiz(choice){
  if (quizAnswered) return;
  quizAnswered = true;
  const item = quizBank[quizIndex];
  document.querySelectorAll('#optionArea .option-btn').forEach((b, i) => {
    b.disabled = true;
    if (i === item.answer) b.classList.add('correct');
    if (i === choice && choice !== item.answer) b.classList.add('wrong');
  });
  if (choice === item.answer) quizScore++;
  const isRight = choice === item.answer;
  document.getElementById('explainArea').innerHTML = `
    <div class="quiz-explain">
      ${isRight ? '✅ <strong style="color:var(--color-teal)">答對了！</strong>' : '❌ <strong style="color:var(--color-red)">再想想～</strong>'}
      ${item.explain}
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" onclick="nextQuestion()">
        ${quizIndex < quizBank.length - 1 ? '下一題 →' : '看成績 🏆'}
      </button>
    </div>`;
}

function nextQuestion(){
  if (quizIndex < quizBank.length - 1){ quizIndex++; renderQuestion(); }
  else { showResult(); }
}

function showResult(){
  const card = document.getElementById('quizCard');
  const total = quizBank.length;
  const pct = Math.round((quizScore / total) * 100);
  let badge, title, msg;
  if (pct === 100){ badge='🏅'; title='光學小博士！'; msg='太厲害了！凸透鏡成像的規律你完全掌握，可以當小老師囉！'; }
  else if (pct >= 70){ badge='🌟'; title='成像觀察達人'; msg='很棒！你已經很懂放大鏡的秘密，再複習一下就完美！'; }
  else if (pct >= 40){ badge='🔍'; title='放大鏡學徒'; msg='不錯的開始！回去實驗台再玩幾次，你會更厲害！'; }
  else { badge='🌱'; title='剛起步的探究員'; msg='沒關係，多看幾次教材、動手拖拖看，再來挑戰一次吧！'; }
  card.innerHTML = `
    <div class="result-card">
      <div class="badge-big">${badge}</div>
      <div class="score">${quizScore} / ${total}</div>
      <h3 style="color:var(--text-bright); margin:6px 0;">${title}</h3>
      <p>答對率 ${pct}%</p>
      <p>${msg}</p>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="initQuiz()">🔄 再挑戰一次</button>
        <button class="btn btn-secondary" onclick="go('bench')">🔭 回實驗台驗證</button>
      </div>
    </div>`;
}

/* ===================================================
   初始化
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  buildGear();
  buildDemo();
  buildChallenges();

  const objSlider = document.getElementById('objSlider');
  const focSlider = document.getElementById('focSlider');
  objSlider.addEventListener('input', e => {
    objCm = parseFloat(e.target.value);
    document.getElementById('objVal').textContent = objCm.toFixed(1) + ' cm';
    drawBench();
  });
  focSlider.addEventListener('input', e => {
    focCm = parseFloat(e.target.value);
    document.getElementById('focVal').textContent = focCm.toFixed(1) + ' cm';
    drawBench();
  });

  bindBenchDrag();
  drawBench();
  window.addEventListener('resize', drawBench);

  const hash = location.hash.replace('#', '');
  if (hash) go(hash);
});
