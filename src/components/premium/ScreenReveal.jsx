import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";

export default function ScreenReveal({ children, className = "" }) {
  return <div className={cn("relative", className)}>{children}</div>;
}

export function RevealItem({ children, order = 0, className = "" }) {
  const { accessibility } = useApp();
  const reduced = accessibility.reducedMotion;
  const delay = Math.min(Math.max(order, 0) * 0.055, 0.165);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.28, delay: reduced ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
