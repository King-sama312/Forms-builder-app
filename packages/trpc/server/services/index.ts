import UserService from "@repo/services/user";
import FormService from "@repo/services/form";
import FormFieldService from "@repo/services/form-field";
import FormSubmissionService from "@repo/services/form-submission";
import DeleteFormService from "@repo/services/delete-form";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const formSubmissionService = new FormSubmissionService();
export const deleteFormService = new DeleteFormService();
