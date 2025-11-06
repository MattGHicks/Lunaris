'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LogOut, User, Rocket } from 'lucide-react';

export function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (status === 'loading') {
    return (
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">Lunaris</span>
          </div>
          <div className="h-8 w-32 animate-pulse rounded bg-gray-800" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-gray-800 bg-gray-900">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80">
          <Rocket className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold">Lunaris</span>
        </Link>

        {/* Navigation */}
        {session ? (
          <div className="flex items-center space-x-4">
            {/* User info */}
            <Link
              href="/profile"
              className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-gray-800"
            >
              <User className="h-4 w-4" />
              <span>{session.user?.name || 'User'}</span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
