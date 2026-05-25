'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Win98Window } from '~/components/win98-window';
import { useCreateForm } from '~/hooks/api/form/index';

export function CreateFormModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { createFormAsync, isPending } = useCreateForm();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createFormAsync({ title, description });
      const formId = (result as any)?.id ?? (result as any)?.form?.id;
      if (formId) {
        router.push(`/builder/${formId}`);
      }
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20">
      <Win98Window
        title="Create New Form"
        defaultPosition={{ x: 0, y: 0, width: 400, height: 280 }}
        onClose={onClose}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 h-full">
          <div className="field-row-stacked">
            <label htmlFor="form-title">Form Title</label>
            <input
              id="form-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Untitled Form"
            />
          </div>

          <div className="field-row-stacked">
            <label htmlFor="form-desc">Description</label>
            <textarea
              id="form-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          <div className="field-row justify-end gap-2 mt-auto">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Win98Window>
    </div>
  );
}