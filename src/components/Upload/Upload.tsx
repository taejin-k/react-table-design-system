import { CSSMotionList } from "@rc-component/motion";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { message } from "../Message";
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
      const request = customRequest ? customRequest(options) : defaultRequest(options);
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
    const isPictureCard = listType === "picture-card" || listType === "picture-circle";
    const previewSource = file.thumbUrl ?? file.url;
    const showPreviewAction = showConfig.showPreviewIcon ?? true;
    const showDownloadAction =
      (showConfig.showDownloadIcon ?? true) && file.status === "done" && Boolean(file.url);
    const showRemoveAction = (showConfig.showRemoveIcon ?? true) && !disabled;
    const origin = isPictureCard ? (
      <div
        data-upload-picture-item
        className={twMerge(
          "group relative flex size-[102px] min-w-0 items-center justify-center overflow-hidden rounded-lg border border-[#d9d9d9] bg-white p-2 text-sm",
          file.status === "error" && "border-[#ff4d4f] text-[#ff4d4f]",
          listType === "picture-circle" && "rounded-full",
        )}
      >
        {isImageUrl(file) && previewSource ? (
          <img
            src={previewSource}
            alt=""
            crossOrigin={file.crossOrigin || undefined}
            className={twMerge(
              "size-full rounded object-cover",
              listType === "picture-circle" && "rounded-full",
            )}
          />
        ) : (
          <span className="flex max-w-full flex-col items-center gap-1 text-[#666]">
            {iconRender?.(file, listType) ?? <Icon icon="file-outlined" size={28} />}
            <span className="max-w-[78px] truncate text-xs">{file.name}</span>
          </span>
        )}
        {file.status === "uploading" ? (
          <span className="relative z-[1] rounded bg-white/90 px-1.5 py-0.5 text-xs text-[#666]">
            {Math.round(file.percent ?? 0)}%
          </span>
        ) : null}
        {file.status !== "uploading" &&
        (showPreviewAction || showDownloadAction || showRemoveAction) ? (
          <div
            data-upload-picture-actions
            className="absolute inset-0 z-[1] flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            {showPreviewAction ? (
              <button
                data-upload-preview
                type="button"
                className="inline-flex size-6 items-center justify-center text-white/90 transition-colors hover:text-white"
                onClick={() => void preview(file)}
              >
                <Icon icon="eye" size={16} />
              </button>
            ) : null}
            {showDownloadAction ? (
              <button
                data-upload-download
                type="button"
                className="inline-flex size-6 items-center justify-center text-white/90 transition-colors hover:text-white"
                onClick={() => download(file)}
              >
                <Icon icon="download" size={16} />
              </button>
            ) : null}
            {showRemoveAction ? (
              <button
                data-upload-remove
                type="button"
                className="inline-flex size-6 items-center justify-center text-white/90 transition-colors hover:text-white"
                onClick={() => void remove(file)}
              >
                <Icon icon="delete-outlined" size={16} />
              </button>
            ) : null}
          </div>
        ) : null}
        {file.status === "uploading" ? (
          <span className="absolute right-2 bottom-2 left-2 z-[1] h-0.5 overflow-hidden rounded bg-white/50">
            <span
              className="block h-full bg-[#0062df] transition-[width]"
              style={{ width: `${file.percent ?? 0}%` }}
            />
          </span>
        ) : null}
      </div>
    ) : (
      <div
        className={twMerge(
          "group relative flex min-w-0 items-center rounded-md px-1 text-sm leading-6 transition-colors hover:bg-[#f5f5f5]",
          listType === "picture" && "min-h-[66px] gap-2 p-2",
          file.status === "error" && "text-[#ff4d4f]",
        )}
      >
        {isImageUrl(file) && previewSource ? (
          <img
            src={previewSource}
            alt=""
            crossOrigin={file.crossOrigin || undefined}
            className={twMerge(
              "size-4 shrink-0 rounded object-cover",
              listType === "picture" && "size-12 border border-[#d9d9d9] p-1",
            )}
          />
        ) : (
          <span
            className={twMerge(
              "mr-2 inline-flex shrink-0 text-[#0062df]",
              file.status === "error" && "text-[#ff4d4f]",
            )}
          >
            {iconRender?.(file, listType) ?? <Icon icon="file-outlined" size={16} />}
          </span>
        )}
        {(showConfig.showPreviewIcon ?? true) ? (
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left hover:text-[#0062df]"
            onClick={() => void preview(file)}
          >
            {file.name}
          </button>
        ) : (
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
        )}
        {file.status === "uploading" ? (
          <span className="shrink-0 text-xs text-[#999]">{Math.round(file.percent ?? 0)}%</span>
        ) : null}
        {showDownloadAction ? (
          <button
            type="button"
            className="inline-flex shrink-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:text-[#0062df]"
            onClick={() => download(file)}
          >
            <Icon icon="download" />
          </button>
        ) : null}
        {showRemoveAction ? (
          <button
            type="button"
            className="inline-flex shrink-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:text-[#ff4d4f]"
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
  const isPictureList = listType === "picture-card" || listType === "picture-circle";
  const triggerNode = (
    <span
      tabIndex={disabled ? -1 : 0}
      className={twMerge(
        "inline-flex",
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
  );
  const listNode = showUploadList ? (
    <CSSMotionList
      keys={currentFiles.map((file) => ({ key: file.uid, file }))}
      component="div"
      motionName="wizard-upload-motion"
      motionAppear={false}
      motionDeadline={250}
      className={twMerge(isPictureList ? "contents" : "flex min-w-0 flex-col gap-2")}
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
        <span className="flex min-h-44 w-full flex-col items-center justify-center gap-1 p-4 text-center text-sm text-[#666]">
          {children ?? (
            <>
              <Icon icon="upload" size={40} color="#0062df" />
              <span className="mt-2 text-base text-[#111]">
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
