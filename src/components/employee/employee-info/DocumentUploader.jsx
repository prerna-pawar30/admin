import React, { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { CheckCircle2, Download, FileText, Trash2, Upload, XCircle } from "lucide-react";
import { EmployeeProfileService } from "../../../backend/ApiService";
import { ALLOWED_DOCUMENT_ACCEPT, DOCUMENT_STATUS_STYLE, DOCUMENT_TYPES, labelFor } from "../../../constants/EmployeeConstants";
import { validateDocumentUpload } from "../../../validators/EmployeeValidator";
import { formatDateKey, formatIstDateTime, todayIstKey } from "../../../utils/IstTime";
import { Button, SelectInput, TextInput } from "../../ui/FormField";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../ui/StateBlock";

const errorText = (error, fallback) => error?.response?.data?.message || fallback;
const formatSize = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

/**
 * Upload and list employee documents. employeeId = null means "my own documents".
 * Files go to private storage; downloads open a short-lived link from the server.
 *
 * @param {{ employeeId: string | null, canVerify?: boolean }} props
 */
export default function DocumentUploader({ employeeId = null, canVerify = false }) {
  const [state, setState] = useState({ items: [], loading: true, error: null });
  const [form, setForm] = useState({ documentType: "", expiryDate: "", file: null });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const today = todayIstKey();

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const response = await EmployeeProfileService.listDocuments(employeeId, { limit: 100 });
      setState({ items: response.data || [], loading: false, error: null });
    } catch (error) {
      setState({ items: [], loading: false, error: errorText(error, "Could not load documents") });
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (event) => {
    event.preventDefault();
    let payload;
    try {
      payload = validateDocumentUpload(form);
      setErrors({});
    } catch (validation) {
      setErrors(validation.validationErrors || {});
      return;
    }
    setUploading(true);
    try {
      await EmployeeProfileService.uploadDocument(employeeId, payload);
      setForm({ documentType: "", expiryDate: "", file: null });
      if (fileInput.current) fileInput.current.value = "";
      load();
    } catch (error) {
      setErrors({ file: errorText(error, "Upload failed") });
    } finally {
      setUploading(false);
    }
  };

  const download = async (document) => {
    try {
      const response = await EmployeeProfileService.getDocumentDownload(document.documentId);
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      Swal.fire("Could not open", errorText(error, "Please try again"), "error");
    }
  };

  const verify = async (document, status) => {
    let rejectionReason;
    if (status === "REJECTED") {
      const result = await Swal.fire({
        title: "Reject document",
        input: "text",
        inputLabel: "Reason (shown to the employee)",
        showCancelButton: true,
        inputValidator: (value) => ((value || "").trim().length < 3 ? "Give a reason" : undefined),
      });
      if (!result.isConfirmed) return;
      rejectionReason = result.value.trim();
    }
    try {
      await EmployeeProfileService.verifyDocument(document.documentId, { status, ...(rejectionReason ? { rejectionReason } : {}) });
      load();
    } catch (error) {
      Swal.fire("Could not update", errorText(error, "Please try again"), "error");
    }
  };

  const remove = async (document) => {
    const confirm = await Swal.fire({ title: `Delete ${labelFor(DOCUMENT_TYPES, document.documentType)}?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444" });
    if (!confirm.isConfirmed) return;
    try {
      await EmployeeProfileService.deleteDocument(document.documentId);
      load();
    } catch (error) {
      Swal.fire("Could not delete", errorText(error, "Please try again"), "error");
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={upload} className="grid gap-3 rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 p-4 md:grid-cols-4" noValidate>
        <SelectInput
          id="document-type"
          label="Document type"
          required
          placeholder="Choose..."
          options={DOCUMENT_TYPES}
          value={form.documentType}
          error={errors.documentType}
          onChange={(event) => setForm({ ...form, documentType: event.target.value })}
        />
        <div className="md:col-span-2">
          <label htmlFor="document-file" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            File (PDF, JPG, PNG · max 5 MB)<span className="ml-0.5 text-[#E68736]">*</span>
          </label>
          <input
            id="document-file"
            ref={fileInput}
            type="file"
            accept={ALLOWED_DOCUMENT_ACCEPT}
            onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })}
            className="mt-1.5 block w-full rounded-xl border-2 border-orange-100 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-1 file:text-xs file:font-bold file:text-orange-700"
          />
          {errors.file && <p className="ml-1 mt-1 text-[11px] font-semibold text-red-500">{errors.file}</p>}
        </div>
        <TextInput id="document-expiry" type="date" label="Expiry (optional)" value={form.expiryDate} error={errors.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} />
        <div className="md:col-span-4">
          <Button type="submit" disabled={uploading}>
            <Upload size={14} /> {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </form>

      {state.loading ? (
        <LoadingBlock text="Loading documents" />
      ) : state.error ? (
        <ErrorBlock message={state.error} onRetry={load} />
      ) : !state.items.length ? (
        <EmptyBlock title="No documents uploaded" />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {state.items.map((document) => (
            <li key={document.documentId} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <FileText size={18} className="mt-0.5 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">
                    {labelFor(DOCUMENT_TYPES, document.documentType)}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${DOCUMENT_STATUS_STYLE[document.status]}`}>{document.status}</span>
                    {document.expiryDate && document.expiryDate < today && <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">EXPIRED</span>}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {document.originalName} · {formatSize(document.sizeBytes)} · {formatIstDateTime(document.createdAt)}
                    {document.expiryDate && ` · expires ${formatDateKey(document.expiryDate)}`}
                  </p>
                  {document.status === "REJECTED" && document.rejectionReason && <p className="text-[11px] font-semibold text-red-600">Rejected: {document.rejectionReason}</p>}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" aria-label="Download" onClick={() => download(document)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                  <Download size={15} />
                </button>
                {canVerify && document.status !== "VERIFIED" && (
                  <button type="button" aria-label="Verify" onClick={() => verify(document, "VERIFIED")} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50">
                    <CheckCircle2 size={15} />
                  </button>
                )}
                {canVerify && document.status !== "REJECTED" && (
                  <button type="button" aria-label="Reject" onClick={() => verify(document, "REJECTED")} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50">
                    <XCircle size={15} />
                  </button>
                )}
                {(canVerify || document.status !== "VERIFIED") && (
                  <button type="button" aria-label="Delete" onClick={() => remove(document)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
