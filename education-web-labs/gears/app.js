// ==========================================================================
// ⚙️ 歯車の回転を調べよう - Application Logic (with Torque Support)
// ==========================================================================

// --- 1. アプリケーションの状態管理 (State) ---
let state = {
  gearCount: 2,         // 2, 3, or 7
  mechanismType: 'spur', // 'spur', 'bevel', 'rack', or 'internal'
  teeth: { A: 20, B: 40, C: 20, D: 32, E: 16, F: 48, G: 24 },
  speedA: 6,            // rpm
  dirA: 'cw',           // 'cw' (時計回り) or 'ccw' (反時計回り)
  torqueA: 10,          // N・m (基準の入力トルク)
  
  // シミュレーション実行用
  isRunning: false,
  angles: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 },
  lastTimestamp: null,
  animationId: null,
  
  // 生徒の予想状態
  predictions: {
    dir: null,          // 'same', 'opposite', 'unknown'
    speed: null,        // 'fast', 'slow', 'same', 'unknown'
    torque: null        // 'strong', 'weak', 'same', 'unknown'
  },
  hasPredicted: false,
  
  // 問題演習
  currentQuizIndex: 0
};

// クイズデータ
const quizzes = [
  {
    id: 1,
    question: "問題 1: 歯車Aの歯数は 20、歯車Bの歯数は 40 です。Aが 1分間に 6回転（6 rpm）するとき、Bは 1分間に何回転しますか？",
    options: [
      { text: "3 回転", correct: true },
      { text: "6 回転", correct: false },
      { text: "12 回転", correct: false }
    ],
    explanation: "歯数が多いBは、Aよりゆっくり回ります。Bの歯数(40)はAの歯数(20)の <b>2倍</b> なので、回転数は半分の <b>3回転 (3 rpm)</b> になります。"
  },
  {
    id: 2,
    question: "問題 2: 歯車Aの歯数は 30、歯車Bの歯数は 10 です。Aが 1分間に 4回転（4 rpm）するとき、Bは 1分間に何回転しますか？",
    options: [
      { text: "1.2 回転", correct: false },
      { text: "4 回転", correct: false },
      { text: "12 回転", correct: true }
    ],
    explanation: "歯数が少ないBは、Aより速く回ります。Bの歯数(10)はAの歯数(30)の <b>3分の1</b> なので、回転数は3倍の <b>12回転 (12 rpm)</b> になります。"
  },
  {
    id: 3,
    question: "問題 3: 歯車A ➔ B ➔ C の順で3つの歯車がかみ合っています。Aが時計回りに回るとき、Cはどちら向きに回りますか？",
    options: [
      { text: "時計回り (Aと同じ向き)", correct: true },
      { text: "反時計回り (Aと反対向き)", correct: false },
      { text: "回らない", correct: false }
    ],
    explanation: "かみ合うたびに回転方向は反対になります。A(時計回り) ➔ B(反時計回り) ➔ C(時計回り) となるため、CはAと <b>同じ向き</b> に回ります。中間のBは方向を元に戻す役割を持っています。"
  },
  {
    id: 4,
    question: "問題 4: 歯車Aの歯数は 20、歯車Bの歯数は 60 です。Aに 5 N・m のまわす力（トルク）をかけて回すとき、Bに伝わるトルクはいくらになりますか？",
    options: [
      { text: "1.67 N・m", correct: false },
      { text: "5 N・m", correct: false },
      { text: "15 N・m", correct: true }
    ],
    explanation: "まわす力（トルク）は、<b>歯数比に比例</b>します。Bの歯数(60)はAの歯数(20)の <b>3倍</b> なので、トルクも3倍の <b>15 N・m</b> になります。回転は遅くなりますが、力は強くなります。"
  },
  {
    id: 5,
    question: "問題 5: 歯車A（30歯）から、B（15歯）、C（60歯）へと順にかみ合って動いています。Aに 12 N・m のトルクをかけたとき、最終出力であるCのトルクはどうなりますか？",
    options: [
      { text: "6 N・m", correct: false },
      { text: "24 N・m", correct: true },
      { text: "48 N・m", correct: false }
    ],
    explanation: "途中に挟まれた歯車（B）の歯数は、最終的なトルク比や回転数比に影響しません。最初（A: 30歯）と最後（C: 60歯）の比だけで決まります。Cの歯数はAの <b>2倍</b> なので、トルクも2倍の <b>24 N・m</b> になります。"
  },
  {
    id: 6,
    question: "問題 6: 【超難問】10枚の歯車（A ➔ B ➔ C ➔ D ➔ E ➔ F ➔ G ➔ H ➔ I ➔ J）がすべて一列にかみ合っています。A（歯数 20T、時計回り、回転数 10 rpm、トルク 8 N・m）を駆動させたとき、最後のJ（歯数 80T）の「回転方向」「回転数」「トルク」の正しい組み合わせはどれですか？",
    options: [
      { text: "反時計回り、2.5 rpm、32 N・m", correct: true },
      { text: "時計回り、2.5 rpm、32 N・m", correct: false },
      { text: "反時計回り、40 rpm、2 N・m", correct: false }
    ],
    explanation: "<b>①向き：</b> かみ合う数が10枚（偶数）なので、最初と最後は必ず<b>反対向き（反時計回り）</b>になります。<br><b>②回転数：</b> 中間の歯数は無関係なので、A(20T)とJ(80T)の比で決まります。80T / 20T = 4倍の歯数なので、回転数は 1/4倍の <b>2.5 rpm</b> になります。<br><b>③トルク：</b> 歯数比に比例するため、4倍の <b>32 N・m</b> になります！"
  }
];

// モジュール（歯の大きさの基準値）
const MODULE = 3.6;
const THREE_MODULE_URL = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
const GEAR_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const DEFAULT_TEETH = { A: 20, B: 40, C: 20, D: 32, E: 16, F: 48, G: 24 };
const DEFAULT_ANGLES = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };
const GEAR_COLORS = {
  A: 'var(--color-gear-a)',
  B: 'var(--color-gear-b)',
  C: 'var(--color-gear-c)',
  D: 'var(--color-gear-d)',
  E: 'var(--color-gear-e)',
  F: 'var(--color-gear-f)',
  G: 'var(--color-gear-g)'
};
const MECHANISM_TYPES = ['spur', 'bevel', 'rack', 'internal'];
let threeBevelState = {
  THREE: null,
  loading: null,
  failed: false,
  scene: null,
  camera: null,
  renderer: null,
  gearA: null,
  gearB: null,
  container: null,
  lastSize: { width: 0, height: 0 },
  teeth: { A: null, B: null }
};

function setFormulaHtml(container, html) {
  if (!container || container.dataset.formulaHtml === html) return;
  container.dataset.formulaHtml = html;
  container.innerHTML = html;

  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([container]);
  }
}

function getActiveGearKeys() {
  return GEAR_KEYS.slice(0, state.gearCount);
}

function getOutputGearKey() {
  if (state.mechanismType !== 'spur') return 'B';
  return getActiveGearKeys()[state.gearCount - 1];
}

function getGearDirection(index) {
  if (state.mechanismType === 'internal') return state.dirA;
  // ラック&ピニオン：時計回り(CW) → 接触点が左に動く → ラックは左へ
  if (state.mechanismType === 'rack') return state.dirA === 'cw' ? 'left' : 'right';
  const sameAsA = index % 2 === 0;
  if (sameAsA) return state.dirA;
  return state.dirA === 'cw' ? 'ccw' : 'cw';
}

function getActualDirChoice() {
  if (state.mechanismType === 'internal') return 'same';
  // ラック&ピニオン: CW が左へ、CCW が右へ移動 → 予想の "同じ" が左、"反対" が右になるように設定
  if (state.mechanismType === 'rack') return state.dirA === 'cw' ? 'same' : 'opposite';
  return (state.gearCount - 1) % 2 === 0 ? 'same' : 'opposite';
}

function updateMechanismButtons() {
  MECHANISM_TYPES.forEach(type => {
    const btn = document.getElementById(`btn-type-${type}`);
    if (btn) btn.classList.toggle('active', state.mechanismType === type);
  });
}

