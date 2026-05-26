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
  options: z.array(z.string()).optional().describe("Options for select type"),
  order: z.number().int().default(0).describe("Display order"),
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

const fieldOutputModel = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid().nullable().optional(),
  label: z.string(),
  labelKey: z.string(),
  description: z.string().nullable().optional(),
  placeholeder: z.string().nullable().optional(),
  isRequired: z.boolean(),
  index: z.string(),
  type: fieldTypeEnumSchema,
  options: z.array(z.string()).nullable().optional(),
  order: z.number().int(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const getFormByIdOutputModel = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  createdBy: z.string().uuid().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  fields: z.array(fieldOutputModel),
});

const formSubmissionValueModel = z.object({
  formFieldId: z.string().uuid(),
  value: z.string(),
});

export const createFormSubmissionInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  values: z.array(formSubmissionValueModel).describe("Array of field submissions"),
});

export const createFormSubmissionOutputModel = z.object({
  id: z.string().uuid().describe("ID of the submission"),
});

export const getFormSubmissionsInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});

export const getFormSubmissionsOutputModel = z.array(
  z.object({
    id: z.string().uuid(),
    formId: z.string().uuid(),
    values: z.array(formSubmissionValueModel).nullable().optional(),
    createdAt: z.date().nullable().optional(),
    updatedAt: z.date().nullable().optional(),
  })
);

export const getFormFieldsOutputModel = z.array(fieldOutputModel);

// NEW — Field management input/output models
export const updateFieldsInputModel = z.object({
  formId: z.string().uuid(),
  fields: z.array(z.object({
    id: z.string().uuid().optional(),
    type: fieldTypeEnumSchema,
    label: z.string().min(1),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    order: z.number().int(),
  })),
});

export const updateFieldsOutputModel = z.object({
  success: z.boolean(),
});

export const deleteFieldInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  fieldId: z.string().uuid().describe("UUID of the field to delete"),
});

export const reorderFieldsInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  fieldIds: z.array(z.string().uuid()).describe("Field IDs in new order"),
});

// Recycle bin models
export const deleteFormInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form to delete"),
});

export const deleteFormOutputModel = z.object({
  id: z.string().uuid().describe("ID of the deleted form"),
});

export const restoreFormInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form to restore"),
});

export const restoreFormOutputModel = z.object({
  id: z.string().uuid().describe("ID of the restored form"),
});

export const listDeletedFormsInputModel = z.undefined();

export const listDeletedFormsOutputModel = z.array(
  z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable().optional(),
    createdBy: z.string().uuid().nullable().optional(),
    isDeleted: z.boolean(),
    deletedAt: z.date().nullable().optional(),
    createdAt: z.date().nullable().optional(),
    updatedAt: z.date().nullable().optional(),
  })
);

// Delete-form models
export const recordDeletionInputModel = z.object({
  entityType: z.enum(["FORM", "FORM_FIELD"]).describe("Type of entity being deleted"),
  entityId: z.string().uuid().describe("UUID of the entity being deleted"),
  formId: z.string().uuid().optional().describe("UUID of the form (for field deletions)"),
  data: z.record(z.string(), z.any()).describe("Full snapshot of the deleted entity data"),
});

export const recordDeletionOutputModel = z.object({
  id: z.string().uuid().describe("ID of the deletion record"),
});

const deletedEntityOutputModel = z.object({
  id: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  formId: z.string().uuid().nullable().optional(),
  data: z.record(z.string(), z.any()),
  deletedBy: z.string().uuid().nullable().optional(),
  createdAt: z.date().nullable().optional(),
});

export const listDeletedEntitiesInputModel = z.object({
  entityType: z.enum(["FORM", "FORM_FIELD"]).optional().describe("Filter by entity type"),
  formId: z.string().uuid().optional().describe("Filter by form ID"),
});

export const listDeletedEntitiesOutputModel = z.array(deletedEntityOutputModel);
