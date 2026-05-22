import { db, eq, asc } from "@repo/database";
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
      })
      .returning({ id: formFieldsTable.id });

    if (!insertResult || insertResult.length === 0 || !insertResult[0]?.id) {
      throw new Error(`Something went wrong while creating form field`);
    }

    return insertResult[0];
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

    if (!updateResult || updateResult.length === 0) {
      throw new Error(`Form field with id ${fieldId} not found or update failed`);
    }

    return updateResult[0];
  }

  public async deleteField(payload: DeleteFormFieldInputType) {
    const { fieldId } = await deleteFormFieldInput.parseAsync(payload);

    const deleteResult = await db
      .delete(formFieldsTable)
      .where(eq(formFieldsTable.id, fieldId))
      .returning({ id: formFieldsTable.id });

    if (!deleteResult || deleteResult.length === 0) {
      throw new Error(`Form field with id ${fieldId} not found or delete failed`);
    }

    return deleteResult[0];
  }

  public async getFields(payload: GetFormFieldsInputType) {
    const { formId } = await getFormFieldsInput.parseAsync(payload);

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.index));

    return fields;
  }
}

export default FormFieldService;
