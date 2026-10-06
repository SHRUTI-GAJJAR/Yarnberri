import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui AlertDialog — Yarnberri skin.
 *
 * WHY RADIX IS PRESENT AT ALL
 *
 * `button-group.jsx` documents this project's rule: do not install a primitive
 * runtime for a control that can be rendered natively. An alert dialog is the
 * deliberate exception. A modal needs a focus trap, Escape handling, scroll
 * lock, `aria-modal`, background inertness and focus restoration on close.
 * Hand-rolling those is a lot of subtle code, and the failure mode is a dialog
 * that traps a keyboard user with no way out - worse than no dialog at all. So
 * Radix keeps the behaviour and Yarnberri keeps the appearance.
 *
 * NOTE ON BASE UI vs RADIX
 *
 * `npx shadcn add alert-dialog` installed the RADIX variant
 * (`@radix-ui/react-alert-dialog`) because `components.json` has no base
 * registry configured. The Base UI variant instead composes with a `render`
 * prop (`<AlertDialogTrigger render={<Button />} />`); Radix uses `asChild`.
 * Radix is what is installed and what is used below. Either way the trigger
 * here is a plain `<button>` carrying `yb-logout-btn`, so nothing here depends
 * on that difference - swapping to Base UI later is a one-line change.
 *
 * WHAT WAS REMOVED FROM THE GENERATED FILE
 *
 * The file the CLI wrote could not have rendered correctly here. Three reasons:
 *
 *  1. It styled `AlertDialogAction` and `AlertDialogCancel` with
 *     `buttonVariants()` / `buttonVariants({ variant: "outline" })` from
 *     `@/components/ui/button`. That module's only variants are `ghost` and
 *     `subtle`, both sized as navbar search-icon squares - and `outline` does
 *     not exist in it at all. The dialog's buttons would have rendered as
 *     search icons.
 *  2. It used `bg-oklch(1 0 0)`, `border-oklch(...)` and `text-oklch(...)`.
 *     Those are neutral greys, and `components.json` sets
 *     `cssVariables: false`, so none of the shadcn palette this file assumes
 *     exists in Yarnberri.
 *  3. It used `animate-in`, `fade-in-0`, `zoom-in-95` and `slide-in-from-*`.
 *     Those come from the `tailwindcss-animate` plugin, which is NOT installed
 *     - `tailwind.config.js` has `plugins: []`. Every one of those classes was
 *     dead on arrival.
 *
 * Same approach as `button.jsx` / `input.jsx`: keep the composition contract
 * (Radix primitives, ref forwarding, `data-slot`, class merging), drop the
 * shadcn appearance in favour of `yb-*` classes resolved from the brand tokens.
 * The enter/exit transitions are written as real CSS transitions keyed off
 * `data-state`, which is why no animation plugin is needed.
 *
 * The look is declared in `src/styles/crochet.css` under "LOGOUT ALERT DIALOG".
 * The overlay and content are portalled to `document.body`, so those rules are
 * deliberately NOT scoped to `.yb-header` or `.yb-home-page` - the dialog is not
 * a descendant of either.
 */
const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    data-slot="alert-dialog-overlay"
    className={cn("yb-alert-overlay", className)}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      data-slot="alert-dialog-content"
      className={cn("yb-alert-content", className)}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }) => (
  <div data-slot="alert-dialog-header" className={cn("yb-alert-header", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }) => (
  <div data-slot="alert-dialog-footer" className={cn("yb-alert-footer", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="alert-dialog-title"
    className={cn("yb-alert-title", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn("yb-alert-description", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    data-slot="alert-dialog-action"
    className={cn("yb-alert-action", className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    data-slot="alert-dialog-cancel"
    className={cn("yb-alert-cancel", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};