interface SentenceDisplayProps {
  sentence: string;
  newWord: string;
}

export default function SentenceDisplay({ sentence, newWord }: SentenceDisplayProps) {
  // Split sentence into parts and highlight the new word
  const parts = sentence.split(newWord);

  return (
    <p
      className="hebrew-text text-4xl md:text-5xl font-bold text-slate-800 text-center leading-loose px-4"
      dir="rtl"
    >
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="bg-amber-200 text-amber-900 rounded-lg px-1 mx-0.5 not-italic">
              {newWord}
            </mark>
          )}
        </span>
      ))}
    </p>
  );
}
