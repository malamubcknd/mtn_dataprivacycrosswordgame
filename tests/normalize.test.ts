import { describe, it, expect } from "vitest";
import { normalizeAnswer, normalizeEmployeeId, validateName, maskEmployeeId } from "../src/lib/normalize";

describe("normalize", () => {
  it("normalizes answers", () => {
    expect(normalizeAnswer("DATA BREACH")).toBe("DATABREACH");
    expect(normalizeAnswer("two-factor")).toBe("TWOFACTOR");
    expect(normalizeAnswer(" access control ")).toBe("ACCESSCONTROL");
  });
  it("normalizes employee ids", () => {
    expect(normalizeEmployeeId("  mtn-123 ")).toBe("MTN-123");
    expect(normalizeEmployeeId("abc123")).toBe("ABC123");
  });
  it("validates name", () => {
    expect(validateName("A")).toBeTruthy();
    expect(validateName("Jane Doe")).toBeNull();
    expect(validateName("O'Connor")).toBeNull();
  });
  it("masks employee id", () => {
    expect(maskEmployeeId("12345678")).toBe("****5678");
    expect(maskEmployeeId("12")).toBe("****");
  });
});