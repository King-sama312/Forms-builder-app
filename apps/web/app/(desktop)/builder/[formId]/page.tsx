'use client';

import { useParams } from 'next/navigation';
import { FormBuilder } from '~/components/form/form-builder';

export default function BuilderPage() {
  const params = useParams();
  const formId = params.formId as string;

  if (!formId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white">
        Invalid form ID
      </div>
    );
  }

  return <FormBuilder formId={formId} />;
}