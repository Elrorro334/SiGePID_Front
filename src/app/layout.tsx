import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SiGePID | E-commerce B2C & B2B",
  description: "Plataforma inteligente de recomendación y venta de productos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Toaster position="bottom-right" />
        
        {/* Simple Footer */}
        <footer className="bg-surface border-t border-surface-border mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-content-muted text-sm">
              &copy; {new Date().getFullYear()} SiGePID. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
