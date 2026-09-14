import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthContext } from "./AuthContext.js";
import { useAuth } from "./useAuth.js";
import { PERMISSIONS, ROLES } from "../config/constants.js";
import { createAuthValue, mockUsers } from "@/test/utils.jsx";

/** Render useAuth voi mot gia tri context gia lap. */
function renderUseAuth(user) {
  const value = createAuthValue({ user });
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    ),
  });
}

describe("useAuth", () => {
  it("nem loi ro rang khi dung ngoai AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrowError(/ben trong <AuthProvider>/);
  });

  it("khach chua dang nhap: khong co quyen nao", () => {
    const { result } = renderUseAuth(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.hasPermission(PERMISSIONS.PRODUCT_READ)).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("member: co quyen doc san pham, khong co quyen tao", () => {
    const { result } = renderUseAuth(mockUsers.member);
    expect(result.current.hasPermission(PERMISSIONS.PRODUCT_READ)).toBe(true);
    expect(result.current.hasPermission(PERMISSIONS.PRODUCT_CREATE)).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("admin: co quyen quan tri san pham nhung khong doi duoc vai tro", () => {
    const { result } = renderUseAuth(mockUsers.admin);
    expect(result.current.hasPermission(PERMISSIONS.PRODUCT_CREATE)).toBe(true);
    expect(result.current.hasPermission(PERMISSIONS.USER_MANAGE_ROLE)).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isSuperAdmin).toBe(false);
  });

  it("superAdmin: co toan quyen", () => {
    const { result } = renderUseAuth(mockUsers.superAdmin);
    expect(result.current.hasPermission(PERMISSIONS.USER_MANAGE_ROLE)).toBe(true);
    expect(result.current.isSuperAdmin).toBe(true);
  });

  it("hasPermission: chi can MOT trong cac quyen", () => {
    const { result } = renderUseAuth(mockUsers.member);
    expect(result.current.hasPermission(PERMISSIONS.USER_DELETE, PERMISSIONS.PRODUCT_READ)).toBe(
      true,
    );
  });

  it("hasAllPermissions: can DU tat ca", () => {
    const { result } = renderUseAuth(mockUsers.member);
    expect(result.current.hasAllPermissions(PERMISSIONS.PRODUCT_READ)).toBe(true);
    expect(
      result.current.hasAllPermissions(PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_CREATE),
    ).toBe(false);
  });

  it("hasMinRole so sanh dung theo cap bac", () => {
    const { result } = renderUseAuth(mockUsers.admin);
    expect(result.current.hasMinRole(ROLES.MEMBER)).toBe(true);
    expect(result.current.hasMinRole(ROLES.ADMIN)).toBe(true);
    expect(result.current.hasMinRole(ROLES.SUPER_ADMIN)).toBe(false);
  });

  it("hasRole kiem tra theo danh sach vai tro", () => {
    const { result } = renderUseAuth(mockUsers.admin);
    expect(result.current.hasRole(ROLES.ADMIN, ROLES.SUPER_ADMIN)).toBe(true);
    expect(result.current.hasRole(ROLES.MEMBER)).toBe(false);
  });
});
