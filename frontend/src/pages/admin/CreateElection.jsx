import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

const DATE_TIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const toIsoValue = (value) => {
  if (!value || !DATE_TIME_LOCAL_PATTERN.test(value)) return "";
  const date = new Date(`${value}:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
};

export default function CreateElection() {
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    photo: null
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
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
      if (form.name) fd.append("name", form.name);
      if (form.description) fd.append("description", form.description);
      if (form.photo) fd.append("photo", form.photo);
      fd.append("startDate", normalizedStartDate);
      fd.append("endDate", normalizedEndDate);
      await api.post("/api/elections", fd);
      toast.success("Election created");
      navigate("/admin/elections");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create election");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrap">
      <form onSubmit={submit} className="glass mx-auto grid max-w-3xl gap-3 rounded-xl p-6">
        <h1 className="text-2xl font-extrabold">Create Election</h1>
        <div>
          <label className="field-label">Election Name</label>
          <input className="input" required placeholder="Election name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Photo</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} />
        </div>
        {form.photo && <img src={URL.createObjectURL(form.photo)} alt="preview" className="h-32 w-56 rounded-lg object-cover" />}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label">Start Date & Time</label>
            <input className="input" required type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="field-label">End Date & Time</label>
            <input className="input" required type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea className="input" rows={4} required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn-primary w-fit" disabled={saving} type="submit">
          {saving ? "Creating..." : "Create Election"}
        </button>
      </form>
    </div>
  );
}

