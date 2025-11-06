import { Toaster } from 'sonner';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4">
      <RegisterForm />
      <Toaster position="top-center" richColors />
    </div>
  );
}
