import { motion } from 'framer-motion';
import { Database, Share2, Info } from 'lucide-react';

const Header = () => {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-16 border-b bg-white flex items-center justify-between px-6 z-50"
        >
            <div className="flex items-center gap-3 text-slate-800">
                <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="w-10 h-10 bg-[#1E293B] rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20"
                >
                    <Database size={20} />
                </motion.div>
                <div>
                    <h1 className="text-lg font-black leading-tight tracking-tight text-slate-900">大学進学率データ分析ダッシュボード</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">都道府県別ジェンダーギャップ分析 (2015-2025)</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase"
                >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-600">SCHOOL BASIC SURVEY</span>
                </motion.div>
            </div>
        </motion.header>
    );
};

export default Header;
