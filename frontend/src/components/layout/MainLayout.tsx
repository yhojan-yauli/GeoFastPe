import { useState } from "react";
import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Menú lateral */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <div className="min-h-screen lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
