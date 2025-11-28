import React from 'react';
import { KpiData } from '../types';
import { AlertTriangle, Package, Timer, Zap } from 'lucide-react';

interface KPIDashboardProps {
  data: KpiData;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <KpiCard 
        label="受影响物料" 
        value={data.affectedItem || "N/A"} 
        icon={<Package className="w-4 h-4 text-blue-400" />}
        subVal="SKU 校验"
      />
      <KpiCard 
        label="风险等级" 
        value={data.riskLevel === 'High' ? '高' : data.riskLevel === 'Medium' ? '中' : '低'} 
        icon={<AlertTriangle className={`w-4 h-4 ${data.riskLevel === 'High' ? 'text-red-500' : 'text-yellow-500'}`} />}
        valueColor={data.riskLevel === 'High' ? 'text-red-400' : 'text-slate-200'}
        subVal="自动评估中"
      />
      <KpiCard 
        label="产线状态" 
        value={data.lineStatus === 'Running' ? '运行中' : data.lineStatus === 'Paused' ? '已暂停' : '维护中'} 
        icon={<Zap className="w-4 h-4 text-amber-400" />}
        valueColor={data.lineStatus === 'Paused' ? 'text-amber-400' : 'text-emerald-400'}
        subVal="实时 MES 数据"
      />
      <KpiCard 
        label="处理耗时" 
        value={data.processTime} 
        icon={<Timer className="w-4 h-4 text-slate-400" />}
        subVal="任务周期"
      />
    </div>
  );
};

const KpiCard: React.FC<{ 
    label: string; 
    value: string; 
    icon: React.ReactNode; 
    valueColor?: string;
    subVal?: string;
}> = ({ label, value, icon, valueColor = 'text-slate-100', subVal }) => (
  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
    {/* Glow Effect */}
    <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
    
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="bg-slate-900/50 p-1.5 rounded-md border border-slate-700/50">
        {icon}
      </div>
    </div>
    <div className={`text-2xl font-bold font-mono tracking-tight ${valueColor}`}>
      {value}
    </div>
    {subVal && <div className="text-[10px] text-slate-500 mt-1">{subVal}</div>}
  </div>
);