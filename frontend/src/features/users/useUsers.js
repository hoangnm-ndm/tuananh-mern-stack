import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCrudHooks } from "@/core/hooks/createCrudHooks.js";
import { queryKeys } from "@/core/query/queryKeys.js";
import { usersApi } from "./users.api.js";

/**
 * CUSTOM HOOK module nguoi dung.
 * Bo CRUD sinh tu dong; ben duoi bo sung 2 thao tac dac thu:
 * doi vai tro va khoa/mo tai khoan.
 */
const userHooks = createCrudHooks({
  api: usersApi,
  keys: queryKeys.users,
  resourceName: "nguoi dung",
});

export const {
  useList: useUsers,
  useDetail: useUser,
  useCreate: useCreateUser,
  useUpdate: useUpdateUser,
  useRemove: useDeleteUser,
} = userHooks;

/** Doi vai tro nguoi dung (chi superAdmin duoc phep - backend se chan neu khong). */
export function useChangeUserRole({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }) => usersApi.changeRole(id, role),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.(response.data, `Da doi vai tro thanh "${variables.role}"`);
    },
    onError,
  });
}

/** Khoa / mo khoa tai khoan. */
export function useSetUserStatus({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }) => usersApi.setActiveStatus(id, isActive),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onSuccess?.(response.data, variables.isActive ? "Da mo khoa tai khoan" : "Da khoa tai khoan");
    },
    onError,
  });
}
