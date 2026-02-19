import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaPlus, FaTable, FaThLarge, FaTrashAlt } from "react-icons/fa";
import api from "../../api/client";
import ElectionCard from "../../components/Cards/ElectionCard";
import { formatDateRange } from "../../utils/formatters";

const DATE_TIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" && DATE_TIME_LOCAL_PATTERN.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
};

const toIsoValue = (value) => {
  if (!value || !DATE_TIME_LOCAL_PATTERN.test(value)) return "";
  const date = new Date(`${value}:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
};

const initialForm = {
  name: "",
  startDate: "",
  endDate: "",
  description: "",
  photo: null
};

export default function Elections() {
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("cards");

  const load = async () => {
    const { data } = await api.get("/api/elections");
    setElections(data);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return elections.filter((election) => {
      const matchesSearch =
        !term ||
        [election.name, election.description, election.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesStatus = statusFilter === "all" ? true : election.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [elections, search, statusFilter]);

  const reset = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const normalizedStartDate = toIsoValue(form.startDate);
    const normalizedEndDate = toIsoValue(form.endDate);
    if (!normalizedStartDate || !normalizedEndDate) {
      toast.error("Please enter valid start and end date/time");
      setSaving(false);
      return;
    }
    if (new Date(normalizedStartDate) >= new Date(normalizedEndDate)) {
      toast.error("End date must be after start date");
      setSaving(false);
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("startDate", normalizedStartDate);
    fd.append("endDate", normalizedEndDate);
    fd.append("description", form.description);
    if (form.photo) fd.append("photo", form.photo);

    try {
      if (editId) {
        await api.put(`/api/elections/${editId}`, fd);
        toast.success("Election updated");
      } else {
        await api.post("/api/elections", fd);
        toast.success("Election created");
      }
      reset();
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save election");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (election) => {
    setEditId(election._id);
    setForm({
      name: election.name,
      startDate: toDateTimeLocalValue(election.startDate),
      endDate: toDateTimeLocalValue(election.endDate),
      description: election.description,
      photo: null
    });
  };

  const onDelete = async (election) => {
    if (!window.confirm(`Delete ${election.name}?`)) return;
    await api.delete(`/api/elections/${election._id}`);
    toast.success("Election deleted");
    load();
  };

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">Elections Management</h1>

      <form onSubmit={submit} className="glass grid gap-3 rounded-xl p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-bold">{editId ? "Edit Election" : "Add Election"}</h2>
        <div>
          <label className="field-label">Election Name</label>
          <input className="input" placeholder="Election name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Photo</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} />
        </div>
        <div>
          <label className="field-label">Start Date & Time</label>
          <input className="input" type="datetime-local" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div>
          <label className="field-label">End Date & Time</label>
          <input className="input" type="datetime-local" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="field-label">Description</label>
          <textarea className="input" rows={3} placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? null : editId ? <FaEdit /> : <FaPlus />}
            {saving ? "Saving..." : editId ? "Update Election" : "Create Election"}
          </button>
          {editId && (
            <button type="button" className="btn border border-slate-300" onClick={reset}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <input
              className="input max-w-md"
              placeholder="Search elections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Elections</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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
            {filtered.map((election) => (
              <ElectionCard key={election._id} election={election} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {!filtered.length && <p className="text-sm text-slate-500">No elections found.</p>}
          </div>
        ) : (
          <section className="glass rounded-xl p-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-2">Election</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Date Range</th>
                    <th className="pb-2">Votes</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((election) => (
                    <tr key={election._id} className="border-t border-slate-200">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={election.photo || "https://via.placeholder.com/40x40?text=Photo"}
                            alt={election.name}
                            className="h-9 w-9 rounded object-cover"
                          />
                          <span className="font-semibold">{election.name}</span>
                        </div>
                      </td>
                      <td className="py-2 capitalize">{election.status}</td>
                      <td className="py-2">{formatDateRange(election.startDate, election.endDate)}</td>
                      <td className="py-2">{election.totalVotes ?? 0}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline"
                            onClick={() => onEdit(election)}
                          >
                            <FaEdit />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                            onClick={() => onDelete(election)}
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
                        No elections found.
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
