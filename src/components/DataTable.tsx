import type { ReactNode } from "react";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

export interface Column<T> {
  key: string;
  header: string;
  /** Renders the value in a small monospace style (order numbers, SKUs). */
  ticket?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyLabel?: string;
}

export default function DataTable<T>({ columns, data, keyField, emptyLabel = "No records yet." }: DataTableProps<T>) {
  return (
    <div
      style={{ border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.card }}
      className="rounded-xl overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead style={{ backgroundColor: COLORS.background, borderBottom: `1px solid ${COLORS.border}` }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={{ fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, textAlign: col.align ?? "left" }}
                  className="px-5 py-3 text-xs font-medium whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ color: COLORS.textMuted, fontFamily: FONTS.body }}
                  className="px-5 py-12 text-center text-sm"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={String(row[keyField])}
                  style={{ borderBottom: `1px solid ${COLORS.cardWarm}` }}
                  className="last:border-b-0 transition-colors hover:bg-[rgba(237,232,226,0.45)]"
                >
                  {columns.map((col) => {
                    const value = col.render
                      ? col.render(row)
                      : ((row as unknown as Record<string, unknown>)[col.key] as ReactNode);
                    return (
                      <td
                        key={col.key}
                        style={{
                          textAlign: col.align ?? "left",
                          fontFamily: col.ticket ? FONTS.mono : FONTS.body,
                          fontSize: col.ticket ? 12 : undefined,
                          color: col.ticket ? COLORS.textSecondary : COLORS.text,
                        }}
                        className="px-5 py-3.5"
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
