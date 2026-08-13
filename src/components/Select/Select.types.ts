import type { FocusEvent, KeyboardEvent, ReactNode, UIEvent } from "react";
import type { InputSize } from "../Input";

export type SelectValue = string | number;
export type SelectMode = "multiple" | "tags";
export type SelectPlacement = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type SelectVariant = "default" | "outlined" | "filled" | "borderless" | "underlined";
export type SelectStatus = "error" | "warning";

export interface SelectLabeledValue {
  value: SelectValue;
  label: ReactNode;
}

export interface SelectOption {
  label?: ReactNode;
  value?: SelectValue;
  disabled?: boolean;
  options?: SelectOption[];
  title?: string;
  className?: string;
  [key: string]: unknown;
}

export interface SelectFieldNames {
  label?: string;
  value?: string;
  options?: string;
  groupLabel?: string;
}

export interface SelectSearchConfig {
  autoClearSearchValue?: boolean;
  filterOption?: boolean | ((inputValue: string, option: SelectOption) => boolean);
  filterSort?: (
    optionA: SelectOption,
    optionB: SelectOption,
    info: { searchValue: string },
  ) => number;
  optionFilterProp?: string | string[];
  optionLabelProp?: string;
  searchValue?: string;
  searchIcon?: ReactNode;
  onSearch?: (value: string) => void;
}

export interface SelectTagRenderProps {
  label: ReactNode;
  value: SelectValue;
  closable: boolean;
  onClose: () => void;
}

export interface SelectRef {
  focus: () => void;
  blur: () => void;
}

export interface SelectProps {
  options: SelectOption[];
  value?: SelectValue | SelectValue[] | SelectLabeledValue | SelectLabeledValue[];
  defaultValue?: SelectValue | SelectValue[] | SelectLabeledValue | SelectLabeledValue[];
  mode?: SelectMode;
  placeholder?: ReactNode;
  size?: InputSize;
  variant?: SelectVariant;
  status?: SelectStatus;
  label?: ReactNode;
  errorText?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  allowClear?: boolean | { clearIcon?: ReactNode };
  showSearch?: boolean | SelectSearchConfig;
  searchValue?: string;
  autoClearSearchValue?: boolean;
  defaultActiveFirstOption?: boolean;
  filterOption?: boolean | ((inputValue: string, option: SelectOption) => boolean);
  filterSort?: SelectSearchConfig["filterSort"];
  optionFilterProp?: string | string[];
  optionLabelProp?: string;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: SelectPlacement;
  notFoundContent?: ReactNode;
  fieldNames?: SelectFieldNames;
  labelInValue?: boolean;
  listHeight?: number;
  loading?: boolean;
  maxCount?: number;
  maxTagCount?: number | "responsive";
  maxTagPlaceholder?: ReactNode | ((omittedValues: SelectLabeledValue[]) => ReactNode);
  maxTagTextLength?: number;
  popupMatchSelectWidth?: boolean | number;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  removeIcon?: ReactNode;
  menuItemSelectedIcon?: ReactNode;
  tokenSeparators?: string[] | ((input: string) => string[]);
  virtual?: boolean;
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  popupRender?: (originNode: ReactNode) => ReactNode;
  tagRender?: (props: SelectTagRenderProps) => ReactNode;
  labelRender?: (props: SelectLabeledValue) => ReactNode;
  className?: string;
  onChange?: (
    value: SelectValue | SelectValue[] | SelectLabeledValue | SelectLabeledValue[],
    option: SelectOption | SelectOption[] | undefined,
  ) => void;
  onSearch?: (value: string) => void;
  onSelect?: (value: SelectValue | SelectLabeledValue, option: SelectOption) => void;
  onDeselect?: (value: SelectValue | SelectLabeledValue, option: SelectOption) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
  onInputKeyDown?: (event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => void;
  onPopupScroll?: (event: UIEvent<HTMLDivElement>) => void;
}
