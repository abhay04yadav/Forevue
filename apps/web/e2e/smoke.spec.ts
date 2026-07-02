import { test, expect } from "@playwright/test";

const DEMO_PASSWORD = "Demo@12345";
const TENANT_SLUG = "demo-eng";

async function signIn(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.goto("/login");
  await page.getByLabel("College").fill(TENANT_SLUG);
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("login page shows Forevue branding", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Forevue", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("unauthenticated visit redirects to login", async ({ page }) => {
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login/);
});

test("faculty login loads my teaching home", async ({ page }) => {
  await signIn(page, "meera.iyer@demo-eng.edu");
  await expect(page).toHaveURL(/\/home/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("Classes today")).toBeVisible({ timeout: 15_000 });
});

test("faculty navigates to risk board from nav", async ({ page }) => {
  await signIn(page, "meera.iyer@demo-eng.edu");
  await expect(page).toHaveURL(/\/home/, { timeout: 15_000 });
  await page.getByRole("link", { name: "Students" }).click();
  await expect(page).toHaveURL(/\/board/);
  await expect(page.getByRole("heading", { name: "At-risk students" })).toBeVisible({
    timeout: 15_000,
  });
});

test("principal login loads institution dashboard", async ({ page }) => {
  await signIn(page, "principal@demo-eng.edu");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Institution overview" })).toBeVisible({
    timeout: 15_000,
  });
});

test("admin login loads dashboard and admin nav", async ({ page }) => {
  await signIn(page, "admin@demo-eng.edu");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole("link", { name: "Risk config" })).toBeVisible({ timeout: 15_000 });
});

test("registrar login loads institution dashboard", async ({ page }) => {
  await signIn(page, "registrar@demo-eng.edu");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Institution overview" })).toBeVisible({
    timeout: 15_000,
  });
});

test("iqac login loads institution dashboard", async ({ page }) => {
  await signIn(page, "iqac@demo-eng.edu");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Institution overview" })).toBeVisible({
    timeout: 15_000,
  });
});

test("hod login loads department dashboard", async ({ page }) => {
  await signIn(page, "hod.cse@demo-eng.edu");
  await expect(page).toHaveURL(/\/department/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /CSE overview/i })).toBeVisible({
    timeout: 15_000,
  });
});

test("placement login loads placement dashboard with drives", async ({ page }) => {
  await signIn(page, "placement@demo-eng.edu");
  await expect(page).toHaveURL(/\/placement/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Placement dashboard" })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("link", { name: "Drives" }).click();
  await expect(page).toHaveURL(/\/placement\/drives/);
});

test("student login loads brief and navigates RSDD routes", async ({ page }) => {
  await signIn(page, "aarav.sharma@demo-eng.edu");
  await expect(page).toHaveURL(/\/my-day/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("link", { name: "Academics" }).click();
  await expect(page).toHaveURL(/\/academics/);
  await expect(page.getByRole("heading", { name: "Academics" })).toBeVisible();

  await page.getByRole("link", { name: "Timetable" }).click();
  await expect(page).toHaveURL(/\/timetable/);
  await expect(page.getByRole("heading", { name: "Timetable" })).toBeVisible();

  await page.getByRole("link", { name: "Fees" }).click();
  await expect(page).toHaveURL(/\/fees/);
  await expect(page.getByRole("heading", { name: "Fees" })).toBeVisible();

  await page.getByRole("link", { name: "Career" }).click();
  await expect(page).toHaveURL(/\/career/);

  await page.getByRole("link", { name: "Ask" }).click();
  await expect(page).toHaveURL(/\/ai/);
});

test("student deep link to board redirects to my day after login", async ({ page }) => {
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("College").fill(TENANT_SLUG);
  await page.getByLabel("Work email").fill("aarav.sharma@demo-eng.edu");
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/my-day/, { timeout: 15_000 });
});

test("faculty cannot access admin config", async ({ page }) => {
  await signIn(page, "meera.iyer@demo-eng.edu");
  await page.goto("/admin/config");
  await expect(page).toHaveURL(/\/home/, { timeout: 15_000 });
});
