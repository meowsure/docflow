// hooks/useApi.ts
import { useAuth } from "../contexts/AuthContext";

export const useApi = () => {
  const token = localStorage.getItem('auth_token');

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  };

  return {
    get: (endpoint: string) => apiRequest(endpoint),
    post: (endpoint: string, data: any) => 
      apiRequest(endpoint, { method: "POST", body: JSON.stringify(data) }),
    put: (endpoint: string, data: any) => 
      apiRequest(endpoint, { method: "PUT", body: JSON.stringify(data) }),
    delete: (endpoint: string) => 
      apiRequest(endpoint, { method: "DELETE" }),
  };
};