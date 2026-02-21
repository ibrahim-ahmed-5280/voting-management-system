import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function BulkImportVoters() {
  const [file, setFile] = useState(null);
  const [elections, setElections] = useState([]);
  const [assignedElections, setAssignedElections] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/api/elections").then((res) => setElections(res.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }
    if (!assignedElections.length) {
      toast.error("Please select at least one election");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("assignedElections", assignedElections.join(","));
    setLoading(true);
    try {
      const { data } = await api.post("/api/voter/bulk", fd);
      setReport(data.report);
      toast.success("Import completed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap space-y-4">
      <h1 className="text-2xl font-extrabold">Bulk Import Voters</h1>
      <form onSubmit={submit} className="glass space-y-4 rounded-xl p-5">
        <a className="btn border border-slate-300" href="/api/voter/template/download">
          Download Template
        </a>
        <p className="text-sm text-slate-500">Template columns: <strong>name, email, phone</strong></p>
        <div>
          <label className="field-label">Assign Election(s)</label>
          <select
            className="input min-h-28"
            multiple
            value={assignedElections}
            onChange={(e) => setAssignedElections(Array.from(e.target.selectedOptions).map((o) => o.value))}
          >
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.name} ({election.status})
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center">
          <label className="field-label">Excel File</label>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <p className="mt-2 text-sm text-slate-500">Drop or select an Excel file.</p>
        </div>
        <button className="btn-secondary" disabled={loading} type="submit">
          {loading ? "Uploading..." : "Start Import"}
        </button>
      </form>

      {report && (
        <div className="glass rounded-xl p-4">
          <h2 className="text-lg font-bold">Import Report</h2>
          <p>Inserted: {report.inserted}</p>
          <p>Updated (existing voters assigned): {report.updated || 0}</p>
          <p>Skipped: {report.skipped}</p>
          <div className="mt-2 space-y-1 text-sm">
            {(report.errors || []).map((err, idx) => (
              <p key={`${err.row}-${idx}`} className="text-brand-primary">
                Row {err.row}: {err.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
