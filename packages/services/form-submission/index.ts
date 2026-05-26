import {
  db,
  eq,
  desc,
  asc,
  and,
  count,
  gte,
  sql,
  inArray,
} from "@repo/database";
import { formSubmissionsTable } from "@repo/database/models/form_submission";
import { formFieldsTable } from "@repo/database/models/form_field";
import {
  CreateFormSubmissionInputType,
  createFormSubmissionInput,
  GetFormSubmissionsInputType,
  getFormSubmissionsInput,
  GetFormAnalyticsInputType,
  getFormAnalyticsInput,
} from "./model";
import { formsTable } from "@repo/database/models/form";

const CATEGORICAL_TYPES = ["select", "checkbox", "radio", "YES_NO"] as const;

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

  public async getSubmissionCount(formId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.formId, formId));
    return result?.count ?? 0;
  }

  public async getSubmissionsTodayCount(formId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [result] = await db
      .select({ count: count() })
      .from(formSubmissionsTable)
      .where(
        and(
          eq(formSubmissionsTable.formId, formId),
          gte(formSubmissionsTable.createdAt, today)
        )
      );
    return result?.count ?? 0;
  }

  public async getSubmissionTimeline(formId: string) {
    const rows = await db
      .select({
        date: sql<string>`DATE(${formSubmissionsTable.createdAt})`,
        count: count(),
      })
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.formId, formId))
      .groupBy(sql`DATE(${formSubmissionsTable.createdAt})`)
      .orderBy(asc(sql`DATE(${formSubmissionsTable.createdAt})`));
    return rows.map((r) => ({ date: r.date, count: r.count }));
  }

  public async getFieldDistributions(formId: string) {
    const submissions = await db
      .select()
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.formId, formId));

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(
        and(
          eq(formFieldsTable.formId, formId),
          inArray(formFieldsTable.type, CATEGORICAL_TYPES)
        )
      );

    const distributions = fields.map((field) => {
      const valueCounts: Record<string, number> = {};

      for (const sub of submissions) {
        if (!sub.values) continue;
        const val = sub.values.find((v) => v.formFieldId === field.id);
        if (val && val.value) {
          valueCounts[val.value] = (valueCounts[val.value] || 0) + 1;
        }
      }

      return {
        fieldId: field.id,
        fieldLabel: field.label,
        values: Object.entries(valueCounts).map(([value, count]) => ({
          value,
          count,
        })),
      };
    });

    return distributions;
  }

  public async getFormAnalytics(payload: GetFormAnalyticsInputType) {
    const { formId } = await getFormAnalyticsInput.parseAsync(payload);

    const [totalSubmissions, submissionsToday, timeline, fieldDistributions] =
      await Promise.all([
        this.getSubmissionCount(formId),
        this.getSubmissionsTodayCount(formId),
        this.getSubmissionTimeline(formId),
        this.getFieldDistributions(formId),
      ]);

    return { totalSubmissions, submissionsToday, timeline, fieldDistributions };
  }

  public async getAllSubmissionsCount(userId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(formSubmissionsTable)
      .innerJoin(formsTable, eq(formSubmissionsTable.formId, formsTable.id))
      .where(
        and(
          eq(formsTable.createdBy, userId),
          eq(formsTable.isDeleted, false)
        )
      );
    return result?.count ?? 0;
  }

  public async getFormsRankedBySubmissions(userId: string) {
    const rows = await db
      .select({
        formId: formsTable.id,
        title: formsTable.title,
        submissionCount: count(),
      })
      .from(formsTable)
      .leftJoin(
        formSubmissionsTable,
        eq(formsTable.id, formSubmissionsTable.formId)
      )
      .where(
        and(
          eq(formsTable.createdBy, userId),
          eq(formsTable.isDeleted, false)
        )
      )
      .groupBy(formsTable.id, formsTable.title)
      .orderBy(desc(count()));
    return rows;
  }

  public async getGlobalSubmissionTimeline(userId: string) {
    const rows = await db
      .select({
        date: sql<string>`DATE(${formSubmissionsTable.createdAt})`,
        count: count(),
      })
      .from(formSubmissionsTable)
      .innerJoin(formsTable, eq(formSubmissionsTable.formId, formsTable.id))
      .where(
        and(
          eq(formsTable.createdBy, userId),
          eq(formsTable.isDeleted, false)
        )
      )
      .groupBy(sql`DATE(${formSubmissionsTable.createdAt})`)
      .orderBy(asc(sql`DATE(${formSubmissionsTable.createdAt})`));
    return rows.map((r) => ({ date: r.date, count: r.count }));
  }
}

export default FormSubmissionService;
