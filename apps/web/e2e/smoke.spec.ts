import { test, expect } from "@playwright/test";

test("login page shows Forevue branding", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Forevue", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("unauthenticated visit redirects to login", async ({ page }) => {
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login/);
});
