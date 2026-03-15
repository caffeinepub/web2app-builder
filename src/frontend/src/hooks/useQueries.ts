import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Features } from "../backend.d";

export function useListMyProjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListDownloadHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["downloadHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyDownloadHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      appName: string;
      websiteUrl: string;
      packageName: string;
      splashColor: string;
      outputFormat: string;
      minSdk: bigint;
      features: Features;
      iconKey: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProject(
        args.appName,
        args.websiteUrl,
        args.packageName,
        args.splashColor,
        args.outputFormat,
        args.minSdk,
        args.features,
        args.iconKey,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      appName: string;
      websiteUrl: string;
      packageName: string;
      splashColor: string;
      outputFormat: string;
      minSdk: bigint;
      features: Features;
      iconKey: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProject(
        args.id,
        args.appName,
        args.websiteUrl,
        args.packageName,
        args.splashColor,
        args.outputFormat,
        args.minSdk,
        args.features,
        args.iconKey,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProject(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useAddDownloadRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      format,
    }: { projectId: string; format: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addDownloadRecord(projectId, format);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["downloadHistory"] }),
  });
}
