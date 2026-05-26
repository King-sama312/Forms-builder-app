import { db, eq, and, desc } from "@repo/database";
import { deletedFormsTable } from "@repo/database/models/delete_form";
import {
  RecordDeletionInputType,
  recordDeletionInput,
  ListDeletedEntitiesInputType,
  listDeletedEntitiesInput,
} from "./model";

class DeleteFormService {
  public async recordDeletion(payload: RecordDeletionInputType) {
    const { entityType, entityId, formId, data, deletedBy } = await recordDeletionInput.parseAsync(payload);

    const insertResult = await db
      .insert(deletedFormsTable)
      .values({
        entityType,
        entityId,
        formId,
        data,
        deletedBy,
      })
      .returning({ id: deletedFormsTable.id });

    if (!insertResult || insertResult.length === 0 || !insertResult[0]?.id) {
      throw new Error(`Something went wrong while recording deletion`);
    }

    return insertResult[0];
  }

  public async listDeletedEntities(payload: ListDeletedEntitiesInputType) {
    const { entityType, formId } = await listDeletedEntitiesInput.parseAsync(payload);

    const conditions = [];
    if (entityType) conditions.push(eq(deletedFormsTable.entityType, entityType));
    if (formId) conditions.push(eq(deletedFormsTable.formId, formId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(deletedFormsTable)
      .where(whereClause)
      .orderBy(desc(deletedFormsTable.createdAt));

    return rows.map((row) => ({
      ...row,
      data: row.data as Record<string, any>,
    }));
  }
}

export default DeleteFormService;
