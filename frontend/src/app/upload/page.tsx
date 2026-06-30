'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { documents } from '@/lib/api';
import { useDropzone } from 'react-dropzone';
import { IconUpload, IconFilePlus, IconCheck, IconX, IconLoader2 } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let totalProgress = 0;
    
    try {
      for (let i = 0; i < files.length; i++) {
        await documents.uploadDocument(files[i], (progressEvent) => {
          if (progressEvent.total) {
            const currentProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(((i * 100) + currentProgress) / files.length);
          }
        });
      }
      toast.success('All documents uploaded successfully');
      setFiles([]);
      setProgress(0);
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to upload some documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 anim-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
          Knowledge Ingestion
        </h1>
        <p className="text-text-muted max-w-2xl text-sm leading-relaxed">
          Upload PDF and TXT documents to build your organization&apos;s context. Documents are automatically chunked, embedded, and stored securely.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 cursor-pointer ${
          isDragActive
            ? 'border-accent bg-accent/10 border-solid'
            : 'border-border bg-surface hover:border-text-muted hover:bg-surfaceHover'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6">
          <IconUpload size={40} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-text-primary">Drag and drop documents</h3>
        <p className="text-text-muted text-sm mb-6">
          Support for .pdf and .txt files. Maximum 20MB per file.
        </p>
        <button className="btn-secondary">
          Browse Files
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-8 card overflow-hidden p-0 rounded-2xl">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-text-primary">
              <IconFilePlus className="text-accent" />
              Selected Files ({files.length})
            </h3>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {files.map((file, idx) => (
              <li key={idx} className="px-6 py-4 flex items-center justify-between group hover:bg-surfaceHover transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-2 text-text-muted bg-background rounded-lg opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error/10 transition-all"
                  aria-label="Remove file"
                  disabled={uploading}
                >
                  <IconX size={18} />
                </button>
              </li>
            ))}
          </ul>

          <div className="p-6 bg-background border-t border-border">
            {uploading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>Uploading documents...</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl disabled:opacity-50"
              >
                <IconCheck size={20} />
                Process Documents
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
