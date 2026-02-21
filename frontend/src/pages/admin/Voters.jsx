import { useEffect, useMemo, useRef, useState } from "react";
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
import { ConfirmModal } from "../../components/Modal";

export default function Voters() {
  const [tab, setTab] = useState("single");
  const [voters, setVoters] = useState([]);
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState("");
  const [electionFilter, setElectionFilter] = useState("all");
  const [single, setSingle] = useState({ name: "", email: "", phone: "", assignedElections: [] });
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkAssignedElections, setBulkAssignedElections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmAction, setConfirmAction] = useState({ type: null, target: null });
  const [deleting, setDeleting] = useState(false);
  const selectAllRef = useRef(null);

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
      const matchesSearch = [v.name, v.email].join(" ").toLowerCase().includes(s);
      if (!matchesSearch) return false;
      if (electionFilter === "all") return true;
      return (v.assignedElections || []).some((election) => election._id === electionFilter);
    });
  }, [voters, search, electionFilter]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filteredIds = useMemo(() => filtered.map((voter) => voter._id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIdSet.has(id));
  const someFilteredSelected = filteredIds.some((id) => selectedIdSet.has(id));

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someFilteredSelected && !allFilteredSelected;
  }, [someFilteredSelected, allFilteredSelected]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => voters.some((voter) => voter._id === id)));
  }, [voters]);

  const submitSingle = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/voter", single);
      toast.success("Voter created");
      setSingle({ name: "", email: "", phone: "", assignedElections: [] });
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

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAllFiltered = () => {
    if (!filteredIds.length) return;
    const filteredSet = new Set(filteredIds);

    setSelectedIds((prev) => {
      const hasAll = filteredIds.every((id) => prev.includes(id));
      if (hasAll) {
        return prev.filter((id) => !filteredSet.has(id));
      }

      const merged = new Set(prev);
      filteredIds.forEach((id) => merged.add(id));
      return Array.from(merged);
    });
  };

  const onDelete = (voter) => {
    setConfirmAction({ type: "single", target: voter });
  };

  const onDeleteSelected = () => {
    if (!selectedIds.length) return;
    setConfirmAction({ type: "selected", target: null });
  };

  const onDeleteAll = () => {
    if (!voters.length) return;
    setConfirmAction({ type: "all", target: null });
  };

  const confirmDelete = async () => {
    if (!confirmAction.type) return;

    let ids = [];
    if (confirmAction.type === "single" && confirmAction.target?._id) {
      ids = [confirmAction.target._id];
    } else if (confirmAction.type === "selected") {
      ids = [...selectedIds];
    } else if (confirmAction.type === "all") {
      ids = voters.map((voter) => voter._id);
    }

    if (!ids.length) {
      setConfirmAction({ type: null, target: null });
      return;
    }

    setDeleting(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => api.delete(`/api/voter/${id}`)));
      const deletedCount = results.filter((result) => result.status === "fulfilled").length;
      const failedCount = results.length - deletedCount;

      if (deletedCount) {
        toast.success(
          deletedCount === 1 ? "Voter deleted" : `${deletedCount} voters deleted`
        );
      }
      if (failedCount) {
        toast.error(`${failedCount} delete request(s) failed`);
      }

      if (confirmAction.type === "all") {
        setSelectedIds([]);
      } else {
        const removedSet = new Set(ids);
        setSelectedIds((prev) => prev.filter((id) => !removedSet.has(id)));
      }

      setConfirmAction({ type: null, target: null });
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete voter");
    } finally {
      setDeleting(false);
    }
  };

  const exportCSV = () => {
    const header = "Name,Email,Phone\n";
    const rows = voters.map((v) => `${v.name},${v.email},${v.phone}`).join("\n");
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
          <div>
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
          <p className="text-sm text-slate-500">Template columns: <strong>name, email, phone</strong></p>
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
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn border border-slate-300" onClick={exportCSV} type="button">
              <FaFileCsv />
              Export CSV
            </button>
            <button
              className="btn border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              onClick={onDeleteSelected}
              type="button"
              disabled={!selectedIds.length}
            >
              <FaTrashAlt />
              Delete Selected ({selectedIds.length})
            </button>
            <button
              className="btn bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onDeleteAll}
              type="button"
              disabled={!voters.length}
            >
              <FaTrashAlt />
              Delete All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="w-10">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="h-4 w-4 accent-brand-primary"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    aria-label="Select all visible voters"
                  />
                </th>
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
                  <td className="py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand-primary"
                      checked={selectedIdSet.has(voter._id)}
                      onChange={() => toggleSelectOne(voter._id)}
                      aria-label={`Select ${voter.name}`}
                    />
                  </td>
                  <td className="py-2">{voter.name}</td>
                  <td>{voter.email}</td>
                  <td>{voter.phone}</td>
                  <td>{(voter.assignedElections || []).map((e) => e.name).join(", ") || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline"
                      onClick={() => onDelete(voter)}
                    >
                      <FaTrashAlt />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No voters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmModal
        open={Boolean(confirmAction.type)}
        onClose={() => setConfirmAction({ type: null, target: null })}
        onConfirm={confirmDelete}
        loading={deleting}
        title={
          confirmAction.type === "selected"
            ? "Delete Selected Voters"
            : confirmAction.type === "all"
            ? "Delete All Voters"
            : "Delete Voter"
        }
        message={
          confirmAction.type === "selected"
            ? `Are you sure you want to delete ${selectedIds.length} selected voter(s)? This action cannot be undone.`
            : confirmAction.type === "all"
            ? `Are you sure you want to delete all ${voters.length} voter(s)? This action cannot be undone.`
            : confirmAction.target
            ? `Are you sure you want to delete "${confirmAction.target.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this voter?"
        }
        confirmText={
          confirmAction.type === "selected"
            ? "Delete Selected"
            : confirmAction.type === "all"
            ? "Delete All"
            : "Delete Voter"
        }
      />
    </div>
  );
}
