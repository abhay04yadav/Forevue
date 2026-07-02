import { describe, expect, it } from "vitest";

import { APP_ROLES } from "@/auth/roles";
import { canAccessPath, getHomePath, resolvePostLoginPath } from "@/routes/paths";

describe("getHomePath", () => {
  it.each([
    ["admin", "/dashboard"],
    ["principal", "/dashboard"],
    ["registrar", "/dashboard"],
    ["iqac", "/dashboard"],
    ["faculty", "/home"],
    ["hod", "/department"],
    ["placement", "/placement"],
    ["student", "/my-day"],
  ] as const)("maps %s to %s", (role, path) => {
    expect(getHomePath(role)).toBe(path);
  });

  it("covers every app role", () => {
    for (const role of APP_ROLES) {
      expect(getHomePath(role)).toMatch(/^\//);
    }
  });
});

describe("canAccessPath", () => {
  it("allows students only on student routes", () => {
    expect(canAccessPath("student", "/my-day")).toBe(true);
    expect(canAccessPath("student", "/fees")).toBe(true);
    expect(canAccessPath("student", "/academics")).toBe(true);
    expect(canAccessPath("student", "/board")).toBe(false);
    expect(canAccessPath("student", "/dashboard")).toBe(false);
  });

  it("allows faculty on home but not leadership dashboard", () => {
    expect(canAccessPath("faculty", "/home")).toBe(true);
    expect(canAccessPath("faculty", "/teaching")).toBe(true);
    expect(canAccessPath("faculty", "/teaching/progress")).toBe(true);
    expect(canAccessPath("faculty", "/create/assessment")).toBe(true);
    expect(canAccessPath("faculty", "/board")).toBe(true);
    expect(canAccessPath("faculty", "/dashboard")).toBe(false);
    expect(canAccessPath("faculty", "/department")).toBe(false);
  });

  it("allows hod on department and reports", () => {
    expect(canAccessPath("hod", "/department")).toBe(true);
    expect(canAccessPath("hod", "/department/reports")).toBe(true);
    expect(canAccessPath("hod", "/board")).toBe(true);
    expect(canAccessPath("hod", "/placement")).toBe(false);
  });

  it("allows placement only on placement routes", () => {
    expect(canAccessPath("placement", "/placement")).toBe(true);
    expect(canAccessPath("placement", "/placement/drives")).toBe(true);
    expect(canAccessPath("placement", "/placement/readiness")).toBe(true);
    expect(canAccessPath("placement", "/board")).toBe(false);
  });

  it("allows admin on admin routes", () => {
    expect(canAccessPath("admin", "/admin/config")).toBe(true);
    expect(canAccessPath("faculty", "/admin/config")).toBe(false);
  });

  it("allows all authenticated roles on /ai", () => {
    expect(canAccessPath("student", "/ai")).toBe(true);
    expect(canAccessPath("faculty", "/ai")).toBe(true);
  });
});

describe("resolvePostLoginPath", () => {
  it("returns home when from path is not allowed", () => {
    expect(resolvePostLoginPath("student", "/board")).toBe("/my-day");
    expect(resolvePostLoginPath("faculty", "/dashboard")).toBe("/home");
    expect(resolvePostLoginPath("placement", "/board")).toBe("/placement");
  });

  it("preserves allowed deep links", () => {
    expect(resolvePostLoginPath("faculty", "/board")).toBe("/board");
    expect(resolvePostLoginPath("hod", "/board")).toBe("/board");
    expect(resolvePostLoginPath("student", "/fees")).toBe("/fees");
    expect(resolvePostLoginPath("admin", "/admin/config")).toBe("/admin/config");
  });
});
