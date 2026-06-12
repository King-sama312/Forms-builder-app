'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateForm } from '~/hooks/api/form/index';
import { useWindowManager } from '~/components/windows-context';

function CreateFormWindowContent() {
  const router = useRouter();
  const { createFormAsync, isPending } = useCreateForm();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await createFormAsync({ title, description });
      const formId = (result as any)?.id ?? (result as any)?.form?.id;
      if (formId) {
        router.push(`/builder/${formId}`);
      }
    } catch {
      setError('Failed to create form. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 h-full">
      <div className="field-row-stacked">
        <label htmlFor="form-title">Form Title</label>
        <input
          id="form-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          placeholder="Untitled Form"
          maxLength={55}
        />
      </div>

      <div className="field-row-stacked">
        <label htmlFor="form-desc">Description</label>
        <textarea
          id="form-desc"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Optional description..."
          maxLength={30}
        />
      </div>

      {error && (
        <div className="text-red-700 text-xs border border-red-700 bg-red-100 p-1">
          {error}
        </div>
      )}

      <div className="field-row justify-end gap-2 mt-auto">
        <button type="button" onClick={() => router.push('/forms')}>
          Cancel
        </button>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}

export default function CreateFormPage() {
  const { openWindow } = useWindowManager();

  useEffect(() => {
    openWindow('create-form', 'Create New Form', <CreateFormWindowContent />, {
      x: 160, y: 100, width: 420, height: 300,
    });
  }, [openWindow]);

  return null;
}
