import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { CalendarView } from "@/components/calendar-view";
import { NavBar } from "@/components/nav-bar";
import { CalendarPreferencesProvider } from "@/components/calendar-preferences";

export default async function HomePage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect(`${process.env.BETTER_AUTH_URL ?? "http://localhost:3100"}/login?next=${encodeURIComponent(process.env.CALENDAR_URL ?? "http://localhost:3100/calendar")}`);
  }

  return (
    <CalendarPreferencesProvider>
      <div className="flex min-h-full flex-1 flex-col">
        <NavBar />
        <main className="flex-1 p-4">
          <CalendarView />
        </main>
      </div>
    </CalendarPreferencesProvider>
  );
}
