"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import {
  FormModal,
  FormModalBody,
  FormModalFooter,
  FormModalHeader,
} from "@/components/ui/form-modal";
import {
  downloadClientImportTemplate,
  isClientImportFileName,
  parseClientImportFile,
  type ClientImportParseResult,
} from "@/lib/client-import";
import { createClient, type ApiClient } from "@/lib/clients-api";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onImported?: (clients: ApiClient[]) => void;
};

export function ImportClientsModal({ open, onClose, onImported }: Props) {
  const { showToast } = useToast();
  const titleId = useId();

  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ClientImportParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFileName(null);
    setParseResult(null);
    setParseError(null);
    setBusy(false);
  }, [open]);

  const handleClose = useCallback(() => {
    if (busy) return;
    onClose();
  }, [busy, onClose]);

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    setParseResult(null);

    if (!isClientImportFileName(file.name)) {
      setParseError("Please choose a .csv or .xlsx file.");
      return;
    }

    try {
      const result = await parseClientImportFile(file);
      if (result.rows.length === 0) {
        setParseError("The file is empty or has no data rows.");
        return;
      }
      setFileName(file.name);
      setParseResult(result);
    } catch {
      setParseError("Could not read that file. Try another CSV or Excel export.");
    }
  }, []);

  async function handleImport() {
    if (!parseResult?.validRows.length || busy) return;

    setBusy(true);
    const imported: ApiClient[] = [];
    let failed = 0;

    for (const row of parseResult.validRows) {
      try {
        const saved = await createClient(row);
        imported.push(saved);
      } catch {
        failed += 1;
      }
    }

    setBusy(false);

    if (imported.length === 0) {
      showToast("Import failed. No clients were added.", "error");
      return;
    }

    onImported?.(imported);

    const skipped = parseResult.errorCount + failed;
    if (skipped > 0) {
      showToast(
        `Imported ${imported.length} client${imported.length === 1 ? "" : "s"}. Skipped ${skipped} row${skipped === 1 ? "" : "s"}.`,
        "success",
      );
    } else {
      showToast(
        `Imported ${imported.length} client${imported.length === 1 ? "" : "s"}.`,
        "success",
      );
    }

    onClose();
  }

  const previewRows = parseResult?.rows.slice(0, 8) ?? [];
  const validCount = parseResult?.validRows.length ?? 0;
  const invalidCount = parseResult?.errorCount ?? 0;

  return (
    <FormModal open={open} onClose={handleClose} busy={busy} maxWidth="lg" titleId={titleId}>
      <FormModalHeader
        icon={FileUp}
        title="Import clients"
        description="Upload a CSV or Excel (.xlsx) file with name, email, contact, and location columns."
        titleId={titleId}
      />

      <FormModalBody className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Use the template or export from your spreadsheet with matching headers.
          </p>
          <button
            type="button"
            onClick={downloadClientImportTemplate}
            disabled={busy}
            className="text-sm font-semibold text-brand underline-offset-2 hover:underline disabled:opacity-50 dark:text-brand-on-dark"
          >
            Download template
          </button>
        </div>

        <label
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition",
            busy
              ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900"
              : "border-zinc-200/90 bg-brand-soft/40 hover:border-brand/40 hover:bg-brand-soft/70 dark:border-zinc-700 dark:bg-brand/10 dark:hover:border-brand/35 dark:hover:bg-brand/15",
          )}
        >
          <input
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-zinc-900/5 dark:bg-zinc-950 dark:ring-white/10">
            <FileUp className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {fileName ? fileName : "Drop a CSV or Excel file here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Required columns: name, contact, location. Email is optional.
          </p>
        </label>

        {parseError ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{parseError}</span>
          </div>
        ) : null}

        {parseResult ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                {validCount} ready to import
              </span>
              {invalidCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                  {invalidCount} row{invalidCount === 1 ? "" : "s"} skipped
                </span>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Row</th>
                    <th className="px-3 py-2.5 font-semibold">Name</th>
                    <th className="px-3 py-2.5 font-semibold">Email</th>
                    <th className="px-3 py-2.5 font-semibold">Contact</th>
                    <th className="px-3 py-2.5 font-semibold">Location</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className="border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="px-3 py-2.5 tabular-nums text-zinc-500">{row.rowNumber}</td>
                      <td className="px-3 py-2.5">{row.name || "—"}</td>
                      <td className="px-3 py-2.5">{row.email || "—"}</td>
                      <td className="px-3 py-2.5">{row.contact || "—"}</td>
                      <td className="px-3 py-2.5">{row.location || "—"}</td>
                      <td className="px-3 py-2.5">
                        {row.errors.length === 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-300">Ready</span>
                        ) : (
                          <span className="text-amber-800 dark:text-amber-200">
                            {row.errors.join(" ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parseResult.rows.length > previewRows.length ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing first {previewRows.length} of {parseResult.rows.length} rows.
              </p>
            ) : null}
          </div>
        ) : null}
      </FormModalBody>

      <FormModalFooter
        onCancel={handleClose}
        onSubmit={() => void handleImport()}
        submitLabel="Import clients"
        busyLabel="Importing…"
        submitDisabled={!parseResult?.validRows.length}
        busy={busy}
      />
    </FormModal>
  );
}
