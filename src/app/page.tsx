'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  Info, 
  ShieldAlert,
  HardDrive,
  Server
} from 'lucide-react';

export default function AuthPage() {
  const { user, loading, isLocalMode, login, register } = useAuth();
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // States
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin-custom"></div>
          <p className="text-sm text-muted">加载身份信息中...</p>
        </div>
      </div>
    );
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!email.trim() || !password.trim()) {
      setFormError('邮箱和密码不能为空');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        setFormSuccess('登录成功，跳转中...');
        router.push('/dashboard');
      } else {
        setFormError(res.error || '登录失败，请检查您的凭据');
      }
    } catch (err: any) {
      setFormError(err.message || '登录过程中发生错误');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError('请填写所有必需的字段');
      return;
    }

    if (password.length < 6) {
      setFormError('密码长度不能少于 6 位');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('两次输入的密码不一致');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register(email, password);
      if (res.success) {
        if (isLocalMode) {
          setFormSuccess('注册并自动登录成功！跳转中...');
          router.push('/dashboard');
        } else {
          setFormSuccess('账号注册成功！请查收验证邮件（若已关闭邮箱验证则直接登录）');
          setIsLoginView(true);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        setFormError(res.error || '注册失败，请检查格式');
      }
    } catch (err: any) {
      setFormError(err.message || '注册过程中发生错误');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-primary p-3 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            LabReport AI
          </h1>
          <p className="text-sm text-muted max-w-sm mx-auto">
            AI-Powered Laboratory Report Assistant
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {isLoginView ? '学生登录' : '学生注册'}
            </h2>
            
            {/* Mode indicator */}
            <div className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border border-current ${
              isLocalMode ? 'text-blue-500 bg-blue-500/5' : 'text-emerald-500 bg-emerald-500/5'
            }`}>
              {isLocalMode ? <HardDrive className="h-3 w-3" /> : <Server className="h-3 w-3" />}
              <span>{isLocalMode ? '本地模式' : '云端模式'}</span>
            </div>
          </div>

          {/* Form Messages */}
          {formError && (
            <div className="mb-4 flex items-start space-x-2 bg-error/10 border border-error/20 text-error p-3 rounded-xl text-sm">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 flex items-start space-x-2 bg-success/10 border border-success/20 text-success p-3 rounded-xl text-sm">
              <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Actual Form */}
          {isLoginView ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  邮箱地址
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  登录密码
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin-custom"></div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>立即登录</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  邮箱地址
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  设定密码 (最少 6 位)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  确认密码
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin-custom"></div>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>创建学生账户</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setFormError('');
                setFormSuccess('');
              }}
              className="text-sm font-medium text-primary hover:underline focus:outline-none cursor-pointer"
            >
              {isLoginView ? '没有账户？创建新学生账户' : '已有账户？返回登录'}
            </button>
          </div>
        </div>

        {/* Footer/Info info */}
        {isLocalMode && (
          <div className="flex items-center space-x-2 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 text-xs text-blue-500">
            <Info className="h-4.5 w-4.5 shrink-0" />
            <p>
              <strong>本地开发模式:</strong> 自动将所有用户和实验报告数据保存在浏览器的本地缓存（localStorage）中，<strong>无需配置 Supabase 后端</strong> 即可即开即用！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
