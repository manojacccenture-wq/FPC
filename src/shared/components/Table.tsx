import type { Key, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type TableAlign = 'left' | 'center' | 'right';

/**
 * Cell typography roles. Every value maps to centralized design-token classes,
 * so pages never repeat raw cell typography/color class strings.
 */
export type TableCellTone = 'primary' | 'secondary' | 'medium' | 'strong';

export interface TableColumn<T> {
  /** Stable column identity; used for React keys and header scoping. */
  id: string;
  header: ReactNode;
  /** Custom cell renderer. Presentation only — business data arrives via `row`. */
  cell: (row: T, rowIndex: number) => ReactNode;
  /** Header + cell alignment. Defaults to the table's own left alignment. */
  align?: TableAlign;
  /** Cell typography role. Defaults to `primary`. */
  tone?: TableCellTone;
  /** Column width contract, e.g. `w-[130px]` or `min-w-[260px]`. */
  widthClassName?: string;
  headerClassName?: string;
  /** Escape hatch merged after the defaults, for genuinely column-specific styling. */
  cellClassName?: string;
}

export interface TableProps<T> {
  data: readonly T[];
  columns: readonly TableColumn<T>[];
  getRowKey: (row: T, index: number) => Key;

  /** Optional data states. Copy is generic — consumers can override the presentation. */
  isLoading?: boolean;
  loadingState?: ReactNode;
  error?: ReactNode;
  emptyState?: ReactNode;

  onRowClick?: (row: T) => void;
  rowClassName?: string | ((row: T) => string);

  /** Table chrome. */
  className?: string;
  containerClassName?: string;
  /** Rendered as a sibling of the scroll container so the caller's layout gap applies. */
  footer?: ReactNode;
  ariaLabel?: string;
}

const alignClasses: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const toneClasses: Record<TableCellTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  medium: 'font-medium text-secondary',
  strong: 'font-semibold text-primary',
};

export function Table<T>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  loadingState,
  error,
  emptyState,
  onRowClick,
  rowClassName,
  className,
  containerClassName,
  footer,
  ariaLabel,
}: TableProps<T>) {
  const columnCount = columns.length;

  const renderStateRow = (content: ReactNode) => (
    <tr>
      <td colSpan={columnCount} className="py-12 text-center text-secondary">
        {content}
      </td>
    </tr>
  );

  let stateRow: ReactNode = null;

  if (isLoading) {
    stateRow = renderStateRow(
      loadingState ?? <p className="font-medium">Loading records…</p>
    );
  } else if (error !== undefined && error !== null) {
    stateRow = renderStateRow(error);
  } else if (data.length === 0) {
    stateRow = renderStateRow(
      emptyState ?? (
        <>
          <p className="font-medium">No records found</p>
          <small className="text-secondary mt-1 block">
            There is nothing to display yet.
          </small>
        </>
      )
    );
  }

  return (
    <>
      <div
        className={cn(
          'overflow-x-auto rounded-control border border-default',
          containerClassName
        )}
      >
        <table aria-label={ariaLabel} className={cn('w-full text-left', className)}>
          <thead className="bg-neutral-50 text-secondary font-semibold border-b border-default">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    'table-th-padding uppercase tracking-wider',
                    column.align && alignClasses[column.align],
                    column.widthClassName,
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-default text-primary">
            {stateRow !== null
              ? stateRow
              : data.map((row, rowIndex) => (
                  <tr
                    key={getRowKey(row, rowIndex)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      'hover:bg-neutral-50/60 transition-colors',
                      typeof rowClassName === 'function'
                        ? rowClassName(row)
                        : rowClassName
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'table-td-padding whitespace-nowrap',
                          toneClasses[column.tone ?? 'primary'],
                          column.align && alignClasses[column.align],
                          column.cellClassName
                        )}
                      >
                        {column.cell(row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {footer}
    </>
  );
}
