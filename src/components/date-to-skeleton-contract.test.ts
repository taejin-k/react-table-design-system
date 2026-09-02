/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";
import ts from "typescript";
import { Calendar, DatePicker, Menu, Skeleton, TimePicker } from "../index";
import * as calendarStories from "./Calendar/Calendar.stories";
import * as datePickerStories from "./DatePicker/DatePicker.stories";
import * as menuStories from "./Menu/Menu.stories";
import * as skeletonStories from "./Skeleton/Skeleton.stories";
import * as timePickerStories from "./TimePicker/TimePicker.stories";
import type {
  CalendarCellInfo,
  CalendarEvent,
  CalendarHeaderConfig,
  CalendarProps,
  DatePickerModeType,
  DatePickerPlacementType,
  DatePickerPreset,
  DatePickerProps,
  DatePickerShowTime,
  DatePickerSizeType,
  DatePickerValueType,
  DatePickerVariantType,
  DateRangePickerProps,
  DateRangePreset,
  DateRangeValueType,
  DisabledTime,
  MenuClickInfo,
  MenuItemKindType,
  MenuItemType,
  MenuModeType,
  MenuProps,
  MenuSelectInfo,
  MenuTriggerType,
  SkeletonComponent,
  SkeletonElementProps,
  SkeletonShapeType,
  TimePickerCellInfo,
  TimePickerPlacementType,
  TimePickerProps,
  TimePickerSizeType,
  TimePickerValueType,
  TimePickerVariantType,
} from "../index";

type PublicTypes =
  | CalendarCellInfo
  | CalendarEvent
  | CalendarHeaderConfig
  | CalendarProps
  | DatePickerModeType
  | DatePickerPlacementType
  | DatePickerPreset
  | DatePickerProps
  | DatePickerShowTime
  | DatePickerSizeType
  | DatePickerValueType
  | DatePickerVariantType
  | DateRangePickerProps
  | DateRangePreset
  | DateRangeValueType
  | DisabledTime
  | MenuClickInfo
  | MenuItemKindType
  | MenuItemType
  | MenuModeType
  | MenuProps
  | MenuSelectInfo
  | MenuTriggerType
  | SkeletonComponent
  | SkeletonElementProps
  | SkeletonShapeType
  | TimePickerCellInfo
  | TimePickerPlacementType
  | TimePickerProps
  | TimePickerSizeType
  | TimePickerValueType
  | TimePickerVariantType;

const componentSources = import.meta.glob<string>(
  [
    "./DatePicker/DatePicker.tsx",
    "./TimePicker/TimePicker.tsx",
    "./Calendar/Calendar.tsx",
    "./Menu/Menu.tsx",
    "./Skeleton/Skeleton.tsx",
  ],
  { eager: true, import: "default", query: "?raw" },
);

const storyModules = {
  Calendar: calendarStories,
  DatePicker: datePickerStories,
  Menu: menuStories,
  Skeleton: skeletonStories,
  TimePicker: timePickerStories,
};

describe("DatePicker through Skeleton component contracts", () => {
  it("does not include screen-reader-specific attributes", () => {
    for (const source of Object.values(componentSources)) {
      expect(source).not.toMatch(/\baria(?:-|[A-Z])|\brole\s*=|\btabIndex\s*=/);
    }
  });

  it("exports every public component and supporting type from the package root", () => {
    expect([DatePicker, TimePicker, Calendar, Menu, Skeleton]).toHaveLength(5);
    const acceptsPublicType = <_Type>() => true;
    expect(acceptsPublicType<PublicTypes>()).toBe(true);
  });

  it("gives every story standalone, syntactically valid Show code", () => {
    for (const [componentName, stories] of Object.entries(storyModules)) {
      for (const [storyName, story] of Object.entries(stories)) {
        if (storyName === "default" || typeof story !== "object" || story === null) continue;
        const code = (story as { parameters?: { docs?: { source?: { code?: unknown } } } })
          .parameters?.docs?.source?.code;

        expect(code, `${componentName}.${storyName}`).toBeTypeOf("string");
        const result = ts.transpileModule(code as string, {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
          reportDiagnostics: true,
        });
        const syntaxErrors = (result.diagnostics ?? []).filter(
          (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
        );
        expect(syntaxErrors, `${componentName}.${storyName}`).toEqual([]);
      }
    }
  });
});
