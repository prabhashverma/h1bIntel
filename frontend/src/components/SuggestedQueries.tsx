const suggestions = [
  'Top 10 H-1B sponsors in California',
  'Companies sponsoring software engineers with salary > $200K',
  'How many green card filings were denied in FY2024?',
  'Compare Google vs Meta H-1B filings by year',
  'Which cities have the most H-1B positions?',
  'Average salary for data scientists by state',
];

export function SuggestedQueries({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="text-4xl opacity-50">💬</div>
      <h2 className="text-lg font-semibold text-gray-700">Ask about immigration sponsorship data</h2>
      <p className="text-sm text-gray-400">Search 3M+ Green Card & H-1B filings with natural language</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-xl mt-2">
        {suggestions.map(q => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
