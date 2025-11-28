import React from 'react';
import { PlanStep } from '../types';
import { CheckCircle2, Circle, Clock, Loader2, ArrowRight } from 'lucide-react';

interface PlanViewerProps {
  plan: PlanStep[];
}

export const PlanViewer: React.FC<PlanViewerProps> = ({ plan }) => {
  if (plan.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-700">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-slate-600" />
        </div>
        <p className="text-sm font-medium">等待任务参数</p>
        <p className="text-xs mt-1">请启动智能体以生成执行计划。</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          动态执行计划
        </h3>
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-mono">
            {plan.filter(p => p.status === 'completed').length}/{plan.length} 步骤
        </span>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 space-y-3">
        {plan.map((step, index) => (
          <div 
            key={step.id}
            className={`relative p-4 rounded-lg border transition-all duration-300 ${
              step.status === 'running' 
                ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                : step.status === 'completed'
                ? 'bg-slate-800/50 border-slate-700 opacity-75'
                : 'bg-slate-800 border-slate-700 opacity-50'
            }`}
          >
             {/* Connector Line */}
             {index !== plan.length - 1 && (
                <div className="absolute left-[27px] top-[50px] bottom-[-20px] w-0.5 bg-slate-700 -z-10" />
             )}

            <div className="flex items-start gap-4">
              <div className="mt-1">
                {step.status === 'completed' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {step.status === 'running' && <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />}
                {step.status === 'pending' && <Circle className="w-6 h-6 text-slate-600" />}
                {step.status === 'failed' && <Circle className="w-6 h-6 text-red-500" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-semibold ${step.status === 'running' ? 'text-blue-100' : 'text-slate-200'}`}>
                    Step {index + 1}
                  </h4>
                  {step.tool && (
                    <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                      {step.tool}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 leading-snug">{step.description}</p>
                
                {step.result && (
                    <div className="mt-3 text-xs font-mono bg-slate-950/50 p-2 rounded text-emerald-400 border border-emerald-900/30 flex gap-2 items-start">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{step.result}</span>
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};