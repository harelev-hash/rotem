import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SentenceItem, StoryQuestion, VowelProgress } from './supabase';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface StoryResult {
  sentences: SentenceItem[];
  questions: StoryQuestion[];
}

export async function generateStory(
  topic: string,
  topicHebrew: string,
  activeVowels: VowelProgress[],
  knownWords: string[] = []
): Promise<StoryResult> {
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

הנחיות לסיפור:
1. 5-7 משפטים בשיטת הפירמידה — כל משפט = המשפט הקודם + מילה חדשה אחת בדיוק
2. כל הטקסט מנוקד במלואו
3. מילים קונקרטיות שקל לצייר
4. מתאים לילדה בת 10, לא ברמת תינוק
5. כל מילה חדשה מכילה בפועל רק את התנועות הפעילות — בדוק כל מילה לפני שתבחר אותה
6. ניקוד מדויק לחלוטין: ניקד כל מילה לפי ההגייה האמיתית שלה בעברית. אסור לשנות ניקוד של מילה כדי "להכניס" אותה לתנועות פעילות — אם המילה מכילה תנועה לא פעילה, בחר מילה אחרת. לדוגמה: "מַהֵר" מנוקדת עם צירה באות ה׳ (הֵ), לא פתח (הַ).

הנחיות לשאלות:
שאלה 1 — הבנת הנקרא: שאלת רב ברירה קצרה ופשוטה על תוכן הסיפור, עם 3 אפשרויות. הצב את התשובה הנכונה במקום אקראי (לא תמיד ראשון).
שאלה 2 — אות ראשונה: בחר מילה אחת מהסיפור (עם ניקוד), ושאל מה האות הראשונה שלה. "answer" = האות הראשונה בלבד, ללא ניקוד.

החזר JSON בלבד, ללא הסברים, ללא markdown, רק אובייקט:
{
  "sentences": [
    { "sentence": "...", "new_word": "...", "image_description": "..." },
    ...
  ],
  "questions": [
    {
      "type": "comprehension",
      "question": "שאלת הבנה קצרה בעברית",
      "options": ["אפשרות א", "אפשרות ב", "אפשרות ג"],
      "correct": 1
    },
    {
      "type": "first_letter",
      "word": "מִלָּה",
      "answer": "מ"
    }
  ]
}

sentence - המשפט המלא מנוקד
new_word - המילה החדשה שנוספה (מנוקדת)
image_description - תיאור קצר באנגלית לאיור`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
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

      // Try parsing as object first, fall back to legacy array format
      const jsonMatch = text.match(/\{[\s\S]*\}/) ?? text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);

      // Handle both new object format and legacy array format
      if (Array.isArray(parsed)) {
        // Legacy: just sentences, no questions
        if (parsed.length < 3) throw new Error('Invalid story format');
        return { sentences: parsed as SentenceItem[], questions: [] };
      }

      const sentences: SentenceItem[] = parsed.sentences;
      const questions: StoryQuestion[] = parsed.questions ?? [];

      if (!Array.isArray(sentences) || sentences.length < 3) throw new Error('Invalid story format');

      return { sentences, questions };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }

  throw lastError ?? new Error('Failed to generate story after 3 attempts');
}
