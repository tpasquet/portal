import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portail familial",
  description: "Accès privé aux applications de la famille",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
