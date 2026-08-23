import type { CSSProperties, ReactElement, ReactNode } from "react";

export type UploadFileStatusType = "error" | "done" | "uploading" | "removed";
export type UploadListType = "text" | "picture" | "picture-card" | "picture-circle";

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
  method?: string;
  withCredentials?: boolean;
  onProgress: (event: { percent: number }) => void;
  onSuccess: (body: unknown) => void;
  onError: (error: Error, body?: unknown) => void;
}

export interface UploadProps {
  accept?: string;
  action?: string | ((file: File) => string | Promise<string>);
  beforeUpload?: (
    file: File,
    fileList: File[],
  ) => boolean | File | Promise<boolean | File | string> | string;
  customRequest?: (options: UploadRequestOption) => void | { abort?: () => void };
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
  method?: string;
  multiple?: boolean;
  name?: string;
  openFileDialogOnClick?: boolean;
  pastable?: boolean;
  showUploadList?:
    boolean | { showPreviewIcon?: boolean; showRemoveIcon?: boolean; showDownloadIcon?: boolean };
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
