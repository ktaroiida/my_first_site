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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
            --card-bg: rgba(30, 41, 59, 0.8);
        }
        body { 
            font-family: 'Outfit', 'Noto Sans JP', sans-serif; 
            background-color: var(--bg-dark); 
            color: #e2e8f0;
            margin: 0;
            /* Allow scrolling on mobile, hide on desktop app-style */
            height: 100%;
            overflow: auto;
        }
        @media (min-width: 1280px) {
            body { overflow: hidden; }
        }
        .main-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 1rem;
            box-sizing: border-box;
        }
        @media (min-width: 1280px) {
            .main-container { height: 100vh; padding: 1.5rem; }
        }
        .glass-panel {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }
        .text-glow {
            text-shadow: 0 0 10px var(--accent-glow);
        }
        #map {
            height: 400px; /* Base height for mobile */
            width: 100%;
            border-radius: 1rem;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
            z-index: 1;
        }
        @media (min-width: 1280px) {
            #map { height: 100%; }
        }
        .leaflet-container {
            background: #0b1120 !important;
        }
        .select-custom {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            color: white;
            padding: 0.6rem 1rem;
            border-radius: 0.75rem;
            outline: none;
            font-size: 16px; /* Prevent iPhone zoom on focus */
            transition: all 0.3s;
        }
        .select-custom:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 2px var(--accent-glow); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
    </style>
