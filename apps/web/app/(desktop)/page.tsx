'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('win98-booted') !== 'true') {
      router.replace('/startup');
    }
  }, [router]);

  return null;
}
