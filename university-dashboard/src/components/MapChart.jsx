import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const MapChart = ({ data, geoJson, selectedPref, onPrefSelect, dataType = 'total' }) => {
    // Handle clicks on the map background (sea)
    const MapEvents = () => {
        useMapEvents({
            click: (e) => {
                onPrefSelect(null);
            }
        });
        return null;
    };

    const normalize = (name) => name ? name.replace(/[県府都]$/, "").trim() : "";

    const getColor = (prefName) => {
        const normName = normalize(prefName);
        const d = data.find(item => normalize(item.Prefecture) === normName);
        if (!d) return '#F8FAFC';

        let rate;
        if (dataType === 'gap') {
            const gap = d.Male_Rate - d.Female_Rate;
            // Male significantly higher (>10pt) -> Deep Blue
            if (gap >= 10) return '#1e3a8a';
            // Male moderately higher (5-10pt) -> Blue
            if (gap >= 5) return '#3b82f6';
            // Male slightly higher (0-5pt) -> Light Blue
            if (gap >= 0) return '#dbeafe';
            // Female slightly higher (0-5pt) -> Light Rose
            if (gap >= -5) return '#ffe4e6';
            // Female moderately higher (5-10pt) -> Rose
            if (gap >= -10) return '#f43f5e';
            // Female significantly higher (>10pt) -> Deep Rose
            return '#881337';
        } else if (dataType === 'male') {
            rate = d.Male_Rate;
            if (rate > 70) return '#1e3a8a';
            if (rate > 60) return '#1d4ed8';
            if (rate > 50) return '#3b82f6';
            if (rate > 40) return '#60a5fa';
            return '#dbeafe';
        } else if (dataType === 'female') {
            rate = d.Female_Rate;
            if (rate > 70) return '#881337';
            if (rate > 60) return '#be123c';
            if (rate > 50) return '#f43f5e';
            if (rate > 40) return '#fb7185';
            return '#ffe4e6';
        } else {
            rate = (d.Male_Rate + d.Female_Rate) / 2;
            if (rate > 70) return '#0F172A';
            if (rate > 60) return '#334155';
            if (rate > 50) return '#64748B';
            if (rate > 40) return '#94A3B8';
            return '#CBD5E1';
        }
    };

    const getLegendColors = () => {
        if (dataType === 'gap') {
            return [
                { label: '男子 +10pt以上', color: '#1e3a8a' },
                { label: '男子 +5~10pt', color: '#3b82f6' },
                { label: '男子 +0~5pt', color: '#dbeafe' },
                { label: '女子 +0~5pt', color: '#ffe4e6' },
                { label: '女子 +5~10pt', color: '#f43f5e' },
                { label: '女子 +10pt以上', color: '#881337' }
            ];
        } else if (dataType === 'male') {
            return [
                { label: '70%+', color: '#1e3a8a' },
                { label: '60% - 70%', color: '#1d4ed8' },
                { label: '50% - 60%', color: '#3b82f6' },
                { label: '40% - 50%', color: '#60a5fa' },
                { label: '<40%', color: '#dbeafe' }
            ];
        } else if (dataType === 'female') {
            return [
                { label: '70%+', color: '#881337' },
                { label: '60% - 70%', color: '#be123c' },
                { label: '50% - 60%', color: '#f43f5e' },
                { label: '40% - 50%', color: '#fb7185' },
                { label: '<40%', color: '#ffe4e6' }
            ];
        } else {
            return [
                { label: '70%+', color: '#0F172A' },
                { label: '60% - 70%', color: '#334155' },
                { label: '50% - 60%', color: '#64748B' },
                { label: '40% - 50%', color: '#94A3B8' },
                { label: '<40%', color: '#CBD5E1' }
            ];
        }
    };

    const style = (feature) => {
        const prefName = feature.properties.nam_ja || feature.properties.nam;
        const isSelected = selectedPref && normalize(selectedPref) === normalize(prefName);
        return {
            fillColor: isSelected ? '#F59E0B' : getColor(prefName),
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected ? '#B45309' : 'white',
            fillOpacity: 1
        };
    };

    const onEachFeature = (feature, layer) => {
        const prefName = feature.properties.nam_ja || feature.properties.nam;

        layer.on({
            mouseover: (e) => {
                const l = e.target;
                const isSelected = selectedPref && normalize(selectedPref) === normalize(prefName);
                if (!isSelected) {
                    // Determine hover color based on current type to avoid reverting to default
                    let hoverStrokeStart = '#334155';
                    if (dataType === 'gap') hoverStrokeStart = '#64748B';

                    l.setStyle({
                        fillOpacity: 1,
                        weight: 2,
                        color: hoverStrokeStart,
                        fillColor: getColor(prefName) // Ensure fill color stays correct and opaque
                    });
                }
                l.bringToFront();
            },
            mouseout: (e) => {
                const l = e.target;
                const isSelected = selectedPref && normalize(selectedPref) === normalize(prefName);
                if (!isSelected) {
                    // Reset to base style
                    const baseStyle = style(feature);
                    l.setStyle(baseStyle);
                }
            },
            click: (e) => {
                L.DomEvent.stopPropagation(e);
                onPrefSelect(prefName);
            }
        });

        const normName = normalize(prefName);
        const d = data.find(item => normalize(item.Prefecture) === normName);
        if (d) {
            let tooltipText = `<strong>${prefName}</strong><br/>`;
            let rateVal = 0;
            if (dataType === 'gap') {
                const gap = d.Male_Rate - d.Female_Rate;
                const sign = gap > 0 ? '+' : '';
                tooltipText += `男女差: ${sign}${gap.toFixed(1)}pt<br/>`;
                tooltipText += `<span style="font-size:0.8em">男:${d.Male_Rate.toFixed(1)}% / 女:${d.Female_Rate.toFixed(1)}%</span>`;
            } else if (dataType === 'male') {
                rateVal = d.Male_Rate;
                tooltipText += `男子進学率: ${rateVal.toFixed(1)}%`;
            } else if (dataType === 'female') {
                rateVal = d.Female_Rate;
                tooltipText += `女子進学率: ${rateVal.toFixed(1)}%`;
            } else {
                rateVal = (d.Male_Rate + d.Female_Rate) / 2;
                tooltipText += `総合進学率: ${rateVal.toFixed(1)}%`;
            }

            layer.bindTooltip(tooltipText, {
                sticky: true,
                direction: 'top',
                className: 'custom-tooltip'
            });
        }
    };

    return (
        <div className="w-full h-full bg-[#F8FAFC] relative">
            <MapContainer center={[37.5, 137.5]} zoom={6} zoomControl={false} className="w-full h-full">
                <MapEvents />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />
                {/* Adding key={dataType} forces the GeoJSON layer to re-mount when type changes, 
                    preventing stale closure issues in event listeners (hover colors) */}
                {geoJson && <GeoJSON key={dataType} data={geoJson} style={style} onEachFeature={onEachFeature} />}
            </MapContainer>

            <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${dataType === 'male' ? 'text-blue-900' :
                        dataType === 'female' ? 'text-rose-900' :
                            dataType === 'gap' ? 'text-slate-800' : 'text-[#0F172A]'
                    }`}>
                    {dataType === 'male' ? '男子進学率' : dataType === 'female' ? '女子進学率' : dataType === 'gap' ? '男女ギャップ' : '総合進学率'}スコア
                </h4>
                <div className="flex flex-col gap-2">
                    {getLegendColors().map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs font-medium text-slate-600">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapChart;
