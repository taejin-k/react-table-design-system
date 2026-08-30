import type { ReactNode } from "react";

export type UploadListType = "text" | "picture";

export interface UploadFile {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  originFileObj?: File;
}

export interface UploadChangeParam<T = UploadFile> {
  file: T;
  fileList: T[];
}

export interface UploadProps {
  accept?: string;
  capture?: boolean;
  beforeUpload?: (info: UploadChangeParam<File>) => boolean | Promise<boolean>;
  defaultFileList?: UploadFile[];
  fileList?: UploadFile[];
  directory?: boolean;
  disabled?: boolean;
  draggable?: boolean;
  listType?: UploadListType;
  maxCount?: number;
  multiple?: boolean;
  showUploadList?: boolean;
  children?: ReactNode;
  className?: string;
  onChange?: (info: UploadChangeParam) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>) => void;
  onDownload?: (file: UploadFile) => void | Promise<void>;
  onRemove?: (file: UploadFile) => boolean | Promise<boolean>;
}

export interface UploadComponent {
  (props: UploadProps): ReactNode;
  Dragger: (props: UploadProps) => ReactNode;
}
