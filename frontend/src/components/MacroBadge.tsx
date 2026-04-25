import type { Macros } from '../types.ts';

interface Props {
  macros: Macros;
  size?: 'sm' | 'md';
}

export default function MacroBadge({ macros, size = 'md' }: Props) {
  const items = [
    { label: 'Protein', value: macros.protein, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { label: 'Carbs', value: macros.carbs, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Fat', value: macros.fat, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { label: 'kcal', value: macros.calories, color: 'text-gray-400 bg-gray-700/50 border-gray-600/20' },
  ];

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {items.map(({ label, value, color }) => (
          <span key={label} className={`badge border ${color} ${label === 'Protein' ? 'font-bold' : ''}`}>
            <span className="font-semibold">{value}g</span>
            <span className="opacity-70">{label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(({ label, value, color }) => (
        <div key={label} className={`rounded-xl p-3 border ${color} text-center`}>
          <div className={`text-xl font-bold ${color.split(' ')[0]}`}>{value}{label !== 'kcal' ? 'g' : ''}</div>
          <div className="text-xs opacity-70 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}
