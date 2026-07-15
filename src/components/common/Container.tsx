import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Constrains content to a max width of 1280px with responsive gutters.
 */
export function Container({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