function updatePredictionCopy() {
  const outputName = getOutputGearKey();
  const dirSame = document.getElementById('btn-pred-dir-same');
  const dirOpp = document.getElementById('btn-pred-dir-opp');
  const speedQuestion = document.getElementById('pred-q-speed');
  const torqueQuestion = document.getElementById('pred-q-torque');

  if (state.mechanismType === 'rack') {
    document.getElementById('pred-q-dir').textContent = 'ラックはどちら向きに動くかな？';
    speedQuestion.textContent = 'ラックが進む速さは、Aの歯数を増やすとどうなるかな？';
    torqueQuestion.textContent = 'ラックを押す力は、Aの歯数を増やすとどうなるかな？';
    dirSame.textContent = '右へ進む';
    dirOpp.textContent = '左へ進む';
  } else {
    const subject = state.mechanismType === 'bevel' ? `90度先の歯車${outputName}` : `出力側の歯車${outputName}`;
    document.getElementById('pred-q-dir').textContent = `${subject}は、Aと比べてどちら向きに回るかな？`;
    speedQuestion.textContent = '出力側の回転数は、Aと比べてどうなるかな？';
    torqueQuestion.textContent = '出力側のまわす力（トルク）は、Aと比べてどうなるかな？';
    dirSame.textContent = '同じ向き';
    dirOpp.textContent = '反対向き';
  }
}

// --- 2. 初期化処理 (Initialization) ---
window.addEventListener('DOMContentLoaded', () => {
  resetSimulator();
  loadQuiz(0);
});

// --- 3. タブ切り替え制御 (Tab Control) ---
function switchTab(tabName) {
  // すべてのタブコンテンツを非表示に
  document.getElementById('tab-explore').classList.add('hidden');
  document.getElementById('tab-quiz').classList.add('hidden');
  document.getElementById('tab-reflection').classList.add('hidden');
  
  // すべてのタブボタンのactiveクラスを解除
  document.getElementById('tab-btn-explore').classList.remove('active');
  document.getElementById('tab-btn-quiz').classList.remove('active');
  document.getElementById('tab-btn-reflection').classList.remove('active');
  
  // 対象のコンテンツを表示し、ボタンをアクティブにする
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
  document.getElementById(`tab-btn-${tabName}`).classList.add('active');
}

// --- 4. シミュレーター制御 & 設定更新 ---
function setGearCount(count) {
  if (count > 2 && state.mechanismType !== 'spur') {
    state.mechanismType = 'spur';
    updateMechanismButtons();
  }
  state.gearCount = count;
  
  // UI切り替え
  document.getElementById('btn-mode-2').classList.toggle('active', count === 2);
  document.getElementById('btn-mode-3').classList.toggle('active', count === 3);
  document.getElementById('btn-mode-7').classList.toggle('active', count === 7);

  GEAR_KEYS.forEach((key, index) => {
    const control = document.getElementById(`control-gear-${key.toLowerCase()}`);
    if (!control) return;
    control.classList.toggle('hidden', index >= count);
  });

  document.querySelector('#control-gear-a .gear-badge').textContent = state.mechanismType === 'rack' ? 'ピニオンA (入力)' : '歯車A (入力)';
  document.querySelector('#control-gear-b .gear-badge').textContent = count === 2 ? '歯車B (出力)' : '歯車B';
  document.querySelector('#control-gear-c .gear-badge').textContent = count === 3 ? '歯車C (出力)' : '歯車C';
  document.querySelector('#control-gear-g .gear-badge').textContent = count === 7 ? '歯車G (出力)' : '歯車G';
  if (state.mechanismType === 'bevel') document.querySelector('#control-gear-b .gear-badge').textContent = 'かさ歯車B (出力)';
  if (state.mechanismType === 'internal') document.querySelector('#control-gear-b .gear-badge').textContent = '内歯車B (出力)';
  if (state.mechanismType === 'rack') document.getElementById('control-gear-b').classList.add('hidden');
  
  updatePredictionCopy();
  
  resetPredictions();
  updateGears();
}

function setMechanismType(type) {
  state.mechanismType = type;
  if (type !== 'spur') {
    state.gearCount = 2;
  }

  // ラック説明表示の切り替え
  const rackLegend = document.getElementById('rack-legend-detail');
  if (rackLegend) {
    rackLegend.style.display = type === 'rack' ? 'block' : 'none';
  }

  updateMechanismButtons();
  setGearCount(state.gearCount);
}

function updateGearGears() {
  GEAR_KEYS.forEach(key => {
    const slider = document.getElementById(`slider-gear-${key.toLowerCase()}`);
    const value = document.getElementById(`val-gear-${key.toLowerCase()}`);
    if (!slider || !value) return;
    state.teeth[key] = parseInt(slider.value);
    value.textContent = `${state.teeth[key]} 歯`;
  });
  
  // 歯数変更で予想をリセット（生徒に再度考えさせるため）
  resetPredictions();
  checkDuplicateTeethAndUpdate();
  updateGears();
}

function updateSpeedA() {
  state.speedA = parseInt(document.getElementById('slider-speed-a').value);
  document.getElementById('val-speed-a').textContent = `${state.speedA} rpm`;
  updateGears();
}

function setDirA(dir) {
  state.dirA = dir;
  document.getElementById('btn-dir-cw').classList.toggle('active', dir === 'cw');
  document.getElementById('btn-dir-ccw').classList.toggle('active', dir === 'ccw');
  
  resetPredictions();
  updateGears();
}

function resetSimulator() {
  // アニメーション停止
  if (state.isRunning) {
    toggleRun();
  }
  
  // 初期値セット
  state.gearCount = 2;
  state.mechanismType = 'spur';
  state.teeth = { ...DEFAULT_TEETH };
  state.speedA = 6;
  state.dirA = 'cw';
  state.angles = { ...DEFAULT_ANGLES };
  
  // スライダーUIリセット
  GEAR_KEYS.forEach(key => {
    const slider = document.getElementById(`slider-gear-${key.toLowerCase()}`);
    const value = document.getElementById(`val-gear-${key.toLowerCase()}`);
    if (!slider || !value) return;
    slider.value = DEFAULT_TEETH[key];
    value.textContent = `${DEFAULT_TEETH[key]} 歯`;
  });
  document.getElementById('slider-speed-a').value = 6;
  
  document.getElementById('val-speed-a').textContent = "6 rpm";
  updateMechanismButtons();
  
  setGearCount(2);
  setDirA('cw');
  resetPredictions();
  updateGears();
}

