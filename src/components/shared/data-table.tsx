import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

export interface Column<T> {
  id: string;
  header: React.ReactNode;
  accessor?: ((item: T) => React.ReactNode) | undefined;
  cell?: ((item: T) => React.ReactNode) | undefined;
  className?: string | undefined;
  headerClassName?: string | undefined;
  sortable?: boolean | undefined;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode | undefined;
  isLoading?: boolean | undefined;
  className?: string | undefined;
  caption?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  onSort?: ((columnId: string) => void) | undefined;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  isLoading = false,
  className,
  caption,
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={caption ?? "Data table"}
      className={cn(
        "relative w-full overflow-x-auto rounded-2xl border border-border bg-card shadow-xs focus:outline-hidden focus:ring-1 focus:ring-brand",
        className,
      )}
    >
      <table className="w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            {columns.map((col) => {
              const isSorted = sortBy === col.id;
              return (
                <th
                  key={col.id}
                  scope="col"
                  className={cn("px-4 py-3.5 font-medium whitespace-nowrap", col.headerClassName)}
                >
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.id)}
                      className="inline-flex items-center gap-1.5 font-medium hover:text-foreground focus:outline-hidden"
                    >
                      <span>{col.header}</span>
                      {isSorted ? (
                        sortOrder === "asc" ? (
                          <ChevronUp className="size-3.5 text-brand" />
                        ) : (
                          <ChevronDown className="size-3.5 text-brand" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                {emptyState ?? <p className="text-sm text-muted-foreground">No records found.</p>}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn("px-4 py-3.5 align-middle text-foreground", col.className)}
                  >
                    {col.cell ? col.cell(item) : col.accessor ? col.accessor(item) : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
