"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { Download } from "lucide-react";

export function ExportCSV() {
  const { toast } = useToast();

  async function handleExport() {
    try {
      const data = await fetch("/api/jobs?limit=1000").then((r) => r.json());
      if (!data.jobs?.length) {
        toast("No jobs to export", "error");
        return;
      }

      const columns = [
        "Company",
        "Position",
        "Position Type",
        "Status",
        "Applied Date",
        "Interview Date",
        "Tags",
        "URL",
        "Notes",
      ];
      const rows = data.jobs.map((j: any) => [
        `"${j.company}"`,
        `"${j.position}"`,
        j.positionType,
        j.status,
        new Date(j.appliedDate).toLocaleDateString(),
        j.interview?.date
          ? new Date(j.interview.date).toLocaleDateString()
          : "",
        (j.tags || []).join("; "),
        j.url || "",
        `"${(j.notes || "").replace(/"/g, '""')}"`,
      ]);

      const csv = [
        columns.join(","),
        ...rows.map((r: string[]) => r.join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HireFlow_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Exported successfully");
    } catch {
      toast("Export failed", "error");
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
