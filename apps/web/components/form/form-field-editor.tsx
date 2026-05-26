'use client';

import { useFormBuilderStore, type FieldType } from '~/store/formBuilderStore';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
];

export function FormFieldEditor({ formId }: { formId: string }) {
  const fields = useFormBuilderStore((s) => s.fields);
  const addField = useFormBuilderStore((s) => s.addField);
  const removeField = useFormBuilderStore((s) => s.removeField);
  const updateField = useFormBuilderStore((s) => s.updateField);
  const reorderFields = useFormBuilderStore((s) => s.reorderFields);

  const moveUp = (index: number) => {
    if (index > 0) reorderFields(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < fields.length - 1) reorderFields(index, index + 1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#808080] flex-wrap">
        <span className="text-xs font-bold mr-1">Add Field:</span>
        {FIELD_TYPES.map((ft) => (
          <button
            key={ft.value}
            className="text-xs px-2 py-1"
            onClick={() => addField(ft.value)}
          >
            + {ft.label}
          </button>
        ))}
      </div>

      {/* Fields list */}
      <div className="flex-1 overflow-auto border border-[#808080] bg-white p-1">
        {fields.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No fields yet. Click a button above to add one.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-[#808080] p-2 bg-[#f0f0f0]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold w-6">#{index + 1}</span>
                  <select
                    className="text-xs"
                    value={field.type}
                    onChange={(e) =>
                      updateField(field.id, { type: e.target.value as FieldType })
                    }
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>
                        {ft.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1" />
                  <button
                    className="text-xs px-1"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                  >
                    ▲
                  </button>
                  <button
                    className="text-xs px-1"
                    onClick={() => moveDown(index)}
                    disabled={index === fields.length - 1}
                  >
                    ▼
                  </button>
                  <button
                    className="text-xs px-1 text-red-700"
                    onClick={() => removeField(field.id)}
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="field-row-stacked">
                    <label className="text-xs">Label</label>
                    <input
                      type="text"
                      className="text-xs"
                      value={field.label}
                      onChange={(e) =>
                        updateField(field.id, { label: e.target.value })
                      }
                    />
                  </div>
                  <div className="field-row-stacked">
                    <label className="text-xs">Placeholder</label>
                    <input
                      type="text"
                      className="text-xs"
                      value={field.placeholder ?? ''}
                      onChange={(e) =>
                        updateField(field.id, { placeholder: e.target.value || null })
                      }
                    />
                  </div>
                  <div className="field-row-stacked">
                    <label className="text-xs">Required</label>
                    <span
                      role="switch"
                      aria-checked={field.required}
                      onClick={() =>
                        updateField(field.id, { required: !field.required })
                      }
                      className={`relative inline-flex h-5 w-10 items-center border cursor-pointer ${
                        field.required
                          ? 'bg-blue-400 border-blue-400'
                          : 'bg-[#c0c0c0] border-[#808080]'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 border border-[#808080] bg-white transition-transform ${
                          field.required ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </span>
                  </div>
                </div>

                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                  <div className="mt-2">
                    <label className="text-xs block mb-1">Options (comma separated)</label>
                    <input
                      type="text"
                      className="text-xs w-full"
                      value={field.options?.join(', ') ?? ''}
                      onChange={(e) =>
                        updateField(field.id, {
                          options: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}