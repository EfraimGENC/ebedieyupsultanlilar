import { describe, it, expect } from "vitest";
import {
  normalizeText,
  turkishIncludes,
  turkishIncludesInArray,
} from "./normalizeText";

describe("normalizeText", () => {
  it("should normalize Turkish characters correctly", () => {
    expect(normalizeText("Abdullah Kırîmî")).toBe("abdullah kirimi");
    expect(normalizeText("Kırîmî")).toBe("kirimi");
    expect(normalizeText("KIRİMİ")).toBe("kirimi");
    expect(normalizeText("Abdullah Kırimi")).toBe("abdullah kirimi");
    expect(normalizeText("Kırimi")).toBe("kirimi");
  });

  it("should handle dotted and dotless I", () => {
    expect(normalizeText("İstanbul")).toBe("istanbul");
    expect(normalizeText("ISTANBUL")).toBe("istanbul");
    expect(normalizeText("Işık")).toBe("isik");
  });

  it("should remove accents from all characters", () => {
    expect(normalizeText("Çelebi")).toBe("celebi");
    expect(normalizeText("ÇELEBİ")).toBe("celebi");
    expect(normalizeText("Âlî")).toBe("ali");
    expect(normalizeText("Hüseyin")).toBe("huseyin");
  });

  it("should handle empty/null/undefined values", () => {
    expect(normalizeText("")).toBe("");
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
  });
});

describe("turkishIncludes", () => {
  it("should find matches with different Turkish character variations", () => {
    expect(turkishIncludes("Abdullah Kırîmî", "Kırimi")).toBe(true);
    expect(turkishIncludes("Abdullah Kırîmî", "KIRİMİ")).toBe(true);
    expect(turkishIncludes("Abdullah Kırîmî", "kirimi")).toBe(true);
    expect(turkishIncludes("Abdullah Kırîmî", "abdullah")).toBe(true);
  });

  it("should find matches with Çelebi variations", () => {
    expect(turkishIncludes("Abdülcelil Levnî Çelebi", "ÇELEBİ")).toBe(true);
    expect(turkishIncludes("Abdülcelil Levnî Çelebi", "celebi")).toBe(true);
    expect(turkishIncludes("Abdülcelil Levnî Çelebi", "Çelebi")).toBe(true);
  });

  it("should handle empty/null/undefined values", () => {
    expect(turkishIncludes("test", null)).toBe(false);
    expect(turkishIncludes(null, "test")).toBe(false);
    expect(turkishIncludes("", "test")).toBe(false);
  });
});

describe("turkishIncludesInArray", () => {
  it("should find matches in array with Turkish character variations", () => {
    const tags = ["Şair", "Müzisyen", "Çelebi"];
    expect(turkishIncludesInArray(tags, "ÇELEBİ")).toBe(true);
    expect(turkishIncludesInArray(tags, "sair")).toBe(true);
    expect(turkishIncludesInArray(tags, "MÜZISYEN")).toBe(true);
  });

  it("should handle empty/null/undefined values", () => {
    expect(turkishIncludesInArray(["test"], null)).toBe(false);
    expect(turkishIncludesInArray(null, "test")).toBe(false);
    expect(turkishIncludesInArray([], "test")).toBe(false);
  });
});
