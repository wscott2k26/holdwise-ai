import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
// Layout for the main authenticated app (post-onboarding).
export default function AppLayout() {
  return (
    <div className="min-h-screen hw-felt-bg text-scale-root">
      <main className="pb-20 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}