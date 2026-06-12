'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetFormById, useGetFormFields, useGetFormSubmissions } from '~/hooks/api/form/index';
import { useWindowManager } from '~/components/windows-context';

function SubmissionsWindowContent({ formId }: { formId: string }) {
  const router = useRouter();
  const { isLoading: formLoading } = useGetFormById(formId);
  const { fields, isLoading: fieldsLoading } = useGetFormFields(formId);
  const { submissions, isLoading: subsLoading } = useGetFormSubmissions(formId);

  const isLoading = formLoading || fieldsLoading || subsLoading;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#808080]">
        <button onClick={() => router.push(`/builder/${formId}`)}>
          ← Back to Builder
        </button>
        <span className="text-xs text-gray-600 ml-auto">
          {submissions?.length ?? 0} submission(s)
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm">Loading submissions...</p>
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-600">No submissions yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-[#808080] bg-white">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#000080] text-white sticky top-0">
                <th className="text-left p-1.5 border border-[#808080] whitespace-nowrap">#</th>
                <th className="text-left p-1.5 border border-[#808080] whitespace-nowrap">Date</th>
                {(fields ?? []).map((f: any) => (
                  <th key={f.id} className="text-left p-1.5 border border-[#808080] whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub: any, i: number) => (
                <tr key={sub.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#e0e0e0]'}>
                  <td className="p-1.5 border border-[#808080]">{i + 1}</td>
                  <td className="p-1.5 border border-[#808080] whitespace-nowrap">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : '-'}
                  </td>
                  {(fields ?? []).map((f: any) => {
                    const val = (sub.values ?? []).find((v: any) => v.formFieldId === f.id);
                    return (
                      <td key={f.id} className="p-1.5 border border-[#808080] max-w-[200px] truncate">
                        {val?.value ?? ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { openWindow } = useWindowManager();

  useEffect(() => {
    if (!formId) return;
    openWindow(`submissions-${formId}`, 'Submissions', <SubmissionsWindowContent formId={formId} />, {
      x: 60, y: 40, width: 720, height: 480,
    });
  }, [formId, openWindow]);

  if (!formId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white">
        Invalid form ID
      </div>
    );
  }

  return null;
}
