import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { clearDatabase, startTestDatabase, stopTestDatabase } from "../helpers/db.js";
import { API, createClient } from "../helpers/app.js";

describe("Health check va router goc", () => {
  let client;

  beforeAll(async () => {
    await startTestDatabase();
    client = createClient();
  });
  afterAll(async () => {
    await clearDatabase();
    await stopTestDatabase();
  });

  it("GET /health tra ve trang thai he thong", async () => {
    const response = await client.get(`${API}/health`).expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.database).toBe("connected");
  });

  it("GET / liet ke cac module dang co", async () => {
    const response = await client.get(`${API}/`).expect(200);
    const paths = response.body.data.modules.map((m) => m.basePath);
    expect(paths).toEqual(
      expect.arrayContaining([`${API}/auth`, `${API}/users`, `${API}/products`]),
    );
  });

  it("route khong ton tai -> 404 voi dinh dang loi chuan", async () => {
    const response = await client.get(`${API}/khong-ton-tai`).expect(404);
    expect(response.body).toMatchObject({ success: false, errorCode: "NOT_FOUND" });
  });

  it("gan header X-Request-Id cho moi response", async () => {
    const response = await client.get(`${API}/health`);
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("body JSON hong -> 400 thay vi 500", async () => {
    const response = await client
      .post(`${API}/auth/login`)
      .set("Content-Type", "application/json")
      .send("{ khong phai json }")
      .expect(400);
    expect(response.body.success).toBe(false);
  });
});
