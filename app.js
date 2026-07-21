const STORAGE={records:'tanyV13Records',weather:'tanyV13Weather'};
const FARM_LOCATION={name:'姶良市',latitude:31.74,longitude:130.63};
const defaultRecords=[
  {id:1,date:'7月21日',iso:'2026-07-21',crop:'tomato',types:['harvest','photo'],count:6,memo:'赤く熟した実を収穫。甘みが増してきた。',photo:''},
  {id:2,date:'7月20日',iso:'2026-07-20',crop:'watermelon',types:['observe'],count:0,memo:'保護カゴの中で順調。つるも元気。',photo:''},
  {id:3,date:'7月17日',iso:'2026-07-17',crop:'pepper',types:['harvest'],count:2,memo:'小ぶりだが艶のよい実。',photo:''}
];
const crops={
 tomato:{name:'ミニトマト',variety:'アイコ',emoji:'🍅',place:'3畝目',stage:'収穫期',outlook:'あと2週間ほど収穫見込み',next:'採種の準備',caution:'実割れと葉の蒸れに注意',harvest:38,unit:'個',current:2,seedPolicy:'採種する',seedNote:'完熟果から種を取り、洗浄・乾燥して来年へつなぐ',stages:[['植付','5/19','done'],['開花','6/3','done'],['収穫','6/25','current'],['採種','8月中旬','future'],['終了','9月上旬','future']]},
 watermelon:{name:'小玉スイカ',variety:'品種不明',emoji:'🍉',place:'2畝目',stage:'実を育てる時期',outlook:'収穫まであと約1週間',next:'収穫',caution:'食害と接地面を毎回確認',harvest:0,unit:'玉',current:3,seedPolicy:'未定',seedNote:'品種が不明なため、食味と来歴を確認してから判断',stages:[['植付','5/19','done'],['開花','6月下旬','done'],['受粉','7月上旬','done'],['肥大','現在','current'],['収穫','7月下旬','future'],['終了','8月','future']]},
 pepper:{name:'ピーマン',variety:'品種未登録',emoji:'🫑',place:'4畝目',stage:'収穫期',outlook:'秋口まで収穫できる見込み',next:'採種する実を選ぶ',caution:'葉色と水切れを確認',harvest:14,unit:'個',current:2,seedPolicy:'候補',seedNote:'形と生育のよい実を1つ残し、完熟まで育てる',stages:[['植付','5/19','done'],['開花','6月下旬','done'],['収穫','現在','current'],['採種','秋','future'],['終了','11月頃','future']]},
 basil:{name:'バジル',variety:'スイートバジル',emoji:'🌿',place:'1・3・4畝目',stage:'収穫期',outlook:'摘心しながら長く楽しめます',next:'一部を開花させる',caution:'採種用以外の花芽は早めに摘む',harvest:9,unit:'回',current:1,seedPolicy:'採種する',seedNote:'採種用の株だけ花穂を残し、茶色く乾いてから回収',stages:[['植付','5/19','done'],['収穫','現在','current'],['開花','8月頃','future'],['採種','9月頃','future'],['終了','秋','future']]},
 shiso:{name:'青じそ',variety:'青じそ',emoji:'🌱',place:'1畝目',stage:'収穫期',outlook:'大きな葉から継続収穫',next:'穂を残して採種',caution:'採種用の株・枝を決めておく',harvest:7,unit:'回',current:1,seedPolicy:'採種する',seedNote:'元気な株の穂を残し、こぼれる前に採る',stages:[['植付','5/19','done'],['収穫','現在','current'],['開花','秋','future'],['採種','秋','future'],['終了','晩秋','future']]},
 kushinsai:{name:'空芯菜',variety:'空芯菜',emoji:'🥬',place:'5畝目',stage:'生育中',outlook:'草丈が伸びれば順次収穫',next:'初収穫',caution:'乾燥させすぎない',harvest:0,unit:'回',current:1,seedPolicy:'今回はしない',seedNote:'Version1では収穫を優先し、採種工程は表示しない',stages:[['種まき','6月','done'],['生育','現在','current'],['収穫','これから','future'],['終了','秋','future']]}
};
const state={route:'home',history:[],selectedCrop:'tomato',recordDraft:{crop:'tomato',types:['harvest'],count:1,memo:'',photo:''},selectedRecord:null,records:read(STORAGE.records,defaultRecords)};
const $=s=>document.querySelector(s),main=$('#main'),header=$('#appHeader'),tabbar=$('#tabbar');
function read(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):structuredClone(f)}catch{return structuredClone(f)}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function iconCamera(){return `<svg viewBox="0 0 24 24"><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11h18V7a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="4"/></svg>`}
function timelineHTML(c,compact=false){
  const n=c.stages.length;
  return `<div class="life-cycle ${compact?'compact':''}" style="--steps:${n};--current:${n>1?c.current/(n-1):0}">${c.stages.map((st,i)=>`<div class="life-step ${st[2]}"><span class="life-dot">${st[2]==='done'?'✓':st[2]==='current'?'●':'○'}</span><span class="life-name">${st[0]}</span>${compact?'':`<small>${st[1]}</small>`}</div>`).join('')}</div>`;
}
function stageDetailHTML(c){return `<div id="stageDetails" class="stage-details hidden"><div class="stage-detail-head"><strong>栽培カレンダー詳細</strong><button id="closeStage" aria-label="閉じる">×</button></div>${c.stages.map(st=>`<div class="stage-detail-row ${st[2]}"><span>${st[2]==='done'?'✓':st[2]==='current'?'●':'○'}</span><strong>${st[0]}</strong><time>${st[1]}</time></div>`).join('')}<div class="seed-plan"><span>来年へつなぐ</span><strong>${c.seedPolicy}</strong><p>${c.seedNote}</p></div><p>日付は現在の記録から見た目安です。品種や天候で前後します。</p></div>`}
function init(){setTimeout(()=>{const s=$('#splash');s.style.opacity=0;setTimeout(()=>s.remove(),360);header.classList.remove('hidden');main.classList.remove('hidden');tabbar.classList.remove('hidden');render()},430);document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>navigate(b.dataset.tab,true));$('#settingsButton').onclick=()=>navigate('settings');$('#backButton').onclick=back}
function navigate(route,root=false,data={}){if(!root)state.history.push(state.route);else state.history=[];state.route=route;Object.assign(state,data);window.scrollTo({top:0,behavior:'instant'});render()}
function back(){state.route=state.history.pop()||'home';render()}
function title(r){return({home:'Home',crops:'栽培',cropDetail:'栽培',records:'記録',recordNew:'今日の記録',recordDetail:'記録',library:'図鑑',libraryCrop:'育った物語',settings:'設定',aiSettings:'AI設定',privacy:'データとプライバシー',appearance:'表示'})[r]||''}
function render(){const root=['home','crops','records','library'].includes(state.route);$('#pageTitle').textContent=title(state.route);$('#backButton').classList.toggle('hidden',root);$('#settingsButton').classList.toggle('hidden',state.route!=='home');tabbar.classList.toggle('hidden',!root);document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.route));const fn={home:renderHome,crops:renderCrops,cropDetail:renderCropDetail,records:renderRecords,recordNew:renderRecordNew,recordDetail:renderRecordDetail,library:renderLibrary,libraryCrop:renderLibraryCrop,settings:renderSettings,aiSettings:renderAISettings,privacy:renderPrivacy,appearance:renderAppearance}[state.route];fn()}
function renderHome(){
  const hour=new Date().getHours();
  const greeting=hour<11?'おはようございます。':hour<17?'こんにちは。':'おつかれさまです。';
  main.innerHTML=`
  <section class="home-brand" aria-label="tany農園のシンボル">
    <div class="symbol-frame"><img src="assets/tanimans-illustration.jpg" alt="手をつないだ夫婦の手描きイラスト"></div>
    <div class="brand-greeting"><span class="season-pill">夏のtany農園</span><h2>${greeting}</h2><p>今日も畑と、いい時間を。</p></div>
  </section>
  <section id="weatherCard" class="weather-card" aria-live="polite">
    <div class="weather-loading"><span class="weather-icon">◌</span><div><strong>${FARM_LOCATION.name}の天気を確認中</strong><small>最新情報を読み込んでいます</small></div></div>
  </section>
  <section class="hero-card home-message">
    <div class="hero-copy"><span class="hero-label">✉️ 畑のお便り</span><h3>トマトが、また少し赤くなっています。</h3><p>朝の涼しいうちに、実の色を見に行くのが楽しみです。</p></div>
  </section>
  <div class="section-title"><h2>今日の楽しみ</h2><p>見るだけでも大丈夫</p></div>
  <section class="enjoy-grid">
    <button class="enjoy-card" data-crop="tomato"><span class="emoji">🍅</span><strong>トマトの収穫</strong><span>赤く熟した実を探す</span></button>
    <button class="enjoy-card" data-crop="watermelon"><span class="emoji">🍉</span><strong>スイカの確認</strong><span>収穫まであと少し</span></button>
  </section>
  <div class="section-title"><h2>今日を残す</h2><p>記録画面へ</p></div>
  <button id="quickRecord" class="quick-record"><span class="round-icon">${iconCamera()}</span><span><strong>今日の記録を残す</strong><small>収穫・作業・写真・メモ</small></span><span class="chev">›</span></button>`;
  main.querySelectorAll('[data-crop]').forEach(b=>b.onclick=()=>navigate('cropDetail',false,{selectedCrop:b.dataset.crop}));
  $('#quickRecord').onclick=()=>startRecord();
  loadWeather();
}
function weatherText(code){
  if(code===0)return['☀️','晴れ'];
  if([1,2].includes(code))return['🌤️','晴れ時々くもり'];
  if(code===3)return['☁️','くもり'];
  if([45,48].includes(code))return['🌫️','霧'];
  if([51,53,55,56,57].includes(code))return['🌦️','霧雨'];
  if([61,63,65,66,67,80,81,82].includes(code))return['🌧️','雨'];
  if([71,73,75,77,85,86].includes(code))return['🌨️','雪'];
  if([95,96,99].includes(code))return['⛈️','雷雨'];
  return['🌿','天気'];
}
function weatherAdvice(w){
  const rain=w.daily.precipitation_probability_max?.[0]??0;
  const max=w.daily.temperature_2m_max?.[0];
  const wind=w.current.wind_speed_10m??0;
  if(rain>=70)return'雨の可能性が高めです。水やりは空の様子を見てから。';
  if(max>=33)return'暑さが厳しい予報です。作業は朝夕の涼しい時間に。';
  if(wind>=25)return'風が強めです。支柱やネットの緩みを確認しましょう。';
  if(rain<=20&&max>=28)return'乾きやすい一日です。土の中まで指で確認すると安心です。';
  return'畑をゆっくり見られそうな一日です。';
}
function renderWeather(w){
  const card=$('#weatherCard'); if(!card)return;
  const [icon,label]=weatherText(w.current.weather_code);
  const updated=new Date(w.current.time);
  const stamp=`${String(updated.getHours()).padStart(2,'0')}:${String(updated.getMinutes()).padStart(2,'0')}更新`;
  const max=Math.round(w.daily.temperature_2m_max?.[0]);
  const min=Math.round(w.daily.temperature_2m_min?.[0]);
  const rain=Math.round(w.daily.precipitation_probability_max?.[0]??0);
  card.innerHTML=`<div class="weather-main"><span class="weather-icon">${icon}</span><div class="weather-now"><span>${FARM_LOCATION.name}・${stamp}</span><strong>${label} <b>${Math.round(w.current.temperature_2m)}°</b></strong><small>体感 ${Math.round(w.current.apparent_temperature)}°</small></div><div class="weather-range"><strong>${max}°</strong><span>${min}°</span></div></div><div class="weather-meta"><span>降水 ${rain}%</span><span>湿度 ${Math.round(w.current.relative_humidity_2m)}%</span><span>風 ${Math.round(w.current.wind_speed_10m)}km/h</span></div><p class="weather-advice">${weatherAdvice(w)}</p>`;
}
async function loadWeather(force=false){
  const cached=read(STORAGE.weather,null);
  if(cached?.data&&Date.now()-cached.savedAt<15*60*1000&&!force){renderWeather(cached.data);return}
  const params=new URLSearchParams({latitude:FARM_LOCATION.latitude,longitude:FARM_LOCATION.longitude,current:'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',timezone:'Asia/Tokyo',forecast_days:'2'});
  try{
    const res=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`,{cache:'no-store'});
    if(!res.ok)throw new Error('weather');
    const data=await res.json();
    write(STORAGE.weather,{savedAt:Date.now(),data}); renderWeather(data);
  }catch{
    const card=$('#weatherCard'); if(!card)return;
    if(cached?.data){renderWeather(cached.data);card.insertAdjacentHTML('beforeend','<small class="weather-offline">通信できないため、前回の天気を表示しています。</small>')}
    else card.innerHTML='<button id="retryWeather" class="weather-retry"><span>🌥️</span><div><strong>天気を取得できませんでした</strong><small>タップして再読み込み</small></div></button>';
    $('#retryWeather')?.addEventListener('click',()=>loadWeather(true));
  }
}
function renderCrops(){main.innerHTML=`<section class="greeting"><h2>今、どこまで育った？</h2><p>現在地と、これから残っている工程を一目で確認できます。</p></section><section class="crop-list">${Object.entries(crops).map(([id,c])=>`<button class="crop-row" data-crop="${id}"><span class="crop-visual">${c.emoji}</span><span><span class="stage">${c.stage}</span><h3>${c.name}</h3><p>${c.variety}・${c.place}</p>${timelineHTML(c,true)}<small class="next-stage">次：${c.next} ・ 残り${Math.max(0,c.stages.length-c.current-1)}工程</small></span><span class="chev">›</span></button>`).join('')}</section>`;main.querySelectorAll('[data-crop]').forEach(b=>b.onclick=()=>navigate('cropDetail',false,{selectedCrop:b.dataset.crop}))}
function renderCropDetail(){const c=crops[state.selectedCrop];const total=c.harvest+state.records.filter(r=>r.crop===state.selectedCrop&&r.types.includes('harvest')&&r.id>10).reduce((sum,r)=>sum+(r.count||0),0);main.innerHTML=`<section class="card detail-hero crop-detail-head"><div class="big-emoji">${c.emoji}</div><span class="stage">${c.stage}</span><h2>${c.name}</h2><p>${c.variety}・${c.place}</p></section><section class="card calendar-card"><div class="calendar-title"><div><span>🌱 栽培カレンダー</span><strong>今と、これから</strong></div><button id="openStage">詳細</button></div>${timelineHTML(c)}<div class="calendar-summary"><div><span>現在</span><strong>${c.stage}</strong></div><div><span>次の節目</span><strong>${c.next}</strong></div><div><span>残り工程</span><strong>${Math.max(0,c.stages.length-c.current-1)}つ</strong></div></div>${stageDetailHTML(c)}</section><section class="card harvest-total"><span>累計収穫</span><strong>${total}${c.unit}</strong><small>${c.outlook}</small></section><section class="card gentle-tip"><span>ワンポイント</span><p>${c.caution}</p></section><div class="button-stack"><button id="recordCrop" class="primary full">この作物を記録する</button><button id="storyCrop" class="secondary full">育った物語を見る</button></div>`;
  $('#openStage').onclick=()=>{$('#stageDetails').classList.remove('hidden');$('#openStage').classList.add('hidden')};
  $('#closeStage').onclick=()=>{$('#stageDetails').classList.add('hidden');$('#openStage').classList.remove('hidden')};
  $('#recordCrop').onclick=()=>startRecord(state.selectedCrop);$('#storyCrop').onclick=()=>navigate('libraryCrop',false,{selectedCrop:state.selectedCrop})}
function renderRecords(){main.innerHTML=`<section class="greeting records-head"><div><h2>何をやった？</h2><p>保存した作業、収穫、写真、気づきを時間の順に振り返ります。</p></div><button id="newRecord" class="compact-add" aria-label="新しい記録を追加">＋<span>記録</span></button></section><div class="section-title"><h2>最近の記録</h2><p>${state.records.length}件</p></div><section class="record-list">${state.records.length?state.records.map(r=>recordRow(r)).join(''):`<div class="card empty"><div class="emoji">📝</div><h3>まだ記録がありません</h3><p>収穫だけでなく、花が咲いた日や虫を見つけた日も、大切な記録です。</p></div>`}</section>`;$('#newRecord').onclick=()=>startRecord();main.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>navigate('recordDetail',false,{selectedRecord:state.records.find(r=>String(r.id)===b.dataset.record)}))}
function recordRow(r){const c=crops[r.crop]||{emoji:'🌱',name:'農園'};const label=r.types.includes('harvest')?`${c.name}を${r.count}${c.unit||'個'}収穫`:r.types.includes('work')?`${c.name}の作業`:`${c.name}を観察`;return `<button class="record-item" data-record="${r.id}"><span class="record-thumb">${r.photo?`<img src="${r.photo}" alt="記録写真">`:c.emoji}</span><span><time>${r.date}</time><h3>${label}</h3><p>${esc(r.memo||'今日の記録を残しました')}</p></span><span>›</span></button>`}
function startRecord(crop='tomato'){state.recordDraft={crop,types:['harvest'],count:1,memo:'',photo:''};navigate('recordNew')}
function renderRecordNew(){const d=state.recordDraft;main.innerHTML=`<section class="card form-card"><h2>今日は何を残しますか？</h2><div class="field"><label>記録の種類</label><div class="choice-grid">${[['harvest','🍅','収穫'],['work','🧤','作業'],['observe','✨','発見']].map(x=>`<button class="choice ${d.types.includes(x[0])?'selected':''}" data-type="${x[0]}"><span>${x[1]}</span><strong>${x[2]}</strong></button>`).join('')}</div></div><div class="field"><label>作物</label><select id="cropSelect">${Object.entries(crops).map(([id,c])=>`<option value="${id}" ${d.crop===id?'selected':''}>${c.emoji} ${c.name}</option>`).join('')}</select></div><div class="field ${d.types.includes('harvest')?'':'hidden'}" id="countField"><label>収穫数</label><div class="counter"><button id="minus">−</button><strong id="count">${d.count}</strong><button id="plus">＋</button></div></div><div class="field"><label>写真（任意）</label><label class="photo-picker"><input id="photoInput" type="file" accept="image/*" capture="environment"><span>${d.photo?'写真を変更する':'📷 写真を撮る・選ぶ'}</span></label>${d.photo?`<div class="photo-preview"><img src="${d.photo}" alt="選択した写真"></div>`:''}</div><div class="field"><label>一言メモ（任意）</label><textarea id="memo" placeholder="例：今年初めて花が咲いた">${esc(d.memo)}</textarea></div></section><div class="save-bar"><button id="saveRecord" class="primary full">今日の記録を保存</button></div>`;
  main.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{d.types=[b.dataset.type];d.memo=$('#memo').value;d.crop=$('#cropSelect').value;renderRecordNew()});
  $('#cropSelect').onchange=e=>d.crop=e.target.value;
  if($('#minus'))$('#minus').onclick=()=>{$('#count').textContent=d.count=Math.max(1,d.count-1)};
  if($('#plus'))$('#plus').onclick=()=>{$('#count').textContent=++d.count};
  $('#memo').oninput=e=>d.memo=e.target.value;
  $('#photoInput').onchange=e=>compress(e.target.files[0],data=>{d.photo=data;renderRecordNew()});
  $('#saveRecord').onclick=saveRecord;
}
function saveRecord(){const d=state.recordDraft,now=new Date(),type=d.types[0];state.records.unshift({id:Date.now(),date:`${now.getMonth()+1}月${now.getDate()}日`,iso:now.toISOString().slice(0,10),crop:d.crop,types:[type],count:type==='harvest'?d.count:0,memo:$('#memo').value.trim(),photo:d.photo});write(STORAGE.records,state.records);renderDone()}
function renderDone(){const d=state.recordDraft,c=crops[d.crop];tabbar.classList.add('hidden');$('#backButton').classList.add('hidden');main.innerHTML=`<section class="done-screen"><div class="leaf">🌱</div><h2>今日も、<br>ありがとうございました。</h2><p>畑で過ごした時間を、記録に残しました。</p><div class="done-summary"><strong>${c.emoji} ${c.name}</strong><p>${d.types.includes('harvest')?`${d.count}${c.unit}を収穫`:(d.types.includes('work')?'作業を記録':'今日の発見を記録')}</p></div><button id="finishRecord" class="primary full">記録を見る</button></section>`;$('#finishRecord').onclick=()=>navigate('records',true)}
function renderRecordDetail(){const r=state.selectedRecord,c=crops[r.crop];main.innerHTML=`<section class="card form-card"><span class="stage">${r.date}</span><h2 style="margin-top:12px">${c.emoji} ${c.name}</h2>${r.photo?`<div class="photo-preview"><img src="${r.photo}" alt="記録写真"></div>`:''}<dl class="fact-grid" style="margin-top:18px"><div class="fact"><dt>種類</dt><dd>${r.types.includes('harvest')?'収穫':r.types.includes('work')?'作業':'発見'}</dd></div><div class="fact"><dt>数量</dt><dd>${r.types.includes('harvest')?`${r.count}${c.unit}`:'—'}</dd></div><div class="fact full"><dt>メモ</dt><dd>${esc(r.memo||'メモはありません')}</dd></div></dl><div class="button-stack"><button id="deleteRecord" class="danger full">この記録を削除</button></div></section>`;$('#deleteRecord').onclick=()=>{if(confirm('この記録を削除しますか？')){state.records=state.records.filter(x=>x.id!==r.id);write(STORAGE.records,state.records);navigate('records',true);toast('記録を削除しました')}}}
function renderLibrary(){main.innerHTML=`<section class="card library-cover"><div class="cover-art"><span class="book-emoji">📖</span></div><div class="cover-copy"><span>TANY FARM STORY</span><h2>育った物語</h2><p>野菜の成長、写真、収穫、学びが、少しずつ自分たちだけの図鑑になります。</p></div></section><div class="section-title"><h2>今季の作物</h2><p>${Object.keys(crops).length}種類</p></div><section class="library-grid">${Object.entries(crops).map(([id,c])=>`<button class="library-card" data-library="${id}"><span class="emoji">${c.emoji}</span><h3>${c.name}</h3><p>${c.harvest}${c.unit}の収穫記録<br>${c.stage}</p></button>`).join('')}</section>`;main.querySelectorAll('[data-library]').forEach(b=>b.onclick=()=>navigate('libraryCrop',false,{selectedCrop:b.dataset.library}))}
function renderLibraryCrop(){const c=crops[state.selectedCrop],records=state.records.filter(r=>r.crop===state.selectedCrop);main.innerHTML=`<section class="card detail-hero"><div class="big-emoji">${c.emoji}</div><span class="stage">2026年</span><h2>${c.name}</h2><p>${c.variety}</p></section><section class="card"><dl class="fact-grid"><div class="fact"><dt>栽培場所</dt><dd>${c.place}</dd></div><div class="fact"><dt>現在</dt><dd>${c.stage}</dd></div><div class="fact"><dt>累計収穫</dt><dd>${c.harvest}${c.unit}</dd></div><div class="fact"><dt>記録</dt><dd>${records.length}件</dd></div><div class="fact full"><dt>今年の学び</dt><dd>${c.caution}</dd></div></dl></section><div class="section-title"><h2>成長の記録</h2><p>${records.length}件</p></div><section class="record-list">${records.length?records.map(recordRow).join(''):`<div class="card empty"><div class="emoji">🌿</div><h3>これから育つ物語</h3><p>この作物の記録を残すと、ここに並びます。</p></div>`}</section>`;main.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>navigate('recordDetail',false,{selectedRecord:state.records.find(r=>String(r.id)===b.dataset.record)}))}
function renderSettings(){main.innerHTML=`<section class="card"><div class="settings-group"><button class="setting-row" data-settings="appearance"><span><strong>表示</strong><span>文字や季節の演出</span></span><span class="chev">›</span></button><button class="setting-row" data-settings="privacy"><span><strong>データとプライバシー</strong><span>保存場所、共有、削除について</span></span><span class="chev">›</span></button></div></section><section class="card" style="margin-top:14px"><p class="privacy-note">このデモの記録と写真は、現在使っている端末のブラウザ内だけに保存されます。外部送信や夫婦間同期は行いません。</p><button id="resetData" class="danger full">テストデータを初期化</button></section><button class="ai-subtle" data-settings="aiSettings"><span>補助機能</span><small>AIについて</small><b>›</b></button>`;main.querySelectorAll('[data-settings]').forEach(b=>b.onclick=()=>navigate(b.dataset.settings));$('#resetData').onclick=()=>{if(confirm('記録を初期状態に戻しますか？')){localStorage.removeItem(STORAGE.records);state.records=structuredClone(defaultRecords);toast('初期状態に戻しました')}}}
function renderAISettings(){main.innerHTML=`<section class="card form-card"><h2>AIは、静かな相棒です。</h2><p class="privacy-note">命令したり、不安をあおったりせず、記録や天気をもとに短い提案をします。判断するのは、いつも人です。</p><dl class="fact-grid" style="margin-top:16px"><div class="fact full"><dt>使う情報</dt><dd>作物、栽培段階、過去の記録、必要に応じて天気</dd></div><div class="fact full"><dt>使わない情報</dt><dd>連絡先、位置情報、他のアプリの内容</dd></div><div class="fact full"><dt>言葉の方針</dt><dd>短く、やさしく、根拠を示し、最終判断を任せる</dd></div></dl></section>`}
function renderPrivacy(){main.innerHTML=`<section class="card form-card"><h2>データの扱い</h2><dl class="fact-grid"><div class="fact full"><dt>現在の保存場所</dt><dd>この端末のブラウザ内</dd></div><div class="fact full"><dt>外部送信</dt><dd>このデモでは行いません</dd></div><div class="fact full"><dt>共有・同期</dt><dd>まだありません</dd></div><div class="fact full"><dt>削除</dt><dd>設定画面の「テストデータを初期化」から削除できます</dd></div></dl></section>`}
function renderAppearance(){main.innerHTML=`<section class="card form-card"><h2>表示</h2><div class="settings-group"><div class="setting-row"><span><strong>季節の空気</strong><span>春・夏・秋・冬でHomeの言葉と景色を変える</span></span><span>夏</span></div><div class="setting-row"><span><strong>文字サイズ</strong><span>畑でも読みやすい標準サイズ</span></span><span>標準</span></div><div class="setting-row"><span><strong>動き</strong><span>控えめなアニメーション</span></span><span>ON</span></div></div></section>`}
function compress(file,done){if(!file)return;const r=new FileReader();r.onerror=()=>toast('写真を読み込めませんでした');r.onload=()=>{const img=new Image();img.onload=()=>{const max=1100,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);done(c.toDataURL('image/jpeg',.74))};img.src=r.result};r.readAsDataURL(file)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
init();
