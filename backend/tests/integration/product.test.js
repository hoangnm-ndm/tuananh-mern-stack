import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { clearDatabase, startTestDatabase, stopTestDatabase } from "../helpers/db.js";
import { API, auth, createClient, createUserAndLogin } from "../helpers/app.js";
import { ROLES } from "../../src/core/constants/roles.js";
import { Product } from "../../src/modules/product/product.model.js";

/** Tao san pham thang vao DB (dung .save() de hook sinh slug chay). */
async function seedProducts(items) {
  const created = [];
  for (const item of items) created.push(await new Product(item).save());
  return created;
}

describe("Module mau: San pham (CRUD + phan trang + tim kiem)", () => {
  let client;
  let admin;
  let member;

  beforeAll(async () => {
    await startTestDatabase();
    client = createClient();
  });
  afterEach(async () => clearDatabase());
  afterAll(async () => stopTestDatabase());

  beforeEach(async () => {
    admin = await createUserAndLogin(client, { role: ROLES.ADMIN });
    member = await createUserAndLogin(client, { role: ROLES.MEMBER });
  });

  describe("Tao san pham", () => {
    it("admin tao thanh cong, tu sinh slug va gan nguoi tao", async () => {
      const response = await client
        .post(`${API}/products`)
        .set(auth(admin.accessToken))
        .send({ title: "Áo thun cổ tròn", price: 199000, stock: 10 })
        .expect(201);

      expect(response.body.data.title).toBe("Áo thun cổ tròn");
      expect(response.body.data.slug).toMatch(/^ao-thun-co-tron-/);
      expect(String(response.body.data.createdBy)).toBe(String(admin.user.id));
    });

    it("member khong co quyen tao -> 403", async () => {
      await client
        .post(`${API}/products`)
        .set(auth(member.accessToken))
        .send({ title: "Ao", price: 1000 })
        .expect(403);
    });

    it("du lieu sai -> 422 kem chi tiet tung truong", async () => {
      const response = await client
        .post(`${API}/products`)
        .set(auth(admin.accessToken))
        .send({ title: "A", price: -5 })
        .expect(422);

      const fields = response.body.details.map((d) => d.field);
      expect(fields).toContain("body.title");
      expect(fields).toContain("body.price");
    });

    it("gia dang chuoi duoc ep sang so", async () => {
      const response = await client
        .post(`${API}/products`)
        .set(auth(admin.accessToken))
        .send({ title: "San pham", price: "250000" })
        .expect(201);
      expect(response.body.data.price).toBe(250000);
    });
  });

  describe("Danh sach - phan trang, sap xep, tim kiem, loc", () => {
    beforeEach(async () => {
      await seedProducts([
        { title: "Ao thun trang", price: 100, isActive: true },
        { title: "Ao so mi", price: 300, isActive: true },
        { title: "Quan jeans", price: 500, isActive: true },
        { title: "Giay the thao", price: 700, isActive: false },
        { title: "Balo du lich", price: 900, isActive: true },
      ]);
    });

    it("tra ve meta phan trang day du", async () => {
      const response = await client
        .get(`${API}/products?page=1&limit=2`)
        .set(auth(member.accessToken))
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.pagination).toMatchObject({
        total: 5,
        page: 1,
        limit: 2,
        totalPages: 3,
        hasPrevPage: false,
        hasNextPage: true,
      });
    });

    it("trang cuoi bao dung hasNextPage=false", async () => {
      const response = await client
        .get(`${API}/products?page=3&limit=2`)
        .set(auth(member.accessToken))
        .expect(200);
      expect(response.body.meta.pagination).toMatchObject({
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it("sap xep tang dan theo gia", async () => {
      const response = await client
        .get(`${API}/products?sort=price`)
        .set(auth(member.accessToken))
        .expect(200);
      const prices = response.body.data.map((p) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it("sap xep giam dan theo gia", async () => {
      const response = await client
        .get(`${API}/products?sort=-price`)
        .set(auth(member.accessToken))
        .expect(200);
      expect(response.body.data[0].price).toBe(900);
    });

    it("tim kiem khong phan biet hoa thuong, khop theo chuoi con", async () => {
      const response = await client
        .get(`${API}/products?search=AO`)
        .set(auth(member.accessToken))
        .expect(200);

      // "ao" khop ca "Ao thun trang", "Ao so mi" va "Giay the thao" (chuoi con)
      const titles = response.body.data.map((p) => p.title).sort();
      expect(titles).toEqual(["Ao so mi", "Ao thun trang", "Giay the thao"]);
    });

    it("tim kiem khong khop tra ve danh sach rong", async () => {
      const response = await client
        .get(`${API}/products?search=khongtontai`)
        .set(auth(member.accessToken))
        .expect(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.pagination.total).toBe(0);
    });

    it("loc theo khoang gia", async () => {
      const response = await client
        .get(`${API}/products?price_gte=300&price_lte=700`)
        .set(auth(member.accessToken))
        .expect(200);
      expect(response.body.data.map((p) => p.price).sort((a, b) => a - b)).toEqual([300, 500, 700]);
    });

    it("bo qua tham so loc khong nam trong danh sach cho phep", async () => {
      const response = await client
        .get(`${API}/products?title=Ao thun trang`)
        .set(auth(member.accessToken))
        .expect(200);
      // `title` khong nam trong filterableFields -> khong loc, van tra ve du 5
      expect(response.body.meta.pagination.total).toBe(5);
    });

    it("limit vuot tran bi tu choi o tang validate", async () => {
      await client.get(`${API}/products?limit=1000`).set(auth(member.accessToken)).expect(422);
    });

    it("endpoint /public khong can dang nhap va chi tra san pham dang ban", async () => {
      const response = await client.get(`${API}/products/public`).expect(200);
      expect(response.body.meta.pagination.total).toBe(4);
      expect(response.body.data.every((p) => p.isActive)).toBe(true);
    });
  });

  describe("Chi tiet / cap nhat / xoa", () => {
    let product;

    beforeEach(async () => {
      [product] = await seedProducts([{ title: "San pham mau", price: 1000 }]);
    });

    it("lay chi tiet theo id", async () => {
      const response = await client
        .get(`${API}/products/${product.id}`)
        .set(auth(member.accessToken))
        .expect(200);
      expect(response.body.data.title).toBe("San pham mau");
    });

    it("lay chi tiet theo slug (cong khai)", async () => {
      const response = await client.get(`${API}/products/slug/${product.slug}`).expect(200);
      expect(response.body.data.id).toBe(product.id);
    });

    it("id khong ton tai -> 404", async () => {
      await client
        .get(`${API}/products/507f1f77bcf86cd799439011`)
        .set(auth(member.accessToken))
        .expect(404);
    });

    it("id sai dinh dang -> 422 (chan tu tang validate)", async () => {
      await client.get(`${API}/products/khong-phai-id`).set(auth(member.accessToken)).expect(422);
    });

    it("admin cap nhat thanh cong", async () => {
      const response = await client
        .patch(`${API}/products/${product.id}`)
        .set(auth(admin.accessToken))
        .send({ price: 2000 })
        .expect(200);
      expect(response.body.data.price).toBe(2000);
      expect(response.body.data.title).toBe("San pham mau");
    });

    it("cap nhat rong -> 422", async () => {
      await client
        .patch(`${API}/products/${product.id}`)
        .set(auth(admin.accessToken))
        .send({})
        .expect(422);
    });

    it("member khong duoc cap nhat hoac xoa", async () => {
      await client
        .patch(`${API}/products/${product.id}`)
        .set(auth(member.accessToken))
        .send({ price: 1 })
        .expect(403);
      await client
        .delete(`${API}/products/${product.id}`)
        .set(auth(member.accessToken))
        .expect(403);
    });

    it("admin xoa thanh cong, lay lai -> 404", async () => {
      await client.delete(`${API}/products/${product.id}`).set(auth(admin.accessToken)).expect(200);
      await client.get(`${API}/products/${product.id}`).set(auth(member.accessToken)).expect(404);
    });

    it("xoa ban ghi khong ton tai -> 404", async () => {
      await client
        .delete(`${API}/products/507f1f77bcf86cd799439011`)
        .set(auth(admin.accessToken))
        .expect(404);
    });
  });

  describe("Dinh dang response thong nhat", () => {
    it("moi response thanh cong deu co success/message/data", async () => {
      const response = await client
        .post(`${API}/products`)
        .set(auth(admin.accessToken))
        .send({ title: "Kiem tra dinh dang", price: 1 })
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
    });

    it("model tra ve `id` thay vi `_id`, khong co `__v`", async () => {
      const response = await client
        .post(`${API}/products`)
        .set(auth(admin.accessToken))
        .send({ title: "Kiem tra id", price: 1 })
        .expect(201);

      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).not.toHaveProperty("_id");
      expect(response.body.data).not.toHaveProperty("__v");
    });
  });
});
