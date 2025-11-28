export enum AgentStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}

export interface PlanStep {
  id: string;
  description: string;
  tool?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  type: 'info' | 'thought' | 'tool_call' | 'tool_result' | 'error' | 'success';
  message: string;
  detail?: string;
}

export interface KpiData {
  affectedItem: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  lineStatus: 'Running' | 'Paused' | 'Maintenance';
  processTime: string;
}

export interface AgentState {
  status: AgentStatus;
  plan: PlanStep[];
  currentStepIndex: number;
  logs: AgentLog[];
  kpi: KpiData;
}
