'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  if (!user) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[15px] h-[15px]">
          <rect x="2" y="2" width="5" height="5" rx="1"/>
          <rect x="9" y="2" width="5" height="5" rx="1"/>
          <rect x="2" y="9" width="5" height="5" rx="1"/>
          <rect x="9" y="9" width="5" height="5" rx="1"/>
        </svg>
      )
    },
    {
      href: '/chat',
      label: 'Chat',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[15px] h-[15px]">
          <path d="M2 11V5a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 2v-2z"/>
        </svg>
      )
    }
  ];

  const workspaceItems = [
    {
      href: '/upload',
      label: 'Upload',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
          <path d="M8 2v8M5 7l3-3 3 3"/>
          <path d="M3 13h10"/>
        </svg>
      )
    },
    {
      href: '/documents',
      label: 'Documents',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="w-[15px] h-[15px]">
          <rect x="3" y="2" width="10" height="12" rx="1"/>
          <path d="M6 6h4M6 9h4M6 12h2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="w-[220px] min-w-[220px] h-screen bg-surface border-r border-border flex flex-col overflow-hidden shrink-0">
      {/* BRAND SECTION */}
      <div className="px-[18px] py-[20px] pb-[16px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] text-accent">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
          <div className="text-[18px] font-semibold text-accent tracking-tight">Clarix</div>
        </div>
        <div className="text-[9px] text-text-muted tracking-[2px] uppercase mt-[6px]">ENTERPRISE SEARCH</div>
      </div>

      {/* NAV SECTION */}
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="text-[9px] text-text-muted tracking-[1.5px] uppercase px-2 mb-[6px] mt-1">
          NAVIGATION
        </div>
        
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className="block no-underline">
              <div className={`flex items-center gap-[10px] py-[9px] px-[10px] rounded-lg text-[13px] mb-[2px] transition-colors duration-150 cursor-pointer ${isActive ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-surfaceHover hover:text-text-secondary'}`}>
                <div className={`flex ${isActive ? 'text-accent' : 'inherit'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        <div className="text-[9px] text-text-muted tracking-[1.5px] uppercase px-2 mb-[6px] mt-4">
          WORKSPACE
        </div>
        
        {workspaceItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className="block no-underline">
              <div className={`flex items-center gap-[10px] py-[9px] px-[10px] rounded-lg text-[13px] mb-[2px] transition-colors duration-150 cursor-pointer ${isActive ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-surfaceHover hover:text-text-secondary'}`}>
                <div className={`flex ${isActive ? 'text-accent' : 'inherit'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* USER SECTION */}
      <div className="p-3.5 border-t border-border shrink-0">
        <div className="flex items-center gap-[10px] py-2 px-[10px] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-surfaceHover">
          <div className="w-[36px] h-[36px] rounded-full bg-accent/10 border border-accent/20 text-[14px] font-semibold text-accent flex items-center justify-center shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="overflow-hidden">
            <div className="text-[14px] font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
              {user.name}
            </div>
            <div className="text-[12px] text-text-muted mt-[1px] whitespace-nowrap overflow-hidden text-ellipsis">
              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Employee'} · {user.org_name || 'Workspace'}
            </div>
          </div>
        </div>

        <div onClick={logout} className="flex items-center gap-[6px] py-[7px] px-[10px] rounded-md text-[13px] text-text-muted cursor-pointer mt-1 transition-colors duration-150 hover:text-text-secondary hover:bg-surfaceHover">
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" className="w-[14px] h-[14px]">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3 M10 11l4-3-4-3M14 8H6" />
          </svg>
          Log out
        </div>
      </div>
    </div>
  );
}

