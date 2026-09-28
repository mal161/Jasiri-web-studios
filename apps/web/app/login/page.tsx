import type { Metadata } from 'next';
import { LogIn } from 'lucide-react';
import { LoginForm } from '@/features/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign In', description: 'Sign in to the Jasiri Platform.' };

export default function LoginPage() {
  return (
    <div className="container-page flex max-w-md flex-col gap-6 py-16">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><LogIn size={22} className="text-primary" /> Sign in</h1>
        <p className="mt-1 text-sm text-text-secondary">Supabase Auth with role-based access. Sessions persist securely.</p>
      </div>
      <LoginForm />
    </div>
  );
}
