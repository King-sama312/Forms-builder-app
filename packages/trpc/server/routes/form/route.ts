import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { formService, formFieldService, formSubmissionService } from "../../services";
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
      // authenticatedProcedure ensures ctx.user.id is populated
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
      const result = await formFieldService.deleteField(input);
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
});
