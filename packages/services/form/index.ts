import { db, eq, desc } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form_field";
import { CreateFormInputType, createFormInput, ListFormsByUserIdInputType, listFormsByUserIdInput, GetFormByIdInputType, getFormByIdInput } from "./model";

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
      .where(eq(formsTable.createdBy, userId))
      .orderBy(desc(formsTable.createdAt));

    return forms;
  }

  public async getFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .limit(1);

    if (!form) {
      throw new Error(`Form not found`);
    }

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.index);

    return { ...form, fields };
  }
}

export default FormService;

