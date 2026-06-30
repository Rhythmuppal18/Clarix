import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    if (!error.response) {
      throw new Error('Service unavailable');
    }
    throw error;
  }
);

export const auth = {
  registerOrg: async (data: any) => {
    const res = await api.post('/auth/register-org', data);
    return res.data;
  },
  registerEmployee: async (data: any) => {
    const res = await api.post('/auth/register-employee', data);
    return res.data;
  },
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const documents = {
  uploadDocument: async (file: File, onUploadProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return res.data;
  },
  getDocuments: async () => {
    const res = await api.get('/documents/list');
    return res.data;
  },
  getDocument: async (id: string) => {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },
  deleteDocument: async (id: string) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
  getDocumentStatus: async (id: string) => {
    const res = await api.get(`/documents/${id}/status`);
    return res.data;
  }
};

export const chatSessions = {
  createSession: async (selected_doc_ids: string[]) => {
    const res = await api.post('/chat/sessions', { selected_doc_ids });
    return res.data;
  },
  getSessions: async () => {
    const res = await api.get('/chat/sessions');
    return res.data;
  },
  getSession: async (session_id: string) => {
    const res = await api.get(`/chat/sessions/${session_id}`);
    return res.data;
  },
  deleteSession: async (session_id: string) => {
    const res = await api.delete(`/chat/sessions/${session_id}`);
    return res.data;
  },
  updateSession: async (session_id: string, data: { title?: string, selected_doc_ids?: string[] }) => {
    const res = await api.patch(`/chat/sessions/${session_id}`, data);
    return res.data;
  }
};

export const query = {
  sendQuery: async (question: string, session_id: string, selected_doc_ids?: string[]) => {
    const data: any = { question, session_id };
    if (selected_doc_ids) {
      data.selected_doc_ids = selected_doc_ids;
    }
    const res = await api.post('/query', data);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/query/history');
    return res.data;
  },
};

export default api;
