import React from 'react';
import { Database, Share2, Info } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 z-50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Database size={20} />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-primary leading-tight">University Data Explorer</h1>
                    <p className="text-xs text-slate-400 font-medium">11年間の大学進学率推移と男女格差分析</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors">
                    <Share2 size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors">
                    <Info size={18} />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-2" />
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-slate-600">SCHOOL BASIC SURVEY</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
