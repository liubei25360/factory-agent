import { GoogleGenAI, Type } from "@google/genai";
import { AgentLog, PlanStep } from "../types";

// Initialize Gemini
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * STAGE 1: PLANNER
 * Generates a list of steps based on the user mission.
 */
export const generatePlan = async (mission: string): Promise<PlanStep[]> => {
  try {
    const model = ai.models;
    
    const systemInstruction = `
      你是一个专业的工业规划智能体 (Industrial Planner Agent)。
      你的目标是将制造任务分解为 3-6 个逻辑步骤。
      请使用中文生成步骤描述。
      
      可用工具 (MCP):
      - PLM系统: search_ecn(id) - 查询变更单
      - ERP系统: check_inventory(item_id) - 检查库存
      - MES系统: check_line_status(line_id) - 检查产线, lock_production_order(job_id) - 锁定工单
      - 通知系统: send_notification(user) - 发送通知
      
      输出一个 JSON 数组。每个步骤必须包含简短的中文 'description' 和 'tool' 名称。
    `;

    const prompt = `任务目标: ${mission}. 请生成严格的 JSON 响应。`;

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    tool: { type: Type.STRING }
                },
                required: ["description", "tool"]
            }
        }
      }
    });

    const stepsRaw = JSON.parse(response.text || "[]");
    
    return stepsRaw.map((s: any, i: number) => ({
      id: `step-${i}`,
      description: s.description,
      tool: s.tool,
      status: 'pending'
    }));

  } catch (error) {
    console.error("Planning failed", error);
    // Fallback plan if API fails or key is missing
    return [
      { id: 'f1', description: '分析用户请求 (Fallback)', tool: 'System', status: 'pending' },
      { id: 'f2', description: '查询 PLM 数据', tool: 'PLM_Adapter', status: 'pending' },
      { id: 'f3', description: '汇报执行结果', tool: 'Reporter', status: 'pending' }
    ];
  }
};

/**
 * STAGE 2: EXECUTOR / REASONER
 * Generates a "thought" before calling a tool.
 */
export const generateThought = async (currentStep: PlanStep, context: string): Promise<string> => {
    if (!apiKey) return `正在执行 ${currentStep.tool}...`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `当前步骤: ${currentStep.description}. 上下文: ${context}. 请用简练的中文生成一句思考（Thought），说明接下来需要提取什么参数并检查什么。`,
            config: {
                maxOutputTokens: 60
            }
        });
        return response.text || "处理中...";
    } catch (e) {
        return "分析下一步行动...";
    }
};