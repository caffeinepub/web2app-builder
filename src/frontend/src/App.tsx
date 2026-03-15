import LoginCard from "@/components/LoginCard";
import Sidebar, { MobileMenuButton } from "@/components/Sidebar";
import type { Page } from "@/components/Sidebar";
import TutorialDialog from "@/components/TutorialDialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import Builder from "@/pages/Builder";
import DownloadHistory from "@/pages/DownloadHistory";
import Projects from "@/pages/Projects";
import Tutorial from "@/pages/Tutorial";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Project } from "./backend.d";

const queryClient = new QueryClient();

function AppShell() {
  const { loginStatus, identity, clear, isInitializing } =
    useInternetIdentity();
  const [page, setPage] = useState<Page>("builder");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (loginStatus !== "success" || !identity) return <LoginCard />;

  const principal = identity.getPrincipal().toString();
  const shortPrincipal = `${principal.slice(0, 5)}...${principal.slice(-3)}`;

  function handleNavigate(p: Page) {
    setPage(p);
    if (p === "builder") setEditProject(null);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentPage={page}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
            <h1 className="font-display font-semibold text-sm hidden sm:block">
              {page === "builder"
                ? editProject
                  ? `Editing: ${editProject.appName}`
                  : "New Android App"
                : page === "projects"
                  ? "My Projects"
                  : page === "history"
                    ? "Download History"
                    : "Tutorial"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span>{shortPrincipal}</span>
            </div>
            <Button
              data-ocid="auth.logout_button"
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={page + (editProject?.id ?? "")}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {page === "builder" && (
                  <Builder
                    editProject={editProject}
                    onSaved={() => setEditProject(null)}
                  />
                )}
                {page === "projects" && (
                  <Projects
                    onEdit={(p) => {
                      setEditProject(p);
                      setPage("builder");
                    }}
                    onNew={() => {
                      setEditProject(null);
                      setPage("builder");
                    }}
                  />
                )}
                {page === "history" && <DownloadHistory />}
                {page === "tutorial" && <Tutorial />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <TutorialDialog />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
