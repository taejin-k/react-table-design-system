import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  useErrorMessageValidation,
  type ValidatableErrorMessage,
} from "./useErrorMessageValidation";

describe("error message validation lifecycle", () => {
  it("clears an old validation error when the validator is removed or replaced", () => {
    const { result, rerender } = renderHook(
      ({ error }: { error?: ValidatableErrorMessage<string> }) =>
        useErrorMessageValidation(error, ""),
      { initialProps: { error: (() => "기존 오류") as ValidatableErrorMessage<string> } },
    );
    expect(result.current.displayedErrorMessage).toBe("기존 오류");
    rerender({ error: undefined });
    expect(result.current.hasError).toBe(false);
    rerender({ error: "직접 지정한 오류" });
    expect(result.current.displayedErrorMessage).toBe("직접 지정한 오류");
    rerender({ error: () => "새 오류" });
    expect(result.current.displayedErrorMessage).toBe("새 오류");
    act(() => result.current.validateErrorMessage(""));
    expect(result.current.displayedErrorMessage).toBe("새 오류");
  });

  it("ignores a pending response after the validator changes", async () => {
    let resolve!: (message: string) => void;
    const oldValidator = async () =>
      new Promise<string>((r) => {
        resolve = r;
      });
    const { result, rerender } = renderHook(({ error }) => useErrorMessageValidation(error, ""), {
      initialProps: { error: oldValidator },
    });
    act(() => result.current.validateErrorMessage("old"));
    rerender({ error: async () => "새 오류" });
    await act(async () => resolve("오래된 응답"));
    expect(result.current.hasError).toBe(false);
  });

  it("handles rejected Promises returned by non-async functions on mount", async () => {
    const { result } = renderHook(() =>
      useErrorMessageValidation(() => Promise.reject(new Error("offline")), ""),
    );
    await act(async () => {});
    expect(result.current.hasError).toBe(false);
  });

  it("handles thrown validators consistently with rejected async validators", () => {
    const { result } = renderHook(() =>
      useErrorMessageValidation(() => {
        throw new Error("offline");
      }, ""),
    );
    expect(() => act(() => result.current.validateErrorMessage(""))).not.toThrow();
    expect(result.current.hasError).toBe(false);
  });
});
