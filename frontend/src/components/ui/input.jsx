import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Input — Yarnberri skin.
 *
 * Same approach as `button.jsx`: the composition contract (forwardRef,
 * `data-slot`, class merging) is kept, the shadcn token-based appearance is
 * not, because those CSS variables do not exist in this project.
 *
 * Native input accessibility is untouched — no `role`, no `aria-hidden`, no
 * removed label. Callers pass a real `id` / `aria-label` as before.
 *
 * Used by the search controls ONLY.
 */
const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    data-slot="input"
    className={cn("yarnberri-search-input", className)}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
