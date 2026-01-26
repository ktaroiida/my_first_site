import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

const MapChart = ({ data, geoJson, selectedPref, onPrefSelect }) => {
    const dataMap = useMemo(() => {
        const map = {};
        data.forEach(d => {
            map[d.Prefecture] = d;
        });
        return map;
    }, [data]);

    const getColor = (prefName) => {
        const d = dataMap[prefName];
        if (!d) return '#E2E8F0';
        const rate = (d.Male_Rate + d.Female_Rate) / 2;
        // Rates generally vary from 30% to 75%
        if (rate > 70) return '#1E293B';
        if (rate > 60) return '#334155';
        if (rate > 50) return '#475569';
        if (rate > 40) return '#64748B';
        return '#94A3B8';
    };

    const style = (feature) => {
        const prefName = feature.properties.name_ja || feature.properties.name;
        const isSelected = selectedPref === prefName;
        return {
            fillColor: getColor(prefName),
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected ? '#1E293B' : 'white',
            fillOpacity: 0.8
        };
    };

    const onEachFeature = (feature, layer) => {
        const prefName = feature.properties.name_ja || feature.properties.name;

        layer.on({
            mouseover: (e) => {
                const l = e.target;
                l.setStyle({
                    fillOpacity: 1,
                    weight: 2,
                    color: '#1E293B'
                });
                l.bringToFront();
            },
            mouseout: (e) => {
                const l = e.target;
                if (selectedPref !== prefName) {
                    layer.setStyle(style(feature));
                }
            },
            click: () => {
                onPrefSelect(prefName);
            }
        });

        const d = dataMap[prefName];
        if (d) {
            const avg = ((d.Male_Rate + d.Female_Rate) / 2).toFixed(1);
            layer.bindTooltip(`<strong>${prefName}</strong><br/>進学率: ${avg}%`, {
                sticky: true,
                direction: 'top',
                className: 'custom-tooltip'
            });
        }
    };

    return (
        <div className="w-full h-full bg-[#F8FAFC] relative">
            <MapContainer
                center={[37.5, 137.5]}
                zoom={6}
                zoomControl={false}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {geoJson && (
                    <GeoJSON
                        data={geoJson}
                        style={style}
                        onEachFeature={onEachFeature}
                    />
                )}
                <MapAutoZoom selectedPref={selectedPref} geoJson={geoJson} />
            </MapContainer>

            {/* Legend */}
            <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">進学率スコア</h4>
                <div className="flex flex-col gap-2">
                    {[
                        { label: '70%+', color: '#1E293B' },
                        { label: '60% - 70%', color: '#334155' },
                        { label: '50% - 60%', color: '#475569' },
                        { label: '40% - 50%', color: '#64748B' },
                        { label: '< 40%', color: '#94A3B8' }
                    ].map(item => (
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

// Component to handle auto-zooming/panning to selected prefecture if needed
const MapAutoZoom = ({ selectedPref, geoJson }) => {
    const map = useMap();

    useEffect(() => {
        if (!selectedPref || !geoJson) return;
        // Find feature
        const feature = geoJson.features.find(f => (f.properties.name_ja || f.properties.name) === selectedPref);
        if (feature) {
            // For now, let's just keep the center standard, 
            // but we could map.flyTo if we wanted extreme interaction.
        }
    }, [selectedPref, geoJson, map]);

    return null;
};

export default MapChart;
