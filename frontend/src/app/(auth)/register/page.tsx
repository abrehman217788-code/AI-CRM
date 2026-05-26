'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-surface-900">AI CRM</span>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-surface-900">Create your account</h2>
          <p className="mt-2 text-sm text-surface-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700">First name</label>
                <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700">Last name</label>
                <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field mt-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field mt-1" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700">Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field mt-1" placeholder="Min 6 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
          <div className="flex h-full items-center justify-center p-12">
            <div className="max-w-lg text-white">
              <Activity className="h-16 w-16 mb-6" />
              <h1 className="text-4xl font-bold">AI-Powered CRM</h1>
              <p className="mt-4 text-lg text-primary-100">
                Start converting more leads with AI-driven sales workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
