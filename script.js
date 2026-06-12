/* ===================================================
   獨居蜂的秘密生活 - 互動邏輯
   =================================================== */

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
});

/* ===================================================
   蜂種圖鑑
   =================================================== */
const speciesData = [
  {
    name: '🍃 切葉蜂',
    latin: 'Megachile spp.',
    icon: `<svg class="scene" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="#0a1430" rx="12"/>
      <ellipse cx="60" cy="80" rx="40" ry="28" fill="#1f7a4d"/>
      <path d="M40 60 A 30 30 0 0 1 80 60 Z" fill="#0a1430"/>
      <g transform="translate(135,70)">
        <ellipse class="wing-l" cx="-6" cy="-9" rx="10" ry="6" fill="#bdf0ff" opacity="0.8"/>
        <ellipse class="wing-r" cx="8" cy="-9" rx="10" ry="6" fill="#bdf0ff" opacity="0.8"/>
        <ellipse cx="0" cy="0" rx="18" ry="12" fill="#ffd166"/>
        <rect x="-13" y="-10" width="7" height="20" fill="#1a1a1a" rx="2"/>
        <rect x="-1" y="-11" width="7" height="22" fill="#1a1a1a" rx="2"/>
        <circle cx="15" cy="-3" r="6" fill="#1a1a1a"/>
      </g>
    </svg>`,
    feature: '身體胖胖的，嘴巴像一把小剪刀。',
    nest: '會把樹葉剪成一片片圓形或半圓形，捲起來當作巢室的「牆壁」和「門」，築巢在空心管子或土洞裡。',
    fun: '如果發現院子裡的葉子邊緣被剪出整齊的圓弧缺口，很可能就是切葉蜂來「借」材料蓋房子了！'
  },
  {
    name: '🧱 壁蜂',
    latin: 'Osmia spp.',
    icon: `<svg class="scene" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="#0a1430" rx="12"/>
      <rect x="20" y="40" width="80" height="70" fill="#7a4a22" rx="4"/>
      <circle class="entrance-glow" cx="45" cy="65" r="7" fill="#1a1208"/>
      <circle class="entrance-glow" cx="75" cy="85" r="7" fill="#1a1208"/>
      <circle cx="60" cy="50" r="7" fill="#1a1208"/>
      <g transform="translate(140,70)">
        <ellipse class="wing-l" cx="-6" cy="-9" rx="10" ry="6" fill="#bdf0ff" opacity="0.8"/>
        <ellipse class="wing-r" cx="8" cy="-9" rx="10" ry="6" fill="#bdf0ff" opacity="0.8"/>
        <ellipse cx="0" cy="0" rx="18" ry="12" fill="#00b4d8"/>
        <rect x="-13" y="-10" width="7" height="20" fill="#1a1a1a" rx="2"/>
        <rect x="-1" y="-11" width="7" height="22" fill="#1a1a1a" rx="2"/>
        <circle cx="15" cy="-3" r="6" fill="#1a1a1a"/>
      </g>
    </svg>`,
    feature: '身體常帶有金屬般的藍綠光澤，看起來閃閃發亮。',
    nest: '喜歡利用牆壁縫隙、土壁上的小洞，或現成的空心管築巢，再用泥土把巢室一格一格隔開、封起來。',
    fun: '「壁蜂」的名字就是因為牠常常在土牆、磚牆的小洞裡築巢，是很好的果樹授粉幫手。'
  },
  {
    name: '🪵 木蜂',
    latin: 'Xylocopa spp.',
    icon: `<svg class="scene" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="#0a1430" rx="12"/>
      <rect x="15" y="55" width="90" height="40" fill="#5a3a1f" rx="6"/>
      <ellipse class="entrance-glow" cx="55" cy="75" rx="9" ry="9" fill="#1a1208"/>
      <g transform="translate(140,70)">
        <ellipse class="wing-l" cx="-8" cy="-12" rx="13" ry="8" fill="#bdf0ff" opacity="0.8"/>
        <ellipse class="wing-r" cx="10" cy="-12" rx="13" ry="8" fill="#bdf0ff" opacity="0.8"/>
        <ellipse cx="0" cy="0" rx="24" ry="16" fill="#1a1a2e"/>
        <ellipse cx="-4" cy="0" rx="8" ry="15" fill="#222"/>
        <circle cx="20" cy="-4" r="8" fill="#1a1a1a"/>
      </g>
    </svg>`,
    feature: '台灣最大的蜂之一，全身黑藍色，胸部毛茸茸像顆絨毛球，飛行時聲音很大但不兇。',
    nest: '會用強壯的口器在乾燥的木頭、竹子或木製欄杆上鑽出隧道狀的巢，一間接一間排列。',
    fun: '木蜂飛行聲音大，常讓人以為很可怕，但牠其實非常溫和，通常只是路過巡視自己的「家」。'
  },
  {
    name: '🕳️ 隧蜂',
    latin: 'Halictidae / Andrenidae',
    icon: `<svg class="scene" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="#0a1430" rx="12"/>
      <ellipse cx="55" cy="105" rx="55" ry="14" fill="#3a2410"/>
      <ellipse class="entrance-glow" cx="55" cy="100" rx="10" ry="6" fill="#1a1208"/>
      <g transform="translate(140,70)">
        <ellipse class="wing-l" cx="-6" cy="-8" rx="9" ry="5" fill="#bdf0ff" opacity="0.8"/>
        <ellipse class="wing-r" cx="8" cy="-8" rx="9" ry="5" fill="#bdf0ff" opacity="0.8"/>
        <ellipse cx="0" cy="0" rx="15" ry="10" fill="#00f5a0"/>
        <rect x="-11" y="-8" width="6" height="16" fill="#1a1a1a" rx="2"/>
        <rect x="-1" y="-9" width="6" height="18" fill="#1a1a1a" rx="2"/>
        <circle cx="13" cy="-2" r="5" fill="#1a1a1a"/>
      </g>
    </svg>`,
    feature: '體型比較小，常有金屬綠或銅色的光澤，動作很快。',
    nest: '在鬆軟的泥土地面挖出垂直的小隧道，地面上常能看到像小火山一樣的「土堆」，那就是隧道的入口。',
    fun: '走在校園裸露的泥土地或操場邊，如果看到一個個小土堆中間有洞，可能就是隧蜂的家。'
  },
  {
    name: '🟧 條蜂',
    latin: 'Anthophora spp.',
    icon: `<svg class="scene" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="#0a1430" rx="12"/>
      <path d="M0 110 Q 60 70 140 110 L 200 140 L 0 140 Z" fill="#7a5a35"/>
      <circle class="entrance-glow" cx="70" cy="98" r="6" fill="#1a1208"/>
      <circle class="entrance-glow" cx="100" cy="105" r="6" fill="#1a1208"/>
      <g transform="translate(150,60)">
        <ellipse class="wing-l" cx="-6" cy="-9" rx="10" ry="6" fill="#bdf0ff" opacity="0.8"/>
        <ellipse class="wing-r" cx="8" cy="-9" rx="10" ry="6" fill="#bdf0ff" opacity="0.8"/>
        <ellipse cx="0" cy="0" rx="18" ry="12" fill="#ff9f43"/>
        <rect x="-14" y="-11" width="28" height="5" fill="#1a1a1a" rx="2"/>
        <rect x="-14" y="2" width="28" height="5" fill="#1a1a1a" rx="2"/>
        <circle cx="15" cy="-3" r="6" fill="#1a1a1a"/>
      </g>
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
    explain: '用天然有孔洞的材料做昆蟲旅館，是最友善的幫助方式！' }
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
