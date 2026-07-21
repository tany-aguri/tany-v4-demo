const state = {
  route: 'home', history: [], selectedCrop: 'tomato', harvestCount: 3,
  tasks: JSON.parse(localStorage.getItem('tanyTasks') || '[false,false,false]'),
  journal: JSON.parse(localStorage.getItem('tanyJournal') || '[]')
};

const crops = {
  tomato:{name:'ミニトマト', variety:'アイコ', emoji:'🍅', status:'収穫中', progress:72, place:'3畝目', harvest:24, weight:'1.2kg', seed:'未', advice:'赤く熟した実から順に収穫。葉の混み合いだけ確認しましょう。'},
  watermelon:{name:'小玉スイカ', variety:'品種不明', emoji:'🍉', status:'生育中', progress:58, place:'2畝目', harvest:0, weight:'—', seed:'未', advice:'実の保護を優先。巻きひげと接地面を確認しましょう。'},
  pepper:{name:'ピーマン', variety:'京みどり', emoji:'🫑', status:'収穫中', progress:67, place:'4畝目', harvest:11, weight:'620g', seed:'未', advice:'株を疲れさせないよう、小さめでもこまめに収穫します。'},
  basil:{name:'バジル', variety:'スイートバジル', emoji:'🌿', status:'生育中', progress:46, place:'1・3・4畝目', harvest:8, weight:'—', seed:'予定', advice:'花芽の前に先端を摘むと、脇芽が増えて長く楽しめます。'}
};
const $ = s => document.querySelector(s);
const main = $('#main'), header = $('#appHeader'), tabbar = $('#tabbar');

