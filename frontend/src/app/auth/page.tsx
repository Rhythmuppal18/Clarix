'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { IconLock, IconMail, IconBuilding, IconUser } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    orgName: '',
    domain: '',
  });
  const { login, registerOrg } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        toast.success('Logged in successfully');
      } else {
        await registerOrg({
          org_name: formData.orgName,
          admin_name: formData.username,
          admin_email: formData.email,
          password: formData.password,
        });
        toast.success('Organization registered successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col lg:flex-row gap-12">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-accent-hover" />
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Create Organization'}
          </h2>
          <p className="text-text-muted text-sm">
            {isLogin ? 'Enter your credentials to access Clarix' : 'Set up your enterprise knowledge base'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Organization Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <IconBuilding size={18} />
                  </div>
                  <input
                    name="orgName"
                    type="text"
                    required
                    className="block w-full pl-10 bg-background border border-border rounded-lg p-2.5 text-white placeholder-gray-500 focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                    placeholder="Acme Corp"
                    value={formData.orgName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company Domain</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    @
                  </div>
                  <input
                    name="domain"
                    type="text"
                    className="block w-full pl-10 bg-background border border-border rounded-lg p-2.5 text-white placeholder-gray-500 focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                    placeholder="acme.com"
                    value={formData.domain}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Admin Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <IconUser size={18} />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 bg-background border border-border rounded-lg p-2.5 text-white placeholder-gray-500 focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                    placeholder="admin_user"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <IconMail size={18} />
              </div>
              <input
                name="email"
                type="email"
                required
                className="block w-full pl-10 bg-background border border-border rounded-lg p-2.5 text-white placeholder-gray-500 focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <IconLock size={18} />
              </div>
              <input
                name="password"
                type="password"
                required
                className="block w-full pl-10 bg-background border border-border rounded-lg p-2.5 text-white placeholder-gray-500 focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-accent to-accent-hover text-black font-semibold rounded-lg hover:opacity-90 focus:ring-4 focus:ring-cyan-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Organization'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-text-muted">
            {isLogin ? "Don't have an organization? " : 'Already have an account? '}
          </span>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent font-medium hover:underline"
          >
            {isLogin ? 'Register' : 'Log in'}
          </button>
        </div>
      </div>
      
      <div className="max-w-md hidden lg:block border-l border-border pl-12">
        <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-hover leading-tight">
          Clarix Enterprise Edition
        </h1>
        <p className="text-text-muted text-lg leading-relaxed mb-8">
          The central hub for all your corporate documentation. Upload PDFs, connect databases, and chat with your entire knowledge base securely.
        </p>
        <ul className="space-y-4 text-gray-300">
          <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">✓</div>
            End-to-end vector embeddings
          </li>
          <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">✓</div>
            Multi-tenant data isolation
          </li>
          <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">✓</div>
            Real-time chat completions
          </li>
        </ul>
      </div>
    </div>
  );
}
