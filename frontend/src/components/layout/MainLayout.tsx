import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function MainLayout({
  children,
  currentPage,
  onNavigate,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      <div className="min-h-screen lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
