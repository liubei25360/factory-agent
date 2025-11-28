import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PlanViewer } from './components/PlanViewer';
import { LogViewer } from './components/LogViewer';
import { KPIDashboard } from './components/KPIDashboard';
import { AgentState, AgentStatus, PlanStep, AgentLog, KpiData } from './types';
import { generatePlan, generateThought } from './services/agentBrain';
import { mockMcpTools } from './services/mockMcp';

// Default State
const INITIAL_KPI: KpiData = {
  affectedItem: '-',
  riskLevel: 'Low',
  lineStatus: 'Running',
  processTime: '0s',
};

// Helper to map status to Chinese
const getStatusLabel = (status: AgentStatus) => {
    switch(status) {
        case AgentStatus.IDLE: return "待机 (IDLE)";
        case AgentStatus.PLANNING: return "规划中 (PLANNING)";
        case AgentStatus.EXECUTING: return "执行中 (EXECUTING)";
        case AgentStatus.WAITING_APPROVAL: return "等待审批 (WAITING)";
        case AgentStatus.FINISHED: return "已完成 (FINISHED)";
        case AgentStatus.FAILED: return "失败 (FAILED)";
        default: return status;
    }
};

const App: React.FC = () => {
  const [state, setState] = useState<AgentState>({
    status: AgentStatus.IDLE,
    plan: [],
    currentStepIndex: 0,
    logs: [],
    kpi: INITIAL_KPI
  });
  
  const [startTime, setStartTime] = useState<number | null>(null);

  // Timer for process time
  useEffect(() => {
      if (state.status === AgentStatus.EXECUTING && startTime) {
          const interval = setInterval(() => {
              const diff = ((Date.now() - startTime) / 1000).toFixed(1);
              setState(s => ({ ...s, kpi: { ...s.kpi, processTime: `${diff}s` } }));
          }, 100);
          return () => clearInterval(interval);
      }
  }, [state.status, startTime]);

  const addLog = (type: AgentLog['type'], message: string, detail?: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
        type,
        message,
        detail
      }]
    }));
  };

  const updatePlanStatus = (index: number, status: PlanStep['status'], result?: string) => {
    setState(prev => {
      const newPlan = [...prev.plan];
      newPlan[index] = { ...newPlan[index], status, result };
      return { ...prev, plan: newPlan };
    });
  };

  const updateKPI = (partial: Partial<KpiData>) => {
      setState(prev => ({ ...prev, kpi: { ...prev.kpi, ...partial } }));
  };

  // --- THE LANGGRAPH LOOP SIMULATION ---
  
  const executeStep = async (step: PlanStep, index: number) => {
    // 1. Reason (Thinking)
    addLog('thought', `正在分析步骤: "${step.description}"`, '确定所需的工具参数...');
    const thought = await generateThought(step, state.plan.map(p => p.result).join('; '));
    addLog('thought', thought);

    // 2. Call Tool (Mock MCP)
    addLog('tool_call', `调用 MCP 工具: ${step.tool || 'System'}`);
    
    let resultData = "";
    
    // Simulate Tool Switch Logic
    try {
        if (step.description.toLowerCase().includes('ecn') || step.description.includes('变更')) {
            const res = await mockMcpTools.searchECN('2025-001');
            resultData = JSON.stringify(res.data, null, 2);
            if (res.status === 'success') {
                updateKPI({ affectedItem: res.data.affected_parts[0], riskLevel: 'High' });
            }
        } else if (step.description.toLowerCase().includes('inventory') || step.description.includes('库存')) {
            const res = await mockMcpTools.checkInventory('GEAR-BOX-X1');
            resultData = JSON.stringify(res.data, null, 2);
        } else if (step.description.toLowerCase().includes('production') || step.description.toLowerCase().includes('line') || step.description.includes('产线') || step.description.includes('工单')) {
            if (step.description.toLowerCase().includes('halt') || step.description.toLowerCase().includes('lock') || step.description.includes('锁定') || step.description.includes('停机')) {
                 const res = await mockMcpTools.lockProductionOrder('JOB-8888', 'ECN Conflict (变更冲突)');
                 resultData = JSON.stringify(res.data, null, 2);
                 updateKPI({ lineStatus: 'Paused' });
            } else {
                 const res = await mockMcpTools.checkLineStatus('LINE-04');
                 resultData = JSON.stringify(res.data, null, 2);
            }
        } else {
            await new Promise(r => setTimeout(r, 1000));
            resultData = "Action completed successfully (操作成功).";
        }
        
        addLog('tool_result', `${step.tool} 返回结果:`, resultData);
        updatePlanStatus(index, 'completed', 'Done');
        return true;

    } catch (e) {
        addLog('error', `工具执行失败: ${e}`);
        updatePlanStatus(index, 'failed', 'Error');
        return false;
    }
  };

  const runAgentLoop = async (plan: PlanStep[]) => {
    setState(prev => ({ ...prev, status: AgentStatus.EXECUTING, currentStepIndex: 0 }));
    
    for (let i = 0; i < plan.length; i++) {
      const step = plan[i];
      
      // UI Update: Start Step
      setState(prev => ({ ...prev, currentStepIndex: i }));
      updatePlanStatus(i, 'running');
      
      // Execute
      const success = await executeStep(step, i);
      
      if (!success) {
         addLog('error', '因步骤执行失败，计划已中止。');
         setState(prev => ({ ...prev, status: AgentStatus.FAILED }));
         return;
      }
    }
    
    setState(prev => ({ ...prev, status: AgentStatus.FINISHED }));
    addLog('success', '任务完成。所有步骤已执行。');
  };

  const startMission = async (mission: string) => {
    // Reset State
    setState({
        status: AgentStatus.PLANNING,
        plan: [],
        currentStepIndex: 0,
        logs: [],
        kpi: INITIAL_KPI
    });
    setStartTime(Date.now());

    addLog('info', '收到业务指令', mission);
    addLog('thought', '初始化规划节点 (Planner Node)...');

    // 1. Generate Plan
    const plan = await generatePlan(mission);
    
    setState(prev => ({ ...prev, plan: plan }));
    addLog('success', '计划已生成', JSON.stringify(plan.map(p => p.description)));

    // 2. Start Loop
    setTimeout(() => {
        runAgentLoop(plan);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar onStartMission={startMission} isProcessing={state.status === AgentStatus.PLANNING || state.status === AgentStatus.EXECUTING} />
      
      <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
         {/* Decorative background grids */}
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>

        <div className="z-10 flex flex-col h-full">
            <div className="flex justify-between items-end mb-2">
                <h2 className="text-2xl font-bold text-white">工厂智能体执行看板</h2>
                <div className="text-xs text-slate-500 font-mono">
                    状态: <span className={state.status === AgentStatus.EXECUTING ? "text-blue-400 animate-pulse" : "text-slate-400"}>{getStatusLabel(state.status)}</span>
                </div>
            </div>
            
            <KPIDashboard data={state.kpi} />
            
            <div className="flex gap-6 flex-1 min-h-0">
              <div className="w-5/12 h-full">
                <PlanViewer plan={state.plan} />
              </div>
              <div className="w-7/12 h-full">
                <LogViewer logs={state.logs} />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;