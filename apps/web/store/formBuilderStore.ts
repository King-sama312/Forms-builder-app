"use client";

import { create } from "zustand";

export type FieldType = "text" | "number" | "select" | "checkbox" | "textarea" | "email"| "radio";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string | null;
  required: boolean;
  options: string[] | null;
  order: number;
}

interface FormBuilderState {
  formId: string;
  fields: FormField[];
  selectedFieldId: string | null;
  isPreviewOpen: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  setFormId: (id: string) => void;
  loadFields: (fields: FormField[]) => void;
  addField: (type: FieldType) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  reorderFields: (oldIndex: number, newIndex: number) => void;
  selectField: (id: string | null) => void;
  togglePreview: () => void;
  markSaving: () => void;
  markSaved: () => void;
  reset: () => void;
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  formId: "",
  fields: [],
  selectedFieldId: null,
  isPreviewOpen: false,
  isSaving: false,
  lastSaved: null,

  setFormId: (id) => set({ formId: id }),

  loadFields: (fields) => set({ fields, selectedFieldId: null }),

  addField: (type) =>
    set((state) => {
      const newField: FormField = {
        id: generateId(),
        type,
        label: "",
        placeholder: null,
        required: false,
        options: type === "select" ? [] : null,
        order: state.fields.length,
      };
      return { fields: [...state.fields, newField], selectedFieldId: newField.id };
    }),

  removeField: (id) =>
    set((state) => {
      const fields = state.fields
        .filter((f) => f.id !== id)
        .map((f, i) => ({ ...f, order: i }));
      return {
        fields,
        selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
      };
    }),

  updateField: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  reorderFields: (oldIndex, newIndex) =>
    set((state) => {
      const fields = [...state.fields];
      const moved = fields.splice(oldIndex, 1)[0];
      if (!moved) return state;
      fields.splice(newIndex, 0, moved);
      return { fields: fields.map((f, i) => ({ ...f, order: i })) };
    }),

  selectField: (id) => set({ selectedFieldId: id }),

  togglePreview: () => set((state) => ({ isPreviewOpen: !state.isPreviewOpen })),

  markSaving: () => set({ isSaving: true }),

  markSaved: () => set({ isSaving: false, lastSaved: new Date() }),

  reset: () =>
    set({
      fields: [],
      selectedFieldId: null,
      isPreviewOpen: false,
      isSaving: false,
      lastSaved: null,
    }),
}));
