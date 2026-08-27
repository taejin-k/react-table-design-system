import { CSSMotionList } from "@rc-component/motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { message } from "../Message";
import type {
  UploadAcceptConfig,
  UploadChangeParam,
  UploadComponent,
  UploadFile,
  UploadProps,
  UploadRequestOption,
} from "./Upload.types";

const LIST_IGNORE = "__WIZARD_UPLOAD_LIST_IGNORE__";
let uid = 0;
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
    file.thumbUrl ||
    file.url?.match(/\.(png|jpe?g|gif|webp|svg|bmp)$/i),
  );
}

function acceptsFile(file: File, accept?: string | UploadAcceptConfig) {
  if (!accept) return true;
  if (typeof accept === "object" && typeof accept.filter === "function") {
    return accept.filter(file);
  }
  const format = typeof accept === "string" ? accept : accept.format;
  return format.split(",").some((rule) => {
    const value = rule.trim().toLowerCase();
    if (!value) return false;
    if (value.startsWith(".")) return file.name.toLowerCase().endsWith(value);
    if (value.endsWith("/*")) return file.type.toLowerCase().startsWith(value.slice(0, -1));
    return file.type.toLowerCase() === value;
  });
}

function UploadBase({
  accept,
  action,
  capture,
  beforeUpload,
  customRequest,
  data,
  defaultFileList = [],
  fileList,
  directory = false,
  disabled = false,
  headers,
  listType = "text",
  maxCount,
  method = "post",
  multiple = false,
  name = "file",
  openFileDialogOnClick = true,
  pastable = false,
  progress = {},
  showUploadList = true,
  withCredentials = false,
  children,
  className,
  style,
  itemRender,
  iconRender,
  isImageUrl = isImage,
  previewFile,
  onChange,
  onDrop,
  onDownload,
  onPreview,
  onRemove,
}: UploadProps) {
  const [innerFiles, setInnerFiles] = useState(defaultFileList);
  const currentFiles = fileList ?? innerFiles;
  const fileListRef = useRef(currentFiles);
  fileListRef.current = currentFiles;
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const requests = useRef(new Map<string, { abort?: () => void } | XMLHttpRequest>());
  const objectUrls = useRef(new Set<string>());
  const addPreview = (file: UploadFile) => {
    if (file.originFileObj && file.originFileObj.type.startsWith("image/")) {
      const url = URL.createObjectURL(file.originFileObj);
      objectUrls.current.add(url);
      file.thumbUrl = url;
    }
    return file;
  };
  const emit = (file: UploadFile, next: UploadFile[], event?: { percent: number }) => {
    const limited = maxCount ? (maxCount === 1 ? next.slice(-1) : next.slice(0, maxCount)) : next;
    fileListRef.current = limited;
    if (fileList === undefined) setInnerFiles(limited);
    onChange?.({ file, fileList: limited, event } as UploadChangeParam);
  };
  const update = (target: UploadFile, patch: Partial<UploadFile>, event?: { percent: number }) => {
    const nextFile = { ...target, ...patch };
    const latest = fileListRef.current;
    emit(
      nextFile,
      latest.some((file) => file.uid === target.uid)
        ? latest.map((file) => (file.uid === target.uid ? nextFile : file))
        : [...latest, nextFile],
      event,
    );
  };
  const defaultRequest = (options: UploadRequestOption) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    Object.entries(options.data ?? {}).forEach(([key, value]) =>
      form.append(
        key,
        typeof value === "string" || value instanceof Blob ? value : JSON.stringify(value),
      ),
    );
    form.append(options.filename, options.file);
    xhr.upload.onprogress = (event) =>
      event.total && options.onProgress({ percent: (event.loaded / event.total) * 100 });
    xhr.onerror = () => options.onError(new Error("파일 업로드에 실패했습니다."));
    xhr.onload = () => {
      let body: unknown = xhr.responseText;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* text response */
      }
      if (xhr.status >= 200 && xhr.status < 300) options.onSuccess(body);
      else options.onError(new Error(`HTTP ${xhr.status}`), body);
    };
    xhr.open(options.method ?? "post", options.action);
    Object.entries(options.headers ?? {}).forEach(([key, value]) =>
      xhr.setRequestHeader(key, value),
    );
    xhr.withCredentials = Boolean(options.withCredentials);
    xhr.send(form);
    return xhr;
  };
  const uploadOne = async (original: File, allFiles: File[]) => {
    let candidate: File = original;
    if (beforeUpload) {
      try {
        const result = await beforeUpload(original, allFiles);
        if (result === LIST_IGNORE) return;
        if (result === false) {
          const stopped = addPreview(toUploadFile(original));
          emit(stopped, [...fileListRef.current, stopped]);
          return;
        }
        if (result instanceof File) candidate = result;
        else if (result instanceof Blob) {
          candidate = new File([result], original.name, {
            type: result.type || original.type,
            lastModified: original.lastModified,
          });
        }
      } catch {
        return;
      }
    }
    const uploadFile = addPreview(toUploadFile(candidate));
    const nextList = maxCount === 1 ? [uploadFile] : [...fileListRef.current, uploadFile];
    emit(uploadFile, nextList);
    if (!action && !customRequest) return;
    update(uploadFile, { status: "uploading", percent: 0 });
    try {
      const resolvedAction =
        typeof action === "function" ? await action(candidate) : (action ?? "");
      const resolvedData = typeof data === "function" ? await data(uploadFile) : data;
      const options: UploadRequestOption = {
        action: resolvedAction,
        filename: name,
        file: candidate,
        data: resolvedData,
        headers,
        method,
        withCredentials,
        onProgress: (event) =>
          update(uploadFile, { status: "uploading", percent: event.percent }, event),
        onSuccess: (body) => {
          requests.current.delete(uploadFile.uid);
          update(uploadFile, { status: "done", percent: 100, response: body });
        },
        onError: (error, body) => {
          requests.current.delete(uploadFile.uid);
          update(uploadFile, { status: "error", error, response: body });
        },
      };
      const request = customRequest
        ? customRequest(options, { defaultRequest })
        : defaultRequest(options);
      const latest = fileListRef.current.find((file) => file.uid === uploadFile.uid);
      if (request && latest?.status === "uploading") requests.current.set(uploadFile.uid, request);
    } catch (error) {
      requests.current.delete(uploadFile.uid);
      update(uploadFile, {
        status: "error",
        error: error instanceof Error ? error : new Error("파일 업로드에 실패했습니다."),
      });
    }
  };
  const processFiles = (input: FileList | File[]) => {
    const files = Array.from(input).filter((file) => acceptsFile(file, accept));
    const accepted = maxCount
      ? maxCount === 1
        ? files.slice(-1)
        : files.slice(0, Math.max(0, maxCount - fileListRef.current.length))
      : files;
    if (maxCount && files.length > accepted.length) {
      message.warning({
        key: `upload-max-count-${maxCount}`,
        content: `${maxCount}개까지 등록할 수 있어요.`,
      });
    }
    accepted.forEach((file) => void uploadOne(file, files));
  };
  const remove = async (file: UploadFile) => {
    const allowed = await onRemove?.(file);
    if (allowed === false) return;
    const request = requests.current.get(file.uid);
    request?.abort?.();
    requests.current.delete(file.uid);
    if (file.thumbUrl && objectUrls.current.has(file.thumbUrl)) {
      URL.revokeObjectURL(file.thumbUrl);
      objectUrls.current.delete(file.thumbUrl);
    }
    emit(
      { ...file, status: "removed" },
      fileListRef.current.filter((entry) => entry.uid !== file.uid),
    );
  };
  const preview = async (file: UploadFile) => {
    if (onPreview) {
      onPreview(file);
      return;
    }
    let url = file.url ?? file.thumbUrl;
    if (!url && file.originFileObj) {
      url = previewFile
        ? await previewFile(file.originFileObj)
        : URL.createObjectURL(file.originFileObj);
      if (!previewFile) objectUrls.current.add(url);
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };
  const download = (file: UploadFile) => {
    if (onDownload) onDownload(file);
    else if (file.url) {
      const anchor = document.createElement("a");
      anchor.href = file.url;
      anchor.download = file.name;
      anchor.click();
    }
  };
  useEffect(
    () => () => {
      requests.current.forEach((request) => request.abort?.());
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );
  const showConfig = typeof showUploadList === "object" ? showUploadList : {};
  const showAction = (
    value: boolean | ((file: UploadFile) => boolean) | undefined,
    file: UploadFile,
    defaultValue: boolean,
  ) => (typeof value === "function" ? value(file) : (value ?? defaultValue));
  const renderActionIcon = (
    value: ReactNode | ((file: UploadFile) => ReactNode) | undefined,
    file: UploadFile,
    fallback: ReactNode,
  ) => (typeof value === "function" ? value(file) : (value ?? fallback));
  const renderExtra = (file: UploadFile) =>
    typeof showConfig.extra === "function" ? showConfig.extra(file) : showConfig.extra;
  const renderFile = (file: UploadFile) => {
    const isPictureCard = listType === "picture-card" || listType === "picture-circle";
    const previewSource = file.thumbUrl ?? file.url;
    const canPreview = Boolean(onPreview || file.url || file.thumbUrl || file.originFileObj);
    const showPreviewAction = canPreview && showAction(showConfig.showPreviewIcon, file, true);
    const showDownloadAction =
      showAction(showConfig.showDownloadIcon, file, true) &&
      file.status === "done" &&
      Boolean(file.url || onDownload);
    const showRemoveAction = showAction(showConfig.showRemoveIcon, file, true) && !disabled;
    const percent = Math.max(0, Math.min(100, file.percent ?? 0));
    const progressNode =
      file.status === "uploading" ? (
        <div data-upload-progress className="flex min-w-0 items-center gap-2">
          <span
            className="h-0.5 min-w-0 flex-1 overflow-hidden rounded bg-[#f0f0f0]"
            style={{ height: progress.strokeWidth }}
          >
            <span
              className="block h-full rounded transition-[width] duration-200 ease-out"
              style={{ width: `${percent}%`, backgroundColor: progress.strokeColor ?? "#0062df" }}
            />
          </span>
          {progress.showInfo ? (
            <span className="shrink-0 text-xs leading-none text-[#999]">
              {Math.round(percent)}%
            </span>
          ) : null}
        </div>
      ) : null;
    const origin = isPictureCard ? (
      <div
        data-upload-picture-item
        className={twMerge(
          "group relative flex size-[102px] min-w-0 items-center justify-center overflow-hidden rounded-lg border border-[#d9d9d9] bg-white p-2 text-sm",
          file.status === "uploading" && "border-dashed bg-[#fafafa]",
          file.status === "error" && "border-[#ff4d4f] text-[#ff4d4f]",
          listType === "picture-circle" && "rounded-full",
        )}
      >
        {file.status === "uploading" ? (
          <span className="flex size-full min-w-0 flex-col items-center justify-center gap-2 px-1 text-[#666]">
            {iconRender?.(file, listType) ?? <Icon icon="loading" size={22} />}
            <span className="max-w-full truncate text-xs">{file.name}</span>
            <span className="w-full px-1">{progressNode}</span>
          </span>
        ) : isImageUrl(file) && previewSource ? (
          <img
            src={previewSource}
            alt=""
            crossOrigin={file.crossOrigin || undefined}
            className={twMerge(
              "size-full rounded object-contain",
              listType === "picture-circle" && "rounded-full",
            )}
          />
        ) : (
          <span
            className={twMerge(
              "flex max-w-full flex-col items-center gap-1 text-[#666]",
              file.status === "error" && "text-[#ff4d4f]",
            )}
          >
            {iconRender?.(file, listType) ?? <Icon icon="file-outlined" size={24} />}
            <span className="max-w-[78px] truncate text-xs">{file.name}</span>
          </span>
        )}
        {file.status !== "uploading" &&
        (showPreviewAction || showDownloadAction || showRemoveAction) ? (
          <div
            data-upload-picture-actions
            className={twMerge(
              "absolute inset-2 z-[1] flex items-center justify-center gap-1 rounded bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              listType === "picture-circle" && "rounded-full",
            )}
          >
            {showPreviewAction ? (
              <button
                data-upload-preview
                type="button"
                className="inline-flex size-6 cursor-pointer items-center justify-center text-white/90 transition-colors hover:text-white"
                onClick={() => void preview(file)}
              >
                {renderActionIcon(showConfig.previewIcon, file, <Icon icon="eye" size={16} />)}
              </button>
            ) : null}
            {showDownloadAction ? (
              <button
                data-upload-download
                type="button"
                className="inline-flex size-6 cursor-pointer items-center justify-center text-white/90 transition-colors hover:text-white"
                onClick={() => download(file)}
              >
                {renderActionIcon(
                  showConfig.downloadIcon,
                  file,
                  <Icon icon="download" size={16} />,
                )}
              </button>
            ) : null}
            {showRemoveAction ? (
              <button
                data-upload-remove
                type="button"
                className="inline-flex size-6 cursor-pointer items-center justify-center text-white/90 transition-colors hover:text-white"
                onClick={() => void remove(file)}
              >
                {renderActionIcon(
                  showConfig.removeIcon,
                  file,
                  <Icon icon="delete-outlined" size={16} />,
                )}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    ) : (
      <div
        data-upload-list-item
        className={twMerge(
          "group relative min-w-0 rounded-md text-sm transition-colors hover:bg-[#f5f5f5]",
          listType === "text" && "px-1 py-0.5",
          listType === "picture" &&
            "min-h-[66px] rounded-lg border border-[#d9d9d9] p-2 hover:bg-transparent",
          file.status === "uploading" && listType === "picture" && "border-dashed",
          file.status === "error" && "text-[#ff4d4f]",
        )}
      >
        <div className={twMerge("flex min-w-0 items-center", listType === "picture" && "gap-2")}>
          {listType === "picture" && isImageUrl(file) && previewSource ? (
            <img
              src={previewSource}
              alt=""
              crossOrigin={file.crossOrigin || undefined}
              className="size-12 shrink-0 rounded object-contain"
            />
          ) : (
            <span
              className={twMerge(
                "mr-2 inline-flex shrink-0 text-[#8c8c8c]",
                file.status === "uploading" && "text-[#0062df]",
                file.status === "error" && "text-[#ff4d4f]",
              )}
            >
              {iconRender?.(file, listType) ?? (
                <Icon icon={file.status === "uploading" ? "loading" : "paperclip"} size={16} />
              )}
            </span>
          )}
          {showPreviewAction ? (
            <button
              type="button"
              className={twMerge(
                "min-w-0 flex-1 cursor-pointer truncate text-left leading-6 transition-colors hover:text-[#0062df]",
                file.status === "uploading" && "text-[#0062df]",
              )}
              onClick={() => void preview(file)}
            >
              {file.name}
            </button>
          ) : (
            <span className="min-w-0 flex-1 truncate leading-6">{file.name}</span>
          )}
          {renderExtra(file) ? (
            <span className="ml-2 inline-flex shrink-0 items-center">{renderExtra(file)}</span>
          ) : null}
          <span
            className={twMerge(
              "ml-1 inline-flex shrink-0 items-center gap-0.5",
              listType === "text" &&
                file.status !== "error" &&
                "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
            )}
          >
            {showDownloadAction ? (
              <button
                type="button"
                className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center text-[#8c8c8c] transition-colors hover:text-[#0062df]"
                onClick={() => download(file)}
              >
                {renderActionIcon(
                  showConfig.downloadIcon,
                  file,
                  <Icon icon="download" size={14} />,
                )}
              </button>
            ) : null}
            {showRemoveAction ? (
              <button
                type="button"
                className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center text-[#8c8c8c] transition-colors hover:text-[#ff4d4f]"
                onClick={() => void remove(file)}
              >
                {renderActionIcon(
                  showConfig.removeIcon,
                  file,
                  <Icon icon="delete-outlined" size={14} />,
                )}
              </button>
            ) : null}
          </span>
        </div>
        {progressNode ? (
          <div className={twMerge("mt-0.5", listType === "text" ? "ml-6" : "ml-14")}>
            {progressNode}
          </div>
        ) : null}
      </div>
    );
    return (
      itemRender?.(origin, file, currentFiles, {
        download: () => download(file),
        preview: () => void preview(file),
        remove: () => void remove(file),
      }) ?? origin
    );
  };
  const isPictureList = listType === "picture-card" || listType === "picture-circle";
  const canShowTrigger = !isPictureList || !maxCount || currentFiles.length < maxCount;
  const triggerNode = canShowTrigger ? (
    <span
      tabIndex={disabled ? -1 : 0}
      className={twMerge(
        "inline-flex",
        !disabled && openFileDialogOnClick && "cursor-pointer",
        isPictureList &&
          "size-[102px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#d9d9d9] bg-[#fafafa] transition-colors hover:border-[#0062df]",
        listType === "picture-circle" && "rounded-full",
        disabled && "cursor-not-allowed opacity-50 [&>*]:pointer-events-none",
      )}
      onClick={() => !disabled && openFileDialogOnClick && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && openFileDialogOnClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      {children}
    </span>
  ) : null;
  const listNode = showUploadList ? (
    <CSSMotionList
      keys={currentFiles.map((file) => ({ key: file.uid, file }))}
      component="div"
      motionName="wizard-upload-motion"
      motionAppear={false}
      motionDeadline={250}
      className={twMerge(isPictureList ? "contents" : "flex w-full min-w-[280px] flex-col gap-2")}
    >
      {({ file, className: motionClassName, style: motionStyle }, motionRef) => (
        <div
          ref={motionRef}
          className={twMerge("wizard-upload-motion-item", motionClassName)}
          style={motionStyle}
        >
          <div>{renderFile(file as UploadFile)}</div>
        </div>
      )}
    </CSSMotionList>
  ) : null;
  return (
    <span
      ref={rootRef}
      className={twMerge(
        "inline-flex min-w-0 gap-2 font-pretendard",
        isPictureList ? "flex-row flex-wrap items-start" : "flex-col",
        className,
      )}
      style={style}
      tabIndex={pastable ? 0 : undefined}
      onPaste={(event) => {
        if (pastable && event.clipboardData.files.length) processFiles(event.clipboardData.files);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled) processFiles(event.dataTransfer.files);
        onDrop?.(event);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={typeof accept === "string" ? accept : accept?.format}
        capture={capture}
        multiple={multiple}
        disabled={disabled}
        {...({
          webkitdirectory: directory ? "" : undefined,
        } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(event) => {
          if (event.target.files) processFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {isPictureList ? listNode : triggerNode}
      {isPictureList ? triggerNode : listNode}
    </span>
  );
}

function Dragger(props: UploadProps) {
  const { children, className, onDrop, disabled, ...rest } = props;
  const [dragging, setDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={dropRef}
      className={twMerge(
        "cursor-pointer rounded-lg border border-dashed border-[#d9d9d9] bg-[#fafafa] transition-colors hover:border-[#0062df]",
        dragging && "border-[#0062df] bg-[#e6f4ff]",
        disabled && "cursor-not-allowed opacity-50",
        className,
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
      <UploadBase {...rest} disabled={disabled} className="flex w-full" onDrop={onDrop}>
        <span className="flex min-h-44 w-full flex-col items-center justify-center gap-1 p-4 text-center text-sm text-[#666]">
          {children ?? (
            <>
              <Icon icon="upload" size={40} color="#0062df" />
              <span className="mt-2 text-base text-[#111]">
                클릭하거나 파일을 이 영역으로 드래그하세요
              </span>
              <span className="text-sm text-[#8c8c8c]">
                단일 또는 여러 파일을 선택할 수 있어요.
              </span>
            </>
          )}
        </span>
      </UploadBase>
    </div>
  );
}

export const Upload = Object.assign(UploadBase, { Dragger, LIST_IGNORE }) as UploadComponent;
