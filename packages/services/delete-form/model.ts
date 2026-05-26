import { z } from "zod";

export const entityTypeEnumSchema = z.enum(["FORM", "FORM_FIELD"]);

export const recordDeletionInput = z.object({
  entityType: entityTypeEnumSchema.describe("Type of entity being deleted"),
  entityId: z.string().uuid().describe("UUID of the entity being deleted"),
  formId: z.string().uuid().optional().describe("UUID of the form (for field deletions)"),
  data: z.record(z.string(), z.any()).describe("Full snapshot of the deleted entity data"),
  deletedBy: z.string().uuid().optional().describe("UUID of the user who deleted the entity"),
});

export type RecordDeletionInputType = z.infer<typeof recordDeletionInput>;

export const listDeletedEntitiesInput = z.object({
  entityType: entityTypeEnumSchema.optional().describe("Filter by entity type"),
  formId: z.string().uuid().optional().describe("Filter by form ID"),
});

export type ListDeletedEntitiesInputType = z.infer<typeof listDeletedEntitiesInput>;
