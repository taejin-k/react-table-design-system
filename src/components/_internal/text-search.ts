const INITIALS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const VOWELS = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅗㅏ",
  "ㅗㅐ",
  "ㅗㅣ",
  "ㅛ",
  "ㅜ",
  "ㅜㅓ",
  "ㅜㅔ",
  "ㅜㅣ",
  "ㅠ",
  "ㅡ",
  "ㅡㅣ",
  "ㅣ",
];
const FINALS = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄱㅅ",
  "ㄴ",
  "ㄴㅈ",
  "ㄴㅎ",
  "ㄷ",
  "ㄹ",
  "ㄹㄱ",
  "ㄹㅁ",
  "ㄹㅂ",
  "ㄹㅅ",
  "ㄹㅌ",
  "ㄹㅍ",
  "ㄹㅎ",
  "ㅁ",
  "ㅂ",
  "ㅂㅅ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

function syllableIndex(character: string) {
  const index = character.charCodeAt(0) - 0xac00;
  return index >= 0 && index < 11172 ? index : -1;
}

function typingParts(index: number) {
  return (
    INITIALS[Math.floor(index / 588)] + VOWELS[Math.floor((index % 588) / 28)] + FINALS[index % 28]
  );
}

/** Substring search with consecutive initials and an unfinished final Hangul syllable. */
export function matchesTextSearch(text: string, query: string, composing = false): boolean {
  const normalizedText = text.toLocaleLowerCase().normalize("NFC");
  const normalizedQuery = query.trim().toLocaleLowerCase().normalize("NFC");
  if (normalizedText.includes(normalizedQuery)) return true;
  // Keep ordinary non-Hangul searches on the existing substring path.
  if (!/[ㄱ-ㅎ가-힣]/.test(normalizedQuery)) return false;

  const characters = Array.from(normalizedText);
  const queryCharacters = Array.from(normalizedQuery);
  for (let start = 0; start <= characters.length - queryCharacters.length; start++) {
    const matches = queryCharacters.every((character, offset) => {
      const candidate = characters[start + offset];
      if (character === candidate) return true;
      const candidateIndex = syllableIndex(candidate);
      if (candidateIndex < 0) return false;
      if (INITIALS.includes(character)) {
        return character === INITIALS[Math.floor(candidateIndex / 588)];
      }
      // Earlier syllables remain exact. Only an active IME composition may
      // temporarily attach the next syllable's initial to the final syllable.
      const queryIndex = syllableIndex(character);
      if (offset !== queryCharacters.length - 1 || queryIndex < 0) return false;
      const candidateParts = typingParts(candidateIndex);
      const queryParts = typingParts(queryIndex);
      if (candidateParts.startsWith(queryParts)) return true;
      if (!composing || queryIndex % 28 === 0) return false;
      const nextIndex = syllableIndex(characters[start + offset + 1] ?? "");
      return (
        nextIndex >= 0 && queryParts === candidateParts + INITIALS[Math.floor(nextIndex / 588)]
      );
    });
    if (matches) return true;
  }
  return false;
}