// --- 5. 予想フロー (Prediction Flow) ---
function selectPrediction(type, choice, clickedBtn) {
  state.predictions[type] = choice;
  
  // UIのアクティブ化
  const containerId = type === 'dir' ? 'options-dir' : (type === 'speed' ? 'options-speed' : 'options-torque');
  const buttons = document.getElementById(containerId).querySelectorAll('.btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  
  // 対象のボタンを選択状態に
  if (clickedBtn) clickedBtn.classList.add('selected');
  
  // 3項目すべて予想したかチェック（重複歯数バリデーション済みの場合のみ解放）
  if (state.predictions.dir && state.predictions.speed && state.predictions.torque) {
    state.hasPredicted = true;
    if (!hasDuplicateTeeth()) {
      document.getElementById('prediction-lock-banner').classList.add('hidden');
      document.getElementById('btn-run').disabled = false;
    }
  }
}

// --- 重複歯数バリデーション ---
function hasDuplicateTeeth() {
  const activeKeys = getActiveGearKeys();
  const teethValues = activeKeys.map(key => state.teeth[key]);
  const uniqueValues = new Set(teethValues);
  return uniqueValues.size < teethValues.length;
}

function checkDuplicateTeethAndUpdate() {
  const isDuplicate = hasDuplicateTeeth();
  const banner = document.getElementById('prediction-lock-banner');
  const btnRun = document.getElementById('btn-run');
  const dupBanner = document.getElementById('duplicate-teeth-banner');

  if (isDuplicate) {
    // 重複エラーバナーを表示
    if (dupBanner) dupBanner.classList.remove('hidden');
    // 実行ボタンを強制無効化
    if (btnRun) btnRun.disabled = true;
    // 実行中なら停止
    if (state.isRunning) toggleRun();
  } else {
    // 重複エラーバナーを非表示
    if (dupBanner) dupBanner.classList.add('hidden');
    // 予想済みなら実行ボタンを有効化
    if (state.hasPredicted && banner) {
      banner.classList.add('hidden');
      if (btnRun) btnRun.disabled = false;
    }
  }
}

function resetPredictions() {
  state.predictions = { dir: null, speed: null, torque: null };
  state.hasPredicted = false;
  
  // ボタンの選択解除
  const predButtons = document.querySelectorAll('.pred-options .btn');
  predButtons.forEach(btn => btn.classList.remove('selected'));
  
  // ロックとバナー表示
  const banner = document.getElementById('prediction-lock-banner');
  if (banner) banner.classList.remove('hidden');
  
  const btnRun = document.getElementById('btn-run');
  if (btnRun) btnRun.disabled = true;
  
  const cardResults = document.getElementById('card-results');
  if (cardResults) cardResults.classList.add('hidden');
  
  // 採点表示のクリア
  const gradingDiv = document.getElementById('prediction-grading');
  if (gradingDiv) gradingDiv.innerHTML = '';
  
  // シミュレーション停止
  if (state.isRunning) {
    toggleRun();
  }
}

// 予想の正誤判定・採点処理
function gradePredictions() {
  const gradingDiv = document.getElementById('prediction-grading');
  if (!gradingDiv) return;
  
  // 1. 実際の回転方向
  const actualDir = getActualDirChoice();
  
  // 2. 実際の回転速度変化
  let actualSpeed;
  const teethA = state.teeth.A;
  const teethOut = state.teeth[getOutputGearKey()];
  
  if (state.mechanismType === 'rack') {
    actualSpeed = teethA > DEFAULT_TEETH.A ? 'fast' : teethA < DEFAULT_TEETH.A ? 'slow' : 'same';
  } else if (teethA < teethOut) {
    actualSpeed = 'slow';
  } else if (teethA > teethOut) {
    actualSpeed = 'fast';
  } else {
    actualSpeed = 'same';
  }
  
  // 3. 実際のトルク変化 (歯数比に比例する)
  let actualTorque;
  if (state.mechanismType === 'rack') {
    actualTorque = teethA > DEFAULT_TEETH.A ? 'weak' : teethA < DEFAULT_TEETH.A ? 'strong' : 'same';
  } else if (teethA < teethOut) {
    actualTorque = 'strong'; // 歯数が多いほど力は強くなる
  } else if (teethA > teethOut) {
    actualTorque = 'weak';   // 歯数が少ないほど力は弱くなる
  } else {
    actualTorque = 'same';
  }
  
  const isDirCorrect = state.predictions.dir === actualDir;
  const isSpeedCorrect = state.predictions.speed === actualSpeed;
  const isTorqueCorrect = state.predictions.torque === actualTorque;
  
  // 日本語表記のマッピング
  const getDirName = (dir) => {
    if (state.mechanismType === 'rack') return dir === 'same' ? '右へ進む' : dir === 'opposite' ? '左へ進む' : 'わからない';
    return dir === 'same' ? '同じ向き' : dir === 'opposite' ? '反対向き' : 'わからない';
  };
  const getSpeedName = (spd) => spd === 'fast' ? '速くなる' : spd === 'slow' ? '遅くなる' : spd === 'same' ? '同じ' : 'わからない';
  const getTorqueName = (trq) => trq === 'strong' ? '強くなる' : trq === 'weak' ? '弱くなる' : trq === 'same' ? '同じ' : 'わからない';
  
  const actualDirName = getDirName(actualDir);
  const actualSpeedName = actualSpeed === 'fast' ? '速くなる' : actualSpeed === 'slow' ? '遅くなる' : '同じ';
  const actualTorqueName = actualTorque === 'strong' ? '強くなる' : actualTorque === 'weak' ? '弱くなる' : '同じ';
  
  let html = `
    <div class="grade-title">🎯 あなたの予想の採点結果</div>
    <div class="grade-list">
      <div class="grade-item">
        <span class="grade-label">回転の向き：</span>
        <span class="grade-detail">予想 [<b>${getDirName(state.predictions.dir)}</b>] ➔ 実際 [<b>${actualDirName}</b>]</span>
        <span class="grade-badge ${isDirCorrect ? 'correct' : 'incorrect'}">${isDirCorrect ? '⭕ 正解！' : '❌ まちがい'}</span>
      </div>
      <div class="grade-item">
        <span class="grade-label">まわる速さ：</span>
        <span class="grade-detail">予想 [<b>${getSpeedName(state.predictions.speed)}</b>] ➔ 実際 [<b>${actualSpeedName}</b>]</span>
        <span class="grade-badge ${isSpeedCorrect ? 'correct' : 'incorrect'}">${isSpeedCorrect ? '⭕ 正解！' : '❌ まちがい'}</span>
      </div>
      <div class="grade-item">
        <span class="grade-label">まわる力　：</span>
        <span class="grade-detail">予想 [<b>${getTorqueName(state.predictions.torque)}</b>] ➔ 実際 [<b>${actualTorqueName}</b>]</span>
        <span class="grade-badge ${isTorqueCorrect ? 'correct' : 'incorrect'}">${isTorqueCorrect ? '⭕ 正解！' : '❌ まちがい'}</span>
      </div>
    </div>
  `;
  
  if (isDirCorrect && isSpeedCorrect && isTorqueCorrect) {
    html += `<div class="grade-perfect">🎉 パーフェクト！素晴らしい！</div>`;
  } else {
    html += `<div class="grade-review">💡 速度と力の「反比例」の関係を下の解説で見てみよう！</div>`;
  }
  
  gradingDiv.innerHTML = html;
}

// --- 6. 物理計算 & SVG描画 (Physics & SVG Rendering) ---
function updateGears() {
  const canvas = document.getElementById('svg-canvas');
  if (!canvas) return;
  canvas.innerHTML = ''; // クリア
  const threeContainer = document.getElementById('three-bevel-container');
  if (threeContainer) threeContainer.classList.add('hidden');
  canvas.classList.remove('hidden');

  if (state.mechanismType !== 'spur') {
    updateSpecialMechanism(canvas);
    return;
  }
  
  const activeKeys = getActiveGearKeys();

  // ---- viewBox を歯車数・サイズに合わせて動的調整 ----
  const SVG_H = 400;
  const totalTeeth = activeKeys.reduce((sum, key) => sum + state.teeth[key], 0);
  // 全歯車が横に並んだ場合の最低幅を確保（最小700、それ以上に広げる）
  const visualModule = Math.min(MODULE, (SVG_H * 1.8) / totalTeeth);
  const radii = {};
  activeKeys.forEach(key => {
    radii[key] = (visualModule * state.teeth[key]) / 2;
  });
  const totalSpan = activeKeys.reduce((sum, key) => sum + radii[key] * 2, 0);
  const SVG_W = Math.max(700, totalSpan + 80); // 最小700、はみ出す場合は拡張
  canvas.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);

  // 描画位置 (中央配置のためのオフセット計算)
  const xStart = (SVG_W - totalSpan) / 2;
  const positions = {};
  let cursorX = xStart;
  const yCenter = SVG_H / 2;
  activeKeys.forEach(key => {
    cursorX += radii[key];
    positions[key] = cursorX;
    cursorX += radii[key];
  });
  
  // 出力側の物理値計算
  const outputKey = getOutputGearKey();
  const outTeeth = state.teeth[outputKey];
  const outDir = getGearDirection(state.gearCount - 1);
  const outSpeed = state.speedA * (state.teeth.A / outTeeth);
  const outTorque = state.torqueA * (outTeeth / state.teeth.A); // トルクは歯数比に比例
  
  // 描画
  // グリッド線（背景テック演出）
  drawBackgroundGrid(canvas, SVG_W, SVG_H);
  
  activeKeys.forEach((key, index) => {
    const phaseOffset = index === 0 ? 0 : 180 + (180 / state.teeth[key]);
    drawGear(
      canvas,
      positions[key],
      yCenter,
      state.teeth[key],
      radii[key],
      `gear-${key.toLowerCase()}`,
      GEAR_COLORS[key],
      state.angles[key] + phaseOffset,
      visualModule
    );
  });
  
  // 回転方向矢印の描画
  // 駆動側Aは入力設定の確認用に常に表示
  drawArrow(canvas, positions.A, yCenter, radii.A, state.dirA, GEAR_COLORS.A);
  
  // 従動側はシミュレーターが動いている時のみ矢印を表示
  if (state.isRunning) {
    activeKeys.slice(1).forEach((key, index) => {
      drawArrow(canvas, positions[key], yCenter, radii[key], getGearDirection(index + 1), GEAR_COLORS[key]);
    });
  }
  
  // 数値と言葉の更新
  updateExplanationText(outTeeth, outSpeed, outDir, outTorque);
}

