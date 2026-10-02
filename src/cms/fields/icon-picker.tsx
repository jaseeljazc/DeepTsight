"use client";

import * as React from "react";
import {
  Activity,
  Cable,
  Cog,
  Cpu,
  Gauge,
  Network,
  Router,
  Server,
  Split,
  Waypoints,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { FieldDescription, FieldError, useField } from "@payloadcms/ui";
import type { SelectFieldClientComponent } from "payload";
import type { serviceIconNames } from "../../content/schema";

/*
 * The service icon field: the same fixed set as a plain select, but each choice is drawn, so an
 * editor picks the icon they see rather than a name. A radio group underneath, so the keyboard
 * and screen readers behave as they do for any radio set. Styles: admin-theme.css (.dts-icon-pick).
 */

const ICONS: Record<(typeof serviceIconNames)[number], LucideIcon> = {
  Activity,
  Cable,
  Cog,
  Cpu,
  Gauge,
  Network,
  Router,
  Server,
  Split,
  Waypoints,
  Workflow,
  Wrench,
};

export const IconPicker: SelectFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError } = useField<string>({ path });
  const name = React.useId();
  const legend = typeof field.label === "string" ? field.label : "Icon";
  const options = field.options.map((option) =>
    typeof option === "string" ? option : option.value,
  );

  return (
    <fieldset
      className={`field-type dts-icon-pick${showError ? " error" : ""}`}
      id={`field-${path}`}
    >
      <legend className="dts-icon-pick__legend">
        {legend}
        {field.required && <span className="required"> *</span>}
      </legend>
      <div className="dts-icon-pick__grid">
        {options.map((option) => {
          const Icon = option in ICONS ? ICONS[option as keyof typeof ICONS] : undefined;
          return (
            <label key={option} className="dts-icon-pick__option">
              <input
                type="radio"
                className="dts-sr-only"
                name={name}
                value={option}
                checked={value === option}
                disabled={readOnly}
                onChange={() => setValue(option)}
              />
              <span className="dts-icon-pick__tile" aria-hidden="true">
                {Icon && <Icon />}
              </span>
              <span className="dts-icon-pick__name">{option}</span>
            </label>
          );
        })}
      </div>
      <FieldError path={path} showError={showError} />
      <FieldDescription description={field.admin?.description} path={path} />
    </fieldset>
  );
};
