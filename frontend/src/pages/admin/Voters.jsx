import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaDownload,
  FaFileCsv,
  FaFileImport,
  FaSave,
  FaTrashAlt,
  FaUpload,
  FaUserPlus
} from "react-icons/fa";
import api from "../../api/client";

export default function Voters() {
  const [tab, setTab] = useState("single");
  const [voters, setVoters] = useState([]);
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState("");
  const [electionFilter, setElectionFilter] = useState("all");
  const [single, setSingle] = useState({ idno: "", name: "", email: "", phone: "", assignedElections: [] });
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkAssignedElections, setBulkAssignedElections] = useState([]);

  const load = async () => {
    const [vRes, eRes] = await Promise.all([api.get("/api/voter"), api.get("/api/elections")]);
    setVoters(vRes.data);
    setElections(eRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return voters.filter((v) => {
      const matchesSearch = [v.idno, v.name, v.email].join(" ").toLowerCase().includes(s);
      if (!matchesSearch) return false;
      if (electionFilter === "all") return true;
      return (v.assignedElections || []).some((election) => election._id === electionFilter);
    });
  }, [voters, search, electionFilter]);

  const submitSingle = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/voter", single);
      toast.success("Voter created");
      setSingle({ idno: "", name: "", email: "", phone: "", assignedElections: [] });
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create voter");
    }
  };

  const submitBulk = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error("Please select an Excel file");
      return;
    }
    if (!bulkAssignedElections.length) {
      toast.error("Please select at least one election");
      return;
    }
    const fd = new FormData();
    fd.append("file", bulkFile);
    fd.append("assignedElections", bulkAssignedElections.join(","));
    try {
      const { data } = await api.post("/api/voter/bulk", fd);
      toast.success(`Inserted ${data.report.inserted}, updated ${data.report.updated || 0}`);
      setBulkFile(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk import failed");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete voter?")) return;
    await api.delete(`/api/voter/${id}`);
    toast.success("Deleted");
    load();
  };

  const exportCSV = () => {
    const header = "ID No,Name,Email,Phone\n";
    const rows = voters.map((v) => `${v.idno},${v.name},${v.email},${v.phone}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "voters.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">Voters Management</h1>

      <div className="flex gap-2">
          <button className={tab === "single" ? "btn-primary" : "btn border border-slate-300"} onClick={() => setTab("single")}>
            <FaUserPlus />
            Single Insert
          </button>
          <button className={tab === "bulk" ? "btn-secondary" : "btn border border-slate-300"} onClick={() => setTab("bulk")}>
            <FaFileImport />
            Bulk Import
          </button>
      </div>

      {tab === "single" ? (
        <form onSubmit={submitSingle} className="glass grid gap-3 rounded-xl p-4 md:grid-cols-2">
          <div>
            <label className="field-label">ID No</label>
            <input className="input" placeholder="ID No" required value={single.idno} onChange={(e) => setSingle({ ...single, idno: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Name</label>
            <input className="input" placeholder="Name" required value={single.name} onChange={(e) => setSingle({ ...single, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="input" type="email" placeholder="Email" required value={single.email} onChange={(e) => setSingle({ ...single, email: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input className="input" placeholder="Phone" required value={single.phone} onChange={(e) => setSingle({ ...single, phone: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Assign Election</label>
            <select
              className="input"
              value={single.assignedElections[0] || ""}
              onChange={(e) =>
                setSingle({ ...single, assignedElections: e.target.value ? [e.target.value] : [] })
              }
            >
              <option value="">Assign election</option>
              {elections.map((election) => (
                <option key={election._id} value={election._id}>
                  {election.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary" type="submit">
              <FaSave />
              Save Voter
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitBulk} className="glass space-y-3 rounded-xl p-4">
          <a className="btn border border-slate-300" href="/api/voter/template/download">
            <FaDownload />
            Download Template
          </a>
          <p className="text-sm text-slate-500">Template columns: <strong>idno, name, email, phone</strong></p>
          <div>
            <label className="field-label">Assign Election</label>
            <select
              className="input"
              value={bulkAssignedElections[0] || ""}
              onChange={(e) =>
                setBulkAssignedElections(e.target.value ? [e.target.value] : [])
              }
            >
              <option value="">Select election</option>
              {elections.map((election) => (
                <option key={election._id} value={election._id}>
                  {election.name} ({election.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Excel File</label>
            <input className="input" type="file" accept=".xlsx,.xls" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex justify-end">
            <button className="btn-secondary" type="submit">
              <FaUpload />
              Import Excel
            </button>
          </div>
        </form>
      )}

      <section className="glass rounded-xl p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <input className="input max-w-md" placeholder="Search voters..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input max-w-xs" value={electionFilter} onChange={(e) => setElectionFilter(e.target.value)}>
            <option value="all">All Elections</option>
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.name} ({election.status})
              </option>
            ))}
          </select>
          <button className="btn border border-slate-300" onClick={exportCSV}>
            <FaFileCsv />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th>ID No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Elections</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((voter) => (
                <tr key={voter._id} className="border-t border-slate-200">
                  <td className="py-2 font-mono">{voter.idno}</td>
                  <td>{voter.name}</td>
                  <td>{voter.email}</td>
                  <td>{voter.phone}</td>
                  <td>{(voter.assignedElections || []).map((e) => e.name).join(", ") || "-"}</td>
                  <td>
                    <button className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline" onClick={() => onDelete(voter._id)}>
                      <FaTrashAlt />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
