'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useListForms, useDeleteForm } from '~/hooks/api/form/index';

export function FormList() {
  const router = useRouter();
  const { forms, isLoading, isError } = useListForms();
  const { deleteFormAsync, isPending: isDeleting } = useDeleteForm();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleDelete = async (formId: string) => {
    await deleteFormAsync({ formId });
    setConfirmingId(null);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-sm">
        <p>Loading forms...</p>
        <div className="w-full h-4 bg-[#c0c0c0] border border-[#808080] mt-2 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-[#000080] animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-sm text-red-700">
        Failed to load forms. Please try again.
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-600">
        <p>No forms yet.</p>
        <p className="mt-1">Click &ldquo;New Form&rdquo; to create one.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-1">
      {forms.map((form: any) => (
        <div
          key={form.id}
          className="flex items-center gap-2 p-2 hover:bg-[#000080] hover:text-white cursor-pointer border border-transparent hover:border-[#000080]"
          onDoubleClick={() => router.push(`/builder/${form.id}`)}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{form.title}</p>
            <p className="text-xs truncate opacity-70">
              {form.description || 'No description'}
            </p>
          </div>
          <span className="text-xs whitespace-nowrap">
            {new Date(form.createdAt).toLocaleDateString()}
          </span>
          {confirmingId === form.id ? (
            <div className="flex items-center gap-1">
              <span className="text-xs">Move to Recycle Bin?</span>
              <button
                className="text-xs px-1 py-0.5"
                onClick={() => handleDelete(form.id)}
                disabled={isDeleting}
              >
                Yes
              </button>
              <button
                className="text-xs px-1 py-0.5"
                onClick={() => setConfirmingId(null)}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className="text-xs px-1 py-0.5 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmingId(form.id);
              }}
              title="Move to Recycle Bin"
            >
              🗑
            </button>
          )}
        </div>
      ))}
    </div>
  );
}