function updateSpecialMechanism(canvas) {
  drawBackgroundGrid(canvas);

  const rA = (MODULE * state.teeth.A) / 2;
  const rB = (MODULE * state.teeth.B) / 2;
  const outSpeed = state.speedA * (state.teeth.A / state.teeth.B);
  const outTorque = state.torqueA * (state.teeth.B / state.teeth.A);

  if (state.mechanismType === 'bevel') {
    const usedThree = updateThreeBevelMechanism(canvas, rA, rB);
    if (!usedThree) drawBevelMechanism(canvas, rA, rB);
    updateExplanationText(state.teeth.B, outSpeed, getGearDirection(1), outTorque);
    return;
  }

  if (state.mechanismType === 'internal') {
    drawInternalGearMechanism(canvas, rA, rB);
    updateExplanationText(state.teeth.B, outSpeed, getGearDirection(1), outTorque);
    return;
  }

  const rackSpeed = state.speedA * state.teeth.A;
  const rackForce = state.torqueA / Math.max(1, state.teeth.A / DEFAULT_TEETH.A);
  drawRackPinionMechanism(canvas, rA, rackSpeed);
  updateRackExplanation(rackSpeed, rackForce);
}

function updateThreeBevelMechanism(svgCanvas) {
  const container = document.getElementById('three-bevel-container');
  if (!container || threeBevelState.failed) return false;

  if (!threeBevelState.THREE) {
    loadThreeBevelRuntime();
    return false;
  }

  container.classList.remove('hidden');
  svgCanvas.classList.add('hidden');
  setupThreeBevelScene(container);
  syncThreeBevelGears();
  renderThreeBevelScene();
  return true;
}

function loadThreeBevelRuntime() {
  if (threeBevelState.loading) return;
  threeBevelState.loading = import(THREE_MODULE_URL)
    .then(module => {
      threeBevelState.THREE = module;
      updateGears();
    })
    .catch(error => {
      threeBevelState.failed = true;
      console.warn('Three.js bevel mode could not load. Falling back to SVG.', error);
      updateGears();
    });
}

function setupThreeBevelScene(container) {
  const THREE = threeBevelState.THREE;
  if (threeBevelState.scene) {
    resizeThreeBevelRenderer();
    return;
  }

  threeBevelState.container = container;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe2e8f0, 8, 16);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(2.6, 3.25, 6.4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.5);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(3.5, 5, 4);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x38bdf8, 2.2, 12);
  fillLight.position.set(-4, 2, 3);
  scene.add(fillLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5.2, 80),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.82, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.45;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(8, 16, 0x94a3b8, 0xcbd5e1);
  grid.position.y = -1.43;
  grid.material.opacity = 0.28;
  grid.material.transparent = true;
  scene.add(grid);

  threeBevelState.scene = scene;
  threeBevelState.camera = camera;
  threeBevelState.renderer = renderer;
  setupThreeBevelPointerControls(container, camera);
  resizeThreeBevelRenderer();
}

function syncThreeBevelGears() {
  const THREE = threeBevelState.THREE;
  const scene = threeBevelState.scene;
  if (!THREE || !scene) return;

  const needsRebuild = threeBevelState.teeth.A !== state.teeth.A || threeBevelState.teeth.B !== state.teeth.B;
  if (!needsRebuild && threeBevelState.gearA && threeBevelState.gearB) {
    rotateThreeBevelGears();
    return;
  }

  if (threeBevelState.gearA) scene.remove(threeBevelState.gearA.holder);
  if (threeBevelState.gearB) scene.remove(threeBevelState.gearB.holder);

  const gearA = createThreeBevelGear({
    teeth: state.teeth.A,
    color: 0x0d9488,
    accent: 0x14b8a6,
    radius: 0.92,
    smallRadius: 0.42,
    depth: 0.9,
    label: 'A'
  });
  gearA.holder.position.set(-0.95, -0.08, 0);
  gearA.holder.rotation.z = -0.18;

  const gearB = createThreeBevelGear({
    teeth: state.teeth.B,
    color: 0x7c3aed,
    accent: 0xa78bfa,
    radius: 1.08,
    smallRadius: 0.48,
    depth: 0.98,
    label: 'B'
  });
  gearB.holder.position.set(0.62, 0.12, -0.08);
  gearB.holder.rotation.z = Math.PI / 2 + 0.22;
  gearB.holder.rotation.x = -0.34;

  scene.add(gearA.holder);
  scene.add(gearB.holder);
  threeBevelState.gearA = gearA;
  threeBevelState.gearB = gearB;
  threeBevelState.teeth = { A: state.teeth.A, B: state.teeth.B };
  rotateThreeBevelGears();
}

function createThreeBevelGear({ teeth, color, accent, radius, smallRadius, depth, label }) {
  const THREE = threeBevelState.THREE;
  const holder = new THREE.Group();
  const rotor = new THREE.Group();
  holder.add(rotor);

  const metal = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.34,
    metalness: 0.42,
    envMapIntensity: 0.7
  });
  const face = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.5,
    metalness: 0.18
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(smallRadius, radius, depth, Math.max(teeth * 2, 32), 1, false), metal);
  body.castShadow = true;
  body.receiveShadow = true;
  rotor.add(body);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.78, 0.035, 10, 96), face);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -depth * 0.46;
  rim.castShadow = true;
  rotor.add(rim);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, depth * 1.08, 32), face);
  hub.castShadow = true;
  hub.receiveShadow = true;
  rotor.add(hub);

  const toothMaterial = new THREE.MeshStandardMaterial({
    color: accent,
    roughness: 0.28,
    metalness: 0.5
  });
  const toothWidth = Math.max(0.035, (2 * Math.PI * radius) / teeth * 0.42);
  const toothGeometry = new THREE.BoxGeometry(toothWidth, depth * 0.26, 0.2);
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
    tooth.position.set(Math.cos(angle) * (radius + 0.08), -depth * 0.48, Math.sin(angle) * (radius + 0.08));
    tooth.rotation.y = -angle;
    tooth.rotation.z = 0.18;
    tooth.castShadow = true;
    rotor.add(tooth);
  }

  const axle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 3.2, 24),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.6 })
  );
  axle.castShadow = true;
  holder.add(axle);

  const labelSprite = createThreeLabelSprite(label, color);
  labelSprite.position.set(0, -depth * 0.7, 0);
  rotor.add(labelSprite);

  return { holder, rotor };
}

