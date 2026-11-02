'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { login } from '@/lib/api/auth';
import { ApiRequestError } from '@/types/api';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!trimmedPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login({ email: trimmedEmail, password: trimmedPassword });
      router.replace('/admin');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.statusCode === 401) {
          setErrorMsg('Invalid email or password.');
        } else if (err.statusCode === 429) {
          setErrorMsg('Too many login attempts. Please wait a moment and try again.');
        } else {
          setErrorMsg(err.message || 'Login failed. Please try again.');
        }
      } else {
        setErrorMsg('Could not reach the server. Check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="inline-flex items-center gap-2.5 focus:outline-none mb-3">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white border border-slate-200/80 flex items-center justify-center p-1 shadow-2xs">
            <Image
              src="/assets/yummnext-og-logo.png"
              alt="Yumnest Logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="font-serif font-bold text-2xl text-[#0F5638] tracking-tight">
            Yumnest
          </span>
        </Link>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Admin Console
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign in with your verified merchant credentials
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-6 px-5 sm:px-8 rounded-lg border border-slate-200/80 shadow-2xs">
          
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2 mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                  disabled={isLoading}
                  placeholder="admin@yumnest.in"
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638] focus:border-[#0F5638] transition disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F5638] focus:border-[#0F5638] transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-md bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 mt-1 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign in to dashboard</span>
              )}
            </button>
          </form>

        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Yumnest Admin Panel · Authorised personnel only
        </p>
      </div>
    </div>
  );
}
