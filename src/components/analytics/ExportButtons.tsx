"use client";

import { useState }              from "react";
import { FileDown, FileText }    from "lucide-react";
import { Button }                from "@/components/ui/button";
import { toast }                 from "sonner";
import { generateAnalyticsPDF }  from "@/lib/export/pdf-generator";
import { exportAnalyticsCSV }    from "@/lib/export/csv-generator";
import type { AnalyticsSummary } from "@/types";
import { formatDate }            from "@/lib/utils";

interface Props {
  summary:   AnalyticsSummary | null;
  startDate: string;
  endDate:   string;
}

export function ExportButtons({ summary, startDate, endDate }: Props) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePDF = async () => {
    if (!summary) return;
    setPdfLoading(true);
    try {
      generateAnalyticsPDF(summary, {
        start: formatDate(startDate),
        end:   formatDate(endDate),
      });
      toast.success("PDF report downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCSV = () => {
    if (!summary) return;
    try {
      exportAnalyticsCSV(summary);
      toast.success("CSV data exported");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleCSV} disabled={!summary}>
        <FileDown className="h-3.5 w-3.5" /> Export CSV
      </Button>
      <Button size="sm" className="h-8 text-xs gap-1.5 bg-slate-900 hover:bg-slate-800"
        onClick={handlePDF} disabled={!summary || pdfLoading}>
        <FileText className="h-3.5 w-3.5" />
        {pdfLoading ? "Generating..." : "Export PDF"}
      </Button>
    </div>
  );
}
