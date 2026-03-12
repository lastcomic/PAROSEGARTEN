import { cn } from '@/lib/utils';

export default function DataTable({ columns, data, onRowClick, className }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gb-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2.5 text-left text-[11px] font-mono font-medium text-gb-muted uppercase tracking-wider"
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              className={cn(
                'border-b border-gb-border/50 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-gb-panel/50',
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2.5 text-gb-text">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-gb-muted text-sm">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
