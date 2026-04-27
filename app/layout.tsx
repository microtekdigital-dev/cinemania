import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Cinemanía - Ver Películas Online",
  description: "Ver películas y series online gratis en español",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
