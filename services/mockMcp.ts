// This service simulates the "Limbs" of the agent - The MCP Servers.
// In a real app, these would be actual API calls to an MCP bridge.

export const mockMcpTools = {
  searchECN: async (ecnId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
    if (ecnId.includes('2025-001')) {
      return {
        status: "success",
        data: {
          id: ecnId,
          title: "变速箱轴径尺寸调整变更",
          affected_parts: ["GEAR-BOX-X1", "SHAFT-A-99"],
          priority: "高 (High)",
          deadline: "2025-10-10"
        }
      };
    }
    return { status: "error", message: "未找到该变更单 (ECN not found)" };
  },

  checkInventory: async (partId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (partId === "GEAR-BOX-X1") {
      return {
        status: "success",
        data: {
          sku: partId,
          warehouse: "A号原料仓 (WH-A)",
          quantity: 450,
          allocated: 50,
          available: 400
        }
      };
    }
    return { status: "success", data: { sku: partId, quantity: 0 } };
  },

  checkLineStatus: async (lineId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      status: "success",
      data: {
        line: lineId,
        current_job: "JOB-8888 (生产中)",
        status: "运行中 (Active)",
        utilization: "92%"
      }
    };
  },

  lockProductionOrder: async (jobId: string, reason: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      status: "success",
      data: {
        job: jobId,
        action: "已锁定 (LOCKED)",
        reason: reason,
        timestamp: new Date().toISOString()
      }
    };
  },
  
  sendNotification: async (recipient: string, msg: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
          status: "success",
          data: { sent_to: recipient, delivered: true }
      }
  }
};