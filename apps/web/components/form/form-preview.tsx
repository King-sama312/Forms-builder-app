'use client';

import { useState } from 'react';
import { useGetFormById, useGetFormFields, useCreateFormSubmission } from '~/hooks/api/form/index';
import { Win98Window } from '~/components/win98-window';

export function FormPreview({ formId, onClose }: { formId: string; onClose: () => void }) {
  const { form, isLoading: formLoading } = useGetFormById(formId);
  const { fields, isLoading: fieldsLoading } = useGetFormFields(formId);
  const { createFormSubmissionAsync, isPending } = useCreateFormSubmission();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isLoading = formLoading || fieldsLoading;

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entries = Object.entries(values).map(([fieldId, value]) => ({ formFieldId: fieldId, value }));
    await createFormSubmissionAsync({ formId, values: entries });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Win98Window title="Submission Received" defaultPosition={{ x: 200, y: 150, width: 360, height: 200 }} onClose={onClose}>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="text-4xl">✅</div>
          <p className="text-sm font-bold">Thank you!</p>
          <p className="text-xs">Your response has been recorded.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </Win98Window>
    );
  }

  return (
    <Win98Window
      title={form ? `Preview: ${form.title}` : 'Form Preview'}
      defaultPosition={{ x: 100, y: 60, width: 480, height: 520 }}
      onClose={onClose}
    >
      <div className="flex flex-col h-full">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm">Loading preview...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1 overflow-auto">
            {form?.description && (
              <p className="text-xs text-gray-600">{form.description}</p>
            )}

            {fields?.map((field: any) => (
              <div key={field.id} className="field-row-stacked">
                <label className="text-sm font-bold">
                  {field.label}
                    {(field.isRequired ?? field.required) && <span className="text-red-600"> *</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    required={field.isRequired ?? field.required}
                    placeholder={field.placeholeder ?? field.placeholder ?? ''}
                    value={values[field.id] ?? ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.isRequired ?? field.required}
                    value={values[field.id] ?? ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {field.options?.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex flex-col gap-1">
                    {field.options?.map((opt: string) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          value={opt}
                          checked={(values[field.id] ?? '').split(', ').includes(opt)}
                          onChange={(e) => {
                            const current = (values[field.id] ?? '').split(', ').filter(Boolean);
                            const next = e.target.checked
                              ? [...current, opt]
                              : current.filter((c) => c !== opt);
                            handleChange(field.id, next.join(', '));
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : field.type === 'radio' ? (
                  <div className="flex flex-col gap-1">
                    {field.options?.map((opt: string) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={field.id}
                            value={opt}
                            required={field.isRequired ?? field.required}
                            checked={values[field.id] === opt}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                          />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : field.type}
                    required={field.isRequired ?? field.required}
                    placeholder={field.placeholeder ?? field.placeholder ?? ''}
                    value={values[field.id] ?? ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className="field-row justify-end gap-2 mt-auto pt-2 border-t border-[#808080]">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Win98Window>
  );
}