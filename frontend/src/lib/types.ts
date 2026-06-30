export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  org_id: string;
  org_name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Document {
  id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'csv';
  file_size: number;
  status: 'processing' | 'ready' | 'failed';
  uploaded_by: string;
  created_at: string;
  chunk_count: number;
}

export interface Source {
  filename: string;
  chunk_index: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: string;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  timestamp: string;
}

export interface QueryLog {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  org_id: string;
  user_id: string;
  title: string;
  selected_doc_ids: string[];
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: Source[];
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface DocumentItem {
  id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'csv';
  file_size: number;
  file_size_formatted: string;
  chunk_count: number;
  status: 'processing' | 'ready' | 'failed';
  uploaded_by_name: string;
  uploaded_by_id: string;
  created_at: string;
  can_delete: boolean;
}