</head>
<body class="h-full">
    <div class="main-container max-w-[1700px] mx-auto">
        <header class="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-4 gap-4 flex-shrink-0">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-full border border-orange-500/20 tracking-widest uppercase">Mobile Optimized v2.8</span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">苗字頭文字分布 <span class="text-glow text-orange-500">Insights</span></h1>
                <p class="text-slate-400 text-xs md:text-sm font-light">全国上位1000件の苗字データ。地域に眠る「響き」を解読しよう。</p>
            </div>
            
            <div class="glass-panel p-3 flex gap-3 w-full lg:w-auto overflow-x-auto justify-between lg:justify-start">
                <div class="flex flex-col min-w-[140px]">
                    <label class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Category</label>
                    <select id="modeSelect" class="select-custom text-xs font-semibold">
                        <option value="gyo">行単位 (Gyo)</option>
                        <option value="dan">段単位 (Dan)</option>
                        <option value="char">50音単位 (Char)</option>
                        <option value="ranking">苗字ランキング (Ranking)</option>
                    </select>
                </div>
                <div id="targetSoundGroup" class="flex flex-col min-w-[100px]">
                    <label class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target</label>
                    <select id="itemSelect" class="select-custom text-xs font-semibold">
                    </select>
                </div>
            </div>
        </header>

        <div class="flex flex-col xl:grid xl:grid-cols-12 gap-4 flex-grow overflow-hidden">
            <!-- Sidebar: Order changes on mobile (Map first, then Data) -->
            <div class="order-2 xl:order-1 xl:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
                <!-- Selected Pref Detail -->
                <div id="prefInsightCard" class="glass-panel p-4 border-l-4 border-l-orange-500 flex-shrink-0 transition-all">
                    <h2 id="selectedPrefName" class="text-lg font-bold text-white mb-0.5">都道府県を選択</h2>
                    <div id="prefCardLabel" class="text-[8px] font-bold text-orange-500 uppercase tracking-widest mb-2">Representative Surnames</div>
                    <div id="prefTopNames" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-1 gap-1.5 text-xs">
                        <div class="text-slate-500 italic py-2 col-span-full">地図をタップ/ホバー</div>
                    </div>
                </div>

                <!-- Ranking (Visible on Tablet/PC) -->
                <div id="rankingPanel" class="glass-panel p-4 flex-grow overflow-hidden flex flex-col hidden md:flex">
                    <h2 class="text-[8px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-3 flex items-center">
                        <span class="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                        Top Ranking
                    </h2>
                    <div id="rankingList" class="space-y-2.5 overflow-y-auto flex-grow custom-scrollbar pr-1"></div>
                </div>

                <!-- Observation -->
                <div id="observationPanel" class="glass-panel p-4 relative group flex-shrink-0">
                    <h3 class="text-[8px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-1.5">Observation</h3>
                    <div id="observationTip" class="text-slate-300 text-[11px] leading-snug font-light"></div>
                </div>
            </div>

            <!-- Map View: Order 1 on mobile -->
            <div class="order-1 xl:order-2 xl:col-span-9 relative flex flex-col h-full overflow-hidden">
                <div id="map"></div>
                <!-- Mini Legend -->
                <div id="legendPanel" class="absolute bottom-3 left-3 glass-panel px-3 py-2 z-[1000] min-w-[120px] pointer-events-none sm:pointer-events-auto">
                    <div class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Density</div>
                    <div id="legendGrid" class="flex gap-0.5 mb-1.5"></div>
                    <div class="flex justify-between text-[7px] font-bold">
                        <span class="text-slate-500" id="scaleMin">MIN</span>
                        <span class="text-orange-500" id="currentRange">%</span>
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
            // Check for mobile to adjust zoom behavior
            const isMobile = window.innerWidth < 768;
            map = L.map('map', { 
                zoomControl: !isMobile,
                scrollWheelZoom: !isMobile,
                dragging: true,
                doubleClickZoom: true,
                touchZoom: true
            }).setView([38.0, 137.5], isMobile ? 4 : 5);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }).addTo(map);
            if (!isMobile) L.control.zoom({ position: 'topright' }).addTo(map);

            const grid = document.getElementById('legendGrid');
            palette.forEach(c => {
                const b = document.createElement('div'); b.className = 'flex-1 h-1 rounded-full';
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
                
                if (selectedCategory === 'ranking') {
                    tsGroup.style.opacity = '0';
                    tsGroup.style.pointerEvents = 'none';
                    rankingPanel.style.display = 'none';
                    observationPanel.style.display = 'none';
                    legendPanel.style.display = 'none';
                } else {
                    tsGroup.style.opacity = '1';
                    tsGroup.style.pointerEvents = 'auto';
                    rankingPanel.style.display = 'flex';
                    observationPanel.style.display = 'block';
                    legendPanel.style.display = 'block';
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

        function style(f) {
            const name = f.properties.nam_ja || f.properties.name;
            let fillColor = '#2c3e50';
            if (selectedCategory !== 'ranking') {
                const data = statsData[selectedCategory][selectedItem];
                if (data) {
                    const v = data.stats[name] || 0;
                    const vals = Object.values(data.stats);
                    const min = Math.min(...vals), max = Math.max(...vals);
                    if (max !== min) {
                        const r = (v - min) / (max - min);
                        fillColor = palette[Math.min(Math.floor(r * palette.length), palette.length - 1)];
                    } else {
                        fillColor = palette[0];
                    }
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
                            if (window.innerWidth >= 1280) {
                                e.target.setStyle({ weight: 2, color: '#f97316', fillOpacity: 1 }); 
                                updatePrefInsight(f.properties.nam_ja || f.properties.name);
                            }
                        },
                        mouseout: e => { geojson.resetStyle(e.target); },
                        click: e => { 
                            e.target.setStyle({ weight: 3, color: '#f97316' });
                            updatePrefInsight(f.properties.nam_ja || f.properties.name);
                            if (window.innerWidth < 1280) {
                                // On mobile, scroll to insight card
                                document.getElementById('prefInsightCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }
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
                <div class="flex items-center gap-2 bg-white/5 p-1.5 rounded border border-white/5">
                    <div class="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <div class="text-slate-100 font-medium truncate">${nm}</div>
                </div>
            `).join('') || '<div class="text-slate-500 italic p-2">なし</div>';
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
            const top = sorted[0];
            
            let s = '';
            if (selectedCategory === 'dan') {
                s = `<span class="text-white font-bold">${selectedItem}</span>: 平均${avg.toFixed(1)}%。<span class="text-orange-400 font-bold">${top[0]}</span>（${top[1].toFixed(1)}%）で顕著な集中。`;
            } else if (selectedCategory === 'gyo') {
                s = `<span class="text-white font-bold">${selectedItem}</span>: <span class="text-orange-400 font-bold">${top[0]}</span>が${top[1].toFixed(1)}%で最大密度を記録。`;
            } else {
                s = `<span class="text-white font-bold">${selectedItem}</span>: <span class="text-orange-400 font-bold">${top[0]}</span>が最大密度。`;
            }
            document.getElementById('observationTip').innerHTML = s;

            const list = document.getElementById('rankingList');
            if (list) {
                list.innerHTML = sorted.slice(0, 15).map(([n, v], i) => `
                    <div class="flex items-center group cursor-pointer" onclick="updatePrefInsight('${n}')">
                        <div class="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[9px] font-bold text-slate-500 group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-all mr-3">${i+1}</div>
                        <div class="flex-1 overflow-hidden">
                            <div class="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-all truncate">${n}</div>
                            <div class="w-full bg-white/5 h-1 mt-0.5 rounded-full overflow-hidden leading-[1px]">
                                <div class="bg-orange-500 h-full transition-all" style="width: ${(v/max*100).toFixed(0)}%"></div>
                            </div>
                        </div>
                        <div class="text-right ml-3 flex-shrink-0">
                            <div class="text-[10px] font-bold text-white">${v.toFixed(1)}<span class="text-[7px] ml-0.5 text-slate-500">%</span></div>
                        </div>
                    </div>
                `).join('');
            }
        }
        init();
    </script>
</body>
</html>
"""

final_html = html_template.replace('{stats_placeholder}', json.dumps(stats_data, ensure_ascii=False))
with open(os.path.join(dir_path, 'leaflet_analysis.html'), 'w', encoding='utf-8') as f:
    f.write(final_html)

# Also update the root index.html for Vercel
root_index_path = '/Users/kentaroiida/Desktop/20260119test/index.html'
with open(root_index_path, 'w', encoding='utf-8') as f:
    f.write(final_html)

print('Premium Leaflet Dashboard v2.8 (Mobile Optimized) generated.')
