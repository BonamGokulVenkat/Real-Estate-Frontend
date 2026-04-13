import { apiClient } from "@/lib/apiClient";

export const subscriptionService = {
  async getActivePlans() {
    const response = await apiClient.get(`/subscription/plans`);
    return response.data;
  },

  async getAllPlans() {
    const response = await apiClient.get(`/subscription/admin/plans`);
    return response.data;
  },

  async createPlan(plan: any) {
    const response = await apiClient.post(`/subscription/admin/plans`, plan);
    return response.data;
  },

  async updatePlan(id: string, plan: any) {
    const response = await apiClient.patch(`/subscription/admin/plans/${id}`, plan);
    return response.data;
  },

  async getSettings() {
    const response = await apiClient.get(`/subscription/admin/settings`);
    return response.data;
  },

  async updateSetting(key: string, value: string) {
    const response = await apiClient.post(`/subscription/admin/settings`, { key, value });
    return response.data;
  },
};