function createThreeLabelSprite(text, color) {
  const THREE = threeBevelState.THREE;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(248,250,252,0.92)';
  ctx.beginPath();
  ctx.arc(64, 64, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.stroke();
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.font = '900 54px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 66);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.44, 0.44, 0.44);
  return sprite;
}

function rotateThreeBevelGears() {
  if (!threeBevelState.gearA || !threeBevelState.gearB) return;
  const angleA = (state.angles.A * Math.PI) / 180;
  const angleB = (state.angles.B * Math.PI) / 180;
  threeBevelState.gearA.rotor.rotation.y = angleA;
  threeBevelState.gearB.rotor.rotation.y = angleB;
}

function renderThreeBevelScene() {
  resizeThreeBevelRenderer();
  rotateThreeBevelGears();
  threeBevelState.renderer.render(threeBevelState.scene, threeBevelState.camera);
}

function resizeThreeBevelRenderer() {
  const { renderer, camera, container, lastSize } = threeBevelState;
  if (!renderer || !camera || !container) return;
  const rect = container.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  if (lastSize.width === width && lastSize.height === height) return;
  lastSize.width = width;
  lastSize.height = height;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function setupThreeBevelPointerControls(container, camera) {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let yaw = 0;
  let pitch = 0;

  function updateCamera() {
    const radius = 7.4;
    camera.position.set(
      Math.sin(yaw) * radius + 2.6,
      3.2 + Math.sin(pitch) * 1.4,
      Math.cos(yaw) * radius - 1.0
    );
    camera.lookAt(0, 0, 0);
    renderThreeBevelScene();
  }

  container.addEventListener('pointerdown', event => {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    container.setPointerCapture(event.pointerId);
  });
  container.addEventListener('pointermove', event => {
    if (!isDragging) return;
    yaw += (event.clientX - lastX) * 0.006;
    pitch = Math.max(-0.75, Math.min(0.75, pitch + (event.clientY - lastY) * 0.004));
    lastX = event.clientX;
    lastY = event.clientY;
    updateCamera();
  });
  container.addEventListener('pointerup', event => {
    isDragging = false;
    if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
  });
  container.addEventListener('wheel', event => {
    event.preventDefault();
    camera.zoom = Math.max(0.72, Math.min(1.45, camera.zoom + (event.deltaY < 0 ? 0.06 : -0.06)));
    camera.updateProjectionMatrix();
    renderThreeBevelScene();
  }, { passive: false });
}

// 歯車の個別描画
function drawGear(svg, cx, cy, teeth, pitchRadius, id, color, angle, moduleSize = MODULE) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("id", id);
  g.setAttribute("transform", `translate(${cx}, ${cy}) rotate(${angle})`);
  
  // 歯車本体のパス
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", getGearPathData(teeth, pitchRadius, moduleSize));
  path.setAttribute("fill", "rgba(255, 255, 255, 0.85)");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "2.5");
  g.appendChild(path);
  
  // ピッチ円（点線で補助線）
  const pitchCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  pitchCircle.setAttribute("cx", "0");
  pitchCircle.setAttribute("cy", "0");
  pitchCircle.setAttribute("r", pitchRadius);
  pitchCircle.setAttribute("fill", "none");
  pitchCircle.setAttribute("stroke", color);
  pitchCircle.setAttribute("stroke-width", "1");
  pitchCircle.setAttribute("stroke-dasharray", "4 4");
  pitchCircle.setAttribute("opacity", "0.4");
  g.appendChild(pitchCircle);
  
  // スポーク（回転が分かりやすくなるための放射線）
  const numSpokes = teeth >= 16 ? 4 : 2;
  for (let i = 0; i < numSpokes; i++) {
    const spokeAngle = (i * 180) / numSpokes;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", (pitchRadius - 6) * Math.cos((spokeAngle * Math.PI) / 180));
    line.setAttribute("y2", (pitchRadius - 6) * Math.sin((spokeAngle * Math.PI) / 180));
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "1.5");
    line.setAttribute("opacity", "0.6");
    g.appendChild(line);
  }
  
  // 回転目安のドット
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", pitchRadius - 12);
  dot.setAttribute("cy", "0");
  dot.setAttribute("r", "4");
  dot.setAttribute("fill", color);
  g.appendChild(dot);
  
  // 中心円 (ラベルと数値が収まるように少し大きく)
  const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  centerCircle.setAttribute("cx", "0");
  centerCircle.setAttribute("cy", "0");
  centerCircle.setAttribute("r", "18");
  centerCircle.setAttribute("fill", "#f8fafc");
  centerCircle.setAttribute("stroke", color);
  centerCircle.setAttribute("stroke-width", "2.5");
  g.appendChild(centerCircle);
  
  // 歯数テキスト (回転しないようにグループの外に出す)
  svg.appendChild(g);
  
  // 歯車の記号 (A, B, C)
  const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  labelText.setAttribute("x", cx);
  labelText.setAttribute("y", cy - 2);
  labelText.setAttribute("text-anchor", "middle");
  labelText.setAttribute("fill", color); // 各ギアのカラーでA, B, Cを表示
  labelText.setAttribute("font-family", "Outfit");
  labelText.setAttribute("font-weight", "900");
  labelText.setAttribute("font-size", "14px");
  labelText.textContent = id.replace('gear-', '').toUpperCase(); // A, B, C
  svg.appendChild(labelText);
  
  // 歯数 (20T, 40Tなど)
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", cx);
  text.setAttribute("y", cy + 12);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#0f172a");
  text.setAttribute("font-family", "Outfit");
  text.setAttribute("font-weight", "700");
  text.setAttribute("font-size", "10px");
  text.textContent = `${teeth}T`;
  svg.appendChild(text);
  
  return g;
}

function drawBevelMechanism(svg, rA, rB) {
  drawGear(svg, 310, 220, state.teeth.A, rA, 'gear-a', GEAR_COLORS.A, state.angles.A, MODULE);
  drawGear(svg, 495, 178, state.teeth.B, rB, 'gear-b', GEAR_COLORS.B, -state.angles.B + 22, MODULE);

  const coneA = document.createElementNS("http://www.w3.org/2000/svg", "path");
  coneA.setAttribute("d", "M 310 220 L 415 170 L 415 270 Z");
  coneA.setAttribute("fill", "rgba(13, 148, 136, 0.06)");
  coneA.setAttribute("stroke", GEAR_COLORS.A);
  coneA.setAttribute("stroke-dasharray", "6 4");
  svg.insertBefore(coneA, svg.children[1] || null);

  const coneB = document.createElementNS("http://www.w3.org/2000/svg", "path");
  coneB.setAttribute("d", "M 495 178 L 415 170 L 520 300 Z");
  coneB.setAttribute("fill", "rgba(124, 58, 237, 0.06)");
  coneB.setAttribute("stroke", GEAR_COLORS.B);
  coneB.setAttribute("stroke-dasharray", "6 4");
  svg.insertBefore(coneB, svg.children[1] || null);

  drawAxisLabel(svg, 330, 320, 'Aの軸');
  drawAxisLabel(svg, 560, 110, '90度先の軸');
  drawArrow(svg, 310, 220, rA, state.dirA, GEAR_COLORS.A);
  if (state.isRunning) drawArrow(svg, 495, 178, rB, getGearDirection(1), GEAR_COLORS.B);
}

