'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetFormById, useGetFormFields, useCreateFormSubmission } from '~/hooks/api/form/index';

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.formId as string;
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

  if (!formId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'white' }}>
        Invalid form link.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="window"
          style={{ width: 360 }}
        >
          <div className="title-bar">
            <div className="title-bar-text">Submission Received</div>
          </div>
          <div className="window-body flex flex-col items-center gap-3 py-6">
            <div className="text-4xl">✅</div>
            <p className="font-bold text-sm">Thank you!</p>
            <p className="text-xs">Your response has been recorded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="window"
        style={{ width: 480, maxWidth: '100%' }}
      >
        <div className="title-bar">
          <div className="title-bar-text">{form ? form.title : 'Form'}</div>
        </div>
        <div className="window-body">
          {isLoading ? (
            <p className="text-sm">Loading form...</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {form?.description && (
                <p className="text-xs text-gray-600">{form.description}</p>
              )}

              {fields?.map((field: any) => (
                <div key={field.id} className="field-row-stacked">
                  <label className="text-sm font-bold">
                    {field.label}
                    {field.required && <span className="text-red-600"> *</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      required={field.required}
                      placeholder={field.placeholder ?? ''}
                      value={values[field.id] ?? ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
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
                              const next = e.target.checked ? [...current, opt] : current.filter((c) => c !== opt);
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
                            required={field.required}
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
                      required={field.required}
                      placeholder={field.placeholder ?? ''}
                      value={values[field.id] ?? ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="field-row justify-end gap-2 mt-2 pt-2 border-t border-[#808080]">
                <button type="submit" disabled={isPending}>
                  {isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
