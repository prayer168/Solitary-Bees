/* ===================================================
   獨居蜂的秘密生活 - 互動邏輯
   =================================================== */

/* ===================================================
   寫實蜜蜂 SVG 產生器
   回傳一段 <g> 內容（蜂體在原點附近，頭朝右），
   外層再用 transform 定位 / 縮放。
   opts: thorax, abdomen, stripe, hair, eye, stripes(數), shiny
   =================================================== */
let _beeUID = 0;
function realBee(opts = {}){
  const o = Object.assign({
    thorax: 'url(#amberG)',
    abdomen: 'url(#amberG)',
    stripe: '#1a1a1a',
    hair: '#f5deb3',
    eye: 'url(#eyeG)',
    stripes: 3,
    shiny: false,
    wings: true
  }, opts);
  const id = 'bee' + (_beeUID++);

  // 腹部條紋（夾在腹部橢圓內）
  let stripeBands = '';
  if (o.stripes > 0){
    for (let i = 0; i < o.stripes; i++){
      const x = -44 + i * 12;
      stripeBands += `<rect x="${x}" y="-20" width="6.5" height="40" rx="3" fill="${o.stripe}" opacity="0.92"/>`;
    }
  }

  // 胸部絨毛（短毛放射）
  let fuzz = '';
  for (let a = 0; a < 18; a++){
    const ang = (a / 18) * Math.PI * 2;
    const r1 = 13, r2 = 17.5;
    const cx = 8, cy = -2;
    const x1 = cx + Math.cos(ang) * r1, y1 = cy + Math.sin(ang) * r1;
    const x2 = cx + Math.cos(ang) * r2, y2 = cy + Math.sin(ang) * r2;
    fuzz += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${o.hair}" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>`;
  }

  const shineAb = o.shiny
    ? `<ellipse cx="-26" cy="-6" rx="14" ry="5" fill="#ffffff" opacity="0.18"/>`
    : '';
  const shineTh = `<ellipse cx="3" cy="-8" rx="7" ry="3.5" fill="#ffffff" opacity="0.2"/>`;

  const wings = o.wings ? `
    <path class="wing-blur" d="M6,-10 C -12,-50 -52,-44 -62,-20 C -50,-10 -16,-12 6,-6 Z" fill="#eaffff"/>
    <g class="hwing"><path d="M4,-8 C -10,-26 -34,-26 -44,-15 C -34,-8 -14,-7 4,-5 Z"
        fill="url(#wingG)" stroke="#bfe6ff" stroke-width="0.6"/>
      <path d="M0,-8 C -14,-16 -28,-16 -38,-13" fill="none" stroke="#9fd0ee" stroke-width="0.5" opacity="0.7"/></g>
    <g class="fwing"><path d="M6,-10 C -10,-44 -46,-40 -56,-22 C -46,-13 -16,-12 6,-7 Z"
        fill="url(#wingG)" stroke="#cdeeff" stroke-width="0.7"/>
      <path d="M2,-10 C -14,-30 -34,-32 -50,-24" fill="none" stroke="#a9d8f5" stroke-width="0.5" opacity="0.7"/>
      <path d="M-2,-9 C -16,-22 -30,-24 -44,-21" fill="none" stroke="#a9d8f5" stroke-width="0.5" opacity="0.6"/></g>` : '';

  return `
  <g id="${id}">
    ${wings}
    <!-- 六隻腳 -->
    <g class="leg"   stroke="#15110a" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path d="M14,9 l5,13 l-4,8"/></g>
    <g class="leg l2" stroke="#15110a" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path d="M4,11 l1,15 l-5,8"/></g>
    <g class="leg l3" stroke="#15110a" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path d="M-6,10 l-3,14 l3,8"/></g>
    <!-- 腹部 -->
    <clipPath id="${id}clip"><ellipse cx="-22" cy="1" rx="29" ry="17"/></clipPath>
    <ellipse cx="-22" cy="1" rx="29" ry="17" fill="${o.abdomen}"/>
    <g clip-path="url(#${id}clip)">${stripeBands}${shineAb}</g>
    <ellipse cx="-22" cy="1" rx="29" ry="17" fill="none" stroke="#000" stroke-width="0.6" opacity="0.25"/>
    <!-- 胸部 -->
    ${fuzz}
    <ellipse cx="8" cy="-2" rx="15" ry="14.5" fill="${o.thorax}"/>
    ${shineTh}
    <!-- 頭 -->
    <circle cx="29" cy="-3" r="11" fill="${o.thorax}"/>
    <ellipse cx="33" cy="-4" rx="4.2" ry="6.5" fill="${o.eye}"/>
    <circle cx="31.5" cy="-6" r="1.3" fill="#fff" opacity="0.8"/>
    <!-- 觸角 -->
    <g class="antenna"  stroke="#15110a" stroke-width="1.8" stroke-linecap="round" fill="none">
      <path d="M30,-12 Q 36,-22 42,-24"/></g>
    <g class="antenna a2" stroke="#15110a" stroke-width="1.8" stroke-linecap="round" fill="none">
      <path d="M27,-13 Q 31,-24 37,-28"/></g>
    <!-- 口器 -->
    <line x1="36" y1="3" x2="40" y2="9" stroke="#7a5a2f" stroke-width="1.6" stroke-linecap="round"/>
  </g>`;
}