function drawRackPinionMechanism(svg, rA, rackSpeed) {
  // ピニオン（歯車A）の配置
  const pinionCx = 260;
  const pinionCy = 165;

  // ラックの上面 = ピニオンのピッチ円に接する位置
  const toothPitch = MODULE * Math.PI; // 歯のピッチ（1歯あたりの移動量）
  const rackTopY = pinionCy + rA;      // ラック上端 = ピニオン中心 + ピッチ半径

  // ラックの移動量 = 回転角度 × ピッチ半径（弧長）
  // angles.A は度なので radian に変換し rA を掛ける
  const arcLength = (state.angles.A * Math.PI / 180) * rA;
  // ラックの移動量 = 回転角度 × ピッチ半径（弧長）
  // SVG座標系での時計回り(CW)：歯車下部の接触点が左へ動く → ラックは左へ
  const rawOffset = state.dirA === 'cw' ? -arcLength : arcLength;
  // 歯のピッチ周期でループ（ラックが循環して見えるように）
  const loopRange = toothPitch * 26; // 歯26本分
  const offset = ((rawOffset % loopRange) + loopRange) % loopRange;

  // ── レール（ガイド） ──
  const railGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  // 上レール
  const railTop = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  railTop.setAttribute("x", "60");
  railTop.setAttribute("y", rackTopY + 38);
  railTop.setAttribute("width", "680");
  railTop.setAttribute("height", "6");
  railTop.setAttribute("rx", "3");
  railTop.setAttribute("fill", "#e2e8f0");
  railTop.setAttribute("stroke", "#94a3b8");
  railTop.setAttribute("stroke-width", "1");
  railGroup.appendChild(railTop);
  // 下レール
  const railBottom = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  railBottom.setAttribute("x", "60");
  railBottom.setAttribute("y", rackTopY + 80);
  railBottom.setAttribute("width", "680");
  railBottom.setAttribute("height", "6");
  railBottom.setAttribute("rx", "3");
  railBottom.setAttribute("fill", "#e2e8f0");
  railBottom.setAttribute("stroke", "#94a3b8");
  railBottom.setAttribute("stroke-width", "1");
  railGroup.appendChild(railBottom);
  svg.appendChild(railGroup);

  // ── ラック本体（移動するグループ） ──
  const rack = document.createElementNS("http://www.w3.org/2000/svg", "g");
  rack.setAttribute("id", "rack-output");

  // クリッピング矩形でラックの表示範囲を制限（画面外にはみ出さない）
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
  }
  const clipId = 'rack-clip';
  let clip = defs.querySelector(`#${clipId}`);
  if (!clip) {
    clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    clip.setAttribute("id", clipId);
    const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    clipRect.setAttribute("x", "60");
    clipRect.setAttribute("y", "0");
    clipRect.setAttribute("width", "680");
    clipRect.setAttribute("height", "400");
    clip.appendChild(clipRect);
    defs.appendChild(clip);
  }

  const rackClipped = document.createElementNS("http://www.w3.org/2000/svg", "g");
  rackClipped.setAttribute("clip-path", `url(#${clipId})`);

  // ラック本体（長めに作ってスクロールさせる）
  const rackBody = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  const rackX = 60 - toothPitch * 26 + offset; // 左端をオフセット分ずらす
  rackBody.setAttribute("x", rackX);
  rackBody.setAttribute("y", rackTopY + 10);
  rackBody.setAttribute("width", toothPitch * 78); // 3倍の幅で余裕を持たせる
  rackBody.setAttribute("height", "32");
  rackBody.setAttribute("rx", "4");
  rackBody.setAttribute("fill", "rgba(124, 58, 237, 0.06)");
  rackBody.setAttribute("stroke", GEAR_COLORS.B);
  rackBody.setAttribute("stroke-width", "2");
  rackClipped.appendChild(rackBody);

  // 歯（3倍の幅を描画）
  const numTeeth = 78;
  for (let i = 0; i < numTeeth; i++) {
    const tx = rackX + i * toothPitch;
    const tooth = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const toothH = MODULE * 1.0; // 歯の高さ
    tooth.setAttribute("d",
      `M ${tx.toFixed(1)} ${(rackTopY + 10).toFixed(1)} ` +
      `L ${(tx + toothPitch * 0.3).toFixed(1)} ${(rackTopY + 10 - toothH).toFixed(1)} ` +
      `L ${(tx + toothPitch * 0.7).toFixed(1)} ${(rackTopY + 10 - toothH).toFixed(1)} ` +
      `L ${(tx + toothPitch).toFixed(1)} ${(rackTopY + 10).toFixed(1)} Z`
    );
    tooth.setAttribute("fill", "rgba(255,255,255,0.9)");
    tooth.setAttribute("stroke", GEAR_COLORS.B);
    tooth.setAttribute("stroke-width", "1.5");
    rackClipped.appendChild(tooth);
  }
  rack.appendChild(rackClipped);
  svg.appendChild(rack);

  // ── ピニオン（歯車A）を描画（ラックの上に重ねる） ──
  drawGear(svg, pinionCx, pinionCy, state.teeth.A, rA, 'gear-a', GEAR_COLORS.A, state.angles.A, MODULE);
  drawArrow(svg, pinionCx, pinionCy, rA, state.dirA, GEAR_COLORS.A);

  // ── ラベル ──
  // 「ピニオン A（入力）」ラベル
  const pinionLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  pinionLabel.setAttribute("x", pinionCx + rA + 14);
  pinionLabel.setAttribute("y", pinionCy - 14);
  pinionLabel.setAttribute("fill", GEAR_COLORS.A);
  pinionLabel.setAttribute("font-family", "M PLUS Rounded 1c");
  pinionLabel.setAttribute("font-weight", "900");
  pinionLabel.setAttribute("font-size", "13px");
  pinionLabel.textContent = "ピニオン A（入力）";
  svg.appendChild(pinionLabel);

  // 「ラック B（出力）」ラベル
  const rackLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  rackLabel.setAttribute("x", "66");
  rackLabel.setAttribute("y", rackTopY + 62);
  rackLabel.setAttribute("fill", GEAR_COLORS.B);
  rackLabel.setAttribute("font-family", "M PLUS Rounded 1c");
  rackLabel.setAttribute("font-weight", "900");
  rackLabel.setAttribute("font-size", "13px");
  rackLabel.textContent = "ラック B（出力）";
  svg.appendChild(rackLabel);

  // ── 移動方向矢印（シミュレーター動作時のみ） ──
  if (state.isRunning) {
    const dir = getGearDirection(1);
    drawLinearArrow(svg, 470, rackTopY + 55, dir, GEAR_COLORS.B, `${dir === 'right' ? '→ 右' : '← 左'}へ移動`);
  }

  // ── 速度補足テキスト ──
  drawAxisLabel(svg, 500, rackTopY + 108,
    `1回転で ${(2 * Math.PI * rA).toFixed(1)} px 進む`);
}

function drawInternalGearMechanism(svg, rA, rB) {
  const cxB = 420;
  const cy = 200;
  const cxA = cxB - Math.max(20, rB - rA);
  drawInternalRing(svg, cxB, cy, state.teeth.B, rB, GEAR_COLORS.B, state.angles.B);
  drawGear(svg, cxA, cy, state.teeth.A, rA, 'gear-a', GEAR_COLORS.A, state.angles.A, MODULE);
  drawArrow(svg, cxA, cy, rA, state.dirA, GEAR_COLORS.A);
  if (state.isRunning) drawArrow(svg, cxB, cy, rB + 8, state.dirA, GEAR_COLORS.B);
}

function drawInternalRing(svg, cx, cy, teeth, pitchRadius, color, angle) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("id", "gear-b");
  g.setAttribute("transform", `translate(${cx}, ${cy}) rotate(${angle})`);

  const outer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  outer.setAttribute("r", pitchRadius + 24);
  outer.setAttribute("fill", "rgba(255,255,255,0.75)");
  outer.setAttribute("stroke", color);
  outer.setAttribute("stroke-width", "3");
  g.appendChild(outer);

  const inner = document.createElementNS("http://www.w3.org/2000/svg", "path");
  inner.setAttribute("d", getInternalGearPathData(teeth, pitchRadius));
  inner.setAttribute("fill", "#f8fafc");
  inner.setAttribute("stroke", color);
  inner.setAttribute("stroke-width", "2");
  g.appendChild(inner);
  svg.appendChild(g);

  drawCenterLabel(svg, cx, cy, 'B', `${teeth}T`, color);
}

function getInternalGearPathData(teeth, pitchRadius) {
  const rOuter = pitchRadius + MODULE * 0.85;
  const rInner = pitchRadius - MODULE * 0.9;
  const points = [];
  for (let i = 0; i < teeth * 4; i++) {
    const step = i % 4;
    const r = step === 1 || step === 2 ? rInner : rOuter;
    const angle = (i * 2 * Math.PI) / (teeth * 4);
    points.push(`${(r * Math.cos(angle)).toFixed(2)},${(r * Math.sin(angle)).toFixed(2)}`);
  }
  return `M ${points.join(' L ')} Z`;
}

function drawCenterLabel(svg, cx, cy, label, subLabel, color) {
  const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  labelText.setAttribute("x", cx);
  labelText.setAttribute("y", cy - 2);
  labelText.setAttribute("text-anchor", "middle");
  labelText.setAttribute("fill", color);
  labelText.setAttribute("font-family", "Outfit");
  labelText.setAttribute("font-weight", "900");
  labelText.setAttribute("font-size", "14px");
  labelText.textContent = label;
  svg.appendChild(labelText);

  const subText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  subText.setAttribute("x", cx);
  subText.setAttribute("y", cy + 12);
  subText.setAttribute("text-anchor", "middle");
  subText.setAttribute("fill", "#0f172a");
  subText.setAttribute("font-family", "Outfit");
  subText.setAttribute("font-weight", "700");
  subText.setAttribute("font-size", "10px");
  subText.textContent = subLabel;
  svg.appendChild(subText);
}

