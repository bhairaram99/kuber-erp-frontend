'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../providers/auth-provider';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { LogIn, ShieldAlert, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: 'superadmin' | 'manager' | 'staff') => {
    if (role === 'superadmin') {
      setEmail('superadmin@wooderp.com');
      setPassword('Admin123!');
    } else if (role === 'manager') {
      setEmail('manager@wooderp.com');
      setPassword('Admin123!');
    } else {
      setEmail('staff@wooderp.com');
      setPassword('Staff123!');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-36 w-36 p-4 items-center justify-center rounded-3xl bg-white shadow-xl border border-slate-200">
            <img src="/logo.png" alt="Kuber Plywood" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            KUBER PLYWOOD ERP
          </h1>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 text-slate-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-slate-900">Sign In</CardTitle>
            <CardDescription className="text-xs text-[#5D7789]">
              Enter your credentials to access your enterprise workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Work Email"
                type="email"
                placeholder="name@wooderp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#E11F2B] focus:ring-[#E11F2B]/20"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#E11F2B] focus:ring-[#E11F2B]/20"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <Button
                type="submit"
                className="w-full bg-[#E11F2B] hover:bg-[#c91924] text-white font-semibold text-sm h-10 mt-2 shadow-md shadow-red-500/20 active:scale-[0.99] transition-all"
                isLoading={isLoading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to System
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-[#5D7789] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#E11F2B]" />
                Quick Test Role Accounts:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('superadmin')}
                  className="px-2 py-1.5 rounded-md bg-slate-50 hover:bg-red-50 hover:text-[#E11F2B] hover:border-red-200 text-slate-700 text-xs font-medium border border-slate-200 text-center transition"
                >
                  👑 Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('manager')}
                  className="px-2 py-1.5 rounded-md bg-slate-50 hover:bg-red-50 hover:text-[#E11F2B] hover:border-red-200 text-slate-700 text-xs font-medium border border-slate-200 text-center transition"
                >
                  💼 Manager
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('staff')}
                  className="px-2 py-1.5 rounded-md bg-slate-50 hover:bg-red-50 hover:text-[#E11F2B] hover:border-red-200 text-slate-700 text-xs font-medium border border-slate-200 text-center transition"
                >
                  🏷️ Staff
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#5D7789]">
          Powered by NestJS, Next.js, and MongoDB Replica-Safe Engine
        </p>
      </div>
    </div>
  );
}
