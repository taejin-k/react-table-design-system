import {
  createContext,
  useContext,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type Modifier,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";

type TableDragProviderProps = {
  children: ReactNode;
  enabled: boolean;
  onDragEnd: (event: DragEndEvent) => void;
};

type TableSortableContextProps = {
  children: ReactNode;
  enabled: boolean;
  items: UniqueIdentifier[];
};

type SortableTableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  component: ElementType;
  dragId: UniqueIdentifier;
};

type SortableTableHeaderCellProps = HTMLAttributes<HTMLTableCellElement> & {
  component: ElementType;
  dragId: UniqueIdentifier;
};

type RowDragContextValue = Pick<
  ReturnType<typeof useSortable>,
  "listeners" | "setActivatorNodeRef"
>;

const RowDragContext = createContext<RowDragContextValue | null>(null);
type ActiveTableDrag = { id: UniqueIdentifier; type: string };
type TableDragState = {
  active: ActiveTableDrag | null;
  clearRetainedRow: (id: UniqueIdentifier) => void;
  retainedRowId: UniqueIdentifier | null;
};
const TableDragStateContext = createContext<TableDragState>({
  active: null,
  clearRetainedRow: () => undefined,
  retainedRowId: null,
});

const tableCollisionDetection: CollisionDetection = (args) => {
  const dragType = args.active.data.current?.dragType;
  const droppableContainers = dragType
    ? args.droppableContainers.filter((container) => container.data.current?.dragType === dragType)
    : args.droppableContainers;

  return closestCenter({ ...args, droppableContainers });
};

export const canTableAutoScroll = (element: Element) =>
  element.hasAttribute("data-table-scroll-container") &&
  element.scrollHeight > element.clientHeight;

export const restrictRowToTableBody: Modifier = ({
  active,
  activeNodeRect,
  activatorEvent,
  transform,
}) => {
  if (active?.data.current?.dragType !== "row" || !activeNodeRect) return transform;

  const target = activatorEvent?.target;
  const tableBody = target instanceof Element ? target.closest("table")?.tBodies[0] : null;
  if (!tableBody) return { ...transform, x: 0 };

  const bodyRect = tableBody.getBoundingClientRect();
  const minimumY = bodyRect.top - activeNodeRect.top;
  const maximumY = bodyRect.bottom - activeNodeRect.bottom;

  return {
    ...transform,
    x: 0,
    y: Math.min(maximumY, Math.max(minimumY, transform.y)),
  };
};

function EnabledTableDragProvider({
  children,
  onDragEnd,
}: Omit<TableDragProviderProps, "enabled">) {
  const [activeDrag, setActiveDrag] = useState<ActiveTableDrag | null>(null);
  const [retainedRowId, setRetainedRowId] = useState<UniqueIdentifier | null>(null);
  const [detachedAccessibilityContainer] = useState<Element | undefined>(() =>
    typeof document === "undefined" ? undefined : document.createElement("div"),
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const finishDrag = () => requestAnimationFrame(() => setActiveDrag(null));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={tableCollisionDetection}
      modifiers={[restrictRowToTableBody]}
      accessibility={{ container: detachedAccessibilityContainer, restoreFocus: false }}
      autoScroll={activeDrag?.type === "row" ? { canScroll: canTableAutoScroll } : false}
      onDragStart={({ active }) => {
        setRetainedRowId(null);
        setActiveDrag({ id: active.id, type: String(active.data.current?.dragType ?? "") });
      }}
      onDragCancel={() => {
        setRetainedRowId(null);
        finishDrag();
      }}
      onDragEnd={(event) => {
        if (event.active.data.current?.dragType === "row") setRetainedRowId(event.active.id);
        onDragEnd(event);
        finishDrag();
      }}
    >
      <TableDragStateContext.Provider
        value={{
          active: activeDrag,
          clearRetainedRow: (id) =>
            setRetainedRowId((current) => (current === id ? null : current)),
          retainedRowId,
        }}
      >
        {children}
      </TableDragStateContext.Provider>
    </DndContext>
  );
}

export function TableDragProvider({ enabled, ...props }: TableDragProviderProps) {
  return enabled ? <EnabledTableDragProvider {...props} /> : props.children;
}

export function RowSortableContext({ enabled, items, children }: TableSortableContextProps) {
  return enabled ? (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      {children}
    </SortableContext>
  ) : (
    children
  );
}

export function ColumnSortableContext({ enabled, items, children }: TableSortableContextProps) {
  return enabled ? (
    <SortableContext items={items} strategy={horizontalListSortingStrategy}>
      {children}
    </SortableContext>
  ) : (
    children
  );
}

export function SortableTableRow({
  component: Component,
  dragId,
  className,
  style,
  ...props
}: SortableTableRowProps) {
  const { active: activeDrag, clearRetainedRow, retainedRowId } = useContext(TableDragStateContext);
  const { listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: dragId, data: { dragType: "row" } });
  const movementTransition = transition ?? "transform 200ms cubic-bezier(.2,.8,.2,1)";
  const dragStyle: CSSProperties = {
    ...style,
    filter: isDragging ? "drop-shadow(var(--shadow-sm))" : "drop-shadow(0 0 0 rgb(0 0 0 / 0))",
    transform: CSS.Translate.toString(transform),
    transition: `${movementTransition}, filter 200ms ease-out`,
  };

  return (
    <RowDragContext.Provider value={{ listeners, setActivatorNodeRef }}>
      <Component
        ref={setNodeRef}
        {...props}
        className={twMerge(
          className,
          activeDrag?.type === "row" && "pointer-events-none",
          ((activeDrag?.type === "row" && activeDrag.id === dragId) || retainedRowId === dragId) &&
            "[&>td]:bg-hover",
          isDragging && "relative z-10 bg-white",
        )}
        style={dragStyle}
        onMouseLeave={(event: ReactMouseEvent<HTMLTableRowElement>) => {
          props.onMouseLeave?.(event);
          clearRetainedRow(dragId);
        }}
      />
    </RowDragContext.Provider>
  );
}

export function SortableTableHeaderCell({
  component: Component,
  dragId,
  className,
  style,
  ...props
}: SortableTableHeaderCellProps) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dragId,
    data: { dragType: "column" },
  });
  const horizontalTransform = transform ? { ...transform, y: 0 } : null;

  return (
    <Component
      ref={setNodeRef}
      {...props}
      {...listeners}
      className={twMerge(
        className,
        "cursor-grab active:cursor-grabbing",
        isDragging && "relative z-10 drop-shadow-[var(--shadow-sm)]",
      )}
      style={{
        ...style,
        transform: CSS.Translate.toString(horizontalTransform),
        transition: transition ?? "transform 200ms cubic-bezier(.2,.8,.2,1)",
      }}
    />
  );
}

export function RowDragHandle() {
  const context = useContext(RowDragContext);
  if (!context) return null;

  return (
    <Button
      ref={context.setActivatorNodeRef}
      variant="ghost"
      size="sm"
      iconOnly
      prefixIcon={<Icon icon="drag-handle" color="disabled" className="select-none" />}
      {...context.listeners}
      className="inline-grid size-7 cursor-grab place-items-center rounded border-0 bg-transparent p-0 active:cursor-grabbing"
      onClick={(event) => event.stopPropagation()}
    />
  );
}
