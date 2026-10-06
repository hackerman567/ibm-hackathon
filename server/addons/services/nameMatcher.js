// Fuzzy & Phonetic Name Matcher (Levenshtein + Phonetic Key matching)

function levenshteinDistance(a, b) {
  const matrix = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenB; i++) matrix[i] = [i];
  for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[lenB][lenA];
}

// Simple double-metaphone inspired phonetic encoder
export function getPhoneticKey(str) {
  if (!str) return '';
  let s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';

  // Phonetic substitutions
  s = s.replace(/PH/g, 'F');
  s = s.replace(/V/g, 'F');
  s = s.replace(/CK/g, 'K');
  s = s.replace(/C([EIY])/g, 'S$1');
  s = s.replace(/C/g, 'K');
  s = s.replace(/QU/g, 'K');
  s = s.replace(/DG/g, 'J');
  s = s.replace(/TH/g, '0');
  s = s.replace(/SH/g, 'X');
  s = s.replace(/ZH/g, 'X');
  s = s.replace(/WR/g, 'R');
  s = s.replace(/KN/g, 'N');
  s = s.replace(/GH/g, '');

  // Keep first char, remove subsequent vowels
  const first = s.charAt(0);
  const rest = s.slice(1).replace(/[AEIOUWY]/g, '');
  return (first + rest).slice(0, 4);
}

const lastCalledCache = new Map(); // studentId -> timestamp

export function checkStudentNameCalled(text, student, cooldownMs = 20000) {
  if (!text || !student) return null;

  const namesToTest = [student.name, ...(student.aliases || [])].filter(Boolean);
  if (namesToTest.length === 0) return null;

  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
  const now = Date.now();

  for (const name of namesToTest) {
    const cleanName = name.toLowerCase().trim();
    if (!cleanName || cleanName.length < 2) continue;

    const nameParts = cleanName.split(/\s+/);
    const primaryName = nameParts[0]; // test first name / nickname
    const targetPhonetic = getPhoneticKey(primaryName);

    for (const word of words) {
      if (word.length < 2) continue;

      let isMatch = false;
      let matchType = '';

      // 1. Exact match
      if (word === primaryName || word === cleanName) {
        isMatch = true;
        matchType = 'exact';
      } 
      // 2. Levenshtein edit distance <= 1 for short names, <= 2 for longer names
      else if (primaryName.length >= 3) {
        const maxDist = primaryName.length <= 4 ? 1 : 2;
        const dist = levenshteinDistance(word, primaryName);
        if (dist <= maxDist) {
          isMatch = true;
          matchType = 'fuzzy_levenshtein';
        }
      }

      // 3. Phonetic match
      if (!isMatch && primaryName.length >= 3) {
        const wordPhonetic = getPhoneticKey(word);
        if (wordPhonetic && wordPhonetic === targetPhonetic) {
          isMatch = true;
          matchType = 'phonetic';
        }
      }

      if (isMatch) {
        // Enforce 20-second cooldown per student
        const lastFired = lastCalledCache.get(student.id) || 0;
        if (now - lastFired >= cooldownMs) {
          lastCalledCache.set(student.id, now);
          return {
            studentId: student.id,
            studentName: student.name,
            matchedWord: word,
            matchedAlias: name,
            matchType,
            timestamp: new Date().toISOString()
          };
        }
      }
    }
  }

  return null;
}
