'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/components/theme-provider';
import { 
  GraduationCap, 
  LogOut, 
  History, 
  PlusCircle, 
  Sun, 
  Moon, 
  Server, 
  HardDrive,
  LayoutDashboard
} from 'lucide-react';

export default function Header() {
  const { user, logout, isLocalMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { name: '仪表盘', href: '/dashboard', icon: LayoutDashboard },
    { name: '创建报告', href: '/reports/create', icon: PlusCircle },
    { name: '历史记录', href: '/history', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="bg-primary p-2 rounded-lg text-primary-foreground transition-transform group-hover:scale-105">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight gradient-text font-sans">
                LabReport AI
              </span>
            </Link>
            
            {/* Mode Tag */}
            <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none border border-current bg-opacity-10 ${
              isLocalMode ? 'text-blue-500 bg-blue-500/10' : 'text-emerald-500 bg-emerald-500/10'
            }`}>
              {isLocalMode ? (
                <>
                  <HardDrive className="h-3 w-3" />
                  <span>本地单机模式</span>
                </>
              ) : (
                <>
                  <Server className="h-3 w-3" />
                  <span>Supabase 云端模式</span>
                </>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted hover:bg-accent hover:text-foreground'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile & Settings Area */}
          <div className="flex items-center space-x-4">
            {/* User display */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs text-muted">已登录学生</span>
              <span className="text-sm font-medium text-foreground max-w-[150px] truncate">
                {user.email}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted hover:bg-accent hover:text-foreground transition-all duration-200 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 animate-pulse" />
              ) : (
                <Sun className="h-5 w-5 animate-spin-custom" style={{ animationDuration: '6s' }} />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="flex items-center space-x-1.5 px-3 py-2 border border-border rounded-lg text-sm font-medium text-error hover:bg-error/10 hover:border-error/20 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bottom bar */}
      <div className="md:hidden flex border-t border-border bg-card">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-all
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted hover:text-foreground'
                }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
