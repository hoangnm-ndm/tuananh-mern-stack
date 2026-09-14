import { useEffect, useState } from "react";

/**
 * Tra ve gia tri "cham nhip": chi cap nhat sau khi ngung thay doi `delay` ms.
 * Dung cho o tim kiem -> go 10 ky tu chi ban 1 request thay vi 10.
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
