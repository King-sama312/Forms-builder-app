import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.invalidate();
    },
  });

  return {
    createFormAsync,
    createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useListForms = () => {
  const {
    data: forms,
    isError,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.listForms.useQuery(undefined);

  return { forms, isError, isFetched, isFetching, isLoading, status };
};

export const useGetFormFields = (formId: string) => {
  const {
    data: fields,
    isError,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getFormFields.useQuery({ formId });

  return { fields, isError, isFetched, isFetching, isLoading, status };
};

export const useCreateFormField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFormFieldAsync,
    mutate: createFormField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createFormField.useMutation({
    onSuccess: async (_, variables) => {
      await utils.form.getFormFields.invalidate({ formId: variables.formId });
    },
  });

  return { createFormFieldAsync, createFormField, error, failureCount, isError, isIdle, isSuccess, status };
};

export const useUpdateFormField = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFormFieldAsync,
    mutate: updateFormField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateFormField.useMutation({
    onSuccess: async () => {
      await utils.form.getFormFields.invalidate({ formId });
    },
  });

  return { updateFormFieldAsync, updateFormField, error, failureCount, isError, isIdle, isSuccess, status };
};

export const useDeleteFormField = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFormFieldAsync,
    mutate: deleteFormField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.deleteFormField.useMutation({
    onSuccess: async () => {
      await utils.form.getFormFields.invalidate({ formId });
    },
  });

  return { deleteFormFieldAsync, deleteFormField, error, failureCount, isError, isIdle, isSuccess, status };
};
