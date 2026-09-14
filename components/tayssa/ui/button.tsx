import type { ComponentProps, ReactNode } from "react";
import { TransitionLink } from "@/components/tayssa/ui/transition";

type Variant = "line" | "solid" | "accent";
type Size = "md" | "sm" | "xs";

function classes(variant: Variant, size: Size, wide: boolean, extra?: string) {
  return [
    "ty-btn",
    variant === "solid" ? "ty-btn--solid" : variant === "accent" ? "ty-btn--accent" : "",
    size === "sm" ? "ty-btn--sm" : size === "xs" ? "ty-btn--xs" : "",
    wide ? "ty-btn--wide" : "",
    extra ?? "",
  ]
    .join(" ")
    .trim();
}

type Common = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  wide?: boolean;
  className?: string;
};

/** Botão (submit/click). */
export function TyButton({
  children,
  variant = "line",
  size = "md",
  arrow = false,
  wide = false,
  className,
  ...rest
}: Common & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button className={classes(variant, size, wide, className)} {...rest}>
      <span>{children}</span>
      {arrow ? <span className="ty-btn__arrow" aria-hidden /> : null}
    </button>
  );
}

/** Link interno com a cortina de transição. */
export function TyLinkButton({
  children,
  href,
  variant = "line",
  size = "md",
  arrow = false,
  wide = false,
  className,
  cursor,
}: Common & { href: string; cursor?: string }) {
  return (
    <TransitionLink
      href={href}
      className={classes(variant, size, wide, className)}
      data-cursor={cursor}
    >
      <span>{children}</span>
      {arrow ? <span className="ty-btn__arrow" aria-hidden /> : null}
    </TransitionLink>
  );
}

/** Link externo (WhatsApp, Instagram). */
export function TyExternalButton({
  children,
  href,
  variant = "line",
  size = "md",
  arrow = false,
  wide = false,
  className,
  cursor,
}: Common & { href: string; cursor?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes(variant, size, wide, className)}
      data-cursor={cursor}
    >
      <span>{children}</span>
      {arrow ? <span className="ty-btn__arrow" aria-hidden /> : null}
    </a>
  );
}
