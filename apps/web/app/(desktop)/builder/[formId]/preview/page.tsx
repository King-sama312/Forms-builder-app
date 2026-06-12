'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormPreview } from '~/components/form/form-preview';
import { useWindowManager } from '~/components/windows-context';

export default function PreviewPage() {
  const params = useParams();
  const formId = params.formId as string;
  const router = useRouter();
  const { openWindow, closeWindow } = useWindowManager();

  useEffect(() => {
    if (!formId) return;
    openWindow(
      `preview-${formId}`,
      'Form Preview',
      <FormPreview formId={formId} onClose={() => closeWindow(`preview-${formId}`)} />,
      { x: 100, y: 60, width: 640, height: 480 },
      () => router.push(`/builder/${formId}`),
    );
  }, [formId, openWindow, closeWindow, router]);

  if (!formId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white">
        Invalid form ID
      </div>
    );
  }

  return null;
}
