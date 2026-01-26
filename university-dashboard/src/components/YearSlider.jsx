import React from 'react';
import { Calendar } from 'lucide-react';

const YearSlider = ({ year, years, onChange }) => {
    return (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-2xl flex items-center gap-8 ring-1 ring-black/[0.05]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                    <Calendar size={20} />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Year</div>
                    <div className="text-xl font-black text-primary leading-none mt-0.5">{year}<span className="text-xs ml-1 font-bold">年度</span></div>
                </div>
            </div>

            <div className="flex-1 px-4 relative flex items-center h-12">
                {/* Track Track */}
                <div className="absolute left-4 right-4 h-1 bg-slate-200 rounded-full" />

                {/* Input Range */}
                <input
                    type="range"
                    min={years[0]}
                    max={years[years.length - 1]}
                    step={1}
                    value={year}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full appearance-none bg-transparent relative z-10 cursor-pointer accent-primary
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[5px] [&::-webkit-slider-thumb]:border-primary
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110"
                />

                {/* Year Markers */}
                <div className="absolute top-8 left-4 right-4 flex justify-between">
                    {years.map((y, i) => (
                        <span
                            key={y}
                            className={`text-[9px] font-bold transition-all ${y === year ? 'text-primary' : 'text-slate-300'}`}
                        >
                            '{(y % 100).toString().padStart(2, '0')}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default YearSlider;
