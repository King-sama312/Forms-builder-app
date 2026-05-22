import { z } from "zod";

export const fieldTypeEnumSchema = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFormFieldInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  label: z.string().max(100).describe("Label for the field"),
  labelKey: z.string().max(100).describe("Unique slug for the label"),
  description: z.string().optional().describe("Description for the field"),
  placeholeder: z.string().optional().describe("Placeholder text for the field"),
  isRequired: z.boolean().default(false).describe("Whether the field is required"),
  index: z.string().describe("Fractional index for sorting"),
  type: fieldTypeEnumSchema.describe("Type of the field"),
});

export type CreateFormFieldInputType = z.infer<typeof createFormFieldInput>;

export const updateFormFieldInput = z.object({
  fieldId: z.string().uuid().describe("UUID of the field to update"),
  label: z.string().max(100).optional(),
  description: z.string().optional(),
  placeholeder: z.string().optional(),
  isRequired: z.boolean().optional(),
  index: z.string().optional(),
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