function drawLinearArrow(svg, x, y, direction, color, label) {
  const x1 = direction === 'right' ? x - 80 : x + 80;
  const x2 = direction === 'right' ? x + 80 : x - 80;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M ${x1} ${y} L ${x2} ${y}`);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "4");
  path.setAttribute("marker-end", `url(#arrowhead-${direction})`);
  svg.appendChild(path);
  ensureArrowMarker(svg, direction, color);
  drawAxisLabel(svg, x - 48, y - 12, label);
}

function drawAxisLabel(svg, x, y, textValue) {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.setAttribute("fill", "#475569");
  text.setAttribute("font-family", "M PLUS Rounded 1c");
  text.setAttribute("font-weight", "700");
  text.setAttribute("font-size", "13px");
  text.textContent = textValue;
  svg.appendChild(text);
}

// 歯車インボリュート風のギザギザ形状パスの計算
function getGearPathData(teeth, pitchRadius, moduleSize = MODULE) {
  const addendum = moduleSize * 0.8; // 歯先高
  const dedendum = moduleSize * 0.95; // 歯底高
  const rOuter = pitchRadius + addendum;
  const rInner = pitchRadius - dedendum;
  
  const points = [];
  const numSteps = teeth * 4;
  
  for (let i = 0; i < numSteps; i++) {
    const angle = (i * 2 * Math.PI) / numSteps;
    let r = rInner;
    
    const step = i % 4;
    // 歯の山と谷の形状をはっきりさせる
    if (step === 0) {
      r = rInner;
    } else if (step === 1) {
      // 立ち上がり
      r = rOuter;
    } else if (step === 2) {
      r = rOuter;
    } else if (step === 3) {
      // 立ち下がり
      r = rInner;
    }
    
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M ${points.join(' L ')} Z`;
}

// 回転方向の矢印描画
function drawArrow(svg, cx, cy, radius, direction, color) {
  const arrowRadius = radius + 15;
  const startAngle = direction === 'cw' ? -45 : 225;
  const endAngle = direction === 'cw' ? 45 : 135;
  
  const radStart = (startAngle * Math.PI) / 180;
  const radEnd = (endAngle * Math.PI) / 180;
  
  const x1 = cx + arrowRadius * Math.cos(radStart);
  const y1 = cy + arrowRadius * Math.sin(radStart);
  const x2 = cx + arrowRadius * Math.cos(radEnd);
  const y2 = cy + arrowRadius * Math.sin(radEnd);
  
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${arrowRadius} ${arrowRadius} 0 0 ${direction === 'cw' ? 1 : 0} ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "3");
  path.setAttribute("stroke-dasharray", "4 2");
  path.setAttribute("marker-end", `url(#arrowhead-${direction})`);
  path.setAttribute("opacity", "0.85");
  svg.appendChild(path);

  ensureArrowMarker(svg, direction, color);
}

function ensureArrowMarker(svg, direction, color) {
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
  }

  if (!svg.querySelector(`#arrowhead-${direction}`)) {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", `arrowhead-${direction}`);
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "5");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto-start-reverse");
    
    const pathArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathArrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    pathArrow.setAttribute("fill", color);
    marker.appendChild(pathArrow);
    defs.appendChild(marker);
  }
}

// テック背景グリッド（動的サイズ対応）
function drawBackgroundGrid(svg, width = 800, height = 400) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("opacity", "0.05");
  
  for (let x = 40; x < width; x += 40) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x);
    line.setAttribute("y1", "0");
    line.setAttribute("x2", x);
    line.setAttribute("y2", height);
    line.setAttribute("stroke", "#000");
    g.appendChild(line);
  }
  for (let y = 40; y < height; y += 40) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", y);
    line.setAttribute("x2", width);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#000");
    g.appendChild(line);
  }
  svg.appendChild(g);
}

// --- 7. アニメーションループ (Animation Loop) ---
function toggleRun() {
  state.isRunning = !state.isRunning;
  const btn = document.getElementById('btn-run');
  if (!btn) return;
  
  if (state.isRunning) {
    btn.innerHTML = "⏹️ 停止する";
    btn.classList.replace('btn-primary', 'btn-secondary');
    
    const cardResults = document.getElementById('card-results');
    if (cardResults) cardResults.classList.remove('hidden'); // 結果表示をオープン
    
    // 予想の採点処理を実行
    gradePredictions();
    
    state.lastTimestamp = performance.now();
    state.animationId = requestAnimationFrame(animationLoop);
  } else {
    btn.innerHTML = "🔓 動かして確認";
    btn.classList.replace('btn-secondary', 'btn-primary');
    cancelAnimationFrame(state.animationId);
  }
}

function animationLoop(timestamp) {
  if (!state.isRunning) return;
  
  const elapsed = (timestamp - state.lastTimestamp) / 1000; // 秒
  state.lastTimestamp = timestamp;
  
  // 1分間(60秒)に speedA 回転 ➔ 1秒間に (speedA / 60) 回転 ➔ 1秒間に (speedA / 60) * 360 度
  const speedDegPerSecA = (state.speedA / 60) * 360;
  const deltaA = speedDegPerSecA * elapsed;
  const directionSignA = state.dirA === 'cw' ? 1 : -1;
  
  if (state.mechanismType !== 'spur') {
    state.angles.A += deltaA * directionSignA;
    const ratioToA = state.teeth.A / state.teeth.B;
    const outputSign = state.mechanismType === 'internal' ? directionSignA : -directionSignA;
    state.angles.B += deltaA * ratioToA * outputSign;
  } else {
    getActiveGearKeys().forEach((key, index) => {
      const ratioToA = state.teeth.A / state.teeth[key];
      const directionSign = index % 2 === 0 ? directionSignA : -directionSignA;
      state.angles[key] += deltaA * ratioToA * directionSign;
    });
  }
  
  updateGears();
  
  state.animationId = requestAnimationFrame(animationLoop);
}

// --- 8. 比・日本語解説・数式の更新 ---
function updateRackExplanation(rackSpeed, rackForce) {
  const formattedRackSpeed = Number(rackSpeed.toFixed(2));
  const formattedRackForce = Number(rackForce.toFixed(2));
  const directionText = state.dirA === 'cw' ? '右' : '左';

  const ratioTeethEl = document.getElementById('ratio-teeth');
  if (ratioTeethEl) ratioTeethEl.textContent = `ピニオンA: ${state.teeth.A}歯 / ラック: 直線`;

  const ratioSpeedEl = document.getElementById('ratio-speed');
  if (ratioSpeedEl) ratioSpeedEl.textContent = `${state.speedA}rpm -> ${formattedRackSpeed} 歯/分`;

  const ratioTorqueEl = document.getElementById('ratio-torque');
  if (ratioTorqueEl) ratioTorqueEl.textContent = `${state.torqueA} N·m -> 押す力 ${formattedRackForce}`;

  const expWordsEl = document.getElementById('explanation-words');
  if (expWordsEl) {
    expWordsEl.innerHTML = `ピニオンAが回ると、ラックは<b>${directionText}へ直線運動</b>します。Aの歯数が多いほど、1回転で送る距離は大きくなります。`;
  }

  const expRatioEl = document.getElementById('explanation-ratio');
  if (expRatioEl) {
    expRatioEl.innerHTML = `
      ラック&ピニオンでは、<b>回転運動</b>を<b>直線運動</b>に変えます。<br>
      1回転で進む歯の数は、ピニオンAの歯数と同じです。<br>
      歯数を増やすと速く送れますが、同じトルクなら押す力は小さくなります。
    `;
  }

  const mathFormulaDiv = document.getElementById('explanation-formula-math');
  if (mathFormulaDiv) {
    setFormulaHtml(mathFormulaDiv, `
      \\[ \\text{ラックの送り量} = ${state.speedA}\\text{ rpm} \\times ${state.teeth.A}\\text{ 歯} = ${formattedRackSpeed}\\text{ 歯/分} \\]
      \\[ \\text{押す力の目安} = ${state.torqueA}\\text{ N·m} \\div \\frac{${state.teeth.A}}{${DEFAULT_TEETH.A}} = ${formattedRackForce} \\]
    `);
  }
}

