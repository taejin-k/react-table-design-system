import type { CSSProperties, ReactElement, ReactNode } from "react";

export type UploadFileStatusType = "error" | "done" | "uploading" | "removed";
export type UploadListType = "text" | "picture" | "picture-card" | "picture-circle";
export type UploadCaptureType = true | "user" | "environment";
export type UploadMethodType = "post" | "put" | "patch" | "POST" | "PUT" | "PATCH";

export interface UploadAcceptConfig {
  format: string;
  filter?: "native" | ((file: File) => boolean);
}

export interface UploadFile<T = unknown> {
  uid: string;
  name: string;
  status?: UploadFileStatusType;
  percent?: number;
  size?: number;
  type?: string;
  url?: string;
  thumbUrl?: string;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  originFileObj?: File;
  response?: T;
  error?: unknown;
}

export interface UploadChangeParam<T = UploadFile> {
  file: T;
  fileList: T[];
  event?: { percent: number };
}

export interface UploadRequestOption {
  action: string;
  filename: string;
  file: File;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
  method?: UploadMethodType;
  withCredentials?: boolean;
  onProgress: (event: { percent: number }) => void;
  onSuccess: (body: unknown) => void;
  onError: (error: Error, body?: unknown) => void;
}

export interface UploadProgressType {
  strokeColor?: CSSProperties["color"];
  strokeWidth?: number;
  showInfo?: boolean;
}

export interface UploadCustomRequestInfo {
  defaultRequest: (options: UploadRequestOption) => XMLHttpRequest;
}

export interface UploadShowListType {
  extra?: ReactNode | ((file: UploadFile) => ReactNode);
  showPreviewIcon?: boolean | ((file: UploadFile) => boolean);
  showRemoveIcon?: boolean | ((file: UploadFile) => boolean);
  showDownloadIcon?: boolean | ((file: UploadFile) => boolean);
  previewIcon?: ReactNode | ((file: UploadFile) => ReactNode);
  removeIcon?: ReactNode | ((file: UploadFile) => ReactNode);
  downloadIcon?: ReactNode | ((file: UploadFile) => ReactNode);
}

export interface UploadProps {
  accept?: string | UploadAcceptConfig;
  action?: string | ((file: File) => string | Promise<string>);
  capture?: UploadCaptureType;
  beforeUpload?: (
    file: File,
    fileList: File[],
  ) => void | boolean | string | Blob | File | Promise<void | boolean | string | Blob | File>;
  customRequest?: (
    options: UploadRequestOption,
    info: UploadCustomRequestInfo,
  ) => void | { abort?: () => void };
  data?:
    | Record<string, unknown>
    | ((file: UploadFile) => Record<string, unknown> | Promise<Record<string, unknown>>);
  defaultFileList?: UploadFile[];
  fileList?: UploadFile[];
  directory?: boolean;
  disabled?: boolean;
  headers?: Record<string, string>;
  listType?: UploadListType;
  maxCount?: number;
  method?: UploadMethodType;
  multiple?: boolean;
  name?: string;
  openFileDialogOnClick?: boolean;
  pastable?: boolean;
  progress?: UploadProgressType;
  showUploadList?: boolean | UploadShowListType;
  withCredentials?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  itemRender?: (
    originNode: ReactElement,
    file: UploadFile,
    fileList: UploadFile[],
    actions: { download: () => void; preview: () => void; remove: () => void },
  ) => ReactNode;
  iconRender?: (file: UploadFile, listType?: UploadListType) => ReactNode;
  isImageUrl?: (file: UploadFile) => boolean;
  previewFile?: (file: File | Blob) => Promise<string>;
  onChange?: (info: UploadChangeParam) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>) => void;
  onDownload?: (file: UploadFile) => void;
  onPreview?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => boolean | void | Promise<boolean | void>;
}

export interface UploadComponent {
  (props: UploadProps): ReactNode;
  Dragger: (props: UploadProps) => ReactNode;
  LIST_IGNORE: string;
}
