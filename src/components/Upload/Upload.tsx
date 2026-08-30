import {
  closestCenter,
  DndContext,
  PointerSensor,
  useDndContext,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSMotionList } from "@rc-component/motion";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { Image } from "../Image";
import { message } from "../Message";
import type { UploadChangeParam, UploadComponent, UploadFile, UploadProps } from "./Upload.types";

let uid = 0;
const IMAGE_FILE_EXTENSION = /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i;

function toUploadFile(file: File): UploadFile {
  return {
    uid: `${Date.now()}-${uid++}`,
    name: file.name,
    size: file.size,
    type: file.type,
    originFileObj: file,
  };
}
function isImage(file: UploadFile) {
  return Boolean(
    file.type?.startsWith("image/") ||
    IMAGE_FILE_EXTENSION.test(file.name) ||
    IMAGE_FILE_EXTENSION.test(file.url?.split(/[?#]/, 1)[0] ?? ""),
  );
}

function acceptsFile(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").some((rule) => {
    const value = rule.trim().toLowerCase();
    if (!value) return false;
    if (value.startsWith(".")) return file.name.toLowerCase().endsWith(value);
    if (value.endsWith("/*")) return file.type.toLowerCase().startsWith(value.slice(0, -1));
    return file.type.toLowerCase() === value;
  });
}

const uploadMotionCollapsedStyle: CSSProperties = { height: 0 };
export const DOWNLOAD_LOADING_DELAY = 1000;

function getUploadMotionExpandedStyle(element: HTMLElement): CSSProperties {
  return { height: element.scrollHeight };
}

function getUploadMotionCurrentStyle(element: HTMLElement): CSSProperties {
  return { height: element.getBoundingClientRect().height };
}

export function reorderUploadFiles(files: UploadFile[], activeId: string, overId: string) {
  const previousIndex = files.findIndex((file) => file.uid === activeId);
  const nextIndex = files.findIndex((file) => file.uid === overId);
  if (previousIndex < 0 || nextIndex < 0 || previousIndex === nextIndex) return files;
  return arrayMove(files, previousIndex, nextIndex);
}

interface UploadSortContextProps {
  children: ReactNode;
  enabled: boolean;
  items: string[];
  onDragEnd: (event: DragEndEvent) => void;
}

function EnabledUploadSortContext({
  children,
  enabled,
  items,
  onDragEnd,
}: UploadSortContextProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [accessibilityContainer] = useState<Element | undefined>(() =>
    typeof document === "undefined" ? undefined : document.createElement("div"),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{ container: accessibilityContainer, restoreFocus: false }}
      onDragEnd={enabled ? onDragEnd : undefined}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

function UploadSortContext({ enabled, ...props }: UploadSortContextProps) {
  return <EnabledUploadSortContext {...props} enabled={enabled} />;
}

interface SortableUploadItemProps {
  children: (handle: ReactNode, state: { isDragging: boolean; isSorting: boolean }) => ReactNode;
  enabled: boolean;
  id: string;
  listType: "text" | "picture";
  sortable: boolean;
}

export function getSortableUploadItemClassName(listType: "text" | "picture", isDragging: boolean) {
  return twMerge(
    "relative shadow-none",
    listType === "picture" && "rounded-lg",
    isDragging && [
      listType === "picture" ? "z-[1000]" : "z-10",
      "shadow-[0_3px_8px_rgba(0,0,0,0.12)]",
    ],
  );
}

export function getSortableUploadItemTransition(transition?: string) {
  return `${transition ?? "transform 220ms cubic-bezier(.2,.8,.2,1)"}, box-shadow 180ms ease-out`;
}

export function shouldDisableSortableTextHover(
  listType: "text" | "picture",
  isSorting: boolean,
  isDragging: boolean,
) {
  return listType === "text" && isSorting && !isDragging;
}

function SortableUploadItem({
  children,
  enabled,
  id,
  listType,
  sortable,
}: SortableUploadItemProps) {
  const { listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !enabled });
  const { active } = useDndContext();
  const verticalTransform = transform ? { ...transform, x: 0 } : null;

  return (
    <div
      ref={setNodeRef}
      data-upload-sortable-item={sortable ? id : undefined}
      data-upload-dragging={isDragging || undefined}
      className={getSortableUploadItemClassName(listType, isDragging)}
      style={
        {
          transform: CSS.Transform.toString(verticalTransform),
          transition: getSortableUploadItemTransition(transition),
        } as CSSProperties
      }
    >
      {children(
        <span
          ref={setActivatorNodeRef}
          data-upload-drag-handle={id}
          className={twMerge(
            "inline-flex h-6 shrink-0 cursor-grab items-center justify-center text-[#999] active:cursor-grabbing",
            listType === "text" ? "mr-1 w-6" : "w-4",
          )}
          {...listeners}
        >
          <Icon icon="drag-handle" size={12} className="select-none" />
        </span>,
        { isDragging, isSorting: enabled && Boolean(active) },
      )}
    </div>
  );
}

function UploadDragHandle({
  listType,
  disabled,
}: {
  listType: "text" | "picture";
  disabled: boolean;
}) {
  return (
    <span
      data-upload-drag-handle-disabled={disabled ? "true" : undefined}
      className={twMerge(
        "inline-flex h-6 shrink-0 items-center justify-center text-[#999]",
        listType === "text" ? "mr-1 w-6" : "w-4",
        disabled ? "cursor-not-allowed text-[#bbb]" : "cursor-grab",
      )}
    >
      <Icon icon="drag-handle" size={12} className="select-none" />
    </span>
  );
}

function UploadPictureThumbnail({
  source,
  alt,
  fallback,
}: {
  source?: string;
  alt: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [source]);

  if (!source || failed) {
    return (
      <span
        data-upload-picture-fallback
        className={twMerge(
          "inline-flex size-12 shrink-0 items-center justify-center rounded bg-[#f5f5f5] text-[#bfbfbf]",
        )}
      >
        {fallback}
      </span>
    );
  }

  return (
    <Image
      data-upload-picture-thumbnail
      src={source}
      alt={alt}
      width={48}
      height={48}
      preview={{ cover: false }}
      draggable={false}
      className="size-12 shrink-0 rounded [&>img]:rounded [&>img]:object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function UploadBase({
  accept,
  capture,
  beforeUpload,
  defaultFileList = [],
  fileList,
  directory = false,
  disabled = false,
  draggable = false,
  listType = "text",
  maxCount,
  multiple = false,
  showUploadList = true,
  children,
  className,
  onChange,
  onDrop,
  onDownload,
  onRemove,
}: UploadProps) {
  const [innerFiles, setInnerFiles] = useState(defaultFileList);
  const [activeDownloadUids, setActiveDownloadUids] = useState<Set<string>>(() => new Set());
  const [downloadLoadingUids, setDownloadLoadingUids] = useState<Set<string>>(() => new Set());
  const currentFiles = fileList ?? innerFiles;
  const fileListRef = useRef(currentFiles);
  const activeDownloadUidsRef = useRef(new Set<string>());
  const downloadLoadingTimersRef = useRef(new Map<string, number>());
  const listMountedRef = useRef(false);
  const mountedRef = useRef(true);
  fileListRef.current = currentFiles;
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const previewUrls = useRef(new Map<string, string>());
  const revokePreview = (fileUid: string) => {
    const previewUrl = previewUrls.current.get(fileUid);
    if (!previewUrl) return;
    URL.revokeObjectURL(previewUrl);
    previewUrls.current.delete(fileUid);
  };
  const addPreview = (file: UploadFile) => {
    if (file.originFileObj && isImage(file)) {
      const url = URL.createObjectURL(file.originFileObj);
      previewUrls.current.set(file.uid, url);
    }
    return file;
  };
  const emit = (file: UploadFile, next: UploadFile[]) => {
    const limited = maxCount ? (maxCount === 1 ? next.slice(-1) : next.slice(0, maxCount)) : next;
    fileListRef.current = limited;
    if (fileList === undefined) setInnerFiles(limited);
    onChange?.({ file, fileList: limited } as UploadChangeParam);
  };
  const processFiles = async (input: FileList | File[]) => {
    const files = Array.from(input).filter((file) => acceptsFile(file, accept));
    if (!multiple && files.length > 1) {
      message.warning({
        key: "upload-single-file-only",
        content: "단일 파일만 선택할 수 있어 첫 번째 파일만 추가했어요.",
      });
    }
    const selectedFiles = multiple ? files : files.slice(0, 1);
    const accepted = maxCount
      ? maxCount === 1
        ? selectedFiles.slice(-1)
        : selectedFiles.slice(0, Math.max(0, maxCount - fileListRef.current.length))
      : selectedFiles;
    if (maxCount && selectedFiles.length > accepted.length) {
      message.warning({
        key: `upload-max-count-${maxCount}`,
        content: `${maxCount}개까지 등록할 수 있어요.`,
      });
    }

    const validationResults = await Promise.all(
      accepted.map(async (file) => {
        if (!beforeUpload) return true;
        try {
          return await beforeUpload({ file, fileList: selectedFiles });
        } catch {
          return false;
        }
      }),
    );

    accepted.forEach((file, index) => {
      if (!validationResults[index]) return;
      const uploadFile = addPreview(toUploadFile(file));
      const nextList = maxCount === 1 ? [uploadFile] : [...fileListRef.current, uploadFile];
      emit(uploadFile, nextList);
    });
  };
  const remove = async (file: UploadFile) => {
    try {
      const allowed = await onRemove?.(file);
      if (allowed === false) return;
      emit(
        file,
        fileListRef.current.filter((entry) => entry.uid !== file.uid),
      );
    } catch {
      // 삭제 전 검사가 실패하면 파일과 미리보기를 그대로 유지해요.
    }
  };
  const download = async (file: UploadFile) => {
    if ((!onDownload && !file.url) || activeDownloadUidsRef.current.has(file.uid)) return;

    activeDownloadUidsRef.current.add(file.uid);
    setActiveDownloadUids(new Set(activeDownloadUidsRef.current));
    downloadLoadingTimersRef.current.set(
      file.uid,
      window.setTimeout(() => {
        downloadLoadingTimersRef.current.delete(file.uid);
        if (!mountedRef.current || !activeDownloadUidsRef.current.has(file.uid)) return;
        setDownloadLoadingUids((current) => new Set(current).add(file.uid));
      }, DOWNLOAD_LOADING_DELAY),
    );

    try {
      if (onDownload) {
        await onDownload(file);
        return;
      }
      if (!file.url) return;

      const response = await fetch(file.url);
      if (!response.ok) {
        message.error({
          key: `upload-download-error-${file.uid}`,
          content: "파일을 다운로드할 수 없어요. 파일 URL을 확인해주세요.",
        });
        return;
      }

      const objectUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = file.name;
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch {
      message.error({
        key: `upload-download-error-${file.uid}`,
        content: "파일을 다운로드할 수 없어요. 파일 URL을 확인해주세요.",
      });
    } finally {
      const loadingTimer = downloadLoadingTimersRef.current.get(file.uid);
      if (loadingTimer !== undefined) window.clearTimeout(loadingTimer);
      downloadLoadingTimersRef.current.delete(file.uid);
      activeDownloadUidsRef.current.delete(file.uid);
      if (mountedRef.current) {
        setActiveDownloadUids(new Set(activeDownloadUidsRef.current));
        setDownloadLoadingUids((current) => {
          if (!current.has(file.uid)) return current;
          const next = new Set(current);
          next.delete(file.uid);
          return next;
        });
      }
    }
  };
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      downloadLoadingTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      downloadLoadingTimersRef.current.clear();
      activeDownloadUidsRef.current.clear();
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  useEffect(() => {
    if (showUploadList) return;
    const currentUids = new Set(currentFiles.map((file) => file.uid));
    previewUrls.current.forEach((_, fileUid) => {
      if (!currentUids.has(fileUid)) revokePreview(fileUid);
    });
  }, [currentFiles, showUploadList]);
  useEffect(() => {
    listMountedRef.current = true;
  }, []);
  const renderFile = (
    file: UploadFile,
    dragHandle?: ReactNode,
    dragState?: { isDragging: boolean; isSorting: boolean },
  ) => {
    const previewSource = previewUrls.current.get(file.uid) ?? file.url;
    const imageFile = isImage(file);
    const downloadActive = activeDownloadUids.has(file.uid);
    const downloading = downloadLoadingUids.has(file.uid);
    const textHoverDisabled = shouldDisableSortableTextHover(
      listType,
      Boolean(dragState?.isSorting),
      Boolean(dragState?.isDragging),
    );
    const showDownloadAction = Boolean(file.url || onDownload);
    const showRemoveAction = !disabled;
    const origin = (
      <div
        data-upload-list-item
        data-upload-hover-disabled={textHoverDisabled || undefined}
        className={twMerge(
          "group relative min-w-0 rounded text-sm transition-[background-color]",
          listType === "text" && [
            "h-[22px] px-1",
            dragState?.isDragging
              ? "bg-[#f5f5f5]"
              : dragState?.isSorting
                ? "pointer-events-none bg-transparent hover:bg-transparent"
                : "hover:bg-[#f5f5f5]",
          ],
          listType === "picture" &&
            "min-h-[66px] rounded-lg border border-[#d9d9d9] bg-white p-2 hover:bg-white",
        )}
      >
        <div className={twMerge("flex min-w-0 items-center", listType === "picture" && "gap-2")}>
          {dragHandle}
          {listType === "picture" ? (
            <UploadPictureThumbnail
              source={imageFile ? previewSource : undefined}
              alt={file.name}
              fallback={<Icon icon={imageFile ? "image-outlined" : "file-outlined"} size={22} />}
            />
          ) : (
            <span className={twMerge("inline-flex shrink-0 text-[#8c8c8c]", "w-3")}>
              <Icon icon="paperclip" size={12} />
            </span>
          )}
          <span
            className={twMerge(
              "min-w-0 flex-1 truncate leading-6",
              listType === "text" && "px-1 leading-[22px]",
            )}
          >
            {file.name}
          </span>
          <span
            key={listType}
            data-upload-actions
            className={twMerge(
              "ml-0.5 inline-flex shrink-0 items-center gap-0",
              listType === "text" &&
                (textHoverDisabled
                  ? "opacity-0"
                  : "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"),
            )}
          >
            {showDownloadAction ? (
              <button
                type="button"
                data-upload-download-action
                data-upload-download-active={downloadActive || undefined}
                data-upload-download-loading={downloading || undefined}
                aria-busy={downloadActive || undefined}
                aria-label={`${file.name} ${downloadActive ? "다운로드 중" : "다운로드"}`}
                disabled={downloadActive}
                className={twMerge(
                  "inline-flex shrink-0 cursor-pointer items-center justify-center text-[#8c8c8c] transition-colors hover:text-[#0062df]",
                  listType === "text" ? "size-5" : "size-6",
                  downloadActive && "cursor-default hover:text-[#8c8c8c]",
                  downloading && "cursor-wait",
                )}
                onClick={() => void download(file)}
              >
                <Icon icon="download" size={14} loading={downloading} />
              </button>
            ) : null}
            {showRemoveAction ? (
              <button
                type="button"
                data-upload-remove-action
                className={twMerge(
                  "inline-flex shrink-0 cursor-pointer items-center justify-center text-[#8c8c8c] transition-colors hover:text-[#ff4d4f]",
                  listType === "text" ? "size-5" : "size-6",
                )}
                onClick={() => void remove(file)}
              >
                <Icon icon="delete-outlined" size={14} />
              </button>
            ) : null}
          </span>
        </div>
      </div>
    );
    return origin;
  };
  const supportsSorting = draggable;
  const sortingEnabled = supportsSorting && !disabled;
  const handleSortEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const latest = fileListRef.current;
    const movedFile = latest.find((file) => file.uid === active.id);
    const nextFiles = reorderUploadFiles(latest, String(active.id), String(over.id));
    if (!movedFile || nextFiles === latest) return;
    emit(movedFile, nextFiles);
  };
  const triggerNode = (
    <span
      data-upload-trigger
      tabIndex={disabled ? -1 : 0}
      className={twMerge(
        "inline-flex w-fit self-start",
        !disabled && "cursor-pointer",
        disabled && "cursor-not-allowed opacity-50 [&>*]:pointer-events-none",
      )}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      {children}
    </span>
  );
  const listNode = showUploadList ? (
    <UploadSortContext
      enabled={sortingEnabled}
      items={currentFiles.map((file) => file.uid)}
      onDragEnd={handleSortEnd}
    >
      <CSSMotionList
        keys={currentFiles.map((file) => ({ key: file.uid, file }))}
        component="div"
        motionName="wizard-upload-motion"
        motionAppear={listMountedRef.current}
        motionEnter
        motionLeave
        motionDeadline={listType === "picture" ? 420 : 320}
        onAppearStart={() => uploadMotionCollapsedStyle}
        onAppearActive={getUploadMotionExpandedStyle}
        onEnterStart={() => uploadMotionCollapsedStyle}
        onEnterActive={getUploadMotionExpandedStyle}
        onLeaveStart={getUploadMotionCurrentStyle}
        onLeaveActive={() => uploadMotionCollapsedStyle}
        onLeaveEnd={(element) => {
          const fileUid = element.dataset.uploadMotionFile;
          if (fileUid && !fileListRef.current.some((file) => file.uid === fileUid)) {
            revokePreview(fileUid);
          }
        }}
        className="-mb-2 flex w-full min-w-0 flex-col"
      >
        {({ file, className: motionClassName, style: motionStyle }, motionRef) => {
          const uploadFile = file as UploadFile;
          return (
            <div
              ref={motionRef}
              data-upload-motion-file={uploadFile.uid}
              className={twMerge(
                "wizard-upload-motion-item",
                listType === "picture" && "wizard-upload-motion-item-picture",
                motionClassName,
              )}
              style={motionStyle}
            >
              <div className="wizard-upload-motion-content pb-2">
                <SortableUploadItem
                  id={uploadFile.uid}
                  listType={listType}
                  sortable={supportsSorting}
                  enabled={sortingEnabled}
                >
                  {(handle, dragState) =>
                    renderFile(
                      uploadFile,
                      supportsSorting ? (
                        sortingEnabled ? (
                          handle
                        ) : (
                          <UploadDragHandle listType={listType} disabled />
                        )
                      ) : undefined,
                      sortingEnabled ? dragState : undefined,
                    )
                  }
                </SortableUploadItem>
              </div>
            </div>
          );
        }}
      </CSSMotionList>
    </UploadSortContext>
  ) : null;
  return (
    <span
      ref={rootRef}
      className={twMerge("inline-flex w-full min-w-0 flex-col gap-2 font-pretendard", className)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled) void processFiles(event.dataTransfer.files);
        onDrop?.(event);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        capture={capture}
        multiple={multiple}
        disabled={disabled}
        {...({
          webkitdirectory: directory ? "" : undefined,
        } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(event) => {
          if (event.target.files) void processFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {triggerNode}
      {listNode}
    </span>
  );
}

function Dragger(props: UploadProps) {
  const { children, className, onDrop, disabled, multiple = false, ...rest } = props;
  const [dragging, setDragging] = useState(false);
  return (
    <div className={twMerge("min-w-0", className)}>
      <UploadBase
        {...rest}
        disabled={disabled}
        multiple={multiple}
        className="flex w-full [&>span]:w-full"
        onDrop={onDrop}
      >
        <span
          data-upload-dragger-area
          className={twMerge(
            "flex min-h-44 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#d9d9d9] bg-[rgba(0,0,0,0.02)] p-4 text-center text-sm text-[#666] transition-colors hover:border-[#0062df]",
            dragging && "border-[#0062df] bg-[#e6f4ff]",
            disabled && "cursor-not-allowed",
          )}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
        >
          {children ?? (
            <>
              <Icon icon="upload" size={40} color="#0062df" />
              <span className="mt-2 text-base text-[#111]">
                클릭하거나 파일을 이 영역으로 드래그하세요
              </span>
              <span className="text-sm text-[#8c8c8c]">
                {multiple ? "여러 파일을 선택할 수 있어요." : "단일 파일만 선택할 수 있어요."}
              </span>
            </>
          )}
        </span>
      </UploadBase>
    </div>
  );
}

export const Upload = Object.assign(UploadBase, { Dragger }) as UploadComponent;
