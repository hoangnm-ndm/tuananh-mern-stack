import { createContext } from "react";

/**
 * Tach context ra file rieng (khong kem component).
 * Ly do: Vite HMR (Fast Refresh) yeu cau mot file chi export component,
 * neu tron context + component thi moi lan sua se lam mat state.
 */
export const AuthContext = createContext(null);
