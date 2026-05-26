import { z } from "zod";

export const createFormInput = z.object({
  title: z.string().max(55).describe("Title of the form"),
  description: z.string().max(30).optional().describe("Description of the form"),
  createdBy: z.string().uuid().describe("UUID of the user who creates the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
  userId: z.string().uuid().describe("UUID of the user"),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const getFormByIdInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});

export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;

export const deleteFormInput = z.object({
  formId: z.string().uuid().describe("UUID of the form to delete"),
});

export type DeleteFormInputType = z.infer<typeof deleteFormInput>;

export const restoreFormInput = z.object({
  formId: z.string().uuid().describe("UUID of the form to restore"),
});

export type RestoreFormInputType = z.infer<typeof restoreFormInput>;

export const listDeletedFormsInput = z.object({
  userId: z.string().uuid().describe("UUID of the user"),
});

export type ListDeletedFormsInputType = z.infer<typeof listDeletedFormsInput>;
