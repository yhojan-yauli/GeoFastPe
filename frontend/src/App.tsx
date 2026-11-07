
import { useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import MapSection from "./features/maps/components/MapSection";
import ProfilePage from "./pages/ProfilePage";
import SolidarityPage from "./pages/SolidarityPage";
import RequestHelpPage from "./pages/RequestHelpPage";

import { initialSolidarityPosts } from "./features/solidarity/data/solidarityData";
import type { SolidarityPost } from "./features/solidarity/types/solidarity.types";

export default function App() {
  const [currentPage, setCurrentPage] = useState("Inicio");
  const [posts, setPosts] = useState<SolidarityPost[]>(
    initialSolidarityPosts
  );

  const publishRequest = (post: SolidarityPost) => {
    setPosts((previous) => [post, ...previous]);
    setCurrentPage("Solidaridad");
  };

  return (
    <MainLayout
      currentPage={currentPage === "Solicitar ayuda" ? "Solidaridad" : currentPage}
      onNavigate={setCurrentPage}
    >
      {currentPage === "Mi Perfil" ? (
        <ProfilePage />
      ) : currentPage === "Solidaridad" ? (
        <SolidarityPage
          posts={posts}
          onRequestHelp={() => setCurrentPage("Solicitar ayuda")}
          onDonate={() => setCurrentPage("Solicitar ayuda")}
        />
      ) : currentPage === "Solicitar ayuda" ? (
        <RequestHelpPage
          onCancel={() => setCurrentPage("Solidaridad")}
          onPublish={publishRequest}
        />
      ) : (
        <MapSection />
      )}
    </MainLayout>
  );
}
