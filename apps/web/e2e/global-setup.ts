import { request } from "@playwright/test";

const API_BASE_URL = process.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default async function globalSetup() {
  const ctx = await request.newContext();
  try {
    const res = await ctx.get(`${API_BASE_URL}/health`, { timeout: 5_000 });
    if (!res.ok()) {
      throw new Error(
        `Forevue API at ${API_BASE_URL} returned ${res.status()}. ` +
          "Start it before auth E2E tests: cd apps/api && uvicorn app.main:app --reload --port 8000",
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forevue API")) {
      throw error;
    }
    throw new Error(
      `Forevue API not reachable at ${API_BASE_URL}. ` +
        "Start it before auth E2E tests: cd apps/api && uvicorn app.main:app --reload --port 8000",
    );
  } finally {
    await ctx.dispose();
  }
}
