import { z } from "zod";

export const createFormInputModel = z.object({
  title: z.string().max(55).describe("Title of the form"),
  description: z.string().max(30).optional().describe("Description of the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().uuid().describe("ID of the newly created form"),
});

export const listFormsInputModel = z.undefined();

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable().optional(),
    createdBy: z.string().uuid().nullable().optional(),
    createdAt: z.date().nullable().optional(),
    updatedAt: z.date().nullable().optional(),
  })
);

import { fieldTypeEnumSchema } from "@repo/services/form-field/model";

// Form Field Inputs
export const createFormFieldInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  label: z.string().max(100).describe("Label for the field"),
  labelKey: z.string().max(100).describe("Unique slug for the label"),
  description: z.string().optional().describe("Description for the field"),
  placeholeder: z.string().optional().describe("Placeholder text for the field"),
  isRequired: z.boolean().default(false).describe("Whether the field is required"),
  index: z.string().describe("Fractional index for sorting"),
  type: fieldTypeEnumSchema.describe("Type of the field"),
});

export const updateFormFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("UUID of the field to update"),
  label: z.string().max(100).optional(),
  description: z.string().optional(),
  placeholeder: z.string().optional(),
  isRequired: z.boolean().optional().default(false),
  index: z.string().optional(),
});

export const deleteFormFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("UUID of the field to delete"),
});

export const getFormFieldsInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form to get fields for"),
});

// Form Field Outputs
export const formFieldActionOutputModel = z.object({
  id: z.string().uuid().describe("ID of the form field"),
});

export const getFormByIdInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});

export const getFormByIdOutputModel = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  createdBy: z.string().uuid().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  fields: z.array(
    z.object({
      id: z.string().uuid(),
      formId: z.string().uuid().nullable().optional(),
      label: z.string(),
      labelKey: z.string(),
      description: z.string().nullable().optional(),
      placeholeder: z.string().nullable().optional(),
      isRequired: z.boolean(),
      index: z.string(),
      type: fieldTypeEnumSchema,
      createdAt: z.date().nullable().optional(),
      updatedAt: z.date().nullable().optional(),
    })
  ),
});

export const getFormFieldsOutputModel = z.array(
  z.object({
    id: z.string().uuid(),
    formId: z.string().uuid().nullable().optional(),
    label: z.string(),
    labelKey: z.string(),
    description: z.string().nullable().optional(),
    placeholeder: z.string().nullable().optional(),
    isRequired: z.boolean(),
    index: z.string(),
    type: fieldTypeEnumSchema,
    createdAt: z.date().nullable().optional(),
    updatedAt: z.date().nullable().optional(),
  })
);
