import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useListDownloadHistory, useListMyProjects } from "@/hooks/useQueries";
import { Download } from "lucide-react";

export default function DownloadHistory() {
  const { data: history, isLoading } = useListDownloadHistory();
  const { data: projects } = useListMyProjects();
  const projectMap = Object.fromEntries((projects ?? []).map((p) => [p.id, p]));

  if (isLoading)
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Download History</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          All your generated Android projects
        </p>
      </div>
      {!history?.length ? (
        <div
          data-ocid="history.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Download className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-display font-semibold text-lg mb-1">
            No downloads yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Generated projects will appear here after you build them.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table data-ocid="history.table">
            <TableHeader>
              <TableRow>
                <TableHead>App Name</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Package</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record, idx) => {
                const project = projectMap[record.projectId];
                return (
                  <TableRow
                    key={record.id}
                    data-ocid={`history.row.${idx + 1}`}
                  >
                    <TableCell className="font-medium">
                      {project?.appName ?? "Unknown App"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {record.format.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {project?.packageName ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(
                        Number(record.timestamp) / 1_000_000,
                      ).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
