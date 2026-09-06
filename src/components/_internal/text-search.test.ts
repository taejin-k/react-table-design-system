import { describe, expect, it } from "vitest";
import { matchesTextSearch } from "./text-search";

describe("default text search", () => {
  it.each([
    ["김민준", "김믽"],
    ["미나", "민"],
    ["이서연", "이성"],
    ["갈비", "갋"],
    ["관자", "괁"],
  ])("allows only active IME boundary carryover: %s / %s", (text, query) => {
    expect(matchesTextSearch(text, query, true)).toBe(true);
    expect(matchesTextSearch(text, query, false)).toBe(false);
  });

  it.each(["김믽수", "기믽", "김밎", "김믾", "김믽준"])(
    "does not broaden unrelated syllables while composing %s",
    (query) => {
      expect(matchesTextSearch("김민준", query, true)).toBe(false);
    },
  );
  it("requires a following syllable, not just a partially matching final consonant", () => {
    expect(matchesTextSearch("김민", "김믽", true)).toBe(false);
    expect(matchesTextSearch("김민 준", "김믽", true)).toBe(false);
  });
  it.each([
    "김",
    "민준",
    "김민준",
    "ㄱ",
    "ㄱㅁ",
    "ㄱㅁㅈ",
    "ㅁㅈ",
    "기",
    "김미",
    "김민주",
    "김ㅁ",
    "ㄱ민ㅈ",
    "  ㄱㅁ  ",
  ])("matches 김민준 with %s", (query) => {
    expect(matchesTextSearch("김민준", query)).toBe(true);
  });

  it.each([
    "박",
    "ㄴㅁ",
    "ㄱㅈ",
    "기민",
    "김미준",
    "김민준수",
    "긴",
    "끼",
    "ㅣ",
    "ㅁㄱ",
    "김 민",
    "ㄱㅁㅈㅎ",
  ])("does not match 김민준 with %s", (query) => {
    expect(matchesTextSearch("김민준", query)).toBe(false);
  });

  it.each([
    ["개발팀 김민준", "ㄱㅁㅈ", true],
    ["김 팀 민 준", "ㄱㅁㅈ", false],
    ["김민준 · Design42", "DESIGN4", true],
    ["김민준 · Design42", "dsgn", false],
    ["김민준 · Design42", "42", true],
    ["김민준 · Design42", "24", false],
    ["김민준 · Design42", "ㅈ · de", true],
    ["꽈배기", "ㄲㅂ", true],
    ["꽈배기", "ㄱㅂ", false],
    ["관악", "고", true],
    ["관악", "과", true],
    ["관악", "가", false],
    ["값", "갑", true],
    ["닭", "달", true],
    ["안녕", "아녀", false],
    ["[김민준]", "[ㄱㅁ", true],
    ["김민준", ".*", false],
    ["😀 김민준", "😀 ㄱㅁ", true],
    ["", "ㄱ", false],
    ["김민준", "  ", true],
    ["ㄱㅁ 메모", "ㄱㅁ", true],
    ["김민준".normalize("NFD"), "기", true],
    ["김민준", "김미".normalize("NFD"), true],
  ])("matches %s / %s = %s", (text, query, expected) => {
    expect(matchesTextSearch(text, query)).toBe(expected);
  });
});
