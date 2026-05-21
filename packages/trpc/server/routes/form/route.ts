import { authenticatedProcedure, router } from "../../trpc";
import { formService } from "../../services";
import { createFormInputModel, createFormOutputModel } from "./model";

const TAGS = ["Form"];

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/createForm",
        tags: TAGS,
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
});