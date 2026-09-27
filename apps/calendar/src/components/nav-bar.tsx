"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { authClient } from "@family/auth/client";
import { MobileSidebar } from "@/components/mobile-sidebar";

export function NavBar() {
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="calendar-nav flex items-center justify-between border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label={t("openMenu")}
          onClick={() => setMenuOpen(true)}
          className="calendar-icon-button rounded-md border px-2 py-1 text-lg"
        >
          ☰
        </button>
        <div className="calendar-brand">Calendrier</div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="hidden items-center gap-3 md:flex">
        <button type="button" onClick={async () => { await authClient.signOut(); window.open(`${process.env.NEXT_PUBLIC_PORTAL_AUTH_URL ?? "http://localhost:3100"}/login`, "_self"); }} className="calendar-text-button">
          {t("logout")}
        </button>
        </div>
      </div>
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
