import React, { useState } from 'react';
import { Play, Activity, Server, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  onStartMission: (mission: string) => void;
  isProcessing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onStartMission, isProcessing }) => {
  const [mission, setMission] = useState("检测变更单 ECN-2025-001，检查受影响物料库存；如果产线正在运行，则强制锁定相关工单。");

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col h-full shadow-xl z-10">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">工业<span className="text-blue-500">智能体</span></h1>
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Command Center v2.1</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide flex items-center gap-2">
             <Play className="w-4 h-4" /> 任务指挥舱
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">业务指令输入</label>
              <textarea 
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-32 font-mono leading-relaxed"
                placeholder="请输入业务指令..."
                disabled={isProcessing}
              />
            </div>
            
            <button
              onClick={() => onStartMission(mission)}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg
                ${isProcessing 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 hover:shadow-blue-600/40'
                }`}
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  智能体运行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  启动智能体
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">系统状态监控</h2>
          <div className="space-y-2">
            <StatusRow label="LangGraph 核心" status="在线" color="green" />
            <StatusRow label="MCP: PLM 连接器" status="已连接" color="green" />
            <StatusRow label="MCP: MES 连接器" status="已连接" color="green" />
            <StatusRow label="MCP: ERP 连接器" status="已连接" color="green" />
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> 安全协议
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
                L3 级操作（如产线停机）已启用“人机回环”验证机制，确保生产安全。
            </p>
        </div>
      </div>
      
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <span className="text-[10px] text-slate-600 font-mono">Session ID: 8X-2938-ALPHA</span>
      </div>
    </div>
  );
};

const StatusRow: React.FC<{ label: string; status: string; color: 'green' | 'yellow' | 'red' }> = ({ label, status, color }) => {
  const colorClasses = {
    green: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    yellow: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    red: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
  };

  return (
    <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded border border-slate-700">
      <div className="flex items-center gap-2">
        <Server className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-medium text-slate-300">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${colorClasses[color]}`} />
        <span className="text-[10px] font-mono text-slate-400 uppercase">{status}</span>
      </div>
    </div>
  );
};