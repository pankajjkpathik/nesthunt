import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Shared application shell — Header, main content, Footer.
 * Every page renders inside this layout.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
