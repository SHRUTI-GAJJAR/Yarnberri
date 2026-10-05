import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Button Group.
 *
 *   ButtonGroup
 *   ├── Button | Input
 *   ├── ButtonGroupSeparator
 *   └── ButtonGroupText
 *
 * `role="group"` plus `aria-label` is the documented accessibility contract
 * for this component, and Tab moves between the members natively.
 *
 * Upstream this primitive wraps Base UI's `<ButtonGroup>`, which adds optional
 * arrow-key roving focus between members. Yarnberri does not install Base UI
 * for a two-member control, so the group is rendered directly: the documented
 * contract (role, label, Tab order) is preserved and the runtime stays
 * dependency-free.
 *
 * `orientation` is still part of the public API. Tailwind v3.4 cannot target a
 * `data-orientation` attribute from a static class, so the selector is written
 * with an explicit `[data-orientation="vertical"]` attribute and lives in
 * `src/styles/search.css` alongside the rest of the Yarnberri skin.
 */
function ButtonGroup({ className, orientation = "horizontal", ...props }) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn("yarnberri-search-group", className)}
      {...props}
    />
  );
}

/**
 * Visually divides members of a group.
 *
 * The upstream shadcn separator is a Base UI `Separator` with
 * `role="separator"`. Here the hairline between the text field and the clear
 * button is purely decorative, so it is hidden from assistive tech instead of
 * advertising a non-interactive separator.
 */
function ButtonGroupSeparator({ className, ...props }) {
  return (
    <div
      data-slot="button-group-separator"
      aria-hidden="true"
      className={cn("yarnberri-search-group-separator", className)}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator };
