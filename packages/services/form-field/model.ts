import { z } from "zod";

export const fieldTypeEnumSchema = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD", "text", "number", "select", "checkbox", "textarea", "email", "radio"]);

export const createFormFieldInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  label: z.string().max(100).describe("Label for the field"),
  labelKey: z.string().max(100).describe("Unique slug for the label"),
  description: z.string().optional().describe("Description for the field"),
  placeholeder: z.string().optional().describe("Placeholder text for the field"),
  isRequired: z.boolean().default(false).describe("Whether the field is required"),
  index: z.string().describe("Fractional index for sorting"),
  type: fieldTypeEnumSchema.describe("Type of the field"),
  options: z.array(z.string()).optional().describe("Options for select type"),
  order: z.number().int().default(0).describe("Display order"),
});

export type CreateFormFieldInputType = z.infer<typeof createFormFieldInput>;

export const updateFormFieldInput = z.object({
  fieldId: z.string().uuid().describe("UUID of the field to update"),
  label: z.string().max(100).optional(),
  description: z.string().optional(),
  placeholeder: z.string().optional(),
  isRequired: z.boolean().optional().default(false),
  index: z.string().optional(),
  options: z.array(z.string()).optional(),
  order: z.number().int().optional(),
});

export type UpdateFormFieldInputType = z.infer<typeof updateFormFieldInput>;

export const deleteFormFieldInput = z.object({
  fieldId: z.string().uuid().describe("UUID of the field to delete"),
});

export type DeleteFormFieldInputType = z.infer<typeof deleteFormFieldInput>;

export const getFormFieldsInput = z.object({
  formId: z.string().uuid().describe("UUID of the form to get fields for"),
});

export type GetFormFieldsInputType = z.infer<typeof getFormFieldsInput>;

export const upsertFieldsInput = z.object({
  formId: z.string().uuid(),
  fields: z.array(z.object({
    id: z.string().uuid().optional(),
    type: fieldTypeEnumSchema,
    label: z.string().min(1),
    labelKey: z.string().optional(),
    description: z.string().optional(),
    placeholeder: z.string().optional(),
    isRequired: z.boolean().default(false),
    index: z.string().optional(),
    options: z.array(z.string()).optional(),
    order: z.number().int().default(0),
  })),
});

export type UpsertFieldsInputType = z.infer<typeof upsertFieldsInput>;

export const reorderFieldsInput = z.object({
  formId: z.string().uuid(),
  fieldIds: z.array(z.string().uuid()),
});

export type ReorderFieldsInputType = z.infer<typeof reorderFieldsInput>;

export const deleteFieldInput = z.object({
  formId: z.string().uuid(),
  fieldId: z.string().uuid(),
});

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;
