"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { chatSessions, query, documents as docApi } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface Source {
  filename: string;
  chunk_index: number;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  selected_doc_ids?: string[];
}

interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

interface DocumentItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: string;
  file_size_formatted?: string;
}

function ChatContent() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectDocId = searchParams?.get('doc_id');

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSessionDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [docFilter, setDocFilter] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initialAvatar = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U';

  const userRoleStr = "Admin"; // Hardcoded as per layout for simplicity

  useEffect(() => {
    fetchSessions();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (preselectDocId && documents.length > 0 && !activeSession) {
      handleNewChat([preselectDocId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectDocId, documents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await chatSessions.getSessions();
      setSessions(res);
      if (res.length > 0 && !activeSession && !preselectDocId) {
        loadSession(res[0].id);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocsLoading(true);
      const res = await docApi.getDocuments();
      setDocuments(res);
    } catch (err) {
      toast.error("Failed to load documents");
    } finally {
      setDocsLoading(false);
    }
  };

  const loadSession = async (id: string) => {
    try {
      const res: any = await chatSessions.getSession(id);
      setActiveSession(res);
      setMessages(res.messages || []);
      setSelectedDocIds(res.selected_doc_ids || []);
      setIsEditingTitle(false);
    } catch (err: any) {
      toast.error("Failed to load session details");
    }
  };

  const handleNewChat = async (initialDocIds: string[] = []) => {
    setIsLoading(true);
    try {
      const newSess = await chatSessions.createSession(initialDocIds);
      setSessions(prev => [newSess, ...prev]);
      
      const sessionDetail: any = {
        ...newSess,
        messages: []
      };
      
      setActiveSession(sessionDetail);
      setMessages([]);
      setSelectedDocIds(initialDocIds);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    const oldSessions = [...sessions];
    setSessions(sessions.filter(s => s.id !== id));
    
    if (activeSession?.id === id) {
      setActiveSession(sessions.find(s => s.id !== id) as any || null);
      if(sessions.length > 1) {
         loadSession(sessions.filter(s => s.id !== id)[0].id);
      } else {
         setMessages([]);
      }
    }

    try {
      await chatSessions.deleteSession(id);
    } catch (err: any) {
      setSessions(oldSessions);
      toast.error("Failed to delete session");
    }
  };

  const handleUpdateTitle = async () => {
    if (!activeSession || !titleInput.trim() || titleInput === activeSession.title) {
      setIsEditingTitle(false);
      return;
    }
    
    try {
      const res = await chatSessions.updateSession(activeSession.id, { title: titleInput });
      setActiveSession({ ...activeSession, title: res.title } as any);
      setSessions(sessions.map(s => s.id === res.id ? res : s));
      setIsEditingTitle(false);
    } catch (err) {
      toast.error("Failed to update title");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeSession) return;
    
    const question = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    
    setIsLoading(true);
    
    const tempMsg: ChatMessage = {
      id: "temp-" + Date.now(),
      session_id: activeSession.id,
      role: "user",
      content: question,
      sources: [],
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    
    try {
      await query.sendQuery(question, activeSession.id, selectedDocIds);
      await loadSession(activeSession.id);
      fetchSessions();
      
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to query documents");
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const updateSelectedDocs = async (newIds: string[]) => {
    setSelectedDocIds(newIds);
    if (!activeSession) return;
    
    try {
      const res = await chatSessions.updateSession(activeSession.id, { selected_doc_ids: newIds });
      setActiveSession({ ...activeSession, selected_doc_ids: res.selected_doc_ids } as any);
      setSessions(sessions.map(s => s.id === res.id ? res : s));
    } catch(err) {
      toast.error("Failed to update document scope");
    }
  };

  const toggleDocSelection = (id: string) => {
    const isSelected = selectedDocIds.includes(id);
    if (isSelected) {
      updateSelectedDocs(selectedDocIds.filter(selectedId => selectedId !== id));
    } else {
      updateSelectedDocs([...selectedDocIds, id]);
    }
  };

  const selectAllDocs = () => updateSelectedDocs(documents.filter(d => d.status === "ready").map(d => d.id));
  const clearAllSelectedDocs = () => updateSelectedDocs([]);

  const filteredDocs = documents.filter(d => 
    d.file_name.toLowerCase().includes(docFilter.toLowerCase())
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isPanelOpen ? '1fr 280px' : '1fr 0px',
      height: '100vh',
      overflow: 'hidden',
      transition: 'grid-template-columns 0.25s cubic-bezier(0.4,0,0.2,1)'
    }}>
      
      {/* COLUMN 1: CHAT AREA */}
      <div className="flex flex-col h-screen bg-background overflow-hidden min-w-0">
        
        {/* TOPBAR */}
        <div className="h-[52px] px-[20px] border-b border-border flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-[8px]">
            {activeSession && (
              isEditingTitle ? (
                <input 
                  autoFocus
                  className="bg-surface border-[0.5px] border-accent rounded-[4px] py-[3px] px-[6px] text-[14px] font-[500] text-white outline-none w-[200px]"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={e => e.key === 'Enter' && handleUpdateTitle()}
                />
              ) : (
                <>
                  <div 
                    className="text-[14px] font-[500] text-white cursor-text rounded-[4px] py-[3px] px-[6px] hover:bg-surface transition-colors max-w-[200px] overflow-hidden whitespace-nowrap text-whitellipsis"
                    onClick={() => { setTitleInput(activeSession.title); setIsEditingTitle(true); }}
                  >
                    {activeSession.title || "New Chat"}
                  </div>
                  <svg className="w-[16px] h-[16px] fill-none stroke-[#333333] cursor-pointer hover:stroke-text-muted transition-colors" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onClick={() => { setTitleInput(activeSession.title); setIsEditingTitle(true); }}>
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </>
              )
            )}
          </div>

          <div className="flex items-center gap-[8px]">
            {activeSession && (
               <div className={`flex items-center gap-[5px] text-[11px] py-[5px] px-[10px] rounded-[6px] border-[0.5px] ${
                 selectedDocIds.length > 0 
                  ? 'bg-accent/10 border-[#1a4055] text-accent' 
                  : 'bg-surface border-[var(--border)] text-text-muted'
               }`}>
                 <div className={`w-[5px] h-[5px] rounded-full ${selectedDocIds.length > 0 ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]'}`}></div>
                 {selectedDocIds.length > 0 ? `${selectedDocIds.length} document${selectedDocIds.length === 1 ? '' : 's'} selected` : "All documents"}
               </div>
            )}
            
            <button 
              className="w-[30px] h-[30px] bg-surface border-[0.5px] border-[var(--border)] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#161616] hover:border-white/30" 
              onClick={() => setIsPanelOpen(!isPanelOpen)}
            >
              <svg className="w-[16px] h-[16px] stroke-[#888] fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
            </button>
          </div>

        </div>

        {/* SESSIONS STRIP */}
        <div className="py-[10px] px-[12px] border-b border-border flex items-center gap-[8px] shrink-0 overflow-hidden relative">
          <button 
            className="bg-accent text-background border-none rounded-[7px] py-[7px] px-[14px] text-[12px] font-[600] cursor-pointer whitespace-nowrap transition-colors hover:bg-accent-hover shrink-0"
            onClick={() => handleNewChat([])}
          >
            New Chat
          </button>

          <div className="flex gap-[6px] overflow-x-auto flex-1 items-center" style={{ scrollbarWidth: 'none' }}>
            {sessionsLoading ? (
               Array(3).fill(0).map((_, i) => <div key={i} className="w-[80px] h-[30px] rounded-[6px] anim-shimmer shrink-0" />)
            ) : (
               sessions.map(s => {
                 const isActive = activeSession?.id === s.id;
                 return (
                   <div 
                     key={s.id} 
                     onClick={() => loadSession(s.id)}
                     className={`relative group shrink-0 rounded-[6px] py-[6px] px-[12px] text-[11px] cursor-pointer whitespace-nowrap transition-all duration-[0.15s] ease border-[0.5px] 
                     ${isActive 
                        ? 'bg-accent/10 border-[#1a4055] text-accent' 
                        : 'bg-surface border-[var(--border)] text-text-muted hover:bg-[#161616] hover:text-text-muted'
                     }`}
                   >
                     <span className="inline-block max-w-[150px] overflow-hidden text-whitellipsis align-bottom">
                       {s.title && s.title.length > 22 ? `${s.title.substring(0,22)}...` : (s.title || "New Chat")}
                     </span>

                     <button 
                       onClick={(e) => handleDeleteSession(e, s.id)}
                       className="absolute right-[-4px] top-[-4px] w-[16px] h-[16px] bg-[var(--border)] border-[0.5px] border-white/30 rounded-full text-[9px] text-white/60 hidden group-hover:flex items-center justify-center hover:bg-[#ff6b6b] hover:text-[#fff] hover:border-[#ff6b6b]"
                     >
                       ×
                     </button>
                   </div>
                 );
               })
            )}
          </div>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-[28px] py-[24px] pb-[16px] flex flex-col gap-[20px]" style={{ scrollBehavior: 'smooth' }}>
          
          {!activeSession || messages.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center gap-[14px] p-[40px]">
               <div className="w-[48px] h-[48px] bg-surface border-[0.5px] border-[var(--border)] rounded-[12px] flex items-center justify-center">
                 <svg className="w-[22px] h-[22px] stroke-[#222]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                 </svg>
               </div>
               <div className="text-[16px] font-[500] text-white/70 text-center">Ask anything about your documents</div>
               <div className="text-[12px] text-white/60 text-center max-w-[280px] leading-[1.6]">
                  Select specific documents from the panel on the right, or ask across all of them.
               </div>

               <div className="flex gap-[8px] flex-wrap justify-center mt-[6px]">
                  {["What is the standard leave policy?", "Summarize the onboarding guide", "Who is the lead engineer?"].map(term => (
                    <button 
                      key={term}
                      onClick={() => { setInput(term); textareaRef.current?.focus(); }}
                      className="bg-[#0f0f0f] border-[0.5px] border-[var(--border)] text-white/80 py-[7px] px-[14px] rounded-[20px] text-[11px] cursor-pointer transition-all duration-[0.15s] ease hover:border-accent hover:text-accent hover:bg-[#080e14]"
                    >
                      {term}
                    </button>
                  ))}
               </div>
             </div>
          ) : (
             messages.map(msg => (
               <div key={msg.id} className={`flex gap-[10px] ${msg.role === 'user' ? 'self-end max-w-[62%] anim-fade-up' : 'self-start max-w-[78%] anim-fade-left'}`}>
                 
                 {msg.role === 'assistant' && (
                    <div className="w-[26px] h-[26px] rounded-[8px] bg-accent/10 border-[0.5px] border-[#1a4055] flex items-center justify-center text-[10px] font-[600] text-accent shrink-0 mt-[2px]">
                      C
                    </div>
                 )}

                 <div className={`
                    ${msg.role === 'user' 
                      ? 'bg-accent text-white py-[11px] px-[15px] rounded-[14px] rounded-tr-[3px] text-[13px] leading-[1.55] font-[500]' 
                      : 'bg-surface border-[0.5px] border-border rounded-[14px] rounded-tl-[3px] py-[13px] px-[15px]'
                    }
                 `}>
                    {msg.role === 'user' ? (
                       msg.content
                    ) : (
                       <>
                         <div className="text-[13px] text-[var(--text-primary)] leading-[1.65] whitespace-pre-wrap font-[400]">
                           {msg.content}
                         </div>
                         {msg.sources && msg.sources.length > 0 && (
                           <div className="mt-[10px] pt-[10px] border-t-[0.5px] border-border">
                             <div className="text-[9px] text-white/70 tracking-[1px] uppercase mb-[6px]">Sources</div>
                             <div className="flex flex-wrap gap-[6px]">
                               {msg.sources.map((src, idx) => (
                                 <div key={idx} className="flex items-center gap-[4px] bg-[#0a1e28] border-[0.5px] border-[#1a3545] text-accent text-[10px] py-[3px] px-[8px] rounded-[4px]">
                                   <svg className="w-[9px] h-[9px] stroke-[var(--accent)] fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                   {src.filename} · p.{src.chunk_index}
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                       </>
                    )}
                 </div>

               </div>
             ))
          )}

          {isLoading && (
            <div className="flex gap-[10px] self-start max-w-[78%] anim-fade-left">
              <div className="w-[26px] h-[26px] rounded-[8px] bg-accent/10 border-[0.5px] border-[#1a4055] flex items-center justify-center text-[10px] font-[600] text-accent shrink-0 mt-[2px]">
                C
              </div>
              <div className="bg-surface border-[0.5px] border-[var(--border)] rounded-[14px] rounded-tl-[3px] py-[13px] px-[15px]">
                 <div className="flex items-center gap-[5px] h-[7px]">
                   <div className="w-[7px] h-[7px] bg-[#222] rounded-full animate-[dotPulse_1.4s_infinite] [animation-delay:0s]" />
                   <div className="w-[7px] h-[7px] bg-[#222] rounded-full animate-[dotPulse_1.4s_infinite] [animation-delay:0.2s]" />
                   <div className="w-[7px] h-[7px] bg-[#222] rounded-full animate-[dotPulse_1.4s_infinite] [animation-delay:0.4s]" />
                 </div>
                 <div className="text-[10px] text-white/70 mt-[6px]">Searching your documents...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="py-[12px] px-[20px] pb-[18px] border-t-[0.5px] border-border shrink-0 bg-background">
          {!activeSession ? (
             <div className="text-[12px] text-white/70 h-[52px] flex flex-col items-center justify-center">
               Select a chat or start a new one above
             </div>
          ) : (
            <div className="bg-surface border-[0.5px] border-[var(--border)] rounded-[10px] py-[11px] px-[14px] flex items-end gap-[10px] transition-colors focus-within:border-accent">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextAreaChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask a question about your documents..."
                  className="bg-transparent border-none outline-none text-white text-[15px] leading-[1.6] flex-1 resize-none min-h-[22px] max-h-[160px] placeholder:text-white/60"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-[36px] h-[36px] rounded-[8px] flex items-center justify-center shrink-0 transition-all duration-[0.15s] ease border-none
                  ${(!input.trim() || isLoading) 
                    ? 'bg-accent/10 text-accent/30 cursor-not-allowed' 
                    : 'bg-accent text-background cursor-pointer hover:bg-accent-hover hover:scale-[1.05]'
                  }
                `}
              >
                <svg viewBox="0 0 16 16" className="w-[16px] h-[16px]">
                  <path d="M2 14L14 8 2 2v4.5l8 1.5-8 1.5V14z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 3: DOCUMENTS PANEL */}
      <div className="bg-[#080808] border-l-[0.5px] border-border flex flex-col h-screen overflow-hidden shrink-0 min-w-0 pointer-events-auto w-[280px]">
        {/* PANEL TOP */}
        <div className="pt-[16px] px-[16px] pb-[12px] border-b-[0.5px] border-border shrink-0">
          <div className="text-[13px] font-[500] text-[var(--text-primary)]">Documents</div>
          <div className="text-[10px] text-white mt-[2px]">Select to scope your chat</div>
          <div className="flex gap-[6px] mt-[10px]">
             <button onClick={selectAllDocs} className="bg-transparent border-[0.5px] border-[var(--border)] text-white/80 py-[4px] px-[10px] rounded-[5px] text-[10px] cursor-pointer hover:text-white hover:border-white/30">
                Select all
             </button>
             <button onClick={clearAllSelectedDocs} className="bg-transparent border-[0.5px] border-[var(--border)] text-white/80 py-[4px] px-[10px] rounded-[5px] text-[10px] cursor-pointer hover:text-white hover:border-white/30">
                Clear all
             </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="py-[10px] px-[14px] border-b-[0.5px] border-border shrink-0">
          <input 
            value={docFilter}
            onChange={e => setDocFilter(e.target.value)}
            placeholder="Filter documents..."
            className="w-full bg-surface border-[0.5px] border-[var(--border)] rounded-[6px] py-[7px] px-[10px] text-[11px] text-text-muted outline-none focus:border-accent"
          />
        </div>

        {/* DOCUMENT LIST */}
        <div className="flex-1 overflow-y-auto p-[8px]">
          {docsLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-[52px] rounded-[8px] anim-shimmer mb-[3px]" />)
          ) : (
            filteredDocs.map(doc => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div 
                  key={doc.id}
                  onClick={() => toggleDocSelection(doc.id)}
                  className={`flex items-center gap-[10px] p-[10px] rounded-[8px] cursor-pointer mb-[3px] transition-colors duration-[0.15s] ease 
                    ${isSelected ? 'bg-[#09202e]' : 'hover:bg-[#0f0f0f]'}
                  `}
                >
                  <div className={`w-[16px] h-[16px] rounded-[4px] border-[0.5px] flex items-center justify-center shrink-0 transition-all duration-[0.15s] ease
                    ${isSelected ? 'bg-[var(--accent)] border-accent' : 'bg-transparent border-[#222222]'}
                  `}>
                    {isSelected && (
                      <svg className="w-[9px] h-[9px] stroke-[#080808]" viewBox="0 0 10 10" fill="none" strokeWidth="1.5">
                        <path d="M1.5 4.5l2 2 4-4"/>
                      </svg>
                    )}
                  </div>

                  <div className={`w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-[9px] font-[700] shrink-0
                    ${doc.file_type === 'pdf' ? 'bg-[#1e0a0a] text-[#ff6b6b]' : 
                      doc.file_type === 'docx' ? 'bg-[#0a1020] text-[#5b9fff]' : 
                      'bg-[#0a180a] text-[#5bff8a]'}
                  `}>
                    {doc.file_type.toUpperCase().substring(0,3)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-white whitespace-nowrap overflow-hidden text-ellipsis">
                      {doc.file_name}
                    </div>
                    <div className="flex items-center gap-[4px] text-[10px] text-white mt-[2px]">
                      <div className={`w-[5px] h-[5px] rounded-full 
                        ${doc.status === 'ready' ? 'bg-[#4dff91]' :
                          doc.status === 'processing' ? 'bg-[#ffb347] animate-[dotPulse_1.4s_infinite]' :
                          'bg-[#ff6b6b]'}
                      `} />
                      <span className="capitalize">{doc.status} · {doc.file_size_formatted || `${Math.round(doc.file_size/1024)} KB`}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PANEL BOTTOM */}
        <div className="py-[12px] px-[16px] border-t-[0.5px] border-border shrink-0 mt-auto">
           {selectedDocIds.length === 0 ? (
             <div className="text-[11px] text-text-muted">Searching all documents</div>
           ) : (
             <div className="text-[11px] text-accent font-[500]">{selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} selected</div>
           )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#080808]" />}>
      <ChatContent />
    </Suspense>
  );
}






