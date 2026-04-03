import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SentenceItem, VowelProgress } from './supabase';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function generateStory(
  topic: string,
  topicHebrew: string,
  activeVowels: VowelProgress[],
  knownWords: string[] = []
): Promise<SentenceItem[]> {
  const vowelList = activeVowels
    .map(v => `${v.vowel_name} (${v.vowel_symbol})`)
    .join(', ');

  const knownWordsText = knownWords.length > 0
    ? `מילים שהילדה כבר מכירה (השתמש בהן): ${knownWords.slice(0, 20).join(', ')}.`
    : '';

  const prompt = `אתה מומחה בחינוך מיוחד ולימוד קריאה עברית לילדים עם אוטיזם.
צור סיפור קצר על הנושא: ${topicHebrew} (${topic}).

תנועות פעילות: ${vowelList}.
${knownWordsText}

הנחיות:
1. 5-7 משפטים בשיטת הפירמידה — כל משפט = המשפט הקודם + מילה חדשה אחת בדיוק
2. כל הטקסט מנוקד במלואו
3. מילים קונקרטיות שקל לצייר
4. מתאים לילדה בת 10, לא ברמת תינוק
5. כל מילה חדשה מכילה רק את התנועות הפעילות

החזר JSON בלבד, ללא הסברים, ללא markdown, רק מערך:
[
  { "sentence": "...", "new_word": "...", "image_description": "..." },
  ...
]

sentence - המשפט המלא מנוקד
new_word - המילה החדשה שנוספה (מנוקדת)
image_description - תיאור קצר באנגלית לאיור`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');

      const parsed: SentenceItem[] = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length < 3) throw new Error('Invalid story format');

      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }

  throw lastError ?? new Error('Failed to generate story after 3 attempts');
}
