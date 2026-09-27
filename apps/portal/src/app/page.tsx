import { getAuthSession } from "@family/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const apps = [
  {
    name: "Calendrier",
    description: "Organiser les rendez-vous et les événements de la famille.",
    href: process.env.CALENDAR_URL ?? "http://localhost:3100/calendar",
    status: "Disponible",
  },
];

export default async function PortalPage() {
  const session = await getAuthSession(await headers());
  if (!session?.user) redirect("/login");

  return (
    <main className="portal-shell">
      <header className="portal-header">
        <div>
          <p className="eyebrow">Espace privé</p>
          <h1>Le portail familial</h1>
        </div>
        <span className="connection-state">{session.user.name ?? session.user.email}</span>
      </header>

      <section className="welcome-block" aria-labelledby="welcome-title">
        <p className="eyebrow">Vos applications</p>
        <h2 id="welcome-title">Tout ce qui compte, au même endroit.</h2>
        <p className="intro">
          Les services de la famille seront accessibles depuis cet espace sécurisé.
        </p>
      </section>

      <section className="app-grid" aria-label="Applications disponibles">
        {apps.map((app) => (
          <a className="app-card" href={app.href} key={app.name}>
            <span className="app-icon" aria-hidden="true">CA</span>
            <span className="app-card-content">
              <span className="app-name">{app.name}</span>
              <span className="app-description">{app.description}</span>
              <span className="app-status">{app.status}</span>
            </span>
            <span className="app-arrow" aria-hidden="true">-&gt;</span>
          </a>
        ))}
      </section>

      <footer className="portal-footer">Accès réservé aux membres autorisés</footer>
    </main>
  );
}
