import request from "supertest";
import app from "../index.js"; // assuming your Express app is exported from index.js

import { it, expect } from "vitest";

it("GET /health should return 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
});
