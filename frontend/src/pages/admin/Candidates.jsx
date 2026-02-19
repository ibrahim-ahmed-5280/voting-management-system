import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaPlus, FaTable, FaThLarge, FaTrashAlt } from "react-icons/fa";
import api from "../../api/client";
import CandidateCard from "../../components/Cards/CandidateCard";

const empty = { name: "", election: "", description: "", photo: null };

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("cards");

  const load = async () => {
    const [cand, elect] = await Promise.all([api.get("/api/candidates"), api.get("/api/elections")]);
    setCandidates(cand.data);
    setElections(elect.data);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return candidates;

    return candidates.filter((candidate) =>
      [candidate.name, candidate.description, candidate.election?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [candidates, search]);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("election", form.election);
    fd.append("description", form.description);
    if (form.photo) fd.append("photo", form.photo);

    try {
      if (editId) {
        await api.put(`/api/candidates/${editId}`, fd);
        toast.success("Candidate updated");
      } else {
        await api.post("/api/candidates", fd);
        toast.success("Candidate created");
      }
      setForm(empty);
      setEditId(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save candidate");
    }
  };

  const onEdit = (candidate) => {
    setEditId(candidate._id);
    setForm({
      name: candidate.name,
      election: candidate.election?._id || "",
      description: candidate.description,
      photo: null
    });
  };

  const onDelete = async (candidate) => {
    if (!window.confirm(`Delete ${candidate.name}?`)) return;
    await api.delete(`/api/candidates/${candidate._id}`);
    toast.success("Candidate deleted");
    load();
  };

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">Candidates Management</h1>

      <form onSubmit={submit} className="glass grid gap-3 rounded-xl p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-bold">{editId ? "Edit Candidate" : "Add Candidate"}</h2>
        <div>
          <label className="field-label">Candidate Name</label>
          <input className="input" required placeholder="Candidate name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Election</label>
          <select className="input" required value={form.election} onChange={(e) => setForm({ ...form, election: e.target.value })}>
            <option value="">Select election</option>
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="field-label">Photo</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} />
        </div>
        <div className="md:col-span-2">
          <label className="field-label">Description</label>
          <textarea className="input" rows={3} required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <button className="btn-primary" type="submit">
            {editId ? <FaEdit /> : <FaPlus />}
            {editId ? "Update Candidate" : "Create Candidate"}
          </button>
          {editId && (
            <button type="button" className="btn border border-slate-300" onClick={() => { setEditId(null); setForm(empty); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            className="input max-w-md"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold transition ${
                viewMode === "cards"
                  ? "text-brand-secondary underline decoration-2 underline-offset-4"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
              onClick={() => setViewMode("cards")}
            >
              <FaThLarge />
              Cards
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold transition ${
                viewMode === "table"
                  ? "text-brand-secondary underline decoration-2 underline-offset-4"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
              onClick={() => setViewMode("table")}
            >
              <FaTable />
              Table
            </button>
          </div>
        </div>

        {viewMode === "cards" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((candidate) => (
              <CandidateCard key={candidate._id} candidate={candidate} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {!filtered.length && <p className="text-sm text-slate-500">No candidates found.</p>}
          </div>
        ) : (
          <section className="glass rounded-xl p-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-2">Candidate</th>
                    <th className="pb-2">Election</th>
                    <th className="pb-2">Votes</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((candidate) => (
                    <tr key={candidate._id} className="border-t border-slate-200">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={candidate.photo || "https://via.placeholder.com/40x40?text=Photo"}
                            alt={candidate.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <span className="font-semibold">{candidate.name}</span>
                        </div>
                      </td>
                      <td className="py-2">{candidate.election?.name || "-"}</td>
                      <td className="py-2">{candidate.votes ?? 0}</td>
                      <td className="py-2">{candidate.description || "-"}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline"
                            onClick={() => onEdit(candidate)}
                          >
                            <FaEdit />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                            onClick={() => onDelete(candidate)}
                          >
                            <FaTrashAlt />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

