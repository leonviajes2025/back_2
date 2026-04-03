import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API RESTful",
  description: "Backend Next.js con Prisma y PostgreSQL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
