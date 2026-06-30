'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { documents } from '@/lib/api';
import { IconFileDescription, IconUser, IconFiles, IconUpload } from '@tabler/icons-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ totalDocs: 0, pendingDocs: 0 });

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await documents.getDocuments();
        setStats({
          totalDocs: docs.length,
          pendingDocs: docs.filter((d: any) => d.status !== 'ready').length,
        });
      } catch (error) {
        console.error('Failed to fetch documents', error);
      }
    };
    if (user) fetchDocs();
  }, [user]);

  if (loading) return (
    <div className="p-8 text-center text-text-muted flex items-center justify-center min-h-screen pt-10">
      <div className="skeleton w-32 h-8"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto anim-fade-up">
      <h1 className="text-3xl font-bold mb-2 tracking-tight text-text-primary">Welcome back, {user?.name}</h1>
      <p className="text-text-muted mb-8 text-sm">Here is an overview of your organization&apos;s knowledge base.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-muted font-medium text-sm">Organization</h3>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <IconUser size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1 text-text-primary">{user?.organization?.name || 'N/A'}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Active Workspace</p>
          </div>
        </div>

        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-muted font-medium text-sm">Total Documents</h3>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <IconFiles size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1 text-text-primary">{stats.totalDocs}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Indexed and ready</p>
          </div>
        </div>

        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-muted font-medium text-sm">Processing</h3>
            <div className="p-2 bg-surfaceHover rounded-lg text-text-muted">
              <IconFileDescription size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1 text-text-primary">{stats.pendingDocs}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Documents being vectorized</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-text-primary">Quick Actions</h2>
          <div className="space-y-4">
            <Link href="/upload" className="flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surface rounded-lg group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                  <IconUpload size={20} className="text-text-muted group-hover:text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary text-sm tracking-tight">Upload Knowledge</h4>
                  <p className="text-xs text-text-muted mt-1">Add PDFs or TXT files to your base</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
