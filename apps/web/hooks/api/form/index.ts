import { useCallback } from "react";
import { trpc } from "~/trpc/client";
import { useFormBuilderStore } from "~/store/formBuilderStore";

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
    isPending
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
    isPending
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

export const useGetFormById = (formId: string) => {
  const {
    data: form,
    isError,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getFormById.useQuery({ formId });

  return { form, isError, isFetched, isFetching, isLoading, status };
};

export const useCreateFormSubmission = () => {
  const {
    mutateAsync: createFormSubmissionAsync,
    mutate: createFormSubmission,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.createFormSubmission.useMutation();

  return { createFormSubmissionAsync, createFormSubmission, error, failureCount, isError, isIdle, isPending, isSuccess, status };
};

export const useGetFormSubmissions = (formId: string) => {
  const {
    data: submissions,
    isError,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getFormSubmissions.useQuery({ formId });

  return { submissions, isError, isFetched, isFetching, isLoading, status };
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

export const useFormBuilderSync = (formId: string) => {
  const utils = trpc.useUtils();
  const fields = useFormBuilderStore((s) => s.fields);
  const isSaving = useFormBuilderStore((s) => s.isSaving);
  const markSaving = useFormBuilderStore((s) => s.markSaving);
  const markSaved = useFormBuilderStore((s) => s.markSaved);

  const updateFieldsMutation = trpc.form.updateFields.useMutation({
    onSuccess: async () => {
      await utils.form.getFormFields.invalidate({ formId });
      markSaved();
    },
    onError: () => {
      markSaved();
    },
  });

  const save = useCallback(async () => {
    if (fields.length === 0) return;
    markSaving();

    const mapped = fields.map((f) => ({
      id: f.id.startsWith("new-") ? undefined : f.id,
      type: f.type,
      label: f.label || "Untitled",
      placeholder: f.placeholder ?? undefined,
      required: f.required,
      options: f.options ?? undefined,
      order: f.order,
    }));

    await updateFieldsMutation.mutateAsync({
      formId,
      fields: mapped,
    });
  }, [fields, formId, updateFieldsMutation, markSaving]);

  return { save, isSaving };
};

export const useRecordDeletion = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: recordDeletionAsync,
    mutate: recordDeletion,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.recordDeletion.useMutation({
    onSuccess: async () => {
      await utils.form.invalidate();
    },
  });

  return { recordDeletionAsync, recordDeletion, error, failureCount, isError, isIdle, isSuccess, status };
};

export const useDeleteForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFormAsync,
    mutate: deleteForm,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.deleteForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return { deleteFormAsync, deleteForm, error, failureCount, isError, isIdle, isPending, isSuccess, status };
};

export const useRestoreForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: restoreFormAsync,
    mutate: restoreForm,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.restoreForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
      await utils.form.listDeletedForms.invalidate();
    },
  });

  return { restoreFormAsync, restoreForm, error, failureCount, isError, isIdle, isPending, isSuccess, status };
};

export const useListDeletedForms = () => {
  const {
    data: deletedForms,
    isError,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.listDeletedForms.useQuery(undefined);

  return { deletedForms, isError, isFetched, isFetching, isLoading, status };
};

export const useListDeletedEntities = () => {
  const {
    data: deletedEntities,
    isError,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.listDeletedEntities.useQuery({});

  return { deletedEntities, isError, isFetched, isFetching, isLoading, status };
};
