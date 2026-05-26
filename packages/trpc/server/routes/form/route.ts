import { z } from "zod";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { formService, formFieldService, formSubmissionService, deleteFormService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  createFormInputModel,
  createFormOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
  createFormFieldInputModel,
  updateFormFieldInputModel,
  deleteFormFieldInputModel,
  getFormFieldsInputModel,
  formFieldActionOutputModel,
  getFormFieldsOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  createFormSubmissionInputModel,
  createFormSubmissionOutputModel,
  getFormSubmissionsInputModel,
  getFormSubmissionsOutputModel,
  updateFieldsInputModel,
  updateFieldsOutputModel,
  deleteFieldInputModel,
  reorderFieldsInputModel,
  deleteFormInputModel,
  deleteFormOutputModel,
  restoreFormInputModel,
  restoreFormOutputModel,
  listDeletedFormsInputModel,
  listDeletedFormsOutputModel,
  recordDeletionInputModel,
  recordDeletionOutputModel,
  listDeletedEntitiesInputModel,
  listDeletedEntitiesOutputModel,
  getFormAnalyticsInputModel,
  getFormAnalyticsOutputModel,
  getGlobalAnalyticsOutputModel,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");
export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { title, description } = input;
      const createdBy = ctx.user.id;

      const { id } = await formService.createForm({
        title,
        description,
        createdBy,
      });

      return { id };
    }),

  listForms: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listForms"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(listFormsInputModel)
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      const forms = await formService.listFormsByUserId({ userId: ctx.user.id });
      return forms;
    }),

  createFormField: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createFormField"), tags: TAGS, protect: true },
    })
    .input(createFormFieldInputModel)
    .output(formFieldActionOutputModel)
    .mutation(async ({ input }) => {
      const result = await formFieldService.createField(input);
      return result;
    }),

  updateFormField: authenticatedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/updateFormField"), tags: TAGS, protect: true },
    })
    .input(updateFormFieldInputModel)
    .output(formFieldActionOutputModel)
    .mutation(async ({ input }) => {
      const result = await formFieldService.updateField(input);
      return result;
    }),

  deleteFormField: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/deleteFormField"), tags: TAGS, protect: true },
    })
    .input(deleteFormFieldInputModel)
    .output(formFieldActionOutputModel)
    .mutation(async ({ input }) => {
      const result = await formFieldService.deleteFieldById(input);
      return result;
    }),

  getFormById: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getFormById"), tags: TAGS },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input }) => {
      const result = await formService.getFormById(input);
      return result;
    }),

  createFormSubmission: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createFormSubmission"), tags: TAGS },
    })
    .input(createFormSubmissionInputModel)
    .output(createFormSubmissionOutputModel)
    .mutation(async ({ input }) => {
      const result = await formSubmissionService.createSubmission(input);
      return result;
    }),

  getFormSubmissions: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getFormSubmissions"), tags: TAGS, protect: true },
    })
    .input(getFormSubmissionsInputModel)
    .output(getFormSubmissionsOutputModel)
    .query(async ({ input }) => {
      const result = await formSubmissionService.getSubmissions(input);
      return result;
    }),

  getFormFields: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getFormFields"), tags: TAGS, protect: true },
    })
    .input(getFormFieldsInputModel)
    .output(getFormFieldsOutputModel)
    .query(async ({ input }) => {
      const result = await formFieldService.getFields(input);
      return result;
    }),

  // NEW — Field management procedures

  updateFields: authenticatedProcedure
    .meta({
      openapi: { method: "PUT", path: getPath("/updateFields"), tags: TAGS, protect: true },
    })
    .input(updateFieldsInputModel)
    .output(updateFieldsOutputModel)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById({ formId: input.formId });
      if (form.createdBy !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const mapped = input.fields.map((f, i) => ({
        id: f.id,
        type: f.type,
        label: f.label,
        labelKey: f.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
        description: undefined as string | undefined,
        placeholeder: f.placeholder,
        isRequired: f.required,
        index: (i + 1).toFixed(2),
        options: f.options,
        order: f.order ?? i,
      }));

      const result = await formFieldService.upsertFields({
        formId: input.formId,
        fields: mapped,
      });
      return result;
    }),

  deleteField: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/deleteField"), tags: TAGS, protect: true },
    })
    .input(deleteFieldInputModel)
    .output(formFieldActionOutputModel)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById({ formId: input.formId });
      if (form.createdBy !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const result = await formFieldService.deleteField({
        formId: input.formId,
        fieldId: input.fieldId,
      });
      return result;
    }),

  reorderFields: authenticatedProcedure
    .meta({
      openapi: { method: "PUT", path: getPath("/reorderFields"), tags: TAGS, protect: true },
    })
    .input(reorderFieldsInputModel)
    .output(updateFieldsOutputModel)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById({ formId: input.formId });
      if (form.createdBy !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const result = await formFieldService.reorderFields({
        formId: input.formId,
        fieldIds: input.fieldIds,
      });
      return result;
    }),

  deleteForm: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/deleteForm"), tags: TAGS, protect: true },
    })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById({ formId: input.formId });
      if (form.createdBy !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const result = await formService.deleteForm({ formId: input.formId });
      return result;
    }),

  restoreForm: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/restoreForm"), tags: TAGS, protect: true },
    })
    .input(restoreFormInputModel)
    .output(restoreFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormByIdIncludingDeleted({ formId: input.formId });
      if (form.createdBy !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const result = await formService.restoreForm({ formId: input.formId });
      return result;
    }),

  listDeletedForms: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/listDeletedForms"), tags: TAGS, protect: true },
    })
    .input(listDeletedFormsInputModel)
    .output(listDeletedFormsOutputModel)
    .query(async ({ ctx }) => {
      const forms = await formService.listDeletedForms({ userId: ctx.user.id });
      return forms;
    }),

  recordDeletion: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/recordDeletion"), tags: TAGS, protect: true },
    })
    .input(recordDeletionInputModel)
    .output(recordDeletionOutputModel)
    .mutation(async ({ input }) => {
      const result = await deleteFormService.recordDeletion(input);
      return result;
    }),

  listDeletedEntities: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/listDeletedEntities"), tags: TAGS, protect: true },
    })
    .input(listDeletedEntitiesInputModel)
    .output(listDeletedEntitiesOutputModel)
    .query(async ({ input }) => {
      const result = await deleteFormService.listDeletedEntities(input);
      return result;
    }),

  getAnalytics: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getAnalytics"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getFormAnalyticsInputModel)
    .output(getFormAnalyticsOutputModel)
    .query(async ({ input }) => {
      const result = await formSubmissionService.getFormAnalytics(input);
      return result;
    }),

  getGlobalAnalytics: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getGlobalAnalytics"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(z.undefined())
    .output(getGlobalAnalyticsOutputModel)
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      const [totalForms, totalSubmissions, formsRanked, submissionActivity] =
        await Promise.all([
          formService.getTotalFormCount(userId),
          formSubmissionService.getAllSubmissionsCount(userId),
          formSubmissionService.getFormsRankedBySubmissions(userId),
          formSubmissionService.getGlobalSubmissionTimeline(userId),
        ]);

      return { totalForms, totalSubmissions, formsRanked, submissionActivity };
    }),
});
