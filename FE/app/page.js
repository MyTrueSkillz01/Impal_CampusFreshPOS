'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Middleware works server-side, but as fallback we can just redirect
    router.replace('/login');
  }, [router]);

  return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>Memuat...</div>;
}