/* 包成完整可獨立顯示的 SVG 場景用的蜜蜂（含外層定位） */
function beeAt(x, y, scale = 1, opts = {}){
  return `<g transform="translate(${x},${y}) scale(${scale})">${realBee(opts)}</g>`;
}

/* ---------- 分頁切換 (SPA Tab) ---------- */
function go(tab){
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.nav-tab[data-tab="${tab}"]`)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.replaceState(null, '', '#' + tab);
  if (tab === 'quiz') initQuiz();
}

/* 進入頁面時讀取 hash 深層連結 */
document.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.replace('#', '');
  if (hash) go(hash);
  buildMaterials();
  buildFriendList();
  showFriend(0);
  buildSpeciesList();
  showSpecies(0);

  // 注入寫實蜜蜂
  const homeBee = document.getElementById('homeBee');
  if (homeBee) homeBee.innerHTML = realBee({ thorax:'url(#amberG)', abdomen:'url(#amberG)', stripe:'#1a1a1a', hair:'#ffe9b0', stripes:3 });
  const motherInner = document.getElementById('motherBeeInner');
  if (motherInner) motherInner.innerHTML = realBee({ thorax:'url(#amberG)', abdomen:'url(#amberG)', stripe:'#1a1a1a', hair:'#ffe9b0', stripes:3 });
  const hotelBee = document.getElementById('hotelBee');
  if (hotelBee) hotelBee.innerHTML = realBee({ thorax:'url(#amberG)', abdomen:'url(#amberG)', stripe:'#1a1a1a', hair:'#ffe9b0', stripes:3 });

  // 認識獨居蜂：對照插圖
  const soloBee = document.getElementById('meetSoloBee');
  if (soloBee) soloBee.innerHTML = realBee({ thorax:'url(#amberG)', abdomen:'url(#amberG)', stripe:'#1a1a1a', hair:'#ffe9b0', stripes:3 });
  for (let i = 1; i <= 5; i++){
    const cb = document.getElementById('cBee' + i);
    if (cb) cb.innerHTML = realBee({ thorax:'url(#amberG)', abdomen:'url(#amberG)', stripe:'#1a1a1a', hair:'#ffe9b0', stripes:3, wings:false });
  }
  const flowerBee = document.getElementById('flowerBee');
  if (flowerBee) flowerBee.innerHTML =
    realBee({ thorax:'url(#amberG)', abdomen:'url(#amberG)', stripe:'#1a1a1a', hair:'#ffe9b0', stripes:3, wings:false }) +
    // 折起的翅膀（停棲狀態）與後腳花粉籃
    `<path d="M6,-10 C -16,-18 -36,-14 -46,-6 C -34,-2 -12,-4 6,-6 Z" fill="url(#wingG)" stroke="#cdeeff" stroke-width="0.7" opacity="0.85"/>
     <circle cx="-4" cy="22" r="5.5" fill="#ffb733" stroke="#c77f12" stroke-width="1"/>
     <circle cx="-4" cy="22" r="2" fill="#ffe9b0" opacity="0.7"/>`;
});

/* ===================================================
   蜂種圖鑑
   =================================================== */
const speciesData = [
  {
    name: '🍃 切葉蜂',
    latin: 'Megachile spp.',
    icon: `<svg class="scene" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="180" fill="#0a1430" rx="12"/>
      <!-- 葉片與剪痕 -->
      <ellipse cx="78" cy="110" rx="58" ry="42" fill="#1f7a4d"/>
      <ellipse cx="78" cy="110" rx="58" ry="42" fill="none" stroke="#2fa365" stroke-width="2"/>
      <line x1="40" y1="135" x2="120" y2="78" stroke="#0d5535" stroke-width="2"/>
      <path d="M120 70 A 26 26 0 0 0 120 122 Z" fill="#0a1430"/>
      <circle class="entrance-glow" cx="120" cy="96" r="4" fill="#9be8c0"/>
      <!-- 搬著剪下的葉片飛回巢 -->
      <g class="approach">
        <g transform="translate(218,92) scale(1.7)">
          <circle cx="-8" cy="22" r="11" fill="#2fa365" stroke="#1f7a4d" stroke-width="1.5"/>
          ${realBee({ thorax:'url(#blackG)', abdomen:'url(#blackG)', stripe:'#d7dde2', hair:'#ffffff', stripes:4 })}
        </g>
      </g>
    </svg>`,
    feature: '身體胖胖的，胸部有白色絨毛，嘴巴有一對像小剪刀的大顎。',
    nest: '會把樹葉剪成一片片圓形或半圓形，捲起來當作巢室的「牆壁」和「門」，築巢在空心管子或土洞裡。',
    fun: '如果發現院子裡的葉子邊緣被剪出整齊的圓弧缺口，很可能就是切葉蜂來「借」材料蓋房子了！'
  },
  {
    name: '🧱 壁蜂',
    latin: 'Osmia spp.',
    icon: `<svg class="scene" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="180" fill="#0a1430" rx="12"/>
      <!-- 磚牆與泥封巢洞 -->
      <rect x="20" y="30" width="120" height="120" fill="#7a4a22" rx="4"/>
      <g stroke="#5a3417" stroke-width="2">
        <line x1="20" y1="70" x2="140" y2="70"/><line x1="20" y1="110" x2="140" y2="110"/>
        <line x1="80" y1="30" x2="80" y2="70"/><line x1="50" y1="70" x2="50" y2="110"/>
        <line x1="110" y1="110" x2="110" y2="150"/>
      </g>
      <circle cx="55" cy="50" r="9" fill="#1a1208"/>
      <ellipse class="entrance-glow" cx="95" cy="90" rx="10" ry="9" fill="#3a2410"/>
      <circle cx="60" cy="130" r="9" fill="#1a1208"/>
      <!-- 飛向牆上的巢洞 -->
      <g class="approach">${beeAt(228, 92, 1.7, { thorax:'url(#tealG)', abdomen:'url(#tealG)', stripe:'#063b36', hair:'#bdf5e6', stripes:2, shiny:true })}</g>
    </svg>`,
    feature: '身體常帶有金屬般的藍綠光澤，胸部毛茸茸，看起來閃閃發亮。',
    nest: '喜歡利用牆壁縫隙、土壁上的小洞，或現成的空心管築巢，再用泥土把巢室一格一格隔開、封起來。',
    fun: '「壁蜂」的名字就是因為牠常常在土牆、磚牆的小洞裡築巢，是很好的果樹授粉幫手。'
  },
  {
    name: '🪵 木蜂',
    latin: 'Xylocopa spp.',
    icon: `<svg class="scene" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="180" fill="#0a1430" rx="12"/>
      <!-- 木頭與鑽出的圓形隧道口 -->
      <rect x="14" y="64" width="150" height="58" fill="#5a3a1f" rx="8"/>
      <rect x="14" y="64" width="150" height="58" fill="none" stroke="#3f2814" stroke-width="2" rx="8"/>
      <g stroke="#6e4a26" stroke-width="1.5" opacity="0.6">
        <line x1="30" y1="64" x2="34" y2="122"/><line x1="120" y1="64" x2="124" y2="122"/>
      </g>
      <ellipse class="entrance-glow" cx="70" cy="93" rx="13" ry="13" fill="#120c06"/>
      <circle cx="70" cy="93" r="13" fill="none" stroke="#2a1c0e" stroke-width="2"/>
      <!-- 飛向木頭隧道口 -->
      <g class="approach">${beeAt(232, 88, 2.0, { thorax:'url(#blackG)', abdomen:'url(#blackG)', stripe:'#000', hair:'#3a3550', stripes:0, shiny:true })}</g>
    </svg>`,
    feature: '台灣最大的蜂之一，全身黑亮帶藍紫光澤，胸部毛茸茸像顆絨毛球，飛行時聲音很大但不兇。',
    nest: '會用強壯的口器在乾燥的木頭、竹子或木製欄杆上鑽出隧道狀的巢，一間接一間排列。',
    fun: '木蜂飛行聲音大，常讓人以為很可怕，但牠其實非常溫和，通常只是路過巡視自己的「家」。'
  },
  {
    name: '🕳️ 隧蜂',
    latin: 'Halictidae / Andrenidae',
    icon: `<svg class="scene" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="180" fill="#0a1430" rx="12"/>
      <!-- 泥土地面與小火山狀隧道口 -->
      <rect x="0" y="120" width="320" height="60" fill="#3a2410"/>
      <path d="M40 122 Q 75 96 110 122 Z" fill="#4a3018"/>
      <path d="M40 122 Q 75 96 110 122 Z" fill="none" stroke="#5e3f20" stroke-width="2"/>
      <ellipse class="entrance-glow" cx="75" cy="118" rx="11" ry="6" fill="#160e05"/>
      <path d="M150 122 Q 175 104 200 122 Z" fill="#4a3018"/>
      <ellipse cx="175" cy="119" rx="8" ry="4" fill="#160e05"/>
      <!-- 鑽進地面的隧道口 -->
      <g class="dig-down">${beeAt(232, 78, 1.45, { thorax:'url(#tealG)', abdomen:'url(#tealG)', stripe:'#063b36', hair:'#bdf5e6', stripes:2, shiny:true })}</g>
    </svg>`,
    feature: '體型比較小，常有金屬綠或銅色的光澤，動作很快。',
    nest: '在鬆軟的泥土地面挖出垂直的小隧道，地面上常能看到像小火山一樣的「土堆」，那就是隧道的入口。',
    fun: '走在校園裸露的泥土地或操場邊，如果看到一個個小土堆中間有洞，可能就是隧蜂的家。'
  },
  {
    name: '🟧 條蜂',
    latin: 'Anthophora spp.',
    icon: `<svg class="scene" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="180" fill="#0a1430" rx="12"/>
      <!-- 乾燥土坡與多個巢口 -->
      <path d="M0 150 Q 90 96 220 150 L 320 180 L 0 180 Z" fill="#7a5a35"/>
      <path d="M0 150 Q 90 96 220 150" fill="none" stroke="#9a774a" stroke-width="2"/>
      <ellipse class="entrance-glow" cx="95" cy="132" rx="7" ry="7" fill="#160e05"/>
      <ellipse class="entrance-glow" cx="140" cy="140" rx="7" ry="7" fill="#160e05"/>
      <circle cx="180" cy="146" r="6" fill="#160e05"/>
      <g class="hover-bob">
        ${beeAt(232, 70, 1.55, { thorax:'url(#amberG)', abdomen:'url(#amberG)', stripe:'#f3e6c4', hair:'#ffe9b0', stripes:4 })}
      </g>
      <!-- 飄散的花粉 -->
      <circle class="pollen" cx="200" cy="95" r="3" fill="#ffd166"/>
      <circle class="pollen p2" cx="255" cy="100" r="2.5" fill="#ffd166"/>
      <circle class="pollen p3" cx="225" cy="105" r="2" fill="#ffd166"/>
    </svg>`,
    feature: '身體毛茸茸，常有橘黃色或灰白色的條紋，飛行速度很快，很像迷你版的熊蜂。',
    nest: '喜歡在乾燥的土坡、土牆或河岸的鬆土上挖洞築巢，有時很多隻會選在同一片土坡，但每一隻都有自己的巢。',
    fun: '春天常能看到牠們在土坡前快速盤旋、進進出出，像在巡邏，但其實只是各自回家而已。'
  }
];

function buildSpeciesList(){
  const list = document.getElementById('speciesList');
  list.innerHTML = '';
  speciesData.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'life-item' + (i === 0 ? ' active' : '');
    div.id = 'species' + i;
    div.textContent = s.name;
    div.onclick = () => showSpecies(i);
    list.appendChild(div);
  });
}

function showSpecies(i){
  document.querySelectorAll('#speciesList .life-item').forEach(el => el.classList.remove('active'));
  document.getElementById('species' + i)?.classList.add('active');
  const s = speciesData[i];
  const d = document.getElementById('speciesDetail');
  d.innerHTML = `
    ${s.icon}
    <h3>${s.name}　<span style="font-size:0.8rem; color:var(--text-muted); font-weight:400;">${s.latin}</span></h3>
    <p style="line-height:1.9;"><strong style="color:var(--color-cyan);">長相特徵：</strong>${s.feature}</p>
    <p style="line-height:1.9;"><strong style="color:var(--color-teal);">築巢方式：</strong>${s.nest}</p>
    <div class="exp-box">💡 ${s.fun}</div>
  `;
}

/* ===================================================
   單元二：築巢觀察 滑桿模擬器
   =================================================== */
const nestStages = [
  { title: '第 0 步：找到家', desc: '把滑桿往右拉，開始築巢！', status: '準備中', cells: 0,
    exp: '獨居蜂媽媽會找一根中空的管子當家，可能是空心的竹子、樹洞，或別的蟲留下的洞。' },
  { title: '第 1 步：搬花粉', desc: '母蜂飛到花朵採花粉，搬回巢裡堆成一團。', status: '採集中', cells: 1,
    exp: '母蜂來回好多趟，把花粉和花蜜搬回家，堆成一個小球。這是寶寶出生後的食物喔！' },
  { title: '第 2 步：產一顆卵', desc: '母蜂在花粉球上產下一顆卵。', status: '產卵中', cells: 2,
    exp: '在滿滿的花粉上，母蜂生下一顆卵。卵孵化後，幼蟲就有吃不完的花粉大餐。' },
  { title: '第 3 步：蓋一道牆', desc: '用泥土或樹葉把這間房間隔開。', status: '築牆中', cells: 3,
    exp: '母蜂用泥土、樹葉或樹脂蓋一道牆，把房間隔開，再繼續蓋下一間。一根管子可以有好幾間房！' },
  { title: '第 4 步：封住大門', desc: '最後把管口封起來，保護所有寶寶。', status: '完成！', cells: 3,
    exp: '全部蓋好後，母蜂把最外面的門封得緊緊的，擋住壞天氣和敵人。然後牠就離開了 — 寶寶會自己長大！' }
];

function updateNest(v){
  v = parseInt(v);
  const s = nestStages[v];
  document.getElementById('stageTitle').textContent = s.title;
  document.getElementById('stageDesc').textContent = s.desc;
  document.getElementById('dataStep').textContent = v + ' / 4';
  document.getElementById('dataCells').textContent = s.cells + ' 個';
  document.getElementById('dataStatus').textContent = s.status;
  document.getElementById('nestExp').textContent = s.exp;

  // reveal chambers progressively
  document.getElementById('cell1').style.opacity = v >= 1 ? '1' : '0';
  document.getElementById('cell2').style.opacity = v >= 2 ? '1' : '0';
  document.getElementById('cell3').style.opacity = v >= 3 ? '1' : '0';
  document.getElementById('seal').style.opacity  = v >= 4 ? '1' : '0';

  // move mother bee along the tube; fly away at the end
  const bee = document.getElementById('motherBee');
  const positions = [
    'translate(400,60)', 'translate(110,55)', 'translate(195,55)',
    'translate(330,55)', 'translate(470,30)'
  ];
  bee.setAttribute('transform', positions[v]);
  bee.style.transition = 'transform 0.6s ease';
}

function resetNest(){
  document.getElementById('nestSlider').value = 0;
  updateNest(0);
}

/* ===================================================
   單元三：蓋昆蟲旅館
   =================================================== */
const materials = [
  { em: '🎋', name: '空心竹管', good: true,  why: '中空的小管子最適合獨居蜂鑽進去築巢！' },
  { em: '🪵', name: '鑽孔的木頭', good: true,  why: '木頭上的小孔洞是壁蜂最愛的房間。' },
  { em: '🌾', name: '中空蘆葦稈', good: true,  why: '一根根的蘆葦稈，就像一間間小套房。' },
  { em: '🧱', name: '黏土泥磚', good: true,  why: '有些獨居蜂會在泥土裡挖洞，也可以鋪在旁邊。' },
  { em: '🪨', name: '光滑大石頭', good: false, why: '太硬太光滑了，獨居蜂沒辦法在上面鑽洞。' },
  { em: '🥤', name: '塑膠瓶',     good: false, why: '塑膠不透氣又會發霉，對蜂寶寶不好喔。' }
];
let hotelPicked = [];

function buildMaterials(){
  const list = document.getElementById('materialList');
  list.innerHTML = '';
  materials.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'material-item';
    div.id = 'mat' + i;
    div.innerHTML = `<span class="em">${m.em}</span><span>${m.name}</span>`;
    div.onclick = () => pickMaterial(i);
    list.appendChild(div);
  });
}

function pickMaterial(i){
  const m = materials[i];
  const el = document.getElementById('mat' + i);
  const frame = document.getElementById('hotelFrame');
  const fb = document.getElementById('hotelFeedback');

  if (hotelPicked.includes(i)) return; // already added

  hotelPicked.push(i);
  el.classList.add('picked');

  // remove empty hint
  const hint = frame.querySelector('.empty-hint');
  if (hint) hint.remove();

  const tile = document.createElement('div');
  tile.className = 'hotel-tile';
  tile.textContent = m.em;
  tile.title = m.name;
  frame.appendChild(tile);

  if (m.good){
    fb.className = 'feedback-box good';
    fb.innerHTML = `✅ <strong>好選擇！</strong>${m.why}`;
  } else {
    fb.className = 'feedback-box bad';
    fb.innerHTML = `❌ <strong>再想想～</strong>${m.why}`;
  }

  // bonus message when all good materials chosen
  const goodCount = hotelPicked.filter(x => materials[x].good).length;
  const totalGood = materials.filter(m => m.good).length;
  if (goodCount === totalGood){
    fb.className = 'feedback-box good';
    fb.innerHTML = `🎉 <strong>太棒了！</strong>你把適合的天然材料都放進去了，獨居蜂一定會很喜歡這間旅館！`;
  }
}

function resetHotel(){
  hotelPicked = [];
  document.querySelectorAll('.material-item').forEach(el => el.classList.remove('picked'));
  const frame = document.getElementById('hotelFrame');
  frame.innerHTML = '<span class="empty-hint">點右邊的材料，把它們放進旅館裡 →</span>';
  const fb = document.getElementById('hotelFeedback');
  fb.className = 'feedback-box';
  fb.innerHTML = '提示：獨居蜂喜歡有<strong>小孔洞</strong>的天然材料。挑挑看哪些適合？';
}

/* ===================================================
   單元四：好朋友還壞朋友
   =================================================== */
const friendData = [
  { q: '🌸 牠會幫花朵授粉嗎？', good: true, verdict: '是好朋友！',
    detail: '獨居蜂在花朵間飛來飛去採花粉，身上沾滿花粉，幫花朵傳播花粉。很多水果、蔬菜都靠牠們授粉，才能結出果實！' },
  { q: '😱 牠會像虎頭蜂一樣攻擊人嗎？', good: true, verdict: '別擔心！',
    detail: '獨居蜂沒有大蜂窩要保護，個性非常溫和。只要你不去抓牠、不弄壞牠的巢，牠幾乎不會螫人。安靜觀察就好。' },
  { q: '🍯 牠會釀很多蜂蜜給我們吃嗎？', good: false, verdict: '這個不會喔',
    detail: '獨居蜂不釀蜂蜜。牠採的花粉和花蜜都是要留給自己的寶寶吃的。不過牠厲害的地方是「授粉」，這個幫助比蜂蜜更重要！' },
  { q: '🏡 我可以幫牠蓋家嗎？', good: true, verdict: '當然可以！',
    detail: '你可以用空心竹管、鑽洞的木頭做一間「昆蟲旅館」，放在花園或陽台。獨居蜂找到後就會搬進來，還能幫你的植物授粉呢！' },
  { q: '🐛 牠會咬壞我家的木頭家具嗎？', good: true, verdict: '幾乎不會',
    detail: '大部分獨居蜂只會利用「已經有的小洞」築巢，不會破壞東西。少數木蜂會鑽木頭，但通常選的是戶外枯木，不太會跑進家裡。' }
];

function buildFriendList(){
  const list = document.getElementById('friendList');
  list.innerHTML = '';
  friendData.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'life-item' + (i === 0 ? ' active' : '');
    div.id = 'friend' + i;
    div.textContent = f.q;
    div.onclick = () => showFriend(i);
    list.appendChild(div);
  });
}

function showFriend(i){
  document.querySelectorAll('.life-item').forEach(el => el.classList.remove('active'));
  document.getElementById('friend' + i)?.classList.add('active');
  const f = friendData[i];
  const d = document.getElementById('friendDetail');
  d.innerHTML = `
    <h3>${f.q}</h3>
    <span class="verdict ${f.good ? 'good' : 'bad'}">${f.verdict}</span>
    <p style="line-height:1.9; color:var(--text-main);">${f.detail}</p>
  `;
}

/* ===================================================
   闖關大挑戰：測驗
   =================================================== */
const quizBank = [
  { q: '全世界的蜂類中，大部分是哪一種？',
    options: ['住大蜂窩的社會性蜂', '自己生活的獨居蜂', '只有蜂后會生寶寶的蜂'],
    answer: 1,
    explain: '超過 9 成的蜂類都是獨居蜂，牠們自己生活、自己築巢。' },
  { q: '關於獨居蜂，下面哪一句是對的？',
    options: ['牠們有一隻蜂后', '每隻母蜂都自己蓋家、自己生寶寶', '牠們會成群螫人'],
    answer: 1,
    explain: '獨居蜂沒有蜂后，每一隻母蜂都是自己的女王，獨立築巢育兒。' },
  { q: '獨居蜂築巢時，會在巢室裡放什麼給寶寶吃？',
    options: ['蜂蜜罐頭', '花粉和花蜜', '小蟲子'],
    answer: 1,
    explain: '母蜂把花粉和花蜜堆成球，當作幼蟲的食物，再產卵在上面。' },
  { q: '為什麼獨居蜂很少螫人？',
    options: ['牠們沒有螫針', '牠們沒有大蜂窩要保護，個性溫和', '牠們看不到人'],
    answer: 1,
    explain: '獨居蜂沒有群體蜂窩需要防衛，所以非常溫和，不打擾牠就好。' },
  { q: '獨居蜂對大自然最大的幫助是什麼？',
    options: ['釀很多蜂蜜', '幫花朵授粉', '把害蟲吃光'],
    answer: 1,
    explain: '獨居蜂是超棒的授粉者，幫助許多花朵、蔬果結出果實。' },
  { q: '想幫助獨居蜂，下面哪個做法最好？',
    options: ['用塑膠瓶幫牠蓋家', '用空心竹管、鑽洞木頭做昆蟲旅館', '把牠的巢拆掉看看裡面'],
    answer: 1,
    explain: '用天然有孔洞的材料做昆蟲旅館，是最友善的幫助方式！' },
  { q: '院子裡的葉子邊緣被剪出整齊的圓弧缺口，最可能是誰做的？',
    options: ['切葉蜂', '木蜂', '毛毛蟲'],
    answer: 0,
    explain: '切葉蜂會用像剪刀的大顎，把葉子剪成圓片，捲起來當巢室的牆壁和門。' },
  { q: '哪一種蜂身體常有金屬般的藍綠光澤，喜歡在牆洞築巢、用泥土封口？',
    options: ['條蜂', '壁蜂', '虎頭蜂'],
    answer: 1,
    explain: '壁蜂有金屬藍綠光澤，常利用牆縫或小洞築巢，再用泥土把巢室封起來。' },
  { q: '在泥土地上看到像小火山的土堆，中間有一個洞，那可能是誰的家？',
    options: ['隧蜂', '螞蟻搬來的石頭', '切葉蜂'],
    answer: 0,
    explain: '隧蜂會在鬆軟的泥土裡挖垂直隧道，挖出來的土堆在洞口，看起來像小火山。' },
  { q: '母獨居蜂築巢的順序，哪一個是對的？',
    options: ['產卵 → 放花粉 → 封口 → 蓋牆', '找管子 → 放花粉 → 產卵 → 蓋牆 → 封口', '封口 → 找管子 → 產卵'],
    answer: 1,
    explain: '母蜂先找到中空管子，搬花粉進去、產一顆卵、蓋一道牆隔間，全部蓋好後再把大門封起來。' }
];

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function initQuiz(){
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  renderQuestion();
}

function renderQuestion(){
  const card = document.getElementById('quizCard');
  const item = quizBank[quizIndex];
  const progress = (quizIndex / quizBank.length) * 100;

  let optsHTML = '';
  item.options.forEach((opt, i) => {
    optsHTML += `<button class="option-btn" onclick="answerQuiz(${i})">${opt}</button>`;
  });

  card.innerHTML = `
    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
    <div style="color:var(--text-muted); font-size:0.85rem; margin-bottom:6px;">第 ${quizIndex + 1} 題 / 共 ${quizBank.length} 題　目前得分 ${quizScore}</div>
    <div class="quiz-question">${item.q}</div>
    <div id="optionArea">${optsHTML}</div>
    <div id="explainArea"></div>
  `;
  quizAnswered = false;
}

function answerQuiz(choice){
  if (quizAnswered) return;
  quizAnswered = true;
  const item = quizBank[quizIndex];
  const buttons = document.querySelectorAll('#optionArea .option-btn');

  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === item.answer) b.classList.add('correct');
    if (i === choice && choice !== item.answer) b.classList.add('wrong');
  });

  if (choice === item.answer) quizScore++;

  const isRight = choice === item.answer;
  document.getElementById('explainArea').innerHTML = `
    <div class="quiz-explain">
      ${isRight ? '✅ <strong style="color:var(--color-teal)">答對了！</strong>' : '❌ <strong style="color:var(--color-red)">再看看～</strong>'}
      ${item.explain}
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" onclick="nextQuestion()">
        ${quizIndex < quizBank.length - 1 ? '下一題 →' : '看成績 🏆'}
      </button>
    </div>
  `;
}

function nextQuestion(){
  if (quizIndex < quizBank.length - 1){
    quizIndex++;
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult(){
  const card = document.getElementById('quizCard');
  const total = quizBank.length;
  const pct = Math.round((quizScore / total) * 100);

  let badge, title, msg;
  if (pct === 100){
    badge = '🏅'; title = '獨居蜂博士！';
    msg = '太厲害了！你完全了解獨居蜂的秘密生活，可以當小老師教別人囉！';
  } else if (pct >= 67){
    badge = '🌟'; title = '獨居蜂達人';
    msg = '很棒！你已經很懂獨居蜂了，再複習一下就完美！';
  } else if (pct >= 34){
    badge = '🐝'; title = '獨居蜂學徒';
    msg = '不錯的開始！回去再看看前面的單元，你會更厲害！';
  } else {
    badge = '🌱'; title = '剛起步的觀察員';
    msg = '沒關係，多看幾次教材，再來挑戰一次吧！';
  }

  card.innerHTML = `
    <div class="result-card">
      <div class="badge-big">${badge}</div>
      <div class="score">${quizScore} / ${total}</div>
      <h3 style="color:var(--text-bright); margin:6px 0;">${title}</h3>
      <p>答對率 ${pct}%</p>
      <p>${msg}</p>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="initQuiz()">🔄 再挑戰一次</button>
        <button class="btn btn-secondary" onclick="makeCertificate('${title}', ${quizScore}, ${total})">📜 領結業證書</button>
      </div>
    </div>
  `;
}

/* ---------- 結業證書 ---------- */
function makeCertificate(title, score, total){
  const name = prompt('請輸入你的名字，印在證書上：', '小小自然觀察家');
  if (name === null) return;
  const today = new Date();
  const dateStr = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8">
    <title>結業證書</title>
    <style>
      body{font-family:'Noto Sans TC',sans-serif;background:#f4f7fb;display:flex;
        align-items:center;justify-content:center;min-height:100vh;margin:0;}
      .cert{background:#fff;border:10px solid #00b4d8;border-radius:20px;
        padding:48px 56px;text-align:center;max-width:560px;
        box-shadow:0 12px 40px rgba(0,0,0,0.12);}
      .cert .emoji{font-size:4rem;}
      .cert h1{color:#0077a3;margin:10px 0;font-size:1.9rem;}
      .cert .name{font-size:2.2rem;font-weight:900;color:#222;
        border-bottom:3px dashed #00b4d8;display:inline-block;padding:4px 24px;margin:14px 0;}
      .cert .role{color:#00a36c;font-size:1.4rem;font-weight:700;margin:8px 0;}
      .cert p{color:#555;line-height:1.8;}
      .cert .date{margin-top:22px;color:#888;}
      .cert .seal{font-size:2.5rem;margin-top:10px;}
      @media print{body{background:#fff;}}
    </style></head><body>
    <div class="cert">
      <div class="emoji">🐝🏅</div>
      <h1>獨居蜂的秘密生活 · 結業證書</h1>
      <p>恭喜這位小小研究員完成了所有探索與挑戰</p>
      <div class="name">${name}</div>
      <div class="role">榮獲「${title}」稱號</div>
      <p>測驗成績：${score} / ${total}　答對率 ${Math.round(score/total*100)}%</p>
      <p>你已經學會用溫柔的眼睛，認識這群自己生活的小蜜蜂。<br>
      請繼續安靜觀察、和平相處，做大自然的好朋友！</p>
      <div class="date">${dateStr}</div>
      <div class="seal">🌸🐝🌿</div>
    </div>
    <script>setTimeout(()=>window.print(),500);<\/script>
    </body></html>
  `);
  win.document.close();
}
