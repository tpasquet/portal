import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { CalendarPreferencesProvider } from "@/components/calendar-preferences";
import { NavBar } from "@/components/nav-bar";
import { SettingsView } from "@/components/settings-view";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect(`${process.env.BETTER_AUTH_URL ?? "http://localhost:3100"}/login?next=${encodeURIComponent(process.env.CALENDAR_URL ?? "http://localhost:3100/calendar")}`);

  return (
    <CalendarPreferencesProvider>
      <div className="flex min-h-full flex-1 flex-col">
        <NavBar />
        <SettingsView />
      </div>
    </CalendarPreferencesProvider>
  );
}
