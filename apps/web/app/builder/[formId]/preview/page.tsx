'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormPreview } from '~/components/form/form-preview';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  if (!formId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white">
        Invalid form ID
      </div>
    );
  }

  return (
    <FormPreview
      formId={formId}
      onClose={() => router.push(`/builder/${formId}`)}
    />
  );
}