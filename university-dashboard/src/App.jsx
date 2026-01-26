import React, { useState, useEffect } from 'react';
import { dataService } from './services/DataService';
import MapChart from './components/MapChart';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import YearSlider from './components/YearSlider';
import { Loader2 } from 'lucide-react';

function App() {
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [dataType, setDataType] = useState('total');

    const [selectedPref, setSelectedPref] = useState('東京都');
    const [yearlyData, setYearlyData] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                await dataService.init();
                setYearlyData(dataService.getYearlyData(2025));
                setLoading(false);
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!loading) {
            setYearlyData(dataService.getYearlyData(selectedYear));
        }
    }, [selectedYear, loading]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-primary">
                <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-50" />
                <p className="font-medium animate-pulse">データを読み込み中...</p>
            </div>
        );
    }

    const categoryOptions = [
        { id: 'total', label: '総合' },
        { id: 'male', label: '男子' },
        { id: 'female', label: '女子' },
        { id: 'gap', label: '男女差' },
    ];

    return (
        <div className="h-screen flex flex-col bg-background font-sans overflow-hidden">
            <Header />
            <main className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 relative">
                    <MapChart
                        data={yearlyData}
                        geoJson={dataService.geoJson}
                        selectedPref={selectedPref}
                        onPrefSelect={setSelectedPref}
                        dataType={dataType}
                    />

                    {/* Category Switcher */}
                    <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1">
                        {categoryOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setDataType(opt.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${dataType === opt.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-6">
                        <YearSlider year={selectedYear} years={dataService.years} onChange={setSelectedYear} />
                    </div>
                </div>
                <Sidebar
                    prefName={selectedPref}
                    year={selectedYear}
                    trendData={dataService.getPrefectureTrend(selectedPref)}
                    rank={dataService.getPrefectureRank(selectedYear, selectedPref)}
                    gapRank={dataService.getGenderGapRank(selectedYear, selectedPref)}
                />
            </main>
        </div>
    );
}

export default App;
