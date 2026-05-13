import type { ScoreBreakdown as Breakdown } from '../types';

interface Props {
  breakdown: Breakdown;
}

export function ScoreBreakdown({ breakdown }: Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="py-2">Factor</th>
          <th className="py-2 text-right">Weight</th>
          <th className="py-2 text-right">Score</th>
          <th className="py-2 text-right">Contribution</th>
        </tr>
      </thead>
      <tbody>
        {breakdown.parts.map((p) => (
          <tr key={p.key} className="border-b last:border-0">
            <td className="py-2">
              <div className="font-medium">{p.label}</div>
              {p.detail && <div className="text-xs text-gray-500">{p.detail}</div>}
            </td>
            <td className="py-2 text-right text-gray-500">
              {(p.weight * 100).toFixed(0)}%
            </td>
            <td className="py-2 text-right">{p.sub}</td>
            <td className="py-2 text-right">{p.weighted.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
