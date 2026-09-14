import { describe, expect, it } from "vitest";
import {
  PERMISSIONS,
  ROLES,
  ROLE_LEVEL,
  getPermissionsOfRole,
  roleHasAllPermissions,
  roleHasAnyPermission,
  roleIsAtLeast,
} from "../../src/core/constants/roles.js";

describe("RBAC - ma tran vai tro va quyen", () => {
  it("co dung 3 vai tro theo thiet ke", () => {
    expect(Object.values(ROLES)).toEqual(["member", "admin", "superAdmin"]);
  });

  it("cap bac tang dan: member < admin < superAdmin", () => {
    expect(ROLE_LEVEL[ROLES.MEMBER]).toBeLessThan(ROLE_LEVEL[ROLES.ADMIN]);
    expect(ROLE_LEVEL[ROLES.ADMIN]).toBeLessThan(ROLE_LEVEL[ROLES.SUPER_ADMIN]);
  });

  it("superAdmin co toan bo quyen", () => {
    const all = Object.values(PERMISSIONS);
    expect(getPermissionsOfRole(ROLES.SUPER_ADMIN)).toEqual(expect.arrayContaining(all));
  });

  it("quyen cua vai tro thap la tap con cua vai tro cao", () => {
    const member = getPermissionsOfRole(ROLES.MEMBER);
    const admin = getPermissionsOfRole(ROLES.ADMIN);
    expect(admin).toEqual(expect.arrayContaining([...member]));
  });

  it("member KHONG duoc tao/xoa san pham", () => {
    expect(roleHasAnyPermission(ROLES.MEMBER, [PERMISSIONS.PRODUCT_CREATE])).toBe(false);
    expect(roleHasAnyPermission(ROLES.MEMBER, [PERMISSIONS.PRODUCT_DELETE])).toBe(false);
  });

  it("chi superAdmin moi duoc doi vai tro nguoi khac", () => {
    expect(roleHasAnyPermission(ROLES.ADMIN, [PERMISSIONS.USER_MANAGE_ROLE])).toBe(false);
    expect(roleHasAnyPermission(ROLES.SUPER_ADMIN, [PERMISSIONS.USER_MANAGE_ROLE])).toBe(true);
  });

  it("roleHasAllPermissions doi hoi DU tat ca quyen", () => {
    expect(
      roleHasAllPermissions(ROLES.ADMIN, [PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_DELETE]),
    ).toBe(true);
    expect(
      roleHasAllPermissions(ROLES.ADMIN, [PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.USER_DELETE]),
    ).toBe(false);
  });

  it("danh sach quyen rong thi luon duoc phep", () => {
    expect(roleHasAnyPermission(ROLES.MEMBER, [])).toBe(true);
  });

  it("vai tro khong ton tai khong co quyen nao", () => {
    expect(getPermissionsOfRole("hacker")).toEqual([]);
    expect(roleHasAnyPermission("hacker", [PERMISSIONS.PRODUCT_READ])).toBe(false);
  });

  it("roleIsAtLeast so sanh dung theo cap bac", () => {
    expect(roleIsAtLeast(ROLES.ADMIN, ROLES.MEMBER)).toBe(true);
    expect(roleIsAtLeast(ROLES.ADMIN, ROLES.ADMIN)).toBe(true);
    expect(roleIsAtLeast(ROLES.ADMIN, ROLES.SUPER_ADMIN)).toBe(false);
    expect(roleIsAtLeast("khong-ton-tai", ROLES.MEMBER)).toBe(false);
  });
});
