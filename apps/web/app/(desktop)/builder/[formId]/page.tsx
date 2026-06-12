'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormBuilder } from '~/components/form/form-builder';
import { useWindowManager } from '~/components/windows-context';

export default function BuilderPage() {
  const params = useParams();
  const formId = params.formId as string;
  const router = useRouter();
  const { openWindow } = useWindowManager();

  useEffect(() => {
    if (!formId) return;
    openWindow(
      `builder-${formId}`,
      'Form Builder',
      <FormBuilder formId={formId} />,
      { x: 80, y: 50, width: 700, height: 500 },
      () => router.push('/forms'),
    );
  }, [formId, openWindow, router]);

  if (!formId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white">
        Invalid form ID
      </div>
    );
  }

  return null;
}
