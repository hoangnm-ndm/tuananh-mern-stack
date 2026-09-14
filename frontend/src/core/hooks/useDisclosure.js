import { useCallback, useState } from "react";

/** Quan ly trang thai dong/mo (modal, dropdown, drawer...). */
export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((previous) => !previous), []);

  return { isOpen, open, close, toggle };
}
