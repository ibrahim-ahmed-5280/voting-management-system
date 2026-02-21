import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function CreateVoter() {
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", assignedElections: [] });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/elections").then((res) => setElections(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/voter", form);
      toast.success("Voter created");
      navigate("/admin/voters");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create voter");
    }
  };

  return (
    <div className="page-wrap">
      <form onSubmit={submit} className="glass mx-auto grid max-w-3xl gap-3 rounded-xl p-6">
        <h1 className="text-2xl font-extrabold">Create Voter</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label">Name</label>
            <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input className="input" placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Assign Election(s)</label>
          <select
            className="input"
            multiple
            value={form.assignedElections}
            onChange={(e) =>
              setForm({
                ...form,
                assignedElections: Array.from(e.target.selectedOptions).map((o) => o.value)
              })
            }
          >
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-fit" type="submit">Create Voter</button>
      </form>
    </div>
  );
}

