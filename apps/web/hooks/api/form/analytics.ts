import { trpc } from "~/trpc/client";

export const useGetFormAnalytics = (formId: string) => {
  const { data, isLoading, isError, isFetched, isFetching, status } =
    trpc.form.getAnalytics.useQuery({ formId });

  return {
    analytics: data,
    isLoading,
    isError,
    isFetched,
    isFetching,
    status,
  };
};

export const useGetGlobalAnalytics = () => {
  const { data, isLoading, isError, isFetched, isFetching, status } =
    trpc.form.getGlobalAnalytics.useQuery(undefined);

  return {
    analytics: data,
    isLoading,
    isError,
    isFetched,
    isFetching,
    status,
  };
};
