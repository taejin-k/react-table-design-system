import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type {
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

function UploadBase({
  accept,
  action,
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
      } catch {
        return;
      }
    }
    const uploadFile = addPreview(toUploadFile(candidate));
    const nextList = maxCount === 1 ? [uploadFile] : [...fileListRef.current, uploadFile];
    emit(uploadFile, nextList);
    if (!action && !customRequest) return;
    update(uploadFile, { status: "uploading", percent: 0 });
    const resolvedAction = typeof action === "function" ? await action(candidate) : (action ?? "");
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
    const request = customRequest?.(options) ?? defaultRequest(options);
    if (request) requests.current.set(uploadFile.uid, request);
  };
  const processFiles = (input: FileList | File[]) => {
    const files = Array.from(input);
    const accepted = maxCount
      ? files.slice(0, Math.max(0, maxCount - (maxCount === 1 ? 0 : fileListRef.current.length)))
      : files;
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
    const url =
      file.url ??
      file.thumbUrl ??
      (file.originFileObj
        ? previewFile
          ? await previewFile(file.originFileObj)
          : URL.createObjectURL(file.originFileObj)
        : undefined);
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
  const renderFile = (file: UploadFile) => {
    const origin = (
      <div
        className={twMerge(
          "group relative flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-[#f5f5f5]",
          file.status === "error" && "text-[#ff4d4f]",
          (listType === "picture-card" || listType === "picture-circle") &&
            "size-24 flex-col justify-center border border-[#d9d9d9] p-2",
          listType === "picture-circle" && "overflow-hidden rounded-full",
        )}
      >
        {isImageUrl(file) ? (
          <img
            src={file.thumbUrl ?? file.url ?? undefined}
            alt=""
            className={twMerge(
              "size-8 shrink-0 rounded object-cover",
              (listType === "picture-card" || listType === "picture-circle") &&
                "absolute inset-0 size-full",
            )}
          />
        ) : (
          <span className="inline-flex shrink-0 text-[#666]">
            {iconRender?.(file, listType) ?? <Icon icon="file-outlined" />}
          </span>
        )}
        <button
          type="button"
          className={twMerge(
            "min-w-0 flex-1 truncate text-left hover:text-[#0062df]",
            (listType === "picture-card" || listType === "picture-circle") &&
              "z-[1] mt-auto bg-white/90 px-1 text-center text-xs opacity-0 group-hover:opacity-100",
          )}
          onClick={() => void preview(file)}
        >
          {file.name}
        </button>
        {file.status === "uploading" ? (
          <span className="shrink-0 text-xs text-[#999]">{Math.round(file.percent ?? 0)}%</span>
        ) : null}
        {(showConfig.showDownloadIcon ?? true) && file.status === "done" && file.url ? (
          <button
            type="button"
            aria-label={`${file.name} 다운로드`}
            className="inline-flex shrink-0 text-[#666] hover:text-[#0062df]"
            onClick={() => download(file)}
          >
            <Icon icon="download" />
          </button>
        ) : null}
        {(showConfig.showRemoveIcon ?? true) && !disabled ? (
          <button
            type="button"
            aria-label={`${file.name} 삭제`}
            className="inline-flex shrink-0 text-[#666] hover:text-[#ff4d4f]"
            onClick={() => void remove(file)}
          >
            <Icon icon="delete-outlined" />
          </button>
        ) : null}
        {file.status === "uploading" ? (
          <span className="absolute right-2 bottom-0 left-2 h-0.5 overflow-hidden rounded bg-[#f0f0f0]">
            <span
              className="block h-full bg-[#0062df] transition-[width]"
              style={{ width: `${file.percent ?? 0}%` }}
            />
          </span>
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
  return (
    <span
      ref={rootRef}
      className={twMerge("inline-flex min-w-0 flex-col gap-2 font-pretendard", className)}
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
        accept={accept}
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
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={twMerge(
          "inline-flex",
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
      {showUploadList ? (
        <div
          className={twMerge(
            (listType === "picture-card" || listType === "picture-circle") &&
              "flex flex-wrap gap-2",
          )}
        >
          {currentFiles.map((file) => (
            <div key={file.uid}>{renderFile(file)}</div>
          ))}
        </div>
      ) : null}
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
        "rounded-lg border border-dashed border-[#d9d9d9] bg-[#fafafa] transition-colors hover:border-[#0062df]",
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
        <span className="flex min-h-40 w-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-[#666]">
          {children ?? (
            <>
              <Icon icon="upload" size={32} color="#0062df" />
              <span className="text-base text-[#111]">
                클릭하거나 파일을 이 영역으로 드래그하세요
              </span>
            </>
          )}
        </span>
      </UploadBase>
    </div>
  );
}

export const Upload = Object.assign(UploadBase, { Dragger, LIST_IGNORE }) as UploadComponent;
