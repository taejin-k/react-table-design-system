import { useEffect, useRef, useState, type ReactNode } from "react";

export type ErrorMessageValidator<Value> = (value: Value) => string | Promise<string>;
export type ValidatableErrorMessage<Value> = ReactNode | ErrorMessageValidator<Value>;

function getInitialValidationError<Value>(
  validator: ErrorMessageValidator<Value> | undefined,
  value: Value,
): string {
  if (!validator || validator.constructor.name === "AsyncFunction") return "";
  try {
    const result = validator(value);
    if (typeof result === "string") return result;
    // A regular function may also return a Promise. Initial async results are
    // intentionally not displayed, but their rejections must still be handled.
    void result.catch(() => undefined);
  } catch {
    // Match the existing rejected-async-validation behavior.
  }
  return "";
}

export function useErrorMessageValidation<Value>(
  errorMessage: ValidatableErrorMessage<Value> | undefined,
  initialValue: Value,
) {
  const validator = typeof errorMessage === "function" ? errorMessage : undefined;
  const validationRequestRef = useRef(0);
  const [validation, setValidation] = useState(() => ({
    validator,
    message: getInitialValidationError(validator, initialValue),
  }));
  const displayedErrorMessage = validator
    ? validation.validator === validator
      ? validation.message
      : validation.message
        ? getInitialValidationError(validator, initialValue)
        : ""
    : typeof errorMessage === "function"
      ? undefined
      : errorMessage;

  useEffect(
    () => () => {
      validationRequestRef.current += 1;
    },
    [validator],
  );

  const setValidationError = (message: string) => setValidation({ validator, message });

  const clearValidationError = () => {
    validationRequestRef.current += 1;
    setValidationError("");
  };

  const validateErrorMessage = (value: Value) => {
    if (!validator) return;
    const requestId = ++validationRequestRef.current;
    setValidationError("");
    let result: string | Promise<string>;
    try {
      result = validator(value);
    } catch {
      return;
    }

    if (typeof result === "string") {
      setValidationError(result);
      return;
    }

    void result
      .then((nextError) => {
        if (validationRequestRef.current === requestId) setValidationError(nextError);
      })
      .catch(() => {
        if (validationRequestRef.current === requestId) setValidationError("");
      });
  };

  return {
    clearValidationError,
    displayedErrorMessage,
    hasError: Boolean(displayedErrorMessage),
    validateErrorMessage,
  };
}
