import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui class merger.
 *
 * `clsx` flattens conditional class arguments, `tailwind-merge` resolves
 * conflicting Tailwind utilities so a caller-supplied class always wins over
 * a component's own default.
 *
 * Imported as `@/lib/utils` to match the path shadcn's CLI writes, which is
 * why the `@` alias exists in `vite.config.js`.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
