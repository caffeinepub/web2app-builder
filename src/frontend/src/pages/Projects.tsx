import { generateAndroidProject } from "@/androidProjectGenerator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useAddDownloadRecord,
  useDeleteProject,
  useListMyProjects,
} from "@/hooks/useQueries";
import {
  Download,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Project } from "../backend.d";

export default function Projects({
  onEdit,
  onNew,
}: { onEdit: (p: Project) => void; onNew: () => void }) {
  const { data: projects, isLoading } = useListMyProjects();
  const deleteProject = useDeleteProject();
  const addDownloadRecord = useAddDownloadRecord();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteProject.mutateAsync(deleteId);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleDownload(p: Project) {
    setDownloadingId(p.id);
    try {
      await generateAndroidProject({
        appName: p.appName,
        packageName: p.packageName,
        websiteUrl: p.websiteUrl,
        splashColor: p.splashColor,
        features: p.features,
        outputFormat: p.outputFormat,
        minSdk: Number(p.minSdk),
      });
      await addDownloadRecord.mutateAsync({
        projectId: p.id,
        format: p.outputFormat,
      });
      toast.success("Downloaded!");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloadingId(null);
    }
  }

  if (isLoading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Projects</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {projects?.length ?? 0} project{projects?.length !== 1 ? "s" : ""}{" "}
            saved
          </p>
        </div>
        <Button data-ocid="projects.primary_button" onClick={onNew}>
          <Plus className="w-4 h-4 mr-1" /> New Project
        </Button>
      </div>

      {!projects?.length ? (
        <div
          data-ocid="projects.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-display font-semibold text-lg mb-1">
            No projects yet
          </h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-xs">
            Create your first Android app from any website in under 2 minutes.
          </p>
          <Button onClick={onNew}>
            <Plus className="w-4 h-4 mr-1" /> Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              data-ocid={`projects.item.${idx + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="h-full hover:shadow-card transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold truncate">
                        {project.appName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {project.websiteUrl}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {project.outputFormat.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {project.packageName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      Number(project.createdAt) / 1_000_000,
                    ).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      data-ocid={`projects.edit_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onEdit(project)}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      data-ocid={`projects.download_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      disabled={downloadingId === project.id}
                      onClick={() => handleDownload(project)}
                    >
                      {downloadingId === project.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      data-ocid={`projects.delete_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteId(project.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="projects.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The project will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="projects.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="projects.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
