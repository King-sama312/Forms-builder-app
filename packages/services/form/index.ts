import { db, eq, asc, desc, and, count } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form_field";
import {
  CreateFormInputType,
  createFormInput,
  ListFormsByUserIdInputType,
  listFormsByUserIdInput,
  GetFormByIdInputType,
  getFormByIdInput,
  DeleteFormInputType,
  deleteFormInput,
  RestoreFormInputType,
  restoreFormInput,
  ListDeletedFormsInputType,
  listDeletedFormsInput,
} from "./model";

class FormService {
  public async createForm(payload: CreateFormInputType) {
    const { title, description, createdBy } = await createFormInput.parseAsync(payload);

    const formInsertResult = await db
      .insert(formsTable)
      .values({
        title,
        description,
        createdBy,
      })
      .returning({ id: formsTable.id });

    if (!formInsertResult || formInsertResult.length === 0 || !formInsertResult[0]?.id) {
      throw new Error(`Something went wrong while creating form`);
    }

    return formInsertResult[0];
  }

  public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
    const { userId } = await listFormsByUserIdInput.parseAsync(payload);

    const forms = await db
      .select()
      .from(formsTable)
      .where(
        and(eq(formsTable.createdBy, userId), eq(formsTable.isDeleted, false))
      )
      .orderBy(desc(formsTable.createdAt));

    return forms;
  }

  public async getFormByIdIncludingDeleted(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .limit(1);

    if (!form) {
      throw new Error(`Form not found`);
    }

    return form;
  }

  public async getFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.isDeleted, false)))
      .limit(1);

    if (!form) {
      throw new Error(`Form not found`);
    }

    const rows = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order), asc(formFieldsTable.index));

    const fields = rows.map((r) => ({
      ...r,
      options: r.options as string[] | null,
    }));

    return { ...form, fields };
  }

  public async deleteForm(payload: DeleteFormInputType) {
    const { formId } = await deleteFormInput.parseAsync(payload);

    const [form] = await db
      .update(formsTable)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id });

    if (!form?.id) {
      throw new Error(`Form not found or already deleted`);
    }

    return { id: form.id };
  }

  public async restoreForm(payload: RestoreFormInputType) {
    const { formId } = await restoreFormInput.parseAsync(payload);

    const [form] = await db
      .update(formsTable)
      .set({ isDeleted: false, deletedAt: null })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id });

    if (!form?.id) {
      throw new Error(`Form not found`);
    }

    return { id: form.id };
  }

  public async listDeletedForms(payload: ListDeletedFormsInputType) {
    const { userId } = await listDeletedFormsInput.parseAsync(payload);

    const forms = await db
      .select()
      .from(formsTable)
      .where(
        and(eq(formsTable.createdBy, userId), eq(formsTable.isDeleted, true))
      )
      .orderBy(desc(formsTable.deletedAt));

    return forms;
  }

  public async getTotalFormCount(userId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(formsTable)
      .where(
        and(eq(formsTable.createdBy, userId), eq(formsTable.isDeleted, false))
      );
    return result?.count ?? 0;
  }
}

export default FormService;

