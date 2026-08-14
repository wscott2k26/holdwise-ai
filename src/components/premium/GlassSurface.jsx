import React from "react";
import { cn } from "@/lib/utils";

const STRENGTH = {
  1: "hw-glass-1",
  2: "hw-glass-2",
  3: "hw-glass-3",
  4: "hw-glass-4",
  5: "hw-glass-5",
};

const VARIANT = {
  passive: "",
  interactive: "hw-glass-interactive",
  selected: "hw-glass-selected",
  modal: "hw-glass-modal",
};

export default function GlassSurface({
  children,
  strength = 2,
  variant = "passive",
  goldEdge = false,
  as: Component = "div",
  className = "",
  ...props
}) {
  return (
    <Component
      className={cn(
        STRENGTH[strength] || STRENGTH[2],
        VARIANT[variant] || "",
        goldEdge && "hw-gold-border",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
