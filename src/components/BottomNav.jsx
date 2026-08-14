import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Spade, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/practice/video-poker", label: "Practice", icon: Spade },
  { to: "/academy", label: "Academy", icon: GraduationCap },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="nav-bottom fixed bottom-0 inset-x-0 z-40 h-16 hw-glass border-t flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              isActive ? "hw-gold-text" : "text-muted-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}