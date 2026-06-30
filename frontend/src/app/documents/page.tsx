"use client";

import { useEffect, useState } from "react";
import { documents } from "@/lib/api";
import { DocumentItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type FilterType = "All" | "pdf" | "docx" | "csv";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await documents.getDocuments();
      setDocs(res);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      // confirmed
      try {
        setDeletingId(id);
        await documents.deleteDocument(id);
        setDocs(docs.filter(d => d.id !== id));
        toast.success("Document deleted");
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || "Failed to delete document");
      } finally {
        setDeletingId(null);
        setConfirmDeleteId(null);
      }
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleChat = (id: string) => {
    // In chat page, handle starting a session with doc
    router.push(`/chat?doc_id=${id}`);
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || doc.file_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <div className="w-full h-full p-8 flex flex-col anim-fade-up">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1 tracking-tight text-text-primary">Documents</h1>
          <p className="text-text-muted text-sm">{docs.length} documents in your workspace</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field w-[280px]"
          />

          <div className="flex gap-2">
            {(["All", "pdf", "docx", "csv"] as FilterType[]).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filterType === type
                    ? "bg-accent/10 border-accent/20 text-accent font-medium space-x-1"
                    : "bg-surface border-border text-text-muted hover:text-text-secondary hover:bg-surfaceHover"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 skeleton" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <svg className="w-12 h-12 text-border" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
            <div className="flex flex-col items-center gap-1">
              <span className="text-text-primary font-medium">No documents yet</span>
              <span className="text-text-muted text-sm">Upload your first document to get started</span>
            </div>
            <button onClick={() => router.push("/upload")} className="btn-primary text-sm mt-2">
              Upload Document
            </button>
          </div>
        ) : (
          <div className="card p-0 flex-1 flex flex-col overflow-hidden">
            <div className="bg-surfaceHover border-b border-border px-5 py-3 grid grid-cols-[3fr_1fr_1fr_1.5fr_1fr_1fr_1fr] text-[11px] text-text-muted uppercase tracking-wider font-semibold">
              <div>File Name</div>
              <div>Type</div>
              <div>Size</div>
              <div>Uploaded By</div>
              <div>Date</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filteredDocs.map(doc => {
                const dateStr = new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <div key={doc.id} className="px-5 py-[14px] hover:bg-surfaceHover transition-colors grid grid-cols-[3fr_1fr_1fr_1.5fr_1fr_1fr_1fr] items-center text-[13px]">
                    
                    {/* File Name */}
                    <div className="flex items-center gap-[10px] overflow-hidden pr-4">
                      <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-[9px] shrink-0
                        ${doc.file_type === 'pdf' ? 'bg-error/10 text-error' : 
                          doc.file_type === 'docx' ? 'bg-accent/10 text-accent' : 
                          'bg-success/10 text-success'}`}
                      >
                        {doc.file_type.toUpperCase()}
                      </div>
                      <span className="text-text-primary font-medium truncate">{doc.file_name}</span>
                    </div>

                    {/* Type Pill */}
                    <div>
                      <span className={`text-[11px] px-2 py-1 rounded-full border
                        ${doc.file_type === 'pdf' ? 'bg-error/10 text-error border-error/20' : 
                          doc.file_type === 'docx' ? 'bg-accent/10 text-accent border-accent/20' : 
                          'bg-success/10 text-success border-success/20'}`}
                      >
                        {doc.file_type.toUpperCase()}
                      </span>
                    </div>

                    {/* Size */}
                    <div className="text-text-muted text-xs">{doc.file_size_formatted}</div>

                    {/* Uploaded By */}
                    <div className="text-text-secondary truncate pr-4">{doc.uploaded_by_name}</div>

                    {/* Date */}
                    <div className="text-text-muted text-xs">{dateStr}</div>

                    {/* Status */}
                    <div className="flex items-center">
                      <span className={`flex items-center gap-[6px] px-2 py-0.5 rounded-full text-xs font-medium w-fit border
                        ${doc.status === 'ready' ? 'bg-success/10 text-success border-success/20' :
                          doc.status === 'processing' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-error/10 text-error border-error/20'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          doc.status === 'ready' ? 'bg-success' :
                          doc.status === 'processing' ? 'bg-warning animate-pulse' :
                          'bg-error'
                        }`} />
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleChat(doc.id)} className="bg-surface text-accent border border-border px-3 py-1.5 rounded-md text-[11px] hover:bg-accent/10 transition-colors">
                        Chat
                      </button>
                      
                      {doc.can_delete && (
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className={`px-3 py-1.5 rounded-md text-[11px] border transition-colors ${
                            confirmDeleteId === doc.id 
                              ? 'bg-error/10 text-error border-error/20'
                              : 'bg-transparent text-text-muted border-border hover:text-error hover:border-error/20 hover:bg-error/5'
                          } ${deletingId === doc.id ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          {confirmDeleteId === doc.id ? 'Confirm?' : 'Delete'}
                        </button>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}