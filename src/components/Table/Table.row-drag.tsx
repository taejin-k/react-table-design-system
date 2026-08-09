import {
  createContext,
  useContext,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
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
  "attributes" | "listeners" | "setActivatorNodeRef"
>;

const RowDragContext = createContext<RowDragContextValue | null>(null);

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
  const [activeType, setActiveType] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={tableCollisionDetection}
      modifiers={[restrictRowToTableBody]}
      autoScroll={activeType === "row" ? { canScroll: canTableAutoScroll } : false}
      onDragStart={({ active }) => setActiveType(String(active.data.current?.dragType ?? ""))}
      onDragCancel={() => setActiveType(null)}
      onDragEnd={(event) => {
        setActiveType(null);
        onDragEnd(event);
      }}
    >
      {children}
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
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dragId, data: { dragType: "row" } });
  const dragStyle: CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    transition: transition ?? "transform 220ms cubic-bezier(.2,.8,.2,1)",
  };

  return (
    <RowDragContext.Provider value={{ attributes, listeners, setActivatorNodeRef }}>
      <Component
        ref={setNodeRef}
        {...props}
        className={twMerge(className, isDragging && "relative z-10 opacity-90 drop-shadow-lg")}
        style={dragStyle}
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dragId,
    data: { dragType: "column" },
  });
  const horizontalTransform = transform ? { ...transform, y: 0 } : null;

  return (
    <Component
      ref={setNodeRef}
      {...props}
      {...attributes}
      {...listeners}
      role="columnheader"
      className={twMerge(
        className,
        "cursor-grab active:cursor-grabbing",
        isDragging && "relative z-10",
      )}
      style={{
        ...style,
        transform: CSS.Translate.toString(horizontalTransform),
        transition: transition ?? "transform 220ms cubic-bezier(.2,.8,.2,1)",
      }}
    />
  );
}

export function RowDragHandle() {
  const context = useContext(RowDragContext);
  if (!context) return null;

  return (
    <button
      ref={context.setActivatorNodeRef}
      type="button"
      {...context.attributes}
      {...context.listeners}
      className="inline-grid size-7 cursor-grab place-items-center rounded border-0 bg-transparent p-0 active:cursor-grabbing"
      onClick={(event) => event.stopPropagation()}
    >
      <Icon icon="drag-handle" color="#999" className="select-none" />
    </button>
  );
}
