import { test, expect } from "@playwright/test";

test("app shell renders Forevue branding", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Forevue", { exact: true }).first()).toBeVisible();
});

test("theme toggle is available", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Switch to/i })).toBeVisible();
});
