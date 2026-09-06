import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import {
  DatePicker,
  TimePicker,
  Input,
  ColorPicker,
  Tooltip,
  Upload,
  Modal,
  Drawer,
  message,
  notification,
} from "../../index";

afterEach(() => {
  cleanup();
  message.destroy();
  notification.destroy();
  Modal.destroyAll();
});

it("cancels static calls before their hosts mount and settles pending handles", async () => {
  let handle!: ReturnType<typeof message.open>;
  let modal!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = message.open({ key: "early", content: "cancelled message", duration: 0 });
    message.destroy("early");
    notification.open({ key: "early", title: "cancelled notification", description: "cancelled", duration: 0 });
    notification.destroy("early");
    modal = Modal.confirm({ title: "cancelled modal" });
    Modal.destroyAll();
    Modal.confirm({ title: "new modal" });
  });
  await act(async () => {
    expect(await handle).toBe(false);
    expect(await modal).toBe(false);
  });
  expect(await screen.findByText("new modal")).toBeTruthy();
  expect(screen.queryByText("cancelled modal")).toBeNull();
  expect(screen.queryByText("cancelled message")).toBeNull();
  expect(screen.queryByText("cancelled notification")).toBeNull();
});

it.each([false, true])("blocks all-disabled times (DatePicker=%s)", (datePicker) => {
  const onChange = vi.fn();
  const disabledTime = () => ({ disabledHours: () => Array.from({ length: 24 }, (_, i) => i) });
  render(
    datePicker ? (
      <DatePicker defaultOpen showTime={{ disabledTime }} onChange={onChange} />
    ) : (
      <TimePicker defaultOpen needConfirm disabledTime={disabledTime} onChange={onChange} />
    ),
  );
  const confirm = screen.getByRole("button", { name: "확인" });
  expect(confirm).toBeDisabled();
  fireEvent.click(confirm);
  expect(onChange).not.toHaveBeenCalled();
});

it.each([false, true])("rejects disabled presets (range=%s)", async (range) => {
  const onChange = vi.fn();
  render(
    range ? (
      <DatePicker.RangePicker
        defaultOpen
        disabledDate={() => true}
        presets={[{ label: "blocked", value: [dayjs("2026-01-01"), dayjs("2026-01-02")] }]}
        onChange={onChange}
      />
    ) : (
      <DatePicker
        defaultOpen
        disabledDate={() => true}
        presets={[{ label: "blocked", value: dayjs("2026-01-01") }]}
        onChange={onChange}
      />
    ),
  );
  fireEvent.click(screen.getByText("빠른 선택"));
  fireEvent.click(await screen.findByText("blocked"));
  expect(onChange).not.toHaveBeenCalled();
});

it("rejects invalid channels but accepts a corrected RGB value", () => {
  const onChange = vi.fn();
  render(<ColorPicker defaultOpen defaultFormat="rgb" onChange={onChange} />);
  const input = screen.getByRole("textbox");
  fireEvent.focus(input);
  for (const value of ["rgb(999, 0, 0)", "rgba(1, 2, 3, 2)", "rgb(1..2, 0, 0)"]) {
    fireEvent.change(input, { target: { value } });
  }
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "rgb(255, 0, 0)" } });
  expect(onChange).toHaveBeenLastCalledWith("#ff0000");
});

it("keeps inline validation on an unrelated parent render", () => {
  function Example({ tick }: { tick: number }) {
    return (
      <>
        <span>{tick}</span>
        <Input defaultValue="bad" errorMessage={(value) => (value === "bad" ? "invalid" : "")} />
      </>
    );
  }
  const view = render(<Example tick={0} />);
  view.rerender(<Example tick={1} />);
  expect(screen.getByText("invalid")).toBeTruthy();
});

it("uses readable text for opaque eight-digit black", async () => {
  render(
    <Tooltip open color="#000000ff" title="contrast">
      <button>trigger</button>
    </Tooltip>,
  );
  expect((await screen.findByText("contrast")).parentElement?.style.color).toBe(
    "var(--color-white)",
  );
});

it("blocks disabled Upload descendant callbacks and sets a compatible inert attribute", () => {
  const onClick = vi.fn();
  const view = render(
    <Upload disabled>
      <button onClick={onClick}>upload</button>
    </Upload>,
  );
  expect(view.container.querySelector("[data-upload-trigger]")).toHaveAttribute("inert");
  fireEvent.click(screen.getByText("upload"));
  expect(onClick).not.toHaveBeenCalled();
  view.rerender(
    <Upload>
      <button onClick={onClick}>upload</button>
    </Upload>,
  );
  expect(view.container.querySelector("[data-upload-trigger]")).not.toHaveAttribute("inert");
});

it.each([false, true])(
  "keeps focus trapping independent of Escape closing (drawer=%s)",
  async (drawer) => {
    const close = vi.fn();
    render(
      drawer ? (
        <Drawer open keyboard={false} onClose={close}>
          <a href="#first">first</a>
          <button>last</button>
        </Drawer>
      ) : (
        <Modal open keyboard={false} onCancel={close} footer={() => null}>
          <a href="#first">first</a>
          <button>last</button>
        </Modal>
      ),
    );
    const last = await screen.findByText("last");
    await waitFor(() => expect(last.closest('[tabindex="-1"]')).toBeTruthy());
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByText("first"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(close).not.toHaveBeenCalled();
  },
);