function updateExplanationText(outTeeth, outSpeed, outDir, outTorque) {
  // 比の算出
  const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
  
  const teethA = state.teeth.A;
  const teethOut = outTeeth;
  const divisor = gcd(teethA, teethOut);
  
  const termA = teethA / divisor;
  const termOut = teethOut / divisor;
  
  const dirTextJa = outDir === 'cw' ? '時計回り' : '反時計回り';
  const labelOut = getOutputGearKey();
  
  // UI上の数値・比表示の更新
  const ratioTeethEl = document.getElementById('ratio-teeth');
  if (ratioTeethEl) ratioTeethEl.textContent = `${teethA}歯 : ${teethOut}歯 (${termA} : ${termOut})`;
  
  // 回転数 (丸め)
  const formattedOutSpeed = Number(outSpeed.toFixed(2));
  const ratioSpeedEl = document.getElementById('ratio-speed');
  if (ratioSpeedEl) ratioSpeedEl.textContent = `${state.speedA}rpm : ${formattedOutSpeed}rpm (${termOut} : ${termA})`;
  
  // トルク (丸め)
  const formattedOutTorque = Number(outTorque.toFixed(2));
  const ratioTorqueEl = document.getElementById('ratio-torque');
  if (ratioTorqueEl) ratioTorqueEl.textContent = `${state.torqueA} N·m : ${formattedOutTorque} N·m (${termA} : ${termOut})`;
  
  // 段階1: 言葉
  let wordDesc = "";
  if (teethA === teethOut) {
    wordDesc = `${labelOut}の歯数はAと<b>同じ</b>なので、回転する速さもまわす力（トルク）もAと<b>同じ</b>になります。`;
  } else if (teethA < teethOut) {
    const times = (teethOut / teethA).toFixed(1).replace('.0', '');
    wordDesc = `${labelOut}の歯数はAの <b>${times}倍</b> なので、回転数はAの <b>${times}分の1</b>（ゆっくり）になりますが、その代わりにまわす力（トルク）はAの <b>${times}倍</b>（強く）になります。`;
  } else {
    const times = (teethA / teethOut).toFixed(1).replace('.0', '');
    wordDesc = `${labelOut}の歯数はAの <b>${times}分の1</b> なので、回転数はAの <b>${times}倍</b>（速く）になりますが、その代わりにまわす力（トルク）はAの <b>${times}分の1</b>（弱く）になります。`;
  }
  const expWordsEl = document.getElementById('explanation-words');
  if (expWordsEl) expWordsEl.innerHTML = wordDesc;
  
  // 段階2: 比
  const expRatioEl = document.getElementById('explanation-ratio');
  if (expRatioEl) {
    expRatioEl.innerHTML = `
      歯数の比は <b>A : ${labelOut} ＝ ${termA} : ${termOut}</b> ですが、<br>
      回転数の比は <b>A : ${labelOut} ＝ ${termOut} : ${termA}</b>（逆比）、<br>
      トルクの比は <b>A : ${labelOut} ＝ ${termA} : ${termOut}</b>（正比）になります。<br>
      「速さが遅くなる代わりに、力が強くなる（反比例）」の関係性が比からもわかります！
    `;
  }
  
  // 段階3: 数式 (MathJax)
  const mathFormulaDiv = document.getElementById('explanation-formula-math');
  if (mathFormulaDiv) {
    setFormulaHtml(mathFormulaDiv, `
      \\[ \\text{出力回転数} = ${state.speedA}\\text{ rpm} \\times \\frac{${teethA}\\text{ 歯}}{${teethOut}\\text{ 歯}} = ${formattedOutSpeed}\\text{ rpm} \\]
      \\[ \\text{出力トルク} = ${state.torqueA}\\text{ N·m} \\times \\frac{${teethOut}\\text{ 歯}}{${teethA}\\text{ 歯}} = ${formattedOutTorque}\\text{ N·m} \\]
    `);
  }
}

// --- 9. UIアコーディオン (Accordion Hints) ---
function toggleAccordion(id) {
  const content = document.getElementById(id);
  const header = document.getElementById(`btn-${id}`);
  if (!content || !header) return;
  
  const isHidden = content.classList.contains('hidden');
  content.classList.toggle('hidden', !isHidden);
  
  if (isHidden) {
    header.style.color = 'var(--text-main)';
  } else {
    header.style.color = 'var(--text-muted)';
  }
}

// --- 10. チャレンジ問題 (Quiz Logic) ---
function loadQuiz(index) {
  const quiz = quizzes[index];
  state.currentQuizIndex = index;
  
  // 進捗表示
  const progressEl = document.getElementById('quiz-progress-bar');
  if (progressEl) progressEl.textContent = `問題 ${index + 1} / ${quizzes.length}`;
  
  // 問題文
  const questionEl = document.getElementById('quiz-question-text');
  if (questionEl) questionEl.textContent = quiz.question;
  
  // 選択肢
  const optionsContainer = document.getElementById('quiz-options-container');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    quiz.options.forEach((opt, oIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-btn';
      btn.textContent = opt.text;
      btn.onclick = () => answerQuiz(oIdx);
      optionsContainer.appendChild(btn);
    });
  }
  
  // フィードバック非表示
  const fbEl = document.getElementById('quiz-feedback');
  if (fbEl) fbEl.classList.add('hidden');
}

function answerQuiz(optionIndex) {
  const quiz = quizzes[state.currentQuizIndex];
  const isCorrect = quiz.options[optionIndex].correct;
  
  const optionsContainer = document.getElementById('quiz-options-container');
  if (!optionsContainer) return;
  const buttons = optionsContainer.querySelectorAll('.quiz-btn');
  
  // ボタンの色分け
  buttons.forEach((btn, idx) => {
    btn.disabled = true; // クリック不可に
    if (quiz.options[idx].correct) {
      btn.classList.add('correct');
    }
    if (idx === optionIndex && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });
  
  // フィードバック
  const fbStatus = document.getElementById('quiz-feedback-status');
  if (fbStatus) {
    if (isCorrect) {
      fbStatus.textContent = "⭕ 正解！すばらしい！";
      fbStatus.className = "feedback-status correct-text";
    } else {
      fbStatus.textContent = "❌ 残念！もう一度考えてみよう";
      fbStatus.className = "feedback-status incorrect-text";
    }
  }
  
  const fbExp = document.getElementById('quiz-feedback-explanation');
  if (fbExp) fbExp.innerHTML = quiz.explanation;
  
  // 次の問題ボタンの制御
  const btnNext = document.getElementById('btn-next-quiz');
  if (btnNext) {
    if (state.currentQuizIndex === quizzes.length - 1) {
      btnNext.textContent = "もう一度チャレンジする ↻";
    } else {
      btnNext.textContent = "次の問題へ ➔";
    }
  }
  
  const fbEl = document.getElementById('quiz-feedback');
  if (fbEl) fbEl.classList.remove('hidden');
}

function nextQuiz() {
  let nextIdx = state.currentQuizIndex + 1;
  if (nextIdx >= quizzes.length) {
    nextIdx = 0; // ループ
  }
  loadQuiz(nextIdx);
}

// --- 11. 振り返り保存 (Reflection Logic) ---
function submitReflection() {
  const textReflection = document.getElementById('text-reflection');
  if (!textReflection) return;
  
  const reflection = textReflection.value.trim();
  if (!reflection) {
    alert("振り返り内容を入力してください。");
    return;
  }
  
  // ローカルストレージに保存
  localStorage.setItem('gears_reflection', reflection);
  
  // 振り返りファイルの出力
  const blob = new Blob([
    `【歯車教材 振り返りシート】\n`,
    `実施日時: ${new Date().toLocaleString()}\n`,
    `設定した歯数 (${getActiveGearKeys().join('-')}): ${getActiveGearKeys().map(key => state.teeth[key]).join(' - ')}\n`,
    `---------------------------------------\n`,
    `【振り返り内容】\n`,
    `${reflection}`
  ], { type: "text/plain;charset=utf-8" });
  
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `歯車の回転_振り返り_${new Date().toISOString().slice(0,10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  alert("振り返り内容をテキストファイルとしてダウンロードしました！授業の提出などに使ってください。");
}
