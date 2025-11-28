import React, { useEffect, useRef } from 'react';
    import { AgentLog } from '../types';
    import { Terminal, Cpu, Database, AlertCircle } from 'lucide-react';
    
    interface LogViewerProps {
      logs: AgentLog[];
    }
    
    export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
      const endRef = useRef<HTMLDivElement>(null);
    
      useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [logs]);
    
      const getIcon = (type: AgentLog['type']) => {
        switch (type) {
          case 'thought': return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
          case 'tool_call': return <Terminal className="w-3.5 h-3.5 text-blue-400" />;
          case 'tool_result': return <Database className="w-3.5 h-3.5 text-emerald-400" />;
          case 'error': return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
          default: return <div className="w-3.5 h-3.5 bg-slate-600 rounded-full" />;
        }
      };
    
      const getColor = (type: AgentLog['type']) => {
        switch (type) {
          case 'thought': return 'text-purple-300 border-purple-500/20 bg-purple-500/5';
          case 'tool_call': return 'text-blue-300 border-blue-500/20 bg-blue-500/5';
          case 'tool_result': return 'text-emerald-300 border-emerald-500/20 bg-emerald-500/5';
          case 'error': return 'text-red-300 border-red-500/20 bg-red-500/5';
          default: return 'text-slate-300 border-slate-700';
        }
      };
    
      return (
        <div className="bg-slate-950 rounded-xl border border-slate-800 flex flex-col h-full font-mono text-sm shadow-inner">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">系统日志流 (System Logs)</span>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
            {logs.length === 0 && (
                <div className="text-slate-600 text-xs italic text-center mt-10">
                    系统就绪。等待初始化子进程...
                </div>
            )}
            {logs.map((log) => (
              <div key={log.id} className={`flex gap-3 p-2 rounded border ${getColor(log.type)}`}>
                <div className="mt-0.5 shrink-0 opacity-70">{getIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                         <span className="font-bold text-[11px] uppercase opacity-60">{log.type.replace('_', ' ')}</span>
                         <span className="text-[10px] opacity-40">{log.timestamp}</span>
                    </div>
                  <div className="whitespace-pre-wrap break-words leading-relaxed">
                    {log.message}
                  </div>
                  {log.detail && (
                    <div className="mt-2 p-2 bg-black/30 rounded text-xs text-slate-400 border border-slate-800 overflow-x-auto">
                      <code>{log.detail}</code>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>
      );
    };