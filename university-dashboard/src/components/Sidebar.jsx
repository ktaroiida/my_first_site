import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Award, Users, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

const Sidebar = ({ prefName, year, trendData, rank }) => {
    if (!trendData || trendData.length === 0) {
        return (
            <aside className="w-[420px] bg-white border-l flex flex-col items-center justify-center p-8 text-slate-400">
                <AlertCircle size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-bold">データが見つかりません</p>
                <p className="text-xs mt-1">{prefName}のデータを読み込めませんでした</p>
            </aside>
        );
    }

    const latest = trendData.find(d => d.Year === year) || trendData[trendData.length - 1];
    const first = trendData[0];
    const latestAvg = (latest.Male_Rate + latest.Female_Rate) / 2;
    const firstAvg = (first.Male_Rate + first.Female_Rate) / 2;
    const rateChange = latestAvg - firstAvg;

    const formattedTrend = trendData.map(d => ({
        year: d.Year,
        male: parseFloat(d.Male_Rate.toFixed(1)),
        female: parseFloat(d.Female_Rate.toFixed(1)),
        avg: parseFloat(((d.Male_Rate + d.Female_Rate) / 2).toFixed(1))
    }));

    return (
        <aside className="w-[420px] bg-white border-l flex flex-col shadow-2xl z-40 overflow-y-auto">
            <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <span className="inline-block px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase tracking-tighter mb-2">Prefecture Profile</span>
                        <h2 className="text-4xl font-bold text-primary tracking-tight">{prefName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-slate-400">{year}年度 進学率データ</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                            <Award size={14} />
                            <span className="text-[10px] font-bold uppercase">National Rank</span>
                        </div>
                        <div className="text-3xl font-black text-primary">
                            <span className="text-sm mr-0.5">第</span>{rank}<span className="text-sm ml-0.5 font-bold">位</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">平均進学率</div>
                        <div className="text-2xl font-bold flex items-baseline gap-1">
                            {latestAvg.toFixed(1)}
                            <span className="text-xs text-slate-400">%</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">11年間比</div>
                        <div className={`text-2xl font-bold flex items-center gap-1 ${rateChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {rateChange >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                            {Math.abs(rateChange).toFixed(1)}
                            <span className="text-xs ml-0.5">pt</span>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} className="text-slate-400" />
                            11年間の進学率推移
                        </h3>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="year"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avg"
                                    stroke="#1E293B"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#1E293B', strokeWidth: 2, stroke: 'white' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line type="monotone" dataKey="male" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={false} opacity={0.3} />
                                <Line type="monotone" dataKey="female" stroke="#F43F5E" strokeWidth={2} strokeDasharray="5 5" dot={false} opacity={0.3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Users size={14} className="text-slate-400" />
                        男女別進学率
                    </h3>
                    <div className="flex flex-col gap-6">
                        <div className="space-y-4">
                            <div className="relative pt-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-xs font-bold text-slate-600">男子学生</span>
                                    </div>
                                    <span className="text-xs font-black text-primary">{latest.Male_Rate.toFixed(1)}%</span>
                                </div>
                                <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-slate-100">
                                    <div style={{ width: `${latest.Male_Rate}%` }} className="bg-blue-500 rounded-full transition-all duration-1000"></div>
                                </div>
                            </div>

                            <div className="relative pt-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                        <span className="text-xs font-bold text-slate-600">女子学生</span>
                                    </div>
                                    <span className="text-xs font-black text-primary">{latest.Female_Rate.toFixed(1)}%</span>
                                </div>
                                <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-slate-100">
                                    <div style={{ width: `${latest.Female_Rate}%` }} className="bg-rose-500 rounded-full transition-all duration-1000"></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-[#F1F5F9] rounded-2xl border border-dashed border-slate-300">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">進学率ギャップ (M-F)</span>
                                <span className={`text-sm font-black ${latest.Gap >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                                    {latest.Gap > 0 ? '+' : ''}{latest.Gap.toFixed(2)} pt
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">※学校基本調査の「大学（学部）進学率」を元に算出しています。</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
