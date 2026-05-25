import { db, eq, asc, inArray, sql } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form_field";
import {
  CreateFormFieldInputType,
  createFormFieldInput,
  UpdateFormFieldInputType,
  updateFormFieldInput,
  DeleteFormFieldInputType,
  deleteFormFieldInput,
  GetFormFieldsInputType,
  getFormFieldsInput,
  UpsertFieldsInputType,
  upsertFieldsInput,
  ReorderFieldsInputType,
  reorderFieldsInput,
  DeleteFieldInputType,
  deleteFieldInput,
} from "./model";

class FormFieldService {
  public async createField(payload: CreateFormFieldInputType) {
    const data = await createFormFieldInput.parseAsync(payload);

    const insertResult = await db
      .insert(formFieldsTable)
      .values({
        formId: data.formId,
        label: data.label,
        labelKey: data.labelKey,
        description: data.description,
        placeholeder: data.placeholeder,
        isRequired: data.isRequired,
        index: data.index,
        type: data.type,
        options: data.options ?? null,
        order: data.order ?? 0,
      })
      .returning({ id: formFieldsTable.id });

    const result = insertResult[0];
    if (!result || !result.id) {
      throw new Error(`Something went wrong while creating form field`);
    }

    return result;
  }

  public async updateField(payload: UpdateFormFieldInputType) {
    const { fieldId, ...updateData } = await updateFormFieldInput.parseAsync(payload);

    if (Object.keys(updateData).length === 0) {
      throw new Error("No data provided to update");
    }

    const updateResult = await db
      .update(formFieldsTable)
      .set(updateData)
      .where(eq(formFieldsTable.id, fieldId))
      .returning({ id: formFieldsTable.id });

    const result = updateResult[0];
    if (!result) {
      throw new Error(`Form field with id ${fieldId} not found or update failed`);
    }

    return result;
  }

  public async deleteFieldById(payload: DeleteFormFieldInputType) {
    const { fieldId } = await deleteFormFieldInput.parseAsync(payload);

    const deleteResult = await db
      .delete(formFieldsTable)
      .where(eq(formFieldsTable.id, fieldId))
      .returning({ id: formFieldsTable.id });

    const result = deleteResult[0];
    if (!result) {
      throw new Error(`Form field with id ${fieldId} not found or delete failed`);
    }

    return result;
  }

  public async getFields(payload: GetFormFieldsInputType) {
    const { formId } = await getFormFieldsInput.parseAsync(payload);

    const rows = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.index));

    return rows.map((r) => ({
      ...r,
      options: r.options as string[] | null,
    }));
  }

  public async getFieldsByFormId(formId: string) {
    const rows = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order), asc(formFieldsTable.index));

    return rows.map((r) => ({
      ...r,
      options: r.options as string[] | null,
    }));
  }

  public async upsertFields(payload: UpsertFieldsInputType) {
    const { formId, fields } = await upsertFieldsInput.parseAsync(payload);

    return await db.transaction(async (tx) => {
      const incomingIds = fields.filter((f) => f.id).map((f) => f.id as string);

      const existingFields = await tx
        .select({ id: formFieldsTable.id })
        .from(formFieldsTable)
        .where(eq(formFieldsTable.formId, formId));

      const existingIds = existingFields.map((f) => f.id);

      const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

      if (idsToDelete.length > 0) {
        await tx
          .delete(formFieldsTable)
          .where(inArray(formFieldsTable.id, idsToDelete));
      }

      for (const field of fields) {
        const order = field.order ?? 0;
        const index = field.index ?? (fields.indexOf(field) + 1).toFixed(2);
        const labelKey = field.labelKey ?? field.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

        if (field.id) {
          await tx
            .update(formFieldsTable)
            .set({
              label: field.label,
              labelKey,
              description: field.description ?? null,
              placeholeder: field.placeholeder ?? null,
              isRequired: field.isRequired,
              index,
              type: field.type,
              options: field.options ?? null,
              order,
            })
            .where(eq(formFieldsTable.id, field.id));
        } else {
          await tx
            .insert(formFieldsTable)
            .values({
              formId,
              label: field.label,
              labelKey,
              description: field.description ?? null,
              placeholeder: field.placeholeder ?? null,
              isRequired: field.isRequired,
              index,
              type: field.type,
              options: field.options ?? null,
              order,
            });
        }
      }

      return { success: true };
    });
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { formId, fieldId } = await deleteFieldInput.parseAsync(payload);

    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(formFieldsTable)
        .where(eq(formFieldsTable.id, fieldId))
        .returning({ id: formFieldsTable.id });

      if (!deleted) {
        throw new Error(`Form field with id ${fieldId} not found`);
      }

      return deleted;
    });
  }

  public async reorderFields(payload: ReorderFieldsInputType) {
    const { formId, fieldIds } = await reorderFieldsInput.parseAsync(payload);

    return await db.transaction(async (tx) => {
      for (const [i, id] of fieldIds.entries()) {
        await tx
          .update(formFieldsTable)
          .set({ order: i })
          .where(eq(formFieldsTable.id, id));
      }
      return { success: true };
    });
  }
}

export default FormFieldService;
