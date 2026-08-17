import type { FocusEvent, KeyboardEvent, ReactNode, UIEvent } from "react";
import type { InputSize } from "../Input";
import type { TagColor } from "../Tag";

export type SelectValue = string | number;
export type SelectMode = "multiple" | "tags";
export type SelectPlacement = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type SelectVariant = "default" | "filled";

export interface SelectLabeledValue {
  value: SelectValue;
  label: ReactNode;
}

export interface SelectOption {
  label?: ReactNode;
  value?: SelectValue;
  color?: TagColor;
  disabled?: boolean;
  options?: SelectOption[];
  [key: string]: unknown;
}

export interface SelectTagRenderProps {
  label: ReactNode;
  value: SelectValue;
  color?: TagColor;
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
  width?: number;
  label?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  filterOption?: boolean | ((inputValue: string, option: SelectOption) => boolean);
  optionsSort?: (
    optionA: SelectOption,
    optionB: SelectOption,
    info: { searchValue: string },
  ) => number;
  optionFilterProp?: string | string[];
  optionLabelProp?: string;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: SelectPlacement;
  notFoundContent?: ReactNode;
  labelInValue?: boolean;
  listHeight?: number;
  loading?: boolean;
  maxSelectedCount?: number;
  maxVisibleTagCount?: number | "responsive";
  hiddenTagsPlaceholder?: ReactNode | ((omittedValues: SelectLabeledValue[]) => ReactNode);
  maxTagTextLength?: number;
  closable?: boolean;
  popupMatchSelectWidth?: boolean | number;
  tagSeparators?: string[] | ((input: string) => string[]);
  virtual?: boolean;
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  popupRender?: (originNode: ReactNode) => ReactNode;
  tagRender?: (props: SelectTagRenderProps) => ReactNode;
  labelRender?: (props: SelectLabeledValue) => ReactNode;
  className?: string;
  onChange?: (
    value: SelectValue | SelectValue[] | SelectLabeledValue | SelectLabeledValue[] | undefined,
    option: SelectOption | SelectOption[] | undefined,
  ) => void;
  onSearch?: (value: string) => void;
  onSelect?: (value: SelectValue | SelectLabeledValue, option: SelectOption) => void;
  onDeselect?: (value: SelectValue | SelectLabeledValue, option: SelectOption) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
  onFocus?: (event: FocusEvent<HTMLButtonElement | HTMLInputElement | HTMLDivElement>) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement | HTMLInputElement | HTMLDivElement>) => void;
  onInputKeyDown?: (
    event: KeyboardEvent<HTMLButtonElement | HTMLInputElement | HTMLDivElement>,
  ) => void;
  onPopupScroll?: (event: UIEvent<HTMLDivElement>) => void;
}
