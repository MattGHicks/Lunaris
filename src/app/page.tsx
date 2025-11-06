import Link from 'next/link';
import { Header } from '@/components/layouts/header';
import { Toaster } from 'sonner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-space-900 via-space-800 to-space-900">
      <Header />
      <Toaster position="top-center" richColors />

      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-primary">Lunaris</span>
          </h1>

          <p className="text-center text-2xl text-gray-300">
            Build Your Space Empire
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                title: 'Build',
                description: 'Construct buildings and expand your empire',
                icon: '🏗️',
              },
              {
                title: 'Research',
                description: 'Unlock new technologies and capabilities',
                icon: '🔬',
              },
              {
                title: 'Conquer',
                description: 'Command fleets and dominate the galaxy',
                icon: '🚀',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card-game flex max-w-xs flex-col gap-4 transition-transform hover:scale-105"
              >
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Link href="/register" className="btn-primary">
              Play Now
            </Link>
            <Link
              href="https://github.com/yourusername/lunaris"
              className="btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            A modern recreation of the classic space strategy MMO
          </p>
        </div>
      </main>
    </div>
  );
}
