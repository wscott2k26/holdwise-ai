import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, BookOpen, Spade, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/appContext";
import { hapticPulse, playSoundEffect } from "@/lib/haptics";
import GlassSurface from "@/components/premium/GlassSurface";

const MotionNavLink = motion(NavLink);

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/practice/video-poker", label: "Practice", icon: Spade },
  { to: "/academy", label: "Academy", icon: GraduationCap },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const { accessibility, settings } = useApp();
  return (
    <div className="nav-bottom fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))]">
      <GlassSurface
        as="nav"
        strength={3}
        variant="interactive"
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-2xl items-stretch justify-around overflow-hidden rounded-[1.35rem] px-1 shadow-2xl"
      >
        {items.map(({ to, label, icon: Icon }) => (
          <MotionNavLink
            key={to}
            to={to}
            onClick={() => {
              hapticPulse(accessibility.haptics, 12, "selection");
              playSoundEffect(settings.soundEffects !== false, "selection");
            }}
            whileTap={accessibility.reducedMotion ? { opacity: 0.86 } : { y: 2, scale: 0.98 }}
            transition={accessibility.reducedMotion ? { duration: 0.01 } : { type: "spring", stiffness: 500, damping: 34 }}
            className={({ isActive }) =>
              cn(
                "relative flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium transition-colors",
                isActive ? "hw-gold-text" : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn("absolute top-0 h-0.5 w-7 rounded-full transition-opacity", isActive ? "bg-[hsl(var(--hw-gold))] opacity-100" : "opacity-0")} />
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} className={cn(isActive && !accessibility.reducedMotion && "-translate-y-0.5")} />
                <span>{label}</span>
              </>
            )}
          </MotionNavLink>
        ))}
      </GlassSurface>
    </div>
  );
}
