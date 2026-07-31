import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Firmas de Audiencias — CARD Ankawa Internacional",
    template: "%s — CARD Ankawa Internacional",
  },
  description:
    "Sistema de firmas digitales de actas de audiencia del Centro de Arbitraje y Resolución de Disputas Ankawa Internacional, Cusco, Perú.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${archivo.variable} ${publicSans.variable} flex min-h-full flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
