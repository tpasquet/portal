"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@family/auth/client";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError("Adresse e-mail ou mot de passe incorrect.");
        return;
      }
      const requestedUrl = new URLSearchParams(window.location.search).get("next");
      let destination = "/";
      if (requestedUrl) {
        const parsedUrl = new URL(requestedUrl, window.location.origin);
        if (parsedUrl.origin === window.location.origin) {
          destination = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
        }
      }
      router.push(destination);
      router.refresh();
    } catch {
      setError("Le service de connexion est momentanément indisponible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="portal-shell login-shell">
      <div className="portal-header">
        <div>
          <p className="eyebrow">Espace privé</p>
          <h1>Le portail familial</h1>
        </div>
      </div>
      <form className="login-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Connexion</p>
          <h2>Bienvenue à la maison.</h2>
        </div>
        <label>
          <span>Adresse e-mail</span>
          <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          <span>Mot de passe</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}