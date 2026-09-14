import { describe, expect, it } from "vitest";
import {
  MAX_LIMIT,
  buildFilter,
  buildPagination,
  buildSearch,
  buildSort,
  escapeRegex,
  parseQueryFeatures,
} from "../../src/core/utils/queryFeatures.js";

describe("buildPagination", () => {
  it("dung gia tri mac dinh khi khong truyen gi", () => {
    expect(buildPagination()).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("tinh skip dung", () => {
    expect(buildPagination({ page: "3", limit: "20" })).toEqual({ page: 3, limit: 20, skip: 40 });
  });

  it("chan limit o MAX_LIMIT de tranh truy van qua nang", () => {
    expect(buildPagination({ limit: "9999" }).limit).toBe(MAX_LIMIT);
  });

  it("ep gia tri am/khong hop le ve muc an toan", () => {
    expect(buildPagination({ page: "-5", limit: "0" })).toEqual({ page: 1, limit: 10, skip: 0 });
    expect(buildPagination({ page: "abc" }).page).toBe(1);
  });
});

describe("buildSort", () => {
  it("dau tru nghia la giam dan", () => {
    expect(buildSort("-price,title")).toEqual({ price: -1, title: 1 });
  });

  it("tra ve sort mac dinh khi khong co tham so", () => {
    expect(buildSort(undefined)).toEqual({ createdAt: -1 });
    expect(buildSort("", { defaultSort: { name: 1 } })).toEqual({ name: 1 });
  });

  it("bo qua field khong nam trong danh sach cho phep", () => {
    expect(buildSort("password,-price", { allowedFields: ["price"] })).toEqual({ price: -1 });
  });

  it("tra ve mac dinh khi moi field deu bi loai", () => {
    expect(buildSort("password", { allowedFields: ["price"] })).toEqual({ createdAt: -1 });
  });
});

describe("buildFilter", () => {
  const allowedFields = ["price", "isActive", "stock"];

  it("chi nhan field duoc phep", () => {
    expect(buildFilter({ price: "100", role: "admin" }, { allowedFields })).toEqual({ price: 100 });
  });

  it("ep kieu so va boolean", () => {
    expect(buildFilter({ price: "100", isActive: "true" }, { allowedFields })).toEqual({
      price: 100,
      isActive: true,
    });
  });

  it("ho tro toan tu so sanh", () => {
    expect(buildFilter({ price_gte: "100", price_lte: "500" }, { allowedFields })).toEqual({
      price: { $gte: 100, $lte: 500 },
    });
  });

  it("ho tro toan tu $in voi danh sach phan cach bang dau phay", () => {
    expect(buildFilter({ stock_in: "1,2,3" }, { allowedFields })).toEqual({
      stock: { $in: [1, 2, 3] },
    });
  });

  it("bo qua gia tri rong", () => {
    expect(buildFilter({ price: "" }, { allowedFields })).toEqual({});
  });
});

describe("buildSearch", () => {
  it("tao dieu kien $or tren cac field cho phep", () => {
    const result = buildSearch("ao", ["title", "description"]);
    expect(result.$or).toHaveLength(2);
    expect(result.$or[0].title).toBeInstanceOf(RegExp);
    expect(result.$or[0].title.flags).toContain("i");
  });

  it("tra ve null khi thieu tu khoa hoac thieu field", () => {
    expect(buildSearch("", ["title"])).toBeNull();
    expect(buildSearch("ao", [])).toBeNull();
  });

  it("thoat ky tu dac biet de khong pha vo regex", () => {
    expect(escapeRegex("a.b*c")).toBe("a\\.b\\*c");
    expect(() => buildSearch("(((", ["title"])).not.toThrow();
  });
});

describe("parseQueryFeatures", () => {
  it("gop day du pagination + sort + filter + search", () => {
    const result = parseQueryFeatures(
      { page: "2", limit: "5", sort: "-price", search: "ao", isActive: "true", role: "admin" },
      { searchableFields: ["title"], filterableFields: ["isActive"], sortableFields: ["price"] },
    );

    expect(result.page).toBe(2);
    expect(result.skip).toBe(5);
    expect(result.sort).toEqual({ price: -1 });
    expect(result.filter.isActive).toBe(true);
    expect(result.filter.role).toBeUndefined();
    expect(result.filter.$or).toHaveLength(1);
  });

  it("chap nhan ca `q` thay cho `search`", () => {
    const result = parseQueryFeatures({ q: "ao" }, { searchableFields: ["title"] });
    expect(result.filter.$or).toBeDefined();
  });
});
