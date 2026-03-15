import { cn } from "@/lib/utils";
import {
  BookOpen,
  Download,
  FolderOpen,
  Hammer,
  Menu,
  Smartphone,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export type Page = "builder" | "projects" | "history" | "tutorial";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems: { id: Page; icon: React.ElementType; label: string }[] = [
  { id: "builder", icon: Hammer, label: "Builder" },
  { id: "projects", icon: FolderOpen, label: "My Projects" },
  { id: "history", icon: Download, label: "Download History" },
  { id: "tutorial", icon: BookOpen, label: "Tutorial" },
];

function SidebarContent({
  currentPage,
  onNavigate,
  onClose,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm leading-tight">
            Web2App
          </div>
          <div className="text-xs opacity-50">Builder</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="opacity-50 hover:opacity-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.link`}
            onClick={() => {
              onNavigate(id);
              onClose?.();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentPage === id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-xs opacity-40">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-70"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      data-ocid="nav.menu.button"
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-accent transition-colors"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

export default function Sidebar({
  currentPage,
  onNavigate,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0">
        <SidebarContent currentPage={currentPage} onNavigate={onNavigate} />
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 h-screen w-64 z-50 md:hidden"
            >
              <SidebarContent
                currentPage={currentPage}
                onNavigate={onNavigate}
                onClose={onMobileClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
