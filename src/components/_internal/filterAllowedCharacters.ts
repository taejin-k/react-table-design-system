export type AllowedCharacterType = "korean" | "english" | "number";

const disallowedCharacterPatterns: Record<AllowedCharacterType, RegExp> = {
  korean: /[^ㄱ-ㅎㅏ-ㅣ가-힣]/g,
  english: /[^A-Za-z]/g,
  number: /[^0-9]/g,
};

export function filterAllowedCharacters(value: string, allowOnly?: AllowedCharacterType): string {
  return allowOnly ? value.replace(disallowedCharacterPatterns[allowOnly], "") : value;
}
