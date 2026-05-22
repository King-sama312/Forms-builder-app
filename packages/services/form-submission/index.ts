import { db, eq, desc } from "@repo/database";
import { formSubmissionsTable } from "@repo/database/models/form_submission";
import {
  CreateFormSubmissionInputType,
  createFormSubmissionInput,
  GetFormSubmissionsInputType,
  getFormSubmissionsInput,
} from "./model";

class FormSubmissionService {
  public async createSubmission(payload: CreateFormSubmissionInputType) {
    const { formId, values } = await createFormSubmissionInput.parseAsync(payload);

    const insertResult = await db
      .insert(formSubmissionsTable)
      .values({ formId, values })
      .returning({ id: formSubmissionsTable.id });

    const result = insertResult[0];
    if (!result || !result.id) {
      throw new Error("Something went wrong while creating submission");
    }

    return result;
  }

  public async getSubmissions(payload: GetFormSubmissionsInputType) {
    const { formId } = await getFormSubmissionsInput.parseAsync(payload);

    const submissions = await db
      .select()
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.formId, formId))
      .orderBy(desc(formSubmissionsTable.createdAt));

    return submissions;
  }
}

export default FormSubmissionService;
