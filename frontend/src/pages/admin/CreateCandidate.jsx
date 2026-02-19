import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function CreateCandidate() {
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({ name: "", election: "", description: "", photo: null });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/elections").then((res) => setElections(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    try {
      await api.post("/api/candidates", fd);
      toast.success("Candidate created");
      navigate("/admin/candidates");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create candidate");
    }
  };

  return (
    <div className="page-wrap">
      <form onSubmit={submit} className="glass mx-auto grid max-w-2xl gap-3 rounded-xl p-6">
        <h1 className="text-2xl font-extrabold">Create Candidate</h1>
        <div>
          <label className="field-label">Candidate Name</label>
          <input className="input" required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
        <div>
          <label className="field-label">Photo</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea className="input" rows={4} required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn-primary w-fit" type="submit">Create Candidate</button>
      </form>
    </div>
  );
}

