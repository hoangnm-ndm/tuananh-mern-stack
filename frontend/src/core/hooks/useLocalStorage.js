import { useCallback, useState } from "react";

/**
 * State duoc dong bo voi localStorage.
 * Boc try/catch vi localStorage co the nem loi (cua so an danh, bi chan cookie).
 *
 * KHONG dung de luu token - xem core/auth/tokenStorage.js de biet ly do.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const update = useCallback(
    (next) => {
      setValue((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Het dung luong hoac bi chan - van cap nhat state trong bo nho
        }
        return resolved;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // bo qua
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, update, remove];
}
