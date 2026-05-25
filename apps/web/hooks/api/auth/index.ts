import { trpc } from "~/trpc/client";

export const useSignUp = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
    isPending
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      utils.auth.getLoggedInUserInfo.invalidate();
    },
  });
  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
    isPending
  };
};

export const useSignIn = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: signInUserWithEmailAndPasswordAsync,
    mutate: signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
    isPending
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: async()=>{
      utils.auth.getLoggedInUserInfo.invalidate()
    }
  });

  return {
    signInUserWithEmailAndPasswordAsync,
    signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
    isPending
  };
};

export const useGetUserInfo = () => {
  const {
    data: user,
    isError,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.auth.getLoggedInUserInfo.useQuery();

  return { user, isError, isFetched, isFetching, isLoading, status };
};

export const useSignOut = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: signOutAsync,
    mutate: signOut,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signOut.useMutation({
    onSuccess: async () => {
      utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    signOutAsync,
    signOut,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};
