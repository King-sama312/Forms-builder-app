import { z } from "zod";

export const formSubmissionValueSchema = z.object({
  formFieldId: z.string().uuid(),
  value: z.string(),
});

export const createFormSubmissionInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  values: z.array(formSubmissionValueSchema).describe("Array of field submissions"),
});

export type CreateFormSubmissionInputType = z.infer<typeof createFormSubmissionInput>;

export const getFormSubmissionsInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});

export type GetFormSubmissionsInputType = z.infer<typeof getFormSubmissionsInput>;
