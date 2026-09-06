import type { FocusEvent, Key, KeyboardEvent, ReactNode, UIEvent } from "react";
import type { InputSizeType } from "../Input";
import type { TagColorType } from "../Tag";
import type { ValidatableErrorMessage } from "../_internal/useErrorMessageValidation";

export type SelectModeType = "multiple" | "tags";
export type SelectSizeType = InputSizeType;
export type SelectPlacementType = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type SelectVariantType = "default" | "filled";
export type SelectValueType = Key | Key[] | undefined;
export type SelectErrorMessage = ValidatableErrorMessage<SelectValueType>;

export interface SelectBasicProps {
  value: Key;
  label: ReactNode;
}

export interface SelectOption {
  label?: ReactNode;
  value?: Key;
  color?: TagColorType;
  disabled?: boolean;
  options?: SelectOption[];
  [key: string]: unknown;
}

export interface SelectTagProps {
  label: ReactNode;
  value: Key;
  color?: TagColorType;
  closable: boolean;
  onClose: () => void;
}

export interface SelectRef {
  focus: () => void;
  blur: () => void;
}

interface SelectCommonProps {
  options: SelectOption[];
  placeholder?: ReactNode;
  size?: SelectSizeType;
  variant?: SelectVariantType;
  width?: number;
  label?: ReactNode;
  errorMessage?: SelectErrorMessage;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  filterOption?: (inputValue: string, option: SelectOption) => boolean;
  optionsSort?: (
    optionA: SelectOption,
    optionB: SelectOption,
    info: { searchValue: string },
  ) => number;
  optionFilterProp?: string | string[];
  optionLabelProp?: string;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: SelectPlacementType;
  notFoundContent?: ReactNode;
  listHeight?: number;
  loading?: boolean;
  maxSelectedCount?: number;
  maxVisibleTagCount?: number | "responsive";
  maxTagTextLength?: number;
  closable?: boolean;
  popupMatchWidth?: boolean | number;
  tagSeparators?: string[];
  virtual?: boolean;
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  popupRender?: (originNode: ReactNode) => ReactNode;
  tagRender?: (props: SelectTagProps) => ReactNode;
  labelRender?: (props: SelectBasicProps) => ReactNode;
  className?: string;
  onSearch?: (value: string) => void;
  onSelect?: (value: Key, option: SelectOption) => void;
  onDeselect?: (value: Key, option: SelectOption) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
  onFocus?: (event: FocusEvent<HTMLButtonElement | HTMLInputElement | HTMLDivElement>) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement | HTMLInputElement | HTMLDivElement>) => void;
  onInputKeyDown?: (
    event: KeyboardEvent<HTMLButtonElement | HTMLInputElement | HTMLDivElement>,
  ) => void;
  onPopupScroll?: (event: UIEvent<HTMLDivElement>) => void;
}

interface SelectSingleValueProps {
  mode?: undefined;
  value?: Key;
  defaultValue?: Key;
  onChange?: (value: Key | undefined, option: SelectOption | undefined) => void;
}

interface SelectMultipleValueProps {
  mode: SelectModeType;
  value?: Key[];
  defaultValue?: Key[];
  onChange?: (value: Key[], option: SelectOption[]) => void;
}

export type SelectProps = SelectCommonProps & (SelectSingleValueProps | SelectMultipleValueProps);
