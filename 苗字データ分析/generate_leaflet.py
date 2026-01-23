import json
import os

dir_path = '/Users/kentaroiida/Desktop/20260119test/苗字データ分析'
json_path = os.path.join(dir_path, 'map_stats.json')

with open(json_path, 'r', encoding='utf-8') as f:
    stats_data = json.load(f)

html_template = """<!DOCTYPE html>
<html lang="ja" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>苗字頭文字分布 - Premium Data Lab</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Noto+Sans+JP:wght@300;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --accent-primary: #f97316;
            --accent-glow: rgba(249, 115, 22, 0.4);
            --bg-dark: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
        }
        body { 
            font-family: 'Outfit', 'Noto Sans JP', sans-serif; 
            background-color: var(--bg-dark); 
            color: #e2e8f0;
            margin: 0;
            overflow: hidden;
        }
        @media (max-width: 1024px) {
            body { overflow: auto; }
        }
        .main-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            box-sizing: border-box;
        }
        .glass-panel {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.25rem;
        }
        .text-glow {
            text-shadow: 0 0 10px var(--accent-glow);
        }
        .leaflet-container {
            background: #0b1120 !important;
            border-radius: 1.5rem;
            box-shadow: 0 0 40px rgba(0,0,0,0.5);
        }
        .select-custom {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 0.75rem;
            outline: none;
            transition: all 0.3s;
        }
        .select-custom:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 2px var(--accent-glow); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
    </style>
</head>
<body class="h-full">
    <div class="main-container max-w-[1700px] mx-auto overflow-hidden">
        <header class="flex flex-col md:flex-row justify-between items-end mb-4 gap-4 flex-shrink-0">
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <span class="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-full border border-orange-500/20 tracking-widest uppercase">Surname Analytics v2.6</span>
                </div>
                <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">苗字頭文字分布 <span class="text-glow text-orange-500">Visual Insights</span></h1>
                <p class="text-slate-400 text-sm font-light">全国上位1000件の苗字データをもとに頭文字の傾向を完全可視化。地域に眠る「名前の響き」を解読しよう。</p>
            </div>
            
            <div class="glass-panel p-3 flex gap-4 items-center">
                <div class="flex flex-col">
                    <label class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Category</label>
                    <select id="modeSelect" class="select-custom text-xs font-medium">
                        <option value="gyo">行単位 (Gyo)</option>
                        <option value="dan">段単位 (Dan)</option>
                        <option value="char">50音単位 (Char)</option>
                        <option value="ranking">苗字ランキング (Ranking)</option>
                    </select>
                </div>
                <div id="targetSoundGroup" class="flex flex-col">
                    <label class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Sound</label>
                    <select id="itemSelect" class="select-custom text-xs font-medium min-w-[80px]">
                    </select>
                </div>
            </div>
        </header>

        <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-grow overflow-hidden">
            <div class="xl:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
                <div id="prefInsightCard" class="glass-panel p-5 border-l-4 border-l-orange-500 flex-shrink-0">
                    <h2 id="selectedPrefName" class="text-lg font-bold text-white mb-1">都道府県を選択</h2>
                    <div id="prefCardLabel" class="text-[8px] font-bold text-orange-500 uppercase tracking-widest mb-3">Top 3 Representative Surnames</div>
                    <div id="prefTopNames" class="space-y-1.5 text-sm">
                        <div class="text-slate-500 text-xs italic text-center p-2">地図を操作してください</div>
                    </div>
                </div>

                <div id="rankingPanel" class="glass-panel p-5 flex-grow overflow-hidden flex flex-col">
                    <h2 class="text-[8px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-3 flex items-center">
                        <span class="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                        Top Ranking
                    </h2>
                    <div id="rankingList" class="space-y-3 overflow-y-auto flex-grow custom-scrollbar pr-2"></div>
                </div>

                <div id="observationPanel" class="glass-panel p-5 relative group flex-shrink-0">
                    <h3 class="text-[8px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-2">Observation</h3>
                    <div id="observationTip" class="text-slate-300 text-[11px] leading-relaxed font-light"></div>
                </div>
            </div>

            <div class="xl:col-span-9 relative flex flex-col h-full overflow-hidden">
                <div id="map" class="w-full h-full"></div>
                <div id="legendPanel" class="absolute bottom-4 left-4 glass-panel p-3 z-[1000] min-w-[150px]">
                    <div class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Relative Density</div>
                    <div id="legendGrid" class="flex gap-1 mb-2"></div>
                    <div class="flex justify-between text-[8px] font-bold">
                        <span class="text-slate-500" id="scaleMin">MIN</span>
                        <span class="text-orange-500" id="currentRange">SCALE</span>
                        <span class="text-slate-500" id="scaleMax">MAX</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const statsData = {stats_placeholder};
        let geojson, map, selectedCategory = 'gyo', selectedItem = 'あ行';
        const palette = ['#1e293b', '#27170a', '#45230e', '#6a3a16', '#8b5020', '#b46a2c', '#d98539', '#f9a04a', '#fbba6b', '#fcd48f', '#fdeeaf', '#fff7ed'];

        async function init() {
            map = L.map('map', { zoomControl: false }).setView([36.0, 137.5], 5);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }).addTo(map);
            L.control.zoom({ position: 'topright' }).addTo(map);

            const grid = document.getElementById('legendGrid');
            palette.forEach(c => {
                const b = document.createElement('div'); b.className = 'flex-1 h-1.5 rounded-full';
                b.style.backgroundColor = c; grid.appendChild(b);
            });

            try {
                const res = await fetch('https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson');
                const data = await res.json();
                updateItemOptions();
                renderLayer(data);
            } catch (e) { console.error(e); }

            document.getElementById('modeSelect').addEventListener('change', e => { 
                selectedCategory = e.target.value; 
                const tsGroup = document.getElementById('targetSoundGroup');
                const rankingPanel = document.getElementById('rankingPanel');
                const observationPanel = document.getElementById('observationPanel');
                const legendPanel = document.getElementById('legendPanel');
                const cardLabel = document.getElementById('prefCardLabel');

                if (selectedCategory === 'ranking') {
                    tsGroup.style.display = 'none';
                    rankingPanel.classList.add('hidden');
                    observationPanel.classList.add('hidden');
                    legendPanel.classList.add('hidden');
                    cardLabel.innerText = "Overall Top 3 Surnames";
                } else {
                    tsGroup.style.display = 'flex';
                    rankingPanel.classList.remove('hidden');
                    observationPanel.classList.remove('hidden');
                    legendPanel.classList.remove('hidden');
                    cardLabel.innerText = "Target Top 3 Surnames";
                }
                updateItemOptions(); 
                updateMapColors(); 
            });
            document.getElementById('itemSelect').addEventListener('change', e => { 
                selectedItem = e.target.value; updateMapColors(); 
            });
        }

        function updateItemOptions() {
            const s = document.getElementById('itemSelect'); 
            s.innerHTML = '';
            if (selectedCategory === 'ranking') return;
            const items = Object.keys(statsData[selectedCategory]).sort();
            items.forEach(it => { const o = document.createElement('option'); o.value = it; o.text = it; s.appendChild(o); });
            selectedItem = s.value;
        }

        function getColor(v, min, max) {
            if (selectedCategory === 'ranking') return '#2c3e50';
            if (max === min) return palette[0];
            const r = (v - min) / (max - min);
            return palette[Math.min(Math.floor(r * palette.length), palette.length - 1)];
        }

        function style(f) {
            const name = f.properties.nam_ja || f.properties.name;
            let fillColor = '#2c3e50';
            if (selectedCategory !== 'ranking') {
                const data = statsData[selectedCategory][selectedItem];
                if (data) {
                    const v = data.stats[name] || 0;
                    const vals = Object.values(data.stats);
                    fillColor = getColor(v, Math.min(...vals), Math.max(...vals));
                }
            }
            return { fillColor: fillColor, weight: 0.8, color: '#475569', fillOpacity: 0.85 };
        }

        function renderLayer(data) {
            geojson = L.geoJson(data, {
                style: style,
                onEachFeature: (f, l) => {
                    l.on({
                        mouseover: e => { 
                            e.target.setStyle({ weight: 2, color: '#f97316', fillOpacity: 1 }); 
                            updatePrefInsight(f.properties.nam_ja || f.properties.name);
                        },
                        mouseout: e => { geojson.resetStyle(e.target); },
                        click: e => { updatePrefInsight(f.properties.nam_ja || f.properties.name); map.fitBounds(e.target.getBounds()); }
                    });
                }
            }).addTo(map);
            updateVisuals();
        }

        function updatePrefInsight(n) {
            let names = [];
            if (selectedCategory === 'ranking') {
                names = statsData.overall_top[n] || [];
            } else {
                const d = statsData[selectedCategory][selectedItem];
                if (d) names = d.top_names[n] || [];
            }
            document.getElementById('selectedPrefName').innerText = n;
            document.getElementById('prefTopNames').innerHTML = names.map(nm => `
                <div class="flex items-center gap-2"><div class="w-1 h-1 bg-orange-500 rounded-full"></div><div class="text-slate-100 font-medium">${nm}</div></div>
            `).join('') || '<div class="text-slate-500 text-xs italic">データなし</div>';
        }

        function updateMapColors() { if (geojson) { geojson.eachLayer(l => l.setStyle(style(l.feature))); updateVisuals(); } }

        function updateVisuals() {
            if (selectedCategory === 'ranking') return;
            const d = statsData[selectedCategory][selectedItem];
            if (!d) return;
            const vs = Object.values(d.stats);
            const min = Math.min(...vs), max = Math.max(...vs), avg = vs.reduce((a,b)=>a+b,0)/vs.length;
            document.getElementById('scaleMax').innerText = max.toFixed(1) + '%';
            document.getElementById('scaleMin').innerText = min.toFixed(1) + '%';
            document.getElementById('currentRange').innerText = (max-min).toFixed(1) + '%';

            const sorted = Object.entries(d.stats).sort((a,b)=>b[1]-a[1]);
            const top = sorted[0], sec = sorted[1];
            
            let s = '';
            if (selectedCategory === 'dan') {
                s = `頭文字の構成解析：<span class="text-white font-bold">${selectedItem}</span>は全国平均で約<span class="text-orange-400">${avg.toFixed(1)}%</span>を占めます。特に<span class="text-orange-400 font-bold">${top[0]}</span>（${top[1].toFixed(1)}%）で顕著な集中が見られます。`;
            } else if (selectedCategory === 'gyo') {
                s = `<span class="text-white font-bold">${selectedItem}</span>の勢力図では、第1位の<span class="text-orange-400 font-bold">${top[0]}</span>が${top[1].toFixed(1)}%とリード。次いで<span class="text-orange-300 font-bold">${sec[0]}</span>が続いています。`;
            } else {
                s = `個別文字「<span class="text-white font-bold">${selectedItem}</span>」の分布：<span class="text-orange-400 font-bold">${top[0]}</span>での構成比は${top[1].toFixed(1)}%に達し、地域による偏りが明確に現れています。`;
            }
            document.getElementById('observationTip').innerHTML = s;

            const list = document.getElementById('rankingList');
            list.innerHTML = sorted.slice(0, 15).map(([n, v], i) => `
                <div class="flex items-center group cursor-pointer" onclick="updatePrefInsight('${n}')">
                    <div class="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[9px] font-bold text-slate-500 group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-all mr-3">${i+1}</div>
                    <div class="flex-1 overflow-hidden">
                        <div class="text-xs font-semibold text-slate-300 group-hover:text-white transition-all truncate">${n}</div>
                    </div>
                    <div class="text-right ml-3 flex-shrink-0">
                        <div class="text-[10px] font-bold text-white">${v.toFixed(2)}<span class="text-[8px] ml-0.5 text-slate-500">%</span></div>
                    </div>
                </div>
            `).join('');
        }
        init();
    </script>
</body>
</html>
"""

final_html = html_template.replace('{stats_placeholder}', json.dumps(stats_data, ensure_ascii=False))
with open(os.path.join(dir_path, 'leaflet_analysis.html'), 'w', encoding='utf-8') as f:
    f.write(final_html)

print('Premium Leaflet Dashboard v2.6 generated: leaflet_analysis.html')
