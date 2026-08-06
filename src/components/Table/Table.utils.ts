import type { Breakpoint, ColumnType, ColumnsType, DataIndex, FilterItem } from "./Table.types";

export const getValue = <T extends object>(record: T, dataIndex?: DataIndex): unknown => {
  if (dataIndex === undefined) return undefined;
  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
  return path.reduce<unknown>(
    (value, key) => (value != null && typeof value === "object" ? (value as Record<string | number, unknown>)[key] : undefined),
    record,
  );
};

export const columnKey = <T extends object>(column: ColumnType<T>, index = 0): string =>
  String(column.key ?? (Array.isArray(column.dataIndex) ? column.dataIndex.join(".") : column.dataIndex) ?? index);

export const flattenColumns = <T extends object>(columns: ColumnsType<T>): ColumnType<T>[] =>
  columns.flatMap((column) => (column.children?.length ? flattenColumns(column.children) : [column]));

export const maxDepth = <T extends object>(columns: ColumnsType<T>): number =>
  Math.max(1, ...columns.map((column) => (column.children?.length ? 1 + maxDepth(column.children) : 1)));

export const leafCount = <T extends object>(column: ColumnType<T>): number =>
  column.children?.length ? column.children.reduce((sum, child) => sum + leafCount(child), 0) : 1;

export const flatFilterItems = (items: FilterItem[] = []): FilterItem[] =>
  items.flatMap((item) => (item.children?.length ? flatFilterItems(item.children) : [item]));

export const breakpointWidths: Record<Breakpoint, number> = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 };
