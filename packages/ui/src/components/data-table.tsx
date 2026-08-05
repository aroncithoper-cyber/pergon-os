"use client";

import { type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  density?: "comfortable" | "compact";
  className?: string;
  getRowKey?: (row: T, index: number) => string;
}

function DataTable<T>({
  className,
  columns,
  data,
  density = "comfortable",
  emptyMessage = "No hay datos disponibles.",
  getRowKey,
  onRowClick,
}: DataTableProps<T>) {
  const cellClassName = density === "compact" ? "px-3 py-2" : undefined;
  const rowClassName = onRowClick
    ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    : undefined;

  return (
    <Table className={cn(className)}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.id} className={cn(cellClassName, column.className)} scope="col">
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              className={cn("text-muted-foreground py-8 text-center", cellClassName)}
              colSpan={columns.length}
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow
              key={getRowKey?.(row, index) ?? index}
              className={rowClassName}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <TableCell key={column.id} className={cn(cellClassName, column.className)}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export { DataTable };
