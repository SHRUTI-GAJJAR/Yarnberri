import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Button — Yarnberri skin.
 *
 * Only the composition contract is kept from the upstream component
 * (CVA variants, `forwardRef`, `data-slot`, ref forwarding). The look is
 * deliberately NOT the shadcn default: shadcn resolves its colours from
 * `--background` / `--foreground` / `--primary` CSS variables, which this
 * project does not define, so its buttons would render unstyled or fall back
 * to a neutral grey that does not exist in the brand.
 *
 * Instead every variant points at Yarnberri's own tokens, which are already
 * declared in `src/styles/globals.css`. `styles/search.css` owns the actual
 * declarations for these classes.
 *
 * IMPORTANT: this button is used by the search controls ONLY. Nothing here is
 * a global `button` rule, so Add to Cart, Checkout, Admin, Login/Register and
 * filter pills keep their existing styling untouched.
 */
const buttonVariants = cva("yarnberri-search-btn", {
  variants: {
    variant: {
      /** Leading magnifier / trailing clear. Transparent; the group supplies the fill. */
      ghost: "yarnberri-search-btn-ghost",
      /** Neutral secondary action inside a search group. */
      subtle: "yarnberri-search-btn-subtle",
    },
    size: {
      /** Matches the 38px Yarnberri navbar action square. */
      icon: "yarnberri-search-btn-icon",
      /** Matches the 34px small-phone navbar action square. */
      iconSm: "yarnberri-search-btn-icon-sm",
    },
  },
  defaultVariants: {
    variant: "ghost",
    size: "icon",
  },
});

const Button = React.forwardRef(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button, buttonVariants };
