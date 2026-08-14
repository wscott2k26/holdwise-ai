import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import CinematicBackdrop from "@/components/premium/CinematicBackdrop";

// Layout for the main authenticated app (post-onboarding).
export default function AppLayout() {
  return (
    <CinematicBackdrop intensity="normal" className="text-scale-root">
      <main className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </CinematicBackdrop>
  );
}