function init(){
  setTimeout(()=>{ $('#splash').style.opacity=0; setTimeout(()=>$('#splash').remove(),350); header.classList.remove('hidden'); main.classList.remove('hidden'); tabbar.classList.remove('hidden'); render(); },900);
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>navigate(b.dataset.tab,true));
  $('#settingsButton').onclick=()=>navigate('settings');
  $('#backButton').onclick=goBack;
}
function navigate(route, root=false, data){
  if(!root) state.history.push(state.route); else state.history=[];
  state.route=route; if(data) Object.assign(state,data); window.scrollTo(0,0); render();
}
function goBack(){ state.route=state.history.pop() || 'home'; render(); }
function titleFor(r){return ({home:'Home',crops:'栽培',cropDetail:'栽培詳細',harvest:'収穫入力',footprint:'足あと',journal:'日誌',library:'図鑑',settings:'設定'})[r]}
function render(){
  $('#pageTitle').textContent=titleFor(state.route); const isRoot=['home','crops','journal','library'].includes(state.route);
  $('#backButton').classList.toggle('hidden',isRoot); $('#settingsButton').classList.toggle('hidden',state.route!=='home'); tabbar.classList.toggle('hidden',!isRoot);
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.route));
  ({home:renderHome,crops:renderCrops,cropDetail:renderCropDetail,harvest:renderHarvest,footprint:renderFootprint,journal:renderJournal,library:renderLibrary,settings:renderSettings})[state.route]();
}
function renderHome(){
  main.innerHTML=`
    <section class="greeting"><h2>おはようございます</h2><p>7月21日・tany農園の今日を確認しましょう。</p></section>
    <section class="card tany-card">
      <div class="tany-head"><div class="mascot" aria-label="tany仮キャラクター"><i class="stem"></i><i class="leaf-a"></i><i class="leaf-b"></i><div class="face"><i class="smile"></i></div></div><div class="tany-copy"><span class="badge">tanyから</span><h2>朝の涼しいうちに収穫しよう</h2><p>トマトとピーマンを先に確認。水やりは土の乾きを見てからで大丈夫です。</p></div></div>
      <div class="today-status"><div class="status-pill"><b>晴れ・31℃</b><span>降水10%</span></div><div class="status-pill"><b>収穫 2種</b><span>おすすめ</span></div><div class="status-pill"><b>作業 3件</b><span>${state.tasks.filter(Boolean).length}件完了</span></div></div>
    </section>
    <button id="quickHarvest" class="quick-action"><span class="qa-icon">収</span><span><strong>収穫を記録する</strong><small>ミニトマト・約30秒</small></span><span class="arrow">›</span></button>
    <div class="section-head"><h2>今日やること</h2><span class="tiny muted">${state.tasks.filter(Boolean).length}/3 完了</span></div>
    <section class="card task-card">${['トマトとピーマンを収穫','スイカの実と保護カゴを確認','乾いている株だけ水やり'].map((t,i)=>`<label class="task"><input type="checkbox" data-task="${i}" ${state.tasks[i]?'checked':''}><span><strong>${t}</strong><span>${i===0?'朝の涼しい時間に':i===1?'食害と接地面を見る':'表土と葉の様子で判断'}</span></span></label>`).join('')}</section>
    <div class="section-head"><h2>今日の一枚</h2><span class="tiny muted">7月21日</span></div>
    <section class="hero-photo"><div><strong>夏の畑が色づいてきた</strong><p>写真を中心に、今日の農園を残します。</p><span class="version-chip">v5 仮ビジュアル</span></div></section>`;
  $('#quickHarvest').onclick=()=>{state.selectedCrop='tomato';state.harvestCount=3;navigate('harvest')};
  main.querySelectorAll('[data-task]').forEach(el=>el.onchange=()=>{state.tasks[+el.dataset.task]=el.checked;localStorage.setItem('tanyTasks',JSON.stringify(state.tasks));renderHome();toast('今日やることを更新しました')});
}
function renderCrops(){
  main.innerHTML=`<p class="muted tiny">現在育てている作物の状態と、次の見通しを確認します。</p><div class="crop-grid">${Object.entries(crops).map(([id,c])=>`<button class="crop-card" data-crop="${id}"><div class="crop-photo">${c.emoji}</div><div class="crop-body"><span class="badge">${c.status}</span><h3>${c.name}</h3><p>${c.variety}</p><div class="progress"><i style="width:${c.progress}%"></i></div><div class="progress-label"><span>栽培の循環</span><span>${c.progress}%</span></div></div></button>`).join('')}</div>`;
  main.querySelectorAll('[data-crop]').forEach(b=>b.onclick=()=>navigate('cropDetail',false,{selectedCrop:b.dataset.crop}));
}
function renderCropDetail(){
  const c=crops[state.selectedCrop]; const stages=['種まき','発芽','生育','開花','収穫','採種','片付け','土づくり']; const current=Math.min(4,Math.floor(c.progress/17));
  main.innerHTML=`
   <section class="card detail-hero"><div class="detail-emoji">${c.emoji}</div><span class="badge">${c.status}</span><h2>${c.name}</h2><p>${c.variety}・${c.place}</p></section>
   <section class="card"><h2>いまの位置</h2><div class="lifecycle">${stages.map((s,i)=>`<div class="stage ${i<current?'done':i===current?'current':''}"><b>${i<current?'✓':i+1}</b>${s}</div>`).join('')}</div><p class="notice" style="margin-top:14px">次の見通し：収穫を続けながら、元気な実と株の状態を記録します。</p></section>
   <section class="card ai-suggestion"><div class="ai-label">tanyの提案・未保存</div><p>${c.advice}</p><div class="notice">提案は記録と分離されています。この内容が自動で保存・変更されることはありません。</div></section>
   <section class="card"><h2>これまでの実績</h2><div class="stats"><div class="stat"><strong>${c.harvest}</strong><span>収穫数</span></div><div class="stat"><strong>${c.weight}</strong><span>重量</span></div><div class="stat"><strong>${c.seed}</strong><span>採種</span></div></div></section>
   <button id="addHarvest" class="primary full">＋ 収穫を記録</button>`;
  $('#addHarvest').onclick=()=>{state.harvestCount=3;navigate('harvest')};
}
function renderHarvest(){const c=crops[state.selectedCrop];main.innerHTML=`
  <section class="card"><span class="badge">${c.name}</span><h2 style="margin-top:12px">今日の収穫数</h2><div class="counter"><button id="minus">−</button><strong id="count">${state.harvestCount}</strong><button id="plus">＋</button></div><div class="form-group"><label>写真（任意）</label><button class="ghost full" id="photoBtn">📷 写真を選ぶ</button></div><div class="form-group"><label>短いメモ（任意）</label><input id="harvestMemo" placeholder="例：よく熟していた" maxlength="60"></div></section>
  <section class="card ai-suggestion"><div class="ai-label">保存前の確認</div><p class="tiny">AIの提案ではなく、あなたが確認した内容だけを正式記録として保存します。</p></section>
  <div class="modal-actions"><button id="saveHarvest" class="primary full">収穫を保存</button></div>`;
  $('#minus').onclick=()=>{state.harvestCount=Math.max(0,state.harvestCount-1);$('#count').textContent=state.harvestCount}; $('#plus').onclick=()=>{state.harvestCount++;$('#count').textContent=state.harvestCount}; $('#photoBtn').onclick=()=>toast('デモでは写真選択を省略しています');
  $('#saveHarvest').onclick=()=>{const rec={id:Date.now(),crop:state.selectedCrop,count:state.harvestCount,memo:$('#harvestMemo').value,date:'7月21日',footprint:''};state.journal.unshift(rec);localStorage.setItem('tanyJournal',JSON.stringify(state.journal));state.currentRecord=rec.id;navigate('footprint');};
}
function renderFootprint(){main.innerHTML=`
  <section class="card"><div class="tany-head"><div class="mascot" style="transform:scale(.72);transform-origin:left center"><i class="stem"></i><i class="leaf-a"></i><i class="leaf-b"></i><div class="face"><i class="smile"></i></div></div><div><h2>足あとを添えますか？</h2><p class="tiny muted">任意です。書かなくても収穫記録は保存済みです。</p></div></div><div class="form-group" style="margin-top:18px"><label>一言</label><textarea id="footText" maxlength="80" placeholder="例：妻と一緒に収穫できた"></textarea></div><label class="tiny muted">候補から選ぶ</label><div class="chips" style="margin-top:8px">${['妻と収穫','今年初収穫','おすそ分け','雨上がり'].map(x=>`<button class="chip">${x}</button>`).join('')}</div></section>
  <div class="button-row modal-actions"><button id="skipFoot" class="ghost">今は追加しない</button><button id="saveFoot" class="primary">足あとを保存</button></div>`;
  main.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{main.querySelectorAll('.chip').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('#footText').value=b.textContent});
  $('#skipFoot').onclick=()=>{toast('収穫記録を保存しました');navigate('journal',true)}; $('#saveFoot').onclick=()=>{const r=state.journal.find(x=>x.id===state.currentRecord);if(r)r.footprint=$('#footText').value.trim();localStorage.setItem('tanyJournal',JSON.stringify(state.journal));toast('足あとを保存しました');navigate('journal',true)};
}
function renderJournal(){
  const demo=[{crop:'tomato',count:6,date:'7月17日',memo:'朝に収穫',footprint:'妻と一緒に収穫。赤い実が増えて嬉しい。'},{crop:'pepper',count:3,date:'7月16日',memo:'葉の様子も確認',footprint:'友人へおすそ分け。'}]; const all=[...state.journal,...demo];
  main.innerHTML=`<p class="muted tiny">写真・収穫・作業・足あとを、日付順に振り返ります。</p>${all.map(r=>{const c=crops[r.crop];return `<article class="card timeline-card"><div class="datebox"><strong>${r.date.replace('月','/').replace('日','').split('/').pop()}</strong><span>${r.date.includes('月')?r.date.split('月')[0]+'月':'今日'}</span></div><div><span class="badge">収穫 ${r.count}個</span><h2 style="margin:8px 0 0">${c.name}</h2><div class="journal-photo">${c.emoji}</div>${r.memo?`<p class="tiny muted">${escapeHtml(r.memo)}</p>`:''}${r.footprint?`<div class="footprint">👣 ${escapeHtml(r.footprint)}</div>`:''}</div></article>`}).join('')}`;
}
function renderLibrary(){main.innerHTML=`<p class="muted tiny">一般知識ではなく、tany農園で得た経験を「来年の自分」へ残します。</p>${Object.entries(crops).map(([id,c])=>`<button class="card library-item full" data-lib="${id}" style="border:1px solid var(--line);text-align:left"><div class="library-icon">${c.emoji}</div><div><h3>${c.name} <span class="tiny muted">${c.variety}</span></h3><p>2026年・収穫 ${c.harvest}個・採種 ${c.seed}</p><p style="margin-top:5px;color:var(--leaf)">来年へのメモを見る ›</p></div></button>`).join('')}`;main.querySelectorAll('[data-lib]').forEach(b=>b.onclick=()=>{const c=crops[b.dataset.lib];main.innerHTML=`<section class="card detail-hero"><div class="detail-emoji">${c.emoji}</div><h2>${c.name}</h2><p>${c.variety}・2026年</p></section><section class="card"><h2>うまくいったこと</h2><p>こまめに観察し、収穫適期を逃さず記録できた。</p></section><section class="card"><h2>失敗したこと</h2><p>暑い時期は葉や実の変化を見落としやすかった。</p></section><section class="card"><h2>来年へのメモ</h2><p>${c.advice}</p></section>`;$('#pageTitle').textContent='図鑑詳細';$('#backButton').classList.remove('hidden');state.history.push('library');state.route='libraryDetail';});}
function renderSettings(){main.innerHTML=`
  <section class="card"><h2>農園情報</h2><div class="setting-row"><div><strong>農園名</strong><span>tany農園</span></div><span>›</span></div><div class="setting-row"><div><strong>地域</strong><span>鹿児島県姶良市</span></div><span>›</span></div></section>
  <section class="card"><h2>通知</h2><div class="setting-row"><div><strong>朝の確認</strong><span>今日やることを知らせる</span></div><button class="toggle on" aria-label="通知切替"></button></div></section>
  <section class="card"><h2>データ</h2><div class="setting-row"><div><strong>データ出力・バックアップ</strong><span>JSON / CSV / 画像（MVP想定）</span></div><span>›</span></div><div class="setting-row"><div><strong>プライバシー</strong><span>収集・AI送信範囲を確認</span></div><span>›</span></div></section>
  <section class="card ai-suggestion"><div class="ai-label">AI設定について</div><p class="tiny">AIプロバイダーの選択は後続版です。正式記録はアプリ側に保持し、AI提案とは分離します。</p></section>`;main.querySelectorAll('.toggle').forEach(b=>b.onclick=()=>b.classList.toggle('on'));}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function escapeHtml(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
init();
