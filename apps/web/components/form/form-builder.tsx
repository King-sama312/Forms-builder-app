'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormFieldEditor } from './form-field-editor';
import {
  useGetFormById,
  useGetFormFields,
  useFormBuilderSync,
} from '~/hooks/api/form/index';
import { useFormBuilderStore } from '~/store/formBuilderStore';

export function FormBuilder({ formId }: { formId: string }) {
  const router = useRouter();
  const { form, isLoading: formLoading } = useGetFormById(formId);
  const { fields: serverFields, isLoading: fieldsLoading } = useGetFormFields(formId);
  const { save, isSaving } = useFormBuilderSync(formId);

  const localFields = useFormBuilderStore((s) => s.fields);
  const loadFields = useFormBuilderStore((s) => s.loadFields);
  const reset = useFormBuilderStore((s) => s.reset);

  // Sync server fields into local store on load
  useEffect(() => {
    if (serverFields && serverFields.length > 0) {
      const mapped = serverFields.map((f: any, i: number) => ({
        id: f.id,
        type: f.type as any,
        label: f.label,
        placeholder: f.placeholeder ?? f.placeholder,
        required: f.isRequired ?? f.required,
        options: f.options,
        order: f.order ?? i,
      }));
      loadFields(mapped);
    }
    return () => {
      reset();
    };
  }, [serverFields, loadFields, reset]);

  const [copied, setCopied] = useState(false);

  const copyShareLink = useCallback(() => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formId]);

  const isLoading = formLoading || fieldsLoading;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 mb-2 pb-1 border-b border-[#808080]">
        <button onClick={() => router.push('/forms')}>📁 Forms</button>
        <button onClick={save} disabled={isSaving || isLoading}>
          💾 {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => router.push(`/builder/${formId}/preview`)}>
          👁 Preview
        </button>
        <button onClick={() => router.push(`/builder/${formId}/submissions`)}>
          📊 Submissions
        </button>
        <button onClick={() => router.push(`/builder/${formId}/analytics`)}>
          📈 Analytics
        </button>
        <div className="flex-1" />
        <button onClick={copyShareLink}>
          {copied ? '✅ Copied!' : '🔗 Share'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm">Loading form data...</p>
        </div>
      ) : (
        <FormFieldEditor formId={formId} />
      )}

      <div className="mt-2 pt-1 border-t border-[#808080] text-xs flex justify-between">
        <span>{localFields.length} field(s)</span>
        <span>{form?.description || ''}</span>
      </div>
    </div>
  );
}