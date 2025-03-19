// apiClient.ts - Versão sem conexão real

// Interface simples para simular respostas de API
interface MockResponse<T> {
  data: T | null;
  error: any;
}

// Método fake para simular chamadas à API
const fakeFetch = <T>(data: T, shouldError = false, errorMessage = 'Error'): Promise<MockResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (shouldError) {
        resolve({ data: null, error: { message: errorMessage } });
      } else {
        resolve({ data, error: null });
      }
    }, 500); // Simular um delay de 500ms
  });
};

// API mock
const api = {
  get: <T>(url: string): Promise<MockResponse<T>> => {
    console.log(`Mock API GET: ${url}`);
    return fakeFetch({ id: 'mock-data' } as unknown as T);
  },
  
  post: <T>(url: string, data: any): Promise<MockResponse<T>> => {
    console.log(`Mock API POST: ${url}`, data);
    return fakeFetch({ id: 'mock-created-id', ...data } as unknown as T);
  },
  
  patch: <T>(url: string, data: any): Promise<MockResponse<T>> => {
    console.log(`Mock API PATCH: ${url}`, data);
    return fakeFetch({ id: 'mock-updated-id', ...data } as unknown as T);
  },
  
  delete: <T>(url: string): Promise<MockResponse<T>> => {
    console.log(`Mock API DELETE: ${url}`);
    return fakeFetch({ success: true } as unknown as T);
  }
};

export default api;
