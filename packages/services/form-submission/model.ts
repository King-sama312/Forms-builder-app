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

export const getFormAnalyticsInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});

export type GetFormAnalyticsInputType = z.infer<typeof getFormAnalyticsInput>;

export const fieldDistributionValueSchema = z.object({
  value: z.string(),
  count: z.number(),
});

export const fieldDistributionSchema = z.object({
  fieldId: z.string().uuid(),
  fieldLabel: z.string(),
  values: z.array(fieldDistributionValueSchema),
});

export const timelinePointSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const getFormAnalyticsOutput = z.object({
  totalSubmissions: z.number(),
  submissionsToday: z.number(),
  timeline: z.array(timelinePointSchema),
  fieldDistributions: z.array(fieldDistributionSchema),
});

export type GetFormAnalyticsOutputType = z.infer<typeof getFormAnalyticsOutput>;
