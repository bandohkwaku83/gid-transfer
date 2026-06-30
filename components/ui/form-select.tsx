"use client";

import { Select, type SelectProps } from "antd";
import { onboardingAntSelectClassName } from "@/lib/onboarding-field-styles";
import { cn } from "@/lib/utils";

const FORM_SELECT_CLASS =
  "w-full [&_.ant-select-selector]:!min-h-11 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-zinc-200 [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!px-4 [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!text-sm [&_.ant-select-selection-item]:!text-zinc-900 [&_.ant-select-selector:hover]:!border-zinc-300 dark:[&_.ant-select-selector]:!border-zinc-700 dark:[&_.ant-select-selector]:!bg-zinc-950 dark:[&_.ant-select-selection-item]:!text-zinc-100";

type FormSelectProps<Value extends string = string> = SelectProps<Value> & {
  className?: string;
  appearance?: "default" | "onboarding";
};

/** Ant Design select styled for dashboard forms and modals. */
export function FormSelect<Value extends string = string>({
  className,
  appearance = "default",
  size,
  ...props
}: FormSelectProps<Value>) {
  const resolvedSize = size ?? (appearance === "onboarding" ? "middle" : undefined);

  return (
    <Select<Value>
      size={resolvedSize}
      className={cn(
        appearance === "onboarding" ? onboardingAntSelectClassName : FORM_SELECT_CLASS,
        className,
      )}
      {...props}
    />
  );
}
