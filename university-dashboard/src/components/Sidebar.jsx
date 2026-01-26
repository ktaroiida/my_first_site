import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Users, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

const Sidebar = ({ prefName, year, trendData, rank, gapRank }) => {
    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (!trendData || trendData.length === 0) {
        return (
            <motion.aside
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-[380px] bg-white border-l flex flex-col items-center justify-center p-6 text-slate-400"
            >
                <div className="text-center p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                    <AlertCircle size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-bold text-slate-600">都道府県を選択してください</p>
                </div>
            </motion.aside>
        );
    }

    const latest = trendData.find(d => d.Year === year) || trendData[trendData.length - 1];
    const prevYear = trendData.find(d => d.Year === year - 1);

    const latestAvg = (latest.Male_Rate + latest.Female_Rate) / 2;
    const first = trendData[0];
    const firstAvg = (first.Male_Rate + first.Female_Rate) / 2;
    const rateChange = latestAvg - firstAvg;

    const currentGap = latest.Male_Rate - latest.Female_Rate;
    const prevGap = prevYear ? (prevYear.Male_Rate - prevYear.Female_Rate) : null;
    const gapYoY = prevGap !== null ? (currentGap - prevGap) : null;

    const formattedTrend = trendData.map(d => ({
        year: d.Year,
        male: parseFloat(d.Male_Rate.toFixed(1)),
        female: parseFloat(d.Female_Rate.toFixed(1)),
        avg: parseFloat(((d.Male_Rate + d.Female_Rate) / 2).toFixed(1))
    }));

    return (
        <AnimatePresence mode="wait">
            <motion.aside
                key={prefName + year}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-[380px] bg-white border-l flex flex-col shadow-2xl z-40 overflow-hidden h-full"
            >
                <div className="p-6 flex flex-col h-full">
                    {/* Header Section */}
                    <motion.div variants={itemVariants} className="flex items-start justify-between mb-4">
                        <div>
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase tracking-tighter mb-1">Prefecture Profile</span>
                            <h2 className="text-3xl font-bold text-primary tracking-tight">{prefName}</h2>
                            <span className="text-xs font-medium text-slate-400 leading-none">{year}年度 データ</span>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-slate-400 mb-0.5">
                                <Award size={12} />
                                <span className="text-[9px] font-bold uppercase">National Rank</span>
                            </div>
                            <div className="text-2xl font-black text-primary">
                                <span className="text-xs mr-0.5">第</span>{rank}<span className="text-xs ml-0.5 font-bold">位</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Stats Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">平均進学率</div>
                            <div className="text-xl font-bold flex items-baseline gap-1">
                                {latestAvg.toFixed(1)}
                                <span className="text-[10px] text-slate-400">%</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">11年間比</div>
                            <div className={`text-xl font-bold flex items-center gap-1 ${rateChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {rateChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                {Math.abs(rateChange).toFixed(1)}
                                <span className="text-[10px] ml-0.5 font-medium">pt</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chart Section */}
                    <motion.div variants={itemVariants} className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                            <TrendingUp size={12} />
                            進学率推移 (2015-2025)
                        </h3>
                        <div className="h-[120px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formattedTrend} margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="year"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 8, fill: '#94a3b8' }}
                                        interval={0}
                                        padding={{ left: 5, right: 5 }}
                                        dy={5}
                                    />
                                    <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', padding: '8px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="male"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 4, fill: '#3B82F6', stroke: 'white', strokeWidth: 2 }}
                                        animationDuration={1000}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="female"
                                        stroke="#F43F5E"
                                        strokeWidth={2}
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 4, fill: '#F43F5E', stroke: 'white', strokeWidth: 2 }}
                                        animationDuration={1000}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg"
                                        stroke="#1E293B"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 4, fill: '#1E293B', stroke: 'white', strokeWidth: 2 }}
                                        animationDuration={1000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Gender Breakdown Section */}
                    <motion.div variants={itemVariants} className="flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                                <Users size={12} />
                                男女別進学率
                            </h3>
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-[11px] font-bold text-slate-600">男子学生</span>
                                        </div>
                                        <span className="text-[11px] font-black text-primary">{latest.Male_Rate.toFixed(1)}%</span>
                                    </div>
                                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${latest.Male_Rate}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <span className="text-[11px] font-bold text-slate-600">女子学生</span>
                                        </div>
                                        <span className="text-[11px] font-black text-primary">{latest.Female_Rate.toFixed(1)}%</span>
                                    </div>
                                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${latest.Female_Rate}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                                            className="bg-gradient-to-r from-rose-600 to-rose-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <motion.div
                                variants={itemVariants}
                                className="p-4 bg-slate-900 rounded-2xl text-white overflow-hidden relative"
                            >
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">男女差 (ジェンダーギャップ)</span>
                                            <div className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] font-bold text-slate-300">格差の少なさ 全国{gapRank}位</div>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-black">
                                                {Math.abs(currentGap).toFixed(2)} <span className="text-[10px] font-bold text-slate-400">pt</span>
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${currentGap > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                {currentGap > 0 ? '男子が高い' : currentGap < 0 ? '女子が高い' : '差なし'}
                                            </span>
                                        </div>
                                        {gapYoY !== null && (
                                            <div className={`mt-1 text-[9px] font-bold flex items-center ${Math.abs(currentGap) < Math.abs(prevGap) ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {Math.abs(currentGap) < Math.abs(prevGap) ? '前年より格差縮小' : '前年より格差拡大'}
                                                <span className="ml-1 opacity-70">({Math.abs(gapYoY).toFixed(2)}pt)</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`p-1.5 rounded-lg ${Math.abs(currentGap) <= 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Users size={18} />
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                            </motion.div>

                            <div className="pt-2 text-center border-t border-slate-100">
                                <p className="text-[8px] text-slate-400 font-medium">※格差の順位は「男女間の進学率の差が小さい順」です。</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
};

export default Sidebar;
