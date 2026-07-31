import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="glass-panel overflow-x-auto p-0">
      <table className="w-full min-w-max text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
        {columns.map((col) => (
          <th key={col} className="px-4 py-3 font-medium">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-white/5">{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="text-slate-200 hover:bg-white/[0.03]">{children}</tr>;
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-4 py-10 text-center text-sm text-slate-500">{message}</p>;
}
