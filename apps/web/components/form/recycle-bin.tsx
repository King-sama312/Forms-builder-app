'use client';

import { useListDeletedForms, useRestoreForm } from '~/hooks/api/form/index';

export function RecycleBin() {
  const { deletedForms, isLoading, isError } = useListDeletedForms();
  const { restoreFormAsync, isPending: isRestoring } = useRestoreForm();

  const handleRestore = async (formId: string) => {
    await restoreFormAsync({ formId });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-sm">
        <p>Loading recycle bin...</p>
        <div className="w-full h-4 bg-[#c0c0c0] border border-[#808080] mt-2 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-[#000080] animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-sm text-red-700">
        Failed to load recycle bin. Please try again.
      </div>
    );
  }

  if (!deletedForms || deletedForms.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-600">
        <p>The Recycle Bin is empty.</p>
        <p className="mt-1">Deleted forms will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-1">
      {deletedForms.map((form: any) => (
        <div
          key={form.id}
          className="flex items-center gap-2 p-2 border border-transparent"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{form.title}</p>
            <p className="text-xs truncate opacity-70">
              {form.description || 'No description'} - Deleted{' '}
              {form.deletedAt
                ? new Date(form.deletedAt).toLocaleDateString()
                : 'unknown'}
            </p>
          </div>
          <button
            className="text-xs px-2 py-0.5"
            onClick={() => handleRestore(form.id)}
            disabled={isRestoring}
          >
            Restore
          </button>
        </div>
      ))}
    </div>
  );
}